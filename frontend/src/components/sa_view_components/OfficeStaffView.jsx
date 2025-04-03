import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import './OfficeStaffView.css';

const OfficeStaffView = () => {
  const { staffId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [staffData, setStaffData] = useState(null);
  const [analysis, setAnalysis] = useState('');

  useEffect(() => {
    // If we have state from navigation, use it
    if (location.state?.staff) {
      // Make sure we have all required fields
      const staff = location.state.staff;
      setStaffData({
        id: staff.id || staffId,
        name: staff.name || 'Unknown',
        staffId: staff.staffId || `SA${staff.id || staffId}`,
        npi: staff.npi || 'Not provided',
        contact: staff.contact || 'Not provided',
        position: staff.position || 'Not specified',
        designation: staff.designation || 'Not specified',
        helperAccountDetails: staff.helperAccountDetails || 'Not provided',
        department: staff.department || 'Not specified',
        status: staff.status || 'Active'
      });
    } else {
      // Fetch Staff data based on ID (replace with actual API call)
      // For now, use mock data
      const mockStaffData = {
        id: staffId || 'SA001',
        name: 'Staff Name A',
        staffId: `SA${staffId || '001'}`,
        npi: '1234567890',
        contact: '(124) 2076107',
        position: 'Medical Assistant',
        designation: 'Designation 1',
        helperAccountDetails: 'Helper Account Details 1',
        department: 'Administration',
        status: 'Active'
      };
      setStaffData(mockStaffData);
    }
  }, [staffId, location.state]);

  const handleBackClick = () => {
    navigate(-1);
  };

  const updateAnalysis = (e) => {
    setAnalysis(e.target.value);
  };

  const saveAnalysis = () => {
    alert('Analysis saved successfully!');
    // Here you would typically make an API call to save the analysis
  };

  return (
    <div className="office-staff-view-container">
      <div className="office-staff-header">
        <button className="back-button" onClick={handleBackClick}>
          <span className="back-arrow">←</span> Back
        </button>
        <h1>Office Staff Details</h1>
      </div>

      {staffData ? (
        <>
          <div className="office-staff-details-card">
            <h2 className="office-staff-title">Office Staff Listing</h2>
            <div className="office-staff-details-grid">
              <div className="detail-item">
                <div className="detail-label">ID:</div>
                <div className="detail-value">{staffData.staffId}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Name:</div>
                <div className="detail-value">{staffData.name}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Contact:</div>
                <div className="detail-value">{staffData.contact}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">NPI:</div>
                <div className="detail-value">{staffData.npi}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Staff:</div>
                <div className="detail-value">{staffData.designation}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Helper Account Details:</div>
                <div className="detail-value">{staffData.helperAccountDetails}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Position:</div>
                <div className="detail-value">{staffData.position}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Department:</div>
                <div className="detail-value">{staffData.department}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Status:</div>
                <div className="detail-value">
                  <span className={`status-badge ${staffData.status ? staffData.status.toLowerCase() : 'unknown'}`}>
                    {staffData.status || 'Unknown'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="office-staff-analysis-card">
            <h2 className="office-staff-subtitle">Office Staff Analysis</h2>
            <div className="analysis-content">
              <ul className="analysis-checklist">
                <li className="checklist-item">
                  <input type="checkbox" id="checkA" />
                  <label htmlFor="checkA">Check A</label>
                </li>
                <li className="checklist-item">
                  <input type="checkbox" id="checkB" />
                  <label htmlFor="checkB">Check B</label>
                </li>
                <li className="checklist-item">
                  <input type="checkbox" id="checkC" />
                  <label htmlFor="checkC">Check C</label>
                </li>
                <li className="checklist-item">
                  <input type="checkbox" id="checkD" />
                  <label htmlFor="checkD">Check D</label>
                </li>
                <li className="checklist-item">
                  <input type="checkbox" id="checkE" />
                  <label htmlFor="checkE">Check E</label>
                </li>
              </ul>
              <textarea 
                className="analysis-textarea"
                value={analysis}
                onChange={updateAnalysis}
                placeholder="Enter additional notes for this staff member..."
              />
              <button className="save-analysis-button" onClick={saveAnalysis}>
                Save Analysis
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="loading">Loading Office Staff data...</div>
      )}
    </div>
  );
};

export default OfficeStaffView; 