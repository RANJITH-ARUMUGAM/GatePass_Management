import React, { useState, useEffect } from 'react';
import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { 
  FaBuilding, FaTags, FaCalendarCheck, FaBriefcase, FaGear, 
  FaUserShield, FaUser, FaUserCheck, FaGears // <-- use FaGears instead of FaCogs
} from "react-icons/fa6";
import { FaUserCog } from "react-icons/fa"; // <-- FaUserCog from fa
import { BsPeople, BsGrid, BsCreditCard2Front } from "react-icons/bs";
import '../HomePage/home.css';

//HomePages
import TopNavbar from '../HomePage/TopNavBar/Topnavbar.js';
import EditProfile from '../HomePage/EditProfile/editProfile.js';
import ChangePassword from '../HomePage/ChangePassword/changePassword.js';
import Breadcrumbs from '../HomePage/BreadCrumBar/BreadCrum.js';
import Card from '../HomePage/Card/Card.js';


//MetaData
import Meta from "../MetaData/MetaForm.js";


//Transactions
import User from "../Transaction/Admin/UserList.js";
import Edituser from "../Transaction/Admin/Edituser.js";
import Adduser from "../Transaction/Admin/AddUsers.js";

import Lobby from '../Transaction/Lobby/Lobby.js';
import LobbyEntry from "../Transaction/Lobby/LobbyEntry.js";

import AddGateEntry from "../Transaction/VisitorsDetails/AddGateEntry.js";
import GenerateVisitorIDCard from "../Transaction/VisitorsDetails/GenerateVisitorIDCard.js";
import Gate from '../Transaction/VisitorsDetails/Gate.js';
import VisitorsDetails from '../Transaction/VisitorsDetails/VisitorsDetails.js';
import ViewVisitor from '../Transaction/VisitorsDetails/ViewVisitor.js';
import EditVisitor from '../Transaction/VisitorsDetails/EditVisitor.js';

import Departments from '../Transaction/Departments/Departments.js';
import Departmentsadd from '../Transaction/Departments/Departmentsadd.js';
import Departmentedit from '../Transaction/Departments/Departmentedit.js';

import DesignationsList from '../Transaction/Designations/DesignationsList.js';
import DesignationForm from '../Transaction/Designations/DesignationForm.js';

import Employees from '../Transaction/Emplayoee/Emplayoee.js';
import EmployeeAdd from '../Transaction/Emplayoee/Emplayoeeadd.js';
import EmployeeEdit from '../Transaction/Emplayoee/Emplayoeeedit.js';
import ViewEmplayoee from '../Transaction/Emplayoee/Emplayoeeview';

import AppointmentBookingForm from '../Transaction/BookAppointments/BookAppointment.js';

import AttendanceAdmin from '../Transaction/AttendanceAdmin/AttendanceAdmin.js';
import AttendanceEmployee from '../Transaction/AttendanceEmployee/AttendanceEmployee.js';
import AdminAttendanceEdit from '../Transaction/AttendanceAdmin/AdminAttendanceEdit.js';

//------Adminstration----//
import Module from "../Adminstor/Module/Module"
import AddModuleModel from "../Adminstor/Module/AddModuleModel";
import EditModuleModel from "../Adminstor/Module/EditModuleModel";
import Program from "../Adminstor/Program/Program";
import AddProgramModel from "../Adminstor/Program/AddProgramModel";
import EditProgramModel from "../Adminstor/Program/EditProgramModel";
import Roles from "../Adminstor/Roles/Roles"
import AddRolesModel from "../Adminstor/Roles/AddRolesModel";
import EditRolesModel from "../Adminstor/Roles/EditRolesModel";
import RoleProgram from "../Adminstor/RoleProgram/RoleProgram";
import Users from "../Adminstor/Users/Users";
import AddUsers from "../Adminstor/Users/AddUsersModel";
import EditUsersModel from "../Adminstor/Users/EditUserModel";
import UserRole from "../Adminstor/UserRole/UserRole";
import UserRoleView from "../Adminstor/UserRoleView/UserRoleView"
import ProfileView from "../Adminstor/Users/ProfileView"





