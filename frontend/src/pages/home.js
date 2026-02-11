import Mainlogo from '../assets/logo2.png';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div>
      <div className="home-container">
        <img src={Mainlogo} alt="Main Logo" className="main-logo" />
        <h1>Welcome to Our Application</h1>
        <p>Your gateway to seamless experience.</p>
        <div className="button-group">
          <Link to="/login" className="btn btn-primary">Login</Link>
          <Link to="/register" className="btn btn-secondary">Register</Link>
        </div>
      </div>
    </div>
  );
}

export default Home;