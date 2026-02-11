import Swal from "sweetalert2";
import {Link, useNavigate} from 'react-router-dom';

function Verification() {

    const navigate = useNavigate();

    async function handleSubmit(event) {  
        event.preventDefault();
        
        const data = {
          userId: localStorage.getItem('userId'),  
          verificationCode: event.target.verificationCode.value
        };

        const res = await fetch('https://swiftfilelink-e.vercel.app/auth/verify', {
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
            navigate("/login");
            }
        });
            
        event.target.reset();
    } 

};  
  return (
    <center>
    <div class="co">
        <h1>Email Verification</h1><br/><br/>
            
        <form onSubmit={handleSubmit}>
            
            <input type="text" class="input" placeholder="Enter OTP Code" name="verificationCode"/><br/>
            <button type="submit">Verify OTP</button><br/>
               
            <Link to="/login.php"><p><spam id="countdown"></spam> Resend OTP</p></Link>
        </form>
    </div>
    </center>
  );
}

export default Verification;