export default function Home() {
  const [data, setData] = useState('DashBoard');
  const [isSidenavOpen, setIsSidenavOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredNavItems, setFilteredNavItems] = useState([]);
  
  // Transition duration and easing stored in state (can be updated dynamically)
  const [transitionDuration, setTransitionDuration] = useState('0.3s');
  const [transitionEasing, setTransitionEasing] = useState('ease');

  const navItems = [
    
    { name: "Operations", isHeading: true },
    { name: "Departments", icon: <FaBuilding />, component: "Departments" },
    { name: "Designations List", icon: <FaTags />, component: "DesignationsList" },
    { name: "Employees", icon: <FaBriefcase />, component: "Employees" },
    
    { name: "Visitors", isHeading: true },
    { name: "Visitors Details", path: "/gate/visitorsdetails", icon: <BsPeople />, component: "gate/VisitorsDetails" },
    { name: "Visitors ID Card", icon: <BsCreditCard2Front />, component: "GenerateVisitorIDCard" },

    { name: "Attendance", isHeading: true },
    { name: "Attendance Admin", icon: <FaCalendarCheck />, component: "AttendanceAdmin" },
    { name: "Attendance Employee", icon: <FaUserCheck />, component: "AttendanceEmployee" },
    { name: "Leaves", icon: <FaGears />, component: "Leaves" }, 

    { name: "Setup", isHeading: true },
    { name: "MetaData", icon: <FaGear />, component: "Metadata" },

    { name: "Administrators", isHeading: true },
    { name: "Module", icon: <FaGears />, component: "Module" }, 
    { name: "Program", icon: <FaUserCog />, component: "Program" },
    { name: "Roles", icon: <FaUserShield />, component: "Roles" },
    { name: "Mapping Role & Program", icon: <FaUserCog />, component: "RoleProgram" },
    { name: "Admin Users", icon: <FaUser />, component: "User" },
    { name: "Users", icon: <BsPeople />, component: "Users" },
    { name: "Mapping User to Role", icon: <FaUserCheck />, component: "UserRole" },
    { name: "User Role View", icon: <BsPeople />, component: "UserRoleView" }
  ];


  useEffect(() => {
    setFilteredNavItems(navItems);
  }, []);

  // Update CSS variables dynamically on mount and when duration/easing changes
  useEffect(() => {
    document.documentElement.style.setProperty('--transition-duration', transitionDuration);
    document.documentElement.style.setProperty('--transition-easing', transitionEasing);
  }, [transitionDuration, transitionEasing]);

  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    const filteredItems = navItems.filter(item =>
      item.name.toLowerCase().includes(query)
    );
    setFilteredNavItems(filteredItems);
  };

  return (
    <div className={`layout-unique ${isSidenavOpen ? 'shift-right-unique' : ''}`}>
      <aside className={`sidebar-unique ${isSidenavOpen ? 'open-unique' : ''}`}>
        <button
          className="hamburger-icon"
          onClick={() => setIsSidenavOpen(!isSidenavOpen)}
        >
          {isSidenavOpen ? (
            <BsGrid />
          ) : (
            <BsGrid />
          )}
        </button>
        <br />
        <div className="sidebar-search-unique">
          <input
            type="text"
            className="search-input-unique"
            placeholder="Search..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
        <ul className="nav-list-unique">
          {filteredNavItems.map((item, index) => (
            item.isHeading ? (
              <li key={index} className="nav-heading-unique">{item.name}</li>
            ) : (
              <li key={index} className="nav-item-unique" data-name={item.name}>
                <NavLink
                  to={`/${item.component.toLowerCase()}`}
                  className="nav-link-unique"
                >
                  {item.icon} <span>{item.name}</span>
                </NavLink>
              </li>
            )
          ))}
        </ul>
      </aside>

      <div className={`top-navbar ${isSidenavOpen ? 'shift-right-unique' : ''}`}>
        <TopNavbar isSidenavOpen={isSidenavOpen} setIsSidenavOpen={setIsSidenavOpen} />
      </div>

      <div className={`main-content-unique ${isSidenavOpen ? 'shift-right-unique' : ''}`}>
        <h2>{data}</h2>
        <Breadcrumbs />
        <Routes>
          <Route path="/" element={<Card setData={setData} />} />
          <Route path="/user" element={<User setData={setData} />} />
          <Route path="/user/adduser" element={<Adduser setData={setData} />} />
          <Route path="/user/edituser" element={<Edituser setData={setData} />} />

          <Route path="/editprofile" element={<EditProfile setData={setData} />} />
          <Route path="/ChangePassword" element={<ChangePassword setData={setData} />} />

          <Route path="/gate" element={<Gate setData={setData} />} />
          <Route path="/gate/AddGateEntry" element={<AddGateEntry setData={setData} />} />
          <Route path="GenerateVisitorIDCard" element={<GenerateVisitorIDCard setData={setData} />} />
          <Route path='/gate/visitorsdetails' element={<VisitorsDetails setData={setData} />} />
          <Route path="/editvisitor/:id" element={<EditVisitor setData={setData} />} />
          <Route path="/viewvisitor/:id" element={<ViewVisitor setData={setData} />} />

          <Route path="/departments" element={<Departments setData={setData} />} />
          <Route path="/departmentsadd" element={<Departmentsadd setData={setData} />} />
          <Route path="/departmentedit" element={<Departmentedit setData={setData} />} />

          <Route path="/designationslist" element={<DesignationsList setData={setData} />} />
          <Route path="/designationsfrom" element={<DesignationForm setData={setData} />} />
          <Route path="/designationsfrom/edit/:id" element={<DesignationForm setData={setData} />} />

          <Route path="/employees" element={<Employees setData={setData} />} />
          <Route path="/viewemplayoee/:id" element={<ViewEmplayoee setData={setData} />} />
          <Route path="/employeeadd" element={<EmployeeAdd setData={setData} />} />
          <Route path="/employeeedit" element={<EmployeeEdit setData={setData} />} />

          <Route path="/lobby/lobbyentry" element={<LobbyEntry setData={setData} />} />
          <Route path="/lobby" element={<Lobby setData={setData} />} />
          <Route path="/lobby/bookappointment" element={<AppointmentBookingForm setData={setData} />} />

          <Route path="/metadata" element={<Meta setData={setData} />} />

          <Route path="/attendanceadmin" element={<AttendanceAdmin setData={setData} />} />
          <Route path="/attendanceemployee" element={<AttendanceEmployee setData={setData} />} />
          <Route path="/adminattendanceedit/:id" element={<AdminAttendanceEdit setData={setData} />} />


          <Route path="/module" element={<Module />} />
          <Route path="/addmodule" element={<AddModuleModel />} />
          <Route path="/editmodule/:id" element={<EditModuleModel />} />
          <Route path="/program" element={<Program />} />
          <Route path="/addprogram" element={<AddProgramModel />} />
          <Route path="/editprogram/:id" element={<EditProgramModel />} />
          <Route path="/roles" element={<Roles />} />
          <Route path="/addroles" element={<AddRolesModel />} />
          <Route path="/editroles/:id" element={<EditRolesModel />} />
          <Route path="/roleprogram" element={<RoleProgram />} />

          <Route path="/Users" element={<Users />} />
          <Route path="/adduser" element={<AddUsers />} />
          <Route path="/edituser/:id" element={<EditUsersModel />} />
          <Route path="/profileview/:id" element={<ProfileView />} />

          <Route path="/userrole" element={<UserRole />} />
          <Route path="/UserRoleView" element={<UserRoleView />} />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </div>
  );
}
