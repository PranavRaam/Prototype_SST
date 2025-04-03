import { useState } from 'react';
import './InteractionLog.css';

const InteractionLog = () => {
  const [interactions, setInteractions] = useState([
    {
      id: 1,
      user: 'Dr. John Doe',
      contact: '+1234567890',
      designation: 'Cardiologist',
      medium: 'Email',
      summary: 'Reviewed patient test results',
      action: 'Schedule follow-up consultation',
      actionTaken: 'Consultation scheduled for next week',
      reactiveOutcomeNo: 'RO-001',
      dateTime: '2024-03-27T10:00:00'
    },
    {
      id: 2,
      user: 'Nurse Jane Smith',
      contact: '+1987654321',
      designation: 'Head Nurse',
      medium: 'Phone',
      summary: 'Discussed patient discharge plans',
      action: 'Coordinate with family',
      actionTaken: 'Called family and arranged transportation',
      reactiveOutcomeNo: 'RO-002',
      dateTime: '2024-03-28T14:30:00'
    },
    {
      id: 3,
      user: 'Dr. Alice Johnson',
      contact: '+1123456789',
      designation: 'Pediatrician',
      medium: 'Video Call',
      summary: "Consulted on child's symptoms",
      action: 'Prescribe medication',
      actionTaken: 'Prescription sent to pharmacy',
      reactiveOutcomeNo: 'RO-003',
      dateTime: '2024-03-29T09:15:00'
    },
    {
      id: 4,
      user: 'Dr. Bob Williams',
      contact: '+1777888999',
      designation: 'Oncologist',
      medium: 'Chat',
      summary: 'Updated patient on treatment plan',
      action: 'Arrange next chemo session',
      actionTaken: 'Scheduled for next Tuesday',
      reactiveOutcomeNo: 'RO-004',
      dateTime: '2024-03-30T11:45:00'
    },
    {
      id: 5,
      user: 'Emma Brown',
      contact: '+1555666777',
      designation: 'Physical Therapist',
      medium: 'Email',
      summary: 'Shared recovery exercises',
      action: 'Schedule next session',
      actionTaken: 'Session booked for Friday',
      reactiveOutcomeNo: 'RO-005',
      dateTime: '2024-03-31T16:00:00'
    },
    {
      id: 6,
      user: 'Dr. Michael Lee',
      contact: '+1444333222',
      designation: 'Radiologist',
      medium: 'Phone',
      summary: 'Discussed MRI findings',
      action: 'Prepare detailed report',
      actionTaken: '',
      reactiveOutcomeNo: '',
      dateTime: '2024-04-01T13:20:00'
    },
    {
      id: 7,
      user: 'Sophia Martinez',
      contact: '+1333444555',
      designation: 'Pharmacist',
      medium: 'In-Person',
      summary: 'Reviewed medication stock',
      action: 'Order new supplies',
      actionTaken: '',
      reactiveOutcomeNo: '',
      dateTime: '2024-04-02T10:00:00'
    },
    {
      id: 8,
      user: 'Daniel Garcia',
      contact: '+1999888777',
      designation: 'Hospital Administrator',
      medium: 'Email',
      summary: 'Reviewed hospital policies',
      action: 'Draft policy update',
      actionTaken: '',
      reactiveOutcomeNo: '',
      dateTime: '2024-04-03T15:45:00'
    },
    {
      id: 9,
      user: 'Dr. Liam Johnson',
      contact: '+1222333444',
      designation: 'Orthopedic Surgeon',
      medium: 'Video Call',
      summary: 'Discussed surgical procedures',
      action: 'Confirm OR availability',
      actionTaken: '',
      reactiveOutcomeNo: '',
      dateTime: '2024-04-04T11:30:00'
    },
    {
      id: 10,
      user: 'Nurse Olivia Taylor',
      contact: '+1777555666',
      designation: 'ICU Nurse',
      medium: 'Phone',
      summary: 'Reported patient vitals',
      action: 'Alert physician on changes',
      actionTaken: '',
      reactiveOutcomeNo: '',
      dateTime: '2024-04-05T09:45:00'
    },
    {
      id: 11,
      user: 'Dr. Noah Wilson',
      contact: '+1888999000',
      designation: 'Neurologist',
      medium: 'Email',
      summary: 'Reviewed EEG results',
      action: 'Refer patient to specialist',
      actionTaken: '',
      reactiveOutcomeNo: '',
      dateTime: '2024-04-06T14:20:00'
    },
    {
      id: 12,
      user: 'Ava Thompson',
      contact: '+1666777888',
      designation: 'Medical Technician',
      medium: 'In-Person',
      summary: 'Performed diagnostic tests',
      action: 'Send results to doctor',
      actionTaken: '',
      reactiveOutcomeNo: '',
      dateTime: '2024-04-07T16:10:00'
    },
    {
      id: 13,
      user: 'Dr. James Anderson',
      contact: '+1555333444',
      designation: 'Pulmonologist',
      medium: 'Phone',
      summary: 'Consulted on respiratory issues',
      action: 'Recommend breathing exercises',
      actionTaken: '',
      reactiveOutcomeNo: '',
      dateTime: '2024-04-08T12:00:00'
    },
    {
      id: 14,
      user: 'Isabella Moore',
      contact: '+1444555777',
      designation: 'Dietitian',
      medium: 'Email',
      summary: 'Shared patient meal plans',
      action: 'Adjust diet recommendations',
      actionTaken: '',
      reactiveOutcomeNo: '',
      dateTime: '2024-04-09T10:30:00'
    },
    {
      id: 15,
      user: 'Dr. William Clark',
      contact: '+1333222111',
      designation: 'General Surgeon',
      medium: 'Video Call',
      summary: 'Pre-op consultation',
      action: 'Confirm surgery schedule',
      actionTaken: '',
      reactiveOutcomeNo: '',
      dateTime: '2024-04-10T14:50:00'
    },
    {
      id: 16,
      user: 'Mia Lewis',
      contact: '+1999777555',
      designation: 'Medical Receptionist',
      medium: 'In-Person',
      summary: 'Registered new patients',
      action: 'Update patient records',
      actionTaken: '',
      reactiveOutcomeNo: '',
      dateTime: '2024-04-11T11:00:00'
    }

  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newInteraction, setNewInteraction] = useState({
    user: '',
    contact: '',
    designation: '',
    medium: '',
    summary: '',
    action: '',
    actionTaken: '',
    reactiveOutcomeNo: '',
    dateTime: new Date().toISOString().slice(0, 16)
  });

  // Sample reactive outcome numbers for dropdown
  const reactiveOutcomeOptions = [
    'RO-001', 'RO-002', 'RO-003', 'RO-004', 'RO-005', 
    'RO-006', 'RO-007', 'RO-008', 'RO-009', 'RO-010',
    'RO-011', 'RO-012', 'RO-013', 'RO-014', 'RO-015'
  ];

  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    const cstDate = new Date(date.toLocaleString('en-US', { timeZone: 'America/Chicago' }));

    const formattedDate = cstDate.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });

    const formattedTime = cstDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'America/Chicago'
    });

    return `${formattedDate} ${formattedTime} CST`;
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewInteraction(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setInteractions(prev => [...prev, {
      ...newInteraction,
      id: prev.length + 1
    }]);
    setShowModal(false);
    setNewInteraction({
      user: '',
      contact: '',
      designation: '',
      medium: '',
      summary: '',
      action: '',
      actionTaken: '',
      reactiveOutcomeNo: '',
      dateTime: new Date().toISOString().slice(0, 16)
    });
  };

  const filteredInteractions = interactions.filter(interaction =>
    Object.values(interaction).some(value =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="il_interaction_log_container">
      <h1 className="il_main_heading">Interaction Log</h1>
      
      <div className="il_search_container">
        <input
          type="text"
          placeholder="Search interactions..."
          value={searchTerm}
          onChange={handleSearch}
          className="il_search_input"
        />
        <button 
          className="il_add_button"
          onClick={() => setShowModal(true)}
        >
          Add Interaction
        </button>
      </div>

      <div className="il_table_container">
        <table className="il_interaction_table">
          <thead>
            <tr>
              <th>User</th>
              <th>Contact</th>
              <th>Designation</th>
              <th>Medium</th>
              <th>Summary</th>
              <th>Action</th>
              <th>Action Taken</th>
              <th>Reactive Outcome No</th>
              <th>Date and Time</th>
            </tr>
          </thead>
          <tbody>
            {filteredInteractions.map(interaction => (
              <tr key={interaction.id} className="il_table_row">
                <td>{interaction.user}</td>
                <td>{interaction.contact}</td>
                <td>{interaction.designation}</td>
                <td>{interaction.medium}</td>
                <td>{interaction.summary}</td>
                <td>{interaction.action}</td>
                <td>{interaction.actionTaken}</td>
                <td>{interaction.reactiveOutcomeNo}</td>
                <td>{formatDateTime(interaction.dateTime)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="il_modal_overlay">
          <div className="il_modal_content">
            <h2 className="il_modal_heading">Add New Interaction</h2>
            <form onSubmit={handleSubmit} className="il_modal_form">
              <div className="il_form_group">
                <label className="il_form_label">User:</label>
                <input
                  type="text"
                  name="user"
                  value={newInteraction.user}
                  onChange={handleInputChange}
                  required
                  className="il_form_input"
                />
              </div>
              <div className="il_form_group">
                <label className="il_form_label">Contact:</label>
                <input
                  type="text"
                  name="contact"
                  value={newInteraction.contact}
                  onChange={handleInputChange}
                  required
                  className="il_form_input"
                />
              </div>
              <div className="il_form_group">
                <label className="il_form_label">Designation:</label>
                <input
                  type="text"
                  name="designation"
                  value={newInteraction.designation}
                  onChange={handleInputChange}
                  required
                  className="il_form_input"
                />
              </div>
              <div className="il_form_group">
                <label className="il_form_label">Medium:</label>
                <input
                  type="text"
                  name="medium"
                  value={newInteraction.medium}
                  onChange={handleInputChange}
                  required
                  className="il_form_input"
                />
              </div>
              <div className="il_form_group">
                <label className="il_form_label">Summary:</label>
                <textarea
                  name="summary"
                  value={newInteraction.summary}
                  onChange={handleInputChange}
                  required
                  className="il_form_textarea"
                />
              </div>
              <div className="il_form_group">
                <label className="il_form_label">Action:</label>
                <input
                  type="text"
                  name="action"
                  value={newInteraction.action}
                  onChange={handleInputChange}
                  required
                  className="il_form_input"
                />
              </div>
              <div className="il_form_group">
                <label className="il_form_label">Action Taken:</label>
                <input
                  type="text"
                  name="actionTaken"
                  value={newInteraction.actionTaken}
                  onChange={handleInputChange}
                  required
                  className="il_form_input"
                />
              </div>
              <div className="il_form_group">
                <label className="il_form_label">Reactive Outcome No:</label>
                <div className="il_form_input_container">
                  <select
                    name="reactiveOutcomeNo"
                    value={newInteraction.reactiveOutcomeNo}
                    onChange={handleInputChange}
                    className="il_form_select"
                  >
                    <option value="">Select a Reactive Outcome</option>
                    {reactiveOutcomeOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="il_modal_buttons">
                <button type="submit" className="il_submit_button">Submit</button>
                <button 
                  type="button" 
                  className="il_cancel_button"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InteractionLog;
