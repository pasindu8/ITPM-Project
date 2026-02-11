import hide from '../assets/hide.png';
import show from '../assets/show.png';
import { useNavigate} from 'react-router-dom';
import React, { useState } from 'react';
import Swal from "sweetalert2";

function ForgotPassword() {

    const [isPassVisible, setPassVisible] = useState(false);
    const [isConPassVisible, setConPassVisible] = useState(false);

    const navigate = useNavigate();
    async function handleSubmit(event) {
        event.preventDefault();
        const data = {
            uname: event.target.uname.value,
          password: event.target.password.value,
          conpassword: event.target.conpassword.value
        };
        const res = await fetch('https://swiftfilelink-e.vercel.app/auth/forgot-password', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(data),
        });
        const result = await res.json();
        if (!res.ok) {
            Swal.fire({
                icon: "error",
                title: "Password Change Failed",
                text: result.message,
                confirmButtonText: "OK",
            });
            return;
        } else {
            Swal.fire({
                icon: "success",
                title: "Password Change Success",
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
         <div class="co">
            <h1>Reset Password</h1><br/><br/>
            <form onSubmit={handleSubmit}>
                <input type="text" className="input" placeholder="Username/Email" name="uname"/><br/><br/>
                <div className="password">
                    <input type={isPassVisible ? "text" : "password"} className="input" placeholder="Password" id="password" name="password"/><br/>
                    <img src={isPassVisible ? show : hide} onClick={() => setPassVisible(!isPassVisible)} style={{ cursor: "pointer" }} className="pass-icon" id="pass-icon" alt="Toggle password visibility"/>
                </div>
                <div className="password">
                    <input type={isConPassVisible ? "text" : "password"} className="input" placeholder="Confirm Password" id="conpassword" name="conpassword"/><br/>
                    <img src={isConPassVisible ? show : hide} onClick={() => setConPassVisible(!isConPassVisible)} style={{ cursor: "pointer" }} className="pass-icon" id="conpass-icon" alt="Toggle confirm password visibility"/>
                </div>
                <button type="submit">Change Password</button><br/>       
            </form>
        </div>
      </center>
    </div>
  );
}

export default ForgotPassword;