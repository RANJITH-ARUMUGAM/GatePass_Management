// // import React, { useEffect, useState } from "react";
// // import axios from 'axios'
// // import { Container, Row, Col, Table, Button, Tooltip, OverlayTrigger, Pagination } from 'react-bootstrap';
// // import { Link } from 'react-router-dom';
// // import 'bootstrap-icons/font/bootstrap-icons.css';
// // import { useNavigate } from "react-router-dom";
// // import { SERVER_PORT } from '../../../constant';
// // import { ReactSession } from 'react-client-session';


// // function Users({ setTitle }) {

// //     useEffect(() => {
// //         setTitle("Users");
// //     }, []);


// //     const [data, setData] = useState([])
// //     const [datawithoutfilter, setDatawithoutfil] = useState([])
// //     const [error, setError] = useState('Child Record Present - Cannot be Deleted')

// //     // Pagination
// //     const [currentPage, setCurrentPage] = useState(1);
// //     const itemsPerPage = 20;

// //     // Sorting state
// //     var [sortasc, setSortasc] = useState({
// //         sortdirection1: "",
// //         sortdirection2: "",
// //         sortdirection3: "",
// //         sortdirection4: "",
// //     })

// //     useEffect(() => {
// //         setSortasc.sortdirection1 = 'DOWN';
// //         setSortasc.sortdirection2 = 'DOWN';
// //         setSortasc.sortdirection3 = 'DOWN';
// //         setSortasc.sortdirection4 = 'DOWN';

// //         axios.get(`${SERVER_PORT}/users`)
// //             .then(res => {
// //                 // const activeRecords = res.data.filter(record => record.Users_Status_Converted === 'Active');
// //                 // const InactiveRecords = res.data.filter(record => record.Users_Status_Converted == 'Inactive');

// //                 setData(res.data);
// //                 setDatawithoutfil(res.data);
// //             })
// //             .catch(err => console.log(err));
// //     }, [])

// //     const deleteClick = (id) => {
// //         if (window.confirm('Are you sure you want to Delete? ')) {
// //             axios.delete(`${SERVER_PORT}/user/` + id)
// //                 .then(res => {
// //                     if (res.data.Status === 'Success') {
// //                         alert("Deleted Successfully")
// //                         axios.get(`${SERVER_PORT}/users`)
// //                             .then(res => {
// //                                 const activeRecords = res.data.filter(record => record.Users_Status_Converted === 'Active');
// //                                 setData(activeRecords);
// //                                 setDatawithoutfil(res.data);
// //                             })
// //                             .catch(err => console.log(err));
// //                     } else {
// //                         setError(res.data.Error)
// //                         alert(error && error)
// //                     }
// //                 })
// //                 .catch(err => console.log(err))
// //         }
// //     }

// //     // Sorting functions
// //     function sortResult1(prop, asc) {
// //         if (setSortasc.sortdirection1 === 'DOWN') {
// //             asc = true
// //             setSortasc.sortdirection1 = 'UP'
// //         } else {
// //             asc = false
// //             setSortasc.sortdirection1 = 'DOWN'
// //         }
// //         var sortedData = [...data].sort(function (a, b) {
// //             if (asc) {
// //                 return (a[prop] > b[prop]) ? 1 : ((a[prop] < b[prop]) ? -1 : 0);
// //             }
// //             else {
// //                 return (b[prop] > a[prop]) ? 1 : ((b[prop] < a[prop]) ? -1 : 0);
// //             }
// //         });
// //         setData(sortedData, []);
// //     }

// //     function sortResult2(prop, asc) {
// //         if (setSortasc.sortdirection2 === 'DOWN') {
// //             asc = true
// //             setSortasc.sortdirection2 = 'UP'
// //         } else {
// //             asc = false
// //             setSortasc.sortdirection2 = 'DOWN'
// //         }
// //         var sortedData = [...data].sort(function (a, b) {
// //             if (asc) {
// //                 return (a[prop] > b[prop]) ? 1 : ((a[prop] < b[prop]) ? -1 : 0);
// //             }
// //             else {
// //                 return (b[prop] > a[prop]) ? 1 : ((b[prop] < a[prop]) ? -1 : 0);
// //             }
// //         });
// //         setData(sortedData, []);
// //     }

