import React, { useState, useRef, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Alert, Card, Spinner, Modal, InputGroup } from 'react-bootstrap';
import { BsCamera, BsArrowRepeat, BsPerson, BsBuilding, BsCardText, BsShield, BsCheckCircle } from 'react-icons/bs';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { SERVER_PORT } from '../../../constant';



const AddGateEntry = ({ setTitle }) => {

  useEffect(() => {
    setTitle("Gate");
  }, [setTitle]);

  const navigate = useNavigate();
  const initialVisitorState = {
  GMS_VisitorName: '',
  GMS_VisitorFrom: '',
  GMS_ToMeet: '',
  GMS_ToMeetEmail: '',
  GMS_VisitPurpose: '',
  GMS_VehicleNo: '',
  GMS_IdentificationType: '',
  GMS_IdentificationNo: '',
  GMS_MobileNo: '',
  GMS_EmailID: '',
  GMS_VisitorImage: null
  };

  const [visitor, setVisitor] = useState(initialVisitorState);
  const [errors, setErrors] = useState({});
  const [showCamera, setShowCamera] = useState(false);
  const [error, setError] = useState('');
  const [submissionStatus, setSubmissionStatus] = useState('');
  const [visitorId, setVisitorId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cameraPermission, setCameraPermission] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // OTP State
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [email, setEmail] = useState('');
  const [enteredOTP, setEnteredOTP] = useState('');
  const [otpError, setOtpError] = useState('');
  const [isOtpSending, setIsOtpSending] = useState(false);
  const [isOtpVerifying, setIsOtpVerifying] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);

  // For mobile OTP
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpInputRefs = useRef([]);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const formRef = useRef(null);


  // Timer for resend OTP
  useEffect(() => {
    let timer;
    if (otpTimer > 0) {
      timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [otpTimer]);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get(`${SERVER_PORT}/gettingemailsfromtwotable`);
        const formatted = response.data.map(emp => ({
          id: emp.user_id,
          name: emp.name,
          email: emp.email,
          type: emp.user_type
        }));
        setEmployees(formatted);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching users:', error);
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  const handleEmployeeSelect = (e) => {
    const selectedName = e.target.value;
    const selectedEmployee = employees.find(emp => emp.name === selectedName);

    if (selectedEmployee) {
      setVisitor(prev => ({
        ...prev,
        GMS_ToMeet: selectedEmployee.name,
        GMS_ToMeetEmail: selectedEmployee.email
      }));
    } else {
      setVisitor(prev => ({
        ...prev,
        GMS_ToMeet: '',
        GMS_ToMeetEmail: ''
      }));
    }
  };

  const startCamera = async () => {
    setShowCamera(true);
    setError('');

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }

    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasCameraPermission = devices.some(device => device.kind === 'videoinput');

      if (!hasCameraPermission) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" }
        });
        stream.getTracks().forEach(track => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setCameraPermission(true);
      }
    } catch (err) {
      console.error("Camera error:", err);
      let errorMsg = "Unable to access camera.";

      if (err.name === 'NotAllowedError') {
        errorMsg = "Camera permission denied. Please allow camera access in your browser settings.";
      } else if (err.name === 'NotFoundError' || err.name === 'OverconstrainedError') {
        errorMsg = "No compatible camera found.";
      }

      setError(errorMsg);
      setCameraPermission(false);
      setShowCamera(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);

    const imgData = canvas.toDataURL('image/jpeg', 0.8);
    setVisitor(prev => ({ ...prev, GMS_VisitorImage: imgData }));
    stopCamera();
  };

  const retakePhoto = () => {
    setVisitor(prev => ({ ...prev, GMS_VisitorImage: null }));
    startCamera();
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setVisitor(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!visitor.GMS_VisitorName.trim()) newErrors.GMS_VisitorName = 'Name is required';
    if (!visitor.GMS_MobileNo.trim()) {
      newErrors.GMS_MobileNo = 'Phone number is required';
    } else if (!/^[0-9]{10}$/.test(visitor.GMS_MobileNo.trim())) {
      newErrors.GMS_MobileNo = 'Enter a valid 10-digit phone number';
    }
    if (visitor.GMS_EmailID && !/^\S+@\S+\.\S+$/.test(visitor.GMS_EmailID)) {
      newErrors.GMS_EmailID = 'Invalid email address';
    }
    if (!visitor.GMS_VisitorImage) newErrors.GMS_VisitorImage = 'Photo is required';
    if (!visitor.GMS_VisitPurpose.trim()) newErrors.GMS_VisitPurpose = 'Purpose is required';
    if (!visitor.GMS_ToMeet.trim()) newErrors.GMS_ToMeet = 'Person to meet is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  

const handleSubmit = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);
  setError('');
  setSubmissionStatus('');

  if (!validateForm()) {
    setIsSubmitting(false);
    const firstErrorField = Object.keys(errors)[0];
    const errorElement = document.querySelector(`[name="${firstErrorField}"]`);
    if (errorElement) errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  try {
    const submissionData = {
      ...visitor,
      entry_timestamp: new Date().toISOString(),
      created_by: 'admin'
    };

    const response = await axios.post(`${SERVER_PORT}/visitorgateentry`, submissionData);

    if (response.data.success) {
      const newVisitorId = response.data.visitorId;
      setVisitorId(newVisitorId);

      // ✅ Visitor Email (confirmation)
      const emailData = {
    from: "arunpanneer.t@gmail.com",
    to: visitor.GMS_EmailID,
    cc: visitor.GMS_ToMeetEmail,
    subject: "Visitor Pass Confirmation",
    html: `
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          color: #333;
        }
        .container {
          max-width: 600px;
          margin: auto;
          padding: 20px;
        }
        .title {
          font-size: 20px;
          font-weight: bold;
          margin-bottom: 15px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
          border: 1px solid #ddd;
        }
        th, td {
          padding: 10px;
          border: 1px solid #ddd;
          text-align: left;
        }
        th {
          background-color: #f8f8f8;
          color: #333;
        }
        .btn-link {
          display: inline-block;
          padding: 10px 18px;
          margin-top: 20px;
          background: #007b8f;
          color: #fff !important;
          text-decoration: none;
          border-radius: 5px;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <p>Dear ${visitor.GMS_VisitorName || 'Visitor'},</p>

        <p>Thank you for visiting <strong>Company</strong>. Below are your visitor details:</p>

        <table>
          <tr>
            <th>ID</th>
            <td>${visitor.id || 'N/A'}</td>
          </tr>
          <tr>
            <th>Name</th>
            <td>${visitor.GMS_VisitorName || 'N/A'}</td>
          </tr>
          <tr>
            <th>Company/From</th>
            <td>${visitor.GMS_VisitorFrom || 'N/A'}</td>
          </tr>
          <tr>
            <th>To Meet</th>
            <td>${visitor.GMS_ToMeet || 'N/A'}</td>
          </tr>
          <tr>
            <th>Purpose</th>
            <td>${visitor.GMS_VisitPurpose || 'N/A'}</td>
          </tr>
          <tr>
            <th>Visit Date</th>
            <td>${new Date(visitor.created_on).toLocaleDateString('en-IN')}</td>
          </tr>
          <tr>
            <th>Time In</th>
            <td>${new Date(visitor.created_on).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</td>
          </tr>
        </table>

        <p style="margin-top: 20px;">You may access your digital visitor ID using the button below:</p>

        <a href="http://43.205.144.64:3000/" class="btn-link">View Visitor Pass</a>

        <p style="margin-top: 40px;">Regards,<br><strong>Security Team</strong></p>
      </div>
    </body>
    </html>
  `
  };

      await axios.post(`${SERVER_PORT}/sendEmail`, emailData);

      // ✅ Employee Email (notification)
      const employeeMailOptions = {
        from: "arunpanneer.t@gmail.com",
        to: visitor.GMS_ToMeetEmail,
        subject: `Visitor Arrival Notification - ${visitor.GMS_VisitorName}`,
        html: `
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { max-width: 650px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; }
            h2 { color: #007b8f; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { padding: 10px; border: 1px solid #ddd; text-align: left; }
            th { background-color: #f8f8f8; color: #333; }
            .photo { margin-top: 20px; text-align: center; }
            .photo img { max-width: 150px; border-radius: 8px; border: 1px solid #ccc; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Visitor Arrival Notification</h2>
            <p>Dear ${visitor.GMS_ToMeet || 'Employee'},</p>
            <p>This is to inform you that a visitor has arrived to meet you. Please find their details below:</p>

            <table>
              <tr><th>Visitor ID</th><td>${newVisitorId || 'N/A'}</td></tr>
              <tr><th>Name</th><td>${visitor.GMS_VisitorName || 'N/A'}</td></tr>
              <tr><th>Company/From</th><td>${visitor.GMS_VisitorFrom || 'N/A'}</td></tr>
              <tr><th>Purpose of Visit</th><td>${visitor.GMS_VisitPurpose || 'N/A'}</td></tr>
              <tr><th>Visit Date</th><td>${new Date().toLocaleDateString('en-IN')}</td></tr>
              <tr><th>Time In</th><td>${new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}</td></tr>
            </table>

            <div class="photo">
              <p><strong>Visitor Photo:</strong></p>
              ${visitor.GMS_VisitorImage ? `<img src="${visitor.GMS_VisitorImage}" alt="Visitor Photo" />` : 'No photo available'}
            </div>

            <p style="margin-top: 40px;">Regards,<br><strong>Security Desk</strong></p>
          </div>
        </body>
        </html>`
      };

      await axios.post(`${SERVER_PORT}/sendEmail`, employeeMailOptions);

      alert('✅ Both Visitor & Employee Emails Sent');
      setSubmissionStatus('success');
      navigate('/GenerateVisitorIDCard');
    } else {
      throw new Error(response.data.message || 'Submission failed');
    }
  } catch (error) {
    console.error('Submission error:', error);
    setSubmissionStatus('error');
    setError(error.response?.data?.message || error.message || 'Failed to submit visitor entry');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } finally {
    setIsSubmitting(false);
  }
};


  const resetForm = () => {
    setVisitor(initialVisitorState);
    setErrors({});
    setError('');
    setSubmissionStatus('');
    if (formRef.current) formRef.current.reset();
  };

  // Email OTP functions
  const sendOTP = async () => {
    setIsOtpSending(true);
    setOtpError('');
    try {
      // Replace with your API endpoint for sending OTP
      await axios.post(`${SERVER_PORT}/sendVisitorOTP`, { email });
      setOtpSent(true);
      setOtpTimer(60); // 60 seconds timer
    } catch (err) {
      setOtpError('Failed to send OTP. Please try again.');
    } finally {
      setIsOtpSending(false);
    }
  };

  const verifyOTP = async () => {
    setIsOtpVerifying(true);
    setOtpError('');
    try {
      const res = await axios.post(`${SERVER_PORT}/verifyVisitorOTP`, {
        email,
        otp: enteredOTP
      });
      if (res.data.success) {
        setOtpVerified(true);
        setOtpError('');
      } else {
        setOtpError(res.data.message || 'Invalid OTP. Please try again.');
      }
    } catch (err) {
      console.error('Error verifying OTP:', err);
      setOtpError('OTP verification failed.');
    } finally {
      setIsOtpVerifying(false);
    }
  };

  // Mobile OTP functions
  const sendOtp = async () => {
    setIsOtpSending(true);
    setOtpError('');
    try {
      await axios.post(`${SERVER_PORT}/sendMobileOtp`, { mobile: visitor.GMS_MobileNo });
      setShowOtpModal(true);
      setOtpTimer(60);
      setOtp(['', '', '', '', '', '']);
    } catch (err) {
      setOtpError('Failed to send OTP.');
    } finally {
      setIsOtpSending(false);
    }
  };

  const verifyOtp = async () => {
    setIsOtpVerifying(true);
    setOtpError('');
    try {
      const otpValue = otp.join('');
      const res = await axios.post(`${SERVER_PORT}/verifyMobileOtp`, { mobile: visitor.GMS_MobileNo, otp: otpValue });
      if (res.data.success) {
        setIsOtpVerified(true);
        setShowOtpModal(false);
        setOtpError('');
      } else {
        setOtpError('Invalid OTP. Please try again.');
      }
    } catch (err) {
      setOtpError('OTP verification failed.');
    } finally {
      setIsOtpVerifying(false);
    }
  };

  const resendOtp = async () => {
    setIsOtpSending(true);
    setOtpError('');
    try {
      await axios.post(`${SERVER_PORT}/sendMobileOtp`, { mobile: visitor.GMS_MobileNo });
      setOtpTimer(60);
      setOtp(['', '', '', '', '', '']);
    } catch (err) {
      setOtpError('Failed to resend OTP.');
    } finally {
      setIsOtpSending(false);
    }
  };

  const closeOtpModal = () => {
    setShowOtpModal(false);
    setOtpError('');
    setOtp(['', '', '', '', '', '']);
  };

  // OTP input handlers
  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
