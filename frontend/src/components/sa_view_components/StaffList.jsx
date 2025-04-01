import { useState } from 'react';
import './StaffList.css';

const StaffList = () => {
  const [activeTab, setActiveTab] = useState('physicians');
  const [searchTerm, setSearchTerm] = useState('');

  // Sample data - you can replace this with your actual data
  const staffData = {
    physicians: [
      { id: 1, name: 'Dr. John Smith', designation: 'Cardiologist' },
      { id: 2, name: 'Dr. Sarah Johnson', designation: 'Pediatrician' },
      { id: 3, name: 'Dr. Michael Brown', designation: 'Neurologist' },
      { id: 4, name: 'Dr. Emily Davis', designation: 'Orthopedic Surgeon' },
      { id: 5, name: 'Dr. John Smith', designation: 'Cardiologist' },
      { id: 6, name: 'Dr. Sarah Johnson', designation: 'Pediatrician' },
      { id: 7, name: 'Dr. Michael Brown', designation: 'Neurologist' },
      { id: 8, name: 'Dr. Emily Davis', designation: 'Orthopedic Surgeon' },
      

    ],
    npp: [
      { id: 1, name: 'Nurse Practitioner Amy Wilson', designation: 'Family Nurse Practitioner' },
      { id: 2, name: 'PA Robert Taylor', designation: 'Physician Assistant' },
      { id: 3, name: 'NP Jennifer Lee', designation: 'Pediatric Nurse Practitioner' },
    ],
    staff: [
      { id: 1, name: 'Mary Johnson', designation: 'Medical Receptionist' },
      { id: 2, name: 'David Wilson', designation: 'Medical Technician' },
      { id: 3, name: 'Lisa Anderson', designation: 'Administrative Assistant' },
    ]
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredStaff = staffData[activeTab].filter(staff =>
    staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.designation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    // <div className='staff-list-total'>
    <div className="staff-list-container">
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
          className={`staff-tab ${activeTab === 'staff' ? 'active' : ''}`}
          onClick={() => setActiveTab('staff')}
        >
          Staff
        </button>
      </div>

      <div className="staff-search">
        <input
          type="text"
          placeholder="Search staff..."
          value={searchTerm}
          onChange={handleSearch}
          className="staff-search-input"
        />
      </div>

      <div className="staff-table">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Designation</th>
            </tr>
          </thead>
          <tbody>
            {filteredStaff.map(staff => (
              <tr key={staff.id}>
                <td>{staff.name}</td>
                <td>{staff.designation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    // </div>
  );
};

export default StaffList; 