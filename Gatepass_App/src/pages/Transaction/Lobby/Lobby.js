import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Lobby = ({setTitle}) => {
 
  const navigate=useNavigate();
  
  useEffect(()=>{
    setTitle("Lobby");
  });

  const navigateAppointment=()=>
    {
      navigate('/lobby/bookappointment')    
    }
    const navigateLobby=()=>
    {
      navigate('/lobby/lobbyentry')    
    }

      
  return (
    <div className="lobby-container" style={{height: '100vh',backgroundColor:'#A9CFEF'}}>
       <div className="dashboard-grid">
              <div className="info-card" style={{ borderLeftColor:'#007bff'}}>
                <div className="info-content">
                  <h3 className="info-title">Book Appointments</h3>
                  <p className="info-text">Let's Book meetings and appointments here</p>
                  <button className="info-button" style={{ backgroundColor:'#007bff' }} onClick={navigateAppointment}>Appointments</button>
                </div>
              </div>
              <div className="info-card" style={{ borderLeftColor:'green'}}>
                <div className="info-content">
                  <h3 className="info-title">Visitors Pass</h3>
                  <p className="info-text">Here to generate a Visitor Pass to identify and verify the Visitors</p>
                  <button className="info-button" style={{ backgroundColor:'green' }} onClick={navigateLobby}>Generate a Pass</button>
                </div>
              </div>
          </div>
    </div>
  );
};

export default Lobby;