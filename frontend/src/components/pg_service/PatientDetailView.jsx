import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import './PatientDetailView.css';
import { 
  FaUser, 
  FaCalendarAlt, 
  FaPhone, 
  FaEnvelope, 
  FaMapMarkerAlt,
  FaBuilding,
  FaIdCard,
  FaHeartbeat,
  FaPills,
  FaAllergies,
  FaUserMd,
  FaFileAlt,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaPauseCircle,
  FaClipboardCheck,
  FaArrowLeft,
  FaPrint,
  FaDownload,
  FaUpload,
  FaCog,
  FaEdit,
  FaSave,
  FaTimes,
  FaSearch,
  FaFilter,
  FaEye,
  FaFileUpload,
  FaSpinner,
  FaExclamationTriangle,
  FaInfoCircle,
  FaHistory,
  FaFileMedical,
  FaUserCircle,
  FaClipboardList,
  FaFileMedicalAlt,
  FaHashtag,
  FaCalendar,
  FaFilePdf,
  FaFileWord,
  FaFileExcel,
  FaFileImage,
  FaFile,
  FaTrash,
  FaLink,
  FaChartLine,
  FaUserCheck,
  FaBell,
  FaSortAmountDown,
  FaSortAmountUp,
  FaSignature,
  FaCommentMedical,
  FaHospital,
  FaShareAlt,
  FaPlus,
  FaStethoscope,
  FaProcedures,
  FaChevronDown,
  FaChevronRight,
  FaCircle,
  FaFileSignature,
  FaCheck,
  FaArrowCircleRight,
  FaExclamationCircle
} from 'react-icons/fa';

// Helper functions
const getStatusIcon = (status) => {
  switch (status) {
    case 'active':
      return <FaCheckCircle className="status-icon active" />;
    case 'discharged':
      return <FaArrowCircleRight className="status-icon discharged" />;
    case 'on-hold':
      return <FaPauseCircle className="status-icon on-hold" />;
    case 'evaluation':
      return <FaExclamationCircle className="status-icon evaluation" />;
    default:
      return <FaInfoCircle className="status-icon" />;
  }
};

const getStatusMessage = (status) => {
  switch (status) {
    case 'active':
      return 'Patient is actively receiving care';
    case 'discharged':
      return 'Patient has been discharged from care';
    case 'on-hold':
      return 'Patient care is temporarily on hold';
    case 'evaluation':
      return 'Patient is being evaluated for care plan';
    default:
      return 'Status information unavailable';
  }
};

const getNextReviewDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + 7); // Next review in 7 days
  return date.toLocaleDateString();
};

const getTodayMinusDays = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toLocaleDateString();
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric'
  });
};

const getTimelineIcon = (eventType) => {
  switch (eventType) {
    case 'admission':
      return <FaHospital className="timeline-icon" />;
    case 'evaluation':
      return <FaClipboardCheck className="timeline-icon" />;
    case 'document':
      return <FaFileAlt className="timeline-icon" />;
    case 'status':
      return <FaUserCheck className="timeline-icon" />;
    case 'treatment':
      return <FaStethoscope className="timeline-icon" />;
    default:
      return <FaInfoCircle className="timeline-icon" />;
  }
};

// Generate some mock timeline data for demonstration
const generateMockTimelineData = () => {
  return [
    {
      id: 1,
      type: 'admission',
      title: 'Patient Admitted',
      date: getTodayMinusDays(30),
      description: 'Initial admission to care program',
      provider: 'Dr. Sarah Johnson',
      location: 'General Ward',
      tags: ['Admission', 'Initial Assessment']
    },
    {
      id: 2,
      type: 'evaluation',
      title: 'Initial Evaluation',
      date: getTodayMinusDays(28),
      description: 'Full physical evaluation completed',
      provider: 'Dr. Robert Chen',
      tags: ['Evaluation', 'Completed']
    },
    {
      id: 3,
      type: 'document',
      title: 'Care Plan Created',
      date: getTodayMinusDays(26),
      description: 'Initial care plan documented and approved',
      provider: 'Care Team',
      tags: ['Care Plan', 'Documentation']
    },
    {
      id: 4,
      type: 'treatment',
      title: 'Treatment Started',
      date: getTodayMinusDays(25),
      description: 'Treatment regimen initiated',
      provider: 'Dr. Sarah Johnson',
      tags: ['Treatment', 'Medication']
    },
    {
      id: 5,
      type: 'status',
      title: 'Status Updated',
      date: getTodayMinusDays(15),
      description: 'Patient status updated to Active',
      provider: 'Care Team',
      tags: ['Status Change', 'Active']
    },
    {
      id: 6,
      type: 'evaluation',
      title: 'Follow-up Evaluation',
      date: getTodayMinusDays(10),
      description: 'Regular follow-up evaluation',
      provider: 'Dr. Robert Chen',
      tags: ['Evaluation', 'Follow-up']
    },
    {
      id: 7,
      type: 'document',
      title: 'Progress Report Filed',
      date: getTodayMinusDays(5),
      description: 'Monthly progress report completed',
      provider: 'Care Team',
      tags: ['Progress Report', 'Documentation']
    }
  ];
};

