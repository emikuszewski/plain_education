import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { Shield, Lock, Key, User, Users, Database, Check, X, AlertCircle, Server, Globe, ChevronRight, ChevronLeft, RefreshCw, Zap, Activity } from 'lucide-react';

// ========== CONSTANTS & CONFIGURATION ==========
const USE_REAL_API = false;
const API_BASE_URL = 'https://presales-platform.us1.plainid.io/v1';
const API_KEY = 'oye5i0uZ6XSt22aspTilh2YokktFUPD8';

// PlainID brand colors
const COLORS = {
  primary: '#00A7B5',
  primaryDark: '#002A3A',
  primaryLight: '#D1E4E5',
  secondary: '#515A6C',
  secondaryLight: '#EEF1F4',
  secondaryMedium: '#BFCED6',
  success: '#10B981',
  danger: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6'
};

// Mock data
const MOCK_USERS = [
  { 
    id: 1, 
    name: 'Dr. Sarah Martinez', 
    role: 'Professor', 
    email: 'sarah.martinez@university.edu',
    department: 'Computer Science',
    permissions: ['READ', 'WRITE', 'CREATE', 'UPDATE', 'APPROVE'],
    avatar: '👩‍🏫'
  },
  { 
    id: 2, 
    name: 'Alex Johnson', 
    role: 'Student', 
    email: 'alex.johnson@university.edu',
    department: 'Computer Science',
    permissions: ['READ', 'OPEN'],
    avatar: '🎓'
  },
  { 
    id: 3, 
    name: 'Maria Rodriguez', 
    role: 'Registrar', 
    email: 'maria.rodriguez@university.edu',
    department: 'Administration',
    permissions: ['READ', 'WRITE', 'DELETE', 'CREATE', 'UPDATE', 'APPROVE'],
    avatar: '👩‍💼'
  },
  { 
    id: 4, 
    name: 'James Chen', 
    role: 'Teaching Assistant', 
    email: 'james.chen@university.edu',
    department: 'Computer Science',
    permissions: ['READ', 'UPDATE', 'APPROVE'],
    avatar: '👨‍🎓'
  },
  { 
    id: 5, 
    name: 'Dr. Emily Thompson', 
    role: 'Department Admin', 
    email: 'emily.thompson@university.edu',
    department: 'Computer Science',
    permissions: ['READ', 'WRITE', 'CREATE', 'UPDATE', 'DELETE'],
    avatar: '👩‍💻'
  }
];

const MOCK_ACTIONS = ['READ', 'WRITE', 'DELETE', 'CREATE', 'UPDATE', 'APPROVE', 'REJECT', 'OPEN'];

const ACTION_DISPLAY_NAMES = {
  'READ': { name: 'View', icon: '👁️', description: 'View resource data' },
  'WRITE': { name: 'Edit', icon: '✏️', description: 'Modify existing data' },
  'DELETE': { name: 'Remove', icon: '🗑️', description: 'Delete resources' },
  'CREATE': { name: 'Add Course', icon: '📚', description: 'Create new courses' },
  'UPDATE': { name: 'Update', icon: '🔄', description: 'Update information' },
  'APPROVE': { name: 'Grade', icon: '✅', description: 'Assign grades' },
  'REJECT': { name: 'Reject', icon: '❌', description: 'Reject requests' },
  'OPEN': { name: 'Enroll', icon: '📝', description: 'Enroll in courses' }
};

const RESOURCES = [
  { id: 'courses', name: 'Courses', icon: Database, color: 'indigo', description: 'Course catalog management' },
  { id: 'grades', name: 'Grades', icon: Activity, color: 'purple', description: 'Student grade records' },
  { id: 'student-records', name: 'Student Records', icon: Users, color: 'emerald', description: 'Student information' },
  { id: 'system-settings', name: 'System Settings', icon: Server, color: 'amber', description: 'System configuration' }
];

