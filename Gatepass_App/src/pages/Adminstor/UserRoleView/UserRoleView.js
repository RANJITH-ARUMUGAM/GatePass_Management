import React, { useEffect, useState } from "react";
import axios from 'axios'
import { Container, Row, Col, Pagination } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { SERVER_PORT } from '../../../constant';
import { ReactSession } from 'react-client-session';

function UserRoleView({ setTitle }) {


    useEffect(() => {
        setTitle("User Role View");
    }, []);

    const [data, setData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 100;

    useEffect(() => {
        axios.get(`${SERVER_PORT}/UserRoleView`)
            .then(res => setData(res.data))
            .catch(err => console.log(err));
    }, []);

    // Sorting functions (if used in UI)
    function sortResult3(prop, asc) {
        let direction = asc;
        let sortedData = [...data].sort((a, b) => {
            if (direction) {
                return (a[prop] > b[prop]) ? 1 : ((a[prop] < b[prop]) ? -1 : 0);
            } else {
                return (b[prop] > a[prop]) ? 1 : ((b[prop] < a[prop]) ? -1 : 0);
            }
        });
        setData(sortedData);
    }
    function sortResult4(prop, asc) {
        let direction = asc;
        let sortedData = [...data].sort((a, b) => {
            if (direction) {
                return (a[prop] > b[prop]) ? 1 : ((a[prop] < b[prop]) ? -1 : 0);
            } else {
                return (b[prop] > a[prop]) ? 1 : ((b[prop] < a[prop]) ? -1 : 0);
            }
        });
        setData(sortedData);
    }
    function sortResult5(prop, asc) {
        let direction = asc;
        let sortedData = [...data].sort((a, b) => {
            if (direction) {
                return (a[prop] > b[prop]) ? 1 : ((a[prop] < b[prop]) ? -1 : 0);
            } else {
                return (b[prop] > a[prop]) ? 1 : ((b[prop] < a[prop]) ? -1 : 0);
            }
        });
        setData(sortedData);
    }

    // Pagination
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
                    <Col md={6}>
                        <h4 style={{ fontStyle: 'italic' }}> User Role View </h4>
                    </Col>
                </Row>
            </div>
            <Row>
                <Col xs={12}>
                    <div className="table-scroll">
                        <table>
                            <thead>
                                <tr>
                                    <th>S.No</th>
                                    <th>
                                        <div className="header-cell d-flex">
                                            <span className="clickable" onClick={() => sortResult3('Roles_RoleName', true)}>
                                                Role
                                            </span>
                                        </div>
                                    </th>
                                    <th style={{ width: '300px' }}>
                                        <div className="header-cell d-flex">
                                            <span className="clickable" onClick={() => sortResult4('Users_FirstName', true)}>
                                                First Name
                                            </span>
                                        </div>
                                    </th>
                                    <th style={{ width: '150px' }}>
                                        <div className="header-cell d-flex">
                                            <span className="clickable" onClick={() => sortResult5('Users_LoginID', true)}>
                                                Login Id
                                            </span>
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentItems.map((hdr, index) => (
                                    <tr key={hdr.UserRole_ID}>
                                        <td style={{ width: '60px', textAlign: 'center' }}>{indexOfFirstItem + index + 1}</td>
                                        <td style={{ width: '220px' }}>{hdr.Roles_RoleName}</td>
                                        <td style={{ width: '300px' }}>{hdr.Users_FirstName}</td>
                                        <td style={{ width: '150px' }}>{hdr.Users_LoginID}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
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
                </Col>
            </Row>
        </Container>
    );
}
export default UserRoleView;