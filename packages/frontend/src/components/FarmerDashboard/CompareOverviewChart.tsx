import React from 'react';
import {LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer} from 'recharts';
import {motion} from 'framer-motion';

const data = [
    {
        name: 'Jan',
        WithSAQI: 1000,
        WithOutSAQI: 2400,
    },
    {
        name: 'Feb',
        WithSAQI: 3000,
        WithOutSAQI: 2398,
    },
    {
        name: 'Mar',
        WithSAQI: 2000,
        WithOutSAQI: 2800,
    },
    {
        name: 'Apr',
        WithSAQI: 2780,
        WithOutSAQI: 2908,
    },
    {
        name: 'May',
        WithSAQI: 1890,
        WithOutSAQI: 2800,
    },
    {
        name: 'Jun',
        WithSAQI: 2390,
        WithOutSAQI: 3800,
    },
    {
        name: 'Jul',
        WithSAQI: 2300,
        WithOutSAQI: 4520,
    },
    {
        name: 'Aug',
        WithSAQI: 1890,
        WithOutSAQI: 4420,
    },
    {
        name: 'Sep',
        WithSAQI: 2390,
        WithOutSAQI: 4230,
    },
    {
        name: 'Oct',
        WithSAQI: 2390,
        WithOutSAQI: 2800,
    },
    {
        name: 'Nov',
        WithSAQI: 1490,
        WithOutSAQI: 2300,
    },
    {
        name: 'Dec',
        WithSAQI: 1890,
        WithOutSAQI: 2800,
    },
];

const CompareOverviewChart: React.FC = () => {
    return (
        <motion.div
            className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700'
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            transition={{delay: 0.2}}
        >
            <h2 className='text-lg font-medium mb-4 text-gray-100'>Water Usage Overview</h2>

            <div className='h-80'>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        width={500}
                        height={300}
                        data={data}
                        margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3"/>
                        <XAxis dataKey="name"/>
                        <YAxis/>
                        <Tooltip/>
                        <Legend/>
                        <Line type="monotone" dataKey="WithOutSAQI" stroke="#8884d8" activeDot={{r: 8}}/>
                        <Line type="monotone" dataKey="WithSAQI" stroke="#82ca9d"/>
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
);
};

export default CompareOverviewChart;