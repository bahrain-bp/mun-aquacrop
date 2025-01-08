import React, {useState, useEffect, useRef, ChangeEvent} from 'react';
import {BarChart2, Menu, TrendingUp, MapPinHouse, TreePine, CloudUpload} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { fetchAuthSession } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';

const ALL_SIDEBAR_ITEMS =[
    {
        name: 'Dashboard', 
        icon: BarChart2, 
        color: '#6366f1', 
        path:'/',
        adminRequired: false
    },
    {
        name: 'Farms', 
        icon: MapPinHouse, 
        color: '#6EE7B7', 
        path:'/Farms',
        adminRequired: false,
        hideFromAdmin: true
    },
    {
        name: 'Crops', 
        icon: TreePine, 
        color: '#EC4899', 
        path:'/Crops',
        adminRequired: true
    },
    {
        name: 'Reports', 
        icon: TrendingUp, 
        color: '#3B82F6', 
        path:'/Reports',
        adminRequired: true
    }
]

const Sidebar: React.FC = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const checkAdminStatus = async () => {
        try {
            const session = await fetchAuthSession();
            const groups = session?.tokens?.accessToken?.payload["cognito:groups"] || [];
            setIsAdmin(Array.isArray(groups) && groups.includes("Admin"));
        } catch (error) {
            console.error("Error checking admin status:", error);
            setIsAdmin(false);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            try {
                console.log("Starting file upload...");
                
                // Get the current session token
                const session = await fetchAuthSession();
                const token = session.tokens?.accessToken?.toString();
                
                if (!token) {
                    throw new Error("No authentication token available");
                }

                
                const response = await fetch(`${import.meta.env.VITE_API_URL}/Upload/CSV`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": token
                    },
                    body: JSON.stringify({
                        fileName: file.name,
                        fileType: file.type,
                    }),
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                console.log("Got upload URL:", data.uploadURL);

                // Then upload the file
                const uploadResponse = await fetch(data.uploadURL, {
                    method: "PUT",
                    headers: {
                        "Content-Type": file.type,
                    },
                    body: file,
                });

                if (!uploadResponse.ok) {
                    throw new Error(`Upload failed! status: ${uploadResponse.status}`);
                }

                console.log('File uploaded successfully');
                alert('Weather data uploaded successfully!');
            } catch (error) {
                console.error("Upload failed:", error);
                alert('Failed to upload weather data. Please try again.');
            }
        }
    };

    useEffect(() => {
        checkAdminStatus();

        // Subscribe to auth events
        const unsubscribe = Hub.listen('auth', ({ payload }) => {
            if (payload.event === 'signedIn' || payload.event === 'signedOut') {
                checkAdminStatus();
            }
        });

        return () => {
            unsubscribe();
        };
    }, []);

    if (loading) {
        return null; // or a loading spinner
    }

    const visibleItems = ALL_SIDEBAR_ITEMS.filter(item => 
        (!item.adminRequired || isAdmin) && 
        !(item.hideFromAdmin && isAdmin)
    );

    return (
        <motion.div
            className={`relative z-10 transition-all duration-300 ease-in-out flex-shrink-0 ${
                isSidebarOpen ? "w-64" : "w-20"
            }`}
            animate={{width: isSidebarOpen ? 256 : 80}}
        >
            <div className='h-full bg-gray-800 bg-opacity-50 backdrop-blur-md p-4 flex flex-col border-r border-gray-700'>
                <motion.button
                    whileHover={{scale: 1.1}}
                    whileTap={{scale: 0.9}}
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className='p-2 rounded-full hover:bg-gray-700 transition-colors max-w-fit'
                >
                    <Menu size={24}/>
                </motion.button>

                <nav className='mt-8 flex-grow'>
                    {visibleItems.map((item) => (
                        <Link key={item.path} to={item.path}>
                            <motion.div
                                className='flex items-center p-4 text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors mb-2'
                            >
                                <item.icon size={20} style={{ color: item.color, minWidth: "20px" }} />
                                <AnimatePresence>
                                    {isSidebarOpen && (
                                        <motion.span
                                            className='ml-4 whitespace-nowrap'
                                            initial={{ opacity: 0, width: 0 }}
                                            animate={{ opacity: 1, width: "auto" }}
                                            exit={{ opacity: 0, width: 0 }}
                                            transition={{ duration: 0.2, delay: 0.3 }}
                                        >
                                            {item.name}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        </Link>
                    ))}
                </nav>

                {isAdmin && (
                    <>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleUpload}
                            className="hidden"
                            accept=".csv,.xlsx,.xls"
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className='flex items-center p-4 text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors mb-2'
                        >
                            <CloudUpload size={20} style={{ color: '#F59E0B', minWidth: "20px" }} />
                            <AnimatePresence>
                                {isSidebarOpen && (
                                    <motion.span
                                        className='ml-4 whitespace-nowrap'
                                        initial={{ opacity: 0, width: 0 }}
                                        animate={{ opacity: 1, width: "auto" }}
                                        exit={{ opacity: 0, width: 0 }}
                                        transition={{ duration: 0.2, delay: 0.3 }}
                                    >
                                        Upload Weather Data
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </button>
                    </>
                )}
            </div>
        </motion.div>
    );
};

export default Sidebar;
