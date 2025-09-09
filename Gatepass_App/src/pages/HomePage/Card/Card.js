import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Eye, Calendar, ClipboardList, Award, ShieldAlert, Car, Package, Ticket, Truck, Box, Download, Bell, Building2, CheckCircle, XCircle, UserX, UserPlus,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ReactSession } from 'react-client-session';
import axios from "axios";
import { SERVER_PORT } from '../../../constant';

// --- Utility Components ---

const Card = ({ children, className = '', onClick }) => (
  <div
    className={`bg-white p-6 rounded-xl shadow-md ${className}`}
    onClick={onClick}
    style={onClick ? { cursor: 'pointer' } : {}}
  >
    {children}
  </div>
);


const Badge = ({ status }) => {
  let colorClass = '';
  let text = '';
  switch (status) {
    case 'Checked-in':
      colorClass = 'bg-green-100 text-green-800';
      text = 'Checked-in';
      break;
    case 'Accepted':
      colorClass = 'bg-green-100 text-green-800';
      text = 'Accepted';
      break;
    case 'Checked-out':
      colorClass = 'bg-red-100 text-red-800';
      text = 'Checked-out';
      break;
    case 'Pending':
      colorClass = 'bg-yellow-100 text-yellow-800';
      text = 'Pending';
      break;
    case 'Inbound':
      colorClass = 'bg-blue-100 text-blue-800';
      text = 'Inbound';
      break;
    case 'Outbound':
      colorClass = 'bg-purple-100 text-purple-800';
      text = 'Outbound';
      break;
    case 'Approved':
      colorClass = 'bg-green-100 text-green-800';
      text = 'Approved';
      break;
    case 'Denied':
      colorClass = 'bg-red-100 text-red-800';
      text = 'Denied';
      break;
    case 'Outward':
      colorClass = 'bg-red-100 text-white-800';
      text = 'Outward';
      break;
    case 'Inward':
      colorClass = 'bg-green-100 text-white-800';
      text = 'Inward';
      break;
    default:
      colorClass = 'bg-gray-100 text-gray-800';
      text = status;
  }
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
      {text}
    </span>
  );
};


