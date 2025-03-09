const mongoose = require('mongoose');

const RecipeSchema = mongoose.Schema({
    name: { type: String, required: true },
    ingredients: { type: [String], required: true },
    timeToCook: { type: String, required: true },
    steps: { type: [String], required: true },  
    image: { type: String },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }  // Add user field
}, { timestamps: true }); 

module.exports = mongoose.model('Recipe', RecipeSchema);
