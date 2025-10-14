import React, { useState, useEffect } from 'react';
import { MapPin, Layers, Activity, AlertCircle, CheckCircle, Clock, Home, Building2, Droplet, Stethoscope, GraduationCap, Sprout, Shield, Search, Filter, Download, Users, TrendingUp, Navigation, ZoomIn, ZoomOut, Maximize2, X, Info, ExternalLink } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons for different statuses
const createCustomIcon = (color) => {
  return new L.DivIcon({
    html: `
      <div style="
        background-color: ${color};
        width: 24px;
        height: 24px;
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        position: relative;
      ">
        <div style="
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background-color: ${color};
          animation: pulse 2s infinite;
        "></div>
      </div>
      <style>
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          70% { transform: scale(2.5); opacity: 0; }
          100% { transform: scale(2.5); opacity: 0; }
        }
      </style>
    `,
    className: 'custom-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

// Component to handle map view changes
const MapController = ({ center, zoom, selectedProject }) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);

  useEffect(() => {
    if (selectedProject) {
      map.setView([selectedProject.lat, selectedProject.lng], 14);
    }
  }, [selectedProject, map]);

  return null;
};

const KaryamitraGIS = () => {
  const [activePage, setActivePage] = useState('overview');
  const [selectedDept, setSelectedDept] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [mapCenter, setMapCenter] = useState([12.9716, 77.5946]);
  const [mapZoom, setMapZoom] = useState(11);
  const [projects, setProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [recentActions, setRecentActions] = useState([]);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Show notification
  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Add to recent actions
  const addRecentAction = (action) => {
    setRecentActions(prev => [{
      id: Date.now(),
      action,
      timestamp: new Date().toLocaleTimeString()
    }, ...prev.slice(0, 5)]);
  };

  // Sample project data with GIS coordinates
  const projectData = {
    pwd: [
      { 
        id: 1, 
        name: 'NH-48 Highway Upgrade', 
        lat: 12.9716, 
        lng: 77.5946, 
        status: 'completed', 
        progress: 100,
        budget: '₹245 Cr',
        startDate: '2023-01-15',
        endDate: '2024-03-20',
        officer: 'Rajesh Kumar, Executive Engineer',
        description: 'Six-laning of National Highway 48 with smart traffic management system',
        department: 'pwd',
        lastUpdate: '2024-03-20',
        images: ['highway1.jpg', 'highway2.jpg']
      },
      { 
        id: 2, 
        name: 'Metro Line Extension', 
        lat: 13.0827, 
        lng: 77.5877, 
        status: 'progress', 
        progress: 65,
        budget: '₹1,200 Cr',
        startDate: '2023-06-01',
        endDate: '2024-12-15',
        officer: 'Priya Sharma, Project Director',
        description: 'Extension of metro line covering 12 new stations',
        department: 'pwd',
        lastUpdate: '2024-04-15',
        images: ['metro1.jpg', 'metro2.jpg']
      },
      { 
        id: 3, 
        name: 'Outer Ring Road Construction', 
        lat: 12.8698, 
        lng: 77.6501, 
        status: 'delayed', 
        progress: 35,
        budget: '₹890 Cr',
        startDate: '2023-03-10',
        endDate: '2024-08-30',
        officer: 'Anil Patel, Superintending Engineer',
        description: 'Construction of 45km outer ring road with 8 major junctions',
        department: 'pwd',
        lastUpdate: '2024-04-10',
        images: ['road1.jpg']
      },
      { 
        id: 10, 
        name: 'City Flyover Project', 
        lat: 12.9352, 
        lng: 77.5946, 
        status: 'progress', 
        progress: 48,
        budget: '₹420 Cr',
        startDate: '2023-05-20',
        endDate: '2024-10-30',
        officer: 'Karthik Iyer, Deputy Engineer',
        description: 'Multi-level flyover for traffic decongestion',
        department: 'pwd',
        lastUpdate: '2024-04-12',
        images: ['flyover1.jpg']
      }
    ],
    urban: [
      { 
        id: 4, 
        name: 'Smart City Phase 2', 
        lat: 12.9352, 
        lng: 77.6245, 
        status: 'progress', 
        progress: 78,
        budget: '₹650 Cr',
        startDate: '2023-02-20',
        endDate: '2024-06-30',
        officer: 'Meera Nair, Urban Planner',
        description: 'Implementation of smart infrastructure and digital governance systems',
        department: 'urban',
        lastUpdate: '2024-04-14',
        images: ['smartcity1.jpg']
      },
      { 
        id: 5, 
        name: 'Integrated Waste Management Hub', 
        lat: 13.0358, 
        lng: 77.5970, 
        status: 'completed', 
        progress: 100,
        budget: '₹320 Cr',
        startDate: '2022-11-05',
        endDate: '2024-01-15',
        officer: 'Sanjay Verma, Municipal Commissioner',
        description: 'Modern waste processing facility with recycling units',
        department: 'urban',
        lastUpdate: '2024-01-15',
        images: ['waste1.jpg', 'waste2.jpg']
      },
      { 
        id: 11, 
        name: 'Public Park Development', 
        lat: 12.9141, 
        lng: 77.5847, 
        status: 'progress', 
        progress: 55,
        budget: '₹180 Cr',
        startDate: '2023-07-10',
        endDate: '2024-11-20',
        officer: 'Lakshmi Devi, Parks Director',
        description: 'Development of 15 eco-friendly urban parks',
        department: 'urban',
        lastUpdate: '2024-04-11',
        images: ['park1.jpg']
      }
    ],
    water: [
      { 
        id: 6, 
        name: 'Kaveri Water Pipeline Project', 
        lat: 12.9141, 
        lng: 77.6411, 
        status: 'progress', 
        progress: 55,
        budget: '₹780 Cr',
        startDate: '2023-04-12',
        endDate: '2024-09-20',
        officer: 'Vikram Singh, Chief Engineer',
        description: 'Laying of 120km pipeline for enhanced water distribution',
        department: 'water',
        lastUpdate: '2024-04-13',
        images: ['pipeline1.jpg']
      },
      { 
        id: 7, 
        name: 'Hesaraghatta Reservoir Expansion', 
        lat: 13.1043, 
        lng: 77.5847, 
        status: 'delayed', 
        progress: 42,
        budget: '₹540 Cr',
        startDate: '2023-01-30',
        endDate: '2024-07-15',
        officer: 'Neha Reddy, Project Manager',
        description: 'Expansion of reservoir capacity by 40% with modern filtration',
        department: 'water',
        lastUpdate: '2024-04-09',
        images: ['reservoir1.jpg']
      },
      { 
        id: 12, 
        name: 'Storm Water Drain Network', 
        lat: 12.8449, 
        lng: 77.5970, 
        status: 'progress', 
        progress: 62,
        budget: '₹340 Cr',
        startDate: '2023-08-05',
        endDate: '2024-12-10',
        officer: 'Mohan Kumar, Technical Head',
        description: 'Construction of comprehensive storm water drainage system',
        department: 'water',
        lastUpdate: '2024-04-08',
        images: ['drain1.jpg']
      }
    ],
    health: [
      { 
        id: 8, 
        name: 'District Super Specialty Hospital', 
        lat: 12.9698, 
        lng: 77.7499, 
        status: 'completed', 
        progress: 100,
        budget: '₹950 Cr',
        startDate: '2022-08-10',
        endDate: '2024-02-28',
        officer: 'Dr. Arjun Mehta, Medical Superintendent',
        description: '500-bed super specialty hospital with advanced medical facilities',
        department: 'health',
        lastUpdate: '2024-02-28',
        images: ['hospital1.jpg', 'hospital2.jpg']
      },
      { 
        id: 9, 
        name: 'Primary Health Center Network', 
        lat: 12.8449, 
        lng: 77.6648, 
        status: 'progress', 
        progress: 70,
        budget: '₹280 Cr',
        startDate: '2023-03-25',
        endDate: '2024-05-10',
        officer: 'Dr. Sunita Rao, Health Director',
        description: 'Establishment of 25 primary health centers across rural areas',
        department: 'health',
        lastUpdate: '2024-04-07',
        images: ['phc1.jpg']
      },
      { 
        id: 13, 
        name: 'Telemedicine Infrastructure', 
        lat: 13.0358, 
        lng: 77.6411, 
        status: 'progress', 
        progress: 85,
        budget: '₹150 Cr',
        startDate: '2023-02-15',
        endDate: '2024-04-30',
        officer: 'Dr. Ramesh Babu, IT Health Director',
        description: 'Digital health infrastructure for remote consultations',
        department: 'health',
        lastUpdate: '2024-04-16',
        images: ['telemed1.jpg']
      }
    ]
  };

  const departments = [
    { id: 'pwd', name: 'Public Works Department', icon: Building2, color: '#1e40af', projects: projectData.pwd },
    { id: 'urban', name: 'Urban Development', icon: Home, color: '#7c3aed', projects: projectData.urban },
    { id: 'water', name: 'Water Resources', icon: Droplet, color: '#0891b2', projects: projectData.water },
    { id: 'health', name: 'Health Department', icon: Stethoscope, color: '#db2777', projects: projectData.health },
    { id: 'education', name: 'Education', icon: GraduationCap, color: '#d97706', projects: [] },
    { id: 'agriculture', name: 'Agriculture', icon: Sprout, color: '#059669', projects: [] },
    { id: 'disaster', name: 'Disaster Management', icon: Shield, color: '#dc2626', projects: [] }
  ];

  // Load projects with loading state
  useEffect(() => {
    const loadProjects = async () => {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (selectedDept) {
        const dept = departments.find(d => d.id === selectedDept);
        setProjects(dept?.projects || []);
        showNotification(`Showing ${dept?.name} projects`, 'info');
        addRecentAction(`Filtered by ${dept?.name}`);
      } else {
        setProjects(Object.values(projectData).flat());
        showNotification('Showing all department projects', 'info');
        addRecentAction('Viewed all projects');
      }
      setLoading(false);
    };

    loadProjects();
  }, [selectedDept]);

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return '#059669';
      case 'progress': return '#d97706';
      case 'delayed': return '#dc2626';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed': return <CheckCircle size={16} />;
      case 'progress': return <Clock size={16} />;
      case 'delayed': return <AlertCircle size={16} />;
      default: return <Activity size={16} />;
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'completed': return 'Completed';
      case 'progress': return 'In Progress';
      case 'delayed': return 'Delayed';
      default: return 'Unknown';
    }
  };

  const handleProjectClick = (project) => {
    setMapCenter([project.lat, project.lng]);
    setMapZoom(14);
    setSelectedProject(project);
    showNotification(`Centered map on ${project.name}`, 'success');
    addRecentAction(`Viewed ${project.name} details`);
  };

  const handleDepartmentClick = (deptId) => {
    setSelectedDept(deptId);
    const dept = departments.find(d => d.id === deptId);
    if (dept && dept.projects.length > 0) {
      const firstProject = dept.projects[0];
      setMapCenter([firstProject.lat, firstProject.lng]);
      setMapZoom(12);
    }
  };

  const handleExport = () => {
    setLoading(true);
    showNotification('Preparing export data...', 'info');
    // Simulate export
    setTimeout(() => {
      setLoading(false);
      showNotification('Data exported successfully!', 'success');
      addRecentAction('Exported project data');
    }, 1500);
  };

  const totalBudget = Object.values(projectData).flat().reduce((sum, p) => {
    const budget = parseFloat(p.budget.replace(/[₹,Cr\s]/g, ''));
    return sum + budget;
  }, 0);

  const completedProjects = Object.values(projectData).flat().filter(p => p.status === 'completed').length;
  const totalProjects = Object.values(projectData).flat().length;
  const completionRate = Math.round((completedProjects / totalProjects) * 100);

  const Notification = () => {
    if (!notification) return null;

    const bgColor = {
      info: 'bg-blue-500',
      success: 'bg-green-500',
      warning: 'bg-orange-500',
      error: 'bg-red-500'
    }[notification.type];

    return (
      <div className={`fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-3 animate-in slide-in-from-right`}>
        <Info size={20} />
        <span>{notification.message}</span>
        <button onClick={() => setNotification(null)} className="hover:bg-white/20 rounded p-1">
          <X size={16} />
        </button>
      </div>
    );
  };

  const ProjectDetailModal = () => {
    if (!selectedProject) return null;

    const project = selectedProject;
    const dept = departments.find(d => d.id === project.department);

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full`} style={{backgroundColor: getStatusColor(project.status)}} />
                <h2 className="text-2xl font-bold text-gray-800">{project.name}</h2>
              </div>
              <button 
                onClick={() => setSelectedProject(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <p className="text-gray-600 mt-2">{project.description}</p>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm font-medium text-gray-600 mb-1">Status</div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full`} style={{backgroundColor: getStatusColor(project.status)}} />
                  <span className="font-semibold text-gray-800 capitalize">{project.status}</span>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm font-medium text-gray-600 mb-1">Progress</div>
                <div className="font-semibold text-gray-800 text-xl">{project.progress}%</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm font-medium text-gray-600 mb-1">Budget</div>
                <div className="font-semibold text-gray-800 text-xl">{project.budget}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm font-medium text-gray-600 mb-1">Department</div>
                <div className="font-semibold text-gray-800 flex items-center gap-2">
                  {dept && <dept.icon size={16} style={{color: dept.color}} />}
                  {dept?.name}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Project Details</h3>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm font-medium text-gray-600">Project Officer</div>
                    <div className="font-semibold text-gray-800">{project.officer}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm font-medium text-gray-600">Start Date</div>
                      <div className="font-semibold text-gray-800">{new Date(project.startDate).toLocaleDateString('en-IN')}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-600">End Date</div>
                      <div className="font-semibold text-gray-800">{new Date(project.endDate).toLocaleDateString('en-IN')}</div>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-600">Last Update</div>
                    <div className="font-semibold text-gray-800">{new Date(project.lastUpdate).toLocaleDateString('en-IN')}</div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Progress Overview</h3>
                <div className="space-y-3">
                  <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                    <div
                      className="h-4 rounded-full transition-all flex items-center justify-end pr-2"
                      style={{
                        width: `${project.progress}%`,
                        backgroundColor: getStatusColor(project.status)
                      }}
                    >
                      {project.progress > 20 && (
                        <span className="text-white text-xs font-bold">{project.progress}%</span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Progress: {project.progress}%</span>
                    <span className="font-bold capitalize" style={{color: getStatusColor(project.status)}}>
                      {getStatusText(project.status)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="flex gap-3">
                <button className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                  <Download size={20} />
                  Download Report
                </button>
                <button className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                  <ExternalLink size={20} />
                  Share Project
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const OverviewPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <Notification />
      
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white rounded-xl p-3 shadow-lg">
                <MapPin className="text-blue-600" size={36} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Karyamitra GIS Portal</h1>
                <p className="text-blue-200 text-sm mt-1">Government of Karnataka - Project Monitoring System</p>
              </div>
            </div>
            <div className="text-right bg-white/10 backdrop-blur rounded-lg px-6 py-3 border border-white/20">
              <p className="text-white font-semibold">Real-time Dashboard</p>
              <p className="text-blue-200 text-sm">{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-10">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div 
            className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-2xl transform hover:scale-105 transition-transform cursor-pointer"
            onClick={() => {
              setActivePage('map');
              showNotification('Opening map with all projects', 'info');
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <MapPin size={32} className="opacity-80" />
              <span className="text-4xl font-bold">{totalProjects}</span>
            </div>
            <p className="text-blue-100 font-medium">Active Projects</p>
            <p className="text-blue-200 text-xs mt-2">Across all departments</p>
          </div>
          <div 
            className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-2xl transform hover:scale-105 transition-transform cursor-pointer"
            onClick={() => {
              setActivePage('map');
              setStatusFilter('completed');
              showNotification('Showing completed projects', 'info');
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <CheckCircle size={32} className="opacity-80" />
              <span className="text-4xl font-bold">{completionRate}%</span>
            </div>
            <p className="text-green-100 font-medium">Completion Rate</p>
            <p className="text-green-200 text-xs mt-2">{completedProjects} projects completed</p>
          </div>
          <div 
            className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-2xl transform hover:scale-105 transition-transform cursor-pointer"
            onClick={() => {
              setActivePage('map');
              showNotification('Viewing budget allocation', 'info');
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <TrendingUp size={32} className="opacity-80" />
              <span className="text-4xl font-bold">₹{totalBudget.toFixed(0)}Cr</span>
            </div>
            <p className="text-orange-100 font-medium">Total Budget</p>
            <p className="text-orange-200 text-xs mt-2">Allocated funds</p>
          </div>
          <div 
            className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-2xl transform hover:scale-105 transition-transform cursor-pointer"
            onClick={() => {
              setActivePage('map');
              showNotification('Viewing all departments', 'info');
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <Users size={32} className="opacity-80" />
              <span className="text-4xl font-bold">7</span>
            </div>
            <p className="text-purple-100 font-medium">Departments</p>
            <p className="text-purple-200 text-xs mt-2">Integrated systems</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Features Card */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-2xl p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-3">
              <Layers className="text-blue-600" size={32} />
              Advanced GIS Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="border-l-4 border-blue-500 pl-5 py-2 bg-blue-50 rounded-r-lg hover:bg-blue-100 transition-colors cursor-pointer">
                <h3 className="font-bold text-lg text-gray-800 mb-3">📍 Project Location Mapping</h3>
                <p className="text-gray-600 text-sm leading-relaxed">Every government project mapped with real-time status updates and color-coded progress indicators on interactive maps.</p>
              </div>
              <div className="border-l-4 border-green-500 pl-5 py-2 bg-green-50 rounded-r-lg hover:bg-green-100 transition-colors cursor-pointer">
                <h3 className="font-bold text-lg text-gray-800 mb-3">📊 Region-wise Performance</h3>
                <p className="text-gray-600 text-sm leading-relaxed">District-level KPI tracking with visual analytics for data-driven decision making and resource allocation.</p>
              </div>
              <div className="border-l-4 border-orange-500 pl-5 py-2 bg-orange-50 rounded-r-lg hover:bg-orange-100 transition-colors cursor-pointer">
                <h3 className="font-bold text-lg text-gray-800 mb-3">🚨 Real-time Field Updates</h3>
                <p className="text-gray-600 text-sm leading-relaxed">GPS-verified updates from field officers with photo documentation and automatic location tagging.</p>
              </div>
              <div className="border-l-4 border-purple-500 pl-5 py-2 bg-purple-50 rounded-r-lg hover:bg-purple-100 transition-colors cursor-pointer">
                <h3 className="font-bold text-lg text-gray-800 mb-3">🧠 AI + GIS Insights</h3>
                <p className="text-gray-600 text-sm leading-relaxed">Predictive analytics for delay patterns, resource optimization, and performance forecasting.</p>
              </div>
            </div>

            {/* Status Distribution */}
            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <h3 className="font-bold text-gray-800 mb-4">Project Status Distribution</h3>
              <div className="grid grid-cols-3 gap-4">
                <div 
                  className="text-center cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => {
                    setActivePage('map');
                    setStatusFilter('completed');
                    showNotification('Showing completed projects', 'info');
                  }}
                >
                  <div className="text-3xl font-bold text-green-600">{completedProjects}</div>
                  <div className="text-sm text-gray-600 mt-1">Completed</div>
                </div>
                <div 
                  className="text-center cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => {
                    setActivePage('map');
                    setStatusFilter('progress');
                    showNotification('Showing in-progress projects', 'info');
                  }}
                >
                  <div className="text-3xl font-bold text-orange-600">
                    {Object.values(projectData).flat().filter(p => p.status === 'progress').length}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">In Progress</div>
                </div>
                <div 
                  className="text-center cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => {
                    setActivePage('map');
                    setStatusFilter('delayed');
                    showNotification('Showing delayed projects', 'warning');
                  }}
                >
                  <div className="text-3xl font-bold text-red-600">
                    {Object.values(projectData).flat().filter(p => p.status === 'delayed').length}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Delayed</div>
                </div>
              </div>
            </div>

            <button 
              onClick={() => {
                setActivePage('map');
                showNotification('Opening interactive map dashboard', 'info');
                addRecentAction('Navigated to map view');
              }}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-semibold hover:shadow-2xl transition-all flex items-center justify-center gap-3 text-lg hover:from-blue-700 hover:to-blue-800 transform hover:scale-105"
            >
              <MapPin size={24} />
              Open Interactive GIS Map Dashboard
            </button>
          </div>

          {/* Departments Quick Access */}
          <div className="bg-white rounded-2xl shadow-2xl p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Layers size={24} className="text-blue-600" />
              Departments
            </h2>
            <div className="space-y-3">
              {departments.map(dept => {
                const Icon = dept.icon;
                const projectCount = dept.projects.length;
                return (
                  <button
                    key={dept.id}
                    onClick={() => {
                      handleDepartmentClick(dept.id);
                      setActivePage('map');
                      showNotification(`Showing ${dept.name} projects`, 'info');
                      addRecentAction(`Selected ${dept.name}`);
                    }}
                    className="w-full text-left px-5 py-4 rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all flex items-center gap-4 group shadow-sm hover:shadow-md transform hover:scale-105"
                  >
                    <div 
                      className="p-2 rounded-lg"
                      style={{ backgroundColor: dept.color + '20' }}
                    >
                      <Icon size={24} style={{ color: dept.color }} />
                    </div>
                    <div className="flex-1">
                      <span className="text-gray-800 group-hover:text-blue-800 font-semibold block text-sm">
                        {dept.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {projectCount} {projectCount === 1 ? 'project' : 'projects'}
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-gray-300 group-hover:text-blue-400 transition">
                      →
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Recent Actions */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-600 mb-3">Recent Actions</h3>
              <div className="space-y-2">
                {recentActions.slice(0, 3).map(action => (
                  <div key={action.id} className="text-xs text-gray-500 flex justify-between items-center">
                    <span className="truncate flex-1">{action.action}</span>
                    <span className="text-gray-400 ml-2">{action.timestamp}</span>
                  </div>
                ))}
                {recentActions.length === 0 && (
                  <div className="text-xs text-gray-400 text-center py-2">
                    No recent actions
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const MapPage = () => (
    <div className={`min-h-screen bg-gray-50 ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      <Notification />
      <ProjectDetailModal />
      
      {/* Header */}
      <div className="bg-white shadow-md border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => {
                  setActivePage('overview');
                  setSelectedDept(null);
                  showNotification('Returning to dashboard', 'info');
                }}
                className="px-5 py-2.5 bg-gray-100 rounded-lg hover:bg-gray-200 transition flex items-center gap-2 font-medium"
              >
                ← Overview
              </button>
              <div className="border-l-2 border-gray-300 pl-4">
                <h1 className="text-xl font-bold text-gray-800">GIS Project Map Dashboard</h1>
                <p className="text-gray-600 text-sm">
                  {selectedDept 
                    ? `Viewing ${departments.find(d => d.id === selectedDept)?.name} projects` 
                    : 'Viewing all department projects'
                  } • {filteredProjects.length} projects found
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              {loading && (
                <div className="flex items-center gap-2 text-blue-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-sm">Loading...</span>
                </div>
              )}
              <div className="text-right bg-blue-50 px-4 py-2 rounded-lg">
                <p className="text-sm text-gray-600">Showing Projects</p>
                <p className="font-bold text-gray-800 text-xl">{filteredProjects.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-89px)]">
        {/* Sidebar */}
        <div className={`w-96 bg-white shadow-lg overflow-y-auto border-r transition-all ${isFullscreen ? 'hidden' : 'block'}`}>
          <div className="p-6">
            {/* Search and Filters */}
            <div className="space-y-4 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    addRecentAction(`Searched for "${e.target.value}"`);
                  }}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
              </div>
              
              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    showNotification(`Filtered by ${e.target.value === 'all' ? 'all statuses' : e.target.value}`, 'info');
                    addRecentAction(`Filtered by ${e.target.value} status`);
                  }}
                  className="flex-1 px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
                >
                  <option value="all">All Status</option>
                  <option value="progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="delayed">Delayed</option>
                </select>
                <button 
                  onClick={handleExport}
                  disabled={loading}
                  className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition border-2 border-gray-300 disabled:opacity-50 flex items-center gap-2"
                >
                  <Download size={20} />
                  {loading ? '...' : 'Export'}
                </button>
              </div>
            </div>

            {/* Departments */}
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Layers size={20} />
                Departments
              </h2>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setSelectedDept(null);
                    showNotification('Showing all departments', 'info');
                    addRecentAction('Selected all departments');
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 font-medium hover:scale-105 transform ${!selectedDept ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-100 hover:bg-gray-200'}`}
                >
                  <Layers size={18} />
                  <span className="flex-1">All Departments</span>
                  <span className="text-sm opacity-75 bg-white/20 px-2 py-0.5 rounded">{Object.values(projectData).flat().length}</span>
                </button>
                {departments.map(dept => {
                  const Icon = dept.icon;
                  return (
                    <button
                      key={dept.id}
                      onClick={() => {
                        handleDepartmentClick(dept.id);
                        showNotification(`Showing ${dept.name} projects`, 'info');
                      }}
                      className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 font-medium hover:scale-105 transform ${selectedDept === dept.id ? 'text-white shadow-lg' : 'bg-gray-100 hover:bg-gray-200'}`}
                      style={selectedDept === dept.id ? {backgroundColor: dept.color} : {}}
                    >
                      <Icon size={18} />
                      <span className="flex-1">{dept.name}</span>
                      <span className={`text-sm px-2 py-0.5 rounded ${selectedDept === dept.id ? 'bg-white/20' : 'bg-gray-200'}`}>
                        {dept.projects.length}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Projects List */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">
                  Active Projects {filteredProjects.length > 0 && `(${filteredProjects.length})`}
                </h3>
                {searchTerm && (
                  <button 
                    onClick={() => {
                      setSearchTerm('');
                      showNotification('Cleared search', 'info');
                    }}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Clear search
                  </button>
                )}
              </div>
              
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : filteredProjects.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Search size={48} className="mx-auto mb-2 opacity-30" />
                  <p className="font-medium">No projects found</p>
                  <p className="text-sm mt-1">Try adjusting your search or filters</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredProjects.map(project => (
                    <div 
                      key={project.id} 
                      className={`bg-white border-2 rounded-xl p-4 hover:shadow-lg transition-all cursor-pointer transform hover:scale-105 ${
                        selectedProject?.id === project.id ? 'border-blue-500 shadow-lg' : 'border-gray-200'
                      }`}
                      onClick={() => handleProjectClick(project)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-bold text-gray-800 text-sm leading-tight flex-1 pr-2">
                          {project.name}
                        </h4>
                        <div className="flex items-center gap-1" style={{color: getStatusColor(project.status)}}>
                          {getStatusIcon(project.status)}
                        </div>
                      </div>
                      <div className="text-xs text-gray-600 mb-3 line-clamp-2 leading-relaxed">
                        {project.description}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                        <div className="bg-gray-50 rounded p-2">
                          <div className="text-gray-500 mb-1">Budget</div>
                          <div className="font-bold text-gray-800">{project.budget}</div>
                        </div>
                        <div className="bg-gray-50 rounded p-2">
                          <div className="text-gray-500 mb-1">Officer</div>
                          <div className="font-bold text-gray-800">{project.officer.split(',')[0]}</div>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 mb-2 overflow-hidden">
                        <div 
                          className="h-3 rounded-full transition-all flex items-center justify-end pr-1"
                          style={{
                            width: `${project.progress}%`,
                            backgroundColor: getStatusColor(project.status)
                          }}
                        >
                          {project.progress > 15 && (
                            <span className="text-white text-xs font-bold">{project.progress}%</span>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600 font-medium">Progress: {project.progress}%</span>
                        <span className="font-bold capitalize" style={{color: getStatusColor(project.status)}}>
                          {getStatusText(project.status)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Map Area */}
        <div className={`flex-1 relative ${isFullscreen ? 'w-full' : ''}`}>
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
          >
            <MapController center={mapCenter} zoom={mapZoom} selectedProject={selectedProject} />
            
            {/* Tile Layer with different options */}
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Alternative satellite view */}
            {/* <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            /> */}

            {/* Project Markers */}
            {filteredProjects.map(project => (
              <Marker
                key={project.id}
                position={[project.lat, project.lng]}
                icon={createCustomIcon(getStatusColor(project.status))}
                eventHandlers={{
                  click: () => handleProjectClick(project),
                }}
              >
                <Popup>
                  <div className="p-2 min-w-[250px]">
                    <div className="flex items-center gap-2 mb-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: getStatusColor(project.status) }}
                      />
                      <span className="font-bold text-gray-800 text-sm">{project.name}</span>
                    </div>
                    <p className="text-gray-600 text-xs mb-3">{project.description}</p>
                    
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Status:</span>
                        <span className="font-medium capitalize">{getStatusText(project.status)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Progress:</span>
                        <span className="font-medium">{project.progress}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Budget:</span>
                        <span className="font-medium">{project.budget}</span>
                      </div>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-3 overflow-hidden">
                      <div 
                        className="h-2 rounded-full transition-all"
                        style={{
                          width: `${project.progress}%`,
                          backgroundColor: getStatusColor(project.status)
                        }}
                      />
                    </div>
                    
                    <button 
                      onClick={() => handleProjectClick(project)}
                      className="w-full mt-3 px-3 py-1.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors font-medium"
                    >
                      View Details
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {/* Legend */}
          <div className="absolute bottom-6 left-6 bg-white rounded-xl shadow-2xl p-4 border-2 border-gray-200 z-[1000]">
            <h4 className="font-bold text-sm mb-3 text-gray-800 flex items-center gap-2">
              <Activity size={16} />
              Project Status Legend
            </h4>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-green-500 border-2 border-white shadow" />
                <span className="text-sm text-gray-700 font-medium">Completed</span>
                <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-semibold">
                  {Object.values(projectData).flat().filter(p => p.status === 'completed').length}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-orange-500 border-2 border-white shadow" />
                <span className="text-sm text-gray-700 font-medium">In Progress</span>
                <span className="ml-auto text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded font-semibold">
                  {Object.values(projectData).flat().filter(p => p.status === 'progress').length}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-red-500 border-2 border-white shadow" />
                <span className="text-sm text-gray-700 font-medium">Delayed</span>
                <span className="ml-auto text-xs bg-red-100 text-red-700 px-2 py-1 rounded font-semibold">
                  {Object.values(projectData).flat().filter(p => p.status === 'delayed').length}
                </span>
              </div>
            </div>
          </div>

          {/* Map Controls */}
          <div className="absolute top-6 right-6 bg-white rounded-xl shadow-2xl border-2 border-gray-200 z-[1000]">
            <div className="p-2 space-y-2">
              <button 
                className="w-10 h-10 flex items-center justify-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow transform hover:scale-105"
                onClick={() => {
                  setMapCenter([12.9716, 77.5946]);
                  setMapZoom(11);
                  setSelectedProject(null);
                  showNotification('Map view reset', 'info');
                }}
                title="Reset View"
              >
                <Navigation size={20} />
              </button>
              <button 
                className="w-10 h-10 flex items-center justify-center bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition border-2 border-gray-300 transform hover:scale-105"
                onClick={() => setMapZoom(Math.min(18, mapZoom + 1))}
                title="Zoom In"
              >
                <ZoomIn size={20} />
              </button>
              <button 
                className="w-10 h-10 flex items-center justify-center bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition border-2 border-gray-300 transform hover:scale-105"
                onClick={() => setMapZoom(Math.max(8, mapZoom - 1))}
                title="Zoom Out"
              >
                <ZoomOut size={20} />
              </button>
              <button 
                className="w-10 h-10 flex items-center justify-center bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition border-2 border-gray-300 transform hover:scale-105"
                title="Fullscreen"
                onClick={() => {
                  setIsFullscreen(!isFullscreen);
                  showNotification(isFullscreen ? 'Exited fullscreen' : 'Entered fullscreen', 'info');
                }}
              >
                <Maximize2 size={20} />
              </button>
            </div>
          </div>

          {/* Quick Stats Overlay */}
          <div className="absolute bottom-6 right-6 bg-white rounded-xl shadow-2xl p-4 border-2 border-gray-200 z-[1000]">
            <h4 className="font-bold text-sm mb-3 text-gray-800">Quick Statistics</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between gap-6">
                <span className="text-gray-600">Total Projects:</span>
                <span className="font-bold text-gray-800">{filteredProjects.length}</span>
              </div>
              <div className="flex justify-between gap-6">
                <span className="text-gray-600">Avg Progress:</span>
                <span className="font-bold text-gray-800">
                  {filteredProjects.length > 0 ? 
                    Math.round(filteredProjects.reduce((sum, p) => sum + p.progress, 0) / filteredProjects.length) : 0
                  }%
                </span>
              </div>
              <div className="flex justify-between gap-6">
                <span className="text-gray-600">Total Budget:</span>
                <span className="font-bold text-gray-800">
                  ₹{filteredProjects.reduce((sum, p) => {
                    return sum + parseFloat(p.budget.replace(/[₹,Cr\s]/g, ''));
                  }, 0).toFixed(0)}Cr
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      {activePage === 'overview' && <OverviewPage />}
      {activePage === 'map' && <MapPage />}
    </div>
  );
};

export default KaryamitraGIS;