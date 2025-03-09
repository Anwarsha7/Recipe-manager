const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Recipe = require('./models/Recipe');
const bcrypt = require('bcryptjs');
const cors = require('cors')
const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken');
const authMiddleware = require('./authMiddleware');
const Favorite = require('./models/Favorite');

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

dotenv.config();

const app = express();
const PORT = 3000;
app.use(express.json());

const corsOptions = {
    origin: process.env.FRONTEND_URL, // Replace with your frontend URL
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Middleware for extracting token
app.use((req, res, next) => {
    console.log("Authorization Header:", req.headers.authorization);
    next();
});


// Check database connection
mongoose.connect(process.env.MONGO_URL).then(
    () => console.log("DB successfully connected..."),
).catch((err) => console.log(err));

// Home page API
app.get('/', (req, res) => {
    res.send("<h1>Welcome to HTML</h1>");
});

// Configure multer for file uploads
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'recipe-images', // Folder name in Cloudinary
        format: async (req, file) => 'png', // Convert all images to PNG
        public_id: (req, file) => Date.now() + '-' + file.originalname.split('.')[0]
    }
});

const upload = multer({ storage });



// Registration API
app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, email, password: hashedPassword });
        await user.save();
        res.json({ message: "User Registered..." });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Server Error" });
    }
});

// Login API
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ message: "Invalid credentials..." });
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ message: "Login Successful", token ,user });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Server Error" });
    }
});

// Recipe APIs


// Create Recipe (Protected route)
app.post('/recipes', authMiddleware, upload.single('image'), async (req, res) => {
    try {
        const { name, ingredients, timeToCook, steps } = req.body;
        const imagePath = req.file ? req.file.path : null;

        if (!name || !ingredients || !timeToCook || !steps || !imagePath) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const recipe = new Recipe({
            name,
            ingredients: ingredients.split(',').map(item => item.trim()),
            timeToCook,
            steps: steps.split('.').map(item => item.trim()).filter(Boolean),
            image: imagePath,
            user: req.user.id, // Associate recipe with user
        });

        await recipe.save();
        res.json({ message: "Recipe created successfully", recipe });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
});


// Get all recipes (with image URLs)
app.get('/recipes', async (req, res) => {
    try {
        const recipes = await Recipe.find();
        res.json(recipes);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Server Error" });
    }
});

// Get a single recipe by ID
app.get('/recipes/:id', async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);
        if (!recipe) return res.status(404).json({ message: "Recipe not found" });
        res.json(recipe);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Server Error" });
    }
});

// Update recipe
app.put('/recipes/:id', authMiddleware, upload.single('image'), async (req, res) => {
    try {
        console.log("req.user:", req.user); // Debugging line

        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized - No user found" });
        }

        const { name, timeToCook } = req.body;
        const ingredients = req.body.ingredients.split(',').map(item => item.trim());
        const steps = req.body.steps.split('.').map(item => item.trim()).filter(Boolean);

        const existingRecipe = await Recipe.findById(req.params.id);
        if (!existingRecipe) return res.status(404).json({ message: "Recipe not found" });

        // Ensure only the creator can update
        if (existingRecipe.user.toString() !== req.user.id) {
            return res.status(403).json({ message: "Unauthorized to update this recipe" });
        }

        const imagePath = req.file ? req.file.path : existingRecipe.image;

        const updateData = { name, ingredients, timeToCook, steps, image: imagePath };
        const updatedRecipe = await Recipe.findByIdAndUpdate(req.params.id, updateData, { new: true });

        res.json({ message: "Recipe updated successfully", recipe: updatedRecipe });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Server Error" });
    }
});


// Delete Recipe (Protected route)
app.delete('/recipes/:id', authMiddleware, async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);
        if (!recipe) return res.status(404).json({ message: "Recipe not found" });

        // Ensure only the creator can delete
        if (recipe.user.toString() !== req.user.id) {
            return res.status(403).json({ message: "Unauthorized to delete this recipe" });
        }

        // Delete all favorites associated with this recipe
        await Favorite.deleteMany({ recipeId: recipe._id });

        await recipe.deleteOne();
        res.json({ message: "Recipe deleted successfully and removed from favorites" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Server Error" });
    }
});

// Toggle Favorite Recipe (Protected route)
app.post('/favorites/toggle', authMiddleware, async (req, res) => {
    try {
        const { recipeId } = req.body;
        const userId = req.user.id; // Extract from authMiddleware

        if (!recipeId) return res.status(400).json({ message: "Recipe ID is required" });

        const existingFavorite = await Favorite.findOne({ userId, recipeId });

        if (existingFavorite) {
            await Favorite.findOneAndDelete({ userId, recipeId });
            return res.json({ message: "Removed from favorites" });
        }

        const favorite = new Favorite({ userId, recipeId });
        await favorite.save();
        res.json({ message: "Added to favorites", favorite });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
});

// Get all favorite recipes of a user
app.get('/favorites', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id; // Extract from authMiddleware

        const favorites = await Favorite.find({ userId }).populate('recipeId');

        res.json(favorites);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
});

// Delete a favorite recipe (Protected route)
app.delete('/favorites/:recipeId', authMiddleware, async (req, res) => {
    try {
        const { recipeId } = req.params;
        const userId = req.user.id; // Extract from authMiddleware

        if (!recipeId) return res.status(400).json({ message: "Recipe ID is required" });

        const existingFavorite = await Favorite.findOne({ userId, recipeId });

        if (!existingFavorite) {
            return res.status(404).json({ message: "Favorite not found" });
        }

        await Favorite.findOneAndDelete({ userId, recipeId });

        res.json({ message: "Removed from favorites" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
});

// Get all recipes created by the logged-in user (Protected route)
app.get('/my-recipes', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id; // Extract from authMiddleware
        const recipes = await Recipe.find({ user: userId });

        res.json(recipes);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
});





// Serve images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
