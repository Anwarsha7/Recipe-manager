import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const Favorite = () => {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found");

        const response = await axios.get("http://localhost:3000/favorites", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setFavorites(response.data.map(fav => fav.recipeId));
      } catch (error) {
        console.error("Error fetching favorite recipes:", error);
      }
    };

    fetchFavorites();
  }, []);

  const handleDeleteFavorite = async (recipeId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      await axios.delete(`http://localhost:3000/favorites/${recipeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Update the state to remove the deleted recipe from the list
      setFavorites(favorites.filter((item) => item._id !== recipeId));
    } catch (error) {
      console.error("Error deleting favorite recipe:", error);
    }
  };

  return (
    <div>
      <h2 className="text-center mt-4">Your Favorite Recipes</h2>
      <div className="row mx-4" style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
        {favorites.length === 0 ? (
          <h4 className="text-center">No favorites yet.</h4>
        ) : (
          favorites.map((item) => (
            <div className="col-12 col-sm-6 col-md-4 col-lg-3" key={item._id}>
              <div className="card" style={{ width: '280px', height: "400px" }}>
                <img 
                  src={item.image ? item.image: "istockphoto-520410807-612x612.jpg"} 
                  className="card-img-top" 
                  alt="Recipe" 
                  style={{ height: '200px', objectFit: "cover" }} 
                />
                <div className="card-body">
                  <h5 className="card-title">{item.name}</h5>
                  <p className="card-text"><strong>{item.timeToCook}</strong></p>
                  <div className="d-flex justify-content-between">
                    <button className="btn btn-danger" onClick={() => handleDeleteFavorite(item._id)}>Delete</button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Favorite;
