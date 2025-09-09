import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { ReactSession } from 'react-client-session';
import { FaBell } from 'react-icons/fa';
import { FiEdit2, FiKey, FiLogOut } from 'react-icons/fi';
import { useNavigate } from "react-router-dom";
import CustomAlert from '../../../CustomAlert';
import './Topnavbar.css';
import { Fingerprint } from 'lucide-react';
import { AnimatePresence } from "framer-motion";
import { Image } from 'react-bootstrap';
import profilePic from '../profile.png';
import { SERVER_PORT } from '../../../constant';



export default function Topnavbar({ isSidenavOpen }) {
  const [loginTime] = useState(new Date().toLocaleTimeString());
  const [logoutTime, setLogoutTime] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const profileDropdownRef = useRef(null);
  const navigate = useNavigate();
  const [isPunchedIn, setIsPunchedIn] = useState(true);
  const [isNotificationDrawerOpen, setNotificationDrawerOpen] = useState(false);
  const [isProfileDrawerOpen, setProfileDrawerOpen] = useState(false);
  const [drawerContentOpen, setDrawerContentOpen] = useState(false);
  const [userData, setUserData] = useState({});


  const username = ReactSession.get('username');
  const name = sessionStorage.getItem('name');
  const userId = sessionStorage.getItem('userId');

  useEffect(() => {
    if (username) {
      axios.get(`${SERVER_PORT}/edit_profile/${username}`)
        .then(response => {
          const user = response.data;
          setUserData(user);
          if (user.adm_users_profileimage) {
            ReactSession.set("profileimage", user.adm_users_profileimage);
          }
        })
        .catch(error => console.error("Error fetching user data:", error));
    }
  }, [username]);

  useEffect(() => {
    const checkAttendanceStatus = async () => {
      const userId = sessionStorage.getItem('userId');
      if (!userId) {
        console.log("⚠️ No userId found in session");
        return;
      }

      try {
        console.log("🔍 Checking attendance status for userId:", userId);
        const response = await axios.get(`${SERVER_PORT}/AttendanceStatus/${userId}`);
        console.log("📊 Attendance status response:", response.data);

        const { isPunchedIn: serverPunchedIn, isPunchedOut: serverPunchedOut, status } = response.data;

        // User is considered "punched in" if they have punched in but not completed their day
        const currentlyPunchedIn = serverPunchedIn && !serverPunchedOut;
        setIsPunchedIn(currentlyPunchedIn);

        console.log("🎯 Setting isPunchedIn to:", currentlyPunchedIn);

      } catch (err) {
        console.error("❌ Error checking attendance status:", err);
        // Default to not punched in on error
        setIsPunchedIn(false);
      }
    };

    checkAttendanceStatus();
  }, []);




  // Alert system
  const showAlert = (type, title, message, onConfirm) => {
    console.log(`⚠️ Showing alert - Type: ${type}, Title: ${title}`);
    const newAlert = { id: Date.now(), type, title, message, onConfirm };
    setAlerts(prev => [...prev, newAlert]);

    if (type !== "info") {
      setTimeout(() => {
        setAlerts(prev => prev.filter(alert => alert.id !== newAlert.id));
      }, 0);
    }
  };

  // Logout
  const handleLogout = () => {
    console.log("🚪 Logout initiated");
    showAlert("info", "Information", "Are you sure you want to Logout?", (isConfirmed) => {
      if (isConfirmed) {
        console.log("✅ Logout confirmed");
        window.location.reload();
        sessionStorage.clear();
        navigate("/");
      } else {
        console.log("❌ Logout canceled");
      }
    });
  };

  // Navigate to Edit Profile
  const handleeditprofile = () => {
    console.log("✏️ Navigating to edit profile");
    navigate('/editprofile');
  };

  // Navigate to Change Password
  const handlepassword = () => {
    console.log("🔒 Navigating to change password");
    navigate('/changePassword');
  };

  // Fixed Punch In/Out toggle function for Topnavbar component
  const handlePunchToggle = async () => {
    try {
      // Get session data
      const userId = sessionStorage.getItem('userId');
      const username = ReactSession.get('username') || sessionStorage.getItem('username');

      console.log("🔄 Punch toggle initiated", { userId, username, isPunchedIn });

      // Validate session
      if (!userId || !username) {
        showAlert(
          "error",
          "Session Error",
          "Your session appears to be invalid. Please logout and login again."
        );
        return;
      }

      // Show loading state (optional)
      // setIsPunchLoading(true);

      // Perform punch operation with consistent userId parameter
      if (!isPunchedIn) {
        console.log("📥 Performing punch-in...");
        const response = await axios.post(`${SERVER_PORT}/AttendancePunchIn`, {
          userId: parseInt(userId) // Ensure it's a number
        });

        console.log("✅ Punch-in successful:", response.data);
        showAlert("success", "Success", "You have successfully punched in!");

        // Update state immediately for better UX
        setIsPunchedIn(true);

        // Navigate after successful punch-in
        navigate('/attendanceadmin');

      } else {
        console.log("📤 Performing punch-out...");
        const response = await axios.post(`${SERVER_PORT}/AttendancePunchOut`, {
          userId: parseInt(userId) // Changed from loginid to userId and ensure it's a number
        });

        console.log("✅ Punch-out successful:", response.data);
        showAlert("success", "Success", "You have successfully punched out!");

        // Update state immediately for better UX
        setIsPunchedIn(false);

        // Navigate after successful punch-out
        navigate('/home');
      }

      // Verify status with server after a short delay to ensure DB is updated
      setTimeout(async () => {
        try {
          const statusRes = await axios.get(`${SERVER_PORT}/AttendanceStatus/${userId}`);
          console.log("🔍 Status verification:", statusRes.data);

          // Update state based on server response
          const serverIsPunchedIn = statusRes.data.isPunchedIn && !statusRes.data.isPunchedOut;
          setIsPunchedIn(serverIsPunchedIn);

        } catch (verifyErr) {
          console.error("⚠️ Status verification failed:", verifyErr);
          // Don't show error to user as the main operation succeeded
        }
      }, 1000);

    } catch (err) {
      console.error("❌ Punch operation failed:", err);

      // Determine specific error message
      let errorMessage = "Failed to complete punch operation. Please try again.";

      if (err.response?.status === 404) {
        errorMessage = "User not found. Please check your session and try again.";
      } else if (err.response?.status === 400) {
        errorMessage = err.response.data.message || "Invalid request. Please try again.";
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }

      showAlert("error", "Operation Failed", errorMessage);

      // Refresh status from server in case of error
      try {
        const statusRes = await axios.get(`${SERVER_PORT}/AttendanceStatus/${userId}`);
        const serverIsPunchedIn = statusRes.data.isPunchedIn && !statusRes.data.isPunchedOut;
        setIsPunchedIn(serverIsPunchedIn);
      } catch (statusErr) {
        console.error("Failed to refresh status after error:", statusErr);
      }

    } finally {
      // Hide loading state (optional)
      // setIsPunchLoading(false);
    }
  };

  useEffect(() => {
    if (isProfileDrawerOpen || isNotificationDrawerOpen) {
      setTimeout(() => setDrawerContentOpen(true), 2);
    } else {
      setDrawerContentOpen(false);
    }
  }, [isProfileDrawerOpen, isNotificationDrawerOpen]);



  return (
    <nav className={`top-navbar ${isSidenavOpen ? 'shift-right-unique' : ''}`}>
      <div className="home-container">
        <h1 className="company-name">Dowell Tech</h1>

        <div className="user-info">
          <button
            onClick={handlePunchToggle}
            className="p-3 py-2 bg-gray-900 text-white rounded font-semibold shadow hover:bg-gray-800 transition flex items-center gap-2"
          >
            <Fingerprint size={18} />
            {isPunchedIn ? 'Punch Out' : 'Punch In'}
          </button>

          {/* Notifications Drawer Trigger */}
          <div className="notification-container">
            <button
              className="notification-icon"
              onClick={() => setNotificationDrawerOpen(true)}
            >
              <FaBell />
              <span className="badge-notification">1</span>
            </button>
          </div>

          {/* Profile Drawer Trigger */}
          <div className="dropdown-container" ref={profileDropdownRef}>
            <div className="profile-container">
              <button
                onClick={() => setProfileDrawerOpen(true)}
                className="profile-dropdown-trigger"
              >
                <Image
                  src={userData.adm_users_profileimage || profilePic}
                  roundedCircle
                  alt="Admin Profile"
                  className="profile-img"
                />
              </button>
              <div className='mr-5'>
                <div className='createdby'>{username}</div>
                <div className='createdby'>Hi, {name}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Drawer Modal */}
      {isNotificationDrawerOpen && (
        <div
          className={`drawer-modal${isNotificationDrawerOpen ? ' open' : ''}`}
          onClick={() => setNotificationDrawerOpen(false)}
          style={{ backdropFilter: 'blur(3px)' }}
        >
          <div
            className={`drawer-content${drawerContentOpen ? ' open' : ''}`}
            onClick={e => e.stopPropagation()}
            style={{
              background: 'linear-gradient(135deg, #f8fafc 60%, #e0e7ff 100%)',
              boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)',
              borderTopLeftRadius: 18,
              borderBottomLeftRadius: 18,
              padding: '32px 26px',
              minHeight: '100vh',
              maxWidth: 400,
              width: '90vw',
              border: '1px solid #e0e7ff'
            }}
          >
            <div
              className="drawer-header"
              style={{
                color: '#1e293b',
                fontWeight: 700,
                fontSize: '1.25rem',
                letterSpacing: '0.5px',
                background: 'transparent',
                borderBottom: '1.5px solid #e0e7ff',
                paddingBottom: 12,
                marginBottom: 18
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FaBell style={{ color: '#6366f1', fontSize: 22 }} />
                Notifications
              </span>
              <button
                className="close-btn"
                onClick={() => setNotificationDrawerOpen(false)}
                style={{
                  fontSize: '2rem',
                  color: '#6366f1',
                  background: 'none',
                  border: 'none',
                  marginLeft: 'auto'
                }}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <ul style={{ padding: 0, margin: 0 }}>
              <li
                style={{
                  padding: '16px 0',
                  borderBottom: '1px solid #e0e7ff',
                  fontSize: '1.08rem',
                  color: '#334155',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  fontWeight: 500
                }}
              >
                <span style={{ background: '#6366f1', borderRadius: '50%', width: 8, height: 8, display: 'inline-block', marginRight: 10 }}></span>
                Welcome to the new dashboard!
              </li>
              <li
                style={{
                  padding: '16px 0',
                  borderBottom: '1px solid #e0e7ff',
                  fontSize: '1.08rem',
                  color: '#334155',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  fontWeight: 500
                }}
              >
                <span style={{ background: '#f59e42', borderRadius: '50%', width: 8, height: 8, display: 'inline-block', marginRight: 10 }}></span>
                Your profile was updated successfully.
              </li>
              <li
                style={{
                  padding: '16px 0',
                  fontSize: '1.08rem',
                  color: '#334155',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  fontWeight: 500
                }}
              >
                <span style={{ background: '#10b981', borderRadius: '50%', width: 8, height: 8, display: 'inline-block', marginRight: 10 }}></span>
                New feature: Try dark mode!
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Profile Drawer Modal */}
      {isProfileDrawerOpen && (
        <div
          className={`drawer-modal${isProfileDrawerOpen ? ' open' : ''}`}
          onClick={() => setProfileDrawerOpen(false)}
          style={{ backdropFilter: 'blur(3px)' }}
        >
          <div
            className={`drawer-content${drawerContentOpen ? ' open' : ''}`}
            onClick={e => e.stopPropagation()}
            style={{
              background: 'linear-gradient(135deg, #f8fafc 60%, #e0e7ff 100%)',
              boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)',
              borderTopLeftRadius: 18,
              borderBottomLeftRadius: 18,
              padding: '32px 26px',
              minHeight: '100vh',
              maxWidth: 400,
              width: '90vw',
              border: '1px solid #e0e7ff'
            }}
          >
            <div
              className="drawer-header"
              style={{
                color: '#1e293b',
                fontWeight: 700,
                fontSize: '1.25rem',
                letterSpacing: '0.5px',
                background: 'transparent',
                borderBottom: '1.5px solid #e0e7ff',
                paddingBottom: 12,
                marginBottom: 18
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <img
                  src={ReactSession.get('profileimage')}
                  alt="Profile"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid #6366f1',
                    marginRight: 8
                  }}
                />
                Account Options
              </span>
              <button
                className="close-btn"
                onClick={() => setProfileDrawerOpen(false)}
                style={{
                  fontSize: '2rem',
                  color: '#6366f1',
                  background: 'none',
                  border: 'none',
                  marginLeft: 'auto'
                }}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <button
              onClick={handleeditprofile}
              className="dropdown-item"
              style={{
                color: '#1e293b',
                background: '#f1f5f9',
                borderRadius: 8,
                marginBottom: 10,
                fontWeight: 600,
                fontSize: '1.08rem',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 16px',
                border: 'none',
                transition: 'background 0.2s'
              }}
            >
              <FiEdit2 className="square-icon" style={{ color: '#6366f1', fontSize: 20 }} /> Edit Profile
            </button>
            <button
              onClick={handlepassword}
              className="dropdown-item"
              style={{
                color: '#1e293b',
                background: '#f1f5f9',
                borderRadius: 8,
                marginBottom: 10,
                fontWeight: 600,
                fontSize: '1.08rem',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 16px',
                border: 'none',
                transition: 'background 0.2s'
              }}
            >
              <FiKey className="square-icon" style={{ color: '#6366f1', fontSize: 20 }} /> Change Password
            </button>
            <button
              onClick={handleLogout}
              className="dropdown-item logout"
              style={{
                color: '#dc3545',
                background: '#fef2f2',
                borderRadius: 8,
                fontWeight: 600,
                fontSize: '1.08rem',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 16px',
                border: 'none',
                transition: 'background 0.2s'
              }}
            >
              <FiLogOut className="square-icon" style={{ color: '#dc3545', fontSize: 20 }} /> Logout
            </button>
            <div
              className="drawer-info"
              style={{
                marginTop: 22,
                fontSize: '1rem',
                color: '#334155',
                background: '#f1f5f9',
                borderRadius: 10,
                padding: '14px 18px',
                fontWeight: 500,
                boxShadow: '0 2px 8px 0 rgba(31, 38, 135, 0.06)'
              }}
            >
              <p style={{ margin: 0 }}>Login: <span style={{ color: '#6366f1', fontWeight: 700 }}>{loginTime}</span></p>
              {logoutTime && <p style={{ margin: 0 }}>Logout: <span style={{ color: '#dc3545', fontWeight: 700 }}>{logoutTime}</span></p>}
            </div>
          </div>
        </div>
      )}

      {/* Alerts */}
      <AnimatePresence>
        {alerts.map((alert) => (
          <CustomAlert
            key={alert.id}
            {...alert}
            onClose={() => setAlerts(prev => prev.filter(a => a.id !== alert.id))}
            duration={alert.type === "info" ? 0 : 3000}
          />
        ))}
      </AnimatePresence>


    </nav>
  );
}
