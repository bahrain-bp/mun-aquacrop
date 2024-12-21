import React from 'react';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import Header from '../components/common/Header.tsx'
import {motion} from 'framer-motion';
import StatCard from '../components/common/StatCard.tsx'
import {Cloud, TreePine, Users, Droplet} from "lucide-react";
import RecommendationsOverviewChart from "../components/AdminDashboard/RecommendationsOverviewChart.tsx";
import CategoryChart from "../components/AdminDashboard/CategoryChart.tsx";
import CropsChart from "../components/AdminDashboard/CropsChart";

const AdminDashboard: React.FC = () => {
  return (
    <Authenticator>
        <div className='flex-1 overflow-auto relative z-10'>
            <Header title='Admin Dashboard'/>

            <main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
                {/* STATS */}
                <motion.div
                    className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8'
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 1}}
                >
                    <StatCard name='Total Recommendations' icon={Droplet} value='12345' color='#6366F1'/>
                    <StatCard name='Total Users' icon={Users} value='1234' color='#8B5CF6'/>
                    <StatCard name='Total Crops' icon={TreePine} value='11' color='#EC4899'/>
                    <StatCard name='Weather' icon={Cloud} value='12.5' color='#10B981'/>
                </motion.div>

                {/* CHARTS */}

                <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
                    <RecommendationsOverviewChart/>
                    <CategoryChart/>
                    <CropsChart/>
                </div>
            </main>
        </div>

    </Authenticator>
  );
};

export default AdminDashboard;