// import React,{useEffect}from 'react';
// import { useNavigate } from 'react-router-dom';
// import './card.css';

// export default function Card({setTitle}) {
//    const navigate = useNavigate();

//   useEffect(() => {
//         setTitle("DashBoard");
//       });

//   const navigateAdmin=()=>
//   {
//     navigate('/user')    
//   }
//   const navigateLobby=()=>
//     {
//       navigate('/lobby')    
//     }

//     const navigateGate=()=>
//       {
//         navigate('/gate')    
//       }
//   return (
//     <div className='card-container'>
//     <div className="dashboard-grid">
//         <div className="info-card" style={{ borderLeftColor:'#007bff'}}>
//           <div className="info-content">
//             <h3 className="info-title">Admin</h3>
//             <p className="info-text">Manage users, roles, and system settings.</p>
//             <button className="info-button" style={{ backgroundColor:'#007bff' }} onClick={navigateAdmin}>Go to Admin</button>
//           </div>
//         </div>
//         <div className="info-card" style={{ borderLeftColor:'rgb(16, 110, 3)'}}>
//           <div className="info-content">
//             <h3 className="info-title">Employee</h3>
//             <p className="info-text">Manage appointments, visitors, and maintenance in the Lobby of the Organization.</p>
//             <button className="info-button" style={{ backgroundColor:'green' }} onClick={navigateLobby}>Go to Lobby</button>
//           </div>
//         </div>
//         <div className="info-card" style={{ borderLeftColor:'Red'}}>
//           <div className="info-content">
//             <h3 className="info-title">Reception Or Gate Entry</h3>
//             <p className="info-text">Manage appointments, visitors, and maintenance in the Entrance Gate of the Organization.</p>
//             <button className="info-button" style={{ backgroundColor:'rgb(209, 11, 11)' }} onClick={navigateGate}>Go to Gate</button>
//           </div>
//         </div>

//     </div>
//     </div>
//   );
// }

import React, { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

export default function Card({ setTitle }) {
  useEffect(() => {
    setTitle("Dashboard Access Panels");
    AOS.init({ duration: 1000 });
  }, [setTitle]);

  // Inline style objects
  const wrapperStyle = {
    fontFamily: 'Poppins, sans-serif',
    backgroundColor: '#0e0e23',
    color: '#ffffff',
    margin: 0,
    padding: '2rem',
    minHeight: '100vh'
  };


  const timelineStyle = {
    position: 'relative',
    margin: '0 auto',
    padding: '2rem 0',
    maxWidth: '900px'
  };

  const timelineLineStyle = {
    content: '""',
    position: 'absolute',
    width: '4px',
    background: '#36b4ff',
    top: 0,
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)'
  };

  const timelineItemStyle = {
    padding: '2rem 0',
    position: 'relative'
  };

  const dotStyle = {
    content: '""',
    position: 'absolute',
    top: '25px',
    width: '20px',
    height: '20px',
    backgroundColor: '#36b4ff',
    border: '3px solid #fff',
    borderRadius: '50%',
    zIndex: 1,
    left: '50%',
    transform: 'translateX(-50%)'
  };

  const containerStyle = (isLeft) => ({
    padding: '1.5rem 2rem',
    position: 'relative',
    backgroundColor: '#1e1e2f',
    borderRadius: '10px',
    width: '45%',
    boxShadow: '0 0 15px rgba(0, 0, 0, 0.5)',
    left: isLeft ? 0 : '55%'
  });

  const dateStyle = {
    fontSize: '0.8rem',
    color: '#aaa',
    marginBottom: '0.5rem'
  };

  const titleStyle = {
    fontSize: '1.2rem',
    color: '#90e0ef',
    margin: '0 0 0.5rem 0'
  };

  const textStyle = {
    fontSize: '0.95rem',
    color: '#ccc'
  };

  const buttonStyle = (bg) => ({
    marginTop: '1rem',
    padding: '0.5rem 1rem',
    border: 'none',
    borderRadius: '5px',
    color: '#fff',
    fontWeight: 'bold',
    cursor: 'pointer',
    backgroundColor: bg
  });

  return (
    <div style={wrapperStyle}>
      <div style={timelineStyle}>
        <div style={timelineLineStyle}></div>

        {/* Admin */}
        <div style={timelineItemStyle} data-aos="fade-right">
          <div style={dotStyle}></div>
          <div style={containerStyle(true)}>
            <div style={dateStyle}>Admin Panel</div>
            <h3 style={titleStyle}>Admin</h3>
            <p style={textStyle}>Manage users, roles, and system settings.</p>
            <button style={buttonStyle('#007bff')}>Go to Admin</button>
          </div>
        </div>

        {/* Employee */}
        <div style={timelineItemStyle} data-aos="fade-left">
          <div style={dotStyle}></div>
          <div style={containerStyle(false)}>
            <div style={dateStyle}>Lobby Panel</div>
            <h3 style={titleStyle}>Employee</h3>
            <p style={textStyle}>Manage appointments, visitors, and maintenance in the Lobby of the Organization.</p>
            <button style={buttonStyle('green')}>Go to Lobby</button>
          </div>
        </div>

        {/* Gate */}
        <div style={timelineItemStyle} data-aos="fade-right">
          <div style={dotStyle}></div>
          <div style={containerStyle(true)}>
            <div style={dateStyle}>Gate Panel</div>
            <h3 style={titleStyle}>Reception Or Gate Entry</h3>
            <p style={textStyle}>Manage appointments, visitors, and maintenance in the Entrance Gate of the Organization.</p>
            <button style={buttonStyle('rgb(209, 11, 11)')}>Go to Gate</button>
          </div>
        </div>
      </div>
    </div>
  );
}



