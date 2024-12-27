import React from 'react';
import { motion } from 'framer-motion';  // Add this line to import motion
import Header from '../components/common/Header.tsx';
import StatCard from "../components/common/StatCard.tsx";
import {TrendingUp, Cloud, ArrowDownNarrowWide, TreePine} from "lucide-react";
import CropsTable from "../components/Crop/CropsTable.tsx";

const Crops: React.FC = () => {
    return (
        <div className="flex-1 overflow-auto relative z-10">
            <Header title='Crops'/>

            <main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
                {/* STATS */}
                <motion.div
                    className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8'
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 1}}
                >
                    <StatCard name='Total Crops' icon={TreePine} value={1234} color='#6366F1' />
                    <StatCard name='Top Crops' icon={TrendingUp} value={89} color='#10B981' />
                    <StatCard name='less Crops' icon={ArrowDownNarrowWide} value={23} color='#F59E0B' />
                    <StatCard name='Weather' icon={Cloud} value='12.5°C' color='#10B981'/>
                </motion.div>

                <CropsTable />
            </main>
        </div>
    );
};

export default Crops;
