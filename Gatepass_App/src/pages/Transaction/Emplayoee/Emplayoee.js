import React, { useEffect, useState } from 'react';
import { Container, Form, Button, Spinner, Alert, Modal } from 'react-bootstrap';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { PlusCircle, Eye, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import "../Admin/UserList.css";
import { SERVER_PORT } from '../../../constant'; 


const Employees = ({ setTitle }) => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setTitle && setTitle('Employee List');
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${SERVER_PORT}/get_all_employees`);
      if (res.status === 200) {
        setEmployees(res.data);



      } else {
        setError('Failed to fetch employees.');
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
      setError('An error occurred while fetching employees.');
    } finally {
      setLoading(false);
    }
  };

  const filtered = employees.filter(emp =>
    emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  return (
    <Container fluid className="employee-container">
      <div className="table-header">
        <h4 className="mb-0">Employee Management</h4>
      </div>

      <div className="table-controls">
        <Form.Select
          className="entries-dropdown"
          value={perPage}
          onChange={(e) => {
            setPerPage(Number(e.target.value));
            setCurrentPage(1);
          }}
        >
          {[10, 25, 50, 100].map((n) => (
            <option key={n} value={n}>{n} entries</option>
          ))}
        </Form.Select>
        <Form.Control
          className="search-input"
          type="text"
          placeholder="Search employees..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
        />
        <Button className="add-visitor-btn" onClick={() => navigate('/employeeadd')}>
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
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Joining Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length > 0 ? (
                paginated.map((emp) => (
                  <tr key={emp.id}>
                    <td>{emp.name}</td>
                    <td>{emp.email}</td>
                    <td>{emp.phone}</td>
                    <td>{emp.gms_joining_date ? new Date(emp.gms_joining_date).toLocaleDateString() : 'N/A'}</td>
                    <td style={{ color: emp.gms_status === 'Active' ? 'green' : 'red' }}>
                      {emp.gms_status || 'N/A'}
                    </td>

                    <td className="actions">
                      <button onClick={() => emp.id && navigate(`/viewemplayoee/${emp.id}`)}
                        style={{ color: 'red' }}>
                        <Eye size={16} />
                      </button>

                      <button className="pr-5" onClick={() => navigate('/employeeedit', { state: { id: emp.id } })}
                        style={{ color: 'green' }}>
                        <i className="pl-5 fa-solid fa-pen-to-square"></i>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center">No employees found.</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="pagination">
            <Button
              className="page-btn"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <FaArrowLeft />
            </Button>
            <span>{currentPage}</span>
            <Button
              className="page-btn"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              <FaArrowRight />
            </Button>
            <div className="mt-2">
              Showing {Math.min((currentPage - 1) * perPage + 1, filtered.length)} to{' '}
              {Math.min(currentPage * perPage, filtered.length)} of {filtered.length} entries
            </div>
          </div>
        </>
      )}
    </Container>
  );
};

export default Employees;
