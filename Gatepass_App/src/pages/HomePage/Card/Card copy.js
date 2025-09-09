import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Eye, Calendar, ClipboardList, Award, ShieldAlert, Car, Package, Ticket, Truck, Box, Download, Bell, Building2, CheckCircle, XCircle, UserX, UserPlus,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ReactSession } from 'react-client-session';

// --- Utility Components ---

const Card = ({ children, className = '' }) => (
  <div className={`bg-white p-6 rounded-xl shadow-md ${className}`}>
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

// const ToTEmployees =  ReactSession.get("CountofTotalEMP");
// console.log("ToTEmployees",ToTEmployees);

// --- Dummy Data ---
const mockData = {
  summary: {
    totalEmployees: 1500,
    totalVisitorsToday: 85,
    totalVisitorsThisMonth: 1230,
    currentlyInside: 42,
    pendingApprovals: 7,
    vehiclesInside: 15,
    materialMovementsToday: 23,
  },
  liveVisitors: [
    { id: 1, name: 'Alice Johnson', photo: 'https://placehold.co/40x40/E0E7FF/4F46E5?text=AJ', phone: '9876543210', entryTime: '10:00 AM', expectedExitTime: '01:00 PM', host: 'John Doe', status: 'Checked-in' },
    { id: 2, name: 'Bob Williams', photo: 'https://placehold.co/40x40/FFE0E0/EF4444?text=BW', phone: '9876543211', entryTime: '10:15 AM', expectedExitTime: '12:30 PM', host: 'Jane Smith', status: 'Checked-in' },
    { id: 3, name: 'Charlie Brown', photo: 'https://placehold.co/40x40/E0FFEF/22C55E?text=CB', phone: '9876543212', entryTime: '10:30 AM', expectedExitTime: '02:00 PM', host: 'Alice Green', status: 'Checked-in' },
    { id: 4, name: 'Diana Prince', photo: 'https://placehold.co/40x40/FFFBE0/F59E0B?text=DP', phone: '9876543213', entryTime: '10:45 AM', expectedExitTime: '01:45 PM', host: 'Bruce Wayne', status: 'Checked-in' },
  ],
  upcomingVisitors: [
    { id: 1, name: 'Eve Adams', organization: 'Tech Solutions', purpose: 'Meeting with HR', host: 'Sarah Connor', time: '02:00 PM', status: 'Pending' },
    { id: 2, name: 'Frank White', organization: 'Global Corp', purpose: 'Delivery', host: 'Logistics Dept.', time: '02:30 PM', status: 'Pending' },
    { id: 3, name: 'Grace Hall', organization: 'Innovate Ltd.', purpose: 'Interview', host: 'HR Dept.', time: '03:00 PM', status: 'Pending' },
  ],
  recentVisitors: [
    { id: 1, name: 'Harry Potter', photo: 'https://placehold.co/40x40/E0E7FF/4F46E5?text=HP', contact: 'harry@example.com', host: 'Albus D.', timeIn: '09:00 AM', timeOut: '11:00 AM', status: 'Checked-out' },
    { id: 2, name: 'Hermione G.', photo: 'https://placehold.co/40x40/FFE0E0/EF4444?text=HG', contact: 'hermione@example.com', host: 'Minerva M.', timeIn: '09:30 AM', timeOut: '12:00 PM', status: 'Checked-out' },
    { id: 3, name: 'Ron Weasley', photo: 'https://placehold.co/40x40/E0FFEF/22C55E?text=RW', contact: 'ron@example.com', host: 'Rubeus H.', timeIn: '10:00 AM', timeOut: null, status: 'Checked-in' },
    { id: 4, name: 'Luna Lovegood', photo: 'https://placehold.co/40x40/FFFBE0/F59E0B?text=LL', contact: 'luna@example.com', host: 'Severus S.', timeIn: '10:30 AM', timeOut: null, status: 'Checked-in' },
    { id: 5, name: 'Neville Longbottom', photo: 'https://placehold.co/40x40/E6E0FF/6B46C1?text=NL', contact: 'neville@example.com', host: 'Pomona S.', timeIn: '11:00 AM', timeOut: '01:00 PM', status: 'Checked-out' },
  ],
  visitorTrends: [
    { name: 'Mon', visitors: 120 },
    { name: 'Tue', visitors: 150 },
    { name: 'Wed', visitors: 130 },
    { name: 'Thu', visitors: 180 },
    { name: 'Fri', visitors: 160 },
    { name: 'Sat', visitors: 80 },
    { name: 'Sun', visitors: 50 },
  ],
  peakHours: [
    { hour: '9-10 AM', visitors: 35 },
    { hour: '10-11 AM', visitors: 45 },
    { hour: '11-12 PM', visitors: 30 },
    { hour: '12-1 PM', visitors: 20 },
    { hour: '1-2 PM', visitors: 25 },
    { hour: '2-3 PM', visitors: 40 },
  ],
  frequentVisitors: [
    { id: 1, name: 'Mr. Smith', organization: 'ABC Corp', contact: 'smith@abccorp.com', totalVisits: 25, lastVisit: '2025-07-08' },
    { id: 2, name: 'Ms. Jones', organization: 'XYZ Ltd', contact: 'jones@xyz.com', totalVisits: 18, lastVisit: '2025-07-05' },
    { id: 3, name: 'Dr. Lee', organization: 'Health Partners', contact: 'lee@health.com', totalVisits: 12, lastVisit: '2025-07-01' },
  ],
  securityAlerts: [
    { id: 1, visitor: 'Mark Blocked', type: 'Watchlisted Entry', notes: 'Attempted entry, flagged due to past incident.', timestamp: '2025-07-09 11:30 AM' },
    { id: 2, visitor: 'Re-entry Alert', type: 'Blocked Individual', notes: 'System detected re-entry attempt by blocked individual.', timestamp: '2025-07-09 09:45 AM' },
  ],
  employeeAccess: [
    { id: 1, name: 'Employee A', entry: '08:55 AM', exit: '05:05 PM', status: 'On Time' },
    { id: 2, name: 'Employee B', entry: '09:10 AM', exit: '05:00 PM', status: 'Late Arrival' },
    { id: 3, name: 'Employee C', entry: '08:45 AM', exit: null, status: 'Missing Check-out' },
    { id: 4, name: 'Employee D', entry: '09:00 AM', exit: '04:30 PM', status: 'Early Departure' },
  ],
  vehicleMonitoring: [
    { id: 1, number: 'KA01AB1234', type: 'Car', driver: 'Driver One', associated: 'Visitor: Alice Johnson', entry: '10:00 AM', exit: null, securityCheck: 'Cleared' },
    { id: 2, number: 'TN05CD5678', type: 'Truck', driver: 'Driver Two', associated: 'Material: Steel Shipment', entry: '10:30 AM', exit: null, securityCheck: 'Pending' },
    { id: 3, number: 'MH12EF9012', type: 'Bike', driver: 'Employee: John Doe', associated: 'Employee: John Doe', entry: '09:00 AM', exit: '05:10 PM', securityCheck: 'Cleared' },
  ],
  materialMovement: [
    { id: 1, description: 'Office Supplies', quantity: '5 boxes', type: 'Consumables', purpose: 'Office Use', carrier: 'ABC Logistics', status: 'Inbound', remarks: 'Delivered to Admin' },
    { id: 2, description: 'Steel Beams', quantity: '10 tons', type: 'Raw Material', purpose: 'Construction', carrier: 'XYZ Transports', status: 'Pending Approval', remarks: 'Waiting for quality check' },
    { id: 3, description: 'Finished Goods', quantity: '2 pallets', type: 'Products', purpose: 'Customer Delivery', carrier: 'Self Pickup', status: 'Outbound', remarks: 'Customer signature obtained' },
  ],
};
// --- Main App Component ---


export default function Cards({ setTitle }) {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(mockData.summary);
  const [liveVisitors, setLiveVisitors] = useState(mockData.liveVisitors);
  const [upcomingVisitors, setUpcomingVisitors] = useState(mockData.upcomingVisitors);
  const [recentVisitors, setRecentVisitors] = useState(mockData.recentVisitors);
  const [frequentVisitors, setFrequentVisitors] = useState(mockData.frequentVisitors);
  const [securityAlerts, setSecurityAlerts] = useState(mockData.securityAlerts);
  const [employeeAccess, setEmployeeAccess] = useState(mockData.employeeAccess);
  const [vehicleMonitoring, setVehicleMonitoring] = useState(mockData.vehicleMonitoring);
  const [materialMovement, setMaterialMovement] = useState(mockData.materialMovement);

  useEffect(() => {
    setTitle("Cards");
  }, []);

  // Simulate real-time updates for 'Currently Inside Premises'
  useEffect(() => {
    const interval = setInterval(() => {
      setSummary(prev => ({
        ...prev,
        currentlyInside: liveVisitors.filter(v => v.status === 'Checked-in').length,
      }));
    }, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, [liveVisitors]);

  const handleManualCheckout = (id) => {
    setLiveVisitors(prev =>
      prev.map(visitor =>
        visitor.id === id ? { ...visitor, status: 'Checked-out', expectedExitTime: 'Checked Out Now' } : visitor
      )
    );
    setRecentVisitors(prev => {
      const updatedRecent = prev.map(visitor =>
        visitor.id === id ? { ...visitor, status: 'Checked-out', timeOut: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) } : visitor
      );
      // If the visitor wasn't in recentVisitors, add them as checked out
      if (!updatedRecent.some(v => v.id === id)) {
        const checkedOutVisitor = liveVisitors.find(v => v.id === id);
        if (checkedOutVisitor) {
          return [{
            id: checkedOutVisitor.id,
            name: checkedOutVisitor.name,
            photo: checkedOutVisitor.photo,
            contact: checkedOutVisitor.phone, // Using phone as contact for recent log
            host: checkedOutVisitor.host,
            timeIn: checkedOutVisitor.entryTime,
            timeOut: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            status: 'Checked-out'
          }, ...updatedRecent];
        }
      }
      return updatedRecent;
    });
    console.log(`Manual checkout for visitor ID: ${id}`);
  };

  const handleUpcomingAction = (id, action) => {
    setUpcomingVisitors(prev =>
      prev.map(visitor =>
        visitor.id === id ? { ...visitor, status: action === 'approve' ? 'Approved' : 'Denied' } : visitor
      )
    );
    console.log(`${action} for upcoming visitor ID: ${id}`);
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
    // Add logic for View / Alert Security
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
  const itemsPerPage = 10;

  // Filter and paginate
  const filteredData = drawerData?.data?.filter((item) =>
    (item.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.source || '').toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

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
        `}
      </style>

      <h1 className="text-3xl font-bold text-gray-900 mt-2 mb-8 text-center" style={{ textShadow: '0px 13px 10px rgb(0, 0, 0)' }}>
        GatePass Management Dashboard
      </h1>


      {/* 1. Summary Cards (KPI Overview) */}
      <h2 className="text-xl font-semibold mb-2 text-gray-800 text-center rounded-xl shadow">Summary Cards</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-6 gap-3 mb-8 pl-2 perspective">
        {[
          {
            label: "Total Employees",
            value: ReactSession.get("CountofTotalEMP") || 0,
            icon: <Users />,
            gradient: "from-blue-500 to-blue-700",
            key: "Total Employees",
            data: [], // Optional: provide related drawer data if needed
          },
          {
            label: "Visitors (Today)",
            value: summary.totalVisitorsToday,
            icon: <Eye />,
            gradient: "from-green-500 to-green-700",
            key: "Visitors (Today)",
            data: summary.visitorsTodayData || [],
          },
          {
            label: "Visitors (This Month)",
            value: summary.totalVisitorsThisMonth,
            icon: <Calendar />,
            gradient: "from-purple-500 to-purple-700",
            key: "Visitors (This Month)",
            data: summary.visitorsMonthData || [],
          },
          {
            label: "Currently Inside",
            value: summary.currentlyInside,
            icon: <Building2 />,
            gradient: "from-orange-500 to-orange-700",
            key: "Currently Inside",
            data: summary.currentInsideList || [],
          },
          {
            label: "Pending Approvals",
            value: summary.pendingApprovals,
            icon: <ClipboardList />,
            gradient: "from-red-500 to-red-700",
            key: "Pending Approvals",
            data: summary.pendingList || [],
          },
          {
            label: "Vehicles Inside",
            value: summary.vehiclesInside,
            icon: <Car />,
            gradient: "from-indigo-500 to-indigo-700",
            key: "Vehicles Inside",
            data: summary.vehiclesInsideData || [],
          },
          {
            label: "Material Movements (Today)",
            value: summary.materialMovementsToday,
            icon: <Package />,
            gradient: "from-teal-500 to-teal-700",
            key: "Material Movements (Today)",
            data: summary.materialMovementsTodayData || [],
          },
        ].map((item, idx) => (
          <div
            key={idx}
            onClick={() => {
              if (item.data && item.data.length > 0) {
                setDrawerData({ title: item.label, data: item.data });
              }
            }}
            className={`cursor-pointer h-28 transform-style preserve-3d transition-all duration-500 hover:rotate-x-6 hover:-rotate-y-3 hover:scale-105 rounded-xl shadow-xl p-1 text-white bg-gradient-to-br ${item.gradient}`}
          >
            <div className="flex items-center space-x-2 h-full px-2">
              <div className="bg-white/20 p-2 rounded-full">
                {React.cloneElement(item.icon, { size: 46, className: "text-white" })}
              </div>
              <div className="flex flex-col justify-center h-full">
                <p className="text-xs opacity-90">{item.label}</p>
                <p className="text-xl font-bold text-center">{item.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {drawerData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end mt-20">
          <div className="bg-white w-full max-w-lg p-4 overflow-y-auto shadow-lg rounded-l-lg relative">

            {/* Header: Export + Close */}
            <div className="flex justify-between items-center border-b pb-2 mb-3">
              <h3 className="text-lg font-semibold text-gray-700">
                {drawerData.title} - First 50 Entries
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
                placeholder="Search by name or source..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:ring-blue-300"
              />
            </div>

            {/* Data List */}
            <ul className="space-y-2 max-h-[400px] overflow-y-auto text-sm">
              {paginatedData.map((item, idx) => (
                <li key={idx} className="border rounded-md p-2">
                  <strong>{item.name || item.title || 'Unknown'}</strong>
                  {item.movementType && (
                    <>
                      <div>Type: {item.movementType} ({item.quantity} {item.unit})</div>
                      <div>From: {item.source} → To: {item.destination}</div>
                    </>
                  )}
                  <div>Entry: {item.entryTime ? new Date(item.entryTime).toLocaleString() : 'N/A'}</div>
                </li>
              ))}
              {paginatedData.length === 0 && (
                <li className="text-gray-500 text-center">No matching records found.</li>
              )}
            </ul>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-4 text-sm">
              <span>
                Showing {startIndex + 1} to {Math.min(endIndex, filteredData.length)} of {filteredData.length}
              </span>
              <div className="space-x-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-2 py-1 border rounded disabled:opacity-50"
                >
                  Prev
                </button>
                <button
                  onClick={() =>
                    setCurrentPage((p) => (endIndex < filteredData.length ? p + 1 : p))
                  }
                  disabled={endIndex >= filteredData.length}
                  className="px-2 py-1 border rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}



      {/* 2. Live Visitor Monitoring */}
      <h2 className="text-xl font-semibold mb-2 text-gray-800 text-center rounded-xl shadow">Live Visitor Monitoring</h2>
      <Card className="p-1 mb-8">
        <table >
          <thead >
            <tr>
              <th>Photo</th>
              <th>Name & Phone</th>
              <th>Time In/Out</th>
              <th>Host</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {liveVisitors.length > 0 ? (
              liveVisitors.map((visitor) => (
                <tr key={visitor.id}>
                  <td >
                    <img className="h-10 w-10 rounded-full" src={visitor.photo} alt={visitor.name} />
                  </td>
                  <td >
                    <div className="text-sm font-medium text-gray-900">{visitor.name}</div>
                    <div className="text-sm text-gray-500">{visitor.phone}</div>
                  </td>
                  <td >
                    <div className="text-sm text-gray-900">In: {visitor.entryTime}</div>
                    <div className="text-sm text-gray-500">Out: {visitor.expectedExitTime || 'N/A'}</div>
                  </td>
                  <td >{visitor.host}</td>
                  <td >
                    {visitor.status === 'Checked-in' ? (
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

      {/* 3. Upcoming Visitor Schedule */}
      <h2 className="text-xl font-semibold mb-2 text-gray-800 text-center rounded-xl shadow">Upcoming Visitor Schedule</h2>
      <Card className="p-1 mb-8">
        <table>
          <thead>
            <tr>
              <th>Time</th>
              <th>Visitor & Host</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {upcomingVisitors.length > 0 ? (
              upcomingVisitors.map((visitor) => (
                <tr key={visitor.id}>
                  <td>{visitor.time}</td>
                  <td>
                    <div className="text-sm font-medium text-gray-900">{visitor.name} ({visitor.organization}), Host: {visitor.host}</div>
                    <div className="text-sm text-gray-500">Purpose: {visitor.purpose}</div>
                  </td>
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

      {/* 4. Recent Visitor Log */}
      <h2 className="text-xl font-semibold mb-2 text-gray-800 text-center rounded-xl shadow">Recent Visitor Log</h2>
      <Card className="p-1 mb-8">
        <table >
          <thead>
            <tr>
              <th>Photo</th>
              <th>Name & Contact</th>
              <th>Host</th>
              <th>Time In/Out</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {recentVisitors.length > 0 ? (
              recentVisitors.map((visitor) => (
                <tr key={visitor.id}>
                  <td >
                    <img className="h-10 w-10 rounded-full" src={visitor.photo} alt={visitor.name} />
                  </td>
                  <td>
                    <div className="text-sm font-medium text-gray-900">{visitor.name}</div>
                    <div className="text-sm text-gray-500">{visitor.contact}</div>
                  </td>
                  <td>{visitor.host}</td>
                  <td>
                    <div className="text-sm text-gray-900">In: {visitor.timeIn}</div>
                    <div className="text-sm text-gray-500">Out: {visitor.timeOut || 'N/A'}</div>
                  </td>
                  <td>
                    <Badge status={visitor.status} />
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

      {/* 5. Visitor Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="p-1 mb-8">
          <h2 className="text-xl font-semibold mb-2 text-gray-800 text-center rounded-xl shadow">Visitor Analytics</h2>
          <h3 className="text-lg text-center font-medium text-gray-700 mb-4">Daily Visitor Volume</h3>
          <ResponsiveContainer width="90%" height={350}>
            <BarChart data={mockData.visitorTrends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
            <BarChart data={mockData.peakHours} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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


      {/* 6. Frequent Visitors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="p-1 mb-8">
          <h2 className="text-xl font-semibold mb-2 text-gray-800 text-center rounded-xl shadow">Frequent Visitors</h2>
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
                frequentVisitors.map((visitor) => (
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
                employeeAccess.map((employee) => (
                  <tr key={employee.id}>
                    <td>{employee.name}</td>
                    <td>
                      <div className="text-sm text-gray-900">In: {employee.entry}</div>
                      <div className="text-sm text-gray-500">Out: {employee.exit || 'N/A'}</div>
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


      {/* 8. Security Alerts / Watchlist */}
      <Card className="p-1 mb-8">
        <h2 className="text-xl font-semibold mb-2 text-gray-800 text-center rounded-xl shadow">Security Alerts / Watchlist</h2>
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
              securityAlerts.map((alert) => (
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




      {/* 09. Material Movement Log */}
      <Card className="p-1 mb-8">
        <h2 className="text-xl font-semibold mb-2 text-gray-800 text-center rounded-xl shadow">Material Movement Log</h2>
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
            {materialMovement.length > 0 ? (
              materialMovement.map((material) => (
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
              ))
            ) : (
              <tr>
                <td>No material movements logged.</td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      {/* 10. Vehicle Entry & Monitoring */}
      <Card className="p-1 mb-8">
        <h2 className="text-xl font-semibold mb-2 text-gray-800 text-center rounded-xl shadow">Vehicle Entry & Monitoring</h2>
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
            {vehicleMonitoring.length > 0 ? (
              vehicleMonitoring.map((vehicle) => (
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
                    <div className="text-sm text-gray-900">In: {vehicle.entry}</div>
                    <div className="text-sm text-gray-500">Out: {vehicle.exit || 'N/A'}</div>
                  </td>
                  <td>
                    <Badge status={vehicle.securityCheck} />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td>No vehicles currently monitored.</td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

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
