import { Link } from 'react-router';
import React from 'react'
import './Navbar.css';
import { useAuth0 } from '@auth0/auth0-react';
import { useState } from 'react';
import avatarImage from '../assets/login-icon.png';


function Navbar() {
  const { loginWithRedirect, logout, isAuthenticated, user } = useAuth0();
  const [showPopup, setShowPopup] = useState(false);

  const handleAvatarClick = () => {
    if (isAuthenticated) {
      setShowPopup(prev => !prev);
    } else {
      loginWithRedirect();
    }
  };

  const handleLogout = () => {
    logout({ logoutParams: { returnTo: window.location.origin } });
    setShowPopup(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-title">Inspection Dashboard</div>
      <ul className="navbar-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/products">Products</Link></li>
        <li><Link to="/faults">Faults</Link></li>
        <li><Link to="/reports">Reports</Link></li>
        <li><Link to="/upload-products">Products</Link></li>
        <li className="avatar-container">
          <img
            src={avatarImage}
            alt="avatar"
            className="dummy-avatar"
            onClick={handleAvatarClick}
          />
          {isAuthenticated && showPopup && (
            <div className="user-popup">
              <p><strong>Nick name: {user.nickname}</strong></p>
              <p>Email: {user.email}</p>
              <button onClick={handleLogout}>Log Out</button>
            </div>
          )}
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
