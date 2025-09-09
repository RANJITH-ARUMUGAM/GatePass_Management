import React, { useState, useRef, useEffect } from 'react';
import { BsCamera, BsArrowRepeat } from 'react-icons/bs';
import { Form, Button } from 'react-bootstrap';
import axios from 'axios'; 
import '../VisitorsDetails/VisitorPass.css';


const LobbyEntry = () => {
  const [visitorId, setVisitorId] = useState('');
  const [visitorData, setVisitorData] = useState({
    visitorId:'',
    name: '',
    from: '',
    toMeet: '',
    purpose: '',
    idType: '',
    idNumber: '',
    phoneNumber: '',
    email: '',
    status:'',
    inTime: '',
    outTime: '',
    image: null,
  });


  const [previewMode, setPreviewMode] = useState(false);
  const [passWidth, setPassWidth] = useState(300);  // in pixels
  const [passHeight, setPassHeight] = useState(450); // in pixels
  
  const [showCamera, setShowCamera] = useState(false);
  const [cameraFacing, setCameraFacing] = useState('user');

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const identityType = ['Employee Card', 'Govt Issued Card', 'Photo Identity Card','Citizenship Card','Passport'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setVisitorData(prev => ({ ...prev, [name]: value }));
  };

  const startCamera = async () => {
    const newFacing = cameraFacing === 'user' ? 'environment' : 'user';
    setCameraFacing(newFacing);

    setShowCamera(true);
    if (streamRef.current) {
      const tracks = streamRef.current.getTracks();
      tracks.forEach(track => track.stop());
    }

    try {
      const constraints = {
        video: {
          facingMode: newFacing,
          width: { ideal: 200 },
          height: { ideal: 200 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
    } catch (err) {
      console.error("Error switching camera:", err);
      alert("Unable to switch camera. Your device might not support this feature.");
      setCameraFacing(cameraFacing);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      const tracks = streamRef.current.getTracks();
      tracks.forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
      const imageDataUrl = canvasRef.current.toDataURL('image/png');
      setVisitorData(prev => ({ ...prev, image: imageDataUrl}));
      stopCamera();
    }
  };

  const retakePhoto = () => {
    setVisitorData(prev => ({ ...prev, image: null }));
    startCamera();
  };

  const generateVisitorId = () => {
    //const timestamp = new Date().getTime().toString().slice(-6);
    // const randomDigits = Math.floor(Math.random() * 10).toString().padStart(3, '0');
    // return `${randomDigits}`;

    let current = parseInt(localStorage.getItem('visitorCounter')) || 1;
  const id = `${current.toString().padStart(4, '0')}`; // Example: V-0001
  localStorage.setItem('visitorCounter', current + 1);
  return id;
  };

  const handleSubmit = async(e) => {
    e.preventDefault();
    const generatedId = generateVisitorId();
    console.log(generatedId)
  setVisitorId(generatedId);

  // Include generatedId into visitorData
  const dataToSend = { ...visitorData, visitorId: generatedId };

  console.log(dataToSend)
  try {
    const response = await axios.post("http://localhost:5000/visitor_lobbyentry", dataToSend);
    if (response.status === 200) {
      //showAlert("success", "Success!", "visitor Added successfully!.");
      alert("Success") ;
    setPreviewMode(true); 
    } else {
      //showAlert("error", "Error!","Failed to add user.");
      alert("Failed") ;
    }
  } catch (error) {
    console.error("Error adding user:", error);
    //showAlert("warning", "Warning!", "Fill the required fields.");
    alert("Catch Error") ;
  }
    
    
  };

  const handlePrint = () => {
    window.print();
  };

  const handleBackToForm = () => {
    setPreviewMode(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="container">
      {!previewMode ? (
        <div className="form-box">
          <h1 className="form-title">Visitor Registration</h1>
          <Form onSubmit={handleSubmit} className="form">
  <div className="camera-section mb-4">
    {showCamera ? (
      <div className="camera-view">
        <video ref={videoRef} autoPlay playsInline muted className="video"></video>
        <canvas ref={canvasRef} className="hidden" />
        <div className="camera-buttons mt-2">
          <Button variant="success" onClick={capturePhoto} className="me-2">Capture</Button>
          <Button variant="secondary" onClick={startCamera}>Switch Camera</Button>
        </div>
      </div>
    ) : visitorData.image ? (
      <div className="image-preview text-center">
        <img src={visitorData.image} alt="Visitor" className="preview-img" />
        <Button variant="warning" onClick={retakePhoto} className="btn retake mt-2" title="Retake photo">
          <BsArrowRepeat size={20} />
        </Button>
      </div>
    ) : (
      <div className="placeholder text-center">
        <BsCamera size={48} className="placeholder-icon mb-2" />
        <Button variant="primary" onClick={startCamera}>Open Camera</Button>
      </div>
    )}
  </div>

  <div className="form-grid">
    <Form.Group controlId="visitorName">
      <Form.Label>Visitor Name</Form.Label><Form.Text className="text-danger">*</Form.Text>
      <Form.Control type="text" name="name" value={visitorData.name} onChange={handleInputChange}  minLength={4} maxLength={25} required />
    </Form.Group>

    <Form.Group controlId="from">
      <Form.Label>From</Form.Label><Form.Text className="text-danger">*</Form.Text>
      <Form.Control type="text" name="from" value={visitorData.from} onChange={handleInputChange}  minLength={4} maxLength={25} required />
    </Form.Group>

    <Form.Group controlId="toMeet">
      <Form.Label>To Meet</Form.Label><Form.Text className="text-danger">*</Form.Text>
      <Form.Control type="text" name="toMeet" value={visitorData.toMeet} onChange={handleInputChange}  minLength={4} maxLength={25}  required />
    </Form.Group>

    <Form.Group controlId="purpose">
      <Form.Label>Purpose of Visit</Form.Label><Form.Text className="text-danger">*</Form.Text>
      <Form.Control type="text" name="purpose" value={visitorData.purpose} onChange={handleInputChange}   minLength={4} maxLength={25} required />
    </Form.Group>

    <Form.Group controlId="idType">
      <Form.Label>Identification Type</Form.Label><Form.Text className="text-danger">*</Form.Text>
      <Form.Control as='select'className="form-select" name="idType" value={visitorData.idType} onChange={handleInputChange} placeholder="Identification Type" required>
      {identityType.map((idType, index) => (
                  <option key={index} value={index}>{idType}</option>
                ))}
    </Form.Control>
    </Form.Group>
    
    <Form.Group controlId="idNumber">
      <Form.Label>Identification Number</Form.Label><Form.Text className="text-danger">*</Form.Text>
      <Form.Control type="text" name="idNumber" value={visitorData.idNumber} onChange={handleInputChange} placeholder="e.g :XX75 2425 19XX"  minLength={4} maxLength={20} required />
    </Form.Group>

    <Form.Group controlId="phoneNumber">
      <Form.Label>Mobile</Form.Label><Form.Text className="text-danger">*</Form.Text>
      <Form.Control type="text" name="phoneNumber" value={visitorData.phoneNumber} onChange={handleInputChange} placeholder="e.g :1234567890" minLength={10} maxLength={10} required />
    </Form.Group>

    <Form.Group controlId="email">
      <Form.Label>Email</Form.Label>
      <Form.Control type="email" name="email" value={visitorData.email} onChange={handleInputChange} minLength={4} maxLength={25} placeholder="e.g :example@gmail.com" />
    </Form.Group>
  </div>

  <div className="submit-section mt-4 text-center">
    <Button variant="success" type="submit" className="btn submit" disabled={!visitorData.image}>
      Generate Visitor Pass
    </Button>
  </div>
</Form>

        </div>
      ) : (
        <div>
          {/* <div className="dimension-controls">
  <label>
    Width (px):
    <input
      type="number"
      value={passWidth}
      onChange={(e) => setPassWidth(Number(e.target.value))}
      min={100}
      max={600}
    />
  </label>
  <label>
    Height (px):
    <input
      type="number"
      value={passHeight}
      onChange={(e) => setPassHeight(Number(e.target.value))}
      min={100}
      max={1000}
    />
  </label>
</div> */}
          <h1 align="center"> Card Preview</h1>
          <div className="pass-preview" id="printableArea" style={{ width: `${passWidth}px`, height: `${passHeight}px` }}>
            <div className="pass-header">
              <div className="logo-box">LOGO</div>
              <div className="org-details">
                <h1 className="pass-title">VISITOR PASS</h1>
                <p className="org-name">Organization Name</p>
              </div>
            </div>

            <div className="pass-body">
              <div className="photo-box">
                {visitorData.image ? (
                  <img src={visitorData.image} alt="Visitor" />
                ) : (
                  <div className="photo-placeholder">No Photo</div>
                )}
              </div>

              <div className="info-grid">
                <div><strong>ID:</strong>v-{visitorId}</div>
                <div><strong>Name:</strong> {visitorData.name}</div>
                <div><strong>From:</strong> {visitorData.from}</div>
                <div><strong>To Meet:</strong> {visitorData.toMeet}</div>
                <div><strong>Purpose:</strong> {visitorData.purpose}</div>
                <div><strong>Date:</strong> {new Date().toLocaleDateString()}</div>
              </div>
            </div>

            <div className="pass-footer">
              <p>This pass must be worn visibly at all times while on premises</p>
              <p>Valid only for {new Date().toLocaleDateString()}</p>
            </div>
          </div>

          <div className="pass-buttons">
            <button onClick={handleBackToForm} className="btn back">Back to Form</button>
            <button onClick={handlePrint} className="btn print">Print Visitor Pass</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LobbyEntry;
