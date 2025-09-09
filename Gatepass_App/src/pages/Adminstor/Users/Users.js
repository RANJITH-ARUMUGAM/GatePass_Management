import React, { useEffect, useState } from "react";
import axios from 'axios'
import { Container, Row, Col, Table, Button, Tooltip, OverlayTrigger, Pagination } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useNavigate } from "react-router-dom";
import { SERVER_PORT } from '../../../constant';
import { ReactSession } from 'react-client-session';


function Users({ setTitle }) {

    useEffect(() => {
        setTitle("Users");
    }, []);


    const [data, setData] = useState([])
    const [datawithoutfilter, setDatawithoutfil] = useState([])
    const [error, setError] = useState('Child Record Present - Cannot be Deleted')

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    // Sorting state
    var [sortasc, setSortasc] = useState({
        sortdirection1: "",
        sortdirection2: "",
        sortdirection3: "",
        sortdirection4: "",
    })

    useEffect(() => {
        setSortasc.sortdirection1 = 'DOWN';
        setSortasc.sortdirection2 = 'DOWN';
        setSortasc.sortdirection3 = 'DOWN';
        setSortasc.sortdirection4 = 'DOWN';

        axios.get(`${SERVER_PORT}/users`)
            .then(res => {
                // const activeRecords = res.data.filter(record => record.Users_Status_Converted === 'Active');
                // const InactiveRecords = res.data.filter(record => record.Users_Status_Converted == 'Inactive');

                setData(res.data);
                setDatawithoutfil(res.data);
            })
            .catch(err => console.log(err));
    }, [])

    const deleteClick = (id) => {
        if (window.confirm('Are you sure you want to Delete? ')) {
            axios.delete(`${SERVER_PORT}/user/` + id)
                .then(res => {
                    if (res.data.Status === 'Success') {
                        alert("Deleted Successfully")
                        axios.get(`${SERVER_PORT}/users`)
                            .then(res => {
                                const activeRecords = res.data.filter(record => record.Users_Status_Converted === 'Active');
                                setData(activeRecords);
                                setDatawithoutfil(res.data);
                            })
                            .catch(err => console.log(err));
                    } else {
                        setError(res.data.Error)
                        alert(error && error)
                    }
                })
                .catch(err => console.log(err))
        }
    }

    // Sorting functions
    function sortResult1(prop, asc) {
        if (setSortasc.sortdirection1 === 'DOWN') {
            asc = true
            setSortasc.sortdirection1 = 'UP'
        } else {
            asc = false
            setSortasc.sortdirection1 = 'DOWN'
        }
        var sortedData = [...data].sort(function (a, b) {
            if (asc) {
                return (a[prop] > b[prop]) ? 1 : ((a[prop] < b[prop]) ? -1 : 0);
            }
            else {
                return (b[prop] > a[prop]) ? 1 : ((b[prop] < a[prop]) ? -1 : 0);
            }
        });
        setData(sortedData, []);
    }

    function sortResult2(prop, asc) {
        if (setSortasc.sortdirection2 === 'DOWN') {
            asc = true
            setSortasc.sortdirection2 = 'UP'
        } else {
            asc = false
            setSortasc.sortdirection2 = 'DOWN'
        }
        var sortedData = [...data].sort(function (a, b) {
            if (asc) {
                return (a[prop] > b[prop]) ? 1 : ((a[prop] < b[prop]) ? -1 : 0);
            }
            else {
                return (b[prop] > a[prop]) ? 1 : ((b[prop] < a[prop]) ? -1 : 0);
            }
        });
        setData(sortedData, []);
    }

    function sortResult3(prop, asc) {
        if (setSortasc.sortdirection3 === 'DOWN') {
            asc = true
            setSortasc.sortdirection3 = 'UP'
        } else {
            asc = false
            setSortasc.sortdirection3 = 'DOWN'
        }
        var sortedData = [...data].sort(function (a, b) {
            if (asc) {
                return (a[prop] > b[prop]) ? 1 : ((a[prop] < b[prop]) ? -1 : 0);
            }
            else {
                return (b[prop] > a[prop]) ? 1 : ((b[prop] < a[prop]) ? -1 : 0);
            }
        });
        setData(sortedData, []);
    }

    function sortResult4(prop, asc) {
        if (setSortasc.sortdirection4 === 'DOWN') {
            asc = true
            setSortasc.sortdirection4 = 'UP'
        } else {
            asc = false
            setSortasc.sortdirection4 = 'DOWN'
        }
        var sortedData = [...data].sort(function (a, b) {
            if (asc) {
                return (a[prop] > b[prop]) ? 1 : ((a[prop] < b[prop]) ? -1 : 0);
            }
            else {
                return (b[prop] > a[prop]) ? 1 : ((b[prop] < a[prop]) ? -1 : 0);
            }
        });
        setData(sortedData, []);
    }

    function changeValid(val) {
        if (val === "Active") {
            return <span style={{ backgroundColor: '#d4edda', color: '#155724', padding: '5px', borderRadius: '5px' }}>Active</span>
        } else if (val === "Inactive") {
            return <span style={{ backgroundColor: '#f8d7da', color: '#721c24', padding: '5px', borderRadius: '5px' }}>Inactive</span>;
        }
    }

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(data.length / itemsPerPage);

    const handlePageChange = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    const renderPaginationItems = () => {
        let paginationItems = [];
        if (totalPages <= 3) {
            for (let page = 1; page <= totalPages; page++) {
                paginationItems.push(
                    <Pagination.Item
                        key={page}
                        active={page === currentPage}
                        onClick={() => handlePageChange(page)}
                    >
                        {page}
                    </Pagination.Item>
                );
            }
        } else {
            paginationItems.push(
                <Pagination.Item
                    key={1}
                    active={currentPage === 1}
                    onClick={() => handlePageChange(1)}
                >
                    1
                </Pagination.Item>
            );
            if (currentPage > 3) {
                paginationItems.push(<Pagination.Ellipsis key="start-ellipsis" />);
            }
            const startPage = Math.max(2, currentPage - 1);
            const endPage = Math.min(totalPages - 1, currentPage + 1);
            for (let page = startPage; page <= endPage; page++) {
                paginationItems.push(
                    <Pagination.Item
                        key={page}
                        active={page === currentPage}
                        onClick={() => handlePageChange(page)}
                    >
                        {page}
                    </Pagination.Item>
                );
            }
            if (currentPage < totalPages - 2) {
                paginationItems.push(<Pagination.Ellipsis key="end-ellipsis" />);
            }
            paginationItems.push(
                <Pagination.Item
                    key={totalPages}
                    active={currentPage === totalPages}
                    onClick={() => handlePageChange(totalPages)}
                >
                    {totalPages}
                </Pagination.Item>
            );
        }
        return paginationItems;
    };

    return (
        <Container fluid className="employee-container">
            <div className="page-header">
                <Row className="align-items-center">
                    <Col xs={12}>
                        <div
                            className="d-flex justify-content-end align-items-center"
                            style={{
                                gap: '8px',
                                flexWrap: 'nowrap',
                                paddingRight: '24px',
                                minHeight: '48px'
                            }}
                        >
                            {/* +Add Button */}
                            <Button
                                type="button"
                                className="btn-custom1 btn-sm"
                                variant="success"
                                style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center' }}
                            >
                                <Link
                                    to="/adduser"
                                    style={{
                                        color: 'white',
                                        textDecoration: 'none',
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}
                                >
                                    <OverlayTrigger
                                        placement="top"
                                        overlay={<Tooltip id="tooltip-top" className="small-tooltip">Add</Tooltip>}
                                    >
                                        <span className="button-content" style={{ display: 'flex', alignItems: 'center' }}>
                                            <span className="icon-circle1">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" style={{ fontWeight: 'bold' }} fill="currentColor" className="bi bi-plus-lg" viewBox="0 0 16 16">
                                                    <path fillRule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2" />
                                                </svg>
                                            </span>
                                            <span className="text" style={{ marginLeft: '4px' }}>Add</span>
                                        </span>
                                    </OverlayTrigger>
                                </Link>
                            </Button>
                        </div>
                    </Col>
                </Row>
            </div>

            <Row>
                <Col xs={12}>
                    <div className="table-scroll">
                        <table >
                            <thead>
                                <tr >
                                    <th style={{ minWidth: "60px" }}>S.No</th>
                                    <th style={{ width: '320px' }}>
                                        <div className="header-cell d-flex">
                                            <span className="clickable" onClick={(e) => sortResult1('Users_FirstName', true)}>
                                                Users FirstName<span>{setSortasc.sortdirection1 === "DOWN" ? '▼' : '▲'}</span>
                                            </span>
                                        </div>
                                    </th>
                                    <th style={{ width: '300px' }}>
                                        <div className="header-cell d-flex">
                                            <span className="clickable" onClick={(e) => sortResult2('Users_LoginID', true)}>
                                                Users LoginID<span>{setSortasc.sortdirection2 === "DOWN" ? '▼' : '▲'}</span>
                                            </span>
                                        </div>
                                    </th>
                                    <th style={{ width: '320px' }}>
                                        <div className="header-cell d-flex">
                                            <span className="clickable" onClick={(e) => sortResult3('Users_email', true)}>
                                                Users email<span>{setSortasc.sortdirection3 === "DOWN" ? '▼' : '▲'}</span>
                                            </span>
                                        </div>
                                    </th>
                                    <th style={{ width: '120px' }}>
                                        <div className="header-cell d-flex">
                                            <span className="clickable" onClick={(e) => sortResult4('Users_Status_Converted', true)}>
                                                Status<span>{setSortasc.sortdirection4 === "DOWN" ? '▼' : '▲'}</span>
                                            </span>
                                        </div>
                                    </th>
                                    <th style={{ minWidth: "100px", paddingLeft: '30px' }}>Options</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentItems.map((user, index) => (
                                    <tr key={user.Users_ID}>
                                        <td style={{ width: '60px', textAlign: 'center' }}>{indexOfFirstItem + index + 1}</td>
                                        <td style={{ width: '320px' }}>{user.Users_FirstName}</td>
                                        <td style={{ width: '300px' }}>{user.Users_LoginID}</td>
                                        <td style={{ width: '320px' }}>{user.Users_email}</td>
                                        <td style={{ width: '120px' }}>{changeValid(user.Users_Status_Converted.toString())}</td>
                                        <td style={{ width: '100px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                                                {/* Edit Button */}
                                                <Button className="p-1" style={{ minWidth: 0 }}>
                                                    <OverlayTrigger
                                                        placement="top"
                                                        overlay={<Tooltip id="tooltip-top" className="small-tooltip">Edit</Tooltip>}
                                                    >
                                                        <Link to={`/edituser/${user.Users_ID}`} style={{ color: 'green', display: 'flex', alignItems: 'center' }}>
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="bi bi-pencil-square" viewBox="0 0 16 16">
                                                                <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                                                                <path fillRule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z" />
                                                            </svg>
                                                        </Link>
                                                    </OverlayTrigger>
                                                </Button>
                                                {/* Delete Button */}
                                                <Button className="p-1" style={{ minWidth: 0 }} onClick={() => deleteClick(user.Users_ID)}>
                                                    <OverlayTrigger
                                                        placement="top"
                                                        overlay={<Tooltip id="tooltip-top" className="small-tooltip">Delete</Tooltip>}
                                                    >
                                                        <span style={{ color: 'red', display: 'flex', alignItems: 'center' }}>
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="bi bi-trash-fill" viewBox="0 0 16 16">
                                                                <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0z" />
                                                            </svg>
                                                        </span>
                                                    </OverlayTrigger>
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                            </tbody>
                        </table>
                        {/* Pagination */}
                        <div className="pagination-container">
                            <Pagination className="pagination-sm d-flex align-items-center">
                                <Pagination.Prev
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                />
                                {renderPaginationItems()}
                                <Pagination.Next
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                />
                            </Pagination>
                        </div>
                    </div>
                </Col>
            </Row>
        </Container >
    );
};

export default Users