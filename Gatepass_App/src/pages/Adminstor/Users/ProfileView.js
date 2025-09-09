import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Modal, Button, Row, Col, Form } from 'react-bootstrap';
import { format, addDays } from 'date-fns';
import { SERVER_PORT } from '../../../constant';
import { ReactSession } from 'react-client-session';
import CryptoJS from 'crypto-js';
import { AES, enc } from 'crypto-js';


function EditUsersModel({ setTitle }) {


    useEffect(() => {
        setTitle("Edit Profile View");
    }, []);

    const navigate = useNavigate()

    const [company, setCompanyValues] = useState([])
    const [role, setRoleValues] = useState([])
    const [DisplayValues, setDisplayValues] = useState();
    const [userspasswordminLength, setuserspasswordminLength] = useState();
    const [userskeeppasswordHistory, setuserskeeppasswordHistory] = useState();
    const [userslockafterfailedLogins, setuserslockafterfailedLogins] = useState();

    const { id } = useParams();


    const [values, setUserValues] = useState({
        Users_LoginID: "",
        Users_Password: "",
        Users_email: "",
        Users_Title: "",
        Users_FirstName: "",
        Users_LastName: "",
        Users_Mobile: "",
        Users_LastUpdatedDate: null,
        Users_IsLocked: true,
        Users_PasswordExpireDate: null,
        Users_PasswordExpiryDays: null,
        Users_Lock_PastExpiration: null,
        Users_KeepPasswordHistory: null,
        Users_KeepPasswordHistoryCount: null,
        Users_LockOnFailedLogin: null,
        Users_LockAfterFailedLogins: null,
        Users_Password_MinLength: null,
        Users_EnforcePasswordComplexity: null,
        Users_RequiresPasswordChange: null,
        Users_LastActivityDate: null,
        Users_Status: "",
        modified_by: "",

    })


    // Decryption method
    const decryptPassword = (encryptedPassword) => {
        const secretKey = 'password'; // Use a strong secret key and keep it secure
        const bytes = CryptoJS.AES.decrypt(encryptedPassword, secretKey);
        const decryptedPassword = bytes.toString(CryptoJS.enc.Utf8);
        //  alert(decryptedPassword)
        return decryptedPassword;

    };



    useEffect(() => {
        setuserspasswordminLength(true)
        setuserskeeppasswordHistory(true)
        setuserslockafterfailedLogins(true)

        const username = ReactSession.get("username");
        setDisplayValues.DisplayValues = username;

        ReactSession.get("uid")


        setUserValues({ ...values, modified_by: setDisplayValues.DisplayValues });
        console.log(setDisplayValues.DisplayValues)




        axios.get(`${SERVER_PORT}/edit_profile/` + id)
            .then(res => {
                const userData = res.data[0];
                const decryptedPassword = decryptPassword(userData.Users_Password);
                values.Users_Password = decryptedPassword


                setUserValues({
                    ...values, Users_ID: res.data[0].Users_ID,
                    Users_LoginID: res.data[0].Users_LoginID,
                    Users_email: res.data[0].Users_email,
                    Users_Title: res.data[0].Users_Title,
                    Users_FirstName: res.data[0].Users_FirstName,
                    Users_LastName: res.data[0].Users_LastName,
                    Users_Mobile: res.data[0].Users_Mobile,

                })

                if (res.data[0].modified_on) {
                    values.Users_LastUpdatedDate = format(new Date(res.data[0].modified_on), 'yyyy-MM-dd')
                }
                else {

                    values.Users_LastUpdatedDate = format(new Date(res.data[0].created_on), 'yyyy-MM-dd')

                }
                if (res.data[0].Users_PasswordExpiryDays) {
                    const passwordExpireDate = addDays(values.Users_LastUpdatedDate, res.data[0].Users_PasswordExpiryDays);
                    values.Users_PasswordExpireDate = format(new Date(passwordExpireDate), 'yyyy-MM-dd')

                }
            })
            .catch(err => console.log(err));

    }, [])


    const userislockedCheckboxChange = (e) => {
        const { name, checked } = e.target
        setUserValues.Users_IsLocked = e.target.checked
        setUserValues({ ...values, Users_IsLocked: e.target.checked })
        setUserValues((prevValues) => ({
            ...prevValues,
            [name]: checked,
        }));
    };




    const activestatusCheckboxChange = (e) => {
        const { name, checked } = e.target
        setUserValues.Users_Status = e.target.checked
        setUserValues({ ...values, Users_Status: e.target.checked })
        setUserValues((prevValues) => ({
            ...prevValues,
            [name]: checked,
        }));
    };



    const UsersLockOnFailedLoginCheckboxChange = (e) => {
        const { name, checked } = e.target

        if (setUserValues.Users_LockOnFailedLogin === true) {
            setuserslockafterfailedLogins(true)
        } else if (setUserValues.Users_LockOnFailedLogin === false) {
            setuserslockafterfailedLogins(false)
        } else {
            setuserslockafterfailedLogins(false)
        }
        setUserValues.Users_LockOnFailedLogin = e.target.checked
        setUserValues({ ...values, Users_LockOnFailedLogin: e.target.checked })
        setUserValues((prevValues) => ({
            ...prevValues,
            [name]: checked,
        }));
    };


    const userkeeppasshistCheckboxChange = (e) => {
        const { name, checked } = e.target
        console.log(checked)
        if (setUserValues.Users_KeepPasswordHistory === true) {
            setuserskeeppasswordHistory(true)
        } else if (setUserValues.Users_KeepPasswordHistory === false) {
            setuserskeeppasswordHistory(false)
        } else {
            setuserskeeppasswordHistory(false)
        }

        setUserValues.Users_KeepPasswordHistory = e.target.checked
        setUserValues({ ...values, Users_KeepPasswordHistory: e.target.checked })
        setUserValues((prevValues) => ({
            ...prevValues,
            [name]: checked,
        }));
    };

    const UsersEnforcePassComplexityCheckboxChange = (e) => {
        const { name, checked } = e.target

        console.log(checked)

        if (setUserValues.Users_EnforcePasswordComplexity === true) {
            setuserspasswordminLength(true)
        } else if (setUserValues.Users_EnforcePasswordComplexity === false) {
            setuserspasswordminLength(false)
        } else {
            setuserspasswordminLength(false)
        }
        setUserValues.Users_EnforcePasswordComplexity = e.target.checked
        setUserValues({ ...values, Users_EnforcePasswordComplexity: e.target.checked })
        setUserValues((prevValues) => ({
            ...prevValues,
            [name]: checked,
        }));
    };


    const UsersRequiresPasswordChangeCheckboxChange = (e) => {
        const { name, checked } = e.target
        setUserValues.Users_RequiresPasswordChange = e.target.checked
        setUserValues({ ...values, Users_RequiresPasswordChange: e.target.checked })
        setUserValues((prevValues) => ({
            ...prevValues,
            [name]: checked,
        }));
    };


    const handleSubmit = (e) => {
        e.preventDefault();


        axios.put(`${SERVER_PORT}/errorcheckedit/${setDisplayValues.DisplayValues}/` + id, values)
            .then(res => {
                if (res.data.message === 'Loginid already exists') {
                    alert('Login ID already exists');
                } else if (res.data.message === 'Emailid already exists') {
                    alert('Email ID already exists');
                } else if (res.data.message === 'Mobile Number already exists') {
                    alert('Mobile Number already exists');
                } else {
                    const encryptedPassword = AES.encrypt(values.Users_Password, 'password').toString();
                    values.Users_Password = encryptedPassword;

                    axios.put(`${SERVER_PORT}/profileedit/${setDisplayValues.DisplayValues}/` + id, values)
                        .then(res => {

                            alert('Saved Successfully');
                            navigate('/');

                        })
                        .catch(err => console.log(err));
                }
            })
            .catch(err => console.log(err));
    }



    return (

        <div className="Form-page" style={{ minHeight: '91.1vh', backgroundColor: 'rgb(241, 245, 245)', overflowX: 'hidden' }}>
            {/* Navigation Links Header */}

            <div style={{ backgroundColor: '#d2edce', marginTop: '15px', paddingLeft: '10px' }} >
                <Row className="ml-5">
                    <Col>
                        <div className="d-flex justify-content-between align-items-center">

                            <h5 style={{ fontStyle: 'italic' }} className="ml-3 mt-2" >Profile</h5>
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
                            <Link style={{ fontSize: '14px', color: 'black', paddingLeft: '5px' }} to='/Home'>Home </Link>
                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" style={{ color: '#5D6D7E' }} fill="currentColor" className="bi bi-chevron-right" viewBox="0 0 16 16">
                                <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708" />
                            </svg>
                            {/*  <Link style={{ fontSize: '14px', color: 'black' }} to="/"> Home</Link>
                                     <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" style={{ color: '#5D6D7E' }} fill="currentColor" className="bi bi-chevron-right" viewBox="0 0 16 16">
<path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708" />
</svg> */}
                            <span style={{ fontSize: '14px', color: '#73879C', paddingLeft: '5px' }}>Profile</span>
                        </div>
                    </Col>

                </Row>
            </div>

            <div className="x_panel">
                <div className="d-flex justify-content-center align-items-center">
                    <img
                        src='./images12.jpg'
                        width={120}
                        alt="JKR Enterprise"
                        className="p-2 mb-4"
                    />
                </div>

                <form onSubmit={handleSubmit} >
                    <Row className="mb-1 align-items-end">
                        <Col md={4}>
                            <Form.Group controlId="Users_LoginID" onChange={e => setUserValues({ ...values, Users_LoginID: e.target.value })}  >
                                <Form.Label className="label-style">Login ID<span className="star"></span></Form.Label>
                                <Form.Control type="text" name="Users_LoginID" required defaultValue={values.Users_LoginID}
                                    title='please enter User Login ID'
                                />
                            </Form.Group>
                        </Col>
                        <Col md={4} className="ml-4">

                            <Form.Group controlId="Users_Password">
                                <Link to={`/Password/${ReactSession.get("uid")}`}>

                                    {/* <button type="button" class="btn btn-primary btn-lg btn3d bi bi-lock-fill mr-1" ><span class="glyphicon glyphicon-gift">
                                        </span> Change password</button> */}
                                    <Button variant="primary" className="bi bi-lock-fill">
                                        Change password
                                    </Button>
                                </Link>
                            </Form.Group>
                        </Col>

                    </Row>
                    <Row>
                        <Col md={4}>
                            <Form.Group controlId="Module_ID" >
                                <Form.Label className="label-style" >Title<span className="star"></span></Form.Label>
                                <Form.Control
                                    as="select"
                                    Searchable onChange={e => setUserValues({ ...values, Users_Title: e.target.value })}
                                    value={values.Users_Title}
                                    required>
                                    <option value="select">Select Title</option>
                                    <option value="Mr">Mr</option>
                                    <option value="Ms">Ms</option>
                                    <option value="Mrs">Mrs</option>

                                </Form.Control>
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group controlId="Users_email" onChange={e => setUserValues({ ...values, Users_FirstName: e.target.value })}  >
                                <Form.Label className="label-style" > First Name<span className="star"></span></Form.Label>
                                <Form.Control type="text" name="Users_FirstName" required defaultValue={values.Users_FirstName}
                                    title='please enter Users FirstName'
                                />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group controlId="Users_LastName" onChange={e => setUserValues({ ...values, Users_LastName: e.target.value })}>
                                <Form.Label className="label-style"> Last Name<span className="star"></span></Form.Label>
                                <Form.Control type="text" name="Users_LastName" defaultValue={values.Users_LastName}
                                    title='Enter Users LastName'
                                />
                            </Form.Group>
                        </Col>

                    </Row>
                    <Row className="mb-2">
                        <Col md={4}>
                            <Form.Group controlId="Users_email" onChange={e => setUserValues({ ...values, Users_email: e.target.value })}  >
                                <Form.Label className="label-style"> Email<span className="star"></span></Form.Label>
                                <Form.Control type="email" name="Users_email" required defaultValue={values.Users_email}
                                    title='please enter User Email'
                                />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group controlId="Users_Mobile" onChange={e => setUserValues({ ...values, Users_Mobile: e.target.value })}  >
                                <Form.Label className="label-style">Mobile<span className="star"></span></Form.Label>
                                <Form.Control type="tel" name="Users_Mobile" required defaultValue={values.Users_Mobile}
                                    minLength={10} maxLength={15}
                                    title='please enter Users Mobile'
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Button variant="success" type="submit" >
                        Save
                    </Button>


                    <Link to="/">
                        <Button variant="danger" type="submit" style={{ marginLeft: "10px" }}>
                            Cancel  </Button>
                    </Link>

                </form>


            </div>
        </div>

    )
}

export default EditUsersModel;