// //     function sortResult3(prop, asc) {
// //         if (setSortasc.sortdirection3 === 'DOWN') {
// //             asc = true
// //             setSortasc.sortdirection3 = 'UP'
// //         } else {
// //             asc = false
// //             setSortasc.sortdirection3 = 'DOWN'
// //         }
// //         var sortedData = [...data].sort(function (a, b) {
// //             if (asc) {
// //                 return (a[prop] > b[prop]) ? 1 : ((a[prop] < b[prop]) ? -1 : 0);
// //             }
// //             else {
// //                 return (b[prop] > a[prop]) ? 1 : ((b[prop] < a[prop]) ? -1 : 0);
// //             }
// //         });
// //         setData(sortedData, []);
// //     }

// //     function sortResult4(prop, asc) {
// //         if (setSortasc.sortdirection4 === 'DOWN') {
// //             asc = true
// //             setSortasc.sortdirection4 = 'UP'
// //         } else {
// //             asc = false
// //             setSortasc.sortdirection4 = 'DOWN'
// //         }
// //         var sortedData = [...data].sort(function (a, b) {
// //             if (asc) {
// //                 return (a[prop] > b[prop]) ? 1 : ((a[prop] < b[prop]) ? -1 : 0);
// //             }
// //             else {
// //                 return (b[prop] > a[prop]) ? 1 : ((b[prop] < a[prop]) ? -1 : 0);
// //             }
// //         });
// //         setData(sortedData, []);
// //     }

// //     function changeValid(val) {
// //         if (val === "Active") {
// //             return <span style={{ backgroundColor: '#d4edda', color: '#155724', padding: '5px', borderRadius: '5px' }}>Active</span>
// //         } else if (val === "Inactive") {
// //             return <span style={{ backgroundColor: '#f8d7da', color: '#721c24', padding: '5px', borderRadius: '5px' }}>Inactive</span>;
// //         }
// //     }

// //     // Pagination logic
// //     const indexOfLastItem = currentPage * itemsPerPage;
// //     const indexOfFirstItem = indexOfLastItem - itemsPerPage;
// //     const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);
// //     const totalPages = Math.ceil(data.length / itemsPerPage);

// //     const handlePageChange = (pageNumber) => {
// //         if (pageNumber >= 1 && pageNumber <= totalPages) {
// //             setCurrentPage(pageNumber);
// //         }
// //     };

// //     const renderPaginationItems = () => {
// //         let paginationItems = [];
// //         if (totalPages <= 3) {
// //             for (let page = 1; page <= totalPages; page++) {
// //                 paginationItems.push(
// //                     <Pagination.Item
// //                         key={page}
// //                         active={page === currentPage}
// //                         onClick={() => handlePageChange(page)}
// //                     >
// //                         {page}
// //                     </Pagination.Item>
// //                 );
// //             }
// //         } else {
// //             paginationItems.push(
// //                 <Pagination.Item
// //                     key={1}
// //                     active={currentPage === 1}
// //                     onClick={() => handlePageChange(1)}
// //                 >
// //                     1
// //                 </Pagination.Item>
// //             );
// //             if (currentPage > 3) {
// //                 paginationItems.push(<Pagination.Ellipsis key="start-ellipsis" />);
// //             }
// //             const startPage = Math.max(2, currentPage - 1);
// //             const endPage = Math.min(totalPages - 1, currentPage + 1);
// //             for (let page = startPage; page <= endPage; page++) {
// //                 paginationItems.push(
// //                     <Pagination.Item
// //                         key={page}
// //                         active={page === currentPage}
// //                         onClick={() => handlePageChange(page)}
// //                     >
// //                         {page}
// //                     </Pagination.Item>
// //                 );
// //             }
// //             if (currentPage < totalPages - 2) {
// //                 paginationItems.push(<Pagination.Ellipsis key="end-ellipsis" />);
// //             }
// //             paginationItems.push(
// //                 <Pagination.Item
// //                     key={totalPages}
// //                     active={currentPage === totalPages}
// //                     onClick={() => handlePageChange(totalPages)}
// //                 >
// //                     {totalPages}
// //                 </Pagination.Item>
// //             );
// //         }
// //         return paginationItems;
// //     };

