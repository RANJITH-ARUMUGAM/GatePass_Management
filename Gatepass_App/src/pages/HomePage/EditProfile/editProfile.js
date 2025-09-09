import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, Image } from 'react-bootstrap';
import { ReactSession } from 'react-client-session';
import axios from 'axios';
import profilePic from '../profile.png';
import CustomAlert from '../../../CustomAlert';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SERVER_PORT } from '../../../constant';


const EditProfile = ({ setTitle }) => {
  const loginid = ReactSession.get('username');
  
  const today = new Date().toISOString().split('T')[0];
  const gender = ['Male', 'Female', 'Others'];
  const navigate = useNavigate();

  const [alerts, setAlerts] = useState([]);
  const [userData, setUserData] = useState({});


  useEffect(() => {
    setTitle('Edit Profile');
  }, []);

  useEffect(() => {
    if (loginid) {
      axios.get(`${SERVER_PORT}/edit_profile/${loginid}`)
        .then(response => {
          const user = response.data;
          setUserData(user);
          // if (user.adm_users_profileimage) {
          //   ReactSession.set("profileimage", user.adm_users_profileimage);
          // }
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
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <Card
          className="shadow rounded-4 border-0 bg-light"
          style={{
            maxWidth: 1000,
            margin: '10px auto',
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(2px)'
          }}
        >
          <Card.Body>
            <Form onSubmit={handleSubmit}>
              <Row className="g-4">
                <Col
                  md={5}
                  className="border-end"
                  style={{
                    background: 'rgba(99,102,241,0.06)',
                    borderRadius: '18px 0 0 18px',
                    padding: '14px 12px'
                  }}
                >
                  <div className="text-center mb-2 mt-0">
                    <div className="position-relative d-inline-block">
                      <Image
                        src={userData.adm_users_profileimage || profilePic}
                        roundedCircle
                        width={180}
                        height={180}
                        className="border shadow"
                        alt="Profile"
                      />
                      <div className="position-absolute bottom-0 end-0">
                        <Button
                          variant="dark"
                          size="sm"
                          className="rounded-circle"
                          onClick={() => document.getElementById('profileImageInput').click()}
                        >
                          <i className="bi bi-upload"></i>
                        </Button>
                        <Form.Control
                          type="file"
                          id="profileImageInput"
                          className="d-none"
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                      </div>
                    </div>
                  </div>
                  {[
                    ['Login ID', userData.adm_users_loginid],
                    ['First Name', userData.adm_users_firstname],
                    ['Last Name', userData.adm_users_lastname],
                    ['Mobile', userData.adm_users_mobile],
                    ['Email', userData.adm_users_email]
                  ].map(([label, value], idx) => (
                    <Row key={idx} className="align-items-center mb-1 mt-1">
                      <Col xs={4} className="text-end fw-bold" style={{ color: '#1d3557', fontSize: '0.95rem' }}>
                        {label}:
                      </Col>
                      <Col xs={8}>
                        <span style={{
                          color: 'white',
                          fontWeight: 500,
                          backgroundColor: '#a39999',
                          padding: '2px 8px',
                          borderRadius: '5px',
                          display: 'inline-block',
                          maxWidth: '100%',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          fontSize: '0.95rem'
                        }}>
                          {value || '-'}
                        </span>
                      </Col>
                    </Row>
                  ))}
                </Col>

                <Col md={7} style={{ padding: '5px 5px' }}>
                  <h5 className="mb-3 fw-bold" style={{ color: '#6366f1', letterSpacing: '0.5px' }}>Personal & Address Details</h5>
                  {[1, 2, 3].map(n => (
                    <Form.Group className="mb-2" key={`address${n}`}>
                      <Form.Label className="fw-bold" style={{ fontSize: '0.97rem' }}>Address Line {n}</Form.Label>
                      <Form.Control
                        type="text"
                        name={`adm_users_address${n}`}
                        value={userData[`adm_users_address${n}`] || ''}
                        onChange={handleDataChange}
                        style={{ fontSize: '0.97rem', borderRadius: 6, padding: '6px 10px' }}
                        placeholder={`Enter address line ${n}`}
                      />
                    </Form.Group>
                  ))}
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-2">
                        <Form.Label className="fw-bold" style={{ fontSize: '0.97rem' }}>Gender</Form.Label>
                        <Form.Select
                          name="adm_users_gender"
                          value={userData.adm_users_gender || ''}
                          onChange={handleDataChange}
                          style={{ fontSize: '0.97rem', borderRadius: 6, padding: '6px 10px' }}
                        >
                          <option value="">Select</option>
                          {gender.map((gen, idx) => (
                            <option key={idx} value={gen}>{gen}</option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-2">
                        <Form.Label className="fw-bold" style={{ fontSize: '0.97rem' }}>Date of Birth</Form.Label>
                        <Form.Control
                          type="date"
                          name="adm_users_dob"
                          value={userData.adm_users_dob || ''}
                          max={today}
                          onChange={handleDataChange}
                          style={{ fontSize: '0.97rem', borderRadius: 6, padding: '6px 10px' }}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <div className="d-flex justify-content-end gap-2 mt-3">
                    <Button className="px-3 py-2" variant="success" type="submit" style={{ fontSize: '1rem', borderRadius: 6 }}>
                      Save
                    </Button>
                    <Button className="px-3 py-2" variant="danger" onClick={back} style={{ fontSize: '1rem', borderRadius: 6 }}>
                      Cancel
                    </Button>
                  </div>
                </Col>
              </Row>
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
    </Container>
  );
};

export default EditProfile;
