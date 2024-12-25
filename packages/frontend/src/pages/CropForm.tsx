import React from 'react';
import { motion } from 'framer-motion';
import { useForm } from "react-hook-form";
import Header from "../components/common/Header.tsx";

const CropForm: React.FC = () => {
    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm();

    const onSubmit = (data) => {
        alert(JSON.stringify(data));
    };

    return (
        <div className="flex-1 overflow-auto relative z-10">
            <Header title='Crops Edit'/>
            <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
                <motion.div
                    className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700 mb-8 m-auto"
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{delay: 0.2}}
                >
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full mx-auto"
                    >
                        <h1 className="text-2xl font-semibold text-center mb-6">Crop Form</h1>

                        <div className="mb-4">
                            <label htmlFor="cropID" className="block text-sm font-medium text-gray-200">Crop ID</label>
                            <input
                                id="cropID"
                                {...register("cropID")}
                                disabled // Disable the input
                                className="w-full p-3 mt-1 text-gray-800 rounded-md border border-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <div className="mb-4">
                            <label htmlFor="nameEN" className="block text-sm font-medium text-gray-200">Name (EN)</label>
                            <input
                                id="nameEN"
                                {...register("nameEN", { required: "English name is required" })}
                                className="w-full p-3 mt-1 text-gray-800 rounded-md border border-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            {errors.nameEN && <p className="text-red-400">{errors.nameEN.message}</p>}
                        </div>

                        <div className="mb-4">
                            <label htmlFor="nameAR" className="block text-sm font-medium text-gray-200">Name (AR)</label>
                            <input
                                id="nameAR"
                                {...register("nameAR", { required: "Arabic name is required" })}
                                className="w-full p-3 mt-1 text-gray-800 rounded-md border border-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            {errors.nameAR && <p className="text-red-400">{errors.nameAR.message}</p>}
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-200">Growth Stage</label>
                            <div className="grid grid-cols-3 gap-4">
                                <input
                                    placeholder="Initial"
                                    type="number"
                                    step="0.01"
                                    {...register("growthStage.initial", { required: "Initial growth stage is required" })}
                                    className="w-full p-3 mt-1 text-gray-800 rounded-md border border-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                                <input
                                    placeholder="Mid"
                                    type="number"
                                    step="0.01"
                                    {...register("growthStage.mid", { required: "Mid growth stage is required" })}
                                    className="w-full p-3 mt-1 text-gray-800 rounded-md border border-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                                <input
                                    placeholder="Final"
                                    type="number"
                                    step="0.01"
                                    {...register("growthStage.final", { required: "Final growth stage is required" })}
                                    className="w-full p-3 mt-1 text-gray-800 rounded-md border border-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            {errors.growthStage?.initial && <p className="text-red-400">{errors.growthStage.initial.message}</p>}
                            {errors.growthStage?.mid && <p className="text-red-400">{errors.growthStage.mid.message}</p>}
                            {errors.growthStage?.final && <p className="text-red-400">{errors.growthStage.final.message}</p>}
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-200">Kc</label>
                            <div className="grid grid-cols-3 gap-4">
                                <input
                                    placeholder="Initial"
                                    type="number"
                                    step="0.01"
                                    {...register("kc.initial", { required: "Initial Kc is required", min: { value: 0, message: "Must be a positive number" } })}
                                    className="w-full p-3 mt-1 text-gray-800 rounded-md border border-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                                <input
                                    placeholder="Mid"
                                    type="number"
                                    step="0.01"
                                    {...register("kc.mid", { required: "Mid Kc is required", min: { value: 0, message: "Must be a positive number" } })}
                                    className="w-full p-3 mt-1 text-gray-800 rounded-md border border-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                                <input
                                    placeholder="Final"
                                    type="number"
                                    step="0.01"
                                    {...register("kc.final", { required: "Final Kc is required", min: { value: 0, message: "Must be a positive number" } })}
                                    className="w-full p-3 mt-1 text-gray-800 rounded-md border border-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            {errors.kc?.initial && <p className="text-red-400">{errors.kc.initial.message}</p>}
                            {errors.kc?.mid && <p className="text-red-400">{errors.kc.mid.message}</p>}
                            {errors.kc?.final && <p className="text-red-400">{errors.kc.final.message}</p>}
                        </div>

                        <div className="mb-4">
                            <label htmlFor="imageURL" className="block text-sm font-medium text-gray-200">Image Upload</label>
                            <input
                                id="imageURL"
                                type="file"
                                {...register("imageURL", { required: "Image upload is required" })}
                                className="w-full p-3 mt-1 text-gray-800 rounded-md border border-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            {errors.imageURL && <p className="text-red-400">{errors.imageURL.message}</p>}
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

export default CropForm;