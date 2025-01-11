import React from 'react';
import { motion } from 'framer-motion';  // Import motion
import { Link } from 'react-router-dom';  // Import Link from react-router-dom
import Header from '../components/common/Header.tsx';
import StatCard from "../components/common/StatCard.tsx";
import { BookCheck } from "lucide-react";

const Reports: React.FC = () => {
    return (
        <div className="flex-1 overflow-auto relative z-10">
            <Header title='Reports' />

            <main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
                {/* STATS */}
                <motion.div
                    className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-1 mb-8'
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                >
                    {/* Wrap StatCard with Link component */}
                    <Link to="/ReportPDF">
                        <StatCard
                            name=""
                            icon={BookCheck}
                            value="Generate Total Recommendation"
                            color="#6366F1"
                        />
                    </Link>
                    <Link to="/ReportPDF">
                        <StatCard
                            name=""
                            icon={BookCheck}
                            value="Additional Report"
                            color="#10B981"
                        />
                    </Link>
                </motion.div>
            </main>
        </div>
    );
};

export default Reports;
