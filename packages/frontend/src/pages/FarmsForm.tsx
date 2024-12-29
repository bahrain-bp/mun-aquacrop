import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from "react-hook-form";
import Header from "../components/common/Header.tsx";

const CROPS_DATA = [
    { CropID: 1, GrowthStage: 'ini : 10 , mid : 50, end : 60', ImageURL: 'https://saqidev-mun-aquacrop-s3st-cropsimagesbucket37842e6-jwc87ujx6vua.s3.us-east-1.amazonaws.com/images/lettuce.png', kc: 'ini : 0.7 , mid : 1, end : 0.95', nameAR: 'خس', nameEN: 'Lettuce' },
    { CropID: 2, GrowthStage: 'ini : 15 , mid : 85, end : 100', ImageURL: 'https://saqidev-mun-aquacrop-s3st-cropsimagesbucket37842e6-jwc87ujx6vua.s3.us-east-1.amazonaws.com/images/corn.png', kc: 'ini : 0.3 , mid : 1.15, end : 1.79585632602', nameAR: 'ذرة', nameEN: 'Sweet corn' },
    { CropID: 3, GrowthStage: 'ini : 15 , mid : 60, end : 70', ImageURL: 'https://saqidev-mun-aquacrop-s3st-cropsimagesbucket37842e6-jwc87ujx6vua.s3.us-east-1.amazonaws.com/images/beetroot.png', kc: 'ini : 0.5 , mid : 1.05, end : 0.95', nameAR: 'شمندر', nameEN: 'Beetroot' },
    { CropID: 4, GrowthStage: 'ini : 20 , mid : 75, end : 90', ImageURL: 'https://saqidev-mun-aquacrop-s3st-cropsimagesbucket37842e6-jwc87ujx6vua.s3.us-east-1.amazonaws.com/images/eggplant.png', kc: 'ini : 0.6 , mid : 1.05, end : 0.9', nameAR: 'باذنجان', nameEN: 'Eggplants' },
    { CropID: 5, GrowthStage: 'ini : 20 , mid : 80, end : 100', ImageURL: 'https://saqidev-mun-aquacrop-s3st-cropsimagesbucket37842e6-jwc87ujx6vua.s3.us-east-1.amazonaws.com/images/cauliflower.png', kc: 'ini : 0.7 , mid : 1.05, end : 0.95', nameAR: 'قرنبيط', nameEN: 'Cauliflower' }
];

const FarmForm: React.FC = () => {
    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue
    } = useForm();

    const [selectedCrop, setSelectedCrop] = useState<string>(''); // State for selected crop

    const onSubmit = (data) => {
        alert(JSON.stringify(data));
    };

    // Handler for changing crop selection
    const handleCropChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedCrop(e.target.value);
        setValue("crop", e.target.value); // Update the form value for crop
    };

    return (
        <div className="flex-1 overflow-auto relative z-10">
            <Header title='Farm Edit' />
            <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
                <motion.div
                    className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700 mb-8 m-auto"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full mx-auto"
                    >
                        <h1 className="text-2xl font-semibold text-center mb-6">Farm Form</h1>

                        <div className="mb-4">
                            <label htmlFor="farmID" className="block text-sm font-medium text-gray-200">Farm ID</label>
                            <input
                                id="farmID"
                                {...register("farmID")}
                                disabled // Disable the input
                                className="w-full p-3 mt-1 text-gray-800 rounded-md border border-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <div className="mb-4">
                            <label htmlFor="FarmName" className="block text-sm font-medium text-gray-200">Farm Name</label>
                            <input
                                id="FarmName"
                                {...register("FarmName", { required: "Farm Name is required" })}
                                className="w-full p-3 mt-1 text-gray-800 rounded-md border border-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            {errors.FarmName && <p className="text-red-400">{errors.FarmName.message}</p>}
                        </div>

                        <div className="mb-4">
                            <label htmlFor="Location" className="block text-sm font-medium text-gray-200">Location</label>
                            <input
                                id="Location"
                                {...register("Location", { required: "Location is required" })}
                                className="w-full p-3 mt-1 text-gray-800 rounded-md border border-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            {errors.Location && <p className="text-red-400">{errors.Location.message}</p>}
                        </div>

                        <div className="mb-4">
                            <label htmlFor="crop" className="block text-sm font-medium text-gray-200">Select Crop</label>
                            <select
                                id="crop"
                                value={selectedCrop}
                                onChange={handleCropChange}
                                {...register("crop", { required: "Crop selection is required" })}
                                className="w-full p-3 mt-1 text-gray-800 rounded-md border border-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">Select a crop</option>
                                {CROPS_DATA.map((crop) => (
                                    <option key={crop.CropID} value={crop.CropID}>
                                        {crop.nameEN}
                                    </option>
                                ))}
                            </select>
                            {errors.crop && <p className="text-red-400">{errors.crop.message}</p>}
                        </div>

                        <button
                            type="submit"
                            className="w-full p-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-500 transition"
                        >
                            Submit
                        </button>
                    </form>
                </motion.div>
            </main>
        </div>
    );
};

export default FarmForm;
