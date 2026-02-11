import hide from '../assets/hide.png';
import show from '../assets/show.png';
import {Link, useNavigate} from 'react-router-dom';
import React, { useState } from 'react';
import Swal from "sweetalert2";

function Register() {

  const navigate = useNavigate();
  const [isPassVisible, setPassVisible] = useState(false);
  const [isConPassVisible, setConPassVisible] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    
    const data = {
      name: event.target.name.value,
      email: event.target.email.value,
      username: event.target.username.value,
      password: event.target.password.value,
      conpassword: event.target.conpassword.value
    };

    const res = await fetch('https://swiftfilelink-e.vercel.app/auth/register', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (!res.ok) {
      Swal.fire({
        icon: "error",
        title: "Registration Failed",
        text: result.message,
        confirmButtonText: "OK",
      });
      return;
    } else {
         Swal.fire({
          icon: "success",
          title: "Success",
          text: result.message,
          confirmButtonText: "OK",
        }).then((result) => {
          if (result.isConfirmed) {
            navigate("/verification");
          }
        });
      localStorage.setItem("userId", result.userId);
      event.target.reset();
    } 
  }

  return (
    <div>
      <center>
      <div className="co">
            <h1>Register</h1><br/><br/>
            <form onSubmit={handleSubmit}>
                <input type="text" className="input" placeholder="Name" name="name"/><br/>
                <input type="text" className="input" placeholder="Email" name="email"/><br/>
                <input type="text" className="input" placeholder="Username" name="username"/><br/>
                <div className="password">
                    <input type={isPassVisible ? "text" : "password"} className="input" placeholder="Password" id="password" name="password"/><br/>
                    <img src={isPassVisible ? show : hide} onClick={() => setPassVisible(!isPassVisible)} style={{ cursor: "pointer" }} className="pass-icon" id="pass-icon" alt="Toggle password visibility"/>
                </div>
                <div className="password">
                    <input type={isConPassVisible ? "text" : "password"} className="input" placeholder="Confirm Password" id="conpassword" name="conpassword"/><br/>
                    <img src={isConPassVisible ? show : hide} onClick={() => setConPassVisible(!isConPassVisible)} style={{ cursor: "pointer" }} className="pass-icon" id="conpass-icon" alt="Toggle password visibility"/>
                </div>
                <button type="submit">Sign Up</button><br/>
                <Link to="/login">Already have an account? <b>Login</b></Link><br/>
            </form>
        </div>
        </center>
    </div>
  );
}

export default Register;