const PatientDetailView = ({ patient, onBack }) => {
  // State for active tab and document type select
  const [activeTab, setActiveTab] = useState('patientInfo');
  const [activeDocumentTab, setActiveDocumentTab] = useState('newPrepared');
  const [documentDate, setDocumentDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState('receivedDate');
  const [sortDirection, setSortDirection] = useState('desc');
  const [notification, setNotification] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [timelinePeriod, setTimelinePeriod] = useState('all');
  const [selectedTimeline, setSelectedTimeline] = useState(null);
  const fileInputRef = useRef(null);
  const [isDropActive, setIsDropActive] = useState(false);
  const [fileTypes, setFileTypes] = useState([]);
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // State for editable patient info
  const [isEditing, setIsEditing] = useState(false);
  const [patientInfo, setPatientInfo] = useState({
    id: patient?.id || 'PT-12345',
    name: patient?.ptName || 'John Smith',
    dob: patient?.dob || '1965-03-15',
    gender: 'Male',
    status: 'active',
    phone: '+1 (555) 123-4567',
    email: 'patient@example.com',
    address: '123 Main Street, Anytown, CA 12345',
    insurance: 'Medicare',
    insuranceId: 'MED12345678',
    pg: patient?.pg || 'Group A',
    hhah: patient?.hhah || 'Yes',
    admissionDate: '2023-04-01',
    dischargeDate: '',
    primaryDiagnosis: 'Hypertension',
    secondaryDiagnosis: 'Type 2 Diabetes',
    primaryPhysician: 'Dr. Sarah Johnson',
    specialist: 'Dr. Robert Chen',
    allergies: 'Penicillin, Peanuts',
    medications: 'Lisinopril, Metformin',
    hasEHR: patient?.hasEHR ?? false // Changed to false by default
  });
  
  // Timeline data
  const [timelineData, setTimelineData] = useState(generateMockTimelineData());
  
  // Dummy data for documents
  const [newPreparedDocs, setNewPreparedDocs] = useState([
    { 
      id: 'DOC-001', 
      type: 'Evaluation', 
      status: 'New', 
      receivedDate: '2023-05-10',
      fileName: 'initial_evaluation.pdf',
      size: '1.2 MB',
      uploadedBy: 'Dr. Johnson'
    },
    { 
      id: 'DOC-002', 
      type: '', 
      status: 'New', 
      receivedDate: '2023-05-12',
      fileName: 'lab_results.pdf',
      size: '0.8 MB',
      uploadedBy: 'Lab Technician'
    },
    { 
      id: 'DOC-003', 
      type: 'Position Order', 
      status: 'Prepared', 
      receivedDate: '2023-05-15',
      fileName: 'position_order.docx',
      size: '0.5 MB',
      uploadedBy: 'Dr. Chen'
    }
  ]);
  
  const [signedDocs, setSignedDocs] = useState([
    { 
      id: 'DOC-004', 
      type: 'Re-evaluation', 
      signedDate: '2023-04-28',
      fileName: 're_evaluation_signed.pdf',
      size: '1.5 MB',
      signedBy: 'Dr. Johnson'
    },
    { 
      id: 'DOC-005', 
      type: 'Position Order', 
      signedDate: '2023-04-30',
      fileName: 'position_order_signed.pdf',
      size: '0.7 MB',
      signedBy: 'Dr. Chen'
    }
  ]);

  // CPO allocation data
  const [cpoDocuments, setCpoDocuments] = useState([
    {
      id: 'CPO-001',
      name: 'Initial Care Plan',
      creationDate: '2023-04-05',
      minutes: 15,
      status: 'Completed',
      provider: 'Dr. Sarah Johnson'
    },
    {
      id: 'CPO-002',
      name: 'Medication Review',
      creationDate: '2023-04-15',
      minutes: 10,
      status: 'Completed',
      provider: 'Dr. Robert Chen'
    },
    {
      id: 'CPO-003',
      name: 'Progress Report',
      creationDate: '2023-05-01',
      minutes: 20,
      status: 'In Progress',
      provider: 'Dr. Sarah Johnson'
    },
    {
      id: 'CPO-004',
      name: 'Care Coordination',
      creationDate: '2023-05-10',
      minutes: 30,
      status: 'Completed',
      provider: 'Care Team'
    }
  ]);
  
  // Function to filter documents
  const filterDocuments = (docs) => {
    return docs.filter(doc => {
      // Apply search term filtering
      const matchesSearch = searchTerm === '' || 
        doc.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (doc.type && doc.type.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (doc.fileName && doc.fileName.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Apply status filtering (for new/prepared docs only)
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'new' && doc.status === 'New') ||
        (statusFilter === 'prepared' && doc.status === 'Prepared');
      
      // Apply date filtering if date range is set
      let matchesDate = true;
      if (dateRange.from && dateRange.to && doc.receivedDate) {
        const docDate = new Date(doc.receivedDate);
        const fromDate = new Date(dateRange.from);
        const toDate = new Date(dateRange.to);
        matchesDate = docDate >= fromDate && docDate <= toDate;
      }
      
      // Apply file type filtering
      let matchesFileType = true;
      if (fileTypes.length > 0 && doc.fileName) {
        const extension = doc.fileName.split('.').pop().toLowerCase();
        matchesFileType = fileTypes.includes(extension);
      }
      
      return matchesSearch && matchesStatus && matchesDate && matchesFileType;
    });
  };
  
  // Sort function for documents
  const sortDocuments = (docs) => {
    return [...docs].sort((a, b) => {
      const fieldA = a[sortField] || '';
      const fieldB = b[sortField] || '';
      
      if (fieldA < fieldB) return sortDirection === 'asc' ? -1 : 1;
      if (fieldA > fieldB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  };
  
  // Memoize filtered and sorted documents
  const filteredNewPreparedDocs = useMemo(() => {
    return sortDocuments(filterDocuments(newPreparedDocs));
  }, [newPreparedDocs, searchTerm, statusFilter, dateRange, fileTypes, sortField, sortDirection]);

  const filteredSignedDocs = useMemo(() => {
    const filtered = signedDocs.filter(doc => 
      searchTerm === '' || 
      doc.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.type && doc.type.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (doc.fileName && doc.fileName.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    return sortDocuments(filtered);
  }, [signedDocs, searchTerm, sortField, sortDirection]);

  // Filter timeline data based on the selected period
  const filteredTimelineData = useMemo(() => {
    if (timelinePeriod === 'all') return timelineData;
    
    return timelineData.filter(event => event.type === timelinePeriod);
  }, [timelineData, timelinePeriod]);

  // Memoize document counts
  const documentCounts = useMemo(() => ({
    new: newPreparedDocs.filter(doc => doc.status === 'New').length,
    prepared: newPreparedDocs.filter(doc => doc.status === 'Prepared').length,
    signed: signedDocs.length,
    total: newPreparedDocs.length + signedDocs.length
  }), [newPreparedDocs, signedDocs]);

  // Calculate total CPO minutes
  const totalCpoMinutes = useMemo(() => {
    return cpoDocuments.reduce((total, doc) => total + doc.minutes, 0);
  }, [cpoDocuments]);

  // Memoize handlers
  const handleFileInputChange = useCallback((e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      uploadFiles(files);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDropActive(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      uploadFiles(files);
    }
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDropActive(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDropActive(false);
  }, []);

  // Reset drop zone state when component unmounts
  useEffect(() => {
    return () => {
      setIsDropActive(false);
    };
  }, []);

  const toggleDocPrepared = useCallback((docId) => {
    setNewPreparedDocs(prevDocs => {
      const updatedDocs = prevDocs.map(doc => {
        if (doc.id === docId) {
          const newStatus = doc.status === 'New' ? 'Prepared' : 'New';
          showNotification(
            'success', 
            'Status Updated', 
            `Document ${docId} marked as ${newStatus}`
          );
          return { ...doc, status: newStatus };
        }
        return doc;
      });
      return updatedDocs;
    });
  }, []);

  const moveToSigned = useCallback((docId) => {
    const docToMove = newPreparedDocs.find(doc => doc.id === docId);
    if (docToMove) {
      const signedDoc = {
        id: docToMove.id,
        type: docToMove.type,
        fileName: docToMove.fileName,
        size: docToMove.size,
        signedDate: new Date().toISOString().split('T')[0],
        signedBy: 'Dr. Sarah Johnson'
      };
      setSignedDocs(prev => [...prev, signedDoc]);
      setNewPreparedDocs(prev => prev.filter(doc => doc.id !== docId));
      
      // Add to timeline
      const newTimelineEvent = {
        id: timelineData.length + 1,
        type: 'document',
        title: `Document Signed: ${docToMove.type || 'Unknown Type'}`,
        date: new Date().toLocaleDateString(),
        description: `Document ${docToMove.id} has been signed`,
        provider: 'Dr. Sarah Johnson',
        tags: ['Document', 'Signed']
      };
      
      setTimelineData(prev => [newTimelineEvent, ...prev]);
      
      showNotification(
        'success', 
        'Document Signed', 
        `Document ${docId} has been moved to signed documents`
      );
    }
  }, [newPreparedDocs, timelineData]);
  
  // Function to upload files
  const uploadFiles = (files) => {
    setIsUploading(true);
    
    // Simulate upload delay
    setTimeout(() => {
      const newDocs = files.map(file => ({
        id: `DOC-${Math.floor(1000 + Math.random() * 9000)}`,
        type: '',
        status: 'New',
        receivedDate: new Date().toISOString().split('T')[0],
        fileName: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        uploadedBy: patientInfo.name
      }));
      
      setNewPreparedDocs(prev => [...prev, ...newDocs]);
      setIsUploading(false);
      
      // Add to timeline
      const newTimelineEvent = {
        id: timelineData.length + 1,
        type: 'document',
        title: `Documents Uploaded`,
        date: new Date().toLocaleDateString(),
        description: `${files.length} document(s) uploaded`,
        provider: patientInfo.name,
        tags: ['Document', 'Upload']
      };
      
      setTimelineData(prev => [newTimelineEvent, ...prev]);
      
      // Show success notification
      showNotification('success', 'Upload Complete', `Successfully uploaded ${files.length} document(s)`);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }, 1500);
  };
  
  // Function to show notification
  const showNotification = (type, title, message) => {
    setNotification({ type, title, message });
  };
  
  // Function to close notification
  const closeNotification = () => {
    setNotification(null);
  };
  
  // Calculate CPO minutes
  const calculateCPOMinutes = () => {
    return totalCpoMinutes;
  };
  
  // Function to update document type
  const updateDocType = (docId, newType) => {
    setNewPreparedDocs(prevDocs => 
      prevDocs.map(doc => 
        doc.id === docId ? { ...doc, type: newType } : doc
      )
    );
  };
  
  // Function to update signed date
  const updateSignedDate = (docId, date) => {
    setSignedDocs(prevDocs => 
      prevDocs.map(doc => 
        doc.id === docId ? { ...doc, signedDate: date } : doc
      )
    );
  };
  
  // Document type options
  const documentTypes = [
    'Evaluation',
    'Re-evaluation',
    'Position Order',
    'Recertification',
    'Discharge Summary',
    'Progress Note',
    'Treatment Plan',
    'Referral',
    'Lab Results',
    'Medical History',
    'Medication List',
    'Consent Form',
    'Insurance Documentation',
    'Other'
  ];

  // Handle patient info changes
  const handleInfoChange = (field, value) => {
    setPatientInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Save patient info changes
  const savePatientInfo = () => {
    // Here you would typically make an API call to save the data
    setIsEditing(false);
    
    showNotification('success', 'Changes Saved', 'Patient information has been updated successfully');
    
    // Add to timeline if there were significant changes
    const newTimelineEvent = {
      id: timelineData.length + 1,
      type: 'status',
      title: 'Patient Information Updated',
      date: new Date().toLocaleDateString(),
      description: 'Patient information has been updated',
      provider: 'Admin User',
      tags: ['Information', 'Update']
    };
    
    setTimelineData(prev => [newTimelineEvent, ...prev]);
  };

  // Auto dismiss notification after time
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Function to determine file icon type based on file name
  const getFileIconByName = (fileName) => {
    if (!fileName) return <FaFile />;
    
    const extension = fileName.split('.').pop().toLowerCase();
    
    switch(extension) {
      case 'pdf':
        return <FaFilePdf className="file-icon pdf" />;
      case 'doc':
      case 'docx':
        return <FaFileWord className="file-icon word" />;
      case 'xls':
      case 'xlsx':
        return <FaFileExcel className="file-icon excel" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <FaFileImage className="file-icon image" />;
      default:
        return <FaFile className="file-icon" />;
    }
  };

  // Function to toggle sort
  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Function to add new CPO document
  const addCpoDocument = () => {
    const newCpoDoc = {
      id: `CPO-${Math.floor(1000 + Math.random() * 9000)}`,
      name: 'New CPO Document',
      creationDate: new Date().toISOString().split('T')[0],
      minutes: 15,
      status: 'In Progress',
      provider: patientInfo.primaryPhysician
    };
    
    setCpoDocuments(prev => [...prev, newCpoDoc]);
    
    showNotification('success', 'CPO Document Created', 'New CPO document has been created');
  };

  // Function to update CPO document status
  const updateCpoStatus = (docId, newStatus) => {
    setCpoDocuments(prevDocs => 
      prevDocs.map(doc => 
        doc.id === docId ? { ...doc, status: newStatus } : doc
      )
    );
    
    showNotification('success', 'Status Updated', `CPO document status changed to ${newStatus}`);
  };

  // Function to update CPO minutes
  const updateCpoMinutes = (docId, minutes) => {
    setCpoDocuments(prevDocs => 
      prevDocs.map(doc => 
        doc.id === docId ? { ...doc, minutes: Number(minutes) } : doc
      )
    );
  };

  // Function to handle file type filter changes
  const handleFileTypeFilter = (type) => {
    if (fileTypes.includes(type)) {
      setFileTypes(prev => prev.filter(t => t !== type));
    } else {
      setFileTypes(prev => [...prev, type]);
    }
  };

  // Function to reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setDateRange({ from: '', to: '' });
    setFileTypes([]);
    setSortField('receivedDate');
    setSortDirection('desc');
  };

  // Document viewer state
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);

  // Function to open document viewer
  const openDocumentViewer = (doc) => {
    setSelectedDocument(doc);
    setViewerOpen(true);
  };

  // Function to close document viewer
  const closeDocumentViewer = () => {
    setViewerOpen(false);
    setSelectedDocument(null);
  };

  const markAsPrepared = (docId) => {
    setNewPreparedDocs(prevDocs => {
      const updatedDocs = prevDocs.map(doc => {
        if (doc.id === docId) {
          showNotification(
            'success', 
            'Status Updated', 
            `Document ${docId} marked as Prepared`
          );
          return { ...doc, status: 'Prepared' };
        }
        return doc;
      });
      return updatedDocs;
    });
  };

  const markAsUnprepared = (docId) => {
    setNewPreparedDocs(prevDocs => {
      const updatedDocs = prevDocs.map(doc => {
        if (doc.id === docId) {
          showNotification(
            'success', 
            'Status Updated', 
            `Document ${docId} marked as New`
          );
          return { ...doc, status: 'New' };
        }
        return doc;
      });
      return updatedDocs;
    });
  };

  // Add these new functions after the existing markAsPrepared function
  
  // Function to generate a report
  const generateDocumentReport = () => {
    setIsUploading(true); // Reuse the loading indicator
    
    // Simulate report generation delay
    setTimeout(() => {
      setIsUploading(false);
      
      // Show success notification
      showNotification(
        'success', 
        'Report Generated', 
        'Patient document report has been generated and downloaded'
      );
      
      // Simulate downloading a file
      const element = document.createElement('a');
      element.setAttribute('href', 'data:text/plain;charset=utf-8,');
      element.setAttribute('download', `${patientInfo.name.replace(/\s+/g, '_')}_Document_Report.pdf`);
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      
      // Add to timeline
      const newTimelineEvent = {
        id: timelineData.length + 1,
        type: 'document',
        title: 'Document Report Generated',
        date: new Date().toLocaleDateString(),
        description: 'Document report generated and downloaded',
        provider: 'Admin User',
        tags: ['Report', 'Document']
      };
      
      setTimelineData(prev => [newTimelineEvent, ...prev]);
    }, 1500);
  };
  
  // Function to export documents
  const exportDocuments = () => {
    // Determine which documents to export based on active tab
    const docsToExport = activeDocumentTab === 'newPrepared' 
      ? filteredNewPreparedDocs
      : filteredSignedDocs;
    
    if (docsToExport.length === 0) {
      showNotification(
        'warning',
        'No Documents to Export',
        'There are no documents matching your current filters to export'
      );
      return;
    }
    
    setIsUploading(true); // Reuse the loading indicator
    
    // Simulate export delay
    setTimeout(() => {
      setIsUploading(false);
      
      // Show success notification
      showNotification(
        'success', 
        'Documents Exported', 
        `Successfully exported ${docsToExport.length} document(s)`
      );
      
      // Simulate downloading a zip file
      const element = document.createElement('a');
      element.setAttribute('href', 'data:text/plain;charset=utf-8,');
      element.setAttribute('download', `${patientInfo.name.replace(/\s+/g, '_')}_Documents.zip`);
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      
      // Add to timeline
      const newTimelineEvent = {
        id: timelineData.length + 1,
        type: 'document',
        title: 'Documents Exported',
        date: new Date().toLocaleDateString(),
        description: `${docsToExport.length} documents exported`,
        provider: 'Admin User',
        tags: ['Export', 'Documents']
      };
      
      setTimelineData(prev => [newTimelineEvent, ...prev]);
    }, 1500);
  };

  // Add after calculateCPOMinutes function
  const [cpoDocs, setCpoDocs] = useState([
    {
      id: 'CPO-001',
      fileName: 'CPO_Document_001.pdf',
      type: 'CPO Minutes',
      receivedDate: '2023-04-05',
      status: 'Completed',
      size: '1.4 MB',
      content: `This is a sample CPO document content for CPO-001.
      
Patient ID: ${patientInfo?.id || 'PT12345'}
Patient Name: ${patientInfo?.name || 'John Doe'}
Date of Assessment: April 5, 2023
      
CPO Meeting Minutes:
- Patient's case was discussed with the multidisciplinary team
- Treatment plan was developed and approved
- Next follow-up scheduled for May 15, 2023
      
Recommendations:
1. Continue physical therapy sessions twice weekly
2. Schedule follow-up imaging in 4 weeks
3. Monitor pain levels and adjust medication as needed`,
      signedBy: 'Dr. Sarah Johnson',
      signedDate: '2023-04-07'
    },
    {
      id: 'CPO-002',
      fileName: 'CPO_Document_002.pdf',
      type: 'CPO Minutes',
      receivedDate: '2023-05-10',
      status: 'Completed',
      size: '0.9 MB',
      content: `This is a sample CPO document content for CPO-002.
      
Patient ID: ${patientInfo?.id || 'PT12345'}
Patient Name: ${patientInfo?.name || 'John Doe'}
Date of Assessment: May 10, 2023
      
CPO Meeting Minutes:
- Review of patient progress since initial assessment
- Adjustment to treatment plan based on response
- Discussion of specialist referral options
      
Recommendations:
1. Reduce physical therapy to once weekly
2. Begin occupational therapy assessment
3. Continue current medication regimen
4. Schedule follow-up CPO meeting in 6 weeks`,
      signedBy: 'Dr. Michael Chen',
      signedDate: '2023-05-12'
    }
  ]);

  return (
    <div className="patient-detail-view">
      <div className="detail-header">
        <button className="back-button" onClick={onBack}>
          <FaArrowLeft className="back-icon" />
          Back to Patients
        </button>
        <div className="patient-header-info">
          <h2 className="patient-name">
            <FaUserCircle className="patient-icon" />
            {patientInfo.name}
            <span className={`status-pill ${patientInfo.status || 'active'}`}>
              {getStatusIcon(patientInfo.status)}
              {patientInfo.status ? 
                patientInfo.status.charAt(0).toUpperCase() + patientInfo.status.slice(1) : 
                'Active'
              }
            </span>
          </h2>
          <div className="patient-meta">
            <div className="patient-meta-item">
              <FaIdCard className="meta-icon" />
              ID: {patientInfo.id}
            </div>
            <div className="patient-meta-item">
              <FaCalendarAlt className="meta-icon" />
              DoB: {formatDate(patientInfo.dob)}
            </div>
            <div className="patient-meta-item">
              <FaUser className="meta-icon" />
              {patientInfo.gender}
            </div>
            <div className="patient-meta-item">
              <FaPhone className="meta-icon" />
              {patientInfo.phone}
            </div>
            <div className={`ehr-status ${patientInfo.hasEHR ? 'present' : 'absent'}`}>
              <FaFileMedicalAlt className="ehr-icon" />
              EHR: {patientInfo.hasEHR ? 'Present' : 'Not Available'}
            </div>
          </div>
        </div>
        <div className="patient-quick-actions">
        </div>
      </div>
      
      {/* Tab navigation */}
      <div className="detail-tabs">
        <button 
          className={`tab-button ${activeTab === 'patientInfo' ? 'active' : ''}`}
          onClick={() => setActiveTab('patientInfo')}
        >
          <FaUserCircle className="tab-icon" />
          Patient Info
        </button>
        <button 
          className={`tab-button ${activeTab === 'timeline' ? 'active' : ''}`}
          onClick={() => setActiveTab('timeline')}
        >
          <FaHistory className="tab-icon" />
          Patient Timeline
        </button>
        <button 
          className={`tab-button ${activeTab === 'documents' ? 'active' : ''}`}
          onClick={() => setActiveTab('documents')}
        >
          <FaFileAlt className="tab-icon" />
          Documents
          {documentCounts.new > 0 && (
            <span className="tab-badge new">{documentCounts.new}</span>
          )}
        </button>
        <button 
          className={`tab-button ${activeTab === 'cpo' ? 'active' : ''}`}
          onClick={() => setActiveTab('cpo')}
        >
          <FaFileMedical className="tab-icon" />
          CPO
        </button>
      </div>
      
      {/* Patient Info Tab */}
      {activeTab === 'patientInfo' && (
        <div className="tab-content animate-fade-in">
          <div className="info-header">
            <h3>
              <FaUserCircle className="header-icon" />
              Patient Information
            </h3>
            <div className="info-actions">
              {isEditing ? (
                <div className="button-group">
                  <button className="action-button save" onClick={savePatientInfo}>
                    <FaSave className="action-icon" />
                    Save Changes
                  </button>
                  <button className="action-button cancel" onClick={() => setIsEditing(false)}>
                    <FaTimes className="action-icon" />
                    Cancel
                  </button>
                </div>
              ) : (
                <button className="action-button edit" onClick={() => setIsEditing(true)}>
                  <FaEdit className="action-icon" />
                  Edit Patient Info
                </button>
              )}
            </div>
          </div>
          
          <div className="patient-info-card">
            <div className="info-section">
              <h3>
                <FaUser className="section-icon" />
                Personal Information
                <span className="section-badge">Basic Details</span>
              </h3>
              <div className="info-grid">
                <div className="info-item">
                  <label>
                    <FaUserCircle className="field-icon" />
                    Patient Name:
                  </label>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={patientInfo.name} 
                      onChange={(e) => handleInfoChange('name', e.target.value)}
                      className="info-input"
                      placeholder="Enter patient name"
                    />
                  ) : (
                    <span>{patientInfo.name}</span>
                  )}
                </div>
                <div className="info-item">
                  <label>
                    <FaIdCard className="field-icon" />
                    Patient ID:
                  </label>
                  <span className="id-display">{patientInfo.id}</span>
                </div>
                <div className="info-item">
                  <label>
                    <FaCalendarAlt className="field-icon" />
                    Date of Birth:
                  </label>
                  {isEditing ? (
                    <input 
                      type="date" 
                      value={patientInfo.dob} 
                      onChange={(e) => handleInfoChange('dob', e.target.value)}
                      className="info-input"
                    />
                  ) : (
                    <span>{formatDate(patientInfo.dob)}</span>
                  )}
                </div>
                <div className="info-item">
                  <label>
                    <FaUser className="field-icon" />
                    Gender:
                  </label>
                  {isEditing ? (
                    <select 
                      value={patientInfo.gender} 
                      onChange={(e) => handleInfoChange('gender', e.target.value)}
                      className="info-input"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  ) : (
                    <span>{patientInfo.gender}</span>
                  )}
                </div>
                <div className="info-item">
                  <label>
                    <FaPhone className="field-icon" />
                    Phone Number:
                  </label>
                  {isEditing ? (
                    <input 
                      type="tel" 
                      value={patientInfo.phone} 
                      onChange={(e) => handleInfoChange('phone', e.target.value)}
                      className="info-input"
                      placeholder="Enter phone number"
                    />
                  ) : (
                    <span>{patientInfo.phone}</span>
                  )}
                </div>
                <div className="info-item">
                  <label>
                    <FaEnvelope className="field-icon" />
                    Email:
                  </label>
                  {isEditing ? (
                    <input 
                      type="email" 
                      value={patientInfo.email} 
                      onChange={(e) => handleInfoChange('email', e.target.value)}
                      className="info-input"
                      placeholder="Enter email address"
                    />
                  ) : (
                    <span>{patientInfo.email}</span>
                  )}
                </div>
                <div className="info-item full-width">
                  <label>
                    <FaMapMarkerAlt className="field-icon" />
                    Address:
                  </label>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={patientInfo.address} 
                      onChange={(e) => handleInfoChange('address', e.target.value)}
                      className="info-input"
                      placeholder="Enter full address"
                    />
                  ) : (
                    <span>{patientInfo.address}</span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="info-section">
              <h3>
                <FaBuilding className="section-icon" />
                Insurance Information
                <span className="section-badge">Coverage Details</span>
              </h3>
              <div className="info-grid">
                <div className="info-item">
                  <label>
                    <FaBuilding className="field-icon" />
                    Insurance Provider:
                  </label>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={patientInfo.insurance} 
                      onChange={(e) => handleInfoChange('insurance', e.target.value)}
                      className="info-input"
                      placeholder="Enter insurance provider"
                    />
                  ) : (
                    <span>{patientInfo.insurance}</span>
                  )}
                </div>
                <div className="info-item">
                  <label>
                    <FaIdCard className="field-icon" />
                    Insurance ID:
                  </label>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={patientInfo.insuranceId} 
                      onChange={(e) => handleInfoChange('insuranceId', e.target.value)}
                      className="info-input"
                      placeholder="Enter insurance ID"
                    />
                  ) : (
                    <span>{patientInfo.insuranceId}</span>
                  )}
                </div>
                <div className="info-item">
                  <label>
                    <FaBuilding className="field-icon" />
                    PG:
                  </label>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={patientInfo.pg} 
                      onChange={(e) => handleInfoChange('pg', e.target.value)}
                      className="info-input"
                      placeholder="Enter PG"
                    />
                  ) : (
                    <span className="highlighted-value">{patientInfo.pg}</span>
                  )}
                </div>
                <div className="info-item">
                  <label>
                    <FaUser className="field-icon" />
                    HHAH:
                  </label>
                  {isEditing ? (
                    <select 
                      value={patientInfo.hhah} 
                      onChange={(e) => handleInfoChange('hhah', e.target.value)}
                      className="info-input"
                    >
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  ) : (
                    <span className="highlighted-value">{patientInfo.hhah}</span>
                  )}
                </div>
                <div className="info-item">
                  <label>
                    <FaCalendarAlt className="field-icon" />
                    Admission Date:
                  </label>
                  {isEditing ? (
                    <input 
                      type="date" 
                      value={patientInfo.admissionDate} 
                      onChange={(e) => handleInfoChange('admissionDate', e.target.value)}
                      className="info-input"
                    />
                  ) : (
                    <span>{formatDate(patientInfo.admissionDate)}</span>
                  )}
                </div>
                <div className="info-item">
                  <label>
                    <FaCalendarAlt className="field-icon" />
                    Discharge Date:
                  </label>
                  {isEditing ? (
                    <input 
                      type="date" 
                      value={patientInfo.dischargeDate} 
                      onChange={(e) => handleInfoChange('dischargeDate', e.target.value)}
                      className="info-input"
                    />
                  ) : (
                    <span>{patientInfo.dischargeDate ? formatDate(patientInfo.dischargeDate) : 'Not discharged'}</span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="info-section">
              <h3>
                <FaHeartbeat className="section-icon" />
                Medical Information
                <span className="section-badge">Health Details</span>
              </h3>
              <div className="info-grid">
                <div className="info-item">
                  <label>
                    <FaHeartbeat className="field-icon" />
                    Primary Diagnosis:
                  </label>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={patientInfo.primaryDiagnosis} 
                      onChange={(e) => handleInfoChange('primaryDiagnosis', e.target.value)}
                      className="info-input"
                      placeholder="Enter primary diagnosis"
                    />
                  ) : (
                    <span className="diagnosis primary">{patientInfo.primaryDiagnosis}</span>
                  )}
                </div>
                <div className="info-item">
                  <label>
                    <FaHeartbeat className="field-icon" />
                    Secondary Diagnosis:
                  </label>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={patientInfo.secondaryDiagnosis} 
                      onChange={(e) => handleInfoChange('secondaryDiagnosis', e.target.value)}
                      className="info-input"
                      placeholder="Enter secondary diagnosis"
                    />
                  ) : (
                    <span className="diagnosis secondary">{patientInfo.secondaryDiagnosis}</span>
                  )}
                </div>
                <div className="info-item">
                  <label>
                    <FaUserMd className="field-icon" />
                    Primary Physician:
                  </label>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={patientInfo.primaryPhysician} 
                      onChange={(e) => handleInfoChange('primaryPhysician', e.target.value)}
                      className="info-input"
                      placeholder="Enter primary physician"
                    />
                  ) : (
                    <span className="physician">{patientInfo.primaryPhysician}</span>
                  )}
                </div>
                <div className="info-item">
                  <label>
                    <FaUserMd className="field-icon" />
                    Specialist:
                  </label>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={patientInfo.specialist} 
                      onChange={(e) => handleInfoChange('specialist', e.target.value)}
                      className="info-input"
                      placeholder="Enter specialist"
                    />
                  ) : (
                    <span className="physician">{patientInfo.specialist}</span>
                  )}
                </div>
                <div className="info-item">
                  <label>
                    <FaAllergies className="field-icon" />
                    Allergies:
                  </label>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={patientInfo.allergies} 
                      onChange={(e) => handleInfoChange('allergies', e.target.value)}
                      className="info-input"
                      placeholder="Enter allergies (comma separated)"
                    />
                  ) : (
                    <div className="tag-list">
                      {patientInfo.allergies.split(',').map((allergy, index) => (
                        <span key={index} className="medical-tag allergy">
                          <FaAllergies className="tag-icon" />
                          {allergy.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="info-item">
                  <label>
                    <FaPills className="field-icon" />
                    Current Medications:
                  </label>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={patientInfo.medications} 
                      onChange={(e) => handleInfoChange('medications', e.target.value)}
                      className="info-input"
                      placeholder="Enter medications (comma separated)"
                    />
                  ) : (
                    <div className="tag-list">
                      {patientInfo.medications.split(',').map((medication, index) => (
                        <span key={index} className="medical-tag medication">
                          <FaPills className="tag-icon" />
                          {medication.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="info-section">
              <h3>
                <FaClipboardList className="section-icon" />
                Patient Status
                <span className="section-badge">Status Details</span>
              </h3>
              <div className="info-grid">
                <div className="info-item">
                  <label>
                    <FaUserCheck className="field-icon" />
                    Current Status:
                  </label>
                  {isEditing ? (
                    <select 
                      value={patientInfo.status} 
                      onChange={(e) => handleInfoChange('status', e.target.value)}
                      className="info-select"
                    >
                      <option value="active">Active</option>
                      <option value="discharged">Discharged</option>
                      <option value="on-hold">On Hold</option>
                      <option value="evaluation">Evaluation</option>
                    </select>
                  ) : (
                    <span className={`status-badge ${patientInfo.status}`}>
                      {getStatusIcon(patientInfo.status)}
                      {patientInfo.status.charAt(0).toUpperCase() + patientInfo.status.slice(1)}
                    </span>
                  )}
                </div>
                <div className="info-item">
                  <label>
                    <FaCalendarAlt className="field-icon" />
                    Admission Date:
                  </label>
                  {isEditing ? (
                    <input 
                      type="date" 
                      value={patientInfo.admissionDate} 
                      onChange={(e) => handleInfoChange('admissionDate', e.target.value)}
                      className="info-input"
                    />
                  ) : (
                    <span>{formatDate(patientInfo.admissionDate)}</span>
                  )}
                </div>
                <div className="info-item">
                  <label>
                    <FaCalendarAlt className="field-icon" />
                    Discharge Date:
                  </label>
                  {isEditing ? (
                    <input 
                      type="date" 
                      value={patientInfo.dischargeDate} 
                      onChange={(e) => handleInfoChange('dischargeDate', e.target.value)}
                      className="info-input"
                    />
                  ) : (
                    <span>{patientInfo.dischargeDate ? formatDate(patientInfo.dischargeDate) : 'N/A'}</span>
                  )}
                </div>
                <div className="info-item">
                  <label>
                    <FaUserMd className="field-icon" />
                    Primary Physician:
                  </label>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={patientInfo.primaryPhysician} 
                      onChange={(e) => handleInfoChange('primaryPhysician', e.target.value)}
                      className="info-input"
                      placeholder="Enter primary physician"
                    />
                  ) : (
                    <span>{patientInfo.primaryPhysician}</span>
                  )}
                </div>
                <div className="info-item">
                  <label>
                    <FaUserMd className="field-icon" />
                    Specialist:
                  </label>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={patientInfo.specialist} 
                      onChange={(e) => handleInfoChange('specialist', e.target.value)}
                      className="info-input"
                      placeholder="Enter specialist"
                    />
                  ) : (
                    <span>{patientInfo.specialist}</span>
                  )}
                </div>
                <div className="info-item">
                  <label>
                    <FaHospital className="field-icon" />
                    HHAH:
                  </label>
                  {isEditing ? (
                    <select 
                      value={patientInfo.hhah} 
                      onChange={(e) => handleInfoChange('hhah', e.target.value)}
                      className="info-select"
                    >
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  ) : (
                    <span>{patientInfo.hhah}</span>
                  )}
                </div>
                <div className="info-item">
                  <label>
                    <FaBuilding className="field-icon" />
                    PG Name:
                  </label>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={patientInfo.pg} 
                      onChange={(e) => handleInfoChange('pg', e.target.value)}
                      className="info-input"
                      placeholder="Enter PG name"
                    />
                  ) : (
                    <span>{patientInfo.pg}</span>
                  )}
                </div>
                <div className="info-item">
                  <label>
                    <FaInfoCircle className="field-icon" />
                    Status Message:
                  </label>
                  <span>{getStatusMessage(patientInfo.status)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Patient Timeline Tab */}
      {activeTab === 'timeline' && (
        <div className="tab-content animate-fade-in">
          <div className="timeline-container">
            <div className="timeline-header">
              <h3>
                <FaHistory className="section-icon" />
                Patient Timeline
                <span className="section-badge">Event History</span>
              </h3>
              
              <div className="timeline-filters">
                <div className="timeline-period-selector">
                  <span className="period-label">View period:</span>
                  <div className="period-options">
                    <button 
                      className={`period-option ${timelinePeriod === 'all' ? 'active' : ''}`}
                      onClick={() => setTimelinePeriod('all')}
                    >
                      All Time
                    </button>
                    <button 
                      className={`period-option ${timelinePeriod === 'month' ? 'active' : ''}`}
                      onClick={() => setTimelinePeriod('month')}
                    >
                      Last Month
                    </button>
                    <button 
                      className={`period-option ${timelinePeriod === 'week' ? 'active' : ''}`}
                      onClick={() => setTimelinePeriod('week')}
                    >
                      Last Week
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="timeline-content-container">
              <div className="timeline-sidebar">
                <div className="timeline-summary">
                  <h4>Timeline Summary</h4>
                  <div className="timeline-stats">
                    <div className="timeline-stat">
                      <div className="stat-icon admission">
                        <FaHospital />
                      </div>
                      <div className="stat-content">
                        <div className="stat-value">1</div>
                        <div className="stat-label">Admission</div>
                      </div>
                    </div>
                    
                    <div className="timeline-stat">
                      <div className="stat-icon evaluation">
                        <FaClipboardCheck />
                      </div>
                      <div className="stat-content">
                        <div className="stat-value">2</div>
                        <div className="stat-label">Evaluations</div>
                      </div>
                    </div>
                    
                    <div className="timeline-stat">
                      <div className="stat-icon document">
                        <FaFileAlt />
                      </div>
                      <div className="stat-content">
                        <div className="stat-value">2</div>
                        <div className="stat-label">Documents</div>
                      </div>
                    </div>
                    
                    <div className="timeline-stat">
                      <div className="stat-icon treatment">
                        <FaStethoscope />
                      </div>
                      <div className="stat-content">
                        <div className="stat-value">1</div>
                        <div className="stat-label">Treatments</div>
                      </div>
                    </div>
                    
                    <div className="timeline-stat">
                      <div className="stat-icon status">
                        <FaUserCheck />
                      </div>
                      <div className="stat-content">
                        <div className="stat-value">1</div>
                        <div className="stat-label">Status Updates</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="timeline-event-filters">
                  <h4>Filter Events</h4>
                  <div className="event-filter-options">
                    <label className="event-filter">
                      <input 
                        type="checkbox" 
                        checked={true}
                        onChange={() => {}}
                      />
                      <div className="filter-color admission"></div>
                      <span>Admissions</span>
                    </label>
                    
                    <label className="event-filter">
                      <input 
                        type="checkbox" 
                        checked={true}
                        onChange={() => {}}
                      />
                      <div className="filter-color evaluation"></div>
                      <span>Evaluations</span>
                    </label>
                    
                    <label className="event-filter">
                      <input 
                        type="checkbox" 
                        checked={true}
                        onChange={() => {}}
                      />
                      <div className="filter-color document"></div>
                      <span>Documents</span>
                    </label>
                    
                    <label className="event-filter">
                      <input 
                        type="checkbox" 
                        checked={true}
                        onChange={() => {}}
                      />
                      <div className="filter-color treatment"></div>
                      <span>Treatments</span>
                    </label>
                    
                    <label className="event-filter">
                      <input 
                        type="checkbox" 
                        checked={true}
                        onChange={() => {}}
                      />
                      <div className="filter-color status"></div>
                      <span>Status Updates</span>
                    </label>
                  </div>
                </div>
                
                <div className="timeline-actions">
                  <button className="action-button primary">
                    <span className="icon-wrapper"><FaFileAlt /></span>
                    Export Timeline
                  </button>
                  <button className="action-button secondary">
                    <span className="icon-wrapper"><FaPrint /></span>
                    Print Timeline
                  </button>
                </div>
              </div>
              
              <div className="timeline-events">
                <div className="timeline-year">
                  <div className="year-label">2023</div>
                  <div className="year-events">
                    <div className="timeline-month">
                      <div className="month-label">April</div>
                      <div className="month-events">
                        <div className="timeline-event admission">
                          <div className="event-date">
                            <span className="date-number">1</span>
                            <span className="date-month">Apr</span>
                          </div>
                          <div className="event-content">
                            <div className="event-icon">
                              <FaHospital />
                            </div>
                            <div className="event-details">
                              <h5 className="event-title">Patient Admitted</h5>
                              <p className="event-description">Initial admission to care program</p>
                              <div className="event-meta">
                                <span className="event-provider">
                                  <FaUserMd className="meta-icon" />
                                  Dr. Sarah Johnson
                                </span>
                                <span className="event-location">
                                  <FaHospital className="meta-icon" />
                                  General Ward
                                </span>
                              </div>
                              <div className="event-tags">
                                <span className="event-tag">Admission</span>
                                <span className="event-tag">Initial Assessment</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="timeline-event evaluation">
                          <div className="event-date">
                            <span className="date-number">3</span>
                            <span className="date-month">Apr</span>
                          </div>
                          <div className="event-content">
                            <div className="event-icon">
                              <FaClipboardCheck />
                            </div>
                            <div className="event-details">
                              <h5 className="event-title">Initial Evaluation</h5>
                              <p className="event-description">Full physical evaluation completed</p>
                              <div className="event-meta">
                                <span className="event-provider">
                                  <FaUserMd className="meta-icon" />
                                  Dr. Robert Chen
                                </span>
                              </div>
                              <div className="event-tags">
                                <span className="event-tag">Evaluation</span>
                                <span className="event-tag">Completed</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="timeline-month">
                      <div className="month-label">May</div>
                      <div className="month-events">
                        <div className="timeline-event document">
                          <div className="event-date">
                            <span className="date-number">5</span>
                            <span className="date-month">May</span>
                          </div>
                          <div className="event-content">
                            <div className="event-icon">
                              <FaFileAlt />
                            </div>
                            <div className="event-details">
                              <h5 className="event-title">Care Plan Created</h5>
                              <p className="event-description">Initial care plan documented and approved</p>
                              <div className="event-meta">
                                <span className="event-provider">
                                  <FaUserMd className="meta-icon" />
                                  Care Team
                                </span>
                              </div>
                              <div className="event-tags">
                                <span className="event-tag">Care Plan</span>
                                <span className="event-tag">Documentation</span>
                              </div>
                              <button className="event-action">
                                <FaEye className="action-icon" />
                                View Document
                              </button>
                            </div>
                          </div>
                        </div>
                        
                        <div className="timeline-event treatment">
                          <div className="event-date">
                            <span className="date-number">7</span>
                            <span className="date-month">May</span>
                          </div>
                          <div className="event-content">
                            <div className="event-icon">
                              <FaStethoscope />
                            </div>
                            <div className="event-details">
                              <h5 className="event-title">Treatment Started</h5>
                              <p className="event-description">Treatment regimen initiated</p>
                              <div className="event-meta">
                                <span className="event-provider">
                                  <FaUserMd className="meta-icon" />
                                  Dr. Sarah Johnson
                                </span>
                              </div>
                              <div className="event-tags">
                                <span className="event-tag">Treatment</span>
                                <span className="event-tag">Medication</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="timeline-year">
                  <div className="year-label">2025</div>
                  <div className="year-events">
                    <div className="timeline-month">
                      <div className="month-label">February</div>
                      <div className="month-events">
                        <div className="timeline-event evaluation">
                          <div className="event-date">
                            <span className="date-number">27</span>
                            <span className="date-month">Feb</span>
                          </div>
                          <div className="event-content">
                            <div className="event-icon">
                              <FaClipboardCheck />
                            </div>
                            <div className="event-details">
                              <h5 className="event-title">Follow-up Evaluation</h5>
                              <p className="event-description">Regular follow-up evaluation</p>
                              <div className="event-meta">
                                <span className="event-provider">
                                  <FaUserMd className="meta-icon" />
                                  Dr. Robert Chen
                                </span>
                              </div>
                              <div className="event-tags">
                                <span className="event-tag">Evaluation</span>
                                <span className="event-tag">Follow-up</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="timeline-month">
                      <div className="month-label">March</div>
                      <div className="month-events">
                        <div className="timeline-event status">
                          <div className="event-date">
                            <span className="date-number">2</span>
                            <span className="date-month">Mar</span>
                          </div>
                          <div className="event-content">
                            <div className="event-icon">
                              <FaUserCheck />
                            </div>
                            <div className="event-details">
                              <h5 className="event-title">Status Updated to Active</h5>
                              <p className="event-description">Treatment plan approved and initiated</p>
                              <div className="event-meta">
                                <span className="event-provider">
                                  <FaUserMd className="meta-icon" />
                                  Dr. Sarah Johnson
                                </span>
                              </div>
                              <div className="event-tags">
                                <span className="event-tag status-active">Active</span>
                                <span className="event-tag">Status Change</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="timeline-event document">
                          <div className="event-date">
                            <span className="date-number">27</span>
                            <span className="date-month">Mar</span>
                          </div>
                          <div className="event-content">
                            <div className="event-icon">
                              <FaFileAlt />
                            </div>
                            <div className="event-details">
                              <h5 className="event-title">Progress Report Filed</h5>
                              <p className="event-description">Monthly progress report completed</p>
                              <div className="event-meta">
                                <span className="event-provider">
                                  <FaUserMd className="meta-icon" />
                                  Care Team
                                </span>
                              </div>
                              <div className="event-tags">
                                <span className="event-tag">Progress Report</span>
                                <span className="event-tag">Documentation</span>
                              </div>
                              <button className="event-action">
                                <FaEye className="action-icon" />
                                View Document
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Documents Tab */}
      {activeTab === 'documents' && (
        <div className="tab-content animate-fade-in">
          <div className="document-section">
            <div className="document-header">
              <h3>
                <FaFileAlt className="section-icon" />
                Patient Documents
                <span className="section-badge">
                  {documentCounts.total} Documents
                </span>
              </h3>
              
              <div className="document-actions">
                <div className="search-box">
                  <FaSearch className="search-icon" />
                  <input 
                    type="text" 
                    placeholder="Search documents..."
                    className="search-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <button 
                  className="action-button filter"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <span className="icon-wrapper">
                    <FaFilter className="action-icon" />
                  </span>
                  Filters {fileTypes.length > 0 || dateRange.from ? `(${fileTypes.length + (dateRange.from ? 1 : 0)})` : ''}
                </button>
                
                <button 
                  className="action-button primary upload-button"
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                >
                  <span className="icon-wrapper">
                    <FaFileUpload className="action-icon" />
                  </span>
                  Upload Documents
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  className="hidden-file-input"
                  onChange={handleFileInputChange}
                  multiple
                />
              </div>
            </div>
            
            {showFilters && (
              <div className="document-filters">
                <div className="filter-section">
                  <h4 className="filter-heading">Document Status</h4>
                  <div className="filter-options">
                    <label className="filter-option">
                      <input 
                        type="radio" 
                        name="status-filter" 
                        value="all" 
                        checked={statusFilter === 'all'}
                        onChange={() => setStatusFilter('all')}
                      />
                      <span className="filter-text">All</span>
                    </label>
                    <label className="filter-option">
                      <input 
                        type="radio" 
                        name="status-filter" 
                        value="new" 
                        checked={statusFilter === 'new'}
                        onChange={() => setStatusFilter('new')}
                      />
                      <span className="filter-text">New</span>
                    </label>
                    <label className="filter-option">
                      <input 
                        type="radio" 
                        name="status-filter" 
                        value="prepared" 
                        checked={statusFilter === 'prepared'}
                        onChange={() => setStatusFilter('prepared')}
                      />
                      <span className="filter-text">Prepared</span>
                    </label>
                  </div>
                </div>
                
                <div className="filter-section">
                  <h4 className="filter-heading">File Type</h4>
                  <div className="filter-options">
                    <label className="filter-option">
                      <input 
                        type="checkbox" 
                        checked={fileTypes.includes('pdf')}
                        onChange={() => handleFileTypeFilter('pdf')}
                      />
                      <FaFilePdf className="filter-icon pdf" />
                      <span className="filter-text">PDF</span>
                    </label>
                    <label className="filter-option">
                      <input 
                        type="checkbox" 
                        checked={fileTypes.includes('doc') || fileTypes.includes('docx')}
                        onChange={() => {
                          handleFileTypeFilter('doc');
                          handleFileTypeFilter('docx');
                        }}
                      />
                      <FaFileWord className="filter-icon word" />
                      <span className="filter-text">Word</span>
                    </label>
                    <label className="filter-option">
                      <input 
                        type="checkbox" 
                        checked={fileTypes.includes('xls') || fileTypes.includes('xlsx')}
                        onChange={() => {
                          handleFileTypeFilter('xls');
                          handleFileTypeFilter('xlsx');
                        }}
                      />
                      <FaFileExcel className="filter-icon excel" />
                      <span className="filter-text">Excel</span>
                    </label>
                    <label className="filter-option">
                      <input 
                        type="checkbox" 
                        checked={
                          fileTypes.includes('jpg') || 
                          fileTypes.includes('jpeg') || 
                          fileTypes.includes('png') || 
                          fileTypes.includes('gif')
                        }
                        onChange={() => {
                          handleFileTypeFilter('jpg');
                          handleFileTypeFilter('jpeg');
                          handleFileTypeFilter('png');
                          handleFileTypeFilter('gif');
                        }}
                      />
                      <FaFileImage className="filter-icon image" />
                      <span className="filter-text">Images</span>
                    </label>
                  </div>
                </div>
                
                <div className="filter-section">
                  <h4 className="filter-heading">Date Range</h4>
                  <div className="date-range">
                    <div className="date-input-group">
                      <label className="date-label">From:</label>
                      <input 
                        type="date" 
                        className="date-input"
                        value={dateRange.from}
                        onChange={(e) => setDateRange({...dateRange, from: e.target.value})}
                      />
                    </div>
                    <div className="date-input-group">
                      <label className="date-label">To:</label>
                      <input 
                        type="date" 
                        className="date-input"
                        value={dateRange.to}
                        onChange={(e) => setDateRange({...dateRange, to: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="filter-actions">
                  <button 
                    className="filter-button reset"
                    onClick={resetFilters}
                  >
                    <FaTimes className="button-icon" />
                    Reset Filters
                  </button>
                  <button 
                    className="filter-button apply"
                    onClick={() => setShowFilters(false)}
                  >
                    <FaCheck className="button-icon" />
                    Apply Filters
                  </button>
                </div>
              </div>
            )}

            <div className="document-tabs-container">
              <div className="document-tabs">
                <button 
                  className={`doc-tab-button ${activeDocumentTab === 'newPrepared' ? 'active' : ''}`}
                  onClick={() => setActiveDocumentTab('newPrepared')}
                >
                  <span className="tab-label">New & Prepared</span>
                  <span className="tab-count">{documentCounts.new + documentCounts.prepared}</span>
                </button>
                <button 
                  className={`doc-tab-button ${activeDocumentTab === 'signed' ? 'active' : ''}`}
                  onClick={() => setActiveDocumentTab('signed')}
                >
                  <span className="tab-label">Signed Documents</span>
                  <span className="tab-count">{documentCounts.signed}</span>
                </button>
              </div>

              <div className="document-sort-container">
                <span className="sort-label">Sort by:</span>
                <div className="sort-buttons">
                  <button 
                    className={`sort-button ${sortField === 'receivedDate' ? 'active' : ''}`}
                    onClick={() => toggleSort('receivedDate')}
                  >
                    Date {sortField === 'receivedDate' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </button>
                  <button 
                    className={`sort-button ${sortField === 'type' ? 'active' : ''}`}
                    onClick={() => toggleSort('type')}
                  >
                    Type {sortField === 'type' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </button>
                  <button 
                    className={`sort-button ${sortField === 'fileName' ? 'active' : ''}`}
                    onClick={() => toggleSort('fileName')}
                  >
                    Filename {sortField === 'fileName' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </button>
                </div>
              </div>
            </div>
            
            <div className="document-table-container">
              {activeDocumentTab === 'newPrepared' ? (
                filteredNewPreparedDocs.length === 0 ? (
                  <div className="empty-state">
                    <FaFileAlt className="empty-icon" />
                    <h4>No Documents Found</h4>
                    <p>There are no new or prepared documents matching your current filters.</p>
                    <button 
                      className="action-button secondary"
                      onClick={resetFilters}
                    >
                      Reset Filters
                    </button>
                  </div>
                ) : (
                  <table className="document-table">
                    <thead>
                      <tr>
                        <th>Document Type</th>
                        <th>Document ID</th>
                        <th>File Name</th>
                        <th>Date Received</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredNewPreparedDocs.map(doc => (
                        <tr key={doc.id} className={`status-${doc.status.toLowerCase()}`}>
                          <td>
                            <div className="select-wrapper">
                              <FaFileAlt className="select-icon" />
                              <select 
                                value={doc.type} 
                                onChange={(e) => updateDocType(doc.id, e.target.value)}
                                className="doc-type-select"
                              >
                                <option value="">Select Type</option>
                                {documentTypes.map(type => (
                                  <option key={type} value={type}>{type}</option>
                                ))}
                              </select>
                            </div>
                          </td>
                          <td>
                            <div className="cell-with-icon">
                              <FaHashtag className="cell-icon" />
                              {doc.id}
                            </div>
                          </td>
                          <td>
                            <div className="cell-with-icon">
                              {getFileIconByName(doc.fileName)}
                              <span 
                                className="file-name" 
                                onClick={() => openDocumentViewer(doc)} 
                                style={{ cursor: 'pointer' }}
                              >
                                {doc.fileName || 'Document File'}
                              </span>
                            </div>
                          </td>
                          <td>
                            <div className="cell-with-icon">
                              <FaCalendar className="cell-icon" />
                              {formatDate(doc.receivedDate)}
                            </div>
                          </td>
                          <td>
                            <button 
                              className={`status-toggle-button ${doc.status.toLowerCase()}`}
                              onClick={() => toggleDocPrepared(doc.id)}
                              title={doc.status === 'New' ? 'Mark as Prepared' : 'Mark as New'}
                            >
                              {doc.status === 'New' ? (
                                <>
                                  <FaCheckCircle className="toggle-icon" />
                                  New
                                </>
                              ) : (
                                <>
                                  <FaClipboardCheck className="toggle-icon" />
                                  Prepared
                                </>
                              )}
                            </button>
                          </td>
                          <td>
                            <div className="actions-cell">
                              <button 
                                className="action-icon-button"
                                title="View Document"
                                onClick={() => openDocumentViewer(doc)}
                              >
                                <FaEye />
                              </button>
                              <button 
                                className="action-icon-button" 
                                title="Download Document"
                              >
                                <FaDownload />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )
              ) : (
                filteredSignedDocs.length === 0 ? (
                  <div className="empty-state">
                    <FaFileSignature className="empty-icon" />
                    <h4>No Signed Documents</h4>
                    <p>There are no signed documents matching your current filters.</p>
                    <button 
                      className="action-button secondary"
                      onClick={resetFilters}
                    >
                      Reset Filters
                    </button>
                  </div>
                ) : (
                  <table className="document-table">
                    <thead>
                      <tr>
                        <th>Document Type</th>
                        <th>Document ID</th>
                        <th>File Name</th>
                        <th>Date Signed</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSignedDocs.map(doc => (
                        <tr key={doc.id} className="status-signed">
                          <td>
                            <div className="cell-with-icon">
                              <FaFileAlt className="cell-icon" />
                              {doc.type}
                            </div>
                          </td>
                          <td>
                            <div className="cell-with-icon">
                              <FaHashtag className="cell-icon" />
                              {doc.id}
                            </div>
                          </td>
                          <td>
                            <div className="cell-with-icon">
                              {getFileIconByName(doc.fileName)}
                              <span 
                                className="file-name" 
                                onClick={() => openDocumentViewer(doc)} 
                                style={{ cursor: 'pointer' }}
                              >
                                {doc.fileName || 'Document File'}
                              </span>
                            </div>
                          </td>
                          <td>
                            <div className="cell-with-icon">
                              <FaCalendar className="cell-icon" />
                              {formatDate(doc.signedDate)}
                            </div>
                          </td>
                          <td>
                            <div className="actions-cell">
                              <button 
                                className="action-icon-button"
                                title="View Document"
                                onClick={() => openDocumentViewer(doc)}
                              >
                                <FaEye />
                              </button>
                              <button 
                                className="action-icon-button" 
                                title="Download Document"
                              >
                                <FaDownload />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )
              )}
            </div>
            
            <div 
              className={`document-drop-zone ${isDropActive ? 'active' : ''}`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <div className="drop-zone-content">
                <FaUpload className="drop-icon" />
                <h4 className="drop-title">Drop files here to upload</h4>
                <p className="drop-description">or click the Upload button above</p>
              </div>
            </div>
            
            <div className="document-footer">
              <div className="document-stats">
                <div className="stat-item">
                  <span className="stat-label">Total Documents:</span>
                  <span className="stat-value">{documentCounts.total}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">New:</span>
                  <span className="stat-value">{documentCounts.new}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Prepared:</span>
                  <span className="stat-value">{documentCounts.prepared}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Signed:</span>
                  <span className="stat-value">{documentCounts.signed}</span>
                </div>
              </div>
              
              <div className="document-batch-actions">
                <button 
                  className="action-button secondary"
                  onClick={exportDocuments}
                >
                  <span className="icon-wrapper">
                    <FaDownload className="action-icon" />
                  </span>
                  Export Documents
                </button>
                <button 
                  className="action-button primary"
                  onClick={generateDocumentReport}
                >
                  <span className="icon-wrapper">
                    <FaFileAlt className="action-icon" />
                  </span>
                  Generate Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* CPO Allocation Tab */}
      {activeTab === 'cpo' && (
        <div className="tab-content animate-fade-in">
          <div className="cpo-container">
            <div className="cpo-header">
              <div className="cpo-title">
                <FaFileMedicalAlt className="section-icon" />
                <h3>CPO Allocation</h3>
              </div>
              
              <button className="action-button primary add-cpo-btn">
                <span className="icon-wrapper"><FaPlus /></span>
                Add CPO Document
              </button>
            </div>
            
            <div className="cpo-content">
              <div className="cpo-summary-card">
                <div className="card-header">
                  <FaClock className="header-icon" />
                  <h4>CPO Summary</h4>
                </div>
                
                <div className="summary-content">
                  <div className="summary-item">
                    <div className="summary-label">Total CPO Minutes</div>
                    <div className="summary-value">{calculateCPOMinutes()}</div>
                  </div>
                  
                  <div className="summary-item">
                    <div className="summary-label">Documents Created</div>
                    <div className="summary-value">{patient?.newCPODocsCreated || '15'}</div>
                  </div>
                  
                  <div className="summary-item">
                    <div className="summary-label">Next Review</div>
                    <div className="summary-value">{getNextReviewDate()}</div>
                  </div>
                </div>
              </div>
              
              <div className="cpo-documents-card">
                <div className="card-header">
                  <FaFileAlt className="header-icon" />
                  <h4>CPO Documents</h4>
                </div>
                
                <div className="documents-table-container">
                  <table className="documents-table">
                    <thead>
                      <tr>
                        <th>Document Name</th>
                        <th>Creation Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          <div className="document-name">
                            <FaFilePdf className="file-icon pdf" />
                            <span>CPO_Document_001.pdf</span>
                          </div>
                        </td>
                        <td>
                          <div className="date-display">
                            <FaCalendar className="date-icon" />
                            <span>Apr 5, 2023</span>
                          </div>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="action-icon-button"
                              onClick={() => openDocumentViewer(cpoDocs[0])}
                              title="View Document"
                            >
                              <FaEye />
                            </button>
                            <button className="action-icon-button" title="Download Document">
                              <FaDownload />
                            </button>
                            <button className="action-icon-button" title="Edit Document">
                              <FaEdit />
                            </button>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <div className="document-name">
                            <FaFilePdf className="file-icon pdf" />
                            <span>CPO_Document_002.pdf</span>
                          </div>
                        </td>
                        <td>
                          <div className="date-display">
                            <FaCalendar className="date-icon" />
                            <span>May 10, 2023</span>
                          </div>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="action-icon-button"
                              onClick={() => openDocumentViewer(cpoDocs[1])}
                              title="View Document"
                            >
                              <FaEye />
                            </button>
                            <button className="action-icon-button" title="Download Document">
                              <FaDownload />
                            </button>
                            <button className="action-icon-button" title="Edit Document">
                              <FaEdit />
                            </button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <div className="documents-footer">
                  <div className="document-count">
                    Total Documents: <span className="count">4</span>
                  </div>
                  <button className="action-button secondary">
                    <span className="icon-wrapper"><FaDownload /></span>
                    Export CPO Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Notification component */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          <div className="notification-icon">
            {notification.type === 'success' && <FaCheckCircle />}
            {notification.type === 'warning' && <FaExclamationTriangle />}
            {notification.type === 'error' && <FaTimesCircle />}
          </div>
          <div className="notification-content">
            <div className="notification-title">{notification.title}</div>
            <div className="notification-message">{notification.message}</div>
          </div>
          <button className="notification-close" onClick={closeNotification}>
            <FaTimes />
          </button>
        </div>
      )}
      
      {/* Progress indicator */}
      {isUploading && (
        <div className="progress-overlay">
          <div className="progress-indicator">
            <FaSpinner className="progress-spinner" />
            <span>Uploading documents...</span>
          </div>
        </div>
      )}

      {/* Document Viewer Modal */}
      {viewerOpen && selectedDocument && (
        <div className="document-viewer-overlay">
          <div className="document-viewer-container">
            <div className="document-viewer-header">
              <div className="document-viewer-info">
                <h3>
                  <FaFileAlt className="section-icon" />
                  {selectedDocument.fileName}
                </h3>
                <div className="document-meta">
                  <span className="document-meta-item">
                    <FaHashtag className="meta-icon" />
                    {selectedDocument.id}
                  </span>
                  <span className="document-meta-item">
                    <FaFileAlt className="meta-icon" />
                    Type: {selectedDocument.type || "Not specified"}
                  </span>
                  {selectedDocument.status && (
                    <span className={`status-pill ${selectedDocument.status.toLowerCase()}`}>
                      {selectedDocument.status}
                    </span>
                  )}
                </div>
              </div>
              <div className="document-viewer-actions">
                {selectedDocument.status === 'New' && (
                  <button 
                    className="action-button primary"
                    onClick={() => markAsPrepared(selectedDocument.id)}
                  >
                    <FaCheck className="action-icon" />
                    Mark as Prepared
                  </button>
                )}
                {selectedDocument.status === 'Prepared' && (
                  <button 
                    className="action-button secondary"
                    onClick={() => markAsUnprepared(selectedDocument.id)}
                  >
                    <FaTimes className="action-icon" />
                    Mark as Unprepared
                  </button>
                )}
                <button 
                  className="action-button secondary"
                  onClick={closeDocumentViewer}
                >
                  <FaTimes className="action-icon" />
                  Close
                </button>
              </div>
            </div>
            <div className="document-viewer-content">
              {selectedDocument.fileName && selectedDocument.fileName.endsWith('pdf') ? (
                <div className="pdf-preview">
                  <div className="pdf-page">
                    <div className="pdf-header">
                      <img src="https://via.placeholder.com/150x60" alt="Company Logo" className="pdf-logo" />
                      <div className="pdf-title">
                        <h2>{selectedDocument.type || 'Patient Document'}</h2>
                        <p>Document ID: {selectedDocument.id}</p>
                      </div>
                    </div>
                    <div className="pdf-body">
                      <div className="pdf-section">
                        <h3>Patient Information</h3>
                        <div className="pdf-info-grid">
                          <div className="pdf-info-item">
                            <label>Patient Name:</label>
                            <span>{patientInfo.name}</span>
                          </div>
                          <div className="pdf-info-item">
                            <label>Patient ID:</label>
                            <span>{patientInfo.id}</span>
                          </div>
                          <div className="pdf-info-item">
                            <label>Date of Birth:</label>
                            <span>{formatDate(patientInfo.dob)}</span>
                          </div>
                          <div className="pdf-info-item">
                            <label>Gender:</label>
                            <span>{patientInfo.gender}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="pdf-section">
                        <h3>Document Details</h3>
                        <p>
                          {selectedDocument.type === 'Evaluation' && 'This evaluation document contains the assessment findings for the patient. The patient was evaluated for various symptoms and conditions as described below.'}
                          {selectedDocument.type === 'Re-evaluation' && 'This re-evaluation document contains updated assessment findings for the patient. The patient was re-evaluated for progress and current status as detailed below.'}
                          {selectedDocument.type === 'Position Order' && 'This position order document contains specific instructions for patient positioning and physical therapy regimen as prescribed by the physician.'}
                          {!selectedDocument.type && 'This document contains important patient information and healthcare details. Please review the contents carefully.'}
                        </p>
                        
                        <div className="pdf-table">
                          <div className="pdf-table-row pdf-table-header">
                            <div className="pdf-table-cell">Date</div>
                            <div className="pdf-table-cell">Provider</div>
                            <div className="pdf-table-cell">Notes</div>
                          </div>
                          <div className="pdf-table-row">
                            <div className="pdf-table-cell">{formatDate(selectedDocument.receivedDate || selectedDocument.signedDate)}</div>
                            <div className="pdf-table-cell">{selectedDocument.uploadedBy || selectedDocument.signedBy || 'Dr. Johnson'}</div>
                            <div className="pdf-table-cell">Initial document created and reviewed</div>
                          </div>
                          <div className="pdf-table-row">
                            <div className="pdf-table-cell">{formatDate(new Date())}</div>
                            <div className="pdf-table-cell">System</div>
                            <div className="pdf-table-cell">Document viewed in patient portal</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="pdf-section">
                        <h3>Summary & Recommendations</h3>
                        <p>Patient demonstrates good progress with the current treatment regimen. Continue with prescribed therapy and medication as directed. Follow-up appointment recommended in 2 weeks.</p>
                        
                        <div className="pdf-signature-block">
                          <div className="pdf-signature">
                            {selectedDocument.signedBy ? (
                              <>
                                <img src="https://via.placeholder.com/200x60?text=Digital+Signature" alt="Digital Signature" />
                                <p>{selectedDocument.signedBy}</p>
                                <p>Signed: {formatDate(selectedDocument.signedDate)}</p>
                              </>
                            ) : (
                              <p>This document requires signature by an authorized provider.</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pdf-footer">
                      <p>Document {selectedDocument.id} • Page 1 of 1 • Generated on {formatDate(new Date())}</p>
                    </div>
                  </div>
                </div>
              ) : selectedDocument.fileName && selectedDocument.fileName.endsWith('docx') ? (
                <div className="doc-preview">
                  <div className="word-doc">
                    <div className="word-page">
                      <div className="word-header">
                        <h2>Position Order Document</h2>
                        <p>Patient: {patientInfo.name} | ID: {patientInfo.id}</p>
                      </div>
                      
                      <div className="word-body">
                        <h3>STANDING PHYSICIAN ORDER</h3>
                        <p>The following treatments and positioning protocols have been ordered for {patientInfo.name}:</p>
                        
                        <ul className="word-list">
                          <li>Physical therapy sessions: 3 times per week</li>
                          <li>Range of motion exercises: daily</li>
                          <li>Position changes: every 2 hours when in bed</li>
                          <li>Allowed weight bearing: as tolerated with assistance</li>
                          <li>Assistive devices: walker required for ambulation</li>
                        </ul>
                        
                        <p><strong>Special Instructions:</strong> Monitor vital signs before and after physical activity. Discontinue exercise if patient shows signs of distress.</p>
                        
                        <div className="word-signature-block">
                          <p>Ordered by: Dr. {selectedDocument.signedBy || 'Chen'}</p>
                          <p>Date: {formatDate(selectedDocument.signedDate || new Date())}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="no-preview">
                  <FaFileAlt className="no-preview-icon" />
                  <p>Preview not available for this file type</p>
                  <p className="no-preview-filename">{selectedDocument.fileName}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(PatientDetailView); 