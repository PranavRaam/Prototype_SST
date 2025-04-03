import { useState, useEffect } from 'react';
import './StaffList.css';
import { useNavigate } from 'react-router-dom';

const StaffList = ({ pgData, setPgData }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('physicians');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStaffMember, setNewStaffMember] = useState({
    name: '',
    npi: '',
    specialty: '',
    status: 'Active',
    position: '',
    department: ''
  });

  // Sample data - use pgData if provided, otherwise use default data
  const [staffData, setStaffData] = useState({
    physicians: [
      { id: 1, name: 'Dr. John Smith', npi: '1234567890', specialty: 'Cardiologist' },
      { id: 2, name: 'Dr. Sarah Johnson', npi: '2345678901', specialty: 'Pediatrician' },
      { id: 3, name: 'Dr. Michael Brown', npi: '3456789012', specialty: 'Neurologist' },
      { id: 4, name: 'Dr. Emily Davis', npi: '4567890123', specialty: 'Orthopedic Surgeon' },
    ],
    npp: [
      { id: 1, name: 'Nurse Practitioner Amy Wilson', npi: '5678901234', specialty: 'Family Nurse Practitioner' },
      { id: 2, name: 'PA Robert Taylor', npi: '6789012345', specialty: 'Physician Assistant' },
      { id: 3, name: 'NP Jennifer Lee', npi: '7890123456', specialty: 'Pediatric Nurse Practitioner' },
    ],
    officeStaff: [
      { id: 1, name: 'Mary Johnson', position: 'Medical Receptionist', department: 'Administration' },
      { id: 2, name: 'David Wilson', position: 'Medical Technician', department: 'Clinical' },
      { id: 3, name: 'Lisa Anderson', position: 'Administrative Assistant', department: 'Administration' },
    ]
  });

  useEffect(() => {
    // Log staff data to debug
    console.log("Staff Data:", staffData);
    console.log("NPP Data:", staffData.npp);
  }, [staffData]);

  // Sync with pgData if it's provided
  useEffect(() => {
    if (pgData) {
      console.log("pgData NPP:", pgData.npp);
      setStaffData({
        physicians: pgData.physicians || [],
        npp: pgData.npp || [],
        officeStaff: pgData.staff || [] // Map 'staff' to 'officeStaff'
      });
    }
  }, [pgData]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewStaffMember(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddStaffMember = () => {
    if (activeTab === 'physicians' && (!newStaffMember.name || !newStaffMember.npi || !newStaffMember.specialty)) {
      alert('Please fill in all required fields for physician');
      return;
    }
    
    if (activeTab === 'npp' && (!newStaffMember.name || !newStaffMember.npi || !newStaffMember.specialty)) {
      alert('Please fill in all required fields for NPP');
      return;
    }
    
    if (activeTab === 'officeStaff' && (!newStaffMember.name || !newStaffMember.position || !newStaffMember.department)) {
      alert('Please fill in all required fields for Office Staff');
      return;
    }

    const newId = staffData[activeTab].length > 0 
      ? Math.max(...staffData[activeTab].map(item => item.id)) + 1 
      : 1;

    const newMember = { id: newId, ...newStaffMember };
    
    // Update local state
    const updatedStaffData = {
      ...staffData,
      [activeTab]: [...staffData[activeTab], newMember]
    };
    
    setStaffData(updatedStaffData);
    
    // If adding a physician, also add to proactive outcomes and to pgData if available
    if (activeTab === 'physicians' && setPgData) {
      setPgData(prev => ({
        ...prev,
        physicians: [...(prev.physicians || []), {
          id: newId,
          name: newStaffMember.name,
          npi: newStaffMember.npi,
          specialty: newStaffMember.specialty,
          status: "Active",
          onboarded: true
        }]
      }));
    } else if (activeTab === 'npp' && setPgData) {
      setPgData(prev => ({
        ...prev,
        npp: [...(prev.npp || []), {
          id: newId,
          name: newStaffMember.name,
          npi: newStaffMember.npi,
          specialty: newStaffMember.specialty,
          position: newStaffMember.specialty
        }]
      }));
    } else if (activeTab === 'officeStaff' && setPgData) {
      setPgData(prev => ({
        ...prev,
        staff: [...(prev.staff || []), { // Keep as 'staff' for pgData compatibility
          id: newId,
          name: newStaffMember.name,
          position: newStaffMember.position,
          department: newStaffMember.department
        }]
      }));
    }
    
    // Reset form
    setNewStaffMember({
      name: '',
      npi: '',
      specialty: '',
      status: 'Active',
      position: '',
      department: ''
    });
    setShowAddForm(false);
  };

  const handleDeleteStaffMember = (id) => {
    if (window.confirm("Are you sure you want to delete this staff member?")) {
      // Update local state
      setStaffData(prev => ({
        ...prev,
        [activeTab]: prev[activeTab].filter(item => item.id !== id)
      }));
      
      // Update pgData if available
      if (setPgData) {
        const pgDataField = activeTab === 'officeStaff' ? 'staff' : activeTab;
        setPgData(prev => ({
          ...prev,
          [pgDataField]: (prev[pgDataField] || []).filter(item => item.id !== id),
          // If deleting a physician, also remove from proactiveOutcomes
          ...(activeTab === 'physicians' ? {
            proactiveOutcomes: (prev.proactiveOutcomes || []).filter(
              item => !(item.id === id && item.type === 'physician')
            )
          } : {})
        }));
      }
    }
  };

  const getFilteredStaff = () => {
    if (!staffData[activeTab]) return [];
    
    return staffData[activeTab].filter(staff => {
      if (activeTab === 'physicians' || activeTab === 'npp') {
        return (
          staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (staff.npi && staff.npi.includes(searchTerm)) ||
          (staff.specialty && staff.specialty.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      } else {
        return (
          staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (staff.position && staff.position.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (staff.department && staff.department.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }
    });
  };

  // Navigate to physician detail page
  const handlePhysicianClick = (physician) => {
    navigate(`/physician/${physician.id}`, { state: { physician, pgData } });
  };

  // Navigate to NPP detail page
  const handleNPPClick = (npp) => {
    navigate(`/npp/${npp.id}`, { state: { npp, pgData } });
  };

  // Navigate to Office Staff detail page
  const handleOfficeStaffClick = (staff) => {
    navigate(`/office-staff/${staff.id}`, { state: { staff, pgData } });
  };

  const renderAddForm = () => {
    if (!showAddForm) return null;
    
    return (
      <div className="add-staff-form">
        <h3>Add New {activeTab === 'physicians' ? 'Physician' : activeTab === 'npp' ? 'NPP' : 'Office Staff Member'}</h3>
        
        <div className="form-group">
          <label>Name:</label>
          <input 
            type="text" 
            name="name" 
            value={newStaffMember.name}
            onChange={handleInputChange}
            placeholder="Enter full name"
          />
        </div>
        
        {(activeTab === 'physicians' || activeTab === 'npp') && (
          <>
            <div className="form-group">
              <label>NPI Number:</label>
              <input 
                type="text" 
                name="npi" 
                value={newStaffMember.npi}
                onChange={handleInputChange}
                placeholder="Enter NPI number"
              />
            </div>
            <div className="form-group">
              <label>Specialty:</label>
              <input 
                type="text" 
                name="specialty" 
                value={newStaffMember.specialty}
                onChange={handleInputChange}
                placeholder="Enter specialty"
              />
            </div>
            {activeTab === 'physicians' && (
              <div className="form-group">
                <label>Status:</label>
                <select 
                  name="status" 
                  value={newStaffMember.status || "Active"}
                  onChange={handleInputChange}
                >
                  <option value="Active">Active</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
            )}
          </>
        )}
        
        {activeTab === 'officeStaff' && (
          <>
            <div className="form-group">
              <label>Position:</label>
              <input 
                type="text" 
                name="position" 
                value={newStaffMember.position}
                onChange={handleInputChange}
                placeholder="Enter position"
              />
            </div>
            <div className="form-group">
              <label>Department:</label>
              <select 
                name="department" 
                value={newStaffMember.department}
                onChange={handleInputChange}
              >
                <option value="">Select department</option>
                <option value="Administration">Administration</option>
                <option value="Clinical">Clinical</option>
                <option value="Support">Support</option>
                <option value="IT">IT</option>
              </select>
            </div>
          </>
        )}
        
        <div className="form-actions">
          <button 
            className="submit-button"
            onClick={handleAddStaffMember}
          >
            Add
          </button>
          <button 
            className="cancel-button"
            onClick={() => setShowAddForm(false)}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="staff-list-container">
      <div className="staff-header">
        <div className="staff-tabs">
          <button 
            className={`staff-tab ${activeTab === 'physicians' ? 'active' : ''}`}
            onClick={() => setActiveTab('physicians')}
          >
            Physicians
          </button>
          <button 
            className={`staff-tab ${activeTab === 'npp' ? 'active' : ''}`}
            onClick={() => setActiveTab('npp')}
          >
            NPP
          </button>
          <button 
            className={`staff-tab ${activeTab === 'officeStaff' ? 'active' : ''}`}
            onClick={() => setActiveTab('officeStaff')}
          >
            Office Staff
          </button>
        </div>
        <button 
          className="add-staff-button"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          <span className="icon">+</span> Add {activeTab === 'physicians' ? 'Physician' : activeTab === 'npp' ? 'NPP' : 'Office Staff'}
        </button>
      </div>

      <div className="staff-search">
        <input
          type="text"
          placeholder="Search persona..."
          value={searchTerm}
          onChange={handleSearch}
          className="staff-search-input"
        />
      </div>

      {renderAddForm()}

      <div className="staff-table">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              {(activeTab === 'physicians' || activeTab === 'npp') ? (
                <>
                  <th>NPI Number</th>
                  <th>Specialty</th>
                  {activeTab === 'physicians' && <th>Status</th>}
                </>
              ) : (
                <>
                  <th>Position</th>
                  <th>Department</th>
                </>
              )}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {getFilteredStaff().map(staff => (
              <tr key={staff.id}>
                <td>
                  {activeTab === 'physicians' ? (
                    <span 
                      className="physician-name-link" 
                      onClick={() => handlePhysicianClick(staff)}
                    >
                      {staff.name}
                    </span>
                  ) : activeTab === 'npp' ? (
                    <span 
                      className="npp-name-link" 
                      onClick={() => handleNPPClick(staff)}
                    >
                      {staff.name}
                    </span>
                  ) : (
                    <span 
                      className="office-staff-name-link" 
                      onClick={() => handleOfficeStaffClick(staff)}
                    >
                      {staff.name}
                    </span>
                  )}
                </td>
                {(activeTab === 'physicians' || activeTab === 'npp') ? (
                  <>
                    <td>{staff.npi || "N/A"}</td>
                    <td>{staff.specialty}</td>
                    {activeTab === 'physicians' && <td>{staff.status || 'Active'}</td>}
                  </>
                ) : (
                  <>
                    <td>{staff.position}</td>
                    <td>{staff.department}</td>
                  </>
                )}
                <td>
                  <div className="staff-actions">
                    <button 
                      className="delete-button"
                      onClick={() => handleDeleteStaffMember(staff.id)}
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
    </div>
  );
};

export default StaffList; 