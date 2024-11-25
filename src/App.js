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

// Utility function for hashing the security key
async function hashSecurityKey(securityKey) {
  const encoder = new TextEncoder();
  const data = encoder.encode(securityKey);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(hashBuffer)));
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');

  useEffect(() => {
    const checkSession = async () => {
      try {
        const securityKey = process.env.REACT_APP_SECURITY_KEY;
        const hashedKey = await hashSecurityKey(securityKey);

        const formData = new URLSearchParams();
        formData.append('security_key', hashedKey);

        const response = await fetch('https://login.smobu.cloud/check_session.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: formData.toString(),
          credentials: 'include',
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
        console.error('Error during session check:', error);
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
      const securityKey = process.env.REACT_APP_SECURITY_KEY;
      const hashedKey = await hashSecurityKey(securityKey);

      const formData = new URLSearchParams();
      formData.append('security_key', hashedKey);

      await fetch('https://login.smobu.cloud/logout.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString(),
        credentials: 'include',
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
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }

    return () => {
      document.body.classList.remove('no-scroll');
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
