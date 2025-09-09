import React, { useState} from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './App.css';
import Loginform from './pages/LoginPage/LoginForm/Loginform.js';
import Home from './pages/HomePage/home.js';


function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  if (isLoggedIn) {
    return <Home setIsLoggedIn={setIsLoggedIn} />;
  }

  return (
    <div>
      <Loginform setIsLoggedIn={setIsLoggedIn} /> 
    </div>
  );
}

export default App;

