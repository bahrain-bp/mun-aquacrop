import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Header from '../components/common/Header';
import {Authenticator} from "@aws-amplify/ui-react";
import StatCard from "../components/common/StatCard.tsx";
import {Cloud, Droplet, TreePine, Users} from "lucide-react";

const Dashboard: React.FC = () => {
    const [selectedFarm, setSelectedFarm] = useState<any>(null);
    const [zones, setZones] = useState<any[]>([
        { id: 1, name: 'Zone 1', CropImageURL: 'https://via.placeholder.com/100' },
        { id: 2, name: 'Zone 2', CropImageURL: 'https://via.placeholder.com/100' },
        // Add other zone data here
    ]);

    const farms = [
        { id: 1, name: 'Farm 1' },
        { id: 2, name: 'Farm 2' },
        // Add other farm data here
    ];

    const handleFarmSelect = (farm: any) => {
        setSelectedFarm(farm);
    };

    const handleZoneAction = (zone: any) => {
        alert(`Zone ${zone.name} clicked`);
    };

    return (
        <Authenticator>
            <div className="flex-1 overflow-auto relative z-10">
                <Header title="Dashboard" />

                <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
                    {/* STATS */}
                    <motion.div
                        className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1 }}
                    >
                        <StatCard name="Total Recommendations" icon={Droplet} value="12345" color="#6366F1" />
                        <StatCard name="Total Users" icon={Users} value="1234" color="#8B5CF6" />
                        <StatCard name="Total Crops" icon={TreePine} value="11" color="#EC4899" />
                        <StatCard name="Weather" icon={Cloud} value="12.5" color="#10B981" />
                    </motion.div>

                    {/* Farm Selection */}
                    <div className="flex gap-5 justify-center mb-8">
                        {farms.map((farm) => (
                            <button
                                key={farm.id}
                                onClick={() => handleFarmSelect(farm)}
                                className={`p-6 w-40 h-40 rounded-full border-2 transition-all ${
                                    selectedFarm?.id === farm.id
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-transparent text-gray-700'
                                }`}
                                style={{
                                    backgroundImage: `url('https://media.istockphoto.com/id/965148388/photo/green-ripening-soybean-field-agricultural-landscape.jpg?s=612x612&w=0&k=20&c=cEVP3uj34-5obt-Jf_WI3O9qfP6tVrFaQIv1rBvvpzc=')`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                }}
                            >
                                {farm.name}
                            </button>
                        ))}
                    </div>

                    {/* Zone Selection */}
                    {selectedFarm && (
                        <div className="flex gap-6 justify-center mb-8">
                            {zones.map((zone) => (
                                <div
                                    key={zone.id}
                                    className="flex flex-col items-center text-center"
                                >
                                    {zone.CropImageURL ? (
                                        <img
                                            src={zone.CropImageURL}
                                            alt={zone.name}
                                            className="w-24 h-24 object-cover rounded-lg border border-gray-300 mb-4"
                                        />
                                    ) : (
                                        <p className="mb-4 text-gray-500">No Image</p>
                                    )}
                                    <button
                                        onClick={() => handleZoneAction(zone)}
                                        className="px-4 py-2 bg-teal-500 text-white rounded-md transition-all hover:bg-teal-400"
                                    >
                                        {zone.name}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </Authenticator>
    );
};

export default Dashboard;