export default function Cards({ setTitle }) {
  const navigate = useNavigate();
  const [summary, setSummary] = useState({});
  const [liveVisitors, setLiveVisitors] = useState([]);
  const [upcomingVisitors, setUpcomingVisitors] = useState([]);
  const [recentVisitors, setRecentVisitors] = useState([]);
  const [frequentVisitors, setFrequentVisitors] = useState([]);
  const [securityAlerts, setSecurityAlerts] = useState([]);
  const [employeeAccess, setEmployeeAccess] = useState([]);
  const [materialMovement, setMaterialMovement] = useState([]);
  const [vehicleMonitoring, setVehicleMonitoring] = useState([]);
  const [visitorTrends, setVisitorTrends] = useState([]);
  const [peakHours, setPeakHours] = useState([]);

  const [totalEmployeesList, settotalEmployeesList] = useState([]);
  const [visitorsTodayList, setvisitorsTodayList] = useState([]);
  const [currentlyInsideList, setcurrentlyInsideList] = useState([]);
  const [pendingApprovalsList, setpendingApprovalsList] = useState([]);
  const [vehiclesInsideList, setvehiclesInsideList] = useState([]);
  const [materialMovementsTodayList, setmaterialMovementsTodayList] = useState([]);
  const [totalVisitorsThisMonthList, settotalVisitorsThisMonthList] = useState([]);


  // Pagination and search 
  const [searchLiveVisitors, setSearchLiveVisitors] = useState('');
  const [searchupcomingVisitors, setsearchUpcomingVisitors] = useState('');
  const [searchRecentVisitors, setsearchRecentVisitors] = useState('');
  const [searchfrequentVisitors, setsearchFrequentVisitors] = useState('');
  const [searchsecurityAlerts, setsearchSecurityAlerts] = useState('');
  const [searchemployeeAccess, setsearchEmployeeAccess] = useState('');
  const [searchvehicleMonitoring, setsearchVehicleMonitoring] = useState('');
  const [searchmaterialMovement, setsearchMaterialMovement] = useState('');
  const [pageLiveVisitors, setpageLiveVisitors] = useState(1);
  const [pageupcomingVisitors, setpageUpcomingVisitors] = useState(1);
  const [pageRecentVisitors, setpageRecentVisitors] = useState(1);
  const [pagefrequentVisitors, setpageFrequentVisitors] = useState(1);
  const [pageSecurityAlerts, setpageSecurityAlerts] = useState(1);
  const [pageemployeeAccess, setpageEmployeeAccess] = useState(1);
  const [pageVehicleMonitoring, setpageVehicleMonitoring] = useState(1);
  const [pageMaterialMovement, setpageMaterialMovement] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    setTitle("Cards");
    fetchDashboardData()
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await axios.get(`${SERVER_PORT}/Dashboard_combined_view_VW`);
      const dashboardData = res.data.dashboard_data || {};

      // Set all the states with the received data
      setSummary(dashboardData.summary || {});
      setLiveVisitors(dashboardData.liveVisitors || []);
      setUpcomingVisitors(dashboardData.upcomingVisitors || []);
      setRecentVisitors(dashboardData.recentVisitors || []);
      setFrequentVisitors(dashboardData.frequentVisitors || []);
      setSecurityAlerts(dashboardData.securityAlerts || []);
      setEmployeeAccess(dashboardData.employeeAccess || []);
      setVehicleMonitoring(dashboardData.vehicleMonitoring || []);
      setMaterialMovement(dashboardData.materialMovements || []);
      setVisitorTrends(dashboardData.visitorTrends || []);
      setPeakHours(dashboardData.peakHours || []);
      settotalEmployeesList(dashboardData.totalEmployeesList || []);
      setvisitorsTodayList(dashboardData.visitorsTodayList || []);
      setcurrentlyInsideList(dashboardData.currentlyInsideList || []);
      setpendingApprovalsList(dashboardData.pendingApprovalsList || []);
      setvehiclesInsideList(dashboardData.vehiclesInsideList || []);
      setmaterialMovementsTodayList(dashboardData.materialMovementsTodayList || []);
      settotalVisitorsThisMonthList(dashboardData.totalVisitorsThisMonthList || []);


    } catch (err) {
      console.error("Error fetching dashboard:", err);
    }
  };




  // Simulate real-time updates for 'Currently Inside Premises'
  useEffect(() => {
    const interval = setInterval(() => {
      if (liveVisitors && liveVisitors.length > 0) {
        setSummary(prev => ({
          ...prev,
          currentlyInside: liveVisitors.filter(v => v.status === 'Accepted').length,
        }));
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [liveVisitors]);

  // const handleManualCheckout = (id) => {
  //   setLiveVisitors(prev =>
  //     prev.map(visitor =>
  //       visitor.id === id ? { ...visitor, status: 'Checked-out', expectedexittime: 'Checked Out Now' } : visitor
  //     )
  //   );
  //   setRecentVisitors(prev => {
  //     const updatedRecent = prev.map(visitor =>
  //       visitor.id === id ? { ...visitor, status: 'Checked-out', timeOut: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) } : visitor
  //     );
  //     if (!updatedRecent.some(v => v.id === id)) {
  //       const checkedOutVisitor = liveVisitors.find(v => v.id === id);
  //       if (checkedOutVisitor) {
  //         return [{
  //           id: checkedOutVisitor.id,
  //           name: checkedOutVisitor.name,
  //           photo: checkedOutVisitor.photo,
  //           contact: checkedOutVisitor.phone, 
  //           host: checkedOutVisitor.host,
  //           timeIn: checkedOutVisitor.entrytime,
  //           timeOut: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
  //           status: 'Checked-out'
  //         }, ...updatedRecent];
  //       }
  //     }
  //     return updatedRecent;
  //   });
  //   console.log(`Manual checkout for visitor ID: ${id}`);
  // };


  const handleManualCheckout = async (gateEntryId, modifiedBy) => {
    try {
      const response = await axios.post(`${SERVER_PORT}/manual-checkout`, {
        gateEntryId,
        modifiedBy,
      });

      if (response.status === 200) {
        alert('Visitor successfully checked out.');
        fetchDashboardData(); // Refresh dashboard data after successful checkout
      } else {
        alert('Manual checkout failed. Please try again.');
      }
    } catch (error) {
      console.error('Manual checkout error:', error);
      alert(
        error.response?.data?.message || 'An error occurred during manual checkout.'
      );
    }
  };

  const handleUpcomingAction = (id, action) => {
    const newStatus = action === 'approve' ? 'approved' : 'rejected';
    const updateStatus = async () => {
      try {
        await axios.put(`${SERVER_PORT}/updateappointments/${id}`, {
          gms_status: newStatus
        });
        // Refresh data for this visitor
        const response = await axios.get(`${SERVER_PORT}/preBookings/${id}`);
        setUpcomingVisitors(prev =>
          prev.map(visitor =>
            visitor.id === id ? { ...visitor, status: response.data.data?.gms_status || newStatus } : visitor
          )
        );
        console.log(`${action} for upcoming visitor ID: ${id}`);
      } catch (err) {
        console.error("Error updating status:", err);
        alert("Failed to update status");
      }
    };
    updateStatus();
  };

  const handleFlagVisitor = (id, isVIP) => {
    setFrequentVisitors(prev =>
      prev.map(visitor =>
        visitor.id === id ? { ...visitor, isVIP: isVIP, isSuspicious: !isVIP } : visitor
      )
    );
    console.log(`Visitor ID ${id} flagged as ${isVIP ? 'VIP' : 'Suspicious'}`);
  };

  const handleSecurityAlertAction = (id, action) => {
    console.log(`Security alert ID ${id}: ${action}`);
    if (action === 'Clear') {
      setSecurityAlerts(prev => prev.filter(alert => alert.id !== id));
    }
  };

  const handleQuickAction = (action) => {
    console.log(`Quick action: ${action}`);
    if (action === 'Register New Visitor') {
      navigate('/gate/AddGateEntry');
    } else if (action === 'Generate GatePass') {
      navigate('/GenerateVisitorIDCard');
    } else if (action === 'Add Material Movement') {
      navigate('/MaterialMovementModule');
    } else if (action === 'Log Vehicle Entry') {
      navigate('/LogVehicleEntryModul');
    } else {
      alert(`Action: ${action} - (This would open a form/modal or navigate in a real application)`);
    }
  };

  const [drawerData, setDrawerData] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Filter and paginate
  const filteredData = drawerData?.data?.filter((item) => {
    const searchTerm = searchQuery.toLowerCase();

    switch (drawerData.type) {
      case 'totalEmployeesList':
        return (
          (item.gms_first_name || '').toLowerCase().includes(searchTerm) ||
          (item.gms_last_name || '').toLowerCase().includes(searchTerm) ||
          (item.gms_email || '').toLowerCase().includes(searchTerm)
        );

      case 'visitors-today':
      case 'visitors-month':
      case 'current-visitors':
      case 'pending-approvals':
        return (
          (item.gms_visitorname || '').toLowerCase().includes(searchTerm) ||
          (item.gms_visitorfrom || '').toLowerCase().includes(searchTerm) ||
          (item.gms_tomeet || '').toLowerCase().includes(searchTerm) ||
          (item.gms_mobileno || '').toLowerCase().includes(searchTerm)
        );

      case 'vehicles-inside':
        return (
          (item.GMS_vehicle_number || '').toLowerCase().includes(searchTerm) ||
          (item.GMS_driver_name || '').toLowerCase().includes(searchTerm) ||
          (item.GMS_vehicle_type || '').toLowerCase().includes(searchTerm)
        );

      case 'material-movements':
        return (
          (item.GMS_material_name || '').toLowerCase().includes(searchTerm) ||
          (item.GMS_material_type || '').toLowerCase().includes(searchTerm) ||
          (item.GMS_source_location || '').toLowerCase().includes(searchTerm) ||
          (item.GMS_destination_location || '').toLowerCase().includes(searchTerm)
        );

      default:
        return true;
    }
  }) || [];

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  const closeDrawer = () => {
    setDrawerData(null);
    setSearchQuery('');
    setCurrentPage(1);
  };

  const exportToCSV = (data, filename) => {
    const csvRows = [];
    const headers = Object.keys(data[0] || {}).join(',');
    csvRows.push(headers);

    data.forEach((row) => {
      const values = Object.values(row).map((val) => `"${val}"`);
      csvRows.push(values.join(','));
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  };


  const filteredMaterialMovement = materialMovement.filter(
    (material) =>
      (material.description || '').toLowerCase().includes(searchmaterialMovement.toLowerCase()) ||
      (material.purpose || '').toLowerCase().includes(searchmaterialMovement.toLowerCase()) ||
      (material.type || '').toLowerCase().includes(searchmaterialMovement.toLowerCase()) ||
      (material.carrier || '').toLowerCase().includes(searchmaterialMovement.toLowerCase())
  );

  const filteredVehicleMonitoring = vehicleMonitoring.filter(
    (vehicle) =>
      (vehicle.number || '').toLowerCase().includes(searchvehicleMonitoring.toLowerCase()) ||
      (vehicle.driver || '').toLowerCase().includes(searchvehicleMonitoring.toLowerCase()) ||
      (vehicle.type || '').toLowerCase().includes(searchvehicleMonitoring.toLowerCase()) ||
      (vehicle.associated || '').toLowerCase().includes(searchvehicleMonitoring.toLowerCase())
  );


  return (
    <div className="min-h-screen bg-gray-100">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          body {
            font-family: 'Inter', sans-serif;
          }
          /* Custom scrollbar for tables */
          .table-container::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }
          .table-container::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 10px;
          }
          .table-container::-webkit-scrollbar-thumb {
            background: #888;
            border-radius: 10px;
          }
          .table-container::-webkit-scrollbar-thumb:hover {
            background: #555;
          }
            @keyframes wave1 {
          0% { transform: scale(0) rotate(0deg); opacity: 0.8; }
          50% { transform: scale(1.2) rotate(180deg); opacity: 0.4; }
          100% { transform: scale(2) rotate(360deg); opacity: 0; }
        }
        
        @keyframes wave2 {
          0% { transform: scale(0) rotate(0deg); opacity: 0.7; }
          50% { transform: scale(1.1) rotate(180deg); opacity: 0.35; }
          100% { transform: scale(1.8) rotate(360deg); opacity: 0; }
        }
        
        @keyframes wave3 {
          0% { transform: scale(0) rotate(0deg); opacity: 0.6; }
          50% { transform: scale(1) rotate(180deg); opacity: 0.3; }
          100% { transform: scale(1.6) rotate(360deg); opacity: 0; }
        }
        
        @keyframes ripple1 {
          0% { transform: scale(0) rotate(45deg); opacity: 0.6; }
          40% { transform: scale(1.3) rotate(225deg); opacity: 0.3; }
          100% { transform: scale(2.2) rotate(405deg); opacity: 0; }
        }
        
        @keyframes ripple2 {
          0% { transform: scale(0) rotate(-45deg); opacity: 0.5; }
          45% { transform: scale(1.1) rotate(-225deg); opacity: 0.25; }
          100% { transform: scale(1.9) rotate(-405deg); opacity: 0; }
        }
        
        @keyframes ripple3 {
          0% { transform: scale(0) rotate(90deg); opacity: 0.7; }
          50% { transform: scale(1.4) rotate(270deg); opacity: 0.35; }
          100% { transform: scale(2.4) rotate(450deg); opacity: 0; }
        }
        `}
      </style>

      <h1 className="text-3xl font-bold text-gray-900 mt-2 mb-8 text-center" style={{ textShadow: '0px 13px 10px rgb(0, 0, 0)' }}>
        Visitor Management Dashboard
      </h1>

      {/* 1. Summary Cards (KPI Overview) */}
      <h2 className="text-xl font-semibold mb-2 text-gray-800 text-center rounded-xl shadow">Summary Cards</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-6 mb-8 pl-2" style={{ perspective: '2000px', transformStyle: 'preserve-3d' }}>
        {[
          {
            label: "Total Employees",
            value: summary.totalEmployees,
            icon: <Users />,
            gradient: "from-gray-600 to-gray-800", // Neutral & professional
            data: totalEmployeesList,
            key: "totalEmployeesList",
            list: totalEmployeesList || []
          },
          {
            label: "Visitors (Today)",
            value: summary.totalVisitorsToday,
            icon: <Eye />,
            gradient: "from-green-500 to-green-700", // Fresh/Active
            data: visitorsTodayList,
            key: "visitors-today"
          },
          {
            label: "Visitors (This Month)",
            value: summary.totalVisitorsThisMonth,
            icon: <Calendar />,
            gradient: "from-emerald-500 to-emerald-700", // Stable & growing
            data: totalVisitorsThisMonthList,
            key: "visitors-month"
          },
          {
            label: "Currently Inside",
            value: summary.currentlyInside,
            icon: <Building2 />,
            gradient: "from-blue-500 to-blue-700", // Indoor presence
            data: currentlyInsideList,
            key: "current-visitors"
          },
          {
            label: "Pending Approvals",
            value: summary.pendingApprovals,
            icon: <ClipboardList />,
            gradient: "from-yellow-500 to-yellow-700", // Caution/attention
            data: pendingApprovalsList,
            key: "pending-approvals"
          },
          {
            label: "Vehicles Inside",
            value: summary.vehiclesInside,
            icon: <Car />,
            gradient: "from-cyan-500 to-cyan-700", // Movement/vehicle tone
            data: vehiclesInsideList,
            key: "vehicles-inside"
          },
          {
            label: "Movements (Today)",
            value: summary.materialMovementsToday,
            icon: <Package />,
            gradient: "from-indigo-500 to-indigo-700", // Professional/transport
            data: materialMovementsTodayList,
            key: "material-movements"
          },
        ].map((item, idx) => (
          <div key={idx} onClick={() => {
            if (item.data && item.data.length > 0) {
              setDrawerData({
                title: item.label,
                data: item.data,
                type: item.key
              });
            }
          }}
            className={`h-47 relative overflow-hidden transform-gpu transition-all duration-500 ease-out hover:rotate-x-12 hover:rotate-y-6 hover:scale-110 hover:-translate-z-8 rounded-2xl shadow-2xl hover:shadow-4xl text-white bg-gradient-to-br ${item.gradient} ${item.data?.length > 0 ? 'cursor-pointer' : 'cursor-default'
              }`}
            style={{
              transformStyle: 'preserve-3d',
              perspective: '1000px'
            }}
          >
            {/* Multi-layered 4D background effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-black/15 transform translate-z-1"></div>
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/25 to-transparent opacity-0 hover:opacity-100 transition-all duration-700 transform hover:translate-z-2"></div>
            <div className="absolute inset-0 bg-radial-gradient from-white/10 to-transparent opacity-0 hover:opacity-80 transition-all duration-500 transform hover:scale-110"></div>

            {/* 4D depth layers */}
            <div className="absolute -inset-1 bg-gradient-to-r from-transparent via-white/5 to-transparent blur-sm opacity-0 hover:opacity-100 transition-all duration-500 transform hover:translate-z-3"></div>
            <div className="absolute -inset-2 bg-gradient-to-br opacity-20 blur-md transform translate-z-negative-1 hover:translate-z-negative-2 transition-transform duration-500" style={{ background: `linear-gradient(135deg, ${item.gradient.includes('gray') ? 'rgba(75,85,99,0.3)' : item.gradient.includes('green') ? 'rgba(34,197,94,0.3)' : item.gradient.includes('blue') ? 'rgba(59,130,246,0.3)' : item.gradient.includes('yellow') ? 'rgba(234,179,8,0.3)' : item.gradient.includes('cyan') ? 'rgba(6,182,212,0.3)' : 'rgba(99,102,241,0.3)'}, transparent)` }}></div>

            {/* Card content with 4D depth */}
            <div className="relative z-20 flex flex-col justify-between h-full p-3 transform hover:translate-z-4 transition-transform duration-500">
              {/* Your exact original structure with 4D enhancement */}
              <div className="flex items-center space-x-2 h-full px-2 pl-0 pt-3 pb-4 transform hover:translate-z-3 transition-transform duration-400">
                <div className="bg-white/25 backdrop-blur-lg p-6 rounded-2xl border border-white/30 shadow-2xl transform hover:rotate-y-6 hover:scale-110 transition-all duration-300">
                  {React.cloneElement(item.icon, { size: 35, className: "text-white drop-shadow-lg filter brightness-110" })}
                </div>
                <div className="flex flex-col justify-center h-full transform hover:translate-x-1 transition-transform duration-300">
                  <p className="text-sm opacity-95 font-medium tracking-wide uppercase mb-1 drop-shadow-md">{item.label}</p>
                  <p className="text-2xl font-bold tracking-tight drop-shadow-lg filter brightness-110 transform hover:scale-105 transition-transform duration-300">{item.value}</p>
                </div>
              </div>
            </div>

            {/* Water Wave Effects */}
            <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 overflow-hidden rounded-2xl">
              {/* Wave 1 */}
              <div className="absolute -top-10 -left-10 w-32 h-32 bg-white/10 rounded-full animate-ping" style={{
                animation: 'wave1 2s ease-in-out infinite'
              }}></div>
              {/* Wave 2 */}
              <div className="absolute -top-8 -left-8 w-28 h-28 bg-white/15 rounded-full" style={{
                animation: 'wave2 2.5s ease-in-out infinite 0.3s'
              }}></div>
              {/* Wave 3 */}
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-white/20 rounded-full" style={{
                animation: 'wave3 3s ease-in-out infinite 0.6s'
              }}></div>
              {/* Ripple Effects from different corners */}
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/8 rounded-full" style={{
                animation: 'ripple1 2.2s ease-in-out infinite'
              }}></div>
              <div className="absolute -top-10 -right-10 w-28 h-28 bg-white/12 rounded-full" style={{
                animation: 'ripple2 2.8s ease-in-out infinite 0.4s'
              }}></div>
              <div className="absolute -bottom-10 -left-10 w-30 h-30 bg-white/10 rounded-full" style={{
                animation: 'ripple3 3.2s ease-in-out infinite 0.8s'
              }}></div>
            </div>

            {/* 4D floating particles effect */}
            <div className="absolute top-4 right-4 w-2 h-2 bg-white/30 rounded-full opacity-0 hover:opacity-100 transform hover:translate-z-8 hover:rotate-45 transition-all duration-700 animate-pulse"></div>
            <div className="absolute top-8 right-8 w-1 h-1 bg-white/40 rounded-full opacity-0 hover:opacity-100 transform hover:translate-z-6 hover:rotate-90 transition-all duration-500 animate-pulse delay-200"></div>
            <div className="absolute bottom-6 left-6 w-1.5 h-1.5 bg-white/25 rounded-full opacity-0 hover:opacity-100 transform hover:translate-z-5 hover:-rotate-45 transition-all duration-600 animate-pulse delay-400"></div>
          </div>
        ))}
      </div>
      {drawerData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end mt-20">
          <div className="bg-white w-full max-w-lg p-4 overflow-y-auto shadow-lg rounded-l-lg relative">

            {/* Header: Export + Close */}
            <div className="flex justify-between items-center border-b pb-2 mb-3">
              <h3 className="text-lg font-semibold text-gray-700">
                {drawerData.title} ({filteredData.length} records)
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    exportToCSV(filteredData, `${drawerData.title.replace(/\s+/g, '_')}_export.csv`)
                  }
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded"
                >
                  <Download size={16} className="inline-block mr-1" /> Export
                </button>
                <button
                  onClick={closeDrawer}
                  className="text-red-500 text-lg font-bold hover:text-red-700"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Filter Input */}
            <div className="mb-3">
              <input
                type="text"
                placeholder="Search by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:ring-blue-300"
              />
            </div>

            {/* Data List */}
            <ul className="space-y-2 max-h-[400px] overflow-y-auto text-sm">
              {paginatedData.map((item, idx) => (
                <li key={idx} className="border rounded-md p-3 bg-gray-50 hover:bg-gray-100">

                  {/* Total Employees */}
                  {drawerData.type === 'totalEmployeesList' && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Users size={16} className="text-blue-600" />
                        <strong className="text-gray-800">{item.gms_first_name} {item.gms_last_name}</strong>
                      </div>
                      <div className="ml-6 text-gray-600">
                        <div>📧 {item.gms_email}</div>
                        <div>📅 Joined: {new Date(item.gms_joining_date).toLocaleDateString()}</div>
                        <div>🆔 ID: {item.id}</div>
                      </div>
                    </div>
                  )}

                  {/* Visitors Today */}
                  {drawerData.type === 'visitors-today' && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Eye size={16} className="text-green-600" />
                        <strong className="text-gray-800">{item.gms_visitorname}</strong>
                      </div>
                      <div className="ml-6 text-gray-600">
                        <div>🏢 From: {item.gms_visitorfrom}</div>
                        <div>🕐 Entry: {item.gms_intime}</div>
                        <div>👤 To Meet: {item.gms_tomeet}</div>
                        <div>📞 Contact: {item.gms_mobileno}</div>
                        <div>📄 Status: <Badge status={item.gms_status || 'Visited'} /></div>
                      </div>
                    </div>
                  )}

                  {/* Visitors This Month */}
                  {drawerData.type === 'visitors-month' && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-purple-600" />
                        <strong className="text-gray-800">{item.gms_visitorname}</strong>
                      </div>
                      <div className="ml-6 text-gray-600">
                        <div>🏢 From: {item.gms_visitorfrom}</div>
                        <div>📞 Contact: {item.gms_mobileno}</div>
                        <div>👤 Host: {item.gms_tomeet}</div>
                        <div>🕐 In: {item.gms_intime}</div>
                        <div>🕐 Out: {item.gms_outtime || '—'}</div>
                        <div>📄 Status: <Badge status={item.gms_status || 'Visited'} /></div>
                      </div>
                    </div>
                  )}

                  {/* Currently Inside */}
                  {drawerData.type === 'current-visitors' && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Building2 size={16} className="text-orange-600" />
                        <strong className="text-gray-800">{item.gms_visitorname}</strong>
                      </div>
                      <div className="ml-6 text-gray-600">
                        <div>🏢 From: {item.gms_visitorfrom}</div>
                        <div>📞 Contact: {item.gms_mobileno}</div>
                        <div>👤 To Meet: {item.gms_tomeet}</div>
                        <div>🕐 Entry: {item.gms_intime}</div>
                        <div>📄 Status: <Badge status={item.gms_status || 'Inside'} /></div>
                      </div>
                    </div>
                  )}

                  {/* Pending Approvals */}
                  {drawerData.type === 'pending-approvals' && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <ClipboardList size={16} className="text-red-600" />
                        <strong className="text-gray-800">{item.gms_visitorname}</strong>
                      </div>
                      <div className="ml-6 text-gray-600">
                        <div>🏢 From: {item.gms_visitorfrom || 'N/A'}</div>
                        <div>👤 To Meet: {item.gms_tomeet}</div>
                        <div>📝 Purpose: {item.gms_visitpurpose || 'General Visit'}</div>
                        <div>📞 Contact: {item.gms_mobileno}</div>
                        <div>📄 Status: <Badge status="Pending" /></div>
                      </div>
                    </div>
                  )}

                  {/* Vehicles Inside */}
                  {drawerData.type === 'vehicles-inside' && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Car size={16} className="text-indigo-600" />
                        <strong className="text-gray-800">{item.GMS_vehicle_number}</strong>
                      </div>
                      <div className="ml-6 text-gray-600">
                        <div>🚗 Type: {item.GMS_vehicle_type}</div>
                        <div>👤 Driver: {item.GMS_driver_name}</div>
                        <div>📞 Contact: {item.GMS_driver_contact_number}</div>
                        <div>🕐 Entry: {item.GMS_entry_time}</div>
                        <div>✅ Security: Cleared</div>
                      </div>
                    </div>
                  )}

                  {/* Material Movements */}
                  {drawerData.type === 'material-movements' && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Package size={16} className="text-teal-600" />
                        <strong className="text-gray-800">{item.GMS_material_name}</strong>
                      </div>
                      <div className="ml-6 text-gray-600">
                        <div>📦 Type: {item.GMS_material_type}</div>
                        <div>📊 Quantity: {item.GMS_quantity} {item.GMS_unit}</div>
                        <div>📍 Route: {item.GMS_source_location} → {item.GMS_destination_location}</div>
                        <div>🚚 Transport: {item.GMS_vehicle_number}</div>
                        <div>📄 Status: <Badge status={item.GMS_movement_type} /></div>
                      </div>
                    </div>
                  )}

                </li>
              ))}

              {paginatedData.length === 0 && (
                <li className="text-gray-500 text-center py-8">
                  <div className="text-4xl mb-2">📭</div>
                  <div>No matching records found.</div>
                </li>
              )}
            </ul>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-4 text-sm border-t pt-3">
              <span className="text-gray-600">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredData.length)} of {filteredData.length} entries
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  ← Prev
                </button>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded">
                  {currentPage}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage((p) => (endIndex < filteredData.length ? p + 1 : p))
                  }
                  disabled={endIndex >= filteredData.length}
                  className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  Next →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}


      {/* 2. Upcoming Visitor Schedule */}
      <h2 className="text-xl font-semibold mb-2 text-gray-800 text-center rounded-xl shadow">Upcoming Visitor Schedule</h2>

      <Card className="p-1 mb-8 mt-0 pt-1">
        <div className="flex justify-between mb-2">
          <input type="text" value={searchupcomingVisitors} onChange={(e) => {
            setsearchUpcomingVisitors(e.target.value);
            setpageUpcomingVisitors(1);
          }}
            placeholder="Search upcoming visitors"
            className="px-1 py-.5 text-sm border rounded"
          />
          <div>
            <button onClick={() => setpageUpcomingVisitors((p) => Math.max(p - 1, 1))} disabled={pageupcomingVisitors === 1} className="px-1 py-.5 text-xs border rounded mr-1"> Prev </button>
            <span className="text-xs">{pageupcomingVisitors}</span>
            <button onClick={() => setpageUpcomingVisitors((p) => p * itemsPerPage < upcomingVisitors.filter(v => v.name?.toLowerCase().includes(searchupcomingVisitors.toLowerCase()) || v.organization?.toLowerCase().includes(searchupcomingVisitors)).length ? p + 1 : p)}
              className="px-1 py-.5 text-xs border rounded ml-1">Next
            </button>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Visitor & Host</th>
              <th>Schedule Time</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {upcomingVisitors.length > 0 ? (
              upcomingVisitors
                .filter(v => v.name?.toLowerCase().includes(searchupcomingVisitors.toLowerCase()) || v.organization?.toLowerCase().includes(searchupcomingVisitors))
                .slice((pageupcomingVisitors - 1) * itemsPerPage, pageupcomingVisitors * itemsPerPage)
                .map((visitor, idx) => (
                  <tr key={visitor.id}>
                    <td>
                      <div className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">{visitor.name} ({visitor.organization})</div>
                      <div className="text-sm font-medium text-gray-900"> TO MEET: {visitor.host}</div>
                      <div className="inline-flex items-center px-1 py-.5 font-small rounded-md shadow-sm text-xs text-white bg-yellow-500 hover:bg-yellow-500">PURPOSE: {visitor.purpose}</div>
                    </td>
                    <td>{visitor.time}</td>
                    <td>
                      {visitor.status === 'Pending' ? (
                        <div className="space-x-2">
                          <button
                            onClick={() => handleUpcomingAction(visitor.id, 'approve')}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" /> Approve
                          </button>
                          <button
                            onClick={() => handleUpcomingAction(visitor.id, 'deny')}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            <XCircle className="w-4 h-4 mr-1" /> Deny
                          </button>
                        </div>
                      ) : (
                        <Badge status={visitor.status} />
                      )}
                    </td>
                  </tr>
                ))
            ) : (
              <tr>
                <td>No upcoming visitors scheduled.</td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>


      {/* /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}


      {/* 3. Live Visitor Monitoring */}
      <h2 className="text-xl font-semibold mb-0 text-gray-800 text-center rounded-xl shadow">Live Visitor Monitoring</h2>
      <Card className="p-1 mb-8 mt-0 pt-1">
        <div className="flex justify-between mb-2">
          <input type="text" value={searchLiveVisitors} onChange={(e) => {
            setSearchLiveVisitors(e.target.value);
            setpageLiveVisitors(1); // Reset page on new search
          }}
            placeholder="Search by name or phone"
            className="px-1 py-.5 text-sm border rounded"
          />
          <div>
            <button onClick={() => setpageLiveVisitors((p) => Math.max(p - 1, 1))} disabled={pageLiveVisitors === 1} className="px-1 py-.5 text-xs border rounded mr-1"> Prev </button>
            <span className="text-xs">{pageLiveVisitors}</span>
            <button onClick={() => setpageLiveVisitors((p) => p * itemsPerPage < liveVisitors.filter(visitor => visitor.name.toLowerCase().includes(searchLiveVisitors.toLowerCase()) || visitor.phone.includes(searchLiveVisitors)).length ? p + 1 : p)}
              className="px-1 py-.5 text-xs border rounded ml-1">Next
            </button>
          </div>
        </div>

        <table >
          <thead >
            <tr>
              <th>Name & Phone</th>
              <th>To Meet</th>
              <th>Time In/Out</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {liveVisitors.length > 0 ? (
              liveVisitors
                .filter(visitor => visitor.name.toLowerCase().includes(searchLiveVisitors.toLowerCase()) || visitor.phone.includes(searchLiveVisitors))
                .slice((pageLiveVisitors - 1) * itemsPerPage, pageLiveVisitors * itemsPerPage)
                .map((visitor) => (
                  <tr key={visitor.id}>
                    <td>
                      <div className="flex items-center space-x-4">
                        <img
                          className="h-10 w-10 rounded-full object-cover"
                          src={`${SERVER_PORT}/visitor-image/${visitor.id}`}
                          alt={visitor.name}
                          onError={(e) => {
                            if (!e.target.src.includes('/default-avatar.png')) {
                              e.target.onerror = null;
                              e.target.src = '/default-avatar.png';
                            }
                          }}
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{visitor.name}</div>
                          <div className="text-sm text-gray-500">{visitor.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td >{visitor.tomeet}</td>
                    <td>
                      <div className="text-sm text-gray-900">
                        In: {visitor.entrytime ? visitor.entrytime : 'N/A'}{" "}
                        <CheckCircle className="w-4 h-4 mr-1 inline-flex items-center gap-1 text-sm text-green-600" />
                      </div>
                      {/* <div className={`text-sm ${visitor.expectedexittime ? 'text-gray-500' : 'text-gray-300'}`}>
                        Out: {visitor.expectedexittime || 'N/A'}{" "}
                        <XCircle
                          className={`w-4 h-4 mr-1 inline-flex items-center gap-1 text-sm ${visitor.expectedexittime ? 'text-red-600' : 'text-gray-300'
                            }`}
                        />
                      </div> */}
                    </td>
                    <td >
                      {visitor.status === 'Accepted' ? (
                        <button
                          onClick={() => handleManualCheckout(visitor.id)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          <UserX className="w-4 h-4 mr-1" /> Checkout
                        </button>
                      ) : (
                        <Badge status={visitor.status} />
                      )}
                    </td>
                  </tr>
                ))
            ) : (
              <tr>
                <td colSpan="5" >No visitors currently inside.</td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      {/* /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}

      {/* 4. Recent Visitor Log */}
      <h2 className="text-xl font-semibold mb-2 text-gray-800 text-center rounded-xl shadow">Recent Visitor Log</h2>
      <Card className="p-1 mb-8">
        <div className="flex justify-between mb-2">
          <input type="text" value={searchRecentVisitors} onChange={(e) => {
            setsearchRecentVisitors(e.target.value);
            setpageRecentVisitors(1);
          }}
            placeholder="Search upcoming visitors"
            className="px-1 py-.5 text-sm border rounded"
          />
          <div>
            <button onClick={() => setpageRecentVisitors((p) => Math.max(p - 1, 1))} disabled={pageRecentVisitors === 1} className="px-1 py-.5 text-xs border rounded mr-1"> Prev </button>
            <span className="text-xs">{pageRecentVisitors}</span>
            <button onClick={() => setpageRecentVisitors((p) => p * itemsPerPage < recentVisitors.filter(v => v.name?.toLowerCase().includes(searchRecentVisitors.toLowerCase())).length ? p + 1 : p)}
              className="px-1 py-.5 text-xs border rounded ml-1">Next
            </button>
          </div>
        </div>

        <table >
          <thead>
            <tr>
              <th>Name & Contact</th>
              <th>Time In/Out</th>
              <th>To Meet</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {recentVisitors.length > 0 ? (
              recentVisitors
                .filter(v => v.name?.toLowerCase().includes(searchRecentVisitors.toLowerCase()))
                .slice((pageRecentVisitors - 1) * itemsPerPage, pageRecentVisitors * itemsPerPage)
                .map((recentvisitor, idx) => (
                  <tr key={recentvisitor.id}>
                    <td>
                      <div className="flex items-center space-x-4">
                        <img
                          className="h-10 w-10 rounded-full object-cover"
                          src={`${SERVER_PORT}/visitor-image/${recentvisitor.id}`}
                          alt={recentvisitor.name}
                          onError={(e) => {
                            e.target.src = '/default-avatar.png';
                          }}
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{recentvisitor.name}</div>
                          <div className="text-sm text-gray-500">{recentvisitor.contact}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="text-sm text-gray-900">
                        In: {recentvisitor.timein ? recentvisitor.timein : 'N/A'}{" "}
                        <CheckCircle className="w-4 h-4 mr-1 inline-flex items-center gap-1 text-sm text-green-600" />
                      </div>
                      <div className={`text-sm ${recentvisitor.timeout ? 'text-gray-500' : 'text-gray-300'}`}>
                        Out: {recentvisitor.timeout || 'N/A'}{" "}
                        <XCircle
                          className={`w-4 h-4 mr-1 inline-flex items-center gap-1 text-sm ${recentvisitor.timeout ? 'text-red-600' : 'text-gray-300'
                            }`}
                        />
                      </div>
                    </td>
                    <td>{recentvisitor.host}</td>
                    <td>
                      <Badge status={recentvisitor.status} />
                    </td>
                  </tr>
                ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">No recent visitor logs.</td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      {/* /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}

      {/* 5. Visitor Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="p-1 mb-8">
          <h2 className="text-xl font-semibold mb-2 text-gray-800 text-center rounded-xl shadow">Visitor Analytics</h2>
          <h3 className="text-lg text-center font-medium text-gray-700 mb-4">Daily Visitor Volume</h3>
          <ResponsiveContainer width="90%" height={350}>
            <BarChart data={visitorTrends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="visitors" fill="#8884d8" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>


        <Card className="p-1 mb-8">
          <h2 className="text-xl font-semibold mb-2 text-gray-800 text-center rounded-xl shadow">Peak Visiting Hours</h2>
          <h3 className="text-lg text-center font-medium text-gray-700 mb-4">Hourly Visitor Volume</h3>
          <ResponsiveContainer width="90%" height={230}>
            <BarChart data={peakHours} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="visitors" fill="#82ca9d" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>

          <h3 className="text-lg font-medium text-gray-750 ml-6 mt-6 mb-2">Department-wise Traffic (Top 3)</h3>
          <ul className="list-disc list-inside text-gray-700">
            <li>HR Department: 35%</li>
            <li>Sales Department: 25%</li>
            <li>Logistics Department: 15%</li>
          </ul>
        </Card>

      </div>

      {/* /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}

      {/* 6. Frequent Visitors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="p-1 mb-8">
          <h2 className="text-xl font-semibold mb-2 text-gray-800 text-center rounded-xl shadow">Frequent Visitors</h2>
          <div className="flex justify-between mb-2">
            <input type="text" value={searchfrequentVisitors} onChange={(e) => {
              setsearchFrequentVisitors(e.target.value);
              setpageFrequentVisitors(1);
            }}
              placeholder="Search upcoming visitors"
              className="px-1 py-.5 text-sm border rounded"
            />
            <div>
              <button onClick={() => setpageFrequentVisitors((p) => Math.max(p - 1, 1))} disabled={pagefrequentVisitors === 1} className="px-1 py-.5 text-xs border rounded mr-1"> Prev </button>
              <span className="text-xs">{pagefrequentVisitors}</span>
              <button onClick={() => setpageFrequentVisitors((p) => p * itemsPerPage < frequentVisitors.filter(v => v.name?.toLowerCase().includes(searchfrequentVisitors.toLowerCase())).length ? p + 1 : p)}
                className="px-1 py-.5 text-xs border rounded ml-1">Next
              </button>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Name & Org</th>
                <th>Total Visits</th>
                <th>Last Visit</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {frequentVisitors.length > 0 ? (
                frequentVisitors
                  .filter(v => v.name?.toLowerCase().includes(searchfrequentVisitors.toLowerCase()))
                  .slice((pagefrequentVisitors - 1) * itemsPerPage, pagefrequentVisitors * itemsPerPage)
                  .map((visitor, idx) => (
                    <tr key={visitor.id}>
                      <td>
                        <div className="text-sm font-medium text-gray-900">{visitor.name}</div>
                        <div className="text-sm text-gray-500">{visitor.organization}</div>
                      </td>
                      <td>{visitor.totalVisits}</td>
                      <td>{visitor.lastVisit}</td>
                      <td>
                        <div className="space-x-2">
                          <button
                            onClick={() => handleFlagVisitor(visitor.id, true)}
                            className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm ${visitor.isVIP ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-yellow-300'}`}
                          >
                            <Award className="w-4 h-4 mr-1" /> VIP
                          </button>
                          <button
                            onClick={() => handleFlagVisitor(visitor.id, false)}
                            className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm ${visitor.isSuspicious ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-red-300'}`}
                          >
                            <ShieldAlert className="w-4 h-4 mr-1" /> Suspicious
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td>No frequent visitors.</td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>

        {/* 7. Employee Access Summary */}
        <Card className="p-1 mb-8">
          <h2 className="text-xl font-semibold mb-2 text-gray-800 text-center rounded-xl shadow">Employee Access Summary</h2>

          <div className="flex justify-between mb-2">
            <input type="text" value={searchemployeeAccess} onChange={(e) => {
              setsearchEmployeeAccess(e.target.value);
              setpageEmployeeAccess(1);
            }}
              placeholder="Search upcoming visitors"
              className="px-1 py-.5 text-sm border rounded"
            />
            <div>
              <button onClick={() => setpageEmployeeAccess((p) => Math.max(p - 1, 1))} disabled={pageemployeeAccess === 1} className="px-1 py-.5 text-xs border rounded mr-1"> Prev </button>
              <span className="text-xs">{pageemployeeAccess}</span>
              <button onClick={() => setpageEmployeeAccess((p) => p * itemsPerPage < employeeAccess.filter(v => v.name?.toLowerCase().includes(searchemployeeAccess.toLowerCase())).length ? p + 1 : p)}
                className="px-1 py-.5 text-xs border rounded ml-1">Next
              </button>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Time In/Out</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {employeeAccess.length > 0 ? (
                employeeAccess
                  .filter(v => v.name?.toLowerCase().includes(searchemployeeAccess.toLowerCase()))
                  .slice((pageemployeeAccess - 1) * itemsPerPage, pageemployeeAccess * itemsPerPage)
                  .map((employee, idx) => (
                    <tr key={employee.id}>
                      <td>{employee.name}</td>
                      <td>
                        <div className="text-sm text-gray-900">
                          In: {employee.entry ? employee.entry : 'N/A'}{" "}
                          <CheckCircle className="w-4 h-4 mr-1 inline-flex items-center gap-1 text-sm text-green-600" />
                        </div>
                        <div className={`text-sm ${employee.exit ? 'text-gray-500' : 'text-gray-300'}`}>
                          Out: {employee.exit || 'N/A'}{" "}
                          <XCircle className={`w-4 h-4 mr-1 inline-flex items-center gap-1 text-sm ${employee.exit ? 'text-red-600' : 'text-gray-300'}`} />
                        </div>
                      </td>

                      <td>
                        <Badge status={employee.status} />
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td>No employee access data.</td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
      </div>

      {/* /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}

      {/* 8. Security Alerts / Watchlist */}
      <Card className="p-1 mb-8">
        <h2 className="text-xl font-semibold mb-2 text-gray-800 text-center rounded-xl shadow">Security Alerts / Watchlist</h2>

        <div className="flex justify-between mb-2">
          <input type="text" value={searchsecurityAlerts} onChange={(e) => {
            setsearchSecurityAlerts(e.target.value);
            setpageSecurityAlerts(1);
          }}
            placeholder="Search upcoming visitors"
            className="px-1 py-.5 text-sm border rounded"
          />
          <div>
            <button onClick={() => setsearchSecurityAlerts((p) => Math.max(p - 1, 1))} disabled={pageSecurityAlerts === 1} className="px-1 py-.5 text-xs border rounded mr-1"> Prev </button>
            <span className="text-xs">{pageSecurityAlerts}</span>
            <button onClick={() => setsearchSecurityAlerts((p) => p * itemsPerPage < securityAlerts.filter(v => v.visitor?.toLowerCase().includes(searchsecurityAlerts.toLowerCase())).length ? p + 1 : p)}
              className="px-1 py-.5 text-xs border rounded ml-1">Next
            </button>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Alert</th>
              <th>Timestamp</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {securityAlerts.length > 0 ? (
              securityAlerts
                .filter(v => v.visitor?.toLowerCase().includes(searchsecurityAlerts.toLowerCase()))
                .slice((pageSecurityAlerts - 1) * itemsPerPage, pageSecurityAlerts * itemsPerPage)
                .map((alert, idx) => (
                  <tr key={alert.id} className="bg-red-50">
                    <td>
                      <div className="text-sm font-medium text-red-900">{alert.type}: {alert.visitor}</div>
                      <div className="text-sm text-red-700">{alert.notes}</div>
                    </td>
                    <td>{alert.timestamp}</td>
                    <td>
                      <div className="space-x-2">
                        <button
                          onClick={() => handleSecurityAlertAction(alert.id, 'View')}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleSecurityAlertAction(alert.id, 'Clear')}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-gray-600 hover:bg-gray-700"
                        >
                          Clear
                        </button>
                        <button
                          onClick={() => handleSecurityAlertAction(alert.id, 'Alert Security')}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700"
                        >
                          <Bell className="w-4 h-4 mr-1" /> Alert Security
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
            ) : (
              <tr>
                <td>No active security alerts.</td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      {/* /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}

      {/* 09. Material Movement Log */}
      <Card className="p-1 mb-8">
        <h2 className="text-xl font-semibold mb-2 text-gray-800 text-center rounded-xl shadow">Material Movement Log</h2>
        <div className="flex justify-between mb-2">
          <input
            type="text"
            value={searchmaterialMovement}
            onChange={(e) => {
              setsearchMaterialMovement(e.target.value);
              setpageMaterialMovement(1);
            }}
            placeholder="Search material or purpose"
            className="px-1 py-.5 text-sm border rounded"
          />
          <div>
            <button
              onClick={() => setpageMaterialMovement((p) => Math.max(p - 1, 1))}
              disabled={pageMaterialMovement === 1}
              className="px-1 py-.5 text-xs border rounded mr-1"
            >
              Prev
            </button>
            <span className="text-xs">{pageMaterialMovement}</span>
            <button
              onClick={() =>
                setpageMaterialMovement((p) =>
                  p * itemsPerPage < filteredMaterialMovement.length ? p + 1 : p
                )
              }
              className="px-1 py-.5 text-xs border rounded ml-1"
              disabled={pageMaterialMovement * itemsPerPage >= filteredMaterialMovement.length}
            >
              Next
            </button>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Material</th>
              <th>Purpose & Carrier</th>
              <th>Status</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            {filteredMaterialMovement
              .slice((pageMaterialMovement - 1) * itemsPerPage, pageMaterialMovement * itemsPerPage)
              .map((material) => (
                <tr key={material.id}>
                  <td>
                    <div className="text-sm font-medium text-gray-900">{material.description}</div>
                    <div className="text-sm text-gray-500">{material.quantity}, {material.type}</div>
                  </td>
                  <td>
                    <div className="text-sm font-medium text-gray-900">{material.purpose}</div>
                    <div className="text-sm text-gray-500">Carrier: {material.carrier}</div>
                  </td>
                  <td>
                    <Badge status={material.status} />
                  </td>
                  <td>{material.remarks}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </Card>

      {/* 10. Vehicle Entry & Monitoring */}
      <Card className="p-1 mb-8">
        <h2 className="text-xl font-semibold mb-2 text-gray-800 text-center rounded-xl shadow">Vehicle Entry & Monitoring</h2>
        <div className="flex justify-between mb-2">
          <input
            type="text"
            value={searchvehicleMonitoring}
            onChange={(e) => {
              setsearchVehicleMonitoring(e.target.value);
              setpageVehicleMonitoring(1);
            }}
            placeholder="Search vehicle or driver"
            className="px-1 py-.5 text-sm border rounded"
          />
          <div>
            <button
              onClick={() => setpageVehicleMonitoring((p) => Math.max(p - 1, 1))}
              disabled={pageVehicleMonitoring === 1}
              className="px-1 py-.5 text-xs border rounded mr-1"
            >
              Prev
            </button>
            <span className="text-xs">{pageVehicleMonitoring}</span>
            <button
              onClick={() =>
                setpageVehicleMonitoring((p) =>
                  p * itemsPerPage < filteredVehicleMonitoring.length ? p + 1 : p
                )
              }
              className="px-1 py-.5 text-xs border rounded ml-1"
              disabled={pageVehicleMonitoring * itemsPerPage >= filteredVehicleMonitoring.length}
            >
              Next
            </button>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Vehicle</th>
              <th>Driver / Associated</th>
              <th>Time In/Out</th>
              <th>Security Check</th>
            </tr>
          </thead>
          <tbody>
            {filteredVehicleMonitoring
              .slice((pageVehicleMonitoring - 1) * itemsPerPage, pageVehicleMonitoring * itemsPerPage)
              .map((vehicle) => (
                <tr key={vehicle.id}>
                  <td>
                    <div className="text-sm font-medium text-gray-900">{vehicle.number}</div>
                    <div className="text-sm text-gray-500">{vehicle.type}</div>
                  </td>
                  <td>
                    <div className="text-sm font-medium text-gray-900">{vehicle.driver}</div>
                    <div className="text-sm text-gray-500">{vehicle.associated}</div>
                  </td>
                  <td>
                    <div className="text-sm text-gray-900">In: {vehicle.entry}
                      <CheckCircle className="w-4 h-4 mr-1 inline-flex items-center gap-1 text-sm text-green-600" />
                    </div>
                    <div className="text-sm text-gray-500">Out: {vehicle.exit || 'N/A'}
                      <XCircle className="w-4 h-4 mr-1 inline-flex items-center gap-1 text-sm text-red-600" />
                    </div>
                  </td>
                  <td>
                    <Badge status={vehicle.securityCheck} />
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </Card>

      {/* /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}

      {/* 11. Quick Actions Panel */}
      <Card className="p-1 mb-8">
        <h2 className="text-xl font-semibold mb-2 text-gray-800 text-center rounded-xl shadow">Quick Actions Panel</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <button
            onClick={() => handleQuickAction('Register New Visitor')}
            className="flex flex-col items-center justify-center p-4 bg-blue-600 text-white rounded-xl shadow-md hover:bg-blue-700 transition-colors duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <UserPlus className="w-8 h-8 mb-2" />
            <span className="text-sm font-medium text-center">Register New Visitor</span>
          </button>
          <button
            onClick={() => handleQuickAction('Generate GatePass')}
            className="flex flex-col items-center justify-center p-4 bg-green-600 text-white rounded-xl shadow-md hover:bg-green-700 transition-colors duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <Ticket className="w-8 h-8 mb-2" />
            <span className="text-sm font-medium text-center">Generate GatePass</span>
          </button>
          <button
            onClick={() => handleQuickAction('Log Vehicle Entry')}
            className="flex flex-col items-center justify-center p-4 bg-purple-600 text-white rounded-xl shadow-md hover:bg-purple-700 transition-colors duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            <Truck className="w-8 h-8 mb-2" />
            <span className="text-sm font-medium text-center">Log Vehicle Entry</span>
          </button>
          <button
            onClick={() => handleQuickAction('Add Material Movement')}
            className="flex flex-col items-center justify-center p-4 bg-orange-600 text-white rounded-xl shadow-md hover:bg-orange-700 transition-colors duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
          >
            <Box className="w-8 h-8 mb-2" />
            <span className="text-sm font-medium text-center">Add Material Movement</span>
          </button>
          <button
            onClick={() => handleQuickAction('Export Daily Report')}
            className="flex flex-col items-center justify-center p-4 bg-teal-600 text-white rounded-xl shadow-md hover:bg-teal-700 transition-colors duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
          >
            <Download className="w-8 h-8 mb-2" />
            <span className="text-sm font-medium text-center">Export Daily Report</span>
          </button>
          <button
            onClick={() => handleQuickAction('Notify Security')}
            className="flex flex-col items-center justify-center p-4 bg-red-600 text-white rounded-xl shadow-md hover:bg-red-700 transition-colors duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <Bell className="w-8 h-8 mb-2" />
            <span className="text-sm font-medium text-center">Notify Security</span>
          </button>
        </div>
      </Card>
    </div>
  );
}



