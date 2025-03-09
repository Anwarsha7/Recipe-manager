import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios'

export const Login = () => {
  const navigate = useNavigate();
  const[email,Setemail]=useState();
  const[password,Setpassword]=useState();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/login', { email, password });

      if (response.data.token) {
        localStorage.setItem('token', response.data.token); // Save token
        toast.success("Login Successful!", {
          position: toast.POSITION.TOP_CENTER,
          theme: "colored",
        });

        // Redirect to home after 2 second
        setTimeout(() => {
          navigate("/");
          window.location.reload();
        }, 2000); 
      } else {
        toast.error(response.data.message || "Invalid credentials", {
          position: toast.POSITION.TOP_CENTER,
          theme: "colored",
        });
      }
    } catch (error) {
      toast.error("Login failed. Please check your credentials.");
      console.error("Login error:", error.response?.data || error.message);
    }
  };

  



  return (
    <div style={{
      backgroundImage: "url('/food_background.jpg')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      height: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <div className='container shadow bg-light p-4' style={{ width: '30%', borderRadius: '10px' }}>
        <h2 className='text-center'>Login</h2>
        <form onSubmit={handleSubmit}>
          <div className='form-group p-3'>
            <label>Enter Email:</label>
            <input type='email' name='email' className='form-control' 
            onChange={(e) => Setemail(e.target.value)}/>
          </div>

          <div className='form-group p-3'>
            <label>Enter Password:</label>
            <input type='password' name='password' className='form-control'
            onChange={(e) => Setpassword(e.target.value)} />
          </div>

          <button type='submit' className='btn btn-success d-flex mx-auto'>Login</button>
        </form>

        <p style={{ paddingBottom: 20, paddingLeft: 50, paddingTop: 20 }}>
          <b>Don't have an account?</b> <Link to="/register">Register</Link>
        </p>
      </div>
      <ToastContainer/>
    </div>
  )
}
