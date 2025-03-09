import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

function RecipeCard() {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);

  useEffect(() => {
    axios
      .get(`http://localhost:3000/recipes/${id}`)
      .then((response) => {
        console.log("Fetched data:", response.data);
        setRecipe(response.data);
      })
      .catch((error) => {
        console.error("Error fetching recipe details", error);
      });
  }, [id]);

  if (!recipe) {
    return <p className="text-center my-5">Loading...</p>;
  }

  return (
    <section className="py-5">
      <div className="container">
        <div className="row gx-5">
          {/* Recipe Image */}
          <aside className="col-lg-6">
            <div className="border rounded-4 mb-3 d-flex justify-content-center">
              <img
                style={{ maxWidth: "100%", maxHeight: "100vh", margin: "auto" }}
                className="rounded-4 fit"
                src={recipe.image || "placeholder.jpg"}
                alt={recipe.name || "Recipe"}
              />
            </div>
          </aside>

          {/* Recipe Details */}
          <main className="col-lg-6">
            <div className="ps-lg-3">
              <h4 className="title text-dark">{recipe.name}</h4>
              <p><strong>Cooking Time:</strong> {recipe.timeToCook || "N/A"}</p>

              {/* Ingredients */}
              <h5>Ingredients:</h5>
              <ul>
                {recipe.ingredients && recipe.ingredients.length > 0 ? (
                  recipe.ingredients.map((ingredient, index) => (
                    <li key={index}>{ingredient}</li>
                  ))
                ) : (
                  <li>No ingredients available.</li>
                )}
              </ul>

              {/* Steps */}
              <h5>Steps:</h5>
              <ol>
                {recipe.steps && recipe.steps.length > 0 ? (
                  recipe.steps.map((step, index) => <li key={index}>{step}</li>)
                ) : (
                  <li>No steps provided.</li>
                )}
              </ol>

              <hr />
            </div>
          </main>
        </div>
      </div>
    </section>
  );
}

export default RecipeCard;
