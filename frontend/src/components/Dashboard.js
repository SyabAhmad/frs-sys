import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserPlus, FaCamera, FaSignOutAlt, FaUserCheck } from 'react-icons/fa';

const Dashboard = () => {
    const navigate = useNavigate();
    
    const handleAddPeopleClick = () => {
        navigate('/add-people');
    };

    const handleScanPeopleClick = () => {
        navigate('/scan-people');
    };

    const handleLogout = () => {
        // Perform logout logic (e.g., clear tokens/storage)
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
            {/* Top Header Section */}
            <div className="container mx-auto px-6 py-8">
                <div className="flex justify-between items-center mb-12">
                    <div className="flex items-center space-x-3">
                        <div className="h-12 w-12 rounded-full bg-teal-500 flex items-center justify-center">
                            <FaUserCheck className="text-2xl text-white" />
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-white">FaceID Dashboard</h1>
                    </div>
                    
                    <button 
                        onClick={handleLogout}
                        className="flex items-center space-x-2 px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                        <FaSignOutAlt />
                        <span>Logout</span>
                    </button>
                </div>
                
                {/* Welcome Section */}
                <div className="mb-12 bg-slate-800 rounded-xl p-6 shadow-xl border border-slate-700">
                    <h2 className="text-2xl font-semibold mb-3 text-white">Welcome to Face Recognition System</h2>
                    <p className="text-slate-300">
                        Select an option below to manage your face recognition database or identify individuals.
                    </p>
                </div>
                
                {/* Main Action Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Add Person Card */}
                    <div 
                        onClick={handleAddPeopleClick}
                        className="group relative bg-gradient-to-br from-teal-600 to-teal-800 rounded-xl overflow-hidden shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 cursor-pointer border border-teal-700"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mt-10 -mr-10"></div>
                        
                        <div className="p-8">
                            <div className="mb-6 p-4 bg-teal-500 rounded-full w-16 h-16 flex items-center justify-center">
                                <FaUserPlus className="text-2xl text-white" />
                            </div>
                            
                            <h3 className="text-2xl font-bold mb-3 text-white">Add Person</h3>
                            
                            <p className="text-teal-100 mb-6">
                                Register a new person in the facial recognition database with their details and face image.
                            </p>
                            
                            <div className="flex items-center justify-between">
                                <span className="text-xs uppercase tracking-wider font-semibold text-teal-200">Database Management</span>
                                <span className="bg-teal-700 px-4 py-2 rounded-lg text-sm font-medium text-white group-hover:bg-teal-600 transition-all duration-300">
                                    Get Started
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Scan Face Card */}
                    <div 
                        onClick={handleScanPeopleClick}
                        className="group relative bg-gradient-to-br from-amber-600 to-amber-800 rounded-xl overflow-hidden shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 cursor-pointer border border-amber-700"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mt-10 -mr-10"></div>
                        
                        <div className="p-8">
                            <div className="mb-6 p-4 bg-amber-500 rounded-full w-16 h-16 flex items-center justify-center">
                                <FaCamera className="text-2xl text-white" />
                            </div>
                            
                            <h3 className="text-2xl font-bold mb-3 text-white">Scan Face</h3>
                            
                            <p className="text-amber-100 mb-6">
                                Scan and identify a person using facial recognition technology with real-time matching.
                            </p>
                            
                            <div className="flex items-center justify-between">
                                <span className="text-xs uppercase tracking-wider font-semibold text-amber-200">Recognition</span>
                                <span className="bg-amber-700 px-4 py-2 rounded-lg text-sm font-medium text-white group-hover:bg-amber-600 transition-all duration-300">
                                    Scan Now
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* System Stats Section */}
                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                        <h4 className="font-medium text-slate-400 mb-1">Total Records</h4>
                        <div className="text-3xl font-bold text-white">124</div>
                    </div>
                    
                    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                        <h4 className="font-medium text-slate-400 mb-1">Successful Matches</h4>
                        <div className="text-3xl font-bold text-white">97%</div>
                    </div>
                    
                    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                        <h4 className="font-medium text-slate-400 mb-1">System Status</h4>
                        <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-emerald-500 mr-2"></div>
                            <div className="text-xl font-semibold text-white">Active</div>
                        </div>
                    </div>
                </div>
                
                {/* Footer */}
                <div className="mt-12 pt-6 border-t border-slate-700 text-center text-sm text-slate-400">
                    Face Recognition System &copy; {new Date().getFullYear()} | Secure Facial Identification
                </div>
            </div>
        </div>
    );
};

export default Dashboard;