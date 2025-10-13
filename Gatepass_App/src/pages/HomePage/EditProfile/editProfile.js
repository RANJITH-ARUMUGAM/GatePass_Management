import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, Image } from 'react-bootstrap';
import { ReactSession } from 'react-client-session';
import axios from 'axios';
import profilePic from '../profile.png';
import CustomAlert from '../../../CustomAlert';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SERVER_PORT } from '../../../constant';

function bufferToBase64(buffer) {
  if (!buffer) return '';
  if (typeof buffer === 'string') return buffer;
  if (buffer.data) {
    return btoa(
      new Uint8Array(buffer.data).reduce((data, byte) => data + String.fromCharCode(byte), '')
    );
  }
  return '';
}

const EditProfile = ({ setTitle }) => {
  const loginid = ReactSession.get('username');
  const today = new Date().toISOString().split('T')[0];
  const gender = ['Male', 'Female', 'Others'];
  const navigate = useNavigate();

  const [alerts, setAlerts] = useState([]);
  const [userData, setUserData] = useState({});

  useEffect(() => {
    setTitle('Edit Profile');
  }, [setTitle]);

  useEffect(() => {
    if (loginid) {
      axios.get(`${SERVER_PORT}/edit_profile/${loginid}`)
        .then(response => {
          const user = response.data;
          setUserData(user);
          if (user.adm_users_profileimage) {
            ReactSession.set("profileimage", user.adm_users_profileimage);
          }
        })
        .catch(error => console.error("Error fetching user data:", error));
    }
  }, [loginid]);

  const handleDataChange = (e) => {
    const { name, type, checked, value } = e.target;
    setUserData({ ...userData, [name]: type === "checkbox" ? checked : value });
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUserData({ ...userData, adm_users_profileimage: event.target.result });
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${SERVER_PORT}/edit_profile/${loginid}`, userData);
      setAlerts([{ id: Date.now(), type: 'success', title: 'Success', message: 'Profile updated successfully!' }]);
      setTimeout(() => navigate('/Home'), 2000);
    } catch (error) {
      setAlerts([{ id: Date.now(), type: 'error', title: 'Error', message: 'Update failed.' }]);
    }
  };

  const back = () => navigate(-1);

  return (
    <Container fluid className="p-1 m-0">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        style={{
          width: '100%',
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #f5f7fa 0%, #e4efe9 100%)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '5px 0',
          fontFamily: "'Poppins', sans-serif"
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          style={{ width: '100%', maxWidth: '900px' }}
        >
          <Card className="shadow-lg" style={{
            borderRadius: '16px',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: 'none',
            overflow: 'hidden'
          }}>
            <Card.Body style={{ padding: '2rem' }}>
              <div className="mb-4">
                <Row className="align-items-center">
                  <Col xs={12} md={5} className="text-center mb-3 mb-md-0">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.9 }}
                    >
                      <Image
                        src={
                          typeof userData.adm_users_profileimage === "string"
                            ? userData.adm_users_profileimage
                            : userData.adm_users_profileimage
                              ? `data:image/jpeg;base64,${bufferToBase64(userData.adm_users_profileimage)}`
                              : profilePic
                        }
                        roundedCircle
                        alt="User Profile"
                        style={{
                          width: '220px',
                          height: '220px',
                          objectFit: 'cover',
                          border: '4px solid #fff',
                          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                        }}
                      />
                    </motion.div>
                  </Col>
                  <Col xs={12} md={7}>
                    <motion.h3
                      className="mb-2"
                      style={{ fontWeight: '700', color: '#2d3748', fontSize: '1.5rem' }}
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                    >
                      {userData.adm_users_firstname} {userData.adm_users_lastname}
                    </motion.h3>
                    <motion.p
                      className="text-muted mb-2"
                      style={{ fontSize: '0.95rem', fontWeight: '500' }}
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                    >
                      Login ID: {userData.adm_users_loginid}
                    </motion.p>
                    <Form.Control
                      type="file"
                      id="profileImageInput"
                      className="d-none"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                    <motion.div
                      whileHover={{ scale: 1.07 }}
                      whileTap={{ scale: 0.97 }}
                      style={{ display: 'inline-block' }}
                    >
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="mt-2"
                        style={{ background: 'linear-gradient(135deg, #e0e7ff 0%, #1944f1ff 100%)', color: '#3730a3', fontWeight: 600, border: '1.5px solid #6366f1' }}
                        onClick={() => document.getElementById('profileImageInput').click()}
                      >
                        Change Profile Photo
                      </Button>
                    </motion.div>
                  </Col>
                </Row>
              </div>

              <Form onSubmit={handleSubmit} style={{ fontSize: '0.6rem' }}>
                <Row className="g-4">
                  <Col md={6}>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6, duration: 0.5 }}
                    >
                      <h5 style={{
                        color: '#2d3748',
                        fontWeight: '600',
                        borderBottom: '2px solid #4299e1',
                        paddingBottom: '0.5rem',
                        marginBottom: '1.5rem'
                      }}>
                        Personal Details:
                      </h5>
                      <Row className="mb-3">
                        <Col md={6} className="mb-3 mb-md-0">
                          <Form.Label style={{ fontWeight: '600', color: '#4a5568', fontSize: '0.75rem', marginBottom: '0.1rem' }}>First Name</Form.Label>
                          <Form.Control type="text" name="adm_users_firstname" value={userData.adm_users_firstname || ''} onChange={handleDataChange} style={{ borderRadius: '8px', padding: '4px 8px', border: '2px solid #e2e8f0', background: '#f8fafc', fontSize: '0.85rem' }} />
                        </Col>
                        <Col md={6}>
                          <Form.Label style={{ fontWeight: '600', color: '#4a5568', fontSize: '0.75rem', marginBottom: '0.1rem' }}>Last Name</Form.Label>
                          <Form.Control type="text" name="adm_users_lastname" value={userData.adm_users_lastname || ''} onChange={handleDataChange} style={{ borderRadius: '8px', padding: '4px 8px', border: '2px solid #e2e8f0', background: '#f8fafc', fontSize: '0.85rem' }} />
                        </Col>
                      </Row>
                      <div className="mb-3">
                        <Form.Label style={{ fontWeight: '600', color: '#4a5568', fontSize: '0.75rem', marginBottom: '0.1rem' }}>Mobile</Form.Label>
                        <Form.Control type="text" name="adm_users_mobile" value={userData.adm_users_mobile || ''} onChange={handleDataChange} style={{ borderRadius: '8px', padding: '4px 8px', border: '2px solid #e2e8f0', background: '#f8fafc', fontSize: '0.85rem' }} />
                      </div>
                      <div className="mb-3">
                        <Form.Label style={{ fontWeight: '600', color: '#4a5568', fontSize: '0.75rem', marginBottom: '0.1rem' }}>Email</Form.Label>
                        <Form.Control type="email" name="adm_users_email" value={userData.adm_users_email || ''} onChange={handleDataChange} style={{ borderRadius: '8px', padding: '4px 8px', border: '2px solid #e2e8f0', background: '#f8fafc', fontSize: '0.85rem' }} />
                      </div>
                      <div className="mb-3">
                        <Form.Label style={{ fontWeight: '600', color: '#4a5568', fontSize: '0.75rem', marginBottom: '0.1rem' }}>Gender</Form.Label>
                        <Form.Control as="select" name="adm_users_gender" value={userData.adm_users_gender || ''} onChange={handleDataChange} style={{ borderRadius: '8px', padding: '4px 8px', border: '2px solid #e2e8f0', background: '#f8fafc', fontSize: '0.85rem' }}>
                          <option value="">Select Gender</option>
                          {gender.map((g) => (<option key={g} value={g}>{g}</option>))}
                        </Form.Control>
                      </div>
                      <div className="mb-3">
                        <Form.Label style={{ fontWeight: '600', color: '#4a5568', fontSize: '0.75rem', marginBottom: '0.1rem' }}>Date of Birth</Form.Label>
                        <Form.Control type="date" name="adm_users_dob" value={userData.adm_users_dob || ''} max={today} onChange={handleDataChange} style={{ borderRadius: '8px', padding: '4px 8px', border: '2px solid #e2e8f0', background: '#f8fafc', fontSize: '0.85rem' }} />
                      </div>
                    </motion.div>
                  </Col>

                  <Col md={6}>
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7, duration: 0.5 }}
                    >
                      <h5 style={{
                        color: '#2d3748',
                        fontWeight: '600',
                        borderBottom: '2px solid #4299e1',
                        paddingBottom: '0.5rem',
                        marginBottom: '1.5rem'
                      }}>
                        Address Details:
                      </h5>
                      <Row className="mb-3">
                        <Col md={6} className="mb-3 mb-md-0">
                          <Form.Label style={{ fontWeight: '600', color: '#4a5568', fontSize: '0.75rem', marginBottom: '0.1rem' }}>Address Line 1</Form.Label>
                          <Form.Control type="text" name="adm_users_address1" value={userData.adm_users_address1 || ''} onChange={handleDataChange} style={{ borderRadius: '8px', padding: '4px 8px', border: '2px solid #e2e8f0', background: '#f8fafc', fontSize: '0.85rem' }} />
                        </Col>
                        <Col md={6}>
                          <Form.Label style={{ fontWeight: '600', color: '#4a5568', fontSize: '0.75rem', marginBottom: '0.1rem' }}>Address Line 2</Form.Label>
                          <Form.Control type="text" name="adm_users_address2" value={userData.adm_users_address2 || ''} onChange={handleDataChange} style={{ borderRadius: '8px', padding: '4px 8px', border: '2px solid #e2e8f0', background: '#f8fafc', fontSize: '0.85rem' }} />
                        </Col>
                      </Row>
                      <div className="mb-3">
                        <Form.Label style={{ fontWeight: '600', color: '#4a5568', fontSize: '0.75rem', marginBottom: '0.1rem' }}>Address Line 3</Form.Label>
                        <Form.Control type="text" name="adm_users_address3" value={userData.adm_users_address3 || ''} onChange={handleDataChange} style={{ borderRadius: '8px', padding: '4px 8px', border: '2px solid #e2e8f0', background: '#f8fafc', fontSize: '0.85rem' }} />
                      </div>
                      {/* You can add city, state, and postal code fields here if needed */}
                      <div className="mb-3">
                        <Form.Label style={{ fontWeight: '600', color: '#4a5568', fontSize: '0.75rem', marginBottom: '0.1rem' }}>City</Form.Label>
                        <Form.Control type="text" name="adm_users_city" value={userData.adm_users_city || ''} onChange={handleDataChange} style={{ borderRadius: '8px', padding: '4px 8px', border: '2px solid #e2e8f0', background: '#f8fafc', fontSize: '0.85rem' }} />
                      </div>
                      <div className="mb-3">
                        <Form.Label style={{ fontWeight: '600', color: '#4a5568', fontSize: '0.75rem', marginBottom: '0.1rem' }}>State</Form.Label>
                        <Form.Control type="text" name="adm_users_state" value={userData.adm_users_state || ''} onChange={handleDataChange} style={{ borderRadius: '8px', padding: '4px 8px', border: '2px solid #e2e8f0', background: '#f8fafc', fontSize: '0.85rem' }} />
                      </div>
                      <div className="mb-3">
                        <Form.Label style={{ fontWeight: '600', color: '#4a5568', fontSize: '0.75rem', marginBottom: '0.1rem' }}>Postal Code</Form.Label>
                        <Form.Control type="text" name="adm_users_postalcode" value={userData.adm_users_postalcode || ''} onChange={handleDataChange} style={{ borderRadius: '8px', padding: '4px 8px', border: '2px solid #e2e8f0', background: '#f8fafc', fontSize: '0.85rem' }} />
                      </div>
                    </motion.div>
                  </Col>
                </Row>
                <motion.div
                  className="d-flex justify-content-end gap-3 mt-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                >
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: "0 6px 16px rgba(0,0,0,0.1)" }}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 py-2"
                    type="submit"
                    style={{ borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #4299e1 0%, #3182ce 100%)', color: 'white', fontWeight: '600', fontSize: '0.95rem' }}
                  >
                    Save
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: "0 6px 16px rgba(0,0,0,0.1)" }}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 py-2"
                    onClick={back}
                    style={{ borderRadius: '8px', border: '2px solid #e53e3e', background: 'transparent', color: '#e53e3e', fontWeight: '600', fontSize: '0.95rem' }}
                  >
                    Cancel
                  </motion.button>
                </motion.div>
              </Form>
            </Card.Body>
          </Card>
        </motion.div>

        <div style={{ padding: "20px" }}>
          {alerts.map((alert) => (
            <CustomAlert
              key={alert.id}
              {...alert}
              onClose={() => setAlerts((prev) => prev.filter((a) => a.id !== alert.id))}
            />
          ))}
        </div>
      </motion.div>
    </Container>
  );
};

export default EditProfile;