import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

export const Navbar = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    navigate('/login');
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg" 
        style={{ position: "sticky", top: "0", zIndex: "100", backgroundColor: "#000000" }}
      >
        <div className="container-fluid">
          
          <a className="navbar-brand d-flex align-items-center" href="#">
            <img 
              src="/lg.png" 
              alt="Logo" 
              width="40" 
              height="40" 
              className="d-inline-block align-top me-2"
            />
            <span style={{ color: "white", fontWeight: "bold" }}>TastyBite</span>
          </a>

          <button 
            className="navbar-toggler" 
            type="button" 
            data-bs-toggle="collapse" 
            data-bs-target="#navbarSupportedContent" 
            aria-controls="navbarSupportedContent" 
            aria-expanded="false" 
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav me-auto">
              <li className="nav-item active">
                <Link to="/" className="nav-link text-white">Home</Link>
              </li>

              <li className="nav-item active">
                <Link to="/my-recipes" className="nav-link text-white">Your Recipe</Link>
              </li>

              <li className="nav-item">
                <Link to="/favorite" className="nav-link text-white">Favourites</Link>
              </li>
            </ul>

            <div className="d-flex">
              {isAuthenticated ? (
                <button className="btn btn-danger" onClick={handleLogout}>
                  Logout
                </button>
              ) : (
                <Link to="/login" className="btn btn-primary">Login</Link>
              )}
            </div>

          </div>
        </div>
      </nav>
    </>
  );
};
