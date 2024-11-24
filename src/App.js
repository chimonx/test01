import React, { useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  Link,
  useLocation,
} from 'react-router-dom';
import PostList from './components/PostList';
import Login from './components/Login';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');

  // Updated useEffect to include security key handling
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Get the security key from the environment variable
        const securityKey = process.env.REACT_APP_SECURITY_KEY;

        // Hash the security key using the Web Crypto API and encode in Base64
        const encoder = new TextEncoder();
        const data = encoder.encode(securityKey);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashString = String.fromCharCode(...hashArray);
        const hashedKey = btoa(hashString);

        // Prepare form data
        const formData = new URLSearchParams();
        formData.append('security_key', hashedKey); // Include the hashed key

        const response = await fetch('https://login.smobu.cloud/check_session.php', {
          method: 'POST', // Changed to POST
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formData.toString(),
          credentials: 'include', // Include credentials to send cookies
        });
        const result = await response.json();
        if (result.loggedIn) {
          setIsAuthenticated(true);
          setUsername(result.username);
        } else {
          setIsAuthenticated(false);
          setUsername('');
        }
      } catch (error) {
        console.error('Error checking session:', error);
      }
    };

    checkSession();
  }, []);

  const handleLoginSuccess = (loggedInUsername) => {
    setIsAuthenticated(true);
    setUsername(loggedInUsername);
  };

  const handleLogout = async () => {
    try {
      // Get the security key from the environment variable
      const securityKey = process.env.REACT_APP_SECURITY_KEY;

      // Hash the security key using the Web Crypto API and encode in Base64
      const encoder = new TextEncoder();
      const data = encoder.encode(securityKey);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashString = String.fromCharCode(...hashArray);
      const hashedKey = btoa(hashString);

      // Prepare form data
      const formData = new URLSearchParams();
      formData.append('security_key', hashedKey); // Include the hashed key

      await fetch('https://login.smobu.cloud/logout.php', {
        method: 'POST', // Ensure method is POST
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
        credentials: 'include', // Include credentials to send cookies
      });
      setIsAuthenticated(false);
      setUsername('');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <Router>
      <MainApp
        isAuthenticated={isAuthenticated}
        username={username}
        handleLoginSuccess={handleLoginSuccess}
        handleLogout={handleLogout}
      />
    </Router>
  );
}

function MainApp({ isAuthenticated, username, handleLoginSuccess, handleLogout }) {
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === '/login') {
      document.body.classList.add('no-scroll'); // Disable scrolling on login page
    } else {
      document.body.classList.remove('no-scroll'); // Enable scrolling on other pages
    }

    return () => {
      document.body.classList.remove('no-scroll'); // Cleanup on unmount
    };
  }, [location.pathname]);

  return (
    <div>
      {/* Navbar */}
      {location.pathname !== '/login' && (
        <nav className="navbar navbar-light bg-light shadow-sm">
          <div className="container d-flex justify-content-between align-items-center">
            <Link className="navbar-brand text-dark" to="/">
              Post App
            </Link>
            <div className="d-flex">
              {isAuthenticated ? (
                <>
                  <span className="nav-link text-dark me-3">Welcome, {username}!</span>
                  <button className="btn btn-link nav-link text-danger" onClick={handleLogout}>
                    Logout
                  </button>
                </>
              ) : (
                <Link className="nav-link text-muted" to="/login">
                  Login
                </Link>
              )}
            </div>
          </div>
        </nav>
      )}

      {/* Main Content */}
      <div className="container mt-4">
        <Routes>
          <Route
            path="/login"
            element={
              isAuthenticated ? (
                <Navigate to="/" />
              ) : (
                <Login onLoginSuccess={handleLoginSuccess} />
              )
            }
          />
          <Route
            path="/"
            element={<PostList username={username} isAuthenticated={isAuthenticated} />}
          />
        </Routes>
      </div>
    </div>
  );
}

export default App;
