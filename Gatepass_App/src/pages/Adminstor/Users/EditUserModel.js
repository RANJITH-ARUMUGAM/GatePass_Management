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
        setTitle("Edit Users");
    }, []);

    const navigate = useNavigate()
    const [company, setCompanyValues] = useState([])
    const [role, setRoleValues] = useState([])
    const [DisplayValues, setDisplayValues] = useState();
    const [userspasswordminLength, setuserspasswordminLength] = useState();
    const [userskeeppasswordHistory, setuserskeeppasswordHistory] = useState();
    const [userslockafterfailedLogins, setuserslockafterfailedLogins] = useState();

    const { id } = useParams();

    ReactSession.setStoreType("sessionStorage");
    const editid = ReactSession.set("editid", id);

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
        modified_by: "",

    })


    // Decryption method
    const decryptPassword = (encryptedPassword) => {
        const secretKey = 'password'; // Use a strong secret key and keep it secure
        const bytes = CryptoJS.AES.decrypt(encryptedPassword, secretKey);
        const decryptedPassword = bytes.toString(CryptoJS.enc.Utf8);
        return decryptedPassword;

    };



    useEffect(() => {
        setuserspasswordminLength(true)
        setuserskeeppasswordHistory(true)
        setuserslockafterfailedLogins(true)

        const username = ReactSession.get("username");
        setDisplayValues.DisplayValues = username;

        setUserValues({ ...values, modified_by: setDisplayValues.DisplayValues });
        console.log(setDisplayValues.DisplayValues)


        axios.get(`${SERVER_PORT}/Company_active`)
            .then(res => (setCompanyValues(res.data)))
            .catch(err => console.log(err));


        axios.get(`${SERVER_PORT}/role_active`)
            .then(res => (setRoleValues(res.data)))
            .catch(err => console.log(err));


        axios.get(`${SERVER_PORT}/edit_users/` + id)
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
                    Users_IsLocked: res.data[0].Users_IsLocked,
                    Users_PasswordExpiryDays: res.data[0].Users_PasswordExpiryDays,
                    Users_Lock_PastExpiration: res.data[0].Users_Lock_PastExpiration,
                    Users_KeepPasswordHistory: res.data[0].Users_KeepPasswordHistory,
                    Users_KeepPasswordHistoryCount: res.data[0].Users_KeepPasswordHistoryCount,
                    Users_LockOnFailedLogin: res.data[0].Users_LockOnFailedLogin,
                    Users_LockAfterFailedLogins: res.data[0].Users_LockAfterFailedLogins,
                    Users_Password_MinLength: res.data[0].Users_Password_MinLength,
                    Users_EnforcePasswordComplexity: res.data[0].Users_EnforcePasswordComplexity,
                    Users_RequiresPasswordChange: res.data[0].Users_RequiresPasswordChange,
                    Users_LastActivityDate: format(new Date(res.data[0].Users_LastActivityDate), 'yyyy-MM-dd'),
                    Users_Status: res.data[0].Users_Status,


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

                    axios.put(`${SERVER_PORT}/useredit/${setDisplayValues.DisplayValues}/` + id, values)
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
                <div className="d-flex align-items-center" style={{ background: '#6c757d', color: 'white', fontSize: '20px', padding: '8px 16px', borderRadius: '4px 4px 0 0', marginTop: '24px' }}>
                    Users Detail
                </div>
                <div style={{ borderTop: "2px solid gray", marginBottom: '16px' }}></div>

                <Form onSubmit={handleSubmit} >
                    <Row className="mb-3 align-items-end">
                        <Col md={4}>
                            <Form.Group controlId="Users_LoginID" onChange={e => setUserValues({ ...values, Users_LoginID: e.target.value })}  >
                                <Form.Label className="label-style">Login ID<span className="star"></span></Form.Label>
                                <Form.Control type="text" name="Users_LoginID" required defaultValue={values.Users_LoginID}
                                    title='please enter User Login ID'
                                />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group controlId="Users_Password">
                                <Link to={`/Password/${editid}`}>
                                    <Button variant="primary" className="bi bi-lock-fill p-2">
                                        Change password
                                    </Button>
                                </Link>
                            </Form.Group>
                        </Col>
                        <Col md={2}>
                            <Form.Group controlId="Module_ID" >
                                <Form.Label className="label-style">Title<span className="star"></span></Form.Label>
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
                        <Col md={2}>
                            <Form.Group controlId="Users_Status">
                                <Form.Label className="label-style">Status</Form.Label>
                                <div className="form-check form-switch">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        role="switch"
                                        id="flexSwitchCheckChecked"
                                        checked={values.Users_Status} onChange={activestatusCheckboxChange}
                                        name="Users_Status"
                                    />
                                    <label
                                        className="label-style"
                                        htmlFor="flexSwitchCheckChecked"

                                    >
                                        {values.Users_Status ? 'On' : 'Off'}
                                    </label>
                                </div>
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row className="mb-4">
                        <Col md={4}>
                            <Form.Group controlId="Users_email" onChange={e => setUserValues({ ...values, Users_FirstName: e.target.value })}  >
                                <Form.Label className="label-style"> First Name<span className="star"></span></Form.Label>
                                <Form.Control type="text" name="Users_FirstName" required defaultValue={values.Users_FirstName}
                                    title='please enter Users FirstName'
                                />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group controlId="Users_LastName" onChange={e => setUserValues({ ...values, Users_LastName: e.target.value })}>
                                <Form.Label className="label-style" > Last Name<span className="star"></span></Form.Label>
                                <Form.Control type="text" name="Users_LastName" defaultValue={values.Users_LastName}
                                    title='Enter Users LastName'
                                />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group controlId="Users_email" onChange={e => setUserValues({ ...values, Users_email: e.target.value })}  >
                                <Form.Label className="label-style" > Email<span className="star"></span></Form.Label>
                                <Form.Control type="email" name="Users_email" required defaultValue={values.Users_email}
                                    title='please enter User Email'
                                />
                            </Form.Group>
                        </Col>


                    </Row>
                    <Row className="mb-2">
                        <Col md={2}>
                            <Form.Group controlId="Users_Mobile" onChange={e => setUserValues({ ...values, Users_Mobile: e.target.value })}  >
                                <Form.Label className="label-style" >Mobile<span className="star"></span></Form.Label>
                                <Form.Control type="tel" name="Users_Mobile" required defaultValue={values.Users_Mobile}
                                    minLength={10} maxLength={15}
                                    title='please enter Users Mobile'
                                />
                            </Form.Group>
                        </Col>
                        <Col md={2}>
                            <Form.Group controlId="Users_IsLocked">
                                <Form.Label className="label-style" > Is Locked</Form.Label>
                                <div className="form-check form-switch">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        role="switch"
                                        id="flexSwitchCheckChecked"
                                        checked={values.Users_IsLocked} onChange={userislockedCheckboxChange}
                                        name="Users_IsLocked"
                                    />
                                    <label
                                        className="label-style"
                                        htmlFor="flexSwitchCheckChecked"

                                    >
                                        {values.Users_IsLocked ? 'On' : 'Off'}
                                    </label>
                                </div>
                            </Form.Group>
                        </Col>
                        <Col md={2}>
                            <Form.Group controlId="Users_LastActivityDate" onChange={e => setUserValues({ ...values, Users_LastActivityDate: new Date(e.target.value) })}  >
                                <Form.Label className="label-style" > Last Activity Date</Form.Label>
                                <Form.Control type="date" name="Users_LastActivityDate" defaultValue={values.Users_LastActivityDate ? format(new Date(values.Users_LastActivityDate), 'yyyy-MM-dd') : ''}
                                    disabled
                                />
                            </Form.Group>
                        </Col>
                        <Col md={2}>
                            <Form.Group controlId="Users_LastUpdatedDate" onChange={e => setUserValues({ ...values, Users_LastUpdatedDate: e.target.value })}>
                                <Form.Label className="label-style" > Last Updated Date{/* <span className="star"></span> */}</Form.Label>
                                <Form.Control type="date" name="Users_LastUpdatedDate"
                                    defaultValue={values.Users_LastUpdatedDate}
                                    disabled
                                    title='Enter Users LastUpdatedDate'
                                />

                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group controlId="Users_PasswordExpireDate" onChange={e => setUserValues({ ...values, Users_PasswordExpireDate: e.target.value })}  >
                                <Form.Label className="label-style" > Password Expire Date</Form.Label>
                                <Form.Control type="date" name="Users_PasswordExpireDate"
                                    defaultValue={values.Users_PasswordExpireDate ? values.Users_PasswordExpireDate : ''}
                                    disabled
                                    title='please enter Users Password Expire Date'
                                />
                            </Form.Group>
                        </Col>

                    </Row>

                    <div className="d-flex align-items-center" style={{ background: '#6c757d', color: 'white', fontSize: '20px', padding: '8px 16px', borderRadius: '4px 4px 0 0', marginTop: '24px' }}>
                        Enforce Complexity
                    </div>
                    <div style={{ borderTop: "2px solid gray", marginBottom: '16px' }}></div>

                    <Row className="mb-3">
                        <Col md={4}>
                            <Form.Group controlId="Users_PasswordExpiryDays" onChange={e => setUserValues({ ...values, Users_PasswordExpiryDays: e.target.value })}  >
                                <Form.Label className="label-style"> Password Expiry Days</Form.Label>
                                <Form.Control type="number" name="Users_PasswordExpiryDays" defaultValue={values.Users_PasswordExpiryDays}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group controlId="Users_Lock_PastExpiration" onChange={e => setUserValues({ ...values, Users_Lock_PastExpiration: e.target.value })}  >
                                <Form.Label className="label-style"> Lock Past Expiration</Form.Label>
                                <Form.Control type="text" name="Users_Lock_PastExpiration" defaultValue={values.Users_Lock_PastExpiration}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group controlId="Users_RequiresPasswordChange">
                                <Form.Label className="label-style" > Requires Password Change</Form.Label>
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
                    <Row className="mb-3">
                        <Col md={4}>
                            <Form.Group controlId="Users_EnforcePasswordComplexity">
                                <Form.Label className="label-style"> Enforce Password Complexity</Form.Label>
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
                                <Form.Label className="label-style"> Keep Password History</Form.Label>
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
                                <Form.Label className="label-style"> Lock-On Failed Login</Form.Label>
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
                    <Row className="mb-2">
                        <Col md={4}>
                            <Form.Group controlId="Users_Password_MinLength" onChange={e => setUserValues({ ...values, Users_Password_MinLength: e.target.value })}  >
                                <Form.Label className="label-style"> Password MinLength</Form.Label>
                                <Form.Control type="number" name="Users_Password_MinLength" defaultValue={values.Users_Password_MinLength}
                                    disabled={userspasswordminLength == true ? true : false}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group controlId="Users_KeepPasswordHistoryCount" onChange={e => setUserValues({ ...values, Users_KeepPasswordHistoryCount: e.target.value })}  >
                                <Form.Label className="label-style"> Keep Password History Count</Form.Label>
                                <Form.Control type="number" name="Users_KeepPasswordHistoryCount" defaultValue={values.Users_KeepPasswordHistoryCount}
                                    disabled={userskeeppasswordHistory == true ? true : false}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group controlId="Users_LockAfterFailedLogins" onChange={e => setUserValues({ ...values, Users_LockAfterFailedLogins: e.target.value })}  >
                                <Form.Label className="label-style"> Lock After Failed Logins</Form.Label>
                                <Form.Control type="number" name="Users_LockAfterFailedLogins" defaultValue={values.Users_KeepPasswordHistoryCount}
                                    disabled={userslockafterfailedLogins == true ? true : false}
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                    <div className="d-flex justify-content-end mt-3">
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

export default EditUsersModel;