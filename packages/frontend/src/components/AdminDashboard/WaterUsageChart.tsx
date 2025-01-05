import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { motion } from "framer-motion";

const Water_Data = [
    { name: 'October', "Before SAQI": 4000, "After SAQI": 2400 },
    { name: 'November', "Before SAQI": 3000, "After SAQI": 1398 },
    { name: 'December', "Before SAQI": 2000, "After SAQI": 9800 },
    { name: 'January', "Before SAQI": 2780, "After SAQI": 3908 },
    { name: 'February', "Before SAQI": 1890, "After SAQI": 4800 },
    { name: 'March', "Before SAQI": 2390, "After SAQI": 3800 },
];

const WaterUsageChart: React.FC = () => {
    return (
        <motion.div
            className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
        >
            <h2 className='text-lg font-medium mb-4 text-gray-100'>Average Water usage Overview</h2>

            <div className='h-80'>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={Water_Data}
                        margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis
                            tickFormatter={(value) => `${value} liters`}
                            style={{ fontSize: '12px' }}
                        />
                        <Tooltip
                            formatter={(value) => `${value} liters`}
                            itemStyle={{ fontSize: '12px' }}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="Before SAQI" stroke="#82ca9d" />
                        <Line type="monotone" dataKey="After SAQI" stroke="#8884d8" activeDot={{ r: 8 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
};

export default WaterUsageChart;