const STEPS = [
  { id: 'request', title: 'API Request', icon: Globe },
  { id: 'policy', title: 'Policy Summary', icon: Shield },
  { id: 'decision', title: 'Authorization Decision', icon: Lock },
  { id: 'response', title: 'API Response', icon: Server }
];

// ========== UTILITY FUNCTIONS ==========
const getActionDisplay = (action) => ACTION_DISPLAY_NAMES[action] || { name: action, icon: '📄', description: action };

const getRoleColor = (role) => {
  switch(role) {
    case 'Professor': return 'blue';
    case 'Registrar': return 'red';
    case 'Department Admin': return 'purple';
    case 'Teaching Assistant': return 'green';
    case 'Student': return 'indigo';
    default: return 'gray';
  }
};

// ========== SUB-COMPONENTS ==========

// Loading component with skeleton UI
const LoadingScreen = memo(() => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-md w-full">
      <div className="flex flex-col items-center space-y-6">
        <div className="relative">
          <Shield className="h-20 w-20 text-teal-500 animate-pulse" />
          <Activity className="absolute -bottom-2 -right-2 h-8 w-8 text-blue-500 animate-ping" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gray-800">Loading Demo</h2>
          <p className="text-gray-600">Fetching authorization policies...</p>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-teal-400 to-blue-500 rounded-full animate-pulse" 
               style={{ animation: 'slideRight 2s ease-in-out infinite' }} />
        </div>
      </div>
    </div>
    <style jsx>{`
      @keyframes slideRight {
        0%, 100% { transform: translateX(-100%); }
        50% { transform: translateX(100%); }
      }
    `}</style>
  </div>
));

