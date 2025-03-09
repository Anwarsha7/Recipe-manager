import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate, useParams } from 'react-router-dom';

function Update() {
  const [formdata, setFormData] = useState({
    name: "",
    ingredients: "",
    timeToCook: "",
    steps: "",
    image: null,
  });

  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/recipes/${id}`);
        const { name, ingredients, timeToCook, steps, image } = response.data;
        setFormData({
          name,
          ingredients: ingredients.join(', '), // Store as a comma-separated string
          timeToCook,
          steps: steps.join('. '), // Store as a full-stop-separated string
          image: image || null, 
        });
      } catch (error) {
        console.error("Error fetching recipe data:", error);
      }
    };
    fetchRecipe();
  }, [id]);

  const handleInput = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formdata,
      [name]: value,
    });
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formdata,
      image: e.target.files[0],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token'); 
    if (!token) {
        toast.error("You need to log in first", {
            position: toast.POSITION.TOP_CENTER,
            theme: 'colored',
        });
        setTimeout(() => navigate("/login"), 2000);
        return;
    }

    const formattedData = new FormData();
    formattedData.append("name", formdata.name);
    
    // Fix: Send ingredients as a comma-separated string (same as Create.jsx)
    formattedData.append("ingredients", formdata.ingredients);

    formattedData.append("timeToCook", formdata.timeToCook);
    
    // Fix: Send steps as a full-stop-separated string (same as Create.jsx)
    formattedData.append("steps", formdata.steps);

    if (formdata.image) {
        formattedData.append("image", formdata.image);
    }

    try {
        const response = await axios.put(`http://localhost:3000/recipes/${id}`, formattedData, {
            headers: { 
                "Authorization": `Bearer ${token}`, 
                "Content-Type": "multipart/form-data"
            },
        });

        if (response.status === 200) {
            toast.success("Recipe Updated Successfully", {
                position: toast.POSITION.TOP_CENTER,
                theme: 'colored',
            });
            setTimeout(() => navigate("/"), 2000);
        }
    } catch (error) {
        console.error("Error updating recipe:", error);
        toast.error("Error, data is not valid", {
            position: toast.POSITION.TOP_CENTER,
            theme: 'colored',
        });
    }
  };

  return (
    <>
      <h1><center><u>Update Recipe</u></center></h1>
      <div className='container'>
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <div className='form-group'>
            <label>Recipe Name:</label>
            <input type='text' name='name' className='form-control' value={formdata.name} onChange={handleInput} required />
          </div>
          <br />
          <div className='form-group'>
            <label>Ingredients (comma-separated):</label>
            <input type='text' name='ingredients' className='form-control' value={formdata.ingredients} onChange={handleInput} required />
          </div>
          <br />
          <div className='form-group'>
            <label>Time to Cook:</label>
            <input type='text' name='timeToCook' className='form-control' value={formdata.timeToCook} onChange={handleInput} required />
          </div>
          <br />
          <div className='form-group'>
            <label>Steps (separate by full stops '.')</label>
            <textarea name='steps' className='form-control' value={formdata.steps} onChange={handleInput} required></textarea>
          </div>
          <br />
          <div className='form-group'>
            <label>Upload New Recipe Image (optional):</label>
            <input type='file' name='image' className='form-control' onChange={handleFileChange} />
          </div>
          <br />
          <button type='submit' className='btn btn-primary'>Update</button>
        </form>
      </div>
      <ToastContainer />
    </>
  );
}

export default Update;
