import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import './PhysicianView.css';

const PhysicianView = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [physician, setPhysician] = useState(null);
  const [pgData, setPgData] = useState(null);
  const [platformPGs, setPlatformPGs] = useState([]);
  const [nonPlatformPGs, setNonPlatformPGs] = useState([]);
  const [activeTab, setActiveTab] = useState('platform');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateNonPlatformForm, setShowCreateNonPlatformForm] = useState(false);
  const [newNonPlatformPG, setNewNonPlatformPG] = useState({
    name: '',
    patientsCount: 0,
    contactStatus: 'Pending'
  });
  
  // Sample platform PGs data
  const samplePlatformPGs = [
    { id: 1, name: "Well Life Family Medicine", patientsCount: 3, active: true },
    { id: 2, name: "Brownfield Family Physicians", patientsCount: 38, active: true },
    { id: 3, name: "Diverse Care Clinic", patientsCount: 10, active: true },
    { id: 4, name: "AppleMD Medical Services, PLLC", patientsCount: 7, active: true },
    { id: 5, name: "MD Primary Care", patientsCount: 2, active: true },
  ];
  
  // Sample non-platform PGs data
  const sampleNonPlatformPGs = [
    { id: 1, name: "THAMER ALMALKI", patientsCount: 0, contactStatus: "Pending" },
    { id: 2, name: "ANDRE P DESIRE, MD, PA", patientsCount: 20, contactStatus: "Contacted" },
    { id: 3, name: "MICHEAL ANYIRAH", patientsCount: 20, contactStatus: "Interested" },
    { id: 4, name: "JEFFREY ALVAREZ", patientsCount: 20, contactStatus: "Contacted" },
    { id: 5, name: "CRAIG BELCOURT", patientsCount: 20, contactStatus: "Not Interested" },
  ];

  useEffect(() => {
    // Check if we have physician data in location.state
    if (location.state?.physician) {
      setPhysician(location.state.physician);
      setPgData(location.state.pgData);
      
      // For this demo, just use our sample data
      setPlatformPGs(samplePlatformPGs);
      setNonPlatformPGs(sampleNonPlatformPGs);
    } else {
      // If no state provided, use the id to look up physician data
      // This would be an API call in a real application
      
      // For this demo, just create mock data
      const mockPhysician = {
        id: parseInt(id),
        name: `Dr. Hisel, Christopher G.`,
        npi: "1396760419",
        specialty: "Family Medicine",
        status: "Active",
        onboarded: true,
        contact: "806 637 0344"
      };
      
      setPhysician(mockPhysician);
      setPlatformPGs(samplePlatformPGs);
      setNonPlatformPGs(sampleNonPlatformPGs);
    }
  }, [id, location]);

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchTerm('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewNonPlatformPG(prev => ({
      ...prev,
      [name]: name === 'patientsCount' ? parseInt(value) || 0 : value
    }));
  };

  const handleAddNonPlatformPG = () => {
    if (!newNonPlatformPG.name) {
      alert('Please enter a PG name');
      return;
    }

    const newPG = {
      id: nonPlatformPGs.length + 1,
      ...newNonPlatformPG
    };

    setNonPlatformPGs(prev => [...prev, newPG]);
    setNewNonPlatformPG({
      name: '',
      patientsCount: 0,
      contactStatus: 'Pending'
    });
    setShowCreateNonPlatformForm(false);
  };

  const updatePGStatus = (pgId, newStatus) => {
    if (activeTab === 'platform') {
      setPlatformPGs(prev => 
        prev.map(pg => 
          pg.id === pgId ? { ...pg, active: newStatus === 'active' } : pg
        )
      );
    } else {
      setNonPlatformPGs(prev => 
        prev.map(pg => 
          pg.id === pgId ? { ...pg, contactStatus: newStatus } : pg
        )
      );
    }
  };

  const getFilteredPGs = () => {
    const pgs = activeTab === 'platform' ? platformPGs : nonPlatformPGs;
    
    if (!searchTerm.trim()) {
      return pgs;
    }
    
    return pgs.filter(pg => 
      pg.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const handleViewPG = (pg) => {
    navigate(`/pg-view/${pg.id}`, { 
      state: { 
        pgName: pg.name,
        fromPhysician: true,
        physicianId: physician.id,
        physicianName: physician.name
      } 
    });
  };

  const renderForm = () => {
    if (!showCreateNonPlatformForm) return null;
    
    return (
      <div className="add-pg-form">
        <h3>Add Non-Platform PG Association</h3>
        
        <div className="form-group">
          <label>PG Name:</label>
          <input 
            type="text" 
            name="name" 
            value={newNonPlatformPG.name}
            onChange={handleInputChange}
            placeholder="Enter PG name"
          />
        </div>
        
        <div className="form-group">
          <label>Patients Count:</label>
          <input 
            type="number" 
            name="patientsCount" 
            value={newNonPlatformPG.patientsCount}
            onChange={handleInputChange}
            placeholder="0"
            min="0"
          />
        </div>
        
        <div className="form-group">
          <label>Contact Status:</label>
          <select 
            name="contactStatus" 
            value={newNonPlatformPG.contactStatus}
            onChange={handleInputChange}
          >
            <option value="Pending">Pending</option>
            <option value="Contacted">Contacted</option>
            <option value="Interested">Interested</option>
            <option value="Not Interested">Not Interested</option>
          </select>
        </div>
        
        <div className="form-actions">
          <button 
            className="submit-button"
            onClick={handleAddNonPlatformPG}
          >
            Add
          </button>
          <button 
            className="cancel-button"
            onClick={() => setShowCreateNonPlatformForm(false)}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  };

  if (!physician) {
    return <div className="loading">Loading physician data...</div>;
  }

  return (
    <div className="physician-view-container">
      <div className="physician-header">
        <button className="back-button" onClick={handleGoBack}>
          <span className="back-arrow">←</span> Back to Staff List
        </button>
        <h1>Physician Details</h1>
      </div>

      <div className="physician-details-card">
        <div className="physician-details-grid">
          <div className="detail-item">
            <span className="detail-label">Physician ID:</span>
            <span className="detail-value">PHY{id.toString().padStart(3, '0')}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Name:</span>
            <span className="detail-value">{physician.name}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">NPI Number:</span>
            <span className="detail-value">{physician.npi}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Contact:</span>
            <span className="detail-value">{physician.contact || "No contact information"}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Specialty:</span>
            <span className="detail-value">{physician.specialty || "Not specified"}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Status:</span>
            <span className="detail-value">
              <span className={`status-badge ${physician.status?.toLowerCase() || 'active'}`}>
                {physician.status || "Active"}
              </span>
            </span>
          </div>
        </div>
      </div>

      <div className="pg-listings-container">
        <div className="pg-listings-header">
          <h2>Practice Group Associations</h2>
          <p className="section-description">Manage physician's practice group relationships</p>
        </div>
        
        <div className="pg-tabs">
          <button 
            className={`pg-tab ${activeTab === 'platform' ? 'active' : ''}`}
            onClick={() => handleTabChange('platform')}
          >
            Platform PGs
          </button>
          <button 
            className={`pg-tab ${activeTab === 'non-platform' ? 'active' : ''}`}
            onClick={() => handleTabChange('non-platform')}
          >
            Non-Platform PGs
          </button>
        </div>
        
        <div className="pg-actions-bar">
          <div className="pg-search">
            <input
              type="text"
              placeholder={`Search ${activeTab === 'platform' ? 'platform' : 'non-platform'} PGs...`}
              value={searchTerm}
              onChange={handleSearch}
              className="pg-search-input"
            />
          </div>
          
          {activeTab === 'non-platform' && (
            <button 
              className="add-pg-button"
              onClick={() => setShowCreateNonPlatformForm(!showCreateNonPlatformForm)}
            >
              <span className="icon">+</span> Add Non-Platform PG
            </button>
          )}
        </div>
        
        {activeTab === 'non-platform' && renderForm()}
        
        <div className="pg-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>PG Name</th>
                <th>Patients</th>
                {activeTab === 'platform' ? (
                  <th>Status</th>
                ) : (
                  <th>Contact Status</th>
                )}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {getFilteredPGs().map(pg => (
                <tr key={pg.id}>
                  <td>{pg.name}</td>
                  <td>{pg.patientsCount}</td>
                  <td>
                    {activeTab === 'platform' ? (
                      <span className={`status-badge ${pg.active ? 'active' : 'inactive'}`}>
                        {pg.active ? 'Active' : 'Inactive'}
                      </span>
                    ) : (
                      <span className={`status-badge ${pg.contactStatus.toLowerCase().replace(/\s+/g, '-')}`}>
                        {pg.contactStatus}
                      </span>
                    )}
                  </td>
                  <td>
                    <div className="pg-action-buttons">
                      {activeTab === 'platform' ? (
                        <>
                          <button 
                            className={`status-action-button ${pg.active ? 'deactivate' : 'activate'}`}
                            onClick={() => updatePGStatus(pg.id, pg.active ? 'inactive' : 'active')}
                          >
                            {pg.active ? 'Deactivate' : 'Activate'}
                          </button>
                          <button 
                            className="view-details-button"
                            onClick={() => handleViewPG(pg)}
                          >
                            View PG
                          </button>
                        </>
                      ) : (
                        <>
                          <select 
                            className="status-select"
                            value={pg.contactStatus}
                            onChange={(e) => updatePGStatus(pg.id, e.target.value)}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Contacted">Contacted</option>
                            <option value="Interested">Interested</option>
                            <option value="Not Interested">Not Interested</option>
                          </select>
                          <button 
                            className="delete-button"
                            onClick={() => {
                              if (window.confirm(`Remove ${pg.name} from physician's associations?`)) {
                                setNonPlatformPGs(prev => prev.filter(p => p.id !== pg.id));
                              }
                            }}
                          >
                            Remove
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {getFilteredPGs().length === 0 && (
                <tr>
                  <td colSpan="4" className="no-results">
                    No practice groups found. {activeTab === 'non-platform' && 'Add a non-platform PG using the button above.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="actions-container">
        <button 
          className="action-button primary"
          onClick={() => {
            const email = "mailto:" + (physician.email || "contact@example.com") + "?subject=Regarding Practice Group Association";
            window.open(email);
          }}
        >
          Contact Physician
        </button>
        <button className="action-button secondary" onClick={handleGoBack}>
          Return to Staff List
        </button>
      </div>
    </div>
  );
};

export default PhysicianView; 