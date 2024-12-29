import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Edit, Search, Trash2, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { unmarshall } from '@aws-sdk/util-dynamodb';

// Define TypeScript interfaces for crop data
interface Crop {
    CropID: string;
    GrowthStage: {
        ini: number;
        mid: number;
        end: number;
    };
    ImageURL: string;
    kc: {
        ini: number;
        mid: number;
        end: number;
    };
    nameAR: string;
    nameEN: string;
}

const CropsTable: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [cropsData, setCropsData] = useState<Crop[]>([]);
    const [filteredCrops, setFilteredCrops] = useState<Crop[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();

    // Function to transform raw crop data into desired format
    const transformCropData = (rawData: any[]): Crop[] => {
       debugger
        return rawData.map((crop: any) => ({
            CropID:crop.CropID,
            GrowthStage: {
                ini: Number(crop.GrowthStage.ini),
                mid: Number(crop.GrowthStage.mid),
                end: Number(crop.GrowthStage.end)
            },
            ImageURL: crop.ImageURL,
            kc: {
                ini: Number(crop.kc.ini),
                mid: Number(crop.kc.mid),
                end: Number(crop.kc.end)
            },
            nameAR: crop.nameAR,
            nameEN: crop.nameEN
        }));
    };

    // Fetch crop data from API
    useEffect(() => {
        const fetchCrops = async () => {
            const idToken = localStorage.getItem('idToken');
            // if (!idToken) {
            //     setError('User is not authenticated.');
            //     setLoading(false);
            //     return;
            // }

            const api = import.meta.env.VITE_API_URL;
            if (!api) {
                setError('API URL is not defined.');
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get(`${api}/admin/crops`, {
                    headers: { Authorization: `Bearer ${idToken}` }
                });

                // Parse DynamoDB items using unmarshall
                const parsedData = response.data.map((item: any) => unmarshall(item));

                // Transform data into desired format
                const transformedData = transformCropData(parsedData);

                setCropsData(transformedData);
                setFilteredCrops(transformedData);
                setLoading(false);
            } catch (err: any) {
                console.error('Error fetching crops:', err);
                setError('Failed to fetch crop data.');
                setLoading(false);
            }
        };

        fetchCrops();
    }, []);

    // Handle search input changes
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);

        if (term === '') {
            setFilteredCrops(cropsData);
        } else {
            const filtered = cropsData.filter(
                (crop) =>
                    crop.nameEN.toLowerCase().includes(term) ||
                    crop.nameAR.includes(term)
            );
            setFilteredCrops(filtered);
        }
    };

    // Navigate to Crop Add Form
    const navigateToCropAdd = () => {
        navigate('/Cropform'); // No state passed, indicating add mode
    };

    // Navigate to Crop Edit Form with Crop Data
    const navigateToEditCrop = (crop: Crop) => {
        navigate('/Cropform', { state: { crop } }); // Pass the entire crop object
    };

    // Handle Delete Crop (Implement as needed)
    const handleDeleteCrop = async (cropID: number) => {
        const confirmDelete = window.confirm('Are you sure you want to delete this crop?');
        if (!confirmDelete) return;

        const idToken = localStorage.getItem('idToken');
        const api = import.meta.env.VITE_API_URL;

        try {
            await axios.delete(`${api}/delete/crop/${cropID}`, {
                headers: { Authorization: `Bearer ${idToken}` }
            });
            // Update the state to remove the deleted crop
            const updatedCrops = cropsData.filter(crop => crop.CropID !== cropID);
            setCropsData(updatedCrops);
            setFilteredCrops(updatedCrops);
            alert('Crop deleted successfully.');
        } catch (err) {
            console.error('Error deleting crop:', err);
            alert('Failed to delete crop.');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-white">Loading crops...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-red-500">{error}</div>
            </div>
        );
    }

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
                <button
                    className="bg-indigo-500 text-white hover:bg-indigo-400 p-2 rounded-full shadow-lg transition duration-300"
                    onClick={navigateToCropAdd}
                >
                    <Plus size={18} />
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead>
                    <tr>
                        {/* Changed from "Crop ID" to "Crop Image" */}
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 tracking-wider">
                            Crop Image
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 tracking-wider">
                            Name in English
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 tracking-wider">
                            Name in Arabic
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 tracking-wider">
                            Growth Stage
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 tracking-wider">
                            Kc
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
                            className="hover:bg-gray-700"
                        >
                            {/* Display Crop Image instead of Crop ID */}
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">
                                <img
                                    src={crop.ImageURL}
                                    alt={crop.nameEN}
                                    className="w-10 h-10 rounded-full object-cover"
                                />
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{crop.nameEN}</td>

                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{crop.nameAR}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                {`ini: ${crop.GrowthStage.ini}, mid: ${crop.GrowthStage.mid}, end: ${crop.GrowthStage.end}`}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                {`ini: ${crop.kc.ini}, mid: ${crop.kc.mid}, end: ${crop.kc.end}`}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 flex items-center">
                                <button
                                    className="text-indigo-400 hover:text-indigo-300 mr-2"
                                    onClick={() => navigateToEditCrop(crop)} // Pass the entire crop object
                                >
                                    <Edit size={18} />
                                </button>
                                <button
                                    className="text-red-400 hover:text-red-300"
                                    onClick={() => handleDeleteCrop(crop.CropID)} // Handle delete
                                >
                                    <Trash2 size={18} />
                                </button>
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
