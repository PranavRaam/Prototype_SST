import React, { useState } from 'react';
import './reactiveoc.css';

const ReactiveOC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newOutcome, setNewOutcome] = useState({
    number: '',
    date: '',
    status: 'open',
    description: '',
    analysis: '',
    nextSteps: '',
    timestamp: '',
    receivedOn: '',
    user: '',
    hahhMap: '',
    poc: '',
    contactDetails: '',
    actionTaken: '',
    interactionLog: ''
  });
  const [editingOutcome, setEditingOutcome] = useState(null);

  // Initial data
  const initialData = [
    {
      id: 1,
      number: 'RO-001',
      date: '03/27/2024',
      status: 'analysing',
      description: 'Unable to upload claim documents',
      analysis: 'Investigating file upload module for errors',
      nextSteps: 'Review server logs and validate file size limits',
      timestamp: '09:30:45 AM',
      receivedOn: '01/06/2025',
      user: 'User 2',
      hahhMap: 'WISE COUNTY HOME HEALTH',
      poc: 'POC1',
      contactDetails: '9876543210',
      actionTaken: 'Action Taken status',
      interactionLog: 'Communication log Example'
    },
    {
      id: 2,
      number: 'RO-002',
      date: '03/26/2024',
      status: 'analysed',
      description: 'Incorrect claim status displayed',
      analysis: 'Identified caching issue in status retrieval API',
      nextSteps: 'Fix cache invalidation logic',
      timestamp: '10:15:22 AM',
      receivedOn: '01/06/2025',
      user: 'User 2',
      hahhMap: 'WISE COUNTY HOME HEALTH',
      poc: 'POC1',
      contactDetails: '9876543210',
      actionTaken: 'Action Taken status',
      interactionLog: 'Communication log Example'
    },
    {
      id: 3,
      number: 'RO-003',
      date: '03/25/2024',
      status: 'catalysed',
      description: 'Delayed processing of insurance claims',
      analysis: 'Detected bottleneck in claim validation service',
      nextSteps: 'Optimize validation logic and add parallel processing',
      timestamp: '11:45:30 AM',
      receivedOn: '01/06/2025',
      user: 'User 2',
      hahhMap: 'WISE COUNTY HOME HEALTH',
      poc: 'POC1',
      contactDetails: '9876543210',
      actionTaken: 'Action Taken status',
      interactionLog: 'Communication log Example'
    },
    {
      id: 4,
      number: 'RO-004',
      date: '03/24/2024',
      status: 'analysing',
      description: 'Billing system not generating invoices',
      analysis: 'Error in invoice generation job scheduler',
      nextSteps: 'Fix cron job and add retry mechanism',
      timestamp: '02:20:15 PM',
      receivedOn: '01/06/2025',
      user: 'User 2',
      hahhMap: 'WISE COUNTY HOME HEALTH',
      poc: 'POC1',
      contactDetails: '9876543210',
      actionTaken: 'Action Taken status',
      interactionLog: 'Communication log Example'
    },
    {
      id: 5,
      number: 'RO-005',
      date: '03/23/2024',
      status: 'catalysed',
      description: 'Duplicate claims being submitted',
      analysis: 'Duplicate detection logic malfunctioning',
      nextSteps: 'Refactor deduplication algorithm',
      timestamp: '03:45:00 PM',
      receivedOn: '01/06/2025',
      user: 'User 2',
      hahhMap: 'WISE COUNTY HOME HEALTH',
      poc: 'POC1',
      contactDetails: '9876543210',
      actionTaken: 'Action Taken status',
      interactionLog: 'Communication log Example'
    },
    {
      id: 6,
      number: 'RO-006',
      date: '03/22/2024',
      status: 'analysing',
      description: 'Claim rejection due to missing documents',
      analysis: 'Identified incomplete document upload process',
      nextSteps: 'Enhance validation checks before submission',
      timestamp: '09:15:30 AM',
      receivedOn: '01/05/2025',
      user: 'User 3',
      hahhMap: 'TRINITY MEDICAL CENTER',
      poc: 'POC2',
      contactDetails: '9876543211',
      actionTaken: 'Pending review',
      interactionLog: 'Communication log Example 2'
    },
    {
      id: 7,
      number: 'RO-007',
      date: '03/21/2024',
      status: 'catalysed',
      description: 'Billing discrepancy on patient invoices',
      analysis: 'Incorrect tax calculation in billing system',
      nextSteps: 'Fix tax calculation logic',
      timestamp: '10:30:45 AM',
      receivedOn: '01/04/2025',
      user: 'User 4',
      hahhMap: 'RIVERDALE HOSPITAL',
      poc: 'POC3',
      contactDetails: '9876543212',
      actionTaken: 'Correction initiated',
      interactionLog: 'Invoice correction process started'
    },
    {
      id: 8,
      number: 'RO-008',
      date: '03/20/2024',
      status: 'analysed',
      description: 'Failed claim submission attempts',
      analysis: 'Timeout issue with external insurance provider API',
      nextSteps: 'Increase timeout duration and retry logic',
      timestamp: '11:20:15 AM',
      receivedOn: '01/03/2025',
      user: 'User 5',
      hahhMap: 'GREEN VALLEY CLINIC',
      poc: 'POC4',
      contactDetails: '9876543213',
      actionTaken: 'API configuration updated',
      interactionLog: 'Communication with insurance provider'
    },
    {
      id: 9,
      number: 'RO-009',
      date: '03/19/2024',
      status: 'open',
      description: 'Incorrect patient information in claims',
      analysis: 'Data mapping issue during export',
      nextSteps: 'Refactor data transformation rules',
      timestamp: '02:45:30 PM',
      receivedOn: '01/02/2025',
      user: 'User 6',
      hahhMap: 'OAKWOOD HEALTH SERVICES',
      poc: 'POC5',
      contactDetails: '9876543214',
      actionTaken: 'Pending data correction',
      interactionLog: 'Communication log Example 3'
    },
    {
      id: 10,
      number: 'RO-010',
      date: '03/18/2024',
      status: 'catalysed',
      description: 'Insurance claims stuck in processing queue',
      analysis: 'Queue overflow due to high volume of requests',
      nextSteps: 'Increase queue capacity and optimize processing',
      timestamp: '03:30:00 PM',
      receivedOn: '01/01/2025',
      user: 'User 7',
      hahhMap: 'SUNRISE MEDICAL CENTER',
      poc: 'POC6',
      contactDetails: '9876543215',
      actionTaken: 'Queue optimization in progress',
      interactionLog: 'Communication log Example 4'
    },
    {
      id: 11,
      number: 'RO-011',
      date: '03/17/2024',
      status: 'analysing',
      description: 'System crash during claim export',
      analysis: 'Memory overflow issue detected',
      nextSteps: 'Implement memory management improvements',
      timestamp: '09:45:15 AM',
      receivedOn: '12/31/2024',
      user: 'User 8',
      hahhMap: 'LAKEVIEW HEALTH CENTER',
      poc: 'POC7',
      contactDetails: '9876543216',
      actionTaken: 'Crash logs under review',
      interactionLog: 'Technical team investigating'
    },
    {
      id: 12,
      number: 'RO-012',
      date: '03/16/2024',
      status: 'analysed',
      description: 'Invalid claim rejection by insurer',
      analysis: 'Incorrect validation rules applied',
      nextSteps: 'Fix validation conditions',
      timestamp: '10:15:45 AM',
      receivedOn: '12/30/2024',
      user: 'User 9',
      hahhMap: 'RIVERWOOD CLINIC',
      poc: 'POC8',
      contactDetails: '9876543217',
      actionTaken: 'Validation logic corrected',
      interactionLog: 'Communication with insurer'
    },
    {
      id: 13,
      number: 'RO-013',
      date: '03/15/2024',
      status: 'open',
      description: 'Delayed reimbursement from insurance',
      analysis: 'Slow processing at third-party gateway',
      nextSteps: 'Optimize third-party integration',
      timestamp: '11:30:30 AM',
      receivedOn: '12/29/2024',
      user: 'User 10',
      hahhMap: 'WESTSIDE MEDICAL',
      poc: 'POC9',
      contactDetails: '9876543218',
      actionTaken: 'Pending third-party resolution',
      interactionLog: 'Follow-up with gateway provider'
    },
    {
      id: 14,
      number: 'RO-014',
      date: '03/14/2024',
      status: 'catalysed',
      description: 'Missing claims in report generation',
      analysis: 'Report filtering logic error',
      nextSteps: 'Correct filtering logic',
      timestamp: '02:15:00 PM',
      receivedOn: '12/28/2024',
      user: 'User 11',
      hahhMap: 'PINE HILL CLINIC',
      poc: 'POC10',
      contactDetails: '9876543219',
      actionTaken: 'Report logic fixed',
      interactionLog: 'Verification in progress'
    },
    {
      id: 15,
      number: 'RO-015',
      date: '03/13/2024',
      status: 'analysed',
      description: 'Incorrect insurance provider details in claims',
      analysis: 'Data inconsistency in provider mapping',
      nextSteps: 'Re-map provider details',
      timestamp: '03:45:15 PM',
      receivedOn: '12/27/2024',
      user: 'User 12',
      hahhMap: 'MAPLEWOOD HEALTHCARE',
      poc: 'POC11',
      contactDetails: '9876543220',
      actionTaken: 'Data mapping corrected',
      interactionLog: 'Communication with data team'
    }
  ];
  
  // State to manage data
  const [data, setData] = useState(initialData);

  const handleRowClick = (id) => {
    const selected = data.find(item => item.id === id);
    setSelectedItem(selected);
  };

  const handleBackClick = () => {
    setSelectedItem(null);
  };

  const handleStatusChange = (id, newStatus) => {
    setData(prevData => 
      prevData.map(item => 
        item.id === id ? { ...item, status: newStatus } : item
      )
    );
  };

  // Handle edit reactive outcome
  const handleEditOutcome = (e, id) => {
    e.stopPropagation(); // Prevent row click event
    const outcomeToEdit = data.find(item => item.id === id);
    setEditingOutcome(outcomeToEdit);
    setNewOutcome(outcomeToEdit);
    setShowAddForm(true);
  };

  // Handle delete reactive outcome
  const handleDeleteOutcome = (e, id) => {
    e.stopPropagation(); // Prevent row click event
    if (window.confirm("Are you sure you want to delete this reactive outcome?")) {
      setData(prevData => prevData.filter(item => item.id !== id));
    }
  };

  // Filter the data based on search term and status
  const filteredData = data.filter(item => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      item.number.toLowerCase().includes(searchLower) ||
      item.description.toLowerCase().includes(searchLower) ||
      item.analysis.toLowerCase().includes(searchLower) ||
      item.nextSteps.toLowerCase().includes(searchLower) ||
      item.date.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Handle adding a new reactive outcome
  const handleAddOutcome = () => {
    // Validate required fields
    if (!newOutcome.number || !newOutcome.description) {
      alert("Please fill in all required fields");
      return;
    }

    if (editingOutcome) {
      // Update existing outcome
      setData(prevData => 
        prevData.map(item => 
          item.id === editingOutcome.id ? { ...item, ...newOutcome } : item
        )
      );
      setEditingOutcome(null);
    } else {
      // Add new outcome with generated ID
      const newId = data.length > 0 
        ? Math.max(...data.map(item => item.id)) + 1 
        : 1;
      
      const currentDate = new Date();
      const formattedDate = `${currentDate.getMonth()+1}/${currentDate.getDate()}/${currentDate.getFullYear()}`;
      const formattedTime = currentDate.toLocaleTimeString('en-US', { hour12: true });

      const outcomeWithDefaults = {
        ...newOutcome,
        id: newId,
        date: newOutcome.date || formattedDate,
        timestamp: newOutcome.timestamp || formattedTime
      };

      setData([...data, outcomeWithDefaults]);
    }
    
    // Reset form and hide it
    setNewOutcome({
      number: '',
      date: '',
      status: 'open',
      description: '',
      analysis: '',
      nextSteps: '',
      timestamp: '',
      receivedOn: '',
      user: '',
      hahhMap: '',
      poc: '',
      contactDetails: '',
      actionTaken: '',
      interactionLog: ''
    });
    setShowAddForm(false);
  };

  // Handle input changes for the form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewOutcome(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const renderDetailsView = () => {
    if (!selectedItem) return null;

    return (
      <div className="ro-details-container">
        <button className="ro-back-button" onClick={handleBackClick}>
          ← Back to List
        </button>
        <div className="ro-details-content">
          <div className="ro-details-grid">
            <div className="ro-detail-item">
              <span className="ro-detail-label">No:</span>
              <span className="ro-detail-value">#{selectedItem.number}</span>
            </div>
            <div className="ro-detail-item">
              <span className="ro-detail-label">Timestamp:</span>
              <span className="ro-detail-value">{selectedItem.timestamp}</span>
            </div>
            <div className="ro-detail-item">
              <span className="ro-detail-label">Received On:</span>
              <span className="ro-detail-value">{selectedItem.receivedOn}</span>
            </div>
            <div className="ro-detail-item">
              <span className="ro-detail-label">User:</span>
              <span className="ro-detail-value">{selectedItem.user}</span>
            </div>
            <div className="ro-detail-item">
              <span className="ro-detail-label hhah-label">HHAH Map:</span>
              <span className="ro-detail-value">{selectedItem.hahhMap}</span>
            </div>
            <div className="ro-detail-item">
              <span className="ro-detail-label">Status:</span>
              <span className="ro-detail-value">{selectedItem.status}</span>
            </div>
            <div className="ro-detail-item">
              <span className="ro-detail-label">Issue Description:</span>
              <span className="ro-detail-value">{selectedItem.description}</span>
            </div>
            <div className="ro-detail-item">
              <span className="ro-detail-label">POC:</span>
              <span className="ro-detail-value">{selectedItem.poc}</span>
            </div>
            <div className="ro-detail-item">
              <span className="ro-detail-label">Contact Details:</span>
              <span className="ro-detail-value">{selectedItem.contactDetails}</span>
            </div>
            <div className="ro-detail-item">
              <span className="ro-detail-label">Action Taken:</span>
              <span className="ro-detail-value">{selectedItem.actionTaken}</span>
            </div>
            <div className="ro-detail-item">
              <span className="ro-detail-label interaction-label">Interaction Log:</span>
              <span className="ro-detail-value interaction-value">{selectedItem.interactionLog}</span>
            </div>
            <div className="ro-detail-item">
              <span className="ro-detail-label">Analysis:</span>
              <span className="ro-detail-value">{selectedItem.analysis}</span>
            </div>
            <div className="ro-detail-item">
              <span className="ro-detail-label">Next Steps:</span>
              <span className="ro-detail-value">{selectedItem.nextSteps}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="ro-container">
      {!selectedItem ? (
        <>
          <div className="ro-header">
            <h1>Reactive Outcome</h1>
          </div>
          
          <div className="ro-search-filters">
            <div className="ro-search-bar">
              <input
                type="text"
                placeholder="Search by description, analysis, or next steps..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="ro-search-input"
              />
            </div>
            <div className="ro-filters">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="ro-status-select"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="analysing">Analysing</option>
                <option value="analysed">Analysed</option>
                <option value="catalysed">Catalysed</option>
              </select>
              <button 
                className="action-button"
                onClick={() => setShowAddForm(!showAddForm)}
              >
                <span className="icon">+</span> Add Reactive Outcome
              </button>
            </div>
          </div>

          {showAddForm && (
            <div className="form-container">
              <h4>{editingOutcome ? 'Edit Reactive Outcome' : 'Add New Reactive Outcome'}</h4>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="number">Number*</label>
                  <input 
                    type="text" 
                    id="number" 
                    name="number"
                    value={newOutcome.number}
                    onChange={handleInputChange}
                    placeholder="RO-XXX"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="description">Description*</label>
                  <input 
                    type="text" 
                    id="description" 
                    name="description"
                    value={newOutcome.description}
                    onChange={handleInputChange}
                    placeholder="Enter issue description"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="status">Status</label>
                  <select 
                    id="status" 
                    name="status"
                    value={newOutcome.status}
                    onChange={handleInputChange}
                  >
                    <option value="open">Open</option>
                    <option value="analysing">Analysing</option>
                    <option value="analysed">Analysed</option>
                    <option value="catalysed">Catalysed</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="analysis">Analysis</label>
                  <input 
                    type="text" 
                    id="analysis" 
                    name="analysis"
                    value={newOutcome.analysis}
                    onChange={handleInputChange}
                    placeholder="Enter analysis details"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="nextSteps">Next Steps</label>
                  <input 
                    type="text" 
                    id="nextSteps" 
                    name="nextSteps"
                    value={newOutcome.nextSteps}
                    onChange={handleInputChange}
                    placeholder="Enter next steps"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="user">User</label>
                  <input 
                    type="text" 
                    id="user" 
                    name="user"
                    value={newOutcome.user}
                    onChange={handleInputChange}
                    placeholder="Enter user name"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="hahhMap">HHAH Map</label>
                  <input 
                    type="text" 
                    id="hahhMap" 
                    name="hahhMap"
                    value={newOutcome.hahhMap}
                    onChange={handleInputChange}
                    placeholder="Enter HHAH name"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="poc">POC</label>
                  <input 
                    type="text" 
                    id="poc" 
                    name="poc"
                    value={newOutcome.poc}
                    onChange={handleInputChange}
                    placeholder="Enter POC"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="contactDetails">Contact Details</label>
                  <input 
                    type="text" 
                    id="contactDetails" 
                    name="contactDetails"
                    value={newOutcome.contactDetails}
                    onChange={handleInputChange}
                    placeholder="Enter contact details"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="actionTaken">Action Taken</label>
                  <input 
                    type="text" 
                    id="actionTaken" 
                    name="actionTaken"
                    value={newOutcome.actionTaken}
                    onChange={handleInputChange}
                    placeholder="Enter actions taken"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="interactionLog">Interaction Log</label>
                  <textarea
                    id="interactionLog" 
                    name="interactionLog"
                    value={newOutcome.interactionLog}
                    onChange={handleInputChange}
                    placeholder="Enter interaction details"
                    rows="3"
                  ></textarea>
                </div>
              </div>
              <div className="form-actions">
                <button onClick={handleAddOutcome} className="submit-button">
                  {editingOutcome ? 'Update Outcome' : 'Add Outcome'}
                </button>
                <button onClick={() => {
                  setShowAddForm(false);
                  setEditingOutcome(null);
                  setNewOutcome({
                    number: '',
                    date: '',
                    status: 'open',
                    description: '',
                    analysis: '',
                    nextSteps: '',
                    timestamp: '',
                    receivedOn: '',
                    user: '',
                    hahhMap: '',
                    poc: '',
                    contactDetails: '',
                    actionTaken: '',
                    interactionLog: ''
                  });
                }} className="cancel-button">Cancel</button>
              </div>
            </div>
          )}

          <div className="ro-table-container">
            <table className="ro-table">
              <thead>
                <tr>
                  <th>Reactive Outcome No</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Description</th>
                  <th>Analysis</th>
                  <th>Next Steps</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item) => (
                  <tr key={item.id} onClick={() => handleRowClick(item.id)}>
                    <td>{item.number}</td>
                    <td>{item.date}</td>
                    <td>
                      <span className={`status-badge ${item.status}`}>
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </span>
                    </td>
                    <td>{item.description}</td>
                    <td>{item.analysis}</td>
                    <td>{item.nextSteps}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div className="action-buttons">
                        <button 
                          className="action-icon edit" 
                          onClick={(e) => handleEditOutcome(e, item.id)}
                        >
                          Edit
                        </button>
                        <button 
                          className="action-icon delete" 
                          onClick={(e) => handleDeleteOutcome(e, item.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        renderDetailsView()
      )}
    </div>
  );
};

export default ReactiveOC; 