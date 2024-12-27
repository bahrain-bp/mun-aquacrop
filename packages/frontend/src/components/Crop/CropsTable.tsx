import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Edit, Search, Trash2, Plus } from 'lucide-react';
import {useNavigate } from 'react-router-dom';

const CROPS_DATA = [
    { CropID: 1, GrowthStage: 'ini : 10 , mid : 50, end : 60', ImageURL: 'https://saqidev-mun-aquacrop-s3st-cropsimagesbucket37842e6-jwc87ujx6vua.s3.us-east-1.amazonaws.com/images/lettuce.png', kc: 'ini : 0.7 , mid : 1, end : 0.95', nameAR: 'خس', nameEN: 'Lettuce' },
    { CropID: 2, GrowthStage: 'ini : 15 , mid : 85, end : 100', ImageURL: 'https://saqidev-mun-aquacrop-s3st-cropsimagesbucket37842e6-jwc87ujx6vua.s3.us-east-1.amazonaws.com/images/corn.png', kc: 'ini : 0.3 , mid : 1.15, end : 1.79585632602', nameAR: 'ذرة', nameEN: 'Sweet corn' },
    { CropID: 3, GrowthStage: 'ini : 15 , mid : 60, end : 70', ImageURL: 'https://saqidev-mun-aquacrop-s3st-cropsimagesbucket37842e6-jwc87ujx6vua.s3.us-east-1.amazonaws.com/images/beetroot.png', kc: 'ini : 0.5 , mid : 1.05, end : 0.95', nameAR: 'شمندر', nameEN: 'Beetroot' },
    { CropID: 4, GrowthStage: 'ini : 20 , mid : 75, end : 90', ImageURL: 'https://saqidev-mun-aquacrop-s3st-cropsimagesbucket37842e6-jwc87ujx6vua.s3.us-east-1.amazonaws.com/images/eggplant.png', kc: 'ini : 0.6 , mid : 1.05, end : 0.9', nameAR: 'باذنجان', nameEN: 'Eggplants' },
    { CropID: 5, GrowthStage: 'ini : 20 , mid : 80, end : 100', ImageURL: 'https://saqidev-mun-aquacrop-s3st-cropsimagesbucket37842e6-jwc87ujx6vua.s3.us-east-1.amazonaws.com/images/cauliflower.png', kc: 'ini : 0.7 , mid : 1.05, end : 0.95', nameAR: 'قرنبيط', nameEN: 'Cauliflower' }
];

const CropsTable: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredCrops, setFilteredCrops] = useState(CROPS_DATA);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);

        const filtered = CROPS_DATA.filter(
            (crop) =>
                crop.nameEN.toLowerCase().includes(term) || crop.nameAR.includes(term)
        );

        setFilteredCrops(filtered);
    };

    const navigate = useNavigate(); // Create navigate function


    const navigateToCropEdit = () => {
        navigate('/Cropform');
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
                        placeholder="Search Crops..."
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
                        onClick={navigateToCropEdit}
                >
                    <Plus size={18} />
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead>
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 tracking-wider">
                            Crop ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 tracking-wider">
                            Name in English
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 tracking-wider">
                            Name in Arabic
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 tracking-wider">
                            GrowthStage
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 tracking-wider">
                            kc
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 tracking-wider">
                            Actions
                        </th>
                    </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-700">
                    {filteredCrops.map((crop) => (
                        <motion.tr
                            key={crop.CropID}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                        >
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100 flex gap-2 items-center">
                                <img
                                    src={crop.ImageURL}
                                    alt="Product img"
                                    className="size-10 rounded-full"
                                />
                                {crop.CropID}
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{crop.nameEN}</td>

                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{crop.nameAR}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{crop.GrowthStage}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{crop.kc}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                <button className="text-indigo-400 hover:text-indigo-300 mr-2"
                                        onClick={navigateToCropEdit} // Trigger navigation on button click
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

export default CropsTable;
