import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Decode from './pages/Decode';
import Encode from './pages/Encode';
import StepByStep from './pages/StepByStep';
import Incremental from './pages/Incremental';
import './styles/styles.css';
function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/decode" element={<Decode />} />
        <Route path="/encode" element={<Encode />} />
        <Route path="/step-by-step" element={<StepByStep />} />
        <Route path="/incremental" element={<Incremental />} />
      </Routes>
    </Router>
  );
}
export default App;