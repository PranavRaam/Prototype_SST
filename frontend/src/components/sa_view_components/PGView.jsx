import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../sa_view_css/PGView.css';
import './StaffList.css';
import './reactiveoc.css';
import './InteractionLog.css';
import './ValueCommunication.css';
import StaffList from './StaffList';
import ReactiveOutcomes from './reactiveoc';
import InteractionLog from './InteractionLog';

const PGView = () => {
  const navigate = useNavigate();
  const { pgName } = useParams();
  const [activeSection, setActiveSection] = useState('overview');
  const [selectedDateRange, setSelectedDateRange] = useState({ start: '', end: '' });
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Add new state for form inputs
  const [newPhysician, setNewPhysician] = useState({
    name: "",
    npi: "",
    specialty: "",
    status: "Active",
    onboarded: false
  });
  const [newHHA, setNewHHA] = useState({
    name: "",
    location: "",
    contact: "",
    onboarded: false
  });
  const [newReactiveOutcome, setNewReactiveOutcome] = useState({
    title: "",
    status: "Improved",
    change: "+0%"
  });
  const [showPhysicianForm, setShowPhysicianForm] = useState(false);
  const [showHHAForm, setShowHHAForm] = useState(false);
  const [showReactiveOutcomeForm, setShowReactiveOutcomeForm] = useState(false);
  
  // Mock data - in a real app, this would come from an API
  const [pgData, setPgData] = useState({
    name: pgName ? pgName.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : "PG Name",
    contact: {
      address: "123 Healthcare Ave, Medical District",
      phone: "(555) 123-4567",
      email: "contact@pggroup.com"
    },
    location: {
      lat: 40.7128,
      lng: -74.0060,
      address: "New York, NY"
    },
    recentActivity: [
      { 
        id: 1,
        type: 'claim',
        description: 'New claim filed for patient John Doe',
        time: '2 hours ago',
        icon: '📋'
      },
      {
        id: 2,
        type: 'onboarding',
        description: 'Dr. Sarah Johnson completed onboarding',
        time: '3 hours ago',
        icon: '✓'
      },
      {
        id: 3,
        type: 'report',
        description: 'Monthly performance report generated',
        time: '5 hours ago',
        icon: '📊'
      },
      {
        id: 4,
        type: 'meeting',
        description: 'Staff meeting scheduled for tomorrow',
        time: '6 hours ago',
        icon: '📅'
      },
      {
        id: 5,
        type: 'alert',
        description: 'Patient satisfaction scores updated',
        time: 'Yesterday',
        icon: '📈'
      }
    ],
    physicians: [
      { id: 1, name: "Dr. Sarah Johnson", npi: "1234567890", specialty: "Primary Care", status: "Active", onboarded: true },
      { id: 2, name: "Dr. Robert Chen", npi: "2345678901", specialty: "Cardiology", status: "Active", onboarded: false },
      { id: 3, name: "Dr. Maria Garcia", npi: "3456789012", specialty: "Neurology", status: "On Leave", onboarded: true },
      { id: 4, name: "Dr. James Wilson", npi: "4567890123", specialty: "Oncology", status: "Active", onboarded: false },
      { id: 5, name: "Dr. Emily Brown", npi: "5678901234", specialty: "Pediatrics", status: "Active", onboarded: true }
    ],
    staff: [
      { id: 1, name: "John Smith", position: "Office Manager", department: "Administration" },
      { id: 2, name: "Lisa Jones", position: "Nurse", department: "Clinical" },
      { id: 3, name: "Mark Davis", position: "Medical Assistant", department: "Clinical" }
    ],
    npp: [
      { id: 1, name: "Nancy White", position: "Nurse Practitioner", specialty: "Primary Care" },
      { id: 2, name: "Tom Brown", position: "Physician Assistant", specialty: "Orthopedics" }
    ],
    hhahs: [
      { id: 1, name: "HomeHealth Plus", location: "Los Angeles, CA", contact: "(555) 111-2222", onboarded: true },
      { id: 2, name: "CaringHands HHA", location: "San Francisco, CA", contact: "(555) 222-3333", onboarded: false },
      { id: 3, name: "Comfort Care Services", location: "San Diego, CA", contact: "(555) 333-4444", onboarded: true },
      { id: 4, name: "Elite Home Health", location: "Sacramento, CA", contact: "(555) 444-5555", onboarded: false }
    ],
    proactiveOutcomes: [
      { id: 1, title: "Physician Onboarding", progress: 60, status: "In Progress" },
      { id: 2, title: "HHAH Integration", progress: 75, status: "On Track" },
      { id: 3, title: "Patient Engagement", progress: 45, status: "Needs Attention" }
    ],
    reactiveOutcomes: [
      { id: 1, title: "Emergency Response Time", status: "Improved", change: "+15%" },
      { id: 2, title: "Patient Satisfaction", status: "Stable", change: "0%" },
      { id: 3, title: "Treatment Adherence", status: "Declined", change: "-5%" }
    ],
    claims: [
      { id: 1, patientName: "John Doe", claimId: "CLM001", amount: 1500, date: "2024-03-15", status: "Approved" },
      { id: 2, patientName: "Jane Smith", claimId: "CLM002", amount: 2300, date: "2024-03-10", status: "Pending" },
      { id: 3, patientName: "Bob Wilson", claimId: "CLM003", amount: 1800, date: "2024-02-28", status: "Approved" },
      { id: 4, patientName: "Mary Johnson", claimId: "CLM004", amount: 3200, date: "2024-02-15", status: "Denied" },
      { id: 5, patientName: "Steve Brown", claimId: "CLM005", amount: 2100, date: "2024-01-30", status: "Approved" }
    ],
    valueCommunication: [
      { id: 1, metric: "Patient Satisfaction", score: 4.5, trend: "up", lastUpdate: "2024-03-15" },
      { id: 2, metric: "Care Quality", score: 4.2, trend: "stable", lastUpdate: "2024-03-10" },
      { id: 3, metric: "Response Time", score: 3.8, trend: "down", lastUpdate: "2024-03-05" }
    ],
    rapport: {
      overall: 85,
      metrics: [
        { id: 1, name: "Communication", score: 90 },
        { id: 2, name: "Trust", score: 85 },
        { id: 3, name: "Reliability", score: 80 }
      ]
    }
  });

  const [valueCommunicationState, setValueCommunicationState] = useState({
    reports: [
      { id: 1, fileName: "March_2024_Communication.pdf", notes: "Monthly communication summary", date: "2024-03-15" },
      { id: 2, fileName: "Weekly_Update_12.pdf", notes: "Weekly progress report", date: "2024-03-10" },
      { id: 3, fileName: "Patient_Feedback_Q1.pdf", notes: "Quarterly patient feedback", date: "2024-03-05" }
    ],
    interactions: [
      { id: 1, summary: "Discussed patient engagement strategies with Dr. Johnson", date: "2024-03-15", author: "Admin" },
      { id: 2, summary: "Review of care quality metrics with staff", date: "2024-03-10", author: "Manager" },
      { id: 3, summary: "Team meeting about response time improvement", date: "2024-03-05", author: "Coordinator" }
    ],
    mdrTasks: [
      { id: 1, task: "Prepare monthly data analysis", completed: true, dueDate: "2024-03-20" },
      { id: 2, task: "Collect physician feedback", completed: false, dueDate: "2024-03-18" },
      { id: 3, task: "Update patient satisfaction metrics", completed: false, dueDate: "2024-03-25" }
    ],
    newInteraction: "",
    newReportNote: "",
    showAllInteractions: false,
    selectedReport: null,
    isEditingReport: false
  });

  const [rapportState, setRapportState] = useState({
    records: [
      { id: 1, name: "Check Name", designation: "Designation Check", score: 10, understanding: "Excellent understanding of all processes", date: "2024-03-15" },
      { id: 2, name: "Test Name", designation: "Designation Test", score: 3, understanding: "Needs significant improvement", date: "2024-03-10" },
      { id: 3, name: "Person1", designation: "Designation Check", score: 2, understanding: "Limited understanding of core processes", date: "2024-03-05" }
    ],
    newRecord: {
      name: "",
      designation: "",
      score: "",
      understanding: ""
    },
    searchTerm: "",
    sortConfig: { key: "date", direction: "desc" },
    editingRecord: null,
    showAnalytics: false,
    notification: null
  });

  const handleOnboardingToggle = (type, id) => {
    setPgData(prevData => {
      const newData = { ...prevData };
      if (type === 'physician') {
        newData.physicians = prevData.physicians.map(physician =>
          physician.id === id ? { ...physician, onboarded: !physician.onboarded } : physician
        );
      } else if (type === 'hhah') {
        newData.hhahs = prevData.hhahs.map(hhah =>
          hhah.id === id ? { ...hhah, onboarded: !hhah.onboarded } : hhah
        );
      }
      return newData;
    });
  };

  const handleSortClick = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleDateRangeChange = (e) => {
    const { name, value } = e.target;
    setSelectedDateRange(prev => ({
      ...prev,
      [name]: value
    }));
    setSelectedPeriod('custom');
  };

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
    const today = new Date();
    let startDate = new Date();
    
    if (period === 'month') {
      startDate.setMonth(today.getMonth() - 1);
    } else if (period === 'year') {
      startDate.setFullYear(today.getFullYear() - 1);
    } else if (period === 'all') {
      setSelectedDateRange({ start: '', end: '' });
      return;
    }
    
    setSelectedDateRange({
      start: startDate.toISOString().split('T')[0],
      end: today.toISOString().split('T')[0]
    });
  };

  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
    const [year, month] = e.target.value.split('-');
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    setSelectedDateRange({
      start: startDate.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0]
    });
    setSelectedPeriod('custom');
  };

  const handleYearChange = (e) => {
    const year = e.target.value;
    setSelectedYear(year);
    setSelectedDateRange({
      start: `${year}-01-01`,
      end: `${year}-12-31`
    });
    setSelectedPeriod('custom');
  };

  const getFilteredClaims = () => {
    let filteredClaims = [...pgData.claims];

    // Apply date filtering
    if (selectedDateRange.start || selectedDateRange.end) {
      filteredClaims = filteredClaims.filter(claim => {
        const claimDate = new Date(claim.date);
        const startDate = selectedDateRange.start ? new Date(selectedDateRange.start) : null;
        const endDate = selectedDateRange.end ? new Date(selectedDateRange.end) : null;
        
        if (startDate && endDate) {
          return claimDate >= startDate && claimDate <= endDate;
        } else if (startDate) {
          return claimDate >= startDate;
        } else if (endDate) {
          return claimDate <= endDate;
        }
        return true;
      });
    }

    // Apply status filtering
    if (statusFilter !== 'all') {
      filteredClaims = filteredClaims.filter(claim => 
        claim.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Apply sorting
    filteredClaims.sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      if (sortConfig.key === 'amount') {
        aValue = parseFloat(aValue);
        bValue = parseFloat(bValue);
      } else if (sortConfig.key === 'date') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return filteredClaims;
  };

  const handleDownloadClaims = (format) => {
    const filteredClaims = getFilteredClaims();
    
    if (format === 'csv') {
      const csvContent = [
        ["Patient Name", "Claim ID", "Amount", "Status", "Date Filed"],
        ...filteredClaims.map(claim => [
          claim.patientName,
          claim.claimId,
          `$${claim.amount}`,
          claim.status,
          claim.date
        ])
      ].map(row => row.join(",")).join("\\n");

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `claims-${pgData.name}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } else if (format === 'pdf') {
      // In a real application, you would use a library like jsPDF to generate the PDF
      alert('PDF export functionality would be implemented here with jsPDF or similar library');
    }
  };

  const renderMap = () => (
    <div className="pg-map-container">
      <div className="mock-map">
        <div className="map-placeholder">
          <h3>PG Location Map</h3>
          <p>Location: {pgData.location.address}</p>
          <p>Coordinates: {pgData.location.lat}, {pgData.location.lng}</p>
        </div>
      </div>
    </div>
  );

  const renderClaimsSection = () => (
    <div className="claims-section">
      <div className="claims-header">
        <h4>Claims</h4>
        <div className="claims-filters">
          <div className="filter-group">
            <select 
              value={selectedPeriod} 
              onChange={(e) => handlePeriodChange(e.target.value)}
              className="period-select"
            >
              <option value="all">All Time</option>
              <option value="month">Last Month</option>
              <option value="year">Last Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          <div className="filter-group">
            <input
              type="month"
              value={selectedMonth}
              onChange={handleMonthChange}
              className="month-input"
              placeholder="Select Month"
            />
          </div>

          <div className="filter-group">
            <select 
              value={selectedYear}
              onChange={handleYearChange}
              className="year-select"
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          {selectedPeriod === 'custom' && (
            <div className="date-range">
              <input
                type="date"
                name="start"
                value={selectedDateRange.start}
                onChange={handleDateRangeChange}
                className="date-input"
              />
              <span>to</span>
              <input
                type="date"
                name="end"
                value={selectedDateRange.end}
                onChange={handleDateRangeChange}
                className="date-input"
              />
            </div>
          )}

          <div className="filter-group">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="status-select"
            >
              <option value="all">All Status</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="denied">Denied</option>
            </select>
          </div>

          <div className="export-buttons">
            <button className="download-button" onClick={() => handleDownloadClaims('csv')}>
              Download CSV
            </button>
            <button className="download-button" onClick={() => handleDownloadClaims('pdf')}>
              Download PDF
            </button>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="claims-table">
          <thead>
            <tr>
              <th onClick={() => handleSortClick('patientName')}>
                Patient Name
                {sortConfig.key === 'patientName' && (
                  <span className="sort-indicator">
                    {sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}
                  </span>
                )}
              </th>
              <th onClick={() => handleSortClick('claimId')}>
                Claim ID
                {sortConfig.key === 'claimId' && (
                  <span className="sort-indicator">
                    {sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}
                  </span>
                )}
              </th>
              <th onClick={() => handleSortClick('amount')}>
                Amount
                {sortConfig.key === 'amount' && (
                  <span className="sort-indicator">
                    {sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}
                  </span>
                )}
              </th>
              <th onClick={() => handleSortClick('status')}>
                Status
                {sortConfig.key === 'status' && (
                  <span className="sort-indicator">
                    {sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}
                  </span>
                )}
              </th>
              <th onClick={() => handleSortClick('date')}>
                Date Filed
                {sortConfig.key === 'date' && (
                  <span className="sort-indicator">
                    {sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}
                  </span>
                )}
              </th>
            </tr>
          </thead>
          <tbody>
            {getFilteredClaims().map(claim => (
              <tr key={claim.id}>
                <td>{claim.patientName}</td>
                <td>{claim.claimId}</td>
                <td>${claim.amount}</td>
                <td>
                  <span className={`claims-status-badge ${claim.status.toLowerCase()}`}>
                    {claim.status === 'Approved' && '✅ '}
                    {claim.status === 'Pending' && '⏳ '}
                    {claim.status === 'Denied' && '❌ '}
                    {claim.status}
                  </span>
                </td>
                <td>{new Date(claim.date).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderProactiveOutcomes = () => (
    <div className="outcomes-section proactive">
      <div className="section-header">
        <h2>Proactive Outcomes</h2>
        <p className="section-description">Manage physician and HHA onboarding, and track claims</p>
      </div>
      
      <div className="proactive-tables">
        {/* Physicians Table */}
        <div className="table-section physicians-section">
          <div className="section-header-with-actions">
            <h3>Physician Onboarding Status</h3>
            <div className="table-actions">
              <input
                type="text"
                placeholder="Search physicians..."
                className="search-input"
                onChange={(e) => {
                  // Add physician search functionality
                }}
              />
              <button className="action-button" onClick={() => setShowPhysicianForm(!showPhysicianForm)}>
                <span className="icon">+</span> Add Physician
              </button>
            </div>
          </div>
          
          {showPhysicianForm && (
            <div className="form-container">
              <h4>Add New Physician</h4>
              <div className="form-grid">
                <div className="form-group">
                  <label>Name:</label>
                  <input 
                    type="text" 
                    name="name" 
                    value={newPhysician.name} 
                    onChange={(e) => setNewPhysician(prev => ({
                      ...prev,
                      name: e.target.value
                    }))} 
                    placeholder="Enter full name"
                  />
                </div>
                <div className="form-group">
                  <label>NPI Number:</label>
                  <input 
                    type="text" 
                    name="npi" 
                    value={newPhysician.npi} 
                    onChange={(e) => setNewPhysician(prev => ({
                      ...prev,
                      npi: e.target.value
                    }))} 
                    placeholder="Enter NPI number"
                  />
                </div>
                <div className="form-group">
                  <label>Specialty:</label>
                  <input 
                    type="text" 
                    name="specialty" 
                    value={newPhysician.specialty} 
                    onChange={(e) => setNewPhysician(prev => ({
                      ...prev,
                      specialty: e.target.value
                    }))} 
                    placeholder="Enter specialty"
                  />
                </div>
                <div className="form-group">
                  <label>Status:</label>
                  <select name="status" value={newPhysician.status} onChange={(e) => setNewPhysician(prev => ({
                    ...prev,
                    status: e.target.value
                  }))} >
                    <option value="Active">Active</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
              </div>
              <div className="form-actions">
                <button className="submit-button" onClick={() => {
                  if (!newPhysician.name || !newPhysician.npi || !newPhysician.specialty) {
                    alert("Please fill in all required fields");
                    return;
                  }

                  setPgData(prev => ({
                    ...prev,
                    physicians: [
                      ...prev.physicians,
                      {
                        id: prev.physicians.length + 1,
                        ...newPhysician
                      }
                    ]
                  }));

                  // Reset the form
                  setNewPhysician({
                    name: "",
                    npi: "",
                    specialty: "",
                    status: "Active",
                    onboarded: false
                  });
                  setShowPhysicianForm(false);
                }}>Add Physician</button>
                <button className="cancel-button" onClick={() => setShowPhysicianForm(false)}>Cancel</button>
              </div>
            </div>
          )}
          
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Physician Name</th>
                  <th>NPI Number</th>
                  <th>Specialty</th>
                  <th>Status</th>
                  <th>Onboarded</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pgData.physicians.map(physician => (
                  <tr key={physician.id}>
                    <td>{physician.name}</td>
                    <td>{physician.npi}</td>
                    <td>{physician.specialty}</td>
                    <td>
                      <span className={`status-badge ${physician.status.toLowerCase().replace(/\s+/g, '-')}`}>
                        {physician.status}
                      </span>
                    </td>
                    <td>
                      <button 
                        className={`onboarding-toggle ${physician.onboarded ? 'onboarded' : 'not-onboarded'}`}
                        onClick={() => handleOnboardingToggle('physician', physician.id)}
                      >
                        {physician.onboarded ? '✓' : '✗'}
                      </button>
                    </td>
                    <td>
                      <div className="row-actions">
                        <button className="action-icon edit">Edit</button>
                        <button className="action-icon delete">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* HHAs Table */}
        <div className="table-section hhas-section">
          <div className="section-header-with-actions">
            <h3>HHAH Onboarding Status</h3>
            <div className="table-actions">
              <input
                type="text"
                placeholder="Search HHAs..."
                className="search-input"
                onChange={(e) => {
                  // Add HHA search functionality
                }}
              />
              <button className="action-button" onClick={() => setShowHHAForm(!showHHAForm)}>
                <span className="icon">+</span> Add HHA
              </button>
            </div>
          </div>
          
          {showHHAForm && (
            <div className="form-container">
              <h4>Add New HHA</h4>
              <div className="form-grid">
                <div className="form-group">
                  <label>Name:</label>
                  <input 
                    type="text" 
                    name="name" 
                    value={newHHA.name} 
                    onChange={(e) => setNewHHA(prev => ({
                      ...prev,
                      name: e.target.value
                    }))} 
                    placeholder="Enter HHA name"
                  />
                </div>
                <div className="form-group">
                  <label>Location:</label>
                  <input 
                    type="text" 
                    name="location" 
                    value={newHHA.location} 
                    onChange={(e) => setNewHHA(prev => ({
                      ...prev,
                      location: e.target.value
                    }))} 
                    placeholder="Enter location"
                  />
                </div>
                <div className="form-group">
                  <label>Contact:</label>
                  <input 
                    type="text" 
                    name="contact" 
                    value={newHHA.contact} 
                    onChange={(e) => setNewHHA(prev => ({
                      ...prev,
                      contact: e.target.value
                    }))} 
                    placeholder="Enter contact information"
                  />
                </div>
              </div>
              <div className="form-actions">
                <button className="submit-button" onClick={() => {
                  if (!newHHA.name || !newHHA.location || !newHHA.contact) {
                    alert("Please fill in all required fields");
                    return;
                  }

                  setPgData(prev => ({
                    ...prev,
                    hhahs: [
                      ...prev.hhahs,
                      {
                        id: prev.hhahs.length + 1,
                        ...newHHA
                      }
                    ]
                  }));

                  // Reset the form
                  setNewHHA({
                    name: "",
                    location: "",
                    contact: "",
                    onboarded: false
                  });
                  setShowHHAForm(false);
                }}>Add HHA</button>
                <button className="cancel-button" onClick={() => setShowHHAForm(false)}>Cancel</button>
              </div>
            </div>
          )}
          
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>HHA Name</th>
                  <th>Location</th>
                  <th>Contact</th>
                  <th>Onboarded</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pgData.hhahs.map(hhah => (
                  <tr key={hhah.id}>
                    <td>{hhah.name}</td>
                    <td>{hhah.location}</td>
                    <td>{hhah.contact}</td>
                    <td>
                      <button 
                        className={`onboarding-toggle ${hhah.onboarded ? 'onboarded' : 'not-onboarded'}`}
                        onClick={() => handleOnboardingToggle('hhah', hhah.id)}
                      >
                        {hhah.onboarded ? '✓' : '✗'}
                      </button>
                    </td>
                    <td>
                      <div className="row-actions">
                        <button className="action-icon edit">Edit</button>
                        <button className="action-icon delete">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  const renderReactiveOutcomes = () => (
    <div className="reactive-outcomes-section full-width">
      <div className="section-header">
        <h2>Reactive Outcomes</h2>
      </div>
      <ReactiveOutcomes />
    </div>
  );

  const renderInteractionLog = () => (
    <div className="interaction-log-section">
      <InteractionLog />
    </div>
  );

  const renderStaffList = () => (
    <div className="staff-list-section">
      <StaffList />
    </div>
  );

  const renderValueCommunication = () => (
    <div className="value-communication-section">
      <div className="section-header">
        <h2>Value Communication</h2>
        <p className="section-description">Manage communications, reports, and interactions</p>
      </div>

      <div className="value-comm-grid">
        {/* Communication Reports Panel */}
        <div className="value-comm-panel reports-panel">
          <div className="panel-header">
            <h3>Communication Reports</h3>
            <button className="action-button">
              <span className="icon">+</span> Add Report
            </button>
          </div>
          
          <div className="reports-list">
            {valueCommunicationState.reports.map(report => (
              <div key={report.id} className="report-card">
                <div className="report-icon">
                  <span className="document-icon">📄</span>
                </div>
                <div className="report-details">
                  <h4 className="report-filename">{report.fileName}</h4>
                  {valueCommunicationState.isEditingReport && valueCommunicationState.selectedReport?.id === report.id ? (
                    <div className="edit-report">
                      <input
                        type="text"
                        value={valueCommunicationState.newReportNote}
                        onChange={(e) => setValueCommunicationState(prev => ({
                          ...prev,
                          newReportNote: e.target.value
                        }))}
                        className="interaction-input"
                      />
                      <button onClick={handleSaveReport} className="submit-button">
                        Save
                      </button>
                    </div>
                  ) : (
                    <p className="report-notes">{report.notes}</p>
                  )}
                  <div className="report-meta">
                    <span className="report-date">{report.date}</span>
                  </div>
                </div>
                <div className="report-actions">
                  <button className="icon-button edit" title="Edit Report" onClick={() => handleEditReport(report)}>
                    <span className="action-icon">✏️</span>
                  </button>
                  <button className="icon-button download" title="Download Report">
                    <span className="action-icon">⬇️</span>
                  </button>
                  <button className="icon-button delete" title="Delete Report" onClick={() => handleDeleteReport(report.id)}>
                    <span className="action-icon">🗑️</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Interaction Summaries Panel */}
        <div className="value-comm-panel interactions-panel">
          <div className="panel-header">
            <h3>Interaction Summaries</h3>
          </div>

          <div className="add-interaction-form">
            <input
              type="text"
              placeholder="Add new interaction summary..."
              value={valueCommunicationState.newInteraction}
              onChange={(e) => setValueCommunicationState(prev => ({
                ...prev,
                newInteraction: e.target.value
              }))}
              className="interaction-input"
            />
            <button 
              onClick={handleAddInteraction} 
              className="submit-button"
              disabled={!valueCommunicationState.newInteraction.trim()}
            >
              Add
            </button>
          </div>

          <div className="interactions-list">
            {(valueCommunicationState.showAllInteractions
              ? valueCommunicationState.interactions
              : valueCommunicationState.interactions.slice(0, 3)
            ).map(interaction => (
              <div key={interaction.id} className="interaction-card">
                <div className="interaction-content">
                  <p className="interaction-text">{interaction.summary}</p>
                  <div className="interaction-meta">
                    <span className="interaction-author">{interaction.author}</span>
                    <span className="interaction-date">{interaction.date}</span>
                  </div>
                </div>
              </div>
            ))}
            
            {valueCommunicationState.interactions.length > 3 && (
              <button 
                onClick={() => setValueCommunicationState(prev => ({
                  ...prev,
                  showAllInteractions: !prev.showAllInteractions
                }))}
                className="toggle-button"
              >
                {valueCommunicationState.showAllInteractions
                  ? "Show Less"
                  : `Show ${valueCommunicationState.interactions.length - 3} More`}
              </button>
            )}
          </div>
        </div>

        {/* MDR Tasks Panel */}
        <div className="value-comm-panel mdr-panel">
          <div className="panel-header">
            <h3>MDR & Weekly Reports</h3>
          </div>

          <div className="mdr-tasks-list">
            {valueCommunicationState.mdrTasks.map(task => (
              <div key={task.id} className={`task-card ${task.completed ? 'completed' : ''}`}>
                <div className="task-checkbox">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => handleToggleMDRTask(task.id)}
                    id={`task-${task.id}`}
                  />
                  <label htmlFor={`task-${task.id}`}></label>
                </div>
                <div className="task-content">
                  <p className="task-text">{task.task}</p>
                  <div className="task-meta">
                    <span className="task-due-date">Due: {task.dueDate}</span>
                    <span className={`task-status ${task.completed ? 'completed' : 'pending'}`}>
                      {task.completed ? 'Completed' : 'Pending'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="add-task-form">
            <input
              type="text"
              placeholder="Add new task..."
              className="task-input"
              value={valueCommunicationState.newTask || ''}
              onChange={(e) => setValueCommunicationState(prev => ({
                ...prev,
                newTask: e.target.value
              }))}
            />
            <input
              type="date"
              className="task-date-input"
              value={valueCommunicationState.newTaskDate || ''}
              onChange={(e) => setValueCommunicationState(prev => ({
                ...prev,
                newTaskDate: e.target.value
              }))}
            />
            <button 
              className="submit-button"
              disabled={!valueCommunicationState.newTask || !valueCommunicationState.newTaskDate}
              onClick={() => {
                if (valueCommunicationState.newTask && valueCommunicationState.newTaskDate) {
                  handleAddMDRTask(
                    valueCommunicationState.newTask,
                    valueCommunicationState.newTaskDate
                  );
                  setValueCommunicationState(prev => ({
                    ...prev,
                    newTask: "",
                    newTaskDate: ""
                  }));
                }
              }}
            >
              Add Task
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderRapportManagement = () => {
    return (
      <div className="rapport-section">
        <div className="rapport-header">
          <h2 className="rapport-title">Rapport Management</h2>
          <div className="rapport-actions">
            <div className="rapport-search">
              <input
                type="text"
                placeholder="Search by name or designation..."
                className="rapport-search-input"
              />
            </div>
            <button className="rapport-export-btn">Export CSV</button>
            <button className="rapport-export-btn">Export PDF</button>
          </div>
        </div>

        <div className="rapport-score">
          <div className="rapport-score-value">5.0</div>
          <div className="rapport-score-label">/10 Average Rapport Score</div>
        </div>

        <button className="rapport-analytics-toggle">Show Analytics</button>

        <div className="add-rapport-form">
          <div className="rapport-form-group">
            <label>Person Name</label>
            <input type="text" placeholder="Enter name" />
          </div>
          <div className="rapport-form-group">
            <label>Designation</label>
            <input type="text" placeholder="Enter designation" />
          </div>
          <div className="rapport-form-group">
            <label>Score (0-10)</label>
            <input type="number" min="0" max="10" placeholder="Enter score" />
          </div>
          <div className="rapport-form-group">
            <label>Understanding/Feedback</label>
            <textarea placeholder="Enter feedback"></textarea>
          </div>
          <button className="add-record-btn">Add Record</button>
        </div>

        <table className="rapport-table">
          <thead>
            <tr>
              <th>PERSON NAME</th>
              <th>DESIGNATION</th>
              <th>SCORE</th>
              <th>UNDERSTANDING</th>
              <th>DATE</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Check Name</td>
              <td>Designation Check</td>
              <td><span className="rapport-score-badge high">10/10</span></td>
              <td>Excellent understanding of all processes</td>
              <td>2024-03-15</td>
              <td>
                <div className="rapport-action-buttons">
                  <button className="rapport-edit-btn">Edit</button>
                  <button className="rapport-delete-btn">Delete</button>
                </div>
              </td>
            </tr>
            <tr>
              <td>Test Name</td>
              <td>Designation Test</td>
              <td><span className="rapport-score-badge low">3/10</span></td>
              <td>Needs significant improvement</td>
              <td>2024-03-10</td>
              <td>
                <div className="rapport-action-buttons">
                  <button className="rapport-edit-btn">Edit</button>
                  <button className="rapport-delete-btn">Delete</button>
                </div>
              </td>
            </tr>
            <tr>
              <td>Person1</td>
              <td>Designation Check</td>
              <td><span className="rapport-score-badge low">2/10</span></td>
              <td>Limited understanding of core processes</td>
              <td>2024-03-05</td>
              <td>
                <div className="rapport-action-buttons">
                  <button className="rapport-edit-btn">Edit</button>
                  <button className="rapport-delete-btn">Delete</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  // Value Communication Handlers
  const handleAddInteraction = () => {
    if (!valueCommunicationState.newInteraction.trim()) return;

    setValueCommunicationState(prev => ({
      ...prev,
      interactions: [
        {
          id: prev.interactions.length + 1,
          summary: prev.newInteraction,
          date: new Date().toISOString().split('T')[0],
          author: "Current User"
        },
        ...prev.interactions
      ],
      newInteraction: ""
    }));
  };

  const handleDeleteReport = (reportId) => {
    setValueCommunicationState(prev => ({
      ...prev,
      reports: prev.reports.filter(report => report.id !== reportId)
    }));
  };

  const handleEditReport = (report) => {
    setValueCommunicationState(prev => ({
      ...prev,
      selectedReport: report,
      isEditingReport: true,
      newReportNote: report.notes
    }));
  };

  const handleSaveReport = () => {
    setValueCommunicationState(prev => ({
      ...prev,
      reports: prev.reports.map(report =>
        report.id === prev.selectedReport.id
          ? { ...report, notes: prev.newReportNote }
          : report
      ),
      selectedReport: null,
      isEditingReport: false,
      newReportNote: ""
    }));
  };

  const handleToggleMDRTask = (taskId) => {
    setValueCommunicationState(prev => ({
      ...prev,
      mdrTasks: prev.mdrTasks.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    }));
  };

  const handleAddMDRTask = (taskName, dueDate) => {
    setValueCommunicationState(prev => ({
      ...prev,
      mdrTasks: [
        ...prev.mdrTasks,
        {
          id: prev.mdrTasks.length + 1,
          task: taskName,
          completed: false,
          dueDate
        }
      ]
    }));
  };

  // Rapport Handlers
  const handleRapportSort = (key) => {
    setRapportState(prev => ({
      ...prev,
      sortConfig: {
        key,
        direction: prev.sortConfig.key === key && prev.sortConfig.direction === 'asc' ? 'desc' : 'asc'
      }
    }));
  };

  const handleRapportSearch = (e) => {
    setRapportState(prev => ({
      ...prev,
      searchTerm: e.target.value
    }));
  };

  const handleNewRapportChange = (e) => {
    const { name, value } = e.target;
    setRapportState(prev => ({
      ...prev,
      newRecord: {
        ...prev.newRecord,
        [name]: value
      }
    }));
  };

  const validateRapportScore = (score) => {
    const numScore = parseFloat(score);
    return !isNaN(numScore) && numScore >= 0 && numScore <= 10;
  };

  const showNotification = (message, type = 'success') => {
    setRapportState(prev => ({
      ...prev,
      notification: { message, type }
    }));
    setTimeout(() => {
      setRapportState(prev => ({ ...prev, notification: null }));
    }, 3000);
  };

  const handleSubmitRapport = () => {
    const { newRecord } = rapportState;
    
    if (!newRecord.name || !newRecord.designation || !newRecord.score || !newRecord.understanding) {
      showNotification('Please fill in all fields', 'error');
      return;
    }

    if (!validateRapportScore(newRecord.score)) {
      showNotification('Score must be between 0 and 10', 'error');
      return;
    }

    setRapportState(prev => {
      const newRecordWithId = {
        id: prev.records.length + 1,
        ...newRecord,
        date: new Date().toISOString().split('T')[0]
      };

      // Check if score is low for notification
      if (parseFloat(newRecord.score) < 5) {
        showNotification(`Low score alert: ${newRecord.name} needs improvement`, 'warning');
      }

      return {
        ...prev,
        records: [newRecordWithId, ...prev.records],
        newRecord: {
          name: "",
          designation: "",
          score: "",
          understanding: ""
        }
      };
    });

    showNotification('Rapport record added successfully');
  };

  const handleEditRapport = (record) => {
    setRapportState(prev => ({
      ...prev,
      editingRecord: { ...record }
    }));
  };

  const handleUpdateRapport = () => {
    const { editingRecord } = rapportState;
    
    if (!validateRapportScore(editingRecord.score)) {
      showNotification('Score must be between 0 and 10', 'error');
      return;
    }

    setRapportState(prev => ({
      ...prev,
      records: prev.records.map(record =>
        record.id === editingRecord.id ? editingRecord : record
      ),
      editingRecord: null
    }));

    showNotification('Rapport record updated successfully');
  };

  const handleDeleteRapport = (id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      setRapportState(prev => ({
        ...prev,
        records: prev.records.filter(record => record.id !== id)
      }));
      showNotification('Rapport record deleted successfully');
    }
  };

  const getFilteredAndSortedRapportRecords = () => {
    let filteredRecords = [...rapportState.records];
    
    // Apply search filter
    if (rapportState.searchTerm) {
      const searchTerm = rapportState.searchTerm.toLowerCase();
      filteredRecords = filteredRecords.filter(record =>
        record.name.toLowerCase().includes(searchTerm) ||
        record.designation.toLowerCase().includes(searchTerm)
      );
    }

    // Apply sorting
    filteredRecords.sort((a, b) => {
      const aValue = a[rapportState.sortConfig.key];
      const bValue = b[rapportState.sortConfig.key];

      if (rapportState.sortConfig.key === 'score') {
        return rapportState.sortConfig.direction === 'asc'
          ? parseFloat(aValue) - parseFloat(bValue)
          : parseFloat(bValue) - parseFloat(aValue);
      }

      if (rapportState.sortConfig.direction === 'asc') {
        return aValue.localeCompare(bValue);
      }
      return bValue.localeCompare(aValue);
    });

    return filteredRecords;
  };

  const calculateAverageScore = () => {
    const scores = rapportState.records.map(record => parseFloat(record.score));
    const average = scores.reduce((a, b) => a + b, 0) / scores.length;
    return isNaN(average) ? 0 : average.toFixed(1);
  };

  const handleExportRapport = (format) => {
    const records = getFilteredAndSortedRapportRecords();
    
    if (format === 'csv') {
      const csvContent = [
        ["Name", "Designation", "Score", "Understanding", "Date"],
        ...records.map(record => [
          record.name,
          record.designation,
          record.score,
          record.understanding,
          record.date
        ])
      ].map(row => row.join(",")).join("\\n");

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rapport-records-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      showNotification('Report exported as CSV');
    } else if (format === 'pdf') {
      showNotification('PDF export functionality coming soon', 'info');
    }
  };

  const renderHeader = () => (
    <div className="pg-header">
      <div className="pg-title">
        <button 
          className="back-button" 
          onClick={() => window.history.back()}
        >
          <span className="back-arrow">←</span> Back
        </button>
        <h2>Physician Group Overview</h2>
        <p className="pg-subtitle">Manage and monitor physician group performance</p>
      </div>
      <div className="pg-actions">
        <button className="action-button primary">
          <span className="icon">📊</span> Export Data
        </button>
        <button className="action-button">
          <span className="icon">⚙️</span> Settings
        </button>
      </div>
    </div>
  );

  const renderNavigation = () => (
    <div className="navigation-tabs">
      <button
        className={`nav-tab ${activeSection === 'overview' ? 'active' : ''}`}
        onClick={() => setActiveSection('overview')}
      >
        Overview
      </button>
      <button
        className={`nav-tab ${activeSection === 'staff' ? 'active' : ''}`}
        onClick={() => setActiveSection('staff')}
      >
        Staff List
      </button>
      <button
        className={`nav-tab ${activeSection === 'proactive-outcomes' ? 'active' : ''}`}
        onClick={() => setActiveSection('proactive-outcomes')}
      >
        Proactive Outcomes
      </button>
      <button
        className={`nav-tab ${activeSection === 'reactive-outcomes' ? 'active' : ''}`}
        onClick={() => setActiveSection('reactive-outcomes')}
      >
        Reactive Outcomes
      </button>
      <button
        className={`nav-tab ${activeSection === 'interaction-log' ? 'active' : ''}`}
        onClick={() => setActiveSection('interaction-log')}
      >
        Interaction Log
      </button>
      <button
        className={`nav-tab ${activeSection === 'claims' ? 'active' : ''}`}
        onClick={() => setActiveSection('claims')}
      >
        Claims
      </button>
      <button
        className={`nav-tab ${activeSection === 'value-communication' ? 'active' : ''}`}
        onClick={() => setActiveSection('value-communication')}
      >
        Value Communication
      </button>
      <button
        className={`nav-tab ${activeSection === 'rapport' ? 'active' : ''}`}
        onClick={() => setActiveSection('rapport')}
      >
        Rapport
      </button>
    </div>
  );

  const renderOverviewSection = () => (
    <div className="overview-section">
      {/* Section Summary Cards - Clickable to navigate to tabs */}
      <h3 className="section-summaries-title">Section Summaries</h3>
      <div className="section-summaries">
        {/* Staff List Summary */}
        <div className="summary-card" onClick={() => setActiveSection('staff')}>
          <div className="summary-header">
            <h4>Staff List</h4>
            <span className="summary-icon">👥</span>
          </div>
          <div className="summary-content">
            <p className="summary-stat">{pgData.physicians.length} Physicians</p>
            <p className="summary-stat">{pgData.npp.length} NPPs</p>
            <p className="summary-stat">{pgData.staff.length} Staff Members</p>
          </div>
          <div className="summary-footer">
            <span className="view-more">View Details →</span>
          </div>
        </div>

        {/* Proactive Outcomes Summary */}
        <div className="summary-card" onClick={() => setActiveSection('proactive-outcomes')}>
          <div className="summary-header">
            <h4>Proactive Outcomes</h4>
            <span className="summary-icon">📈</span>
          </div>
          <div className="summary-content">
            <p className="summary-stat">{pgData.proactiveOutcomes?.length || 0} Active Programs</p>
            <p className="summary-stat">85% Success Rate</p>
          </div>
          <div className="summary-footer">
            <span className="view-more">View Details →</span>
          </div>
        </div>

        {/* Reactive Outcomes Summary */}
        <div className="summary-card" onClick={() => setActiveSection('reactive-outcomes')}>
          <div className="summary-header">
            <h4>Reactive Outcomes</h4>
            <span className="summary-icon">🚨</span>
          </div>
          <div className="summary-content">
            <p className="summary-stat">{pgData.reactiveOutcomes?.length || 0} Cases</p>
            <p className="summary-stat">72% Resolution Rate</p>
          </div>
          <div className="summary-footer">
            <span className="view-more">View Details →</span>
          </div>
        </div>

        {/* Interaction Log Summary */}
        <div className="summary-card" onClick={() => setActiveSection('interaction-log')}>
          <div className="summary-header">
            <h4>Interaction Log</h4>
            <span className="summary-icon">📝</span>
          </div>
          <div className="summary-content">
            <p className="summary-stat">Recent Interactions</p>
            <p className="summary-stat">View interaction history</p>
          </div>
          <div className="summary-footer">
            <span className="view-more">View Details →</span>
          </div>
        </div>

        {/* Claims Summary */}
        <div className="summary-card" onClick={() => setActiveSection('claims')}>
          <div className="summary-header">
            <h4>Claims</h4>
            <span className="summary-icon">📊</span>
          </div>
          <div className="summary-content">
            <p className="summary-stat">{pgData.claims?.length || 0} Total Claims</p>
            <p className="summary-stat">{pgData.claims?.filter(c => c.status === 'Pending').length || 0} Pending</p>
            <p className="summary-stat">${pgData.claims?.reduce((sum, claim) => sum + claim.amount, 0).toLocaleString() || 0} Total Value</p>
          </div>
          <div className="summary-footer">
            <span className="view-more">View Details →</span>
          </div>
        </div>

        {/* Value Communication Summary */}
        <div className="summary-card" onClick={() => setActiveSection('value-communication')}>
          <div className="summary-header">
            <h4>Value Communication</h4>
            <span className="summary-icon">💬</span>
          </div>
          <div className="summary-content">
            <p className="summary-stat">Communications</p>
            <p className="summary-stat">88% Engagement Rate</p>
          </div>
          <div className="summary-footer">
            <span className="view-more">View Details →</span>
          </div>
        </div>

        {/* Rapport Summary */}
        <div className="summary-card" onClick={() => setActiveSection('rapport')}>
          <div className="summary-header">
            <h4>Rapport</h4>
            <span className="summary-icon">🤝</span>
          </div>
          <div className="summary-content">
            <p className="summary-stat">{calculateAverageScore()}/10 Average Score</p>
            <p className="summary-stat">{rapportState.records ? rapportState.records.filter(record => parseFloat(record.score) >= 8).length : 0} High Rapport Relationships</p>
          </div>
          <div className="summary-footer">
            <span className="view-more">View Details →</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMainContent = () => {
    switch (activeSection) {
      case 'overview':
        return renderOverviewSection();
      case 'proactive-outcomes':
        return renderProactiveOutcomes();
      case 'staff':
        return renderStaffList();
      case 'communication':
        return renderValueCommunication();
      case 'reactive-outcomes':
        return renderReactiveOutcomes();
      case 'interaction-log':
        return renderInteractionLog();
      case 'claims':
        return renderClaimsSection();
      case 'value-communication':
        return renderValueCommunication();
      case 'rapport':
        return renderRapportManagement();
      default:
        return renderOverviewSection();
    }
  };

  return (
    <div className="pg-view-container">
      {renderHeader()}
      {renderNavigation()}
      <div className="pg-main-content">
        {renderMainContent()}
      </div>
      {rapportState.notification && (
        <div className={`notification ${rapportState.notification.type}`}>
          {rapportState.notification.message}
        </div>
      )}
    </div>
  );
};

export default PGView; 