// Progress indicator component
const ProgressSteps = memo(({ activeStep, steps }) => (
  <div className="mb-8 px-4">
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6">
      <div className="relative">
        {/* Progress line */}
        <div className="absolute top-8 left-0 w-full h-0.5 bg-gray-300" />
        <div 
          className="absolute top-8 left-0 h-0.5 bg-gradient-to-r from-teal-400 to-teal-600 transition-all duration-700"
          style={{ width: `${(activeStep / (steps.length - 1)) * 100}%` }}
        />
        
        {/* Steps */}
        <div className="relative grid grid-cols-4 gap-4">
          {steps.map((step, index) => {
            const StepIcon = step.icon;
            const isActive = index === activeStep;
            const isComplete = index < activeStep;
            
            return (
              <div key={step.id} className="flex flex-col items-center">
                <div className={`
                  relative z-10 w-16 h-16 rounded-full flex items-center justify-center
                  transition-all duration-500 transform
                  ${isActive ? 'scale-110 shadow-lg shadow-teal-500/30' : ''}
                  ${isComplete ? 'bg-teal-500 text-white' : isActive ? 'bg-gradient-to-br from-teal-400 to-teal-600 text-white' : 'bg-white border-2 border-gray-300 text-gray-400'}
                `}>
                  {isComplete ? (
                    <Check className="w-6 h-6 animate-fadeIn" />
                  ) : (
                    <StepIcon className={`w-6 h-6 ${isActive ? 'animate-pulse' : ''}`} />
                  )}
                  {isActive && (
                    <div className="absolute inset-0 rounded-full bg-teal-400 animate-ping opacity-30" />
                  )}
                </div>
                <span className={`
                  mt-3 text-sm font-medium transition-all duration-300
                  ${isActive ? 'text-teal-600 font-bold' : isComplete ? 'text-teal-500' : 'text-gray-500'}
                `}>
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  </div>
));

// User selector component - Compact for side-by-side layout
const UserSelector = memo(({ users, selectedUser, onSelectUser }) => (
  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 h-full">
    <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center">
      <User className="mr-2 h-4 w-4 text-blue-600" />
      Select User
    </h3>
    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
      {users.map(user => (
        <button
          key={user.id}
          onClick={() => onSelectUser(user)}
          className={`
            w-full text-left p-2.5 rounded-lg transition-all duration-300 transform
            ${selectedUser?.id === user.id 
              ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md' 
              : 'bg-white hover:bg-blue-50 hover:shadow-md'}
          `}
        >
          <div className="flex items-center">
            <span className="text-lg mr-2">{user.avatar}</span>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-xs truncate">{user.name}</div>
              <div className={`text-xs ${selectedUser?.id === user.id ? 'text-blue-100' : 'text-gray-600'}`}>
                <span className={`
                  inline-block px-1.5 py-0.5 rounded text-xs font-medium
                  ${selectedUser?.id === user.id ? 'bg-white/20 text-white' : `bg-${getRoleColor(user.role)}-100 text-${getRoleColor(user.role)}-700`}
                `}>
                  {user.role}
                </span>
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  </div>
));

// Resource selector component - Compact for side-by-side layout
const ResourceSelector = memo(({ resources, selectedResource, onSelectResource }) => (
  <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 h-full">
    <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center">
      <Database className="mr-2 h-4 w-4 text-purple-600" />
      Select Resource
    </h3>
    <div className="space-y-2">
      {resources.map(resource => {
        const ResourceIcon = resource.icon;
        return (
          <button
            key={resource.id}
            onClick={() => onSelectResource(resource.id)}
            className={`
              w-full text-left p-2.5 rounded-lg transition-all duration-300 transform flex items-center
              ${selectedResource === resource.id 
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md' 
                : 'bg-white hover:bg-purple-50 hover:shadow-md'}
            `}
          >
            <ResourceIcon className={`mr-2 h-4 w-4 flex-shrink-0 ${selectedResource === resource.id ? 'text-white' : 'text-purple-500'}`} />
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-xs">{resource.name}</div>
              <div className={`text-xs truncate ${selectedResource === resource.id ? 'text-purple-100' : 'text-gray-500'}`}>
                {resource.description}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  </div>
));

// Action selector component - Compact for side-by-side layout
const ActionSelector = memo(({ actions, selectedActions, onToggleAction }) => (
  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 h-full">
    <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center">
      <Key className="mr-2 h-4 w-4 text-emerald-600" />
      Select Actions
    </h3>
    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
      {actions.map(action => {
        const display = getActionDisplay(action);
        const isSelected = selectedActions.includes(action);
        
        return (
          <button
            key={action}
            onClick={() => onToggleAction(action)}
            className={`
              w-full text-left p-2.5 rounded-lg transition-all duration-300 transform flex items-center
              ${isSelected 
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md' 
                : 'bg-white hover:bg-emerald-50 hover:shadow-md'}
            `}
          >
            <div className={`
              w-4 h-4 rounded border-2 mr-2 flex items-center justify-center transition-all duration-300 flex-shrink-0
              ${isSelected ? 'bg-white border-white' : 'border-gray-300'}
            `}>
              {isSelected && <Check className="w-3 h-3 text-emerald-500" />}
            </div>
            <span className="text-base mr-2">{display.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-xs">{display.name}</div>
              <div className={`text-xs truncate ${isSelected ? 'text-emerald-100' : 'text-gray-500'}`}>
                {display.description}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  </div>
));

// API Request Preview
const APIRequestPreview = memo(({ selectedResource, selectedUser, selectedActions }) => (
  <div className="mt-6 bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-xl shadow-2xl">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-white font-bold flex items-center">
        <Globe className="mr-2 h-5 w-5 text-teal-400" />
        API Request Preview
      </h3>
      <div className="flex space-x-2">
        <div className="w-3 h-3 rounded-full bg-red-500" />
        <div className="w-3 h-3 rounded-full bg-yellow-500" />
        <div className="w-3 h-3 rounded-full bg-green-500" />
      </div>
    </div>
    <div className="bg-black/50 rounded-lg p-4 font-mono text-sm">
      <pre className="text-emerald-400 whitespace-pre-wrap">
{`GET /api/${selectedResource}
Authorization: Bearer ${API_KEY.substring(0, 8)}...
X-User-ID: ${selectedUser?.id || ''}
X-User-Role: ${selectedUser?.role || ''}
X-Actions: ${selectedActions.join(',')}`}
      </pre>
    </div>
  </div>
));

// Policy visualization
const PolicyVisualization = memo(({ selectedUser, selectedResource, selectedActions }) => (
  <div className="flex items-center justify-center py-12">
    <div className="relative">
      <div className="w-80 h-80 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center shadow-2xl animate-pulse">
        <div className="w-60 h-60 rounded-full bg-gradient-to-br from-blue-200 to-indigo-200 flex items-center justify-center">
          <Lock className="h-24 w-24 text-blue-600" />
        </div>
      </div>
      
      {/* Floating cards */}
      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-white p-4 rounded-lg shadow-xl">
        <div className="flex items-center">
          <User className="mr-2 h-5 w-5 text-blue-500" />
          <span className="font-semibold">{selectedUser?.name}</span>
        </div>
      </div>
      
      <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-white p-4 rounded-lg shadow-xl">
        <div className="flex items-center">
          <Key className="mr-2 h-5 w-5 text-emerald-500" />
          <span className="font-semibold">{selectedActions.length} Actions</span>
        </div>
      </div>
      
      <div className="absolute left-0 top-1/2 transform -translate-x-full -translate-y-1/2 bg-white p-4 rounded-lg shadow-xl">
        <div className="flex items-center">
          <Database className="mr-2 h-5 w-5 text-purple-500" />
          <span className="font-semibold capitalize">{selectedResource}</span>
        </div>
      </div>
      
      <div className="absolute right-0 top-1/2 transform translate-x-full -translate-y-1/2 bg-white p-4 rounded-lg shadow-xl">
        <div className="flex items-center">
          <Shield className="mr-2 h-5 w-5 text-red-500" />
          <span className="font-semibold">{selectedUser?.role}</span>
        </div>
      </div>
    </div>
  </div>
));

// Decision display
const DecisionDisplay = memo(({ authorization, selectedUser, selectedResource, selectedActions }) => (
  <div className="max-w-3xl mx-auto">
    <div className={`
      rounded-2xl p-8 shadow-2xl transition-all duration-500 transform
      ${authorization?.overall 
        ? 'bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-300' 
        : 'bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-300'}
    `}>
      <div className="flex flex-col items-center mb-6">
        <div className={`
          rounded-full p-6 mb-4 transition-all duration-500
          ${authorization?.overall ? 'bg-emerald-100' : 'bg-red-100'}
        `}>
          {authorization?.overall ? 
            <Check className="h-16 w-16 text-emerald-600" /> : 
            <X className="h-16 w-16 text-red-600" />
          }
        </div>
        <h3 className={`text-2xl font-bold ${authorization?.overall ? 'text-emerald-800' : 'text-red-800'}`}>
          {authorization?.overall ? 'Access Granted' : 'Access Denied'}
        </h3>
        <p className="text-gray-600 mt-2 text-center">
          {selectedUser?.name} {authorization?.overall ? 'can' : 'cannot'} perform the requested actions on {selectedResource}
        </p>
      </div>
      
      <div className="space-y-3">
        <h4 className="font-semibold text-gray-700 mb-3">Action Details:</h4>
        {authorization?.details.map((detail, index) => {
          const display = getActionDisplay(detail.action);
          return (
            <div 
              key={index}
              className={`
                p-4 rounded-lg flex items-center justify-between transition-all duration-300
                ${detail.allowed 
                  ? 'bg-emerald-100 border border-emerald-200' 
                  : 'bg-red-100 border border-red-200'}
              `}
            >
              <div className="flex items-center">
                <span className="text-xl mr-3">{display.icon}</span>
                <div>
                  <span className="font-semibold">{display.name}</span>
                  <span className="text-sm text-gray-600 ml-2">({detail.action})</span>
                </div>
              </div>
              <span className={`
                px-3 py-1 rounded-full text-sm font-semibold
                ${detail.allowed 
                  ? 'bg-emerald-200 text-emerald-700' 
                  : 'bg-red-200 text-red-700'}
              `}>
                {detail.allowed ? 'Allowed' : 'Denied'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  </div>
));

// Response display
const ResponseDisplay = memo(({ authorization, selectedUser, selectedResource, selectedActions }) => (
  <div className="max-w-3xl mx-auto">
    <div className="mb-6">
      <div className="flex items-center justify-between bg-white rounded-lg shadow-lg p-4">
        <div className="flex items-center">
          <Globe className="h-8 w-8 text-blue-500 mr-3" />
          <span className="font-semibold">Client Request</span>
        </div>
        <div className="flex-1 mx-4">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className={`
              h-full rounded-full transition-all duration-1000
              ${authorization?.overall 
                ? 'bg-gradient-to-r from-emerald-400 to-emerald-600 w-full' 
                : 'bg-gradient-to-r from-red-400 to-red-600 w-1/3'}
            `} />
          </div>
        </div>
        <div className="flex items-center">
          <Server className="h-8 w-8 text-purple-500 mr-3" />
          <span className="font-semibold">API Server</span>
        </div>
      </div>
    </div>
    
    <div className="bg-gray-900 rounded-xl shadow-2xl p-6 mb-6">
      <div className="flex items-center mb-4">
        <div className={`h-3 w-3 rounded-full mr-3 animate-pulse ${authorization?.overall ? 'bg-emerald-500' : 'bg-red-500'}`} />
        <span className={`font-mono font-bold ${authorization?.overall ? 'text-emerald-400' : 'text-red-400'}`}>
          {authorization?.overall ? '200 OK' : '403 Forbidden'}
        </span>
      </div>
      <pre className={`font-mono text-sm overflow-x-auto ${authorization?.overall ? 'text-emerald-300' : 'text-red-300'}`}>
{authorization?.overall ? 
`{
  "status": "success",
  "data": {
    "resource_id": "res_${Math.random().toString(36).substr(2, 9)}",
    "access_granted": true,
    "timestamp": "${new Date().toISOString()}"
  }
}` :
`{
  "status": "error",
  "code": "ACCESS_DENIED",
  "message": "Insufficient permissions",
  "timestamp": "${new Date().toISOString()}"
}`}
      </pre>
    </div>
    
    {/* Request Summary */}
    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-6 shadow-lg">
      <h3 className="font-bold text-gray-800 mb-4 flex items-center">
        <Server className="mr-2 h-5 w-5 text-indigo-600" />
        Request Summary
      </h3>
      <div className="bg-white rounded-lg p-4 shadow">
        <div className="grid grid-cols-2 gap-3">
          <div className="text-sm text-gray-600 font-medium">User:</div>
          <div className="text-sm font-semibold bg-blue-50 px-3 py-1.5 rounded text-blue-800">
            {selectedUser?.name || ''}
          </div>
          
          <div className="text-sm text-gray-600 font-medium">Resource:</div>
          <div className="text-sm font-semibold bg-purple-50 px-3 py-1.5 rounded text-purple-800 capitalize">
            {selectedResource || ''}
          </div>
          
          <div className="text-sm text-gray-600 font-medium">Actions:</div>
          <div className="text-sm font-semibold bg-emerald-50 px-3 py-1.5 rounded text-emerald-800">
            {selectedActions?.map(action => getActionDisplay(action).name).join(', ') || ''}
          </div>
          
          <div className="text-sm text-gray-600 font-medium">Decision:</div>
          <div className={`text-sm font-semibold px-3 py-1.5 rounded ${
            authorization?.overall 
              ? 'bg-emerald-100 text-emerald-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {authorization?.overall ? 'Authorized ✓' : 'Unauthorized ✗'}
          </div>
          
          <div className="text-sm text-gray-600 font-medium">Response Code:</div>
          <div className={`text-sm font-semibold px-3 py-1.5 rounded ${
            authorization?.overall 
              ? 'bg-emerald-100 text-emerald-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {authorization?.overall ? '200 OK' : '403 Forbidden'}
          </div>
        </div>
      </div>
    </div>
  </div>
));

// ========== API SERVICE ==========
const fetchUsers = async () => {
  if (!USE_REAL_API) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return MOCK_USERS;
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/users`, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) throw new Error(`Failed to fetch users: ${response.status}`);
    const data = await response.json();
    return data.data || MOCK_USERS;
  } catch (error) {
    console.error("Error fetching users:", error);
    return MOCK_USERS;
  }
};

const fetchActions = async () => {
  if (!USE_REAL_API) {
    await new Promise(resolve => setTimeout(resolve, 800));
    return MOCK_ACTIONS;
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/actions`, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) throw new Error(`Failed to fetch actions: ${response.status}`);
    const data = await response.json();
    return data.data || MOCK_ACTIONS;
  } catch (error) {
    console.error("Error fetching actions:", error);
    return MOCK_ACTIONS;
  }
};

// ========== MAIN COMPONENT ==========
const APIPoliciesDemo = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [showDecision, setShowDecision] = useState(false);
  const [authorization, setAuthorization] = useState(null);
  const [animateTransition, setAnimateTransition] = useState(false);
  
  const [users, setUsers] = useState([]);
  const [actions, setActions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedResource, setSelectedResource] = useState('courses');
  const [selectedActions, setSelectedActions] = useState([]);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [usersData, actionsData] = await Promise.all([
          fetchUsers(),
          fetchActions()
        ]);
        
        setUsers(usersData);
        setActions(actionsData);
        
        if (usersData.length > 0) setSelectedUser(usersData[0]);
        if (actionsData.length > 0) setSelectedActions([actionsData[0]]);
      } catch (err) {
        setError("Error loading data");
        setUsers(MOCK_USERS);
        setActions(MOCK_ACTIONS);
        setSelectedUser(MOCK_USERS[0]);
        setSelectedActions([MOCK_ACTIONS[0]]);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Animation effect
  useEffect(() => {
    if (animateTransition) {
      const timer = setTimeout(() => setAnimateTransition(false), 400);
      return () => clearTimeout(timer);
    }
  }, [animateTransition]);

  const toggleAction = useCallback((action) => {
    setSelectedActions(prev => {
      if (prev.includes(action)) {
        return prev.length > 1 ? prev.filter(a => a !== action) : prev;
      }
      return [...prev, action];
    });
  }, []);

  const evaluateAccess = useCallback(() => {
    if (!selectedUser || selectedActions.length === 0) return;
    
    const permissionResults = selectedActions.map(action => {
      let allowed = selectedUser.permissions.includes(action);
      
      // Grades resource - Only Professors and TAs can grade (APPROVE), others view only
      if (selectedResource === 'grades') {
        if (!['Professor', 'Teaching Assistant', 'Registrar'].includes(selectedUser.role)) {
          allowed = false;
        }
        if (selectedUser.role === 'Student' && action !== 'READ') {
          allowed = false;
        }
      }
      
      // System Settings - Only Registrar and Department Admin
      if (selectedResource === 'system-settings' && !['Registrar', 'Department Admin'].includes(selectedUser.role)) {
        allowed = false;
      }
      
      // Student Records - Registrars have full access, Professors limited access
      if (selectedResource === 'student-records') {
        if (selectedUser.role === 'Student') {
          allowed = action === 'READ';
        } else if (selectedUser.role === 'Teaching Assistant') {
          allowed = action === 'READ';
        } else if (selectedUser.role === 'Professor') {
          allowed = ['READ', 'UPDATE'].includes(action);
        }
      }
      
      // Courses - Different rules for different roles
      if (selectedResource === 'courses') {
        if (selectedUser.role === 'Student') {
          allowed = ['READ', 'OPEN'].includes(action); // Can view and enroll
        } else if (selectedUser.role === 'Teaching Assistant') {
          allowed = ['READ', 'UPDATE'].includes(action);
        }
      }
      
      return { action, allowed };
    });
    
    const overallAuthorized = permissionResults.every(result => result.allowed);
    
    setAuthorization({
      overall: overallAuthorized,
      details: permissionResults
    });
    setShowDecision(true);
  }, [selectedUser, selectedResource, selectedActions]);

  const handleNext = useCallback(() => {
    setAnimateTransition(true);
    
    if (activeStep === 1) {
      evaluateAccess();
    }
    
    if (activeStep < STEPS.length - 1) {
      setActiveStep(prev => prev + 1);
    } else {
      setActiveStep(0);
      setShowDecision(false);
      setAuthorization(null);
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeStep, evaluateAccess]);

  const handleBack = useCallback(() => {
    setAnimateTransition(true);
    
    if (activeStep > 0) {
      setActiveStep(prev => prev - 1);
      if (activeStep === 3) {
        setShowDecision(true);
      } else if (activeStep === 2) {
        setShowDecision(false);
      }
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeStep]);

  if (isLoading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Background pattern */}
      <div className="fixed inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(45deg, ${COLORS.primary} 0, ${COLORS.primary} 1px, transparent 1px, transparent 15px)`,
        }} />
      </div>
      
      {/* Header */}
      <div className="relative z-10 text-center py-8 px-4">
        <div className="inline-flex items-center bg-white rounded-2xl shadow-xl px-8 py-4">
          <Shield className="mr-3 h-10 w-10 text-teal-500" />
          <div className="text-left">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-500 to-blue-600 bg-clip-text text-transparent">
              API Policies & Authorization
            </h1>
            <p className="text-gray-600 text-sm">Higher Education Platform Demo</p>
          </div>
        </div>
        
        {error && (
          <div className="mt-4 inline-flex items-center px-4 py-2 bg-amber-100 text-amber-700 rounded-lg">
            <AlertCircle className="h-4 w-4 mr-2" />
            Using mock data
          </div>
        )}
      </div>
      
      {/* Progress Steps */}
      <ProgressSteps activeStep={activeStep} steps={STEPS} />
      
      {/* Main Content */}
      <div className="px-4 pb-8">
        <div className={`
          max-w-[1400px] mx-auto bg-white rounded-2xl shadow-2xl p-8
          transition-all duration-500 transform
          ${animateTransition ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}
        `}>
          {/* Step 0: Request Configuration */}
          {activeStep === 0 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <Globe className="mr-3 h-8 w-8 text-teal-500" />
                Configure API Request
              </h2>
              
              <div className="flex gap-4 w-full">
                <div className="flex-1">
                  <UserSelector 
                    users={users} 
                    selectedUser={selectedUser} 
                    onSelectUser={setSelectedUser} 
                  />
                </div>
                <div className="flex-1">
                  <ResourceSelector 
                    resources={RESOURCES} 
                    selectedResource={selectedResource} 
                    onSelectResource={setSelectedResource} 
                  />
                </div>
                <div className="flex-1">
                  <ActionSelector 
                    actions={actions} 
                    selectedActions={selectedActions} 
                    onToggleAction={toggleAction} 
                  />
                </div>
              </div>
              
              <APIRequestPreview 
                selectedResource={selectedResource}
                selectedUser={selectedUser}
                selectedActions={selectedActions}
              />
            </div>
          )}
          
          {/* Step 1: Policy Summary */}
          {activeStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <Shield className="mr-3 h-8 w-8 text-teal-500" />
                Policy Summary
              </h2>
              
              <PolicyVisualization 
                selectedUser={selectedUser}
                selectedResource={selectedResource}
                selectedActions={selectedActions}
              />
              
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6">
                <h3 className="font-bold text-gray-700 mb-4">Applied Policies:</h3>
                <div className="space-y-3">
                  <div className="bg-white p-4 rounded-lg shadow flex items-center">
                    <Users className="mr-3 h-5 w-5 text-blue-500" />
                    <span>User <strong>{selectedUser?.name}</strong> has role <strong>{selectedUser?.role}</strong></span>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg shadow flex items-center">
                    <Key className="mr-3 h-5 w-5 text-emerald-500" />
                    <span>Requesting actions: <strong>{selectedActions.join(', ')}</strong></span>
                  </div>
                  
                  {selectedResource === 'grades' && selectedUser?.role === 'Student' && (
                    <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg flex items-center">
                      <AlertCircle className="mr-3 h-5 w-5 text-amber-600" />
                      <span className="text-amber-800">Students can only VIEW their own grades, not modify them</span>
                    </div>
                  )}
                  
                  {selectedResource === 'system-settings' && !['Registrar', 'Department Admin'].includes(selectedUser?.role) && (
                    <div className="bg-red-50 border border-red-200 p-4 rounded-lg flex items-center">
                      <AlertCircle className="mr-3 h-5 w-5 text-red-600" />
                      <span className="text-red-800">System Settings require Registrar or Department Admin role</span>
                    </div>
                  )}
                  
                  {selectedResource === 'student-records' && selectedUser?.role === 'Student' && (
                    <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg flex items-center">
                      <AlertCircle className="mr-3 h-5 w-5 text-amber-600" />
                      <span className="text-amber-800">Students can only VIEW their own records</span>
                    </div>
                  )}
                  
                  {selectedResource === 'courses' && selectedUser?.role === 'Student' && (
                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg flex items-center">
                      <AlertCircle className="mr-3 h-5 w-5 text-blue-600" />
                      <span className="text-blue-800">Students can VIEW course catalogs and ENROLL in courses</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Step 2: Authorization Decision */}
          {activeStep === 2 && showDecision && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <Lock className="mr-3 h-8 w-8 text-teal-500" />
                Authorization Decision
              </h2>
              
              <DecisionDisplay 
                authorization={authorization}
                selectedUser={selectedUser}
                selectedResource={selectedResource}
                selectedActions={selectedActions}
              />
            </div>
          )}
          
          {/* Step 3: API Response */}
          {activeStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <Server className="mr-3 h-8 w-8 text-teal-500" />
                API Response
              </h2>
              
              <ResponseDisplay 
                authorization={authorization}
                selectedUser={selectedUser}
                selectedResource={selectedResource}
                selectedActions={selectedActions}
              />
            </div>
          )}
          
          {/* Navigation Buttons */}
          <div className="flex justify-between mt-10">
            <button
              onClick={handleBack}
              disabled={activeStep === 0}
              className={`
                px-6 py-3 rounded-lg font-semibold flex items-center transition-all duration-300
                ${activeStep === 0 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-white border-2 border-teal-500 text-teal-600 hover:bg-teal-50 hover:shadow-lg transform hover:-translate-y-0.5'}
              `}
            >
              <ChevronLeft className="mr-2 h-5 w-5" />
              Back
            </button>
            
            <div className="flex space-x-2">
              {STEPS.map((_, index) => (
                <div 
                  key={index}
                  className={`
                    w-2 h-2 rounded-full transition-all duration-300
                    ${index === activeStep ? 'w-8 bg-teal-500' : index < activeStep ? 'bg-teal-300' : 'bg-gray-300'}
                  `}
                />
              ))}
            </div>
            
            <button
              onClick={handleNext}
              className="px-6 py-3 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-lg font-semibold flex items-center transition-all duration-300 hover:shadow-lg transform hover:-translate-y-0.5"
            >
              {activeStep === STEPS.length - 1 ? (
                <>
                  <RefreshCw className="mr-2 h-5 w-5" />
                  Restart Demo
                </>
              ) : (
                <>
                  Next Step
                  <ChevronRight className="ml-2 h-5 w-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default APIPoliciesDemo;
