import React, { useEffect, useState } from "react";
import { Button, Form } from 'react-bootstrap';
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { PlusCircle } from 'lucide-react';
import { SERVER_PORT } from '../../../constant';

import "./UserList.css";
import CustomAlert from "../../../CustomAlert";

export default function User({ setTitle }) {
  const navigate = useNavigate();
  const [userActivity, setUserActivity] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [alerts, setAlerts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);

  const showAlert = (type, title, message, onConfirm) => {
    const newAlert = { id: Date.now(), type, title, message, onConfirm };
    setAlerts(prev => [...prev, newAlert]);

    if (type !== "info") {
      setTimeout(() => {
        setAlerts(prevAlerts => prevAlerts.filter(alert => alert.id !== newAlert.id));
      }, 3000);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const response = await axios.get(`${SERVER_PORT}/userlist_getalldata`);
      if (response.status === 200) {
        setUserActivity(response.data.data);
      } else {
        showAlert("error", "Error", "Failed to fetch users.");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      showAlert("error", "Error", "An error occurred while fetching users.");
    }
  };

  const filteredUsers = userActivity.filter(user =>
    Object.values(user)
      .join(" ")
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredUsers.length / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const displayedUsers = filteredUsers.slice(startIndex, startIndex + recordsPerPage);


  const handleEditUser = (user) => {
    navigate("/user/edituser", { state: { userId: user.adm_users_id } });
  };

  const handleAddUser = () => {
    navigate("/user/adduser");
  };

  const handleDeleteUser = (user) => {
    showAlert(
      "info",
      "Delete Admin",
      `Are you sure you want to delete <b>${user.adm_users_firstname} ${user.adm_users_lastname}</b>? This action cannot be undone.`,
      (isConfirmed) => {
        if (isConfirmed) {
          axios.delete(`${SERVER_PORT}/userlist_deleteuser/${user.adm_users_id}`)
            .then((response) => {
              if (response.status === 200) {
                showAlert("success", "Deleted", "User deleted successfully.");
                fetchAllUsers();
              } else {
                showAlert("error", "Error", "Failed to delete user.");
              }
            })
            .catch((error) => {
              console.error("Error deleting user:", error);
              showAlert("error", "Error", "An error occurred while deleting the user.");
            });
        }
      }
    );
  };

  useEffect(() => {
    setTitle("Admin List");
    fetchAllUsers();
  }, []);

  // Reset to page 1 on search or per-page change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, recordsPerPage]);

  return (
    <>
      <div className="employee-container">
        <div className="table-header">
          <h4 className="mb-0">Admin Management</h4>
        </div>
        <div className="table-controls">
          <Form.Select
            className="entries-dropdown"
            value={recordsPerPage}
            onChange={(e) => setRecordsPerPage(Number(e.target.value))}
          >
            {[10, 25, 50].map(num => (
              <option key={num} value={num}>{num} entries</option>
            ))}
          </Form.Select>

          <Form.Control 
            type="text"
            placeholder=" Search by name, email, etc."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />

          <Button className="add-visitor-btn" onClick={handleAddUser}>
            <PlusCircle size={20} /> Add
          </Button>
        </div>

        <table>
          <thead>
            <tr>
              <th>Username</th>
              <th>Firstname</th>
              <th>Lastname</th>
              <th>E-Mail</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayedUsers.map((activity) => (
              <tr key={activity.adm_users_id}>
                <td>{activity.adm_users_loginid}</td>
                <td>{activity.adm_users_firstname}</td>
                <td>{activity.adm_users_lastname}</td>
                <td>{activity.adm_users_email}</td>
                <td>{activity.adm_users_mobile}</td>
                <td>
                  <span className="status" style={{ color: activity.adm_users_status ? "green" : "red" }}>
                    {activity.adm_users_status ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="actions">
                  <span style={{ color: 'green' }} onClick={() => handleEditUser(activity)}>
                    <i className="fa-solid fa-user-pen"></i>
                  </span>
                  <span className="pr-5" style={{ color: '#c40202' }} onClick={() => handleDeleteUser(activity)}>
                    <i className="pl-5 fa-solid fa-trash"></i>
                  </span>
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
          Showing {Math.min(startIndex + 1, filteredUsers.length)} to {Math.min(startIndex + recordsPerPage, filteredUsers.length)} of {filteredUsers.length} entries
        </div>
        </div>

      </div>

      <div style={{ padding: "20px" }}>
        {alerts.map((alert) => (
          <CustomAlert
            key={alert.id}
            {...alert}
            onClose={() => setAlerts(prev => prev.filter(a => a.id !== alert.id))}
            duration={alert.type === "info" ? 0 : 3000}
          />
        ))}
      </div>
    </>
  );
}
