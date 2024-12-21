import React from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import SignIn from './pages/SignIn';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Farms from "./pages/Farms.tsx";
import Crop from "./pages/Crops.tsx";
import Reports from "./pages/Reports.tsx";
import Sidebar from './components/common/Sidebar.tsx';

const App: React.FC = () => {
    return (
        <Router> {/* Single Router component wrapping the whole app */}
            <div className='flex h-screen bg-gray-900 text-gray-100 overflow-hidden'>
                {/* Background */}
                <div className='fixed inset-0 -z-10'>
                    <div className='absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 opacity-80' />
                    <div className='absolute inset-0 backdrop-blur-sm' />
                </div>

                <Sidebar /> {/* Sidebar is outside of the Router */}

                <Routes> {/* Routes are inside the Router */}
                    <Route path="/" element={<Navigate to="/signin" replace />} />
                    <Route path="/signin" element={<SignIn />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/AdminDashboard" element={<AdminDashboard />} />
                    <Route path="/Farms" element={<Farms />} />
                    <Route path="/Crops" element={<Crop />} />
                    <Route path="/Reports" element={<Reports />} />
                </Routes>
            </div>
        </Router>
    );
};

export default App;
