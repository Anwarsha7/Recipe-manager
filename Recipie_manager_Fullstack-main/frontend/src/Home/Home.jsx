import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export const Home = () => {
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchItem, setSearchItem] = useState("");
  const [favorites, setFavorites] = useState([]);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("https://recipe-manager-22sf.onrender.com/recipes/");
        setData(response.data);
      } catch (error) {
        console.error("Error fetching recipes:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchFavorites = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            const response = await axios.get("https://recipe-manager-22sf.onrender.com/favorites", {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Extract only recipe IDs
            const favoriteRecipeIds = response.data.map(fav => fav.recipeId._id);
            setFavorites(favoriteRecipeIds);
        } catch (error) {
            console.error("Error fetching favorites:", error);
        }
    };

    fetchFavorites();
}, []);


  // function to toggle the like button
  const toggleFavorite = async (recipeId) => {
    try {
        const token = localStorage.getItem("token"); 
        if (!token) throw new Error("No token found");

        const response = await axios.post("https://recipe-manager-22sf.onrender.com/favorites/toggle", 
            { recipeId }, 
            { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data.message === "Removed from favorites") {
            setFavorites(favorites.filter((id) => id !== recipeId));
        } else {
            setFavorites([...favorites, recipeId]);
        }
    } catch (error) {
        console.error("Error toggling favorite:", error);
    }
};

  

  // Filtering based on search input
  const filterData = data.filter((item) =>
    item.name.toLowerCase().includes(searchItem.toLowerCase())
  );

  // Pagination logic
  const recordPerPage = 4;
  const lastIndex = currentPage * recordPerPage;
  const firstIndex = lastIndex - recordPerPage;
  const records = filterData.slice(firstIndex, lastIndex);
  const npage = Math.ceil(filterData.length / recordPerPage);
  const numbers = [...Array(npage + 1).keys()].slice(1);

  return (
    <>
    {/* Quote on the top-left, but pushed below the navbar */}
    <span 
          style={{
            position: "absolute",  
            top: "100px",           // Adjust to avoid navbar overlap
            left: "20px",         
            fontSize: "40px",     
            fontWeight: "bold",   
            color: "#333",        
          }}
        >
         <p
          style={{
            fontSize: "30px",
            fontWeight: "bold",
            maxWidth: "50%",
            textAlign: "left",
            color: "black",
            marginLeft: "20px",
            marginTop: "0px",
            marginBottom: "30px",
          }}
        >
          “Welcome to TastyBite – your kitchen companion! Whether you're a pro or a beginner, explore thousands of recipes, easy meal plans, and simple instructions. Discover new dishes, save your favorites, and share your creations. Let’s get cooking!”
        </p>
        </span>
    {/* Image on the right */}
    <img 
          src="sandwich.jpg" 
          style={{
             display: "block",
             fontSize: "30px",
            fontWeight: "bold",
            width: "400px",
            height: "400px",
            justifyContent: "space-between",
            borderRadius: "30px",
            marginBottom: "100px",
             marginLeft: "1050px", marginTop: "10px"

           }} // Push image down too
        />

  
        {/* SVG Background */}
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 1440 320" 
          style={{ marginTop: "-170px" }}  
        >
          <path fill="#87CEEB" fillOpacity="1" d="M0,32L60,80C120,128,240,224,360,218.7C480,213,600,107,720,90.7C840,75,960,149,1080,197.3C1200,245,1320,267,1380,277.3L1440,288L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
        </svg>

          <br /><br /><br />
      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search recipes..."
        value={searchItem}
        onChange={(e) => setSearchItem(e.target.value)}
        style={{
          display: "block",
          margin: "10px auto",
          padding: "8px",
          width: "50%",
          borderRadius: "5px",
          border: "1px solid #ccc",
        }}
      />

      {/* Recipe List */}
      <div className="row mx-4" style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
      {records.length > 0 ? (
  records.map((item) => (
    <div className="col-12 col-sm-6 col-md-4 col-lg-3" key={item._id}>
      <div className="card" style={{ width: '280px', height: "350px" }}>
        <Link to={`recipe/${item._id}`}>
        <img 
          src={item.image ? item.image : "istockphoto-520410807-612x612.jpg"}
          className="card-img-top" 
          alt="Recipe" 
          style={{ height: '200px', objectFit: "cover" }} 
        />
        </Link>
        <div className="card-body">
          <h5 className="card-title">{item.name}</h5>
          <p className="card-text"><strong>{item.timeToCook}</strong></p>
          {/* <Link to={`/update_recipe/${item._id}`} className="btn btn-primary">Update</Link> */}

          {/* Favorite Icon */}
          <button 
            onClick={() => toggleFavorite(item._id)} 
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "24px",
              color: favorites.includes(item._id) ? "red" : "gray"
            }}
          >
            {favorites.includes(item._id) ? "❤️" : "🤍"}
          </button>
        </div>
      </div>
    </div>
  ))
) : (
  <div className="col-12 text-center">
    <h3>No results available</h3>
  </div>
)}

      </div>

      {/* Pagination */}
      <nav style={{ display: "flex", justifyContent: "center", marginTop: "30px" }}>
        <ul className="pagination">
          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
            <button className="page-link" onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}>
              Previous
            </button>
          </li>

          {numbers.map((n) => (
            <li className={`page-item ${currentPage === n ? 'active' : ''}`} key={n}>
              <button className="page-link" onClick={() => setCurrentPage(n)}> {n} </button>
            </li>
          ))}

          <li className={`page-item ${currentPage === npage ? 'disabled' : ''}`}>
            <button className="page-link" onClick={() => setCurrentPage((prev) => Math.min(prev + 1, npage))}>
              Next
            </button>
          </li>
        </ul>
      </nav>
    </>
  );
};
