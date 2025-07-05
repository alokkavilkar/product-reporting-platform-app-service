import './Home.css';
import inspectionImg from '../assets/inspection.jpg';
import React from 'react';

function Home() {
  
  return (
    <div className="home-container">
      <div className="home-content">
        <h1 className="home-title">Welcome to the Product Inspection System</h1>
        <p className="home-subtitle">
          Ensure quality. Track inspections. Manage faults efficiently.
        </p>
        <button className="cta-button">Get Started</button>
      </div>
      <div className="home-image">
        <img src={inspectionImg} alt="Inspection" />
      </div>
    </div>
  );
}

export default Home;
