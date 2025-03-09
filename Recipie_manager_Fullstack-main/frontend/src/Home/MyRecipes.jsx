import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const MyRecipes = () => {
  const [myRecipes, setMyRecipes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyRecipes = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found");

        const response = await axios.get("http://localhost:3000/my-recipes", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setMyRecipes(response.data);
      } catch (error) {
        console.error("Error fetching user recipes:", error);
      }
    };

    fetchMyRecipes();
  }, []);

  const handleDeleteRecipe = async (recipeId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      await axios.delete(`http://localhost:3000/recipes/${recipeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Update the state to remove the deleted recipe from the list
      setMyRecipes(myRecipes.filter((recipe) => recipe._id !== recipeId));
    } catch (error) {
      console.error("Error deleting recipe:", error);
    }
  };

  return (
    <div>
      <h2 className="text-center mt-4">Your Recipes</h2>
      <div className="row mx-4" style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
        {myRecipes.length === 0 ? (
          <h4 className="text-center">You haven't created any recipes yet.</h4>
        ) : (
          myRecipes.map((recipe) => (
            <div className="col-12 col-sm-6 col-md-4 col-lg-3" key={recipe._id}>
              <div className="card" style={{ width: '280px', height: "400px" }}>
                <img 
                  src={recipe.image ? recipe.image: "default-recipe.jpg"} 
                  className="card-img-top" 
                  alt="Recipe" 
                  style={{ height: '200px', objectFit: "cover" }}
                  onClick={() => navigate(`/recipe/${recipe._id}`)}
                />
                <div className="card-body">
                  <h5 className="card-title">{recipe.name}</h5>
                  <p className="card-text"><strong>{recipe.timeToCook}</strong></p>
                  <div className="d-flex justify-content-between">
                    <Link to={`/update_recipe/${recipe._id}`} className="btn btn-primary">Update</Link>
                    <button className="btn btn-danger" onClick={() => handleDeleteRecipe(recipe._id)}>Delete</button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )
        }
        <br /> 
        
        <div style={{ width: "100%", textAlign: "center", marginTop: "20px" }}>
        <Link to="/create_recipe" className="btn btn-success btn-lg" style={{ display: "inline-block" }}>
            + Create
        </Link>
        </div>
      
      </div>
    </div>
  );
};

export default MyRecipes;
