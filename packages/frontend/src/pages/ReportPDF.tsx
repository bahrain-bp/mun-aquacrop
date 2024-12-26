import React from 'react';
import { motion } from 'framer-motion';
import Header from "../components/common/Header.tsx";
import RecommendationsOverviewChart from "../components/AdminDashboard/RecommendationsOverviewChart.tsx";

const ReportPDF: React.FC = () => {
    // Dummy data for the report
    const reportData = {
        companyName: 'SAQI',
        logoURL: 'https://saqidev-mun-aquacrop-s3st-cropsimagesbucket37842e6-jwc87ujx6vua.s3.us-east-1.amazonaws.com/images/saqi-logo-1', // Placeholder for the logo
        introduction: `SAQI Solutions presents the latest report on water usage and irrigation recommendations for your crops. 
        This report includes detailed insights into the water consumption patterns and the need for irrigation adjustments.`,
        statistics: {
            totalCrops: 11,
            totalWaterUsage: 122, // in liters
            averageWaterPerCrop: 8.387, // in liters per crop
            recommendations: 30, // number of recommendations for water adjustment
        }
    };

    return (
        <div className="flex-1 overflow-auto relative z-10">
            <Header title='Report Generation' />
            <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
                <motion.div
                    className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700 mb-8 m-auto"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    {/* A4-like page structure */}
                    <div
                        className="flex items-center justify-center min-h-screen bg-gray-800"> {/* Center content horizontally & vertically */}
                        <div className="bg-white p-8 rounded-lg shadow-lg"
                             style={{maxWidth: '21cm', minHeight: '29.7cm'}}>
                            {/* Header Section */}
                            <div className="flex items-center justify-between mb-8">
                                <img
                                    src={reportData.logoURL}
                                    alt="Company Logo"
                                    className="w-32 h-auto"
                                />
                                <h1 className="text-3xl font-semibold text-gray-800">{reportData.companyName}</h1>
                            </div>

                            {/* Introduction Section */}
                            <div className="mb-6">
                                <h2 className="text-2xl font-semibold text-gray-800 mb-2">Introduction</h2>
                                <p className="text-gray-700">{reportData.introduction}</p>
                            </div>

                            {/* Water Usage Statistics Section */}
                            <div className="mt-8">
                                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Water Usage Statistics</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-gray-100 p-4 rounded-lg">
                                        <h3 className="text-lg font-medium text-gray-700">Total Crops</h3>
                                        <p className="text-xl text-gray-900">{reportData.statistics.totalCrops}</p>
                                    </div>
                                    <div className="bg-gray-100 p-4 rounded-lg">
                                        <h3 className="text-lg font-medium text-gray-700">Total Water Usage</h3>
                                        <p className="text-xl text-gray-900">{reportData.statistics.totalWaterUsage} Liters</p>
                                    </div>
                                    <div className="bg-gray-100 p-4 rounded-lg">
                                        <h3 className="text-lg font-medium text-gray-700">Average Water per Crop</h3>
                                        <p className="text-xl text-gray-900">{reportData.statistics.averageWaterPerCrop} Liters</p>
                                    </div>
                                    <div className="bg-gray-100 p-4 rounded-lg">
                                        <h3 className="text-lg font-medium text-gray-700">Recommendations</h3>
                                        <p className="text-xl text-gray-900">{reportData.statistics.recommendations} Recommendations</p>
                                    </div>
                                </div>
                            </div>

                            {/* New div for Recommendations Overview Chart */}
                            <div className="mt-8 mb-12">
                                <RecommendationsOverviewChart />
                            </div>

                            {/* Footer Section */}
                            <div className="mt-12 text-center text-gray-600">
                                <p>For more information, contact us at: <a href="mailto:support@saqi.com"
                                                                           className="text-blue-600">support@saqi.com</a></p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </main>
        </div>
    );
};

export default ReportPDF;
