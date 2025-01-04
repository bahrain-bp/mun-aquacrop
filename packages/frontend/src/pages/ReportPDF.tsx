import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import axios from 'axios';
import Header from "../components/common/Header.tsx";
import RecommendationsOverviewChart from "../components/AdminDashboard/RecommendationsOverviewChart.tsx";

const ReportPDF: React.FC = () => {
    const [stats, setStats] = useState({
        totalCrops: 0,
        totalRecommendations: 0,
        totalWaterUsage: 0
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

    const reportData = {
        companyName: 'SAQI',
        logoURL: 'https://saqidev-mun-aquacrop-s3st-cropsimagesbucket37842e6-jwc87ujx6vua.s3.us-east-1.amazonaws.com/images/saqi-logo-1', // Placeholder for the logo
        introduction: `SAQI Solutions presents the latest report on water usage and irrigation recommendations for your crops. 
        This report includes detailed insights into the water consumption patterns and the need for irrigation adjustments.`,
        statistics: {
            totalCrops: loading ? 0 : stats.totalCrops,
            totalWaterUsage: loading ? 0 : stats.totalWaterUsage,
            averageWaterPerCrop: loading ? 0 : (stats.totalCrops > 0 ? stats.totalWaterUsage / stats.totalCrops : 0),
            recommendations: loading ? 0 : stats.totalRecommendations,
        }
    };

    const pdfRef = useRef<HTMLDivElement>(null); // Type the ref to be a div

    // Function to capture the content and generate PDF
    const generatePDF = () => {
        const input = pdfRef.current;
        if (!input) return;

        html2canvas(input, {
            useCORS: true,  // This helps with external images
            logging: true,  // Enable logging to check if any errors occur
        }).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
            const imgX = (pdfWidth - imgWidth * ratio) / 2;
            const imgY = 30;

            // Add image to PDF
            pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);

            // Save the PDF
            pdf.save('report.pdf');
        });
    };

    return (
        <div className="flex-1 overflow-auto relative z-10">
            <Header title="Report Generation" />
            <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}
                <motion.div
                    className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700 mb-8 m-auto"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    {/* A4-like page structure */}
                    <div className="flex items-center justify-center min-h-screen bg-white" ref={pdfRef}>
                        <div
                            className="bg-white p-8 rounded-lg shadow-lg w-full"
                        >
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
                                        <p className="text-xl text-gray-900">{reportData.statistics.averageWaterPerCrop.toFixed(2)} Liters</p>
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
                                <p>For more information, contact us at: <a href="mailto:support@saqi.com" className="text-blue-600">support@saqi.com</a></p>
                            </div>
                        </div>
                    </div>

                    {/* Download PDF Button */}
                    <div className="mt-8 flex justify-center">
                        <button
                            onClick={generatePDF}
                            className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700"
                        >
                            Download PDF
                        </button>
                    </div>
                </motion.div>
            </main>
        </div>
    );
};

export default ReportPDF;