// //     return (
// //         <Container fluid className="employee-container">
// //             <div className="page-header">
// //                 <Row className="align-items-center">
// //                     <Col xs={12}>
// //                         <div
// //                             className="d-flex justify-content-end align-items-center"
// //                             style={{
// //                                 gap: '8px',
// //                                 flexWrap: 'nowrap',
// //                                 paddingRight: '24px',
// //                                 minHeight: '48px'
// //                             }}
// //                         >
// //                             {/* +Add Button */}
// //                             <Button
// //                                 type="button"
// //                                 className="btn-custom1 btn-sm"
// //                                 variant="success"
// //                                 style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center' }}
// //                             >
// //                                 <Link
// //                                     to="/adduser"
// //                                     style={{
// //                                         color: 'white',
// //                                         textDecoration: 'none',
// //                                         display: 'flex',
// //                                         alignItems: 'center'
// //                                     }}
// //                                 >
// //                                     <OverlayTrigger
// //                                         placement="top"
// //                                         overlay={<Tooltip id="tooltip-top" className="small-tooltip">Add</Tooltip>}
// //                                     >
// //                                         <span className="button-content" style={{ display: 'flex', alignItems: 'center' }}>
// //                                             <span className="icon-circle1">
// //                                                 <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" style={{ fontWeight: 'bold' }} fill="currentColor" className="bi bi-plus-lg" viewBox="0 0 16 16">
// //                                                     <path fillRule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2" />
// //                                                 </svg>
// //                                             </span>
// //                                             <span className="text" style={{ marginLeft: '4px' }}>Add</span>
// //                                         </span>
// //                                     </OverlayTrigger>
// //                                 </Link>
// //                             </Button>
// //                         </div>
// //                     </Col>
// //                 </Row>
// //             </div>

// //             <Row>
// //                 <Col xs={12}>
// //                     <div className="table-scroll">
// //                         <table >
// //                             <thead>
// //                                 <tr >
// //                                     <th style={{ minWidth: "60px" }}>S.No</th>
// //                                     <th style={{ width: '320px' }}>
// //                                         <div className="header-cell d-flex">
// //                                             <span className="clickable" onClick={(e) => sortResult1('Users_FirstName', true)}>
// //                                                 Users FirstName<span>{setSortasc.sortdirection1 === "DOWN" ? '▼' : '▲'}</span>
// //                                             </span>
// //                                         </div>
// //                                     </th>
// //                                     <th style={{ width: '300px' }}>
// //                                         <div className="header-cell d-flex">
// //                                             <span className="clickable" onClick={(e) => sortResult2('Users_LoginID', true)}>
// //                                                 Users LoginID<span>{setSortasc.sortdirection2 === "DOWN" ? '▼' : '▲'}</span>
// //                                             </span>
// //                                         </div>
// //                                     </th>
// //                                     <th style={{ width: '320px' }}>
// //                                         <div className="header-cell d-flex">
// //                                             <span className="clickable" onClick={(e) => sortResult3('Users_email', true)}>
// //                                                 Users email<span>{setSortasc.sortdirection3 === "DOWN" ? '▼' : '▲'}</span>
// //                                             </span>
// //                                         </div>
// //                                     </th>
// //                                     <th style={{ width: '120px' }}>
// //                                         <div className="header-cell d-flex">
// //                                             <span className="clickable" onClick={(e) => sortResult4('Users_Status_Converted', true)}>
// //                                                 Status<span>{setSortasc.sortdirection4 === "DOWN" ? '▼' : '▲'}</span>
// //                                             </span>
// //                                         </div>
// //                                     </th>
// //                                     <th style={{ minWidth: "100px", paddingLeft: '30px' }}>Options</th>
// //                                 </tr>
// //                             </thead>
// //                             <tbody>
// //                                 {currentItems.map((user, index) => (
// //                                     <tr key={user.Users_ID}>
// //                                         <td style={{ width: '60px', textAlign: 'center' }}>{indexOfFirstItem + index + 1}</td>
// //                                         <td style={{ width: '320px' }}>{user.Users_FirstName}</td>
// //                                         <td style={{ width: '300px' }}>{user.Users_LoginID}</td>
// //                                         <td style={{ width: '320px' }}>{user.Users_email}</td>
// //                                         <td style={{ width: '120px' }}>{changeValid(user.Users_Status_Converted.toString())}</td>
// //                                         <td style={{ width: '100px' }}>
// //                                             <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
// //                                                 {/* Edit Button */}
// //                                                 <Button className="p-1" style={{ minWidth: 0 }}>
// //                                                     <OverlayTrigger
// //                                                         placement="top"
// //                                                         overlay={<Tooltip id="tooltip-top" className="small-tooltip">Edit</Tooltip>}
// //                                                     >
// //                                                         <Link to={`/edituser/${user.Users_ID}`} style={{ color: 'green', display: 'flex', alignItems: 'center' }}>
// //                                                             <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="bi bi-pencil-square" viewBox="0 0 16 16">
// //                                                                 <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
// //                                                                 <path fillRule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z" />
// //                                                             </svg>
// //                                                         </Link>
// //                                                     </OverlayTrigger>
// //                                                 </Button>
// //                                                 {/* Delete Button */}
// //                                                 <Button className="p-1" style={{ minWidth: 0 }} onClick={() => deleteClick(user.Users_ID)}>
// //                                                     <OverlayTrigger
// //                                                         placement="top"
// //                                                         overlay={<Tooltip id="tooltip-top" className="small-tooltip">Delete</Tooltip>}
// //                                                     >
// //                                                         <span style={{ color: 'red', display: 'flex', alignItems: 'center' }}>
// //                                                             <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="bi bi-trash-fill" viewBox="0 0 16 16">
// //                                                                 <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0z" />
// //                                                             </svg>
// //                                                         </span>
// //                                                     </OverlayTrigger>
// //                                                 </Button>
// //                                             </div>
// //                                         </td>
// //                                     </tr>
// //                                 ))}

