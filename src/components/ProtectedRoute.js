import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useAuth0 } from '@auth0/auth0-react';
import './ProtectedRoute.css';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0();
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setShowPopup(true);
    }
  }, [isLoading, isAuthenticated]);

  if (isLoading) {
    return <div className="loader" aria-label="Loading products"></div>;
  }

  if (!isAuthenticated) {
    return (
      <>
        {showPopup && (
          <div className="auth-popup-overlay">
            <div className="auth-popup">
              <h2>Login Required</h2>
              <p>You must be logged in to view this page.</p>
              <button onClick={() => loginWithRedirect()}>Log In</button>
            </div>
          </div>
        )}
      </>
    );
  }

  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ProtectedRoute;
