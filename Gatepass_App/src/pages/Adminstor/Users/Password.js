import axios from "axios"
import React from "react"
import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Form, Button, Row, Col } from "react-bootstrap"
import { SERVER_PORT } from '../../../constant';
import { ReactSession } from 'react-client-session';
import CryptoJS from 'crypto-js';
import { AES, enc } from 'crypto-js';

function Password() {

     const navigate = useNavigate()
     const username = ReactSession.get("username");
     const editid = ReactSession.get("editid");




     const [values, setPassword] = useState({
          Current_Pwd: "",
          Confirm_Pwd: "",
          New_Pwd: "",
          modified_by: ReactSession.get("username")
     })






     const handleSubmit = (e) => {
          e.preventDefault();


          setPassword({ ...values, Current_Pwd: e.target.value })
          setPassword({ ...values, New_Pwd: e.target.value })
          setPassword({ ...values, Confirm_Pwd: e.target.value })



          axios.post(`${SERVER_PORT}/currpasswordcheck/${editid}`, values)
               .then(res => {
                    console.log(res.data)
                    if (res.data.message === 'Wrong Pass') {
                         alert('Wrong Password.');

                    } else if (values.New_Pwd !== values.Confirm_Pwd) {
                         alert('New password and confirm password does not match')
                    } else if (values.New_Pwd === values.Confirm_Pwd) {

                         const encryptedPassword = AES.encrypt(values.Confirm_Pwd, 'password').toString();
                         values.Confirm_Pwd = encryptedPassword;
                         alert(encryptedPassword);


                         axios.post(`${SERVER_PORT}/passwordchange/${editid}`, values)
                              .then(res => {
                                   alert('Added Successfully')
                                   navigate('/user')
                              }).catch(err => console.log(err));

                    }
               }).catch(err => console.log(err));

     }



     return (

          <div className="Form-page" style={{ minHeight: '91.1vh', backgroundColor: 'rgb(241, 245, 245)', overflowX: 'hidden' }}>
               {/* Navigation Links Header */}

               <div style={{ backgroundColor: '#d2edce', marginTop: '15px', paddingLeft: '10px' }} >
               <Row className="ml-5">
    <Col>
        <div className="d-flex justify-content-between align-items-center">

                              <h5 style={{ fontStyle: 'italic' }} className="ml-3 mt-2" > Change Password</h5>
                              </div>
                         </Col>
                    </Row>

               </div>
               <div style={{
                    backgroundColor: '#f7faf8',
                    borderBottom: '1px solid #dcdcdc'
               }}>
                    <Row className="align-items-center">
                         <Col md={10}>
                              <div style={{ paddingLeft: '80px' }}>
                                   <Link style={{ fontSize: '14px', color: 'black', paddingLeft: '5px' }} to='/Home'>Administration </Link>
                                   <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" style={{ color: '#5D6D7E' }} fill="currentColor" className="bi bi-chevron-right" viewBox="0 0 16 16">
                                        <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708" />
                                   </svg>
                                   <Link style={{ fontSize: '14px', color: 'black' }} to="/user"> Edit User</Link>
                                   <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" style={{ color: '#5D6D7E' }} fill="currentColor" className="bi bi-chevron-right" viewBox="0 0 16 16">
                                        <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708" />
                                   </svg>
                                   <span style={{ fontSize: '14px', color: '#73879C', paddingLeft: '5px' }}>Change Password</span>
                              </div>
                         </Col>

                    </Row>
               </div>
               <div className="x_panel">

                    <Row className="d-flex justify-content-center align-items-center mb-4">
                         <Col md={4} className="d-flex justify-content-center align-items-center">
                              <img
                                   src='./Password.jpg'
                                   width={300}
                                   height={300}
                                   alt="JKR Enterprise"
                                   className="p-2 mb-4"
                              />
                         </Col>
                         <Col md={6}>
                              <form onSubmit={handleSubmit} >
                                   <Row className="d-flex justify-content-center align-items-center mb-2">
                                        <Col md={4}>
                                             <Form.Label className="label-style">Current Password<span className="star"></span></Form.Label>
                                        </Col>
                                        <Col md={6}>
                                             <Form.Group controlId="Current_Pwd">
                                                  <div className="position-relative">
                                                       <i className="bi bi-lock-fill position-absolute" style={{ left: '10px', top: '50%', transform: 'translateY(-50%)' }}></i>
                                                       <Form.Control
                                                            className="pl-5"
                                                            onChange={e => setPassword({ ...values, Current_Pwd: e.target.value })}
                                                            title='please enter the current password'
                                                            type="password"
                                                            required
                                                       />
                                                  </div>
                                             </Form.Group>
                                        </Col>
                                   </Row>
                                   <Row className="d-flex justify-content-center align-items-center mb-2">
                                        <Col md={4}>
                                             <Form.Label className="label-style">New Password<span className="star"></span></Form.Label>
                                        </Col>
                                        <Col md={6}>
                                             <Form.Group controlId="New_Pwd" onChange={e => setPassword({ ...values, New_Pwd: (e.target.value).toUpperCase() })}>
                                                  <div className="position-relative">
                                                       <i className="bi bi-unlock-fill position-absolute" style={{ left: '10px', top: '50%', transform: 'translateY(-50%)' }}></i>
                                                       <Form.Control
                                                            className="pl-5"
                                                            type="password"
                                                            name="New_Pwd"
                                                            required
                                                            title='please enter the new password'
                                                       />
                                                  </div>
                                             </Form.Group>
                                        </Col>
                                   </Row>

                                   <Row className="d-flex justify-content-center align-items-center mb-2">
                                        <Col md={4}>
                                             <Form.Label className="label-style">Confirm Password<span className="star"></span></Form.Label>
                                        </Col>
                                        <Col md={6}>
                                             <Form.Group controlId="Confirm_Pwd" onChange={e => setPassword({ ...values, Confirm_Pwd: e.target.value })}>
                                                  <div className="position-relative">
                                                       <i className="bi bi-unlock-fill position-absolute" style={{ left: '10px', top: '50%', transform: 'translateY(-50%)' }}></i>
                                                       <Form.Control
                                                            className="pl-5"
                                                            type="password"
                                                            name="Confirm_Pwd"
                                                            required
                                                            title='please confirm password'
                                                       />
                                                  </div>
                                             </Form.Group>
                                        </Col>
                                   </Row>
                                   <Row className="d-flex justify-content-center align-items-center mb-2">
                                        <Col md={8}>
                                             <Button variant="success" type="submit">Save</Button>
                                             <Link to="/user">
                                                  <Button variant="danger" style={{ marginLeft: "10px" }}>Cancel</Button>
                                             </Link>
                                        </Col>
                                   </Row>
                              </form>
                         </Col>
                    </Row>
               </div>

          </div>

     )
}

export default Password;