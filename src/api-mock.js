// Mock data for testing or fallback if API is unavailable
export const mockUsers = [
  { 
    id: 1, 
    name: 'Dr. Sarah Martinez', 
    role: 'Professor', 
    email: 'sarah.martinez@university.edu',
    department: 'Computer Science',
    permissions: ['READ', 'WRITE', 'CREATE', 'UPDATE', 'APPROVE'] 
  },
  { 
    id: 2, 
    name: 'Alex Johnson', 
    role: 'Student', 
    email: 'alex.johnson@university.edu',
    department: 'Computer Science',
    permissions: ['READ', 'OPEN'] 
  },
  { 
    id: 3, 
    name: 'Maria Rodriguez', 
    role: 'Registrar', 
    email: 'maria.rodriguez@university.edu',
    department: 'Administration',
    permissions: ['READ', 'WRITE', 'DELETE', 'CREATE', 'UPDATE', 'APPROVE'] 
  },
  { 
    id: 4, 
    name: 'James Chen', 
    role: 'Teaching Assistant', 
    email: 'james.chen@university.edu',
    department: 'Computer Science',
    permissions: ['READ', 'UPDATE', 'APPROVE'] 
  },
  { 
    id: 5, 
    name: 'Dr. Emily Thompson', 
    role: 'Department Admin', 
    email: 'emily.thompson@university.edu',
    department: 'Computer Science',
    permissions: ['READ', 'WRITE', 'CREATE', 'UPDATE', 'DELETE'] 
  }
];

export const mockActions = ['READ', 'WRITE', 'DELETE', 'CREATE', 'UPDATE', 'APPROVE', 'REJECT', 'OPEN'];

// Mock API fetch functions
export const fetchMockUsers = () => {
  return Promise.resolve(mockUsers);
};

export const fetchMockActions = () => {
  return Promise.resolve(mockActions);
};
