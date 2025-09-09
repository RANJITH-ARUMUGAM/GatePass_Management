import React, { useEffect, useState } from "react";
import { Container, Form, Button, Modal, Alert, Spinner } from 'react-bootstrap';
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { PlusCircle } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../Admin/UserList.css";
import CustomAlert from "../../../CustomAlert";
import { SERVER_PORT } from '../../../constant';


const Departments = ({ setTitle }) => {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);

  useEffect(() => {
    setTitle("Department List");
    fetchDepartments();
  }, []);

  const showAlert = (type, title, message, onConfirm) => {
    const newAlert = { id: Date.now(), type, title, message, onConfirm };
    setAlerts((prev) => [...prev, newAlert]);

    if (type !== "info") {
      setTimeout(() => {
        setAlerts((prevAlerts) => prevAlerts.filter((alert) => alert.id !== newAlert.id));
      }, 3000);
    }
  };

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${SERVER_PORT}/department_getalldata`);
      if (response.status === 200) {
        setDepartments(response.data.data);
      } else {
        setError("Failed to fetch departments.");
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
      setError("An error occurred while fetching departments.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDepartment = async () => {
    try {
      await axios.delete(`${SERVER_PORT}/department_delete/${selectedDept.department_id}`);
      showAlert("success", "Deleted", "Department deleted successfully.");
      setDepartments((prev) => prev.filter(d => d.department_id !== selectedDept.department_id));
    } catch (err) {
      console.error("Delete error:", err);
      showAlert("error", "Error", "An error occurred during deletion.");
    } finally {
      setShowModal(false);
    }
  };

  const filtered = departments.filter(dept => dept.department_name.toLowerCase().includes(searchTerm.toLowerCase()));
  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  return (
    <Container fluid className="employee-container">
      <div className="table-header">
        <h4 className="mb-0">Department Management</h4>
      </div>

      <div className="table-controls">
        <Form.Select
          className="entries-dropdown"
          value={perPage}
          onChange={e => {
            setPerPage(Number(e.target.value));
            setCurrentPage(1);
          }}
        >
          {[10, 25, 50, 100].map(n => (
            <option key={n} value={n}>{n} entries</option>
          ))}
        </Form.Select>
        <Form.Control className="search-input" type="text" placeholder="Search departments..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        <Button className="add-visitor-btn" onClick={() => navigate('/departmentsadd')}>
          <PlusCircle size={20} /> Add
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" />
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : (
        <>
          <table>
            <thead>
              <tr>
                <th>Department Name</th>
                <th>Description</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(dept => (
                <tr key={dept.department_id}>
                  <td>{dept.department_name}</td>
                  <td>{dept.department_description}</td>
                  <td style={{ color: dept.status ? 'green' : 'red' }}>
                    {dept.status ? 'Active' : 'Inactive'}
                  </td>
                  <td>
                    <button style={{ color: 'green' }} onClick={() => navigate('/departmentedit', { state: { departmentId: dept.department_id } })}>
                      <i className="pl-5 fa-solid fa-pen-to-square"></i>
                    </button>
                    <button className="pr-5" style={{ color: '#c40202' }} onClick={() => { setSelectedDept(dept); setShowModal(true); }}>
                      <i className="pl-5 fa-solid fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pagination">
            <Button className="page-btn" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
              <FaArrowLeft />
            </Button>
            <span>{currentPage}</span>
            <Button className="page-btn" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>
              <FaArrowRight />
            </Button>
          <div className="mt-2">
            Showing {Math.min((currentPage - 1) * perPage + 1, filtered.length)} to {Math.min(currentPage * perPage, filtered.length)} of {filtered.length} entries
          </div>
          </div>

        </>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete the department "{selectedDept?.department_name}"?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleDeleteDepartment}>Delete</Button>
        </Modal.Footer>
      </Modal>

      <div style={{ padding: "20px" }}>
        {alerts.map((alert) => (
          <CustomAlert
            key={alert.id}
            {...alert}
            onClose={() => setAlerts((prev) => prev.filter((a) => a.id !== alert.id))}
            duration={alert.type === "info" ? 0 : 3000}
          />
        ))}
      </div>
    </Container>
  );
};

export default Departments;
