import { Home } from "./Home/Home";
import { Navbar } from "./Home/Navbar"
import { Login } from "./Login/Login"
import Register from "./Login/Register"
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Create from "./Home/Create";
import Update from "./Home/Update";
import PrivateRoute from "./Routing/PrivateRoute";
import Favorite from "./Home/Favorite";
import MyRecipes from "./Home/MyRecipes";
import RecipeCard from "./Home/RecipeCard";


function App() {
  

  return (
    <>
    
    <Router>
    <Navbar/>

        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="recipe/:id" element={<RecipeCard/>}  />
          <Route element={<PrivateRoute/>}>
            <Route path="/create_recipe" element={<Create/>} />
            <Route path="/update_recipe/:id" element={<Update/>} />
            <Route path="/favorite" element={<Favorite/>} />
            <Route path="/my-recipes" element={<MyRecipes/>}/>
          </Route>
        </Routes>
        
    </Router>
    </>
  )
}

export default App