// //                             </tbody>
// //                         </table>
// //                         {/* Pagination */}
// //                         <div className="pagination-container">
// //                             <Pagination className="pagination-sm d-flex align-items-center">
// //                                 <Pagination.Prev
// //                                     onClick={() => handlePageChange(currentPage - 1)}
// //                                     disabled={currentPage === 1}
// //                                 />
// //                                 {renderPaginationItems()}
// //                                 <Pagination.Next
// //                                     onClick={() => handlePageChange(currentPage + 1)}
// //                                     disabled={currentPage === totalPages}
// //                                 />
// //                             </Pagination>
// //                         </div>
// //                     </div>
// //                 </Col>
// //             </Row>
// //         </Container >
// //     );
// // };

// // export default Users

// import React, { useEffect, useState } from "react";
// import axios from 'axios'
// import { Container, Row, Col, Button, Tooltip, OverlayTrigger } from 'react-bootstrap';
// import { Link, useNavigate } from 'react-router-dom';
// import { FaSearch, FaUserPlus, FaEdit, FaTrashAlt, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
// import { SERVER_PORT } from '../../../constant';
// import '../../Common.css';
// import { motion } from 'framer-motion';

// function Roles({ setTitle }) {
//     const navigate = useNavigate();
//     const [data, setData] = useState([]);
//     const [searchTerm, setSearchTerm] = useState('');
//     const [currentPage, setCurrentPage] = useState(1);
//     const itemsPerPage = 10;
//     const [sortDirection, setSortDirection] = useState({
//         Roles_RoleName: 'DOWN',
//         Roles_RoleValid: 'DOWN',
//     });

//     useEffect(() => {
//         setTitle("Roles");
//     }, [setTitle]);

//     useEffect(() => {
//         axios.get(`${SERVER_PORT}/roles`)
//             .then(res => setData(res.data))
//             .catch(err => console.log(err));
//     }, []);

//     const deleteClick = (id) => {
//         if (window.confirm('Are you sure you want to Delete? ')) {
//             axios.delete(`${SERVER_PORT}/rolesdlt/` + id)
//                 .then(res => {
//                     if (res.data.Status === 'Success') {
//                         alert("Deleted Successfully");
//                         axios.get(`${SERVER_PORT}/roles`)
//                             .then(res => setData(res.data))
//                             .catch(err => console.log(err));
//                     } else {
//                         alert(res.data.Error);
//                     }
//                 })
//                 .catch(err => console.log(err));
//         }
//     };

//     const sortData = (prop) => {
//         const direction = sortDirection[prop] === 'UP' ? 'DOWN' : 'UP';
//         const sortedData = [...data].sort((a, b) => {
//             if (direction === 'UP') {
//                 return (a[prop] > b[prop]) ? 1 : -1;
//             } else {
//                 return (a[prop] < b[prop]) ? 1 : -1;
//             }
//         });
//         setData(sortedData);
//         setSortDirection({ ...sortDirection, [prop]: direction });
//     };

