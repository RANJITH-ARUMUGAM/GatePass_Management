import React, { useState, useEffect } from "react";
import axios from "axios";
import { Form, Button, Row, Col } from "react-bootstrap";
import "./Edituser.css";
// import { useParams } from "react-router-dom";
import { useLocation } from "react-router-dom";
import CustomAlert from "../../../CustomAlert"
import { SERVER_PORT } from '../../../constant';



export default function Edituser({setTitle}) {

  const [alerts, setAlerts] = useState([]);
  const today = new Date().toISOString().split('T')[0];
  const showAlert = (type, title, message) => {
    const newAlert = { id: Date.now(), type, title, message };
    setAlerts([...alerts, newAlert]);

    setTimeout(() => {
      setAlerts((prevAlerts) => prevAlerts.filter((alert) => alert.id !== newAlert.id));
    }, 3000);
  };

  // const {userId} = useParams(); // we are getting data from URL.
  const location = useLocation();
  const userId = location.state?.userId;
  if (!userId) {
    console.log("no usser id found in navication state")
  }

  // const today = new Date();
  // const date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
  const [formData, setFormData] = useState({
    adm_users_id: "",
    adm_users_loginid: "",
    adm_users_password: "",
    adm_users_email: "",
    adm_users_title: "",
    adm_users_firstname: "",
    adm_users_lastname: "",
    adm_users_mobile: "",
    adm_users_profileImage:"",
    adm_users_address1: "",
    adm_users_address2: "",
    adm_users_address3: "",
    adm_users_dob: "",
    adm_users_gender: "",
    adm_users_phoneextn: "",
    adm_users_deptid: "",
    adm_users_jobid: "",
    adm_users_positionid: "",
    adm_users_islocked: false,
    adm_users_defaultroleid: "",
    adm_users_lastactivitydate: "",
    adm_users_status: false,
    created_on: "",
    created_by: "",
    modified_on:"",
    modified_by: "Admin",
  });

  const titles = ['Mr.', 'Ms.', 'Mrs.'];
  const gender = ['Male', 'Female', 'Others'];
  const department = ['Accounts','Technical','Production'];
  const job = ['Developer','Tester','Designer'];
  const position = ['Full-Time', 'Part-Time', 'Contract'];

  useEffect(() => {
  setTitle("Edit User Details");
    if (userId) {
      axios.get(`${SERVER_PORT}/userlist_getalldatabyid/${userId}`)
        .then(response => setFormData(response.data))
        .catch(error => console.error("Error fetching user data:",error));
    }
  }, [userId]);


  const handleDataChange = (e) => {
    const { name, type, checked, value } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
  };






  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior

    if (!userId) {
      console.error("Error: User ID is missing.");
      alert("Error: User ID is missing.");
      return;
    }

    setFormData(prev => ({
      ...prev,
      modified_on: today
    }));

    console.log(formData);
      try {
      const response = await axios.put(`${SERVER_PORT}/userlist_editusers/${userId}`, formData);

      console.log("Server Response:", response.data); // Log the server response
      showAlert("success", "Success!", "User updated sucessfully..");
    } catch (error) {
      console.error("Error updating user:", error);

      if (error.response) {
        // Server responded with a status code other than 2xx
        console.error("Server Error Response:", error.response.data);
        showAlert("error", "Error",`Update failed: ${error.response.data.error || "Server error"}`);
      } else if (error.request) {
        // Request was made but no response received
        console.error("No response received from server.");
        showAlert("error", "Error","Check your connection.");
      } else {
        // Other errors
        console.error("Request setup error:", error.message);
        showAlert("error", "Error","Something went wrong.");
      }
    }
  };

  return (
    <div className="edit-container">
      <Form onSubmit={handleSubmit}>
        <div className="edit-right-section">
          {/* Common Details Section */}
          <div className="section common-details">
            <h4>User Details</h4>
            <Row>
              <Col><Form.Group className="edit-form-group"><Form.Label className="edit-form-label">Username</Form.Label><Form.Control className="edit-form-control" type="text" name="adm_users_loginid" value={formData.adm_users_loginid} disabled/></Form.Group></Col>
              <Col><Form.Group className="edit-form-group"><Form.Label className="edit-form-label">Email</Form.Label><Form.Text className="text-danger">*</Form.Text><Form.Control className="edit-form-control" type="text" name="adm_users_email" value={formData.adm_users_email} minLength={4} maxLength={25} onChange={handleDataChange} required/></Form.Group></Col>
              <Col><Form.Group className="edit-form-group"><Form.Label className="edit-form-label">Mobile</Form.Label><Form.Text className="text-danger">*</Form.Text><Form.Control className="edit-form-control" type="text" name="adm_users_mobile" value={formData.adm_users_mobile} minLength={10} maxLength={10} onChange={handleDataChange} required/></Form.Group></Col>
              <Col><Form.Group className="edit-form-group"><Form.Label className="edit-form-label">Title</Form.Label><Form.Text className="text-danger">*</Form.Text><Form.Control className="edit-form-control" as="select" name="adm_users_title" value={formData.adm_users_title} onChange={handleDataChange} required><option value="">-- SELECT --</option>
              <option value="">-- SELECT --</option>
                {titles.map((title) => (
                  <option key={title} value={title}>{title}</option>
                ))}
              </Form.Control></Form.Group></Col>
              <Col><Form.Group className="edit-form-group"><Form.Label className="edit-form-label">First Name</Form.Label><Form.Text className="text-danger">*</Form.Text><Form.Control className="edit-form-control" type="text" name="adm_users_firstname" value={formData.adm_users_firstname} minLength={4} maxLength={25} onChange={handleDataChange} required/></Form.Group></Col>
              <Col><Form.Group className="edit-form-group"><Form.Label className="edit-form-label">Last Name</Form.Label><Form.Text className="text-danger">*</Form.Text><Form.Control className="edit-form-control" type="text" name="adm_users_lastname" value={formData.adm_users_lastname} minLength={4} maxLength={25} onChange={handleDataChange} required/></Form.Group></Col>
              <Col><Form.Group className="edit-form-group"><Form.Label className="edit-form-label">Gender</Form.Label><Form.Text className="text-danger">*</Form.Text><Form.Control className="edit-form-control" as="select" name="adm_users_gender" value={formData.adm_users_gender} onChange={handleDataChange} required>
              <option value="">-- SELECT --</option>
                {gender.map((gen) => (
                  <option key={gen} value={gen}>{gen}</option>
                ))}</Form.Control></Form.Group></Col>
              <Col><Form.Group className="edit-form-group"><Form.Label className="edit-form-label">Date of Birth</Form.Label><Form.Text className="text-danger">*</Form.Text><Form.Control className="edit-form-control" type="date" name="adm_users_dob" max={today} value={formData.adm_users_dob} onChange={handleDataChange} /></Form.Group></Col>
            </Row>
          </div>

          {/* Address Details */}
          <div className="section address-details">
            <h4>Address Details</h4>
            <Row>
              <Col><Form.Group className="edit-form-group"><Form.Label className="edit-form-label">Address 1</Form.Label><Form.Text className="text-danger">*</Form.Text><Form.Control className="edit-form-control" type="text" name="adm_users_address1" value={formData.adm_users_address1} maxLength={25} onChange={handleDataChange} required/></Form.Group></Col>
              <Col><Form.Group className="edit-form-group"><Form.Label className="edit-form-label">Address 2</Form.Label><Form.Control className="edit-form-control" type="text" name="adm_users_address2" value={formData.adm_users_address2} maxLength={25} onChange={handleDataChange}/></Form.Group></Col>
              <Col><Form.Group className="edit-form-group"><Form.Label className="edit-form-label">Address 3</Form.Label><Form.Control className="edit-form-control" type="text" name="adm_users_address3" value={formData.adm_users_address3} maxLength={25} onChange={handleDataChange} /></Form.Group></Col>
            </Row>
          </div>

          {/* Employee Details */}
          <div className="section employee-details">
            <h4>Job Role Details</h4>
            <Row>
              <Col><Form.Group className="edit-form-group"><Form.Label className="edit-form-label">Department</Form.Label><Form.Text className="text-danger">*</Form.Text><Form.Control className="edit-form-control" as="select" name="adm_users_deptid" value={formData.adm_users_deptid} onChange={handleDataChange} required>
              <option value="">-- SELECT --</option>
                {department.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}</Form.Control></Form.Group></Col>
                <Col><Form.Group className="edit-form-group"><Form.Label className="edit-form-label">Job</Form.Label><Form.Text className="text-danger">*</Form.Text><Form.Control className="edit-form-control" as="select" name="adm_users_jobid" value={formData.adm_users_jobid} onChange={handleDataChange} required>
                <option value="">-- SELECT --</option>
                {job.map((jobid) => (
                  <option key={jobid} value={jobid}>{jobid}</option>
                ))}</Form.Control></Form.Group></Col>
                <Col><Form.Group className="edit-form-group"><Form.Label className="edit-form-label">Position</Form.Label><Form.Text className="text-danger">*</Form.Text><Form.Control className="edit-form-control" as="select" name="adm_users_positionid" value={formData.adm_users_positionid} onChange={handleDataChange} required>
                <option value="">-- SELECT --</option>
                {position.map((positionid) => (
                  <option key={positionid} value={positionid}>{positionid}</option>
                ))}</Form.Control></Form.Group></Col>
              <Col><Form.Group className="edit-form-group"><Form.Label className="edit-form-label">Phone Extension</Form.Label><Form.Text className="text-danger">*</Form.Text><Form.Control className="edit-form-control" type="text" name="adm_users_phoneextn" value={formData.adm_users_phoneextn} onChange={handleDataChange} required/></Form.Group></Col>
            </Row>
          </div>

          {/* User Activity */}
          <div className="section user-activity">
            <h4>Account Status</h4>
            <Row>
              <Col>
                <Form.Group className="edit-form-group">
                  <Form.Label className="edit-form-label">Is Locked</Form.Label>
                  <Form.Check
                    type="switch"
                    id="adm_users_islocked"
                    label={formData.adm_users_islocked ? "Locked" : "Unlocked"}
                    checked={formData.adm_users_islocked}
                    onChange={(e) => setFormData({ ...formData, adm_users_islocked: e.target.checked })}
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group className="edit-form-group">
                  <Form.Label className="edit-form-label">Status</Form.Label>
                  <Form.Check
                    type="switch"
                    id="adm_users_status"
                    label={formData.adm_users_status ? "Active" : "Inactive"}
                    checked={formData.adm_users_status}
                    onChange={(e) => setFormData({ ...formData, adm_users_status: e.target.checked })}
                  />
                </Form.Group>
              </Col>

            </Row>
          </div>

        </div>
        <Col>
        <Button type="submit" className="mt-3 edit-btn" style={{ backgroundColor: "#3CB371" }}>Save</Button>
        <Button className="mt-3 edit-btn" style={{ backgroundColor: "#E53935" }} onClick={() => window.history.back()}>Cancel</Button>
        </Col>
      </Form>
      <div style={{ padding: "20px" }}>

{/* Render alerts dynamically */}
{alerts.map((alert) => (
  <CustomAlert key={alert.id} {...alert} onClose={() => setAlerts(alerts.filter((a) => a.id !== alert.id))} />
))}
</div>
    </div>
  );
}
