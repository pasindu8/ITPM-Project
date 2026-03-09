import {Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import bgImage from '../assets/6903344.jpg';

function Login() {

  const navigate = useNavigate();

  async function handleSubmit(event) {

    event.preventDefault();

    const data = {
      username: event.target.username.value,
      password: event.target.password.value
    };

    const res = await fetch('http://localhost:5000/auth/login', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (!res.ok) {
      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: result.message,
        confirmButtonText: "OK",
      });
      return;
    } 
    localStorage.setItem("token", result.token);
    localStorage.setItem("userId", result.userId);
    localStorage.setItem("type", result.type);
    event.target.reset();

    if (result.type === 'admin') {
        navigate("/AdminDashboard");
        window.location.reload();
    } else if (result.type === 'coach') {
        navigate("/CoachDashboard");
        window.location.reload();
    } else {
        navigate("/Dashboard");
        window.location.reload();
      }
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat p-4" 
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      
      <div className="w-full max-w-md p-10 rounded-[40px] bg-white/0 backdrop-blur-sm backdrop-brightness-110 border-[4px] border-white/30 shadow-[50px_50px_50px_rgba(0,0,0,0.1)] text-white">
        
        
        <div className="flex flex-col items-center mb-8">
            <h1 className="text-4xl font-bold mb-6 tracking-wide">Login</h1>
            <div className="bg-white p-4 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.4)]">
                <svg className="w-10 h-10 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col space-y-8">
          
          <div className="border-b-2 border-white/40 pb-2 flex items-center">
            <span className="mr-3">👤</span>
            <input 
              type="text" 
              className="w-full bg-transparent outline-none placeholder-white/80 text-lg" 
              placeholder="Your user name" 
              name="username"
            />
          </div>

          <div className="border-b-2 border-white/40 pb-2 flex items-center">
            <span className="mr-3">🔒</span>
            <input 
              type="password" 
              className="w-full bg-transparent outline-none placeholder-white/80 text-lg" 
              placeholder="Password" 
              name="password"
            />
          </div>

          <div className="flex justify-between items-center text-sm">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" className="accent-blue-500 w-4 h-4" />
              <span>Remember me</span>
            </label>
            <Link to="/forgotpassword" title="Forgot Password" className="italic hover:underline decoration-white/50">
                Forgot Password?
            </Link>
          </div>

          
          <button 
            type="submit" 
            className="w-full bg-white text-blue-900 font-extrabold py-4 rounded-[20px] text-xl shadow-[0_10px_20px_rgba(255,255,255,0.3)] hover:shadow-white/40 hover:-translate-y-1 transition-all duration-300 active:scale-95"
          >
            Log In
          </button>

          <div className="text-center text-sm mt-4">
            <p className="opacity-90">
              Don't have an account? 
              <Link to="/register" className="font-bold ml-1 border-b border-white hover:text-white transition-colors">Sign Up</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;