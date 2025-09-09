import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Button, Row, Col, Form } from 'react-bootstrap';
import { SERVER_PORT } from '../../../constant';
import { ReactSession } from 'react-client-session';

function EditRoleModel({ setTitle }) {

    useEffect(() => {
        setTitle("Edit Roles");
    }, []);


  const navigate = useNavigate()

  const [OrganisationBusiness, setOrganisationBusinessValues] = useState([])
  const [OrgIsDisabled, setOrgIsDisabled] = useState()
  const [Businessunit, setbusinessunitValues] = useState([])

  const [DisplayValues, setDisplayValues] = useState();

  const [values, setRoleValues] = useState({
    Roles_ID: null,
    Roles_Code: "",
    Roles_RoleName: "",
    Businessunit_ID: null,
    Organisation_ID: null,
    Roles_Status: true,
    Roles_Modified_BY: ReactSession.get("username"),
  })


  const { id } = useParams();

  useEffect(() => {
    setOrgIsDisabled(true)
    const username = ReactSession.get("username");
    const selectedfy = ReactSession.get("selectedfy")
    setDisplayValues.DisplayValues = username;

    setRoleValues({ ...values, Roles_Modified_BY: setDisplayValues.DisplayValues });
    console.log(setDisplayValues.DisplayValues)


    axios.get(`${SERVER_PORT}/Business_active`)
      .then(res => (setbusinessunitValues(res.data)))
      .catch(err => console.log(err))


    axios.get(`${SERVER_PORT}/roles/` + id)
      .then(res => {
        console.log(res)
        setRoleValues({
          ...values, Roles_ID: res.data[0].Roles_ID,
          Roles_Code: res.data[0].Roles_Code,
          Roles_RoleName: res.data[0].Roles_RoleName,
          Businessunit_ID: res.data[0].Businessunit_ID,
          Organisation_ID: res.data[0].Organisation_ID,
          Businessunit_Name: res.data[0].Businessunit_Name,
          Organisation_Name: res.data[0].Organisation_Name,
          Roles_Status: res.data[0].Roles_Status,

        });
        setRoleValues.Businessunit_ID = res.data[0].Businessunit_ID;

        axios.get(`${SERVER_PORT}/organisation_active_business/${setRoleValues.Businessunit_ID}`)
          .then(res => {
            setOrganisationBusinessValues(res.data);
          })
          .catch(err => console.log(err));

      }).catch(err => console.log(err));

  }, [])




  function desconchange(e) {
    const inputValue = e.target.value;
    const trimmedValue = inputValue.trim(); // Remove leading/trailing spaces
    const cleanedValue = trimmedValue.replace(/\s+/g, ' ');  // Replace multiple spaces with a single space


    setRoleValues.Roles_RoleName = cleanedValue
    console.log(cleanedValue)
    var matches = (setRoleValues.Roles_RoleName).match(/\s/g);
    console.log(matches)

    if (setRoleValues.Roles_RoleName.length === 0) {
      setRoleValues.Roles_Code = ''
      setRoleValues({
        ...values, Roles_RoleName: e.target.value,
        Roles_Code: setRoleValues.Roles_Code
      })
    }

    if (matches === null) {

      setRoleValues.Roles_Code = ((setRoleValues.Roles_RoleName).split(" ")[0].slice(0, 3)).toUpperCase()

    } else if (matches.length >= 2) {

      setRoleValues.Roles_Code = ((setRoleValues.Roles_RoleName).split(" ")[0].slice(0, 1) + (setRoleValues.Roles_RoleName).split(" ")[1].slice(0, 1) + (setRoleValues.Roles_RoleName).split(" ")[2].slice(0, 1)).toUpperCase()

    } else if (matches.length === 1) {

      setRoleValues.Roles_Code = ((setRoleValues.Roles_RoleName).split(" ")[0].slice(0, 1) + (setRoleValues.Roles_RoleName).split(" ")[1].slice(0, 2)).toUpperCase()

    }


    axios.get(`${SERVER_PORT}/relatingtocodecheck/${setRoleValues.Roles_Code}`)
      .then(res => {
        console.log(res)
        if (res.data.Status === 'Available') {
          axios.get(`${SERVER_PORT}/relatingtocodemaxnum/${setRoleValues.Roles_Code}`)
            .then(res => {
              console.log(res.data[0].codemaxnum)
              let nextnum = parseInt(res.data[0].codemaxnum) + 1
              console.log(nextnum)
              if ((nextnum.toString()).length === 1) {
                nextnum = '0' + nextnum.toString()
                setRoleValues.Roles_Code = setRoleValues.Roles_Code + (isNaN(nextnum) ? '00' : nextnum)
                setRoleValues({
                  ...values, Roles_RoleName: e.target.value,
                  Roles_Code: setRoleValues.Roles_Code
                })
                return (console.log(values.Roles_Code))
              } else {
                setRoleValues.Roles_Code = setRoleValues.Roles_Code + (isNaN(nextnum) ? '00' : nextnum)
                setRoleValues({
                  ...values, Roles_RoleName: setRoleValues.Roles_RoleName,
                  Roles_Code: setRoleValues.Roles_Code
                })
                return (console.log(values.Roles_Code))
              }
            })

        } else if (res.data.Status === 'NotAvailable') {

          setRoleValues({
            ...values, Roles_RoleName: cleanedValue,
            Roles_Code: (cleanedValue ? setRoleValues.Roles_Code + '00' : ' ')
          })
        }
      })
      .catch(err => console.log(err))
  }


  const activestatusCheckboxChange = (e) => {
    const { name, checked } = e.target
    setRoleValues.Roles_Status = e.target.checked
    setRoleValues({ ...values, Roles_Status: e.target.checked })
    setRoleValues((prevValues) => ({
      ...prevValues,
      [name]: checked,
    }));
  };




  const handleUpdate = (event) => {
    event.preventDefault();

    axios.put(`${SERVER_PORT}/rolesedit/` + id, values)
      .then(res => {
        if (res.data.message === 'Code already exists') {
          alert('Code already exists');
        } else {
          if (res.data.message === 'Name already exists') {
            alert('Name already exists');
          } else {
            alert("Updated Successfully")
            navigate('/roles')
          }
        }
      }).catch(err => console.log(err));

  }


  return (
    <div className="employee-container" style={{ minHeight: '91.1vh', backgroundColor: 'rgb(241, 245, 245)', overflowX: 'hidden' }}>
      {/* Navigation Links Header */}

      <div style={{ backgroundColor: '#d2edce', marginTop: '15px', paddingLeft: '10px' }} >
        <Row className="ml-5">
          <Col>
            <div className="d-flex justify-content-between align-items-center">

              <h5 style={{ fontStyle: 'italic' }} className="ml-3 mt-2" > Edit Role</h5>
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
              <Link style={{ fontSize: '14px', color: 'black' }} to="/roles"> Role </Link>
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" style={{ color: '#5D6D7E' }} fill="currentColor" className="bi bi-chevron-right" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708" />
              </svg>
              <span style={{ fontSize: '14px', color: '#73879C', paddingLeft: '5px' }}>Edit Role</span>
            </div>
          </Col>

        </Row>
      </div>

      <div className="x_panel ">
        <Form onSubmit={handleUpdate}>
          <Row className="mb-2">
            <Col md={4}>
              <Form.Group controlId="Roles_Code" onChange={e => setRoleValues({ ...values, Roles_Code: (e.target.value).toUpperCase() })}  >
                <Form.Label className="label-style">Role Code <span className="star"></span></Form.Label>
                <Form.Control type="text" name="Roles_Code" required
                  defaultValue={values.Roles_Code.slice(0, 5)} disabled
                  title='please enter the code' />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group controlId="Roles_RoleName" onChange={e => setRoleValues({ ...values, Roles_RoleName: e.target.value })}>
                <Form.Label className="label-style">Role Name <span className="star"></span></Form.Label>
                <Form.Control type="text" name="Roles_RoleName" required defaultValue={values.Roles_RoleName} onKeyUpCapture={desconchange}
                  title='please enter the Roles Name' />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group controlId="Roles_Valid">
                <Form.Label className="label-style">Status</Form.Label>

                {/*  <input type="checkbox" id="switch" checked={values.Roles_Status} onChange={activestatusCheckboxChange}
                    name="Roles_Valid" />
                  <label style={{ left: '-60px' }} className='ValidLabel inputtogglelable statusinputtogglelable' for="switch" title='please on the toggle' name="Role_Valid">
                    <span className='toggleoff'>Off</span>
                    <span className='toggleon'>On</span></label> */}


                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    role="switch"
                    id="flexSwitchCheckChecked"
                    checked={values.Roles_Status} onChange={activestatusCheckboxChange}
                    name="Roles_Status"
                  />
                  <label
                    className="form-check-label"
                    htmlFor="flexSwitchCheckChecked"

                  >
                    {values.Roles_Status ? 'On' : 'Off'}
                  </label>
                </div>
              </Form.Group>
            </Col>
          </Row>

          <Button variant="success" type="submit" >
            Save
          </Button>
          <Link to="/roles">
            <Button variant="danger" type="submit" style={{ marginLeft: "10px" }}>
              Cancel  </Button>
          </Link>
        </Form>

      </div>
    </div>
  )
}

export default EditRoleModel;