import React from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import SignIn from './pages/SignIn';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Farms from "./pages/Farms.tsx";
import Crop from "./pages/Crops.tsx";
import Reports from "./pages/Reports.tsx";
import Sidebar from './components/common/Sidebar.tsx';
import CropForm from "./pages/CropForm.tsx";
import FarmForm from "./pages/FarmsForm.tsx";
import ReportPDF from "./pages/ReportPDF.tsx";
import ProtectedRoute from './components/common/ProtectedRoute';

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
                    <Route path="/Farms" element={
                        <ProtectedRoute adminForbidden>
                            <Farms />
                        </ProtectedRoute>
                    } />
                    <Route path="/Crops" element={
                        <ProtectedRoute>
                            <Crop />
                        </ProtectedRoute>
                    } />
                    <Route path="/Reports" element={
                        <ProtectedRoute>
                            <Reports />
                        </ProtectedRoute>
                    } />
                    <Route path="/CropForm" element={<CropForm />} />
                    <Route path="/FarmForm" element={<FarmForm />} />
                    <Route path="/ReportPDF" element={<ReportPDF />} />
                </Routes>

            </div>
        </Router>
    );
};

export default App;
