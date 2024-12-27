import React from 'react';
import { motion } from 'framer-motion';
import { useForm } from "react-hook-form";
import Header from "../components/common/Header.tsx";

const FarmForm: React.FC = () => {
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
            <Header title='Farm Edit'/>
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
                        <h1 className="text-2xl font-semibold text-center mb-6">Farm Form</h1>

                        <div className="mb-4">
                            <label htmlFor="cropID" className="block text-sm font-medium text-gray-200">Farm ID</label>
                            <input
                                id="farmID"
                                {...register("farmID")}
                                disabled // Disable the input
                                className="w-full p-3 mt-1 text-gray-800 rounded-md border border-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <div className="mb-4">
                            <label htmlFor="nameEN" className="block text-sm font-medium text-gray-200">Farm Name</label>
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