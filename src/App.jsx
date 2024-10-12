// src/App.jsx
import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Homepage from './pages/Homepage';
import AESEncode from './pages/AESEncode';
import AESDecode from './pages/AESDecode';
import AESStepByStep from './pages/AESStepByStep';
import './App.css';
import logo from './assets/AES_Logo.jpg';

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <Router>
      <div className="App">
        {/* Navbar */}
        <nav className={`navbar ${isMenuOpen ? 'active' : ''}`}>
          <div className="menu-icon" onClick={toggleMenu}>
            &#9776; {/* Hamburger icon */}
          </div>
          <ul>
            <li>
              <Link to="/" onClick={toggleMenu}>
                <img src={logo} alt="Logo" className="navbar-logo" />
              </Link>
            </li>
            <li><Link to="/" onClick={toggleMenu}>Home</Link></li>
            <li><Link to="/encode" onClick={toggleMenu}>AES Encode</Link></li>
            <li><Link to="/decode" onClick={toggleMenu}>AES Decode</Link></li>
            <li><Link to="/step-by-step" onClick={toggleMenu}>AES Step-by-Step</Link></li>
          </ul>
        </nav>

        {/* Routes */}
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/encode" element={<AESEncode />} />
          <Route path="/decode" element={<AESDecode />} />
          <Route path="/step-by-step" element={<AESStepByStep />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
