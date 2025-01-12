import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Edit, Search, Trash2, Plus } from 'lucide-react';
import {useNavigate } from 'react-router-dom';

const FARMS_DATA = [
    { FarmID: 1, Name: 'Green Valley', Location: 'California, USA' },
    { FarmID: 2, Name: 'Sunny Acres', Location: 'Texas, USA' },
];

const FarmTable: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredFarm, setfilteredFarm] = useState(FARMS_DATA);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);

        const filtered = FARMS_DATA.filter(
            (farm) =>
                farm.Name.toLowerCase().includes(term)
        );

        setfilteredFarm(filtered);
    };

    const navigate = useNavigate(); // Create navigate function


    const navigateToFarmForm = () => {
        navigate('/FarmForm');
    };

    return (
        <motion.div
            className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
        >
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-100">Crops List</h2>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search Farms..."
                        className="bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onChange={handleSearch}
                        value={searchTerm}
                    />
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                </div>
            </div>

            {/* Add Plus Button under the search */}
            <div className="mb-4 flex justify-end">
                <button className="bg-indigo-500 text-white hover:bg-indigo-400 p-2 rounded-full shadow-lg transition duration-300"
                        onClick={navigateToFarmForm}
                >
                    <Plus size={18} />
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead>
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 tracking-wider">
                            Form ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 tracking-wider">
                            Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 tracking-wider">
                            Location
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 tracking-wider">
                            Actions
                        </th>
                    </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-700">
                    {filteredFarm.map((farm) => (
                        <motion.tr
                            key={farm.FarmID}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                        >
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100 flex gap-2 items-center">
                                <img
                                    src={'https://albilad.s3.me-south-1.amazonaws.com/images/news/2018/11/aa03121104_6793.jpg'}
                                    alt="Product img"
                                    className="size-10 rounded-full"
                                />
                                {farm.FarmID}
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{farm.Name}</td>

                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{farm.Location}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                <button className="text-indigo-400 hover:text-indigo-300 mr-2"
                                        onClick={navigateToFarmForm}

                                >
                                    <Edit size={18}/>
                                </button>
                                {/*<button className="text-red-400 hover:text-red-300">*/}
                                {/*    <Trash2 size={18}/>*/}
                                {/*</button>*/}
                                <button
                                    className="text-red-400 hover:text-red-300"
                                >
                                    <Trash2 size={18}/>
                                </button>
                                {/*<Link*/}
                                {/*    to="/CropForm" // Replace this with the desired route to navigate*/}
                                {/*    className="text-red-400 hover:text-red-300"*/}
                                {/*>*/}
                                {/*    <Trash2 size={18} />*/}
                                {/*</Link>*/}
                            </td>
                        </motion.tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
};

export default FarmTable;
