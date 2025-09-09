import React, { useEffect, useState } from "react";
import axios from 'axios'
import { Container, Row, Col, Table, Button, ButtonToolbar, Tooltip, OverlayTrigger, Pagination, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { SERVER_PORT } from '../../../constant';
import { ReactSession } from 'react-client-session';

function Roles({ setTitle }) {

    useEffect(() => {
        setTitle("Roles");
    }, []);


    const [data, setData] = useState([])
    const [datawithoutfilter, setDatawithoutfil] = useState([])
    const [error, setError] = useState('Child Record Present - Cannot be Deleted')

    // Pagination

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 100; // Adjust this value as needed

    // Filter Constant

    const [filteredDistinctValName, setfilteredDistinctValName] = useState([]);
    const [filteredValName, setfilteredValName] = useState([]);
    const [SelectedItemsName, setSelectedItemsName] = useState('')
    const [FilteronClickLightName, setFilteronClickLightName] = useState(false);
    const [valueSelectedDissabledName, setvalueSelectedDissabledName] = useState(false);

    const [filteredDistinctValSt, setfilteredDistinctValSt] = useState([]);
    const [filteredValSt, setfilteredValSt] = useState([]);
    const [SelectedItemsSt, setSelectedItemsSt] = useState('')
    const [FilteronClickLightSt, setFilteronClickLightSt] = useState(false);
    const [valueSelectedSt, setvalueSelectedSt] = useState(false);

    const [InitialData, setInitialData] = useState([]);

    const [ActiveData, setActiveData] = useState([]);

    const [InActiveData, setInActiveData] = useState([]);

    var [sortasc, setSortasc] = useState({
        sortdirection1: "",
        sortdirection2: "",
        sortdirection3: "",
    })

    useEffect(() => {
        // Initialize sorting directions
        setSortasc({
            sortdirection1: 'DOWN',
            sortdirection2: 'DOWN',
            sortdirection3: 'DOWN',
        });

        const selectedfy = ReactSession.get("selectedfy")

        axios.get(`${SERVER_PORT}/rolesload`)
            .then(res => {
                const activeRecords = res.data.filter(record => record.Roles_Status_Converted === 'Active');
                const InactiveRecords = res.data.filter(record => record.Roles_Status_Converted == 'Inactive');

                setData(activeRecords);
                setDatawithoutfil(res.data);
                setInitialData(res.data);
                setActiveData(activeRecords);
                setInActiveData(InactiveRecords)
            })
            .catch(err => console.log(err));

    }, [])

    const deleteClick = (id) => {
        if (window.confirm('Are you sure you want to Delete?')) {
            axios.delete(`${SERVER_PORT}/rolesdlt/` + id)
                .then(res => {
                    if (res.data.Status === 'Success') {
                        alert("Deleted Successfully")
                        //navigate('/program')

                        axios.get(`${SERVER_PORT}/rolesload`)
                            .then(res => {
                                const activeRecords = res.data.filter(record => record.Roles_Status_Converted === 'Active');
                                const InactiveRecords = res.data.filter(record => record.Roles_Status_Converted == 'Inactive');

                                setData(activeRecords);
                                setDatawithoutfil(res.data);
                                setInitialData(res.data);
                                setActiveData(activeRecords);
                                setInActiveData(InactiveRecords)
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

    /* /////////////////////////////////////////////////////////////////////////////////////// */

    /* /////////////////////////////////////////////////////////////////////////////////////// */

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

    /* //////////////////////////////////////////////////////////////////////////////////////////////////// */
    function changeValid(val) {
        if (val === "Active") {
            return <span style={{ backgroundColor: '#d4edda', color: '#155724', padding: '5px', borderRadius: '5px' }}>Active</span>

        } else if (val === "Inactive") {
            return <span style={{ backgroundColor: '#f8d7da', color: '#721c24', padding: '5px', borderRadius: '5px' }}>Inactive</span>;

        } /* else {
        return <span style={{ backgroundColor: '#fff3cd', color: '#856404', padding: '5px', borderRadius: '5px' }}>Not Found</span>;
   } */
    }

    // ------------------------status FILTER STARTS-----------------------/

    const colDropdownfilterSt = (e) => {
        e.stopPropagation();

        if (!Array.isArray(InitialData) || InitialData.length === 0) {
            setfilteredValSt([]);
            return;
        }

        const uniqueValues = Array.from(new Set(InitialData.map(item => item.Roles_Status_Converted)))
            .map(value => ({ Roles_Status_Converted: value }));

        const sortedValues = uniqueValues.sort((a, b) => {
            const aIsSelected = SelectedItemsSt.includes(a.Roles_Status_Converted);
            const bIsSelected = SelectedItemsSt.includes(b.Roles_Status_Converted);
            if (aIsSelected && !bIsSelected) {
                return -1;
            }
            if (!aIsSelected && bIsSelected) {
                return 1;
            }
            return 0;
        });

        setfilteredValSt(sortedValues);

        setfilteredDistinctValSt(uniqueValues);
        setvalueSelectedSt(false)

        //setShowModalSt(true);
    };

    //--------------------------------Status ednds here----------------------------------------------

    /* **********************************NAME FILTER****************************************************************************** */

    const colDropdownfilterName = (e) => {
        e.stopPropagation();

        if (!Array.isArray(InitialData) || InitialData.length === 0) {
            setfilteredValName([]);
            return;
        }
        var uniqueValues;

        if (SelectedItemsSt == 'Active' || SelectedItemsSt == '') {

            uniqueValues = Array.from(new Set(ActiveData.map(item => item.Roles_RoleName)))
                .map(value => ({ Roles_RoleName: value }));

        }
        else {

            uniqueValues = Array.from(new Set(InActiveData.map(item => item.Roles_RoleName)))
                .map(value => ({ Roles_RoleName: value }));

        }

        const sortedValues = uniqueValues.sort((a, b) => {
            const aIsSelected = SelectedItemsName.includes(a.Roles_RoleName);
            const bIsSelected = SelectedItemsName.includes(b.Roles_RoleName);
            if (aIsSelected && !bIsSelected) {
                return -1;
            }
            if (!aIsSelected && bIsSelected) {
                return 1;
            }
            return 0;
        });

        setfilteredValName(sortedValues);

        setfilteredDistinctValName(sortedValues);
        setvalueSelectedDissabledName(false)

        //setShowModalName(true);
    };

    /* **************************************************************************************************************** */

    // Calculate the current items to be displayed on the current page
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);

    // Determine the total number of pages
    const totalPages = Math.ceil(data.length / itemsPerPage);

    // Handler for page change
    const handlePageChange = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    const renderPaginationItems = () => {
        let paginationItems = [];

        if (totalPages <= 3) {
            // Show all pages if there are 5 or less
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
            // More than 5 pages, show first, last, and ellipsis
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
                        <div className="d-flex justify-content-between align-items-center flex-nowrap" style={{ gap: '16px', flexWrap: 'nowrap', paddingLeft: '8px', paddingRight: '24px' }}>
                            {/* Breadcrumb */}
                            <div className="d-flex align-items-center flex-nowrap" style={{ gap: '8px', fontSize: '15px', color: 'black' }}>
                                <span className="custom-Nav-header" style={{ color: '#222', fontWeight: 500 }}>Roles</span>
                            </div>
                            {/* +Add Button */}
                            <Button type="button" className="btn-custom1 btn-sm" variant="success">
                                <Link to="/addroles" style={{ color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
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


            {/* ///////////////////////////////////////////////////////////////////////////////////////////// */}

            <Row>
                <Col xs={12}>
                    <div className="table-scroll">
                        <table>
                            <thead className="tbody-sticky">
                                <tr className="bg-green-gradient">
                                    <th style={{ minWidth: "60px" }}>S.No</th>

                                    <th style={{ width: '150px' }}>
                                        <div className="header-cell d-flex">
                                            <span className="clickable" onClick={(e) => sortResult1('Roles_Code', true)}>
                                                Role Code<span>{setSortasc.sortdirection1 === "DOWN" ? '▼' : '▲'}</span>
                                            </span>

                                        </div>
                                    </th>
                                    <th style={{ width: '720px' }}>
                                        <div className="header-cell d-flex">
                                            <span className="clickable" onClick={(e) => sortResult2('Roles_RoleName', true)}>
                                                Role Name<span>{setSortasc.sortdirection2 === "DOWN" ? '▼' : '▲'}</span>
                                            </span>
                                            <span className="filter-container d-flex">
                                                <svg onClick={colDropdownfilterName} xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-filter" viewBox="0 0 16 16">
                                                    <path d="M6 10.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5m-2-3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5m-2-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5" />
                                                </svg>
                                                <div className={FilteronClickLightName ? 'led-yellow-Orange' : ''} style={{ marginLeft: '8px' }}></div>
                                            </span>
                                        </div>
                                    </th>
                                    <th style={{ width: '120px' }}>
                                        <div className="header-cell d-flex">
                                            <span className="clickable" onClick={(e) => sortResult3('Roles_Status_Converted', true)}>
                                                Status<span>{setSortasc.sortdirection3 === "DOWN" ? '▼' : '▲'}</span>
                                            </span>
                                            <span className="filter-container d-flex">
                                                <svg onClick={colDropdownfilterSt} xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-filter" viewBox="0 0 16 16">
                                                    <path d="M6 10.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5m-2-3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5m-2-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5" />
                                                </svg>
                                                <div className={FilteronClickLightSt ? 'led-yellow-Orange' : ''} style={{ marginLeft: '8px' }}></div>
                                            </span>
                                        </div>
                                    </th>

                                    <th style={{ minWidth: "100px", paddingLeft: '30px' }}>Options</th>
                                </tr>
                            </thead>

                            <tbody  >
                                {currentItems.map((rol, index) => (
                                    <tr key={rol.Roles_ID}>

                                        <td style={{ width: '60px' }} >{indexOfFirstItem + index + 1}</td>
                                        <td style={{ width: '150px' }} >{rol.Roles_Code}</td>
                                        <td style={{ width: '720px' }} >{rol.Roles_RoleName}</td>
                                        <td style={{ width: '120px' }} >{changeValid(rol.Roles_Status_Converted.toString())}</td>
                                        <td style={{ width: '100px' }} >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                                                {/* Edit Button */}
                                                <Button className="p-1" style={{ minWidth: 0 }}>
                                                    <OverlayTrigger
                                                        placement="top"
                                                        overlay={<Tooltip id="tooltip-top" className="small-tooltip">Edit</Tooltip>}
                                                    >
                                                        <Link to={`/editroles/${rol.Roles_ID}`} style={{ color: 'green', display: 'flex', alignItems: 'center' }}>
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="bi bi-pencil-square" viewBox="0 0 16 16">
                                                                <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                                                                <path fillRule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z" />
                                                            </svg>
                                                        </Link>
                                                    </OverlayTrigger>
                                                </Button>
                                                {/* Delete Button */}
                                                <Button className="p-1" style={{ minWidth: 0 }} onClick={() => deleteClick(rol.Roles_ID)}>
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

export default Roles