// CropForm.tsx

import React, {useState, useEffect} from 'react';
import {motion} from 'framer-motion';
import {useForm, SubmitHandler} from "react-hook-form";
import Header from "../components/common/Header";
import {useLocation, useNavigate} from 'react-router-dom';
import axios from 'axios';
import {ToastContainer, toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Crop {
    CropID: number;
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

interface CropFormInputs {
    cropID: number;
    nameEN: string;
    nameAR: string;
    growthStage: {
        ini: number;
        mid: number;
        final: number;
    };
    kc: {
        ini: number;
        mid: number;
        final: number;
    };
    imageURL: FileList;
}

const CropForm: React.FC = () => {
    const {
        register,
        handleSubmit,
        formState: {errors},
        setValue,
        watch,
        getValues
    } = useForm<CropFormInputs>({
        defaultValues: {
            cropID: 0,
            nameEN: '',
            nameAR: '',
            growthStage: {ini: 0, mid: 0, final: 0},
            kc: {ini: 0, mid: 0, final: 0},
            imageURL: undefined as unknown as FileList
        }
    });

    const location = useLocation();
    const navigate = useNavigate();
    const locationState = location.state as { crop: Crop } | undefined;
    const crop = locationState?.crop;

    // State to manage the current image preview
    const [currentImage, setCurrentImage] = useState<string>(crop ? crop.ImageURL : '');
    const [selectedImage, setSelectedImage] = useState<string | ArrayBuffer | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

    useEffect(() => {
        if (crop) {
            // Set default values for the form fields
            setValue("cropID", crop.CropID);
            setValue("nameEN", crop.nameEN);
            setValue("nameAR", crop.nameAR);
            setValue("growthStage.ini", crop.GrowthStage.ini);
            setValue("growthStage.mid", crop.GrowthStage.mid);
            setValue("growthStage.final", crop.GrowthStage.end);
            setValue("kc.ini", crop.kc.ini);
            setValue("kc.mid", crop.kc.mid);
            setValue("kc.final", crop.kc.end);
        }
    }, [crop, setValue]);

    // Watch for imageURL changes to update the preview
    const imageURL = watch("imageURL");

    useEffect(() => {
        if (imageURL && imageURL.length > 0) {
            const file = imageURL[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            setSelectedImage(null);
        }
    }, [imageURL]);

    const onSubmit: SubmitHandler<CropFormInputs> = async (data) => {
        setIsSubmitting(true);
        setSubmitError(null);
        setSubmitSuccess(null);
        try {
            let imageURL_S3 = currentImage; // Default to existing image in edit mode

            // If a new image is selected, upload it to S3
            if (data.imageURL && data.imageURL.length > 0) {
                const file = data.imageURL[0];
                // const fileName = encodeURIComponent(file.name);
                // const fileType = encodeURIComponent(file.type);

                // Step 1: Get the signed URL from the backend
                const uploadUrlResponse = await axios.post(`${import.meta.env.VITE_API_URL}/Upload/crop/image`, {
                    fileName: file.name,
                    fileType: file.type,
                }, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                const {uploadURL} = uploadUrlResponse.data;
                imageURL_S3 = uploadUrlResponse.data.imageURL;

                await fetch(uploadURL, {
                    method: "PUT",
                    headers: {
                        "Content-Type": file.type,
                    },
                    body: file,
                });

                // Replace with the actual S3 URL
                // imageURL_S3 = "https://saqidev-mun-aquacrop-s3st-cropsimagesbucket00e4cf9-9ycdsxzj8x6d.s3.us-east-1.amazonaws.com/"+file.name; // TODO: Replace with actual S3 URL
            }

            // Prepare the data to send to the backend
            const payload: any = {
                nameEN: data.nameEN,
                nameAR: data.nameAR,
                growthStage: {
                    ini: data.growthStage.ini,
                    mid: data.growthStage.mid,
                    end: data.growthStage.final
                },
                kc: {
                    ini: data.kc.ini,
                    mid: data.kc.mid,
                    end: data.kc.final
                },
                ImageURL: imageURL_S3
            };

            if (crop) {
                // Update existing crop
                payload['CropID'] = data.cropID;
                await axios.put(`${import.meta.env.VITE_API_URL}/update/crop`, payload, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('idToken')}`,
                        'Content-Type': 'application/json'
                    }
                });
                setSubmitSuccess("Crop updated successfully!");
            } else {
                // Add new crop
                await axios.post(`${import.meta.env.VITE_API_URL}/add/crop`, payload, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('idToken')}`,
                        'Content-Type': 'application/json'
                    }
                });
                setSubmitSuccess("Crop added successfully!");

            }

            setIsSubmitting(false);
            toast.success(submitSuccess || "Operation successful!");
        } catch (error: any) {
            console.error("Error submitting form:", error);
            const errorMessage = error.response?.data?.message || "Failed to submit form.";
            setSubmitError(errorMessage);
            toast.error(errorMessage);
            setIsSubmitting(false);

        }
        navigate('/Crops'); // Redirect to the crops list or another appropriate page

    };

    return (
        <div className="flex-1 overflow-auto relative z-10">
            <Header title={crop ? 'Edit Crop' : 'Add Crop'}/>
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
                        <h1 className="text-2xl font-semibold text-center mb-6">
                            {crop ? 'Edit Crop' : 'Add Crop'}
                        </h1>

                        {/* Crop ID (Visible only in Edit Mode) */}
                        {crop && (
                            <div className="mb-4">
                                <label htmlFor="cropID" className="block text-sm font-medium text-gray-200">Crop
                                    ID</label>
                                <input
                                    id="cropID"
                                    {...register("cropID")}
                                    disabled // Disable the input
                                    className="w-full p-3 mt-1 text-gray-800 rounded-md border border-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        )}

                        {/* Name in English */}
                        <div className="mb-4">
                            <label htmlFor="nameEN" className="block text-sm font-medium text-gray-200">Name
                                (EN)</label>
                            <input
                                id="nameEN"
                                {...register("nameEN", {required: "English name is required"})}
                                className="w-full p-3 mt-1 text-gray-800 rounded-md border border-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            {errors.nameEN && <p className="text-red-400">{errors.nameEN.message}</p>}
                        </div>

                        {/* Name in Arabic */}
                        <div className="mb-4">
                            <label htmlFor="nameAR" className="block text-sm font-medium text-gray-200">Name
                                (AR)</label>
                            <input
                                id="nameAR"
                                {...register("nameAR", {required: "Arabic name is required"})}
                                className="w-full p-3 mt-1 text-gray-800 rounded-md border border-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            {errors.nameAR && <p className="text-red-400">{errors.nameAR.message}</p>}
                        </div>

                        {/* Growth Stage */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-200">Growth Stage</label>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <input
                                        placeholder="Initial"
                                        type="number"
                                        step="1"
                                        {...register("growthStage.ini", {
                                            required: "Initial growth stage is required",
                                            valueAsNumber: true,
                                            min: { value: 0, message: "Must be non-negative" }
                                        })}
                                        className="w-full p-3 mt-1 text-gray-800 rounded-md border border-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                    {errors.growthStage?.ini &&
                                        <p className="text-red-400">{errors.growthStage.ini.message}</p>}
                                </div>
                                <div>
                                    <input
                                        placeholder="Mid"
                                        type="number"
                                        step="1"
                                        {...register("growthStage.mid", {
                                            required: "Mid growth stage is required",
                                            valueAsNumber: true,
                                            validate: {
                                                greaterThanIni: (value) => {
                                                    const ini = getValues("growthStage.ini");
                                                    return value > ini || "Must be greater than initial stage";
                                                }
                                            }
                                        })}
                                        className="w-full p-3 mt-1 text-gray-800 rounded-md border border-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                    {errors.growthStage?.mid &&
                                        <p className="text-red-400">{errors.growthStage.mid.message}</p>}
                                </div>
                                <div>
                                    <input
                                        placeholder="Final"
                                        type="number"
                                        step="1"
                                        {...register("growthStage.final", {
                                            required: "Final growth stage is required",
                                            valueAsNumber: true,
                                            validate: {
                                                greaterThanMid: (value) => {
                                                    const mid = getValues("growthStage.mid");
                                                    return value > mid || "Must be greater than mid stage";
                                                }
                                            }
                                        })}
                                        className="w-full p-3 mt-1 text-gray-800 rounded-md border border-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                    {errors.growthStage?.final &&
                                        <p className="text-red-400">{errors.growthStage.final.message}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Kc */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-200">Kc</label>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <input
                                        placeholder="Initial"
                                        type="number"
                                        step="0.01"
                                        {...register("kc.ini", {
                                            required: "Initial Kc is required",
                                            valueAsNumber: true,
                                            min: { value: 0, message: "Must be positive" }
                                        })}
                                        className="w-full p-3 mt-1 text-gray-800 rounded-md border border-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                    {errors.kc?.ini && <p className="text-red-400">{errors.kc.ini.message}</p>}
                                </div>
                                <div>
                                    <input
                                        placeholder="Mid"
                                        type="number"
                                        step="0.01"
                                        {...register("kc.mid", {
                                            required: "Mid Kc is required",
                                            valueAsNumber: true,
                                            min: { value: 0, message: "Must be positive" }
                                        })}
                                        className="w-full p-3 mt-1 text-gray-800 rounded-md border border-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                    {errors.kc?.mid && <p className="text-red-400">{errors.kc.mid.message}</p>}
                                </div>
                                <div>
                                    <input
                                        placeholder="Final"
                                        type="number"
                                        step="0.01"
                                        {...register("kc.final", {
                                            required: "Final Kc is required",
                                            valueAsNumber: true,
                                            min: { value: 0, message: "Must be positive" }
                                        })}
                                        className="w-full p-3 mt-1 text-gray-800 rounded-md border border-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                    {errors.kc?.final && <p className="text-red-400">{errors.kc.final.message}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Image Upload */}
                        <div className="mb-4">
                            <label htmlFor="imageURL" className="block text-sm font-medium text-gray-200">Image
                                Upload</label>
                            <input
                                id="imageURL"
                                type="file"
                                accept="image/*"
                                {...register("imageURL", {
                                    required: !crop ? "Image upload is required" : false,
                                    validate: {
                                        isImage: (files: FileList) => {
                                            if (files.length === 0) return true; // No file selected
                                            const file = files[0];
                                            const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
                                            return validTypes.includes(file.type) || "Only JPEG, PNG, and GIF images are allowed.";
                                        },
                                        maxSize: (files: FileList) => {
                                            if (files.length === 0) return true;
                                            const file = files[0];
                                            return file.size <= 5 * 1024 * 1024 || "Image must be smaller than 5MB.";
                                        }
                                    }
                                })}
                                className="w-full p-3 mt-1 text-gray-800 rounded-md border border-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            {errors.imageURL && <p className="text-red-400">{errors.imageURL.message}</p>}
                            {/* Display current image (only in Edit Mode) */}
                            {crop && (
                                <div className="mt-4">
                                    <p className="text-gray-200">Current Image:</p>
                                    <img
                                        src={currentImage}
                                        alt={crop.nameEN}
                                        className="w-32 h-32 object-cover rounded-md mt-2"
                                    />
                                </div>
                            )}
                            {/* Display selected image preview */}
                            {selectedImage && (
                                <div className="mt-4">
                                    <p className="text-gray-200">Selected Image Preview:</p>
                                    <img
                                        src={selectedImage as string}
                                        alt="Selected Crop"
                                        className="w-32 h-32 object-cover rounded-md mt-2"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Submission Feedback */}
                        {submitError && <p className="text-red-400 mb-4">{submitError}</p>}
                        {submitSuccess && <p className="text-green-400 mb-4">{submitSuccess}</p>}

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full p-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-500 transition ${
                                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                        >
                            {isSubmitting ? 'Submitting...' : crop ? 'Update Crop' : 'Add Crop'}
                        </button>
                    </form>
                </motion.div>
            </main>
            <ToastContainer/>
        </div>
    );
};

export default CropForm;