//     const getStatusBadge = (status) => {
//         const isInactive = status === 'Inactive';
//         return (
//             <span
//                 className={`badge ${isInactive ? 'badge-danger' : 'badge-success'}`}
//                 style={{
//                     backgroundColor: isInactive ? '#f8d7da' : '#d4edda',
//                     color: isInactive ? '#721c24' : '#155724',
//                     padding: '5px 10px',
//                     borderRadius: '12px',
//                     fontWeight: '500',
//                 }}
//             >
//                 {status}
//             </span>
//         );
//     };

//     const filteredData = data.filter(role =>
//         (role.Roles_RoleName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
//         (role.Roles_RoleValid?.toLowerCase().includes(searchTerm.toLowerCase()))
//     );

//     const indexOfLastItem = currentPage * itemsPerPage;
//     const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//     const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
//     const totalPages = Math.ceil(filteredData.length / itemsPerPage);

//     return (
//         <Container fluid className="min-vh-100 mt-3">
//             <Row className="mb-2 align-items-center">
//                 <Col md={6}>
//                     <div className="position-relative">
//                         <FaSearch
//                             className="position-absolute top-50 translate-middle-y text-muted"
//                             style={{ left: '15px' }}
//                         />
//                         <input
//                             type="text"
//                             placeholder="Search by role name or status..."
//                             className="form-control rounded-pill shadow-sm ps-5 border-0"
//                             value={searchTerm}
//                             onChange={(e) => {
//                                 setSearchTerm(e.target.value);
//                                 setCurrentPage(1);
//                             }}
//                         />
//                     </div>
//                 </Col>
//                 <Col md={6} className="d-flex justify-content-end mt-3 mt-md-0">
//                     <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
//                         <Button
//                             onClick={() => navigate('/addroles')}
//                             className="d-flex align-items-center gap-2 px-3 py-1 rounded-pill border-0 shadow-sm"
//                             style={{ background: 'linear-gradient(45deg, #1bf107, #44a706)', fontWeight: 'bold' }}
//                         >
//                             <FaUserPlus size={18} /> Add
//                         </Button>
//                     </motion.div>
//                 </Col>
//             </Row>

//             <Row>
//                 <Col xs={12}>
//                     <div className="table-responsive shadow-sm rounded-3 overflow-hidden">
//                         <table className="table table-hover mb-0">
//                             <thead className="bg-primary text-white" style={{ background: 'linear-gradient(45deg, #007bff, #0056b3)' }}>
//                                 <tr>
//                                     <th className="">S.No</th>
//                                     <th className=" cursor-pointer" onClick={() => sortData('Roles_RoleName')}>
//                                         Role Name <span className="ms-1">{sortDirection.Roles_RoleName === 'UP' ? '▲' : '▼'}</span>
//                                     </th>
//                                     <th className=" cursor-pointer" onClick={() => sortData('Roles_RoleValid')}>
//                                         Status <span className="ms-1">{sortDirection.Roles_RoleValid === 'UP' ? '▲' : '▼'}</span>
//                                     </th>
//                                     <th className=" text-center">Options</th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 {currentItems.length > 0 ? (
//                                     currentItems.map((role, index) => (
//                                         <motion.tr
//                                             key={role.Roles_RoleID}
//                                             initial={{ opacity: 0, y: 20 }}
//                                             animate={{ opacity: 1, y: 0 }}
//                                             transition={{ duration: 0.3, delay: index * 0.05 }}
//                                         >
//                                             <td className="">{indexOfFirstItem + index + 1}</td>
//                                             <td className="">{role.Roles_RoleName}</td>
//                                             <td className="">{getStatusBadge(role.Roles_RoleValid)}</td>
//                                             <td className=" text-center">
//                                                 <div className="d-flex justify-content-center gap-2">
//                                                     <OverlayTrigger placement="top" overlay={<Tooltip>Edit</Tooltip>}>
//                                                         <Link to={`/editroles/${role.Roles_RoleID}`} className="btn btn-sm btn-outline-success border-0 rounded-circle">
//                                                             <FaEdit />
//                                                         </Link>
//                                                     </OverlayTrigger>
//                                                     <OverlayTrigger placement="top" overlay={<Tooltip>Delete</Tooltip>}>
//                                                         <Button onClick={() => deleteClick(role.Roles_RoleID)} className="btn btn-sm btn-outline-danger border-0 rounded-circle">
//                                                             <FaTrashAlt />
//                                                         </Button>
//                                                     </OverlayTrigger>
//                                                 </div>
//                                             </td>
//                                         </motion.tr>
//                                     ))
//                                 ) : (
//                                     <tr>
//                                         <td colSpan="4" className="text-center py-4 text-muted">No roles found.</td>
//                                     </tr>
//                                 )}
//                             </tbody>
//                         </table>
//                     </div>
//                 </Col>
//             </Row>

