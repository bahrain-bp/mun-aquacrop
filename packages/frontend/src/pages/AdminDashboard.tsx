import React, { useEffect, useState } from 'react';
import { Authenticator } from '@aws-amplify/ui-react';
import axios from 'axios';
import '@aws-amplify/ui-react/styles.css';
import Header from '../components/common/Header.tsx'
import {motion} from 'framer-motion';
import StatCard from '../components/common/StatCard.tsx'
import {Cloud, TreePine, Users, Droplet} from "lucide-react";
import RecommendationsOverviewChart from "../components/AdminDashboard/RecommendationsOverviewChart.tsx";
import CategoryChart from "../components/AdminDashboard/CategoryChart.tsx";
import CropsChart from "../components/AdminDashboard/CropsChart";

interface Stats {
    totalRecommendations: number;
    totalUsers: number;
    totalCrops: number;
}

const DashboardContent: React.FC = () => {
    const [stats, setStats] = useState<Stats>({
        totalRecommendations: 0,
        totalUsers: 0,
        totalCrops: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/adminDashboard/stats`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                setStats(response.data);
                setError(null);
            } catch (err) {
                console.error('Error fetching stats:', err);
                setError(err.response?.data?.message || 'Failed to load statistics');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    return (
        <div className='flex-1 overflow-auto relative z-10'>
            <Header title='Admin Dashboard'/>
            <main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <motion.div
                    className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8'
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 1}}
                >
                    <StatCard 
                        name='Total Recommendations' 
                        icon={Droplet} 
                        value={loading ? '...' : stats.totalRecommendations.toString()} 
                        color='#6366F1'
                    />
                    <StatCard 
                        name='Total Users' 
                        icon={Users} 
                        value={loading ? '...' : stats.totalUsers.toString()} 
                        color='#8B5CF6'
                    />
                    <StatCard 
                        name='Total Crops' 
                        icon={TreePine} 
                        value={loading ? '...' : stats.totalCrops.toString()} 
                        color='#EC4899'
                    />
                    <StatCard name='Weather' icon={Cloud} value='12.5' color='#10B981'/>
                </motion.div>

                <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
                    <RecommendationsOverviewChart/>
                    <CategoryChart/>
                    <CropsChart/>
                </div>
            </main>
        </div>
    );
};

const AdminDashboard: React.FC = () => {
    return (
        <Authenticator>
            {({ signOut, user }) => (
                <DashboardContent />
            )}
        </Authenticator>
    );
};

export default AdminDashboard;