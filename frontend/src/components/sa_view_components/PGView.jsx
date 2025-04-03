import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import '../sa_view_css/PGView.css';
import './StaffList.css';
import './proactiveoutcomes.css';
import './InteractionLog.css';
import './ValueCommunication.css';
import StaffList from './StaffList';
import ReactiveOutcomes from './reactiveoc';
import InteractionLog from './InteractionLog';

const PGView = () => {
  const navigate = useNavigate();
  const { pgName } = useParams();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState('overview');
  const [selectedDateRange, setSelectedDateRange] = useState({ start: '', end: '' });
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Add state for tracking if we're viewing from physician context
  const [fromPhysician, setFromPhysician] = useState(false);
  const [physicianContext, setPhysicianContext] = useState(null);
  
  // Add useEffect to check if we're coming from a physician view
  useEffect(() => {
    if (location.state?.fromPhysician) {
      setFromPhysician(true);
      setPhysicianContext({
        id: location.state.physicianId,
        name: location.state.physicianName
      });
    }
  }, [location]);

  // Add function to handle back navigation
  const handleBackNavigation = () => {
    if (fromPhysician && physicianContext) {
      navigate(`/physician/${physicianContext.id}`);
    } else {
      navigate('/');
    }
  };
  
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
  const [editingPhysician, setEditingPhysician] = useState(null);
  const [editingHHA, setEditingHHA] = useState(null);
  
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
      { id: 1, name: "Nancy White", position: "Nurse Practitioner", specialty: "Primary Care", npi: "7654321098" },
      { id: 2, name: "Tom Brown", position: "Physician Assistant", specialty: "Orthopedics", npi: "8765432109" }
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
      { id: 1, title: "Emergency Response Time", status: "Open", change: "+15%" },
      { id: 2, title: "Patient Satisfaction", status: "Analysing", change: "0%" },
      { id: 3, title: "Treatment Adherence", status: "Analysed", change: "-5%" },
      { id: 4, title: "Medication Compliance", status: "Catalysed", change: "+8%" },
      { id: 5, title: "Patient Followup", status: "Open", change: "-3%" }
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
    mbrsDone: 12,
    mbrsUpcoming: 5,
    weeklyReportsSent: 24,
    weeklyReportsUpcoming: 3,
    newInteraction: "",
    newReportNote: "",
    newMBRTask: "",
    newMBRTaskDate: "",
    newWeeklyTask: "",
    newWeeklyTaskDate: "",
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

  // Add a useEffect to check for physician updates from StaffList
  useEffect(() => {
    // When pgData.physicians changes, update proactiveOutcomes
    const physicianIds = pgData.physicians.map(physician => physician.id);
    
    // Find physicians that are in physicians list but not in proactiveOutcomes
    const newProactivePhysicians = pgData.physicians
      .filter(physician => {
        const existingPhysician = pgData.proactiveOutcomes.find(p => p.id === physician.id && p.type === 'physician');
        return !existingPhysician;
      })
      .map(physician => ({
        id: physician.id,
        name: physician.name,
        npi: physician.npi,
        specialty: physician.specialty,
        onboarded: true,
        type: 'physician', // Ensure type is specified
        dateAdded: new Date().toISOString()
      }));
    
    if (newProactivePhysicians.length > 0) {
      setPgData(prev => ({
        ...prev,
        proactiveOutcomes: [...prev.proactiveOutcomes, ...newProactivePhysicians]
      }));
    }
  }, [pgData.physicians]);

  const handleOnboardingToggle = (type, id) => {
    setPgData(prev => {
      // Update in the proactiveOutcomes array
      const updatedOutcomes = prev.proactiveOutcomes.map(item => {
        if (item.id === id && item.type === type) {
          return { ...item, onboarded: !item.onboarded };
        }
        return item;
      });
      
      // If it's a physician, also update in the physicians array
      let updatedPhysicians = [...prev.physicians];
      if (type === 'physician') {
        updatedPhysicians = prev.physicians.map(physician => {
          if (physician.id === id) {
            return { ...physician, onboarded: !physician.onboarded };
          }
          return physician;
        });
      }
      
      // If it's an HHA, also update in the hhahs array
      let updatedHHAs = [...prev.hhahs];
      if (type === 'hha') {
        updatedHHAs = prev.hhahs.map(hha => {
          if (hha.id === id) {
            return { ...hha, onboarded: !hha.onboarded };
          }
          return hha;
        });
      }
      
      return {
        ...prev,
        proactiveOutcomes: updatedOutcomes,
        physicians: updatedPhysicians,
        hhahs: updatedHHAs
      };
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
              <tr key={`claim-${claim.id}`}>
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
    <div className="proactive-outcomes-section outcomes-section">
      <div className="section-header">
        <h2>Proactive Outcomes</h2>
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
                  // Add physician search functionality - could be added in future
                }}
              />
              <button className="action-button" onClick={() => setShowPhysicianForm(!showPhysicianForm)}>
                <span className="icon">+</span> Add Physician
              </button>
            </div>
          </div>
          
          {showPhysicianForm && (
            <div className="form-container">
              <h4>{editingPhysician ? 'Edit Physician' : 'Add New Physician'}</h4>
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

                  if (editingPhysician) {
                    // Update existing physician
                    setPgData(prev => {
                      // Update in physicians array
                      const updatedPhysicians = prev.physicians.map(p => 
                        p.id === editingPhysician.id ? { ...p, ...newPhysician } : p
                      );
                      
                      // Update in proactiveOutcomes array
                      const updatedOutcomes = prev.proactiveOutcomes.map(outcome => {
                        if (outcome.id === editingPhysician.id && outcome.type === 'physician') {
                          return {
                            ...outcome,
                            name: newPhysician.name,
                            npi: newPhysician.npi,
                            specialty: newPhysician.specialty,
                            status: newPhysician.status,
                            onboarded: newPhysician.onboarded
                          };
                        }
                        return outcome;
                      });
                      
                      return {
                        ...prev,
                        physicians: updatedPhysicians,
                        proactiveOutcomes: updatedOutcomes
                      };
                    });
                    
                    // Reset editing state
                    setEditingPhysician(null);
                  } else {
                    // Add new physician
                    const newPhysicianObj = {
                      id: pgData.physicians.length + 1,
                      ...newPhysician,
                      onboarded: true // Set to true by default when added directly here
                    };

                    setPgData(prev => ({
                      ...prev,
                      physicians: [
                        ...prev.physicians,
                        newPhysicianObj
                      ],
                      // Also add to proactiveOutcomes
                      proactiveOutcomes: [
                        ...prev.proactiveOutcomes,
                        {
                          id: newPhysicianObj.id,
                          name: newPhysicianObj.name,
                          npi: newPhysicianObj.npi,
                          specialty: newPhysicianObj.specialty,
                          onboarded: true,
                          type: 'physician', // Ensure type is specified
                          dateAdded: new Date().toISOString()
                        }
                      ]
                    }));
                  }

                  // Reset the form
                  setNewPhysician({
                    name: "",
                    npi: "",
                    specialty: "",
                    status: "Active",
                    onboarded: false
                  });
                  setShowPhysicianForm(false);
                }}>{editingPhysician ? 'Update Physician' : 'Add Physician'}</button>
                <button className="cancel-button" onClick={() => {
                  setShowPhysicianForm(false);
                  setEditingPhysician(null);
                  setNewPhysician({
                    name: "",
                    npi: "",
                    specialty: "",
                    status: "Active",
                    onboarded: false
                  });
                }}>Cancel</button>
              </div>
            </div>
          )}
          
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Physician Name</th>
                  <th>NPI</th>
                  <th>Specialty</th>
                  <th>Analysis</th>
                  <th>Onboarded</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pgData.proactiveOutcomes
                  .filter(outcome => outcome.type === 'physician')
                  .map((physician, index) => {
                    const physicianData = pgData.physicians.find(p => p.id === physician.id) || physician;
                    return (
                      <tr key={`p-outcome-physician-${physician.id}-${index}`}>
                        <td>
                          <span className="physician-name-link" onClick={() => navigate(`/physician/${physician.id}`, { state: { physician: physicianData } })}>
                            {physician.name}
                          </span>
                        </td>
                        <td>{physician.npi}</td>
                        <td>{physician.specialty}</td>
                        <td>{physician.analysis || "Pending analysis"}</td>
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
                            <button className="action-icon edit" onClick={() => handleEditPhysician(physician)}>Edit</button>
                            <button className="action-icon delete" onClick={() => handleDeletePhysician(physician.id)}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>

        {/* HHAHs Table */}
        <div className="table-section hhahs-section">
          <div className="section-header-with-actions">
            <h3>HHAH Onboarding Status</h3>
            <div className="table-actions">
              <input
                type="text"
                placeholder="Search HHAHs..."
                className="search-input"
                onChange={(e) => {
                  // Add HHAH search functionality - could be added in future
                }}
              />
              <button className="action-button" onClick={() => setShowHHAForm(!showHHAForm)}>
                <span className="icon">+</span> Add HHAH
              </button>
            </div>
          </div>
          
          {showHHAForm && (
            <div className="form-container">
              <h4>{editingHHA ? 'Edit HHAH' : 'Add New HHAH'}</h4>
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
                    placeholder="Enter HHAH name"
                  />
                </div>
                <div className="form-group">
                  <label>Statistical Area:</label>
                  <input 
                    type="text" 
                    name="location" 
                    value={newHHA.location} 
                    onChange={(e) => setNewHHA(prev => ({
                      ...prev,
                      location: e.target.value
                    }))} 
                    placeholder="Enter statistical area"
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

                  if (editingHHA) {
                    // Update existing HHAH
                    setPgData(prev => ({
                      ...prev,
                      hhahs: prev.hhahs.map(h => 
                        h.id === editingHHA.id ? { ...h, ...newHHA } : h
                      )
                    }));
                    
                    // Reset editing state
                    setEditingHHA(null);
                  } else {
                    // Add new HHAH
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
                  }

                  // Reset the form
                  setNewHHA({
                    name: "",
                    location: "",
                    contact: "",
                    onboarded: false
                  });
                  setShowHHAForm(false);
                }}>{editingHHA ? 'Update HHAH' : 'Add HHAH'}</button>
                <button className="cancel-button" onClick={() => {
                  setShowHHAForm(false);
                  setEditingHHA(null);
                  setNewHHA({
                    name: "",
                    location: "",
                    contact: "",
                    onboarded: false
                  });
                }}>Cancel</button>
              </div>
            </div>
          )}
          
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>HHAH Name</th>
                  <th>Statistical Area</th>
                  <th>Contact</th>
                  <th>Analysis</th>
                  <th>Onboarded</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pgData.hhahs.map(hhah => (
                  <tr key={`hhah-entry-${hhah.id}`}>
                    <td>{hhah.name}</td>
                    <td>{hhah.location}</td>
                    <td>{hhah.contact}</td>
                    <td>{hhah.analysis || "Pending analysis"}</td>
                    <td>
                      <button 
                        className={`onboarding-toggle ${hhah.onboarded ? 'onboarded' : 'not-onboarded'}`}
                        onClick={() => handleOnboardingToggle('hha', hhah.id)}
                      >
                        {hhah.onboarded ? '✓' : '✗'}
                      </button>
                    </td>
                    <td>
                      <div className="row-actions">
                        <button className="action-icon edit" onClick={() => handleEditHHA(hhah)}>Edit</button>
                        <button className="action-icon delete" onClick={() => handleDeleteHHA(hhah.id)}>Delete</button>
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
      <div className="section-header">
        <h2>Staff Management</h2>
        <p className="section-description">Manage physicians, NPPs, and office staff members</p>
      </div>
      <StaffList pgData={pgData} setPgData={setPgData} />
    </div>
  );

  const renderValueCommunication = () => (
    <div className="value-communication-section">
      <div className="section-header">
        <h2>Value Communication</h2>
        <p className="section-description">Manage communications, reports, and interactions</p>
      </div>

      <div className="value-comm-grid">
        {/* Communication Reports Panel - Now separated into MBRs and Weekly Reports */}
        <div className="value-comm-panel reports-panel">
          <div className="panel-header">
            <h3>Communication Reports</h3>
          </div>
          
          {/* MBR Reports Section */}
          <div className="reports-section">
            <div className="reports-section-header">
              <h4 className="reports-section-title">MBR Reports</h4>
              <button className="action-button" onClick={() => {
                const fileName = `MBR_Report_${new Date().toISOString().split('T')[0]}.pdf`;
                const notes = window.prompt("Enter MBR report notes:", "Monthly business review");
                if (notes) {
                  setValueCommunicationState(prev => ({
                    ...prev,
                    reports: [
                      ...prev.reports,
                      {
                        id: prev.reports.length + 1,
                        fileName,
                        notes,
                        date: new Date().toISOString().split('T')[0]
                      }
                    ]
                  }));
                }
              }}>
                <span className="icon">+</span> Add MBR Report
              </button>
            </div>
            <div className="reports-list">
              {valueCommunicationState.reports
                .filter(report => report.fileName.toLowerCase().includes('communication') || report.fileName.toLowerCase().includes('feedback') || report.fileName.toLowerCase().includes('mbr'))
                .map(report => (
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
                      <button className="icon-button download" title="Download Report" onClick={() => handleDownloadReport(report)}>
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
          
          {/* Weekly Reports Section */}
          <div className="reports-section">
            <div className="reports-section-header">
              <h4 className="reports-section-title">Weekly Reports</h4>
              <button className="action-button" onClick={() => {
                const fileName = `Weekly_Update_${new Date().getDate()}.pdf`;
                const notes = window.prompt("Enter weekly report notes:", "Weekly progress report");
                if (notes) {
                  setValueCommunicationState(prev => ({
                    ...prev,
                    reports: [
                      ...prev.reports,
                      {
                        id: prev.reports.length + 1,
                        fileName,
                        notes,
                        date: new Date().toISOString().split('T')[0]
                      }
                    ]
                  }));
                }
              }}>
                <span className="icon">+</span> Add Weekly Report
              </button>
            </div>
            <div className="reports-list">
              {valueCommunicationState.reports
                .filter(report => report.fileName.toLowerCase().includes('weekly') || report.fileName.toLowerCase().includes('update'))
                .map(report => (
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
                      <button className="icon-button download" title="Download Report" onClick={() => handleDownloadReport(report)}>
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

        {/* MBR Tasks Panel - Now separate from Weekly Reports */}
        <div className="value-comm-panel mbr-panel">
          <div className="panel-header">
            <h3>MBR Tasks</h3>
          </div>

          <div className="mbr-stats">
            <div className="mbr-stat-item">
              <span className="stat-label">MBRs Done:</span>
              <span className="stat-value">{valueCommunicationState.mbrsDone}</span>
            </div>
            <div className="mbr-stat-item">
              <span className="stat-label">MBRs Upcoming:</span>
              <span className="stat-value">{valueCommunicationState.mbrsUpcoming}</span>
            </div>
          </div>

          <div className="mbr-tasks-list">
            {valueCommunicationState.mdrTasks
              .filter(task => task.task.toLowerCase().includes('data') || task.task.toLowerCase().includes('metrics'))
              .map(task => (
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
              placeholder="Add new MBR task..."
              className="task-input"
              value={valueCommunicationState.newMBRTask || ''}
              onChange={(e) => setValueCommunicationState(prev => ({
                ...prev,
                newMBRTask: e.target.value
              }))}
            />
            <input
              type="date"
              className="task-date-input"
              value={valueCommunicationState.newMBRTaskDate || ''}
              onChange={(e) => setValueCommunicationState(prev => ({
                ...prev,
                newMBRTaskDate: e.target.value
              }))}
            />
            <button 
              className="submit-button"
              onClick={() => {
                if (valueCommunicationState.newMBRTask && valueCommunicationState.newMBRTaskDate) {
                  handleAddMDRTask(
                    valueCommunicationState.newMBRTask,
                    valueCommunicationState.newMBRTaskDate
                  );
                  setValueCommunicationState(prev => ({
                    ...prev,
                    newMBRTask: "",
                    newMBRTaskDate: ""
                  }));
                } else {
                  alert("Please fill in both the task description and due date");
                }
              }}
            >
              Add MBR Task
            </button>
          </div>
        </div>

        {/* Weekly Reports Panel - Separated from MBR */}
        <div className="value-comm-panel weekly-reports-panel">
          <div className="panel-header">
            <h3>Weekly Reports</h3>
          </div>

          <div className="weekly-report-stats">
            <div className="weekly-stat-item">
              <span className="stat-label">Reports Sent:</span>
              <span className="stat-value">{valueCommunicationState.weeklyReportsSent}</span>
            </div>
            <div className="weekly-stat-item">
              <span className="stat-label">Reports Upcoming:</span>
              <span className="stat-value">{valueCommunicationState.weeklyReportsUpcoming}</span>
            </div>
          </div>

          <div className="weekly-tasks-list">
            {valueCommunicationState.mdrTasks
              .filter(task => task.task.toLowerCase().includes('feedback') || task.task.toLowerCase().includes('collect'))
              .map(task => (
                <div key={task.id} className={`task-card ${task.completed ? 'completed' : ''}`}>
                  <div className="task-checkbox">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => handleToggleMDRTask(task.id)}
                      id={`weekly-task-${task.id}`}
                    />
                    <label htmlFor={`weekly-task-${task.id}`}></label>
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
              placeholder="Add new weekly report task..."
              className="task-input"
              value={valueCommunicationState.newWeeklyTask || ''}
              onChange={(e) => setValueCommunicationState(prev => ({
                ...prev,
                newWeeklyTask: e.target.value
              }))}
            />
            <input
              type="date"
              className="task-date-input"
              value={valueCommunicationState.newWeeklyTaskDate || ''}
              onChange={(e) => setValueCommunicationState(prev => ({
                ...prev,
                newWeeklyTaskDate: e.target.value
              }))}
            />
            <button 
              className="submit-button"
              onClick={() => {
                if (valueCommunicationState.newWeeklyTask && valueCommunicationState.newWeeklyTaskDate) {
                  handleAddMDRTask(
                    valueCommunicationState.newWeeklyTask, 
                    valueCommunicationState.newWeeklyTaskDate
                  );
                  setValueCommunicationState(prev => ({
                    ...prev,
                    newWeeklyTask: "",
                    newWeeklyTaskDate: ""
                  }));
                } else {
                  alert("Please fill in both the task description and due date");
                }
              }}
            >
              Add Weekly Task
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
                onChange={(e) => handleRapportSearch(e)}
                value={rapportState.searchTerm || ''}
              />
            </div>
            <button className="rapport-export-btn" onClick={() => handleExportRapport('csv')}>Export CSV</button>
            <button className="rapport-export-btn" onClick={() => handleExportRapport('pdf')}>Export PDF</button>
          </div>
        </div>

        <div className="rapport-score">
          <div className="rapport-score-value">{calculateAverageScore()}</div>
          <div className="rapport-score-label">/10 Average Rapport Score</div>
        </div>

        <button 
          className="rapport-analytics-toggle"
          onClick={() => setRapportState(prev => ({ ...prev, showAnalytics: !prev.showAnalytics }))}
        >
          {rapportState.showAnalytics ? "Hide Analytics" : "Show Analytics"}
        </button>

        {rapportState.showAnalytics && (
          <div className="rapport-analytics">
            <h3>Rapport Analytics</h3>
            <div className="rapport-stats">
              <div className="rapport-stat">
                <span className="stat-label">High Rapport (8-10):</span>
                <span className="stat-value">{rapportState.records.filter(r => parseFloat(r.score) >= 8).length}</span>
              </div>
              <div className="rapport-stat">
                <span className="stat-label">Medium Rapport (5-7):</span>
                <span className="stat-value">{rapportState.records.filter(r => parseFloat(r.score) >= 5 && parseFloat(r.score) < 8).length}</span>
              </div>
              <div className="rapport-stat">
                <span className="stat-label">Low Rapport (0-4):</span>
                <span className="stat-value">{rapportState.records.filter(r => parseFloat(r.score) < 5).length}</span>
              </div>
            </div>
          </div>
        )}

        <div className="add-rapport-form">
          <div className="rapport-form-group">
            <label>Person Name</label>
            <input 
              type="text" 
              placeholder="Enter name" 
              name="name"
              value={rapportState.newRecord.name}
              onChange={(e) => handleNewRapportChange(e)}
            />
          </div>
          <div className="rapport-form-group">
            <label>Designation</label>
            <input 
              type="text" 
              placeholder="Enter designation" 
              name="designation"
              value={rapportState.newRecord.designation}
              onChange={(e) => handleNewRapportChange(e)}
            />
          </div>
          <div className="rapport-form-group">
            <label>Score (0-10)</label>
            <input 
              type="number" 
              min="0" 
              max="10" 
              placeholder="Enter score" 
              name="score"
              value={rapportState.newRecord.score}
              onChange={(e) => handleNewRapportChange(e)}
            />
          </div>
          <div className="rapport-form-group">
            <label>Understanding/Feedback</label>
            <textarea 
              placeholder="Enter feedback" 
              name="understanding"
              value={rapportState.newRecord.understanding}
              onChange={(e) => handleNewRapportChange(e)}
            ></textarea>
          </div>
          <button className="add-record-btn" onClick={handleSubmitRapport}>Add Record</button>
        </div>

        <table className="rapport-table">
          <thead>
            <tr>
              <th onClick={() => handleRapportSort('name')}>
                PERSON NAME
                {rapportState.sortConfig.key === 'name' && (
                  <span>{rapportState.sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}</span>
                )}
              </th>
              <th onClick={() => handleRapportSort('designation')}>
                DESIGNATION
                {rapportState.sortConfig.key === 'designation' && (
                  <span>{rapportState.sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}</span>
                )}
              </th>
              <th onClick={() => handleRapportSort('score')}>
                SCORE
                {rapportState.sortConfig.key === 'score' && (
                  <span>{rapportState.sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}</span>
                )}
              </th>
              <th>UNDERSTANDING</th>
              <th onClick={() => handleRapportSort('date')}>
                DATE
                {rapportState.sortConfig.key === 'date' && (
                  <span>{rapportState.sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}</span>
                )}
              </th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {getFilteredAndSortedRapportRecords().map(record => (
              <tr key={`rapport-${record.id}`}>
                <td>{record.name}</td>
                <td>{record.designation}</td>
                <td>
                  <span className={`rapport-score-badge ${parseFloat(record.score) >= 8 ? 'high' : parseFloat(record.score) >= 5 ? 'medium' : 'low'}`}>
                    {record.score}/10
                  </span>
                </td>
                <td>{record.understanding}</td>
                <td>{record.date}</td>
                <td>
                  <div className="rapport-action-buttons">
                    <button className="rapport-edit-btn" onClick={() => handleEditRapportRecord(record.id)}>Edit</button>
                    <button className="rapport-delete-btn" onClick={() => handleDeleteRapportRecord(record.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
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
    if (window.confirm("Are you sure you want to delete this report?")) {
      setValueCommunicationState(prev => ({
        ...prev,
        reports: prev.reports.filter(report => report.id !== reportId)
      }));
    }
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
      ],
      // Increment mbrsUpcoming if it's an MBR task
      mbrsUpcoming: taskName.toLowerCase().includes('data') || taskName.toLowerCase().includes('metrics') 
        ? prev.mbrsUpcoming + 1 
        : prev.mbrsUpcoming,
      // Increment weeklyReportsUpcoming if it's a weekly report task
      weeklyReportsUpcoming: taskName.toLowerCase().includes('feedback') || taskName.toLowerCase().includes('collect')
        ? prev.weeklyReportsUpcoming + 1
        : prev.weeklyReportsUpcoming
    }));
  };

  // New function to add a report
  const handleAddReport = () => {
    const reportType = window.prompt("Select report type (MBR or Weekly):", "MBR");
    if (!reportType) return;
    
    const fileName = reportType.toLowerCase() === "mbr" 
      ? `MBR_Report_${new Date().toISOString().split('T')[0]}.pdf`
      : `Weekly_Update_${new Date().getDate()}.pdf`;
      
    const notes = window.prompt("Enter report notes:", 
      reportType.toLowerCase() === "mbr" ? "Monthly business review" : "Weekly progress report");
    if (!notes) return;
    
    setValueCommunicationState(prev => ({
      ...prev,
      reports: [
        ...prev.reports,
        {
          id: prev.reports.length + 1,
          fileName,
          notes,
          date: new Date().toISOString().split('T')[0]
        }
      ]
    }));
  };

  // New function to download a report
  const handleDownloadReport = (report) => {
    // Create mock report content based on report type
    let content = '';
    
    if (report.fileName.toLowerCase().includes('communication') || report.fileName.toLowerCase().includes('mbr')) {
      // MBR report content
      content = `
# ${report.fileName.replace('.pdf', '')}
Date: ${report.date}
Type: Monthly Business Review

## Summary
${report.notes}

## Performance Metrics
- Patient Satisfaction: 87%
- Care Quality: 92%
- Response Time: 4.3 hours (average)

## Physician Engagement
- Dr. Sarah Johnson: High engagement
- Dr. Robert Chen: Medium engagement
- Dr. Maria Garcia: High engagement

## Action Items
1. Improve response time for urgent cases
2. Schedule follow-up meeting with key physicians
3. Review patient feedback for Q1

## Prepared by
Healthcare Analytics Team
`;
    } else {
      // Weekly report content
      content = `
# ${report.fileName.replace('.pdf', '')}
Date: ${report.date}
Type: Weekly Progress Report

## Summary
${report.notes}

## Weekly Metrics
- New Patients: 12
- Follow-up Appointments: 28
- Emergency Cases: 3

## Notable Events
- Staff meeting on Tuesday
- New equipment training on Thursday
- Patient satisfaction survey distributed

## Next Week Focus
- Complete patient outreach program
- Finalize schedule for next month
- Review inventory needs

## Prepared by
Operations Team
`;
    }
    
    // Create blob and trigger download
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = report.fileName.replace('.pdf', '.txt');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Fix for Rapport record editing
  const handleEditRapportRecord = (recordId) => {
    const record = rapportState.records.find(r => r.id === recordId);
    if (!record) return;
    
    setRapportState(prev => ({
      ...prev,
      editingRecord: { ...record }
    }));
    
    const name = window.prompt("Enter name:", record.name);
    if (!name) return;
    
    const designation = window.prompt("Enter designation:", record.designation);
    if (!designation) return;
    
    const score = window.prompt("Enter score (0-10):", record.score);
    if (!score || !validateRapportScore(score)) {
      alert("Score must be between 0 and 10");
      return;
    }
    
    const understanding = window.prompt("Enter understanding/feedback:", record.understanding);
    if (!understanding) return;
    
    setRapportState(prev => ({
      ...prev,
      records: prev.records.map(r => 
        r.id === recordId 
          ? { ...r, name, designation, score, understanding }
          : r
      ),
      notification: { message: "Record updated successfully", type: "success" }
    }));
    
    setTimeout(() => {
      setRapportState(prev => ({ ...prev, notification: null }));
    }, 3000);
  };
  
  // Fix for Rapport record deletion
  const handleDeleteRapportRecord = (recordId) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    
    setRapportState(prev => ({
      ...prev,
      records: prev.records.filter(r => r.id !== recordId),
      notification: { message: "Record deleted successfully", type: "success" }
    }));
    
    setTimeout(() => {
      setRapportState(prev => ({ ...prev, notification: null }));
    }, 3000);
  };
  
  // Fix for adding new Rapport record
  const handleAddRapportRecord = () => {
    const name = window.prompt("Enter name:");
    if (!name) return;
    
    const designation = window.prompt("Enter designation:");
    if (!designation) return;
    
    const score = window.prompt("Enter score (0-10):");
    if (!score || !validateRapportScore(score)) {
      alert("Score must be between 0 and 10");
      return;
    }
    
    const understanding = window.prompt("Enter understanding/feedback:");
    if (!understanding) return;
    
    setRapportState(prev => ({
      ...prev,
      records: [
        ...prev.records,
        {
          id: prev.records.length + 1,
          name,
          designation,
          score,
          understanding,
          date: new Date().toISOString().split('T')[0]
        }
      ],
      notification: { message: "Record added successfully", type: "success" }
    }));
    
    setTimeout(() => {
      setRapportState(prev => ({ ...prev, notification: null }));
    }, 3000);
  };

  const validateRapportScore = (score) => {
    const numScore = parseFloat(score);
    return !isNaN(numScore) && numScore >= 0 && numScore <= 10;
  };

  const handleRapportSearch = (e) => {
    setRapportState(prev => ({
      ...prev,
      searchTerm: e.target.value
    }));
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

  const showNotification = (message, type = 'success') => {
    setRapportState(prev => ({
      ...prev,
      notification: { message, type }
    }));
    setTimeout(() => {
      setRapportState(prev => ({ ...prev, notification: null }));
    }, 3000);
  };

  const calculateAverageScore = () => {
    const scores = rapportState.records.map(record => parseFloat(record.score));
    const average = scores.reduce((a, b) => a + b, 0) / scores.length;
    return isNaN(average) ? 0 : average.toFixed(1);
  };

  // Calculate physician onboarding success rate
  const calculatePhysicianOnboardingRate = () => {
    if (pgData.physicians.length === 0) return 0;
    const onboardedCount = pgData.physicians.filter(physician => physician.onboarded).length;
    return Math.round((onboardedCount / pgData.physicians.length) * 100);
  };

  // Calculate HHAH onboarding success rate
  const calculateHHAHOnboardingRate = () => {
    if (pgData.hhahs.length === 0) return 0;
    const onboardedCount = pgData.hhahs.filter(hhah => hhah.onboarded).length;
    return Math.round((onboardedCount / pgData.hhahs.length) * 100);
  };

  // Count reactive outcomes by status
  const countReactiveOutcomesByStatus = () => {
    const statusCounts = {
      Open: 0,
      Analysing: 0,
      Analysed: 0,
      Catalysed: 0
    };
    
    pgData.reactiveOutcomes.forEach(outcome => {
      if (statusCounts.hasOwnProperty(outcome.status)) {
        statusCounts[outcome.status]++;
      }
    });
    
    return statusCounts;
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

  const handleRapportSort = (key) => {
    setRapportState(prev => ({
      ...prev,
      sortConfig: {
        key,
        direction: prev.sortConfig.key === key && prev.sortConfig.direction === 'asc' ? 'desc' : 'asc'
      }
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
            <p className="summary-stat">Physician Onboarding: {calculatePhysicianOnboardingRate()}%</p>
            <p className="summary-stat">HHAH Onboarding: {calculateHHAHOnboardingRate()}%</p>
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
            <p className="summary-stat">
              Open: {countReactiveOutcomesByStatus().Open}
            </p>
            <p className="summary-stat">
              Analysing: {countReactiveOutcomesByStatus().Analysing}, 
              Analysed: {countReactiveOutcomesByStatus().Analysed}, 
              Catalysed: {countReactiveOutcomesByStatus().Catalysed}
            </p>
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
            <p className="summary-stat">179 Total Claims</p>
            <p className="summary-stat">180 Pending</p>
            <p className="summary-stat">$181 Total Value</p>
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
            <p className="summary-stat">MBRs: {valueCommunicationState.mbrsDone} Done, {valueCommunicationState.mbrsUpcoming} Upcoming</p>
            <p className="summary-stat">Weekly Reports: {valueCommunicationState.weeklyReportsSent} Sent, {valueCommunicationState.weeklyReportsUpcoming} Upcoming</p>
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

  const renderHeader = () => (
    <div className="pg-header">
      <div className="pg-title">
        <button 
          className="back-button" 
          onClick={handleBackNavigation}
        >
          <span className="back-arrow">←</span> 
          {fromPhysician 
            ? `Back to Dr. ${physicianContext?.name?.split(' ').pop() || 'Physician'}` 
            : 'Back'
          }
        </button>
        <h2>{pgData.name}</h2>
        <p className="pg-subtitle">
          {fromPhysician 
            ? `Viewing as associated with physician: ${physicianContext?.name}` 
            : 'Manage and monitor performance with Physician Group.'
          }
        </p>
      </div>
      <div className="pg-actions">
        <button className="action-button primary" onClick={() => {
          const format = window.prompt("Select export format (csv or pdf):", "csv");
          if (format === "csv" || format === "pdf") {
            handleExportRapport(format);
          }
        }}>
          <span className="icon">📊</span> Export Data
        </button>
        <button className="action-button" onClick={() => {
          alert("Settings functionality will be implemented in a future update.");
        }}>
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

  // Add functions to handle editing and deleting proactive outcomes
  const handleEditPhysician = (physician) => {
    // Find the full physician data from pgData.physicians
    const physicianData = pgData.physicians.find(p => p.id === physician.id) || physician;
    
    setEditingPhysician(physician);
    setNewPhysician({
      name: physician.name,
      npi: physician.npi,
      specialty: physician.specialty,
      status: physicianData.status || "Active",
      onboarded: physician.onboarded
    });
    setShowPhysicianForm(true);
  };

  const handleDeletePhysician = (id) => {
    if (window.confirm("Are you sure you want to delete this physician?")) {
      setPgData(prev => ({
        ...prev,
        physicians: prev.physicians.filter(physician => physician.id !== id),
        proactiveOutcomes: prev.proactiveOutcomes.filter(
          outcome => !(outcome.id === id && outcome.type === 'physician')
        )
      }));
    }
  };

  const handleEditHHA = (hhah) => {
    setEditingHHA(hhah);
    setNewHHA({
      name: hhah.name,
      location: hhah.location,
      contact: hhah.contact,
      onboarded: hhah.onboarded
    });
    setShowHHAForm(true);
  };

  const handleDeleteHHA = (id) => {
    if (window.confirm("Are you sure you want to delete this HHAH?")) {
      setPgData(prev => ({
        ...prev,
        hhahs: prev.hhahs.filter(hhah => hhah.id !== id)
      }));
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