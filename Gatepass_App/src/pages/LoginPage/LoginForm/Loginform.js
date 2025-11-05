import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { ReactSession } from 'react-client-session';
import { Form, Button } from 'react-bootstrap';
import '../LoginForm/Loginform.css'
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';

//Images in App Folder
import photo1 from '../Images/pic1.png';
import photo2 from '../Images/pic2.avif';
import photo3 from '../Images/pic3.jpg';
import photo4 from '../Images/pic6.jpg';
import profile from '../Images/gplogo.jpg';
import { useNavigate } from 'react-router-dom';

import CustomAlert from '../../../CustomAlert';
import SignupForm from '../SignUp/signup.js';
import ForgotPassword from '../ForgotPassword/ForgotPassword.js';
import { SERVER_PORT } from '../../../constant';


function Loginform({ setIsLoggedIn }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [alerts, setAlerts] = useState([]);
  const [currentForm, setCurrentForm] = useState("login"); // "login", "signup", "forgot"
  const navigate = useNavigate();

  // Redirect to homepage on reload/refresh
  useEffect(() => {
    if (window.location.pathname !== "/") {
      navigate("/");
    }
  }, []);



  const showAlert = (type, title, message) => {
    const newAlert = { id: Date.now(), type, title, message };
    setAlerts([...alerts, newAlert]);

    setTimeout(() => {
      setAlerts((prevAlerts) => prevAlerts.filter((alert) => alert.id !== newAlert.id));
    }, 3000);
  };

  const login = async (e) => {
    e.preventDefault();
    // console.log("Login form submitted");
    // console.log("Username:", username);
    // console.log("Password:", password);

    try {
      const response = await axios.post(`${SERVER_PORT}/user_login`, {
        username,
        password,
      });

      // console.log("API Response:", response.data);

      if (response.data.success) {
        showAlert("success", "Success!", "Login Successful.");

        // Initialize ReactSession
        ReactSession.setStoreType("sessionStorage");

        // Save user details to session
        ReactSession.set("username", response.data.loginid);
        ReactSession.set("userrole", response.data.UserRole);
        // ReactSession.set("userrole", "Administrator"); // Hardcoded for testing
        sessionStorage.setItem("userId", response.data.id);
        sessionStorage.setItem("name", response.data.name);

        // Convert and store profile image if available
        if (response.data.avatar) {
          // Check if it's already a base64 string or needs conversion
          let profileImage;
          if (typeof response.data.avatar === 'string' && response.data.avatar.startsWith('data:')) {
            // Already a data URI
            profileImage = response.data.avatar;
          } else if (response.data.avatar && response.data.avatar.type === 'Buffer') {
            // Convert Buffer to base64
            const base64Image = Buffer.from(response.data.avatar.data).toString('base64');
            profileImage = `data:image/png;base64,${base64Image}`;
          } else {
            // Handle other cases or set to null
            profileImage = null;
          }

          ReactSession.set("profileimage", profileImage);
          // console.log("✅ Profile image processed and stored in session.");
        } else {
          ReactSession.set("profileimage", null);
        }

        setIsLoggedIn(true);
        navigate("/");
      } else {
        if (response.data.status === "inactive") {
          console.warn("Account inactive");
          showAlert("warning", "Account Inactive!", "Your account is not active. Please contact the administrator.");
        } else {
          console.warn("Invalid login credentials");
          showAlert("error", "Login Failed!", "Invalid login credentials.");
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      showAlert("error", "Server Error!", "Something went wrong. Please try again later.");
    }
  };


  return (
    <>
      {currentForm === "login" && (
        <div className='background'>
          <div style={{ padding: "20px" }}>
            {alerts.map((alert) => (
              <CustomAlert key={alert.id} {...alert} onClose={() => setAlerts(alerts.filter((a) => a.id !== alert.id))} />
            ))}
          </div>
          <div className='photo'>
            <img id='pic1' src={photo1} alt='pic'></img>
            <img id='pic2' src={photo2} alt='pic'></img>
            <img id='pic3' src={photo3} alt='pic'></img>
          </div>
          <div className="log-container">
            <div className="left-section">
              <img src={photo4} alt="Gateway Illustration"></img>
              <h3>Visitors Management System</h3>
            </div>
            <div className="right-section">
              <h2>Login</h2>
              <div className="log-top">
                <img src={profile} alt="User Avatar"></img>
              </div>
              <Form onSubmit={login} className="mt-3">
                <Form.Group className="log-input-group mb-3 position-relative">
                  <i className="fas fa-user position-absolute start-0 top-50 translate-middle-y ms-1 text-secondary"></i>
                  <Form.Control
                    type="text"
                    placeholder="Email"
                    name="username"
                    className="ps-4.5"
                    value={username}
                    minLength={4}
                    maxLength={25}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className="log-input-group mb-3 position-relative">
                  <i className="fas fa-lock position-absolute start-0 top-50 translate-middle-y ms-1 text-secondary"></i>
                  <Form.Control
                    type="password"
                    placeholder="Password"
                    name="password"
                    className="ps-4.5"
                    value={password}
                    minLength={4}
                    maxLength={25}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </Form.Group>

                <div className="d-flex justify-content-center gap-3 mb-3">
                  <Button id="login-btn" type="submit" className="btn btn-primary">
                    Login
                  </Button>
                  <Button
                    id="signup-btn"
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={() => setCurrentForm("signup")}
                  >
                    SignUp
                  </Button>
                </div>

                <div className="text-center">
                  <span
                    onClick={() => setCurrentForm("forgot")}
                    className="text-primary me-2"
                    style={{ cursor: "pointer", textDecoration: "underline" }}
                  >
                    Forgot Password?
                  </span>
                  |
                  <span
                    onClick={() => setCurrentForm("signup")}
                    className="text-primary ms-2"
                    style={{ cursor: "pointer", textDecoration: "underline" }}
                  >
                    Create Account
                  </span>
                </div>
              </Form>
            </div>
          </div>
        </div>
      )}

      {currentForm === "signup" && (
        <>
          <SignupForm setCurrentForm={setCurrentForm} />
        </>
      )}

      {currentForm === "forgot" && (
        <>
          <ForgotPassword setCurrentForm={setCurrentForm} />
        </>
      )}
    </>
  );
}

export default Loginform;