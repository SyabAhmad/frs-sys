import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [users, setUsers] = useState([
    {
      id: 1,
      name: 'John Doe',
      img: 'https://randomuser.me/api/portraits/men/32.jpg',
      details: 'Age: 30, Profession: Engineer',
      department: 'IT'
    },
    {
      id: 2,
      name: 'Jane Smith',
      img: 'https://randomuser.me/api/portraits/women/44.jpg',
      details: 'Age: 28, Profession: Designer',
      department: 'Marketing'
    },
  ]);
  
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [notification, setNotification] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Check for notifications passed via navigation state
  useEffect(() => {
    if (location.state?.notification) {
      setNotification(location.state.notification);
      // Clear the location state
      navigate(location.pathname, { replace: true, state: {} });
      
      // Auto-dismiss notification after 5 seconds
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [location, navigate]);

  // Add a useEffect to load users from the backend
  useEffect(() => {
    // Function to fetch users from the backend
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://localhost:5000/users');
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error);
        // Optionally set an error notification
        setNotification({
          type: 'error',
          message: 'Failed to load users. Please refresh the page.'
        });
      }
    };
    
    fetchUsers();
  }, []); // Empty dependency array means this runs once on mount

  const openPopup = (user) => {
    setSelectedUser(user);
    setIsOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto pt-4">
        <div className="flex justify-between mb-4">
          <h1 className="text-2xl font-bold text-purple-700">Face Recognition Dashboard</h1>
          <Link to="/login" className="py-2 px-4 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-colors">
            Logout
          </Link>
        </div>

        {/* Notification */}
        {notification && (
          <div className={`mb-4 p-3 rounded-lg border ${
            notification.type === 'success' ? 'bg-green-100 text-green-700 border-green-300' : 
            'bg-red-100 text-red-700 border-red-300'
          }`}>
            {notification.message}
            <button 
              onClick={() => setNotification(null)} 
              className="float-right font-bold"
            >
              &times;
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Action Cards */}
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link to="/scan" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow flex flex-col items-center justify-center text-center">
              <div className="text-5xl mb-4">📷</div>
              <h2 className="text-xl font-semibold mb-2">Face Scanner</h2>
              <p className="text-gray-600">Scan a face to identify registered users</p>
              <button className="mt-4 py-2 px-4 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors">
                Open Scanner
              </button>
            </Link>
            
            <Link to="/add-user" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow flex flex-col items-center justify-center text-center">
              <div className="text-5xl mb-4">👤</div>
              <h2 className="text-xl font-semibold mb-2">Add New User</h2>
              <p className="text-gray-600">Register a new user with face recognition</p>
              <button className="mt-4 py-2 px-4 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors">
                Add User
              </button>
            </Link>
          </div>

          {/* User List Section */}
          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Registered Users</h2>
              <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                {users.length} Users
              </span>
            </div>
            
            <div className="space-y-4 max-h-[500px] overflow-y-auto">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer flex items-center"
                  onClick={() => openPopup(user)}
                >
                  <img 
                    src={user.img} 
                    alt={user.name} 
                    className="w-14 h-14 object-cover rounded-full" 
                  />
                  <div className="ml-3">
                    <p className="font-semibold">{user.name}</p>
                    <p className="text-sm text-gray-600">{user.department || 'No department'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* User Details Modal */}
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
          <div 
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setIsOpen(false)}
          ></div>
          <div className="bg-white rounded-lg p-6 w-full max-w-md relative z-10">
            <div className="text-right mb-2">
              <button 
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>
            <div className="text-center mb-4">
              <img 
                src={selectedUser?.img} 
                alt={selectedUser?.name} 
                className="w-24 h-24 object-cover rounded-full mx-auto"
              />
              <h3 className="text-xl font-bold mt-2">{selectedUser?.name}</h3>
              {selectedUser?.department && (
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {selectedUser.department}
                </span>
              )}
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p>{selectedUser?.details}</p>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setIsOpen(false)}
                className="py-2 px-4 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 focus:outline-none transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}