//             <motion.div
//                 className="d-flex flex-column flex-md-row justify-content-between align-items-center mt-3"
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.5 }}
//             >
//                 <span className="text-muted small">
//                     Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredData.length)} to{' '}
//                     {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} entries
//                 </span>
//                 <div className="d-flex gap-2 mt-2 mt-md-0">
//                     <Button
//                         variant="light"
//                         onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
//                         disabled={currentPage === 1}
//                         className="d-flex align-items-center"
//                     >
//                         <FaArrowLeft className="me-1" /> Previous
//                     </Button>
//                     <Button
//                         variant="light"
//                         onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
//                         disabled={currentPage === totalPages}
//                         className="d-flex align-items-center"
//                     >
//                         Next <FaArrowRight className="ms-1" />
//                     </Button>
//                 </div>
//             </motion.div>
//         </Container>
//     );
// };

// export default Roles;

import React, { useEffect, useState } from "react";
import axios from 'axios'
import { Container, Row, Col, Button, Tooltip, OverlayTrigger } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaSearch, FaUserPlus, FaEdit, FaTrashAlt, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { SERVER_PORT } from '../../../constant';
import '../../Common.css';
import { motion } from 'framer-motion';

function Users({ setTitle }) {
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [sortDirection, setSortDirection] = useState({
        Users_FirstName: 'DOWN',
        Users_LastName: 'DOWN',
        Users_LoginID: 'DOWN',
        Roles_RoleName: 'DOWN',
        Users_Status_Converted: 'DOWN',
    });

    useEffect(() => {
        setTitle("Users");
    }, [setTitle]);

    useEffect(() => {
        axios.get(`${SERVER_PORT}/users`)
            .then(res => setData(res.data))
            .catch(err => console.log(err));
    }, []);

    const deleteClick = (id) => {
        if (window.confirm('Are you sure you want to Delete? ')) {
            axios.delete(`${SERVER_PORT}/usersdlt/` + id)
                .then(res => {
                    if (res.data.Status === 'Success') {
                        alert("Deleted Successfully");
                        axios.get(`${SERVER_PORT}/users`)
                            .then(res => setData(res.data))
                            .catch(err => console.log(err));
                    } else {
                        alert(res.data.Error);
                    }
                })
                .catch(err => console.log(err));
        }
    };

    const sortData = (prop) => {
        const direction = sortDirection[prop] === 'UP' ? 'DOWN' : 'UP';
        const sortedData = [...data].sort((a, b) => {
            if (direction === 'UP') {
                return (a[prop] > b[prop]) ? 1 : -1;
            } else {
                return (a[prop] < b[prop]) ? 1 : -1;
            }
        });
        setData(sortedData);
        setSortDirection({ ...sortDirection, [prop]: direction });
    };

    const getStatusBadge = (status) => {
        const isInactive = status === 'Inactive';
        return (
            <span
                className={`badge ${isInactive ? 'badge-danger' : 'badge-success'}`}
                style={{
                    backgroundColor: isInactive ? '#f8d7da' : '#d4edda',
                    color: isInactive ? '#721c24' : '#155724',
                    padding: '5px 10px',
                    borderRadius: '12px',
                    fontWeight: '500',
                }}
            >
                {status}
            </span>
        );
    };

    const filteredData = data.filter(user =>
        (user.Users_FirstName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.Users_LastName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.Users_LoginID?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.Roles_RoleName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.Users_Status_Converted?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    return (
        <Container fluid className="min-vh-100 mt-3">
            <Row className="mb-2 align-items-center">
                <Col md={6}>
                    <div className="position-relative">
                        <FaSearch
                            className="position-absolute top-50 translate-middle-y text-muted"
                            style={{ left: '15px' }}
                        />
                        <input
                            type="text"
                            placeholder="Search by first name, last name, login ID..."
                            className="form-control rounded-pill shadow-sm ps-5 border-0"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                    </div>
                </Col>
                <Col md={6} className="d-flex justify-content-end mt-3 mt-md-0">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                            onClick={() => navigate('/Users/addusersmodel')}
                            className="d-flex align-items-center gap-2 px-3 py-1 rounded-pill border-0 shadow-sm"
                            style={{ background: 'linear-gradient(45deg, #1bf107, #44a706)', fontWeight: 'bold' }}
                        >
                            <FaUserPlus size={18} /> Add
                        </Button>
                    </motion.div>
                </Col>
            </Row>

            <Row>
                <Col xs={12}>
                    <div className="table-responsive shadow-sm rounded-3 overflow-hidden">
                        <table>
                            <thead>
                                <tr>
                                    <th className="">S.No</th>
                                    <th className=" cursor-pointer" onClick={() => sortData('Users_FirstName')}>
                                        First Name <span className="ms-1">{sortDirection.Users_FirstName === 'UP' ? '▲' : '▼'}</span>
                                    </th>
                                    <th className=" cursor-pointer" onClick={() => sortData('Users_LastName')}>
                                        Last Name <span className="ms-1">{sortDirection.Users_LastName === 'UP' ? '▲' : '▼'}</span>
                                    </th>
                                    <th className=" cursor-pointer" onClick={() => sortData('Users_LoginID')}>
                                        Login ID <span className="ms-1">{sortDirection.Users_LoginID === 'UP' ? '▲' : '▼'}</span>
                                    </th>
                                    <th className=" cursor-pointer" onClick={() => sortData('Users_Status_Converted')}>
                                        Status <span className="ms-1">{sortDirection.Users_Status_Converted === 'UP' ? '▲' : '▼'}</span>
                                    </th>
                                    <th className=" text-center">Options</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentItems.length > 0 ? (
                                    currentItems.map((user, index) => (
                                        <motion.tr
                                            key={user.Users_ID}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3, delay: index * 0.05 }}
                                        >
                                            <td className="">{indexOfFirstItem + index + 1}</td>
                                            <td className="">{user.Users_FirstName}</td>
                                            <td className="">{user.Users_LastName}</td>
                                            <td className="">{user.Users_LoginID}</td>
                                            <td className="border-0 py-2 px-3">
                                                <motion.span
                                                    whileHover={{ scale: 1.05 }}
                                                    className={`badge px-2 py-1 rounded-pill fw-normal`}
                                                    style={{
                                                        background: user.Users_Status_Converted === 'Active'
                                                            ? 'linear-gradient(90deg, #8ed334ff 0%, #35b910ff 100%)'
                                                            : user.Users_Status_Converted === 'Inactive'
                                                                ? 'rgba(206, 20, 20, 1)'
                                                                : 'linear-gradient(100deg, #4142a2ff 0%, #06b6d4 100%)',
                                                        color: '#fff',
                                                        fontSize: '12px',
                                                        fontWeight: 600,
                                                        boxShadow: '0 2px 8px rgba(0,0,0,0.07)'
                                                    }}
                                                >
                                                    {user.Users_Status_Converted || 'N/A'}
                                                </motion.span>
                                            </td>
                                            <td className="py-2 text-center">
                                                <div className="d-flex justify-content-end">
                                                    <Button variant="outline-success" size="sm" onClick={() => navigate(`/Users/edituser/${user.Users_ID}`)}>
                                                        <FaEdit />
                                                    </Button>
                                                    <Button variant="outline-danger" size="sm" onClick={() => { deleteClick(user.Users_ID) }}>
                                                        <FaTrashAlt />
                                                    </Button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="text-center py-4 text-muted">No users found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Col>
            </Row>

            <motion.div
                className="d-flex flex-column flex-md-row justify-content-between align-items-center mt-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <span className="text-muted small">
                    Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredData.length)} to{' '}
                    {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} entries
                </span>
                <div className="d-flex gap-2 mt-2 mt-md-0">
                    <Button
                        variant="light"
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="d-flex align-items-center"
                    >
                        <FaArrowLeft className="me-1" /> Previous
                    </Button>
                    <Button
                        variant="light"
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="d-flex align-items-center"
                    >
                        Next <FaArrowRight className="ms-1" />
                    </Button>
                </div>
            </motion.div>
        </Container>
    );
};

export default Users;