<Container fluid className="employee-container">

      {/* ✅ OTP Verification Step */}
      {!otpVerified && (
        <Card className="shadow-sm p-3 mb-3">
          <h4 className="text-center">Email Verification</h4>
          <Row className="justify-content-center">
            <Col md={6}>
              {!otpSent ? (
                <>
                  <Form.Group className="mb-3">
                    <Form.Label>Enter Email</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </Form.Group>
                  <div className="text-center">
                    <Button variant="primary" onClick={sendOTP}>
                      Send OTP
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <Form.Group className="mb-3">
                    <Form.Label>Enter OTP</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter OTP"
                      value={enteredOTP}
                      onChange={(e) => setEnteredOTP(e.target.value)}
                    />
                  </Form.Group>
                  <div className="text-center">
                    <Button variant="success" onClick={verifyOTP}>
                      Verify OTP
                    </Button>
                  </div>
                </>
              )}
            </Col>
          </Row>
        </Card>
      )}

      {/* ✅ Show Form ONLY if OTP verified */}
      {otpVerified && (
        <Container fluid className="employee-container">
          <Form ref={formRef} noValidate onSubmit={handleSubmit}>
            <Row>
              <Col lg={4} className="mb-3">
                <Card className="h-100 border-0 shadow-sm">
                  <h2 className="text-xl font-semibold mb-2 text-gray-800 text-center shadow">
                    <span className="d-flex align-items-center justify-content-center">
                      <BsPerson className="me-1" style={{ fontSize: '0.85rem' }} />
                      Visitor Photo
                    </span>
                  </h2>
                  <Card.Body className="d-flex flex-column justify-content-center align-items-center p-2">
                    {showCamera ? (
                      <div className="text-center w-100">
                        <div className="position-relative mb-2">
                          <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="border rounded w-100"
                            style={{ height: '280px', objectFit: 'cover' }}
                          />
                          <canvas ref={canvasRef} className="d-none" />
                        </div>

                        {cameraPermission === false && (
                          <Alert variant="warning" className="py-1" style={{ fontSize: '0.8rem' }}>
                            Camera permission denied. Please check your browser settings.
                          </Alert>
                        )}

                        <div className="d-flex justify-content-center gap-2">
                          <Button variant="success" onClick={capturePhoto} className="px-3 py-1" style={{ fontSize: '0.85rem' }}>
                            <span className="d-flex align-items-center"><BsCamera className="me-1" />Capture</span>
                          </Button>
                          <Button variant="outline-secondary" onClick={stopCamera} className="py-1" style={{ fontSize: '0.85rem' }}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : visitor.GMS_VisitorImage ? (
                      <div className="text-center w-100">
                        <div className="position-relative mb-2">
                          <img
                            src={visitor.GMS_VisitorImage}
                            alt="Visitor"
                            className="img-thumbnail mb-1"
                            style={{ height: '280px', width: '100%', objectFit: 'cover' }}
                          />
                        </div>
                        <Button variant="warning" onClick={retakePhoto} className="py-1" style={{ fontSize: '0.85rem' }}>
                          <span className="d-flex align-items-center justify-content-center"><BsArrowRepeat className="me-1" />Retake Photo</span>
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center w-100 p-2">
                        <div
                          className="border border-dashed d-flex flex-column justify-content-center align-items-center p-4 rounded-3 mb-2"
                          style={{ height: '293px', backgroundColor: '#f8f9fa', cursor: 'pointer' }}
                          onClick={startCamera}
                        >
                          <BsCamera size={40} className="mb-2 text-primary" />
                          <h2 className="text-sm font-semibold mb-2 p-2 text-gray-800 text-center shadow">No Photo Taken</h2>
                          <p className="text-muted mb-2" style={{ fontSize: '0.6rem' }}>Click to capture visitor photo</p>
                          <Button variant="primary" onClick={startCamera} className="py-1" style={{ fontSize: '0.65rem' }}>
                            Open Camera
                          </Button>
                        </div>
                        {errors.GMS_VisitorImage && (
                          <small className="text-danger d-block mt-1" style={{ fontSize: '0.75rem' }}>{errors.GMS_VisitorImage}</small>
                        )}
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>

              <Col lg={8}>
                <Card className="border-0 shadow-sm mb-3">
                  <h2 className="text-xl font-semibold mb-2 text-gray-800 text-center shadow">
                    <span className="d-flex align-items-center justify-content-center">
                      <BsPerson className="me-1" style={{ fontSize: '0.85rem' }} />
                      Personal Information
                    </span>
                  </h2>
                  <Card.Body className="p-2">
                    <Row>
                      <Col md={3}>
                        <Form.Group className="mb-2">
                          <Form.Label style={{ fontSize: '0.85rem' }}>Full Name <span className="text-danger">*</span></Form.Label>
                          <Form.Control
                            type="text"
                            name="GMS_VisitorName"
                            placeholder="Enter full name"
                            value={visitor.GMS_VisitorName}
                            onChange={handleChange}
                            isInvalid={!!errors.GMS_VisitorName}
                            size="sm"
                          />
                          <Form.Control.Feedback type="invalid" style={{ fontSize: '0.75rem' }}>
                            {errors.GMS_VisitorName}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      <Col md={3}>
                        <Form.Group className="mb-2">
                          <Form.Label style={{ fontSize: '0.85rem' }}>
                            Phone Number <span className="text-danger">*</span>
                          </Form.Label>
                          <InputGroup size="sm">
                            <Form.Control
                              type="tel"
                              name="GMS_MobileNo"
                              placeholder="10-digit phone"
                              value={visitor.GMS_MobileNo}
                              onChange={handleChange}
                              isInvalid={!!errors.GMS_MobileNo}
                              disabled={isOtpVerified}
                            />
                            <Button
                              variant={isOtpVerified ? "success" : "outline-primary"}
                              onClick={sendOtp}
                              disabled={isOtpSending || isOtpVerified || !visitor.GMS_MobileNo.trim()}
                              style={{ fontSize: '0.75rem' }}
                            >
                              {isOtpSending ? (
                                <Spinner as="span" animation="border" size="sm" />
                              ) : isOtpVerified ? (
                                <BsCheckCircle />
                              ) : (
                                <BsShield />
                              )}
                            </Button>
                          </InputGroup>
                          <Form.Control.Feedback type="invalid" style={{ fontSize: '0.75rem' }}>
                            {errors.GMS_MobileNo}
                          </Form.Control.Feedback>
                          {isOtpVerified && (
                            <small className="text-success" style={{ fontSize: '0.7rem' }}>✓ Verified</small>
                          )}
                        </Form.Group>
                      </Col>
                      <Col md={3}>
                        <Form.Group className="mb-2">
                          <Form.Label style={{ fontSize: '0.85rem' }}>Email ID</Form.Label>
                          <Form.Control
                            type="email"
                            name="GMS_EmailID"
                            placeholder="Enter email address"
                            value={visitor.GMS_EmailID}
                            onChange={handleChange}
                            isInvalid={!!errors.GMS_EmailID}
                            size="sm"
                          />
                          <Form.Control.Feedback type="invalid" style={{ fontSize: '0.75rem' }}>
                            {errors.GMS_EmailID}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      <Col md={3}>
                        <Form.Group className="mb-2">
                          <Form.Label style={{ fontSize: '0.85rem' }}>Organization/Company</Form.Label>
                          <Form.Control
                            type="text"
                            name="GMS_VisitorFrom"
                            placeholder="Company / Organization"
                            value={visitor.GMS_VisitorFrom}
                            onChange={handleChange}
                            size="sm"
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>

                <Card className="border-0 shadow-sm mb-3">
                  <h2 className="text-xl font-semibold mb-2 text-gray-800 text-center shadow">
                    <span className="d-flex align-items-center justify-content-center">
                      <BsBuilding className="me-1" style={{ fontSize: '0.85rem' }} />
                      Visit Details
                    </span>
                  </h2>
                  <Card.Body className="p-2">
                    <Row>
                      <Col md={4}>
                        <Form.Group className="mb-2">
                          <Form.Label style={{ fontSize: '0.85rem' }}>
                            To Meet <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Control
                            as="select"
                            name="GMS_ToMeet"
                            onChange={handleEmployeeSelect}
                            value={visitor.GMS_ToMeet || ''}
                            isInvalid={!!errors.GMS_ToMeet}
                            size="sm"
                          >
                            <option value="">-- Select Person --</option>
                            {employees.map(emp => (
                              <option key={emp.id} value={emp.name}>
                                {emp.name} ({emp.type})
                              </option>
                            ))}
                          </Form.Control>

                          <Form.Control.Feedback type="invalid" style={{ fontSize: '0.75rem' }}>
                            {errors.GMS_ToMeet}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>

                      <Col md={4}>
                        <Form.Group className="mb-2">
                          <Form.Label style={{ fontSize: '0.85rem' }}>To Meet Person Email <span className="text-danger">*</span></Form.Label>
                          <Form.Control
                            type="email"
                            name="GMS_ToMeetEmail"
                            placeholder="Email will auto-populate"
                            value={visitor.GMS_ToMeetEmail || ''}
                            onChange={handleChange}
                            isInvalid={!!errors.GMS_ToMeetEmail}
                            size="sm"
                            readOnly
                          />
                          <Form.Control.Feedback type="invalid" style={{ fontSize: '0.75rem' }}>
                            {errors.GMS_ToMeetEmail}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group className="mb-0">
                          <Form.Label style={{ fontSize: '0.85rem' }}>Purpose of Visit <span className="text-danger">*</span></Form.Label>
                          <Form.Control
                            type="text"
                            name="GMS_VisitPurpose"
                            placeholder="Meeting / Delivery / etc."
                            value={visitor.GMS_VisitPurpose}
                            onChange={handleChange}
                            isInvalid={!!errors.GMS_VisitPurpose}
                            size="sm"
                          />
                          <Form.Control.Feedback type="invalid" style={{ fontSize: '0.75rem' }}>
                            {errors.GMS_VisitPurpose}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>

                <Card className="border-0 shadow-sm">
                  <h2 className="text-xl font-semibold mb-2 text-gray-800 text-center shadow">
                    <span className="d-flex align-items-center justify-content-center">
                      <BsCardText className="me-1" style={{ fontSize: '0.85rem' }} />
                      Additional Information
                    </span>
                  </h2>
                  <Card.Body className="p-2">
                    <Row>
                      <Col md={4}>
                        <Form.Group className="mb-0">
                          <Form.Label style={{ fontSize: '0.85rem' }}>
                            Vehicle Number
                          </Form.Label>
                          <Form.Control
                            type="text"
                            name="GMS_VehicleNo"
                            placeholder="If applicable"
                            value={visitor.GMS_VehicleNo}
                            onChange={handleChange}
                            size="sm"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group className="mb-0">
                          <Form.Label style={{ fontSize: '0.85rem' }}>ID Type</Form.Label>
                          <Form.Select
                            name="GMS_IdentificationType"
                            value={visitor.GMS_IdentificationType}
                            onChange={handleChange}
                            size="sm"
                          >
                            <option value="">Select ID Type</option>
                            <option value="Aadhaar">Aadhaar Card</option>
                            <option value="Driving License">Driving License</option>
                            <option value="Passport">Passport</option>
                            <option value="Voter ID">Voter ID</option>
                            <option value="PAN Card">PAN Card</option>
                            <option value="Other">Other</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group className="mb-0">
                          <Form.Label style={{ fontSize: '0.85rem' }}>ID Number</Form.Label>
                          <Form.Control
                            type="text"
                            name="GMS_IdentificationNo"
                            placeholder="Enter ID number"
                            value={visitor.GMS_IdentificationNo}
                            onChange={handleChange}
                            size="sm"
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <div className="d-flex justify-content-end mt-3">
              <Button
                onClick={resetForm}
                className="px-3 py-2 me-3 text-white"
                style={{ backgroundColor: 'red', fontSize: '0.85rem', border: 'none' }}
              >
                Clear All
              </Button>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="px-3 py-2 text-white"
                style={{ backgroundColor: 'green', fontSize: '0.9rem', border: 'none' }}
              >
                {isSubmitting ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" className="me-1" /> Saving...
                  </>
                ) : (
                  'Save'
                )}
              </Button>
            </div>

          </Form>

          {/* OTP Verification Modal */}
          <Modal show={showOtpModal} onHide={closeOtpModal} centered backdrop="static">
            <Modal.Header>
              <Modal.Title className="d-flex align-items-center">
                <BsShield className="me-2 text-primary" />
                Mobile OTP Verification
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="text-center mb-3">
                <p className="mb-2">
                  We've sent a 6-digit verification code to
                </p>
                <strong className="text-primary">{visitor.GMS_MobileNo}</strong>
              </div>

              {otpError && (
                <Alert variant="danger" className="py-2 mb-3" style={{ fontSize: '0.85rem' }}>
                  {otpError}
                </Alert>
              )}

              <div className="d-flex justify-content-center mb-3">
                {otp.map((digit, index) => (
                  <Form.Control
                    key={index}
                    ref={el => otpInputRefs.current[index] = el}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="text-center mx-1"
                    style={{
                      width: '50px',
                      height: '50px',
                      fontSize: '1.2rem',
                      fontWeight: 'bold'
                    }}
                  />
                ))}
              </div>

              {otpTimer > 0 ? (
                <div className="text-center text-muted mb-3" style={{ fontSize: '0.9rem' }}>
                  Resend OTP in {formatTime(otpTimer)}
                </div>
              ) : (
                <div className="text-center mb-3">
                  <Button
                    variant="link"
                    onClick={resendOtp}
                    className="p-0"
                    style={{ fontSize: '0.9rem' }}
                  >
                    Didn't receive OTP? Resend
                  </Button>
                </div>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="outline-secondary" onClick={closeOtpModal}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={verifyOtp}
                disabled={isOtpVerifying || otp.join('').length !== 6}
              >
                {isOtpVerifying ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" className="me-1" />
                    Verifying...
                  </>
                ) : (
                  'Verify OTP'
                )}
              </Button>
            </Modal.Footer>
          </Modal>
        </Container>
      )}
    </Container>
  );
};

export default AddGateEntry;

//   import React, { useState, useRef, useEffect } from 'react';
// import { Form, Button, Container, Row, Col, Alert, Card, Spinner, Modal, InputGroup } from 'react-bootstrap';
// import { BsCamera, BsArrowRepeat, BsPerson, BsBuilding, BsCardText, BsShield, BsCheckCircle } from 'react-icons/bs';
// import axios from 'axios';
// import { useNavigate } from "react-router-dom";

// // Mock SERVER_PORT - replace with your actual constant
// const SERVER_PORT = 'http://localhost:5000';

// const AddGateEntry = ({ setTitle }) => {
//   useEffect(() => {
//     setTitle("Gate");
//   }, [setTitle]);

//   const navigate = useNavigate();
//   const initialVisitorState = {
//     GMS_VisitorName: '',
//     GMS_VisitorFrom: '',
//     GMS_ToMeet: '',
//     GMS_ToMeetEmail: '',
//     GMS_VisitPurpose: '',
//     GMS_VehicleNo: '',
//     GMS_IdentificationType: '',
//     GMS_IdentificationNo: '',
//     GMS_MobileNo: '',
//     GMS_EmailID: '',
//     GMS_VisitorImage: null
//   };

//   const [visitor, setVisitor] = useState(initialVisitorState);
//   const [errors, setErrors] = useState({});
//   const [showCamera, setShowCamera] = useState(false);
//   const [error, setError] = useState('');
//   const [submissionStatus, setSubmissionStatus] = useState('');
//   const [visitorId, setVisitorId] = useState('');
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [cameraPermission, setCameraPermission] = useState(null);
//   const [employees, setEmployees] = useState([]);
//   const [loading, setLoading] = useState(true);
  
//   // OTP related states
//   const [showOtpModal, setShowOtpModal] = useState(false);
//   const [otp, setOtp] = useState(['', '', '', '', '', '']);
//   const [isOtpVerified, setIsOtpVerified] = useState(false);
//   const [isOtpSending, setIsOtpSending] = useState(false);
//   const [isOtpVerifying, setIsOtpVerifying] = useState(false);
//   const [otpTimer, setOtpTimer] = useState(0);
//   const [generatedOtp, setGeneratedOtp] = useState('');
//   const [otpError, setOtpError] = useState('');

//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);
//   const streamRef = useRef(null);
//   const formRef = useRef(null);
//   const otpInputRefs = useRef([]);

//   // Timer effect for OTP
//   useEffect(() => {
//     let interval = null;
//     if (otpTimer > 0) {
//       interval = setInterval(() => {
//         setOtpTimer(timer => timer - 1);
//       }, 1000);
//     }
//     return () => clearInterval(interval);
//   }, [otpTimer]);

//   useEffect(() => {
//     return () => {
//       if (streamRef.current) {
//         streamRef.current.getTracks().forEach(track => track.stop());
//       }
//     };
//   }, []);

//   useEffect(() => {
//     const fetchEmployees = async () => {
//       try {
//         // Mock employees data - replace with actual API call
//         const mockEmployees = [
//           { id: 1, name: 'John Doe', email: 'john@company.com', user_type: 'Manager' },
//           { id: 2, name: 'Jane Smith', email: 'jane@company.com', user_type: 'Developer' },
//           { id: 3, name: 'Bob Johnson', email: 'bob@company.com', user_type: 'HR' }
//         ];
        
//         const formatted = mockEmployees.map(emp => ({
//           id: emp.id,
//           name: emp.name,
//           email: emp.email,
//           type: emp.user_type
//         }));
//         setEmployees(formatted);
//         setLoading(false);
//       } catch (error) {
//         console.error('Error fetching users:', error);
//         setLoading(false);
//       }
//     };

//     fetchEmployees();
//   }, []);

//   const handleEmployeeSelect = (e) => {
//     const selectedName = e.target.value;
//     const selectedEmployee = employees.find(emp => emp.name === selectedName);

//     if (selectedEmployee) {
//       setVisitor(prev => ({
//         ...prev,
//         GMS_ToMeet: selectedEmployee.name,
//         GMS_ToMeetEmail: selectedEmployee.email
//       }));
//     } else {
//       setVisitor(prev => ({
//         ...prev,
//         GMS_ToMeet: '',
//         GMS_ToMeetEmail: ''
//       }));
//     }
//   };

//   // OTP Functions
//   const generateOtp = () => {
//     return Math.floor(100000 + Math.random() * 900000).toString();
//   };

//   const sendOtp = async () => {
//     if (!visitor.GMS_MobileNo.trim() || !/^[0-9]{10}$/.test(visitor.GMS_MobileNo.trim())) {
//       setOtpError('Please enter a valid 10-digit mobile number first');
//       return;
//     }

//     setIsOtpSending(true);
//     setOtpError('');
    
//     try {
//       const newOtp = generateOtp();
//       setGeneratedOtp(newOtp);
      
//       // In a real implementation, you would send OTP via SMS API
//       // For demo purposes, we'll just log it
//       console.log('OTP sent to', visitor.GMS_MobileNo, ':', newOtp);
      
//       // Mock API call - replace with actual SMS service
//       // await axios.post(`${SERVER_PORT}/send-otp`, {
//       //   mobile: visitor.GMS_MobileNo,
//       //   otp: newOtp
//       // });
      
//       setShowOtpModal(true);
//       setOtpTimer(300); // 5 minutes
//       alert(`OTP sent to ${visitor.GMS_MobileNo}. For demo: ${newOtp}`);
      
//       // Focus first OTP input
//       setTimeout(() => {
//         if (otpInputRefs.current[0]) {
//           otpInputRefs.current[0].focus();
//         }
//       }, 100);
      
//     } catch (error) {
//       console.error('Error sending OTP:', error);
//       setOtpError('Failed to send OTP. Please try again.');
//     } finally {
//       setIsOtpSending(false);
//     }
//   };

//   const handleOtpChange = (index, value) => {
//     if (!/^\d*$/.test(value)) return; // Only allow digits
    
//     const newOtp = [...otp];
//     newOtp[index] = value;
//     setOtp(newOtp);
//     setOtpError('');

//     // Auto-focus next input
//     if (value && index < 5) {
//       otpInputRefs.current[index + 1]?.focus();
//     }
//   };

//   const handleOtpKeyDown = (index, e) => {
//     // Handle backspace
//     if (e.key === 'Backspace' && !otp[index] && index > 0) {
//       otpInputRefs.current[index - 1]?.focus();
//     }
//   };

//   const verifyOtp = async () => {
//     const enteredOtp = otp.join('');
    
//     if (enteredOtp.length !== 6) {
//       setOtpError('Please enter complete OTP');
//       return;
//     }

//     setIsOtpVerifying(true);
//     setOtpError('');

//     try {
//       // In real implementation, verify OTP with backend
//       if (enteredOtp === generatedOtp) {
//         setIsOtpVerified(true);
//         setShowOtpModal(false);
//         setOtp(['', '', '', '', '', '']);
//         alert('Mobile number verified successfully!');
//       } else {
//         setOtpError('Invalid OTP. Please try again.');
//       }
//     } catch (error) {
//       console.error('Error verifying OTP:', error);
//       setOtpError('Failed to verify OTP. Please try again.');
//     } finally {
//       setIsOtpVerifying(false);
//     }
//   };

//   const resendOtp = () => {
//     if (otpTimer > 0) return;
//     sendOtp();
//   };

//   const closeOtpModal = () => {
//     setShowOtpModal(false);
//     setOtp(['', '', '', '', '', '']);
//     setOtpError('');
//     setOtpTimer(0);
//   };

//   // Camera Functions
//   const startCamera = async () => {
//     setShowCamera(true);
//     setError('');

//     if (streamRef.current) {
//       streamRef.current.getTracks().forEach(track => track.stop());
//     }

//     try {
//       const devices = await navigator.mediaDevices.enumerateDevices();
//       const hasCameraPermission = devices.some(device => device.kind === 'videoinput');

//       if (!hasCameraPermission) {
//         const stream = await navigator.mediaDevices.getUserMedia({
//           video: { facingMode: "user" }
//         });
//         stream.getTracks().forEach(track => track.stop());
//       }

//       const stream = await navigator.mediaDevices.getUserMedia({
//         video: {
//           facingMode: "user",
//           width: { ideal: 1280 },
//           height: { ideal: 720 }
//         }
//       });

//       if (videoRef.current) {
//         videoRef.current.srcObject = stream;
//         streamRef.current = stream;
//         setCameraPermission(true);
//       }
//     } catch (err) {
//       console.error("Camera error:", err);
//       let errorMsg = "Unable to access camera.";

//       if (err.name === 'NotAllowedError') {
//         errorMsg = "Camera permission denied. Please allow camera access in your browser settings.";
//       } else if (err.name === 'NotFoundError' || err.name === 'OverconstrainedError') {
//         errorMsg = "No compatible camera found.";
//       }

//       setError(errorMsg);
//       setCameraPermission(false);
//       setShowCamera(false);
//     }
//   };

//   const stopCamera = () => {
//     if (streamRef.current) {
//       streamRef.current.getTracks().forEach(track => track.stop());
//     }
//     setShowCamera(false);
//   };

//   const capturePhoto = () => {
//     if (!videoRef.current || !canvasRef.current) return;

//     const video = videoRef.current;
//     const canvas = canvasRef.current;

//     canvas.width = video.videoWidth;
//     canvas.height = video.videoHeight;

//     const ctx = canvas.getContext('2d');
//     ctx.drawImage(video, 0, 0);

//     const imgData = canvas.toDataURL('image/jpeg', 0.8);
//     setVisitor(prev => ({ ...prev, GMS_VisitorImage: imgData }));
//     stopCamera();
//   };

//   const retakePhoto = () => {
//     setVisitor(prev => ({ ...prev, GMS_VisitorImage: null }));
//     startCamera();
//   };

//   const handleChange = e => {
//     const { name, value } = e.target;
//     setVisitor(prev => ({ ...prev, [name]: value }));

//     if (errors[name]) {
//       setErrors(prev => ({ ...prev, [name]: undefined }));
//     }

//     // If mobile number is changed and was previously verified, reset verification
//     if (name === 'GMS_MobileNo' && isOtpVerified) {
//       setIsOtpVerified(false);
//     }
//   };

//   const validateForm = () => {
//     const newErrors = {};

//     if (!visitor.GMS_VisitorName.trim()) newErrors.GMS_VisitorName = 'Name is required';
//     if (!visitor.GMS_MobileNo.trim()) {
//       newErrors.GMS_MobileNo = 'Phone number is required';
//     } else if (!/^[0-9]{10}$/.test(visitor.GMS_MobileNo.trim())) {
//       newErrors.GMS_MobileNo = 'Enter a valid 10-digit phone number';
//     } else if (!isOtpVerified) {
//       newErrors.GMS_MobileNo = 'Please verify your mobile number';
//     }
    
//     if (visitor.GMS_EmailID && !/^\S+@\S+\.\S+$/.test(visitor.GMS_EmailID)) {
//       newErrors.GMS_EmailID = 'Invalid email address';
//     }
//     if (!visitor.GMS_VisitorImage) newErrors.GMS_VisitorImage = 'Photo is required';
//     if (!visitor.GMS_VisitPurpose.trim()) newErrors.GMS_VisitPurpose = 'Purpose is required';
//     if (!visitor.GMS_ToMeet.trim()) newErrors.GMS_ToMeet = 'Person to meet is required';

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const emailData = {
//     from: "arunpanneer.t@gmail.com",
//     to: visitor.GMS_EmailID,
//     cc: visitor.GMS_ToMeetEmail,
//     subject: "Visitor Pass Confirmation",
//     html: `
//     <html>
//     <head>
//       <style>
//         body {
//           font-family: Arial, sans-serif;
//           color: #333;
//         }
//         .container {
//           max-width: 600px;
//           margin: auto;
//           padding: 20px;
//         }
//         .title {
//           font-size: 20px;
//           font-weight: bold;
//           margin-bottom: 15px;
//         }
//         table {
//           width: 100%;
//           border-collapse: collapse;
//           margin-top: 20px;
//           border: 1px solid #ddd;
//         }
//         th, td {
//           padding: 10px;
//           border: 1px solid #ddd;
//           text-align: left;
//         }
//         th {
//           background-color: #f8f8f8;
//           color: #333;
//         }
//         .btn-link {
//           display: inline-block;
//           padding: 10px 18px;
//           margin-top: 20px;
//           background: #007b8f;
//           color: #fff !important;
//           text-decoration: none;
//           border-radius: 5px;
//           font-weight: bold;
//         }
//       </style>
//     </head>
//     <body>
//       <div class="container">
//         <p>Dear ${visitor.GMS_VisitorName || 'Visitor'},</p>

//         <p>Thank you for visiting <strong>Company</strong>. Below are your visitor details:</p>

//         <table>
//           <tr>
//             <th>ID</th>
//             <td>${visitor.id || 'N/A'}</td>
//           </tr>
//           <tr>
//             <th>Name</th>
//             <td>${visitor.GMS_VisitorName || 'N/A'}</td>
//           </tr>
//           <tr>
//             <th>Company/From</th>
//             <td>${visitor.GMS_VisitorFrom || 'N/A'}</td>
//           </tr>
//           <tr>
//             <th>To Meet</th>
//             <td>${visitor.GMS_ToMeet || 'N/A'}</td>
//           </tr>
//           <tr>
//             <th>Purpose</th>
//             <td>${visitor.GMS_VisitPurpose || 'N/A'}</td>
//           </tr>
//           <tr>
//             <th>Visit Date</th>
//             <td>${new Date(visitor.created_on).toLocaleDateString('en-IN')}</td>
//           </tr>
//           <tr>
//             <th>Time In</th>
//             <td>${new Date(visitor.created_on).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</td>
//           </tr>
//         </table>

//         <p style="margin-top: 20px;">You may access your digital visitor ID using the button below:</p>

//         <a href="http://43.205.144.64:3000/" class="btn-link">View Visitor Pass</a>

//         <p style="margin-top: 40px;">Regards,<br><strong>Security Team</strong></p>
//       </div>
//     </body>
//     </html>
//   `
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsSubmitting(true);
//     setError('');
//     setSubmissionStatus('');

//     if (!validateForm()) {
//       setIsSubmitting(false);
//       const firstErrorField = Object.keys(errors)[0];
//       const errorElement = document.querySelector(`[name="${firstErrorField}"]`);
//       if (errorElement) errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
//       return;
//     }

//     try {
//       const submissionData = {
//         ...visitor,
//         entry_timestamp: new Date().toISOString(),
//         created_by: 'admin'
//       };

//       // Mock submission - replace with actual API call
//       console.log('Submitting visitor data:', submissionData);
      
//       // Simulate API delay
//       await new Promise(resolve => setTimeout(resolve, 1000));
      
//       // Mock successful response
//       const response = { data: { success: true, visitorId: 'VIS' + Date.now() } };

//       if (response.data.success) {
//         // Send email notification
//         console.log('Sending email:', emailData);
//         alert('Visitor entry saved and email notification sent!');
//         setVisitorId(response.data.visitorId);
//         setSubmissionStatus('success');
//         // navigate('/GenerateVisitorIDCard');
//       } else {
//         throw new Error('Submission failed');
//       }
//     } catch (error) {
//       console.error('Submission error:', error);
//       setSubmissionStatus('error');
//       setError(error.message || 'Failed to submit visitor entry');
//       window.scrollTo({ top: 0, behavior: 'smooth' });
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const resetForm = () => {
//     setVisitor(initialVisitorState);
//     setErrors({});
//     setError('');
//     setSubmissionStatus('');
//     setIsOtpVerified(false);
//     setOtp(['', '', '', '', '', '']);
//     setGeneratedOtp('');
//     if (formRef.current) formRef.current.reset();
//   };

//   const formatTime = (seconds) => {
//     const mins = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return `${mins}:${secs.toString().padStart(2, '0')}`;
//   };

//   return (
//     <Container fluid className="employee-container">
//       <Form ref={formRef} noValidate onSubmit={handleSubmit}>
//         <Row>
//           <Col lg={4} className="mb-3">
//             <Card className="h-100 border-0 shadow-sm"> 
//               <h2 className="text-xl font-semibold mb-2 text-gray-800 text-center shadow">
//                 <span className="d-flex align-items-center justify-content-center">
//                   <BsPerson className="me-1" style={{ fontSize: '0.85rem' }} />
//                   Visitor Photo
//                 </span>
//               </h2>
//               <Card.Body className="d-flex flex-column justify-content-center align-items-center p-2">
//                 {showCamera ? (
//                   <div className="text-center w-100">
//                     <div className="position-relative mb-2">
//                       <video
//                         ref={videoRef}
//                         autoPlay
//                         playsInline
//                         muted
//                         className="border rounded w-100"
//                         style={{ height: '280px', objectFit: 'cover' }}
//                       />
//                       <canvas ref={canvasRef} className="d-none" />
//                     </div>

//                     {cameraPermission === false && (
//                       <Alert variant="warning" className="py-1" style={{ fontSize: '0.8rem' }}>
//                         Camera permission denied. Please check your browser settings.
//                       </Alert>
//                     )}

//                     <div className="d-flex justify-content-center gap-2">
//                       <Button variant="success" onClick={capturePhoto} className="px-3 py-1" style={{ fontSize: '0.85rem' }}>
//                         <span className="d-flex align-items-center"><BsCamera className="me-1" />Capture</span>
//                       </Button>
//                       <Button variant="outline-secondary" onClick={stopCamera} className="py-1" style={{ fontSize: '0.85rem' }}>
//                         Cancel
//                       </Button>
//                     </div>
//                   </div>
//                 ) : visitor.GMS_VisitorImage ? (
//                   <div className="text-center w-100">
//                     <div className="position-relative mb-2">
//                       <img
//                         src={visitor.GMS_VisitorImage}
//                         alt="Visitor"
//                         className="img-thumbnail mb-1"
//                         style={{ height: '280px', width: '100%', objectFit: 'cover' }}
//                       />
//                     </div>
//                     <Button variant="warning" onClick={retakePhoto} className="py-1" style={{ fontSize: '0.85rem' }}>
//                       <span className="d-flex align-items-center justify-content-center"><BsArrowRepeat className="me-1" />Retake Photo</span>
//                     </Button>
//                   </div>
//                 ) : (
//                   <div className="text-center w-100 p-2">
//                     <div
//                       className="border border-dashed d-flex flex-column justify-content-center align-items-center p-4 rounded-3 mb-2"
//                       style={{ height: '293px', backgroundColor: '#f8f9fa', cursor: 'pointer' }}
//                       onClick={startCamera}
//                     >
//                       <BsCamera size={40} className="mb-2 text-primary" />
//                       <h2 className="text-sm font-semibold mb-2 p-2 text-gray-800 text-center shadow">No Photo Taken</h2>
//                       <p className="text-muted mb-2" style={{ fontSize: '0.6rem' }}>Click to capture visitor photo</p>
//                       <Button variant="primary" onClick={startCamera} className="py-1" style={{ fontSize: '0.65rem' }}>
//                         Open Camera
//                       </Button>
//                     </div>
//                     {errors.GMS_VisitorImage && (
//                       <small className="text-danger d-block mt-1" style={{ fontSize: '0.75rem' }}>{errors.GMS_VisitorImage}</small>
//                     )}
//                   </div>
//                 )}
//               </Card.Body>
//             </Card>
//           </Col>

//           <Col lg={8}>
//             <Card className="border-0 shadow-sm mb-3">
//               <h2 className="text-xl font-semibold mb-2 text-gray-800 text-center shadow">
//                 <span className="d-flex align-items-center justify-content-center">
//                   <BsPerson className="me-1" style={{ fontSize: '0.85rem' }} />
//                   Personal Information
//                 </span>
//               </h2>
//               <Card.Body className="p-2">
//                 <Row>
//                   <Col md={3}>
//                     <Form.Group className="mb-2">
//                       <Form.Label style={{ fontSize: '0.85rem' }}>Full Name <span className="text-danger">*</span></Form.Label>
//                       <Form.Control
//                         type="text"
//                         name="GMS_VisitorName"
//                         placeholder="Enter full name"
//                         value={visitor.GMS_VisitorName}
//                         onChange={handleChange}
//                         isInvalid={!!errors.GMS_VisitorName}
//                         size="sm"
//                       />
//                       <Form.Control.Feedback type="invalid" style={{ fontSize: '0.75rem' }}>
//                         {errors.GMS_VisitorName}
//                       </Form.Control.Feedback>
//                     </Form.Group>
//                   </Col>
//                   <Col md={3}>
//                     <Form.Group className="mb-2">
//                       <Form.Label style={{ fontSize: '0.85rem' }}>
//                         Phone Number <span className="text-danger">*</span>
//                       </Form.Label>
//                       <InputGroup size="sm">
//                         <Form.Control
//                           type="tel"
//                           name="GMS_MobileNo"
//                           placeholder="10-digit phone"
//                           value={visitor.GMS_MobileNo}
//                           onChange={handleChange}
//                           isInvalid={!!errors.GMS_MobileNo}
//                           disabled={isOtpVerified}
//                         />
//                         <Button 
//                           variant={isOtpVerified ? "success" : "outline-primary"}
//                           onClick={sendOtp}
//                           disabled={isOtpSending || isOtpVerified || !visitor.GMS_MobileNo.trim()}
//                           style={{ fontSize: '0.75rem' }}
//                         >
//                           {isOtpSending ? (
//                             <Spinner as="span" animation="border" size="sm" />
//                           ) : isOtpVerified ? (
//                             <BsCheckCircle />
//                           ) : (
//                             <BsShield />
//                           )}
//                         </Button>
//                       </InputGroup>
//                       <Form.Control.Feedback type="invalid" style={{ fontSize: '0.75rem' }}>
//                         {errors.GMS_MobileNo}
//                       </Form.Control.Feedback>
//                       {isOtpVerified && (
//                         <small className="text-success" style={{ fontSize: '0.7rem' }}>✓ Verified</small>
//                       )}
//                     </Form.Group>
//                   </Col>
//                   <Col md={3}>
//                     <Form.Group className="mb-2">
//                       <Form.Label style={{ fontSize: '0.85rem' }}>Email ID</Form.Label>
//                       <Form.Control
//                         type="email"
//                         name="GMS_EmailID"
//                         placeholder="Enter email address"
//                         value={visitor.GMS_EmailID}
//                         onChange={handleChange}
//                         isInvalid={!!errors.GMS_EmailID}
//                         size="sm"
//                       />
//                       <Form.Control.Feedback type="invalid" style={{ fontSize: '0.75rem' }}>
//                         {errors.GMS_EmailID}
//                       </Form.Control.Feedback>
//                     </Form.Group>
//                   </Col>
//                   <Col md={3}>
//                     <Form.Group className="mb-2">
//                       <Form.Label style={{ fontSize: '0.85rem' }}>Organization/Company</Form.Label>
//                       <Form.Control
//                         type="text"
//                         name="GMS_VisitorFrom"
//                         placeholder="Company / Organization"
//                         value={visitor.GMS_VisitorFrom}
//                         onChange={handleChange}
//                         size="sm"
//                       />
//                     </Form.Group>
//                   </Col>
//                 </Row>
//               </Card.Body>
//             </Card>

//             <Card className="border-0 shadow-sm mb-3">
//               <h2 className="text-xl font-semibold mb-2 text-gray-800 text-center shadow">
//                 <span className="d-flex align-items-center justify-content-center">
//                   <BsBuilding className="me-1" style={{ fontSize: '0.85rem' }} />
//                   Visit Details
//                 </span>
//               </h2>
//               <Card.Body className="p-2">
//                 <Row>
//                   <Col md={4}>
//                     <Form.Group className="mb-2">
//                       <Form.Label style={{ fontSize: '0.85rem' }}>
//                         To Meet <span className="text-danger">*</span>
//                       </Form.Label>
//                       <Form.Control
//                         as="select"
//                         name="GMS_ToMeet"
//                         onChange={handleEmployeeSelect}
//                         value={visitor.GMS_ToMeet || ''}
//                         isInvalid={!!errors.GMS_ToMeet}
//                         size="sm"
//                       >
//                         <option value="">-- Select Person --</option>
//                         {employees.map(emp => (
//                           <option key={emp.id} value={emp.name}>
//                             {emp.name} ({emp.type})
//                           </option>
//                         ))}
//                       </Form.Control>

//                       <Form.Control.Feedback type="invalid" style={{ fontSize: '0.75rem' }}>
//                         {errors.GMS_ToMeet}
//                       </Form.Control.Feedback>
//                     </Form.Group>
//                   </Col>

//                   <Col md={4}>
//                     <Form.Group className="mb-2">
//                       <Form.Label style={{ fontSize: '0.85rem' }}>To Meet Person Email <span className="text-danger">*</span></Form.Label>
//                       <Form.Control
//                         type="email"
//                         name="GMS_ToMeetEmail"
//                         placeholder="Email will auto-populate"
//                         value={visitor.GMS_ToMeetEmail || ''}
//                         onChange={handleChange}
//                         isInvalid={!!errors.GMS_ToMeetEmail}
//                         size="sm"
//                         readOnly
//                       />
//                       <Form.Control.Feedback type="invalid" style={{ fontSize: '0.75rem' }}>
//                         {errors.GMS_ToMeetEmail}
//                       </Form.Control.Feedback>
//                     </Form.Group>
//                   </Col>
//                   <Col md={4}>
//                     <Form.Group className="mb-0">
//                       <Form.Label style={{ fontSize: '0.85rem' }}>Purpose of Visit <span className="text-danger">*</span></Form.Label>
//                       <Form.Control
//                         type="text"
//                         name="GMS_VisitPurpose"
//                         placeholder="Meeting / Delivery / etc."
//                         value={visitor.GMS_VisitPurpose}
//                         onChange={handleChange}
//                         isInvalid={!!errors.GMS_VisitPurpose}
//                         size="sm"
//                       />
//                       <Form.Control.Feedback type="invalid" style={{ fontSize: '0.75rem' }}>
//                         {errors.GMS_VisitPurpose}
//                       </Form.Control.Feedback>
//                     </Form.Group>
//                   </Col>
//                 </Row>
//               </Card.Body>
//             </Card>

//             <Card className="border-0 shadow-sm">
//               <h2 className="text-xl font-semibold mb-2 text-gray-800 text-center shadow">
//                 <span className="d-flex align-items-center justify-content-center">
//                   <BsCardText className="me-1" style={{ fontSize: '0.85rem' }} />
//                   Additional Information
//                 </span>
//               </h2>
//               <Card.Body className="p-2">
//                 <Row>
//                   <Col md={4}>
//                     <Form.Group className="mb-0">
//                       <Form.Label style={{ fontSize: '0.85rem' }}>
//                         Vehicle Number
//                       </Form.Label>
//                       <Form.Control
//                         type="text"
//                         name="GMS_VehicleNo"
//                         placeholder="If applicable"
//                         value={visitor.GMS_VehicleNo}
//                         onChange={handleChange}
//                         size="sm"
//                       />
//                     </Form.Group>
//                   </Col>
//                   <Col md={4}>
//                     <Form.Group className="mb-0">
//                       <Form.Label style={{ fontSize: '0.85rem' }}>ID Type</Form.Label>
//                       <Form.Select
//                         name="GMS_IdentificationType"
//                         value={visitor.GMS_IdentificationType}
//                         onChange={handleChange}
//                         size="sm"
//                       >
//                         <option value="">Select ID Type</option>
//                         <option value="Aadhaar">Aadhaar Card</option>
//                         <option value="Driving License">Driving License</option>
//                         <option value="Passport">Passport</option>
//                         <option value="Voter ID">Voter ID</option>
//                         <option value="PAN Card">PAN Card</option>
//                         <option value="Other">Other</option>
//                       </Form.Select>
//                     </Form.Group>
//                   </Col>
//                   <Col md={4}>
//                     <Form.Group className="mb-0">
//                       <Form.Label style={{ fontSize: '0.85rem' }}>ID Number</Form.Label>
//                       <Form.Control
//                         type="text"
//                         name="GMS_IdentificationNo"
//                         placeholder="Enter ID number"
//                         value={visitor.GMS_IdentificationNo}
//                         onChange={handleChange}
//                         size="sm"
//                       />
//                     </Form.Group>
//                   </Col>
//                 </Row>
//               </Card.Body>
//             </Card>
//           </Col>
//         </Row>

//         <div className="d-flex justify-content-end mt-3">
//           <Button
//             onClick={resetForm}
//             className="px-3 py-2 me-3 text-white"
//             style={{ backgroundColor: 'red', fontSize: '0.85rem', border: 'none' }}
//           >
//             Clear All
//           </Button>

//           <Button
//             type="submit"
//             disabled={isSubmitting}
//             className="px-3 py-2 text-white"
//             style={{ backgroundColor: 'green', fontSize: '0.9rem', border: 'none' }}
//           >
//             {isSubmitting ? (
//               <>
//                 <Spinner as="span" animation="border" size="sm" className="me-1" /> Saving...
//               </>
//             ) : (
//               'Save'
//             )}
//           </Button>
//         </div>

//       </Form>

//       {/* OTP Verification Modal */}
//       <Modal show={showOtpModal} onHide={closeOtpModal} centered backdrop="static">
//         <Modal.Header>
//           <Modal.Title className="d-flex align-items-center">
//             <BsShield className="me-2 text-primary" />
//             Mobile OTP Verification
//           </Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <div className="text-center mb-3">
//             <p className="mb-2">
//               We've sent a 6-digit verification code to
//             </p>
//             <strong className="text-primary">{visitor.GMS_MobileNo}</strong>
//           </div>

//           {otpError && (
//             <Alert variant="danger" className="py-2 mb-3" style={{ fontSize: '0.85rem' }}>
//               {otpError}
//             </Alert>
//           )}

//           <div className="d-flex justify-content-center mb-3">
//             {otp.map((digit, index) => (
//               <Form.Control
//                 key={index}
//                 ref={el => otpInputRefs.current[index] = el}
//                 type="text"
//                 maxLength="1"
//                 value={digit}
//                 onChange={(e) => handleOtpChange(index, e.target.value)}
//                 onKeyDown={(e) => handleOtpKeyDown(index, e)}
//                 className="text-center mx-1"
//                 style={{ 
//                   width: '50px', 
//                   height: '50px', 
//                   fontSize: '1.2rem', 
//                   fontWeight: 'bold'
//                 }}
//               />
//             ))}
//           </div>

//           {otpTimer > 0 ? (
//             <div className="text-center text-muted mb-3" style={{ fontSize: '0.9rem' }}>
//               Resend OTP in {formatTime(otpTimer)}
//             </div>
//           ) : (
//             <div className="text-center mb-3">
//               <Button 
//                 variant="link" 
//                 onClick={resendOtp} 
//                 className="p-0"
//                 style={{ fontSize: '0.9rem' }}
//               >
//                 Didn't receive OTP? Resend
//               </Button>
//             </div>
//           )}
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="outline-secondary" onClick={closeOtpModal}>
//             Cancel
//           </Button>
//           <Button 
//             variant="primary" 
//             onClick={verifyOtp}
//             disabled={isOtpVerifying || otp.join('').length !== 6}
//           >
//             {isOtpVerifying ? (
//               <>
//                 <Spinner as="span" animation="border" size="sm" className="me-1" />
//                 Verifying...
//               </>
//             ) : (
//               'Verify OTP'
//             )}
//           </Button>
//         </Modal.Footer>
//       </Modal>
//     </Container>
//   );
// };

// export default AddGateEntry;