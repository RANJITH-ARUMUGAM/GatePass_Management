import axios from "axios"
import React from "react"
import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Form, Button, Row, Col } from "react-bootstrap"
import Searchable from "react-searchable-dropdown";
import { SERVER_PORT } from '../../../constant';
import { ReactSession } from 'react-client-session';
import { AES, enc } from 'crypto-js';

function AddUsers({ setTitle }) {


    useEffect(() => {
        setTitle("Add Users");
    }, []);

    const navigate = useNavigate()

    const [company, setCompanyValues] = useState([])
    const [role, setRoleValues] = useState([])
    const [DisplayValues, setDisplayValues] = useState();
    const [userspasswordminLength, setuserspasswordminLength] = useState();
    const [userskeeppasswordHistory, setuserskeeppasswordHistory] = useState();
    const [userslockafterfailedLogins, setuserslockafterfailedLogins] = useState();


    const [values, setUserValues] = useState({
        Users_LoginID: "",
        Users_Password: "",
        Users_email: "",
        Users_Title: "",
        Users_FirstName: "",
        Users_LastName: "",
        Users_Mobile: "",
        Users_LastUpdatedDate: null,
        Users_IsLocked: false,
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
        Users_Created_BY: ""
    })


    useEffect(() => {

        console.log(setUserValues.Users_IsLocked)

        setuserspasswordminLength(true)
        setuserskeeppasswordHistory(true)
        setuserslockafterfailedLogins(true)

        const username = ReactSession.get("username");
        setDisplayValues.DisplayValues = username;

        setUserValues({ ...values, Users_Created_BY: setDisplayValues.DisplayValues });
        console.log(setDisplayValues.DisplayValues)

        axios.get(`${SERVER_PORT}/Company_active`)
            .then(res => (setCompanyValues(res.data)))
            .catch(err => console.log(err));


        axios.get(`${SERVER_PORT}/role_active`)
            .then(res => (setRoleValues(res.data)))
            .catch(err => console.log(err));
    }, [])




    const UsersLockOnFailedLoginCheckboxChange = (e) => {
        const { name, checked } = e.target

        if (setUserValues.Users_LockOnFailedLogin === true) {
            setuserslockafterfailedLogins(true)
        } else if (setUserValues.Users_LockOnFailedLogin === false) {
            setuserslockafterfailedLogins(false)
        } else {
            setuserslockafterfailedLogins(false)
        }

        //alert(e.target.checked)
        setUserValues.Users_LockOnFailedLogin = e.target.checked
        setUserValues({ ...values, Users_LockOnFailedLogin: e.target.checked })
        //alert(setAccValues.Account_Sub_Tag)
        setUserValues((prevValues) => ({
            ...prevValues,
            [name]: checked,
        }));
    };


    const userkeeppasshistCheckboxChange = (e) => {
        const { name, checked } = e.target
        //alert(e.target.checked)
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
        //alert(setAccValues.Account_Sub_Tag)
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

        //alert(e.target.checked)
        setUserValues.Users_EnforcePasswordComplexity = e.target.checked
        setUserValues({ ...values, Users_EnforcePasswordComplexity: e.target.checked })
        //alert(setAccValues.Account_Sub_Tag)
        setUserValues((prevValues) => ({
            ...prevValues,
            [name]: checked,
        }));
    };

    const UsersRequiresPasswordChangeCheckboxChange = (e) => {
        const { name, checked } = e.target
        //alert(e.target.checked)
        setUserValues.Users_RequiresPasswordChange = e.target.checked
        setUserValues({ ...values, Users_RequiresPasswordChange: e.target.checked })
        //alert(setAccValues.Account_Sub_Tag)
        setUserValues((prevValues) => ({
            ...prevValues,
            [name]: checked,
        }));
    };



    const handleSubmit = (e) => {
        e.preventDefault();

        axios.post(`${SERVER_PORT}/errorcheck/${setDisplayValues.DisplayValues}`, values)
            .then(res => {
                if (res.data.message === 'Loginid already exists') {
                    alert('Login ID already exists');
                } else if (res.data.message === 'Emailid already exists') {
                    alert('Email ID already exists');
                } else if (res.data.message === 'Mobile Number already exists') {
                    alert('Mobile Number already exists');
                } else {
                    // Encrypt the password before sending it to the server
                    const encryptedPassword = AES.encrypt(values.Users_Password, 'password').toString();
                    values.Users_Password = encryptedPassword;

                    axios.post(`${SERVER_PORT}/useradd/${setDisplayValues.DisplayValues}`, values)
                        .then(res => {
                            alert('Saved Successfully');
                            navigate('/Users');

                        })
                        .catch(err => console.log(err));
                }
            })
            .catch(err => console.log(err));
    }


    return (
        <div className="employee-container">
            <div className="x_panel ">
                <div className="d-flex align-items-center" style={{ background: '#6c757d', color: 'white', fontSize: '20px', padding: '8px 16px', borderRadius: '4px 4px 0 0', marginTop: '0px' }}>
                    Users Detail
                </div>
                <div style={{ borderTop: "2px solid gray", marginBottom: '10px' }}></div>

                <Form onSubmit={handleSubmit} className="m-0" >
                    <Row className="m-2">
                        <Col md={4}>
                            <Form.Group controlId="Users_LoginID">
                                <Form.Label className="label-style"> Login ID<span className="star"></span></Form.Label>
                                <Form.Control
                                    type="text"
                                    name="Users_LoginID"
                                    required
                                    title="please enter User Login ID"
                                    autoComplete="off"
                                    value={values.Users_LoginID}
                                    onChange={e => setUserValues({ ...values, Users_LoginID: e.target.value })}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group controlId="Users_Password" onChange={e => setUserValues({ ...values, Users_Password: e.target.value })}>
                                <Form.Label className="label-style"> Password<span className="star"></span></Form.Label>
                                <Form.Control type="password" name="Users_Password" required
                                    title='Enter Users Password'
                                />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group controlId="Module_ID" >
                                <Form.Label className="label-style">Title<span className="star"></span></Form.Label>
                                <Form.Control
                                    as="select"
                                    Searchable onChange={e => setUserValues({ ...values, Users_Title: e.target.value })}
                                    required>
                                    <option value="select">Select Title</option>
                                    <option value="Mr">Mr</option>
                                    <option value="Ms">Ms</option>
                                    <option value="Mrs">Mrs</option>

                                </Form.Control>
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row className="m-2">
                        <Col md={3}>
                            <Form.Group controlId="Users_email" onChange={e => setUserValues({ ...values, Users_FirstName: e.target.value })}  >
                                <Form.Label className="label-style"> First Name<span className="star"></span></Form.Label>
                                <Form.Control type="text" name="Users_FirstName" required
                                    title='please enter Users FirstName'
                                />
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group controlId="Users_LastName" onChange={e => setUserValues({ ...values, Users_LastName: e.target.value })}>
                                <Form.Label className="label-style"> Last Name<span className="star"></span></Form.Label>
                                <Form.Control type="text" name="Users_LastName" required
                                    title='Enter Users LastName'
                                />
                            </Form.Group>
                        </Col>

                        <Col md={3}>
                            <Form.Group controlId="Users_email" onChange={e => setUserValues({ ...values, Users_email: e.target.value })}  >
                                <Form.Label className="label-style"> Email<span className="star"></span></Form.Label>
                                <Form.Control type="email" name="Users_email" required
                                    title='please enter User Email'
                                />
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group controlId="Users_Mobile" onChange={e => setUserValues({ ...values, Users_Mobile: e.target.value })}  >
                                <Form.Label className="label-style"> Mobile<span className="star"></span></Form.Label>
                                <Form.Control type="tel" name="Users_Mobile" minLength={10} maxLength={15} required
                                    title='please enter Users Mobile'
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <div className="d-flex align-items-center mb-2" style={{ background: '#6c757d', color: 'white', fontSize: '20px', padding: '8px 16px', borderRadius: '4px 4px 0 0', marginTop: '24px' }}>
                        Enforce Complexity
                    </div>

                    <Row className="m-2">
                        <Col md={4}>
                            <Form.Group controlId="Users_PasswordExpiryDays" onChange={e => setUserValues({ ...values, Users_PasswordExpiryDays: e.target.value })}  >
                                <Form.Label className="label-style">Password Expiry Days</Form.Label>
                                <Form.Control type="number" name="Users_PasswordExpiryDays"
                                />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group controlId="Users_Lock_PastExpiration" onChange={e => setUserValues({ ...values, Users_Lock_PastExpiration: e.target.value })}  >
                                <Form.Label className="label-style">Lock Past Expiration</Form.Label>
                                <Form.Control type="text" name="Users_Lock_PastExpiration"
                                />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group controlId="Users_RequiresPasswordChange">
                                <Form.Label className="label-style">Requires Password Change</Form.Label>
                                <div className="form-check form-switch">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        role="switch"
                                        id="flexSwitchCheckChecked"
                                        checked={values.Users_RequiresPasswordChange} onChange={UsersRequiresPasswordChangeCheckboxChange}
                                        name="Users_RequiresPasswordChange"
                                    />
                                    <label
                                        className="label-style"
                                        htmlFor="flexSwitchCheckChecked"

                                    >
                                        {values.Users_RequiresPasswordChange ? 'On' : 'Off'}
                                    </label>
                                </div>
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row className="m-3">
                        <Col md={4}>
                            <Form.Group controlId="Users_EnforcePasswordComplexity">
                                <Form.Label className="label-style">Enforce Password Complexity</Form.Label>
                                <div className="form-check form-switch">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        role="switch"
                                        id="flexSwitchCheckChecked"
                                        checked={values.Users_EnforcePasswordComplexity} onChange={UsersEnforcePassComplexityCheckboxChange}
                                        name="Users_EnforcePasswordComplexity"
                                    />
                                    <label
                                        className="label-style"
                                        htmlFor="flexSwitchCheckChecked"

                                    >
                                        {values.Users_EnforcePasswordComplexity ? 'On' : 'Off'}
                                    </label>
                                </div>


                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group controlId="Users_KeepPasswordHistory">
                                <Form.Label className="label-style">Keep Password History</Form.Label>
                                <div className="form-check form-switch">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        role="switch"
                                        id="flexSwitchCheckChecked"
                                        checked={values.Users_KeepPasswordHistory} onChange={userkeeppasshistCheckboxChange}
                                        name="Users_KeepPasswordHistory"
                                    />
                                    <label
                                        className="label-style"
                                        htmlFor="flexSwitchCheckChecked"

                                    >
                                        {values.Users_KeepPasswordHistory ? 'On' : 'Off'}
                                    </label>
                                </div>

                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group controlId="Users_LockOnFailedLogin">
                                <Form.Label className="label-style">Lock-On Failed Login</Form.Label>
                                <div className="form-check form-switch">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        role="switch"
                                        id="flexSwitchCheckChecked"
                                        checked={values.Users_LockOnFailedLogin} onChange={UsersLockOnFailedLoginCheckboxChange}
                                        name="Users_LockOnFailedLogin"
                                    />
                                    <label
                                        className="label-style"
                                        htmlFor="flexSwitchCheckChecked"

                                    >
                                        {values.Users_LockOnFailedLogin ? 'On' : 'Off'}
                                    </label>
                                </div>
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row className="m-2">
                        <Col md={4}>
                            <Form.Group controlId="Users_Password_MinLength" onChange={e => setUserValues({ ...values, Users_Password_MinLength: e.target.value })}  >
                                <Form.Label className="label-style">Password MinLength</Form.Label>
                                <Form.Control type="number" name="Users_Password_MinLength"
                                    disabled={userspasswordminLength == true ? true : false}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group controlId="Users_KeepPasswordHistoryCount" onChange={e => setUserValues({ ...values, Users_KeepPasswordHistoryCount: e.target.value })}  >
                                <Form.Label className="label-style">Keep Password History Count</Form.Label>
                                <Form.Control type="number" name="Users_KeepPasswordHistoryCount"
                                    disabled={userskeeppasswordHistory == true ? true : false}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group controlId="Users_LockAfterFailedLogins" onChange={e => setUserValues({ ...values, Users_LockAfterFailedLogins: e.target.value })}  >
                                <Form.Label className="label-style">Lock After Failed Logins</Form.Label>
                                <Form.Control type="number" name="Users_LockAfterFailedLogins"
                                    disabled={userslockafterfailedLogins == true ? true : false}
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <div className="d-flex justify-content-end m-3">
                        <Button variant="success" type="submit">
                            Save
                        </Button>
                        <Link to="/user">
                            <Button variant="danger" type="button" style={{ marginLeft: "10px" }}>
                                Cancel
                            </Button>
                        </Link>
                    </div>
                </Form>
            </div>
        </div>

    )
}

export default AddUsers;