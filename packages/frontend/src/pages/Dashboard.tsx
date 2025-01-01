import React, { useState ,useEffect} from 'react';
import { motion } from 'framer-motion';
import Header from '../components/common/Header';
import {Authenticator} from "@aws-amplify/ui-react";
import StatCard from "../components/common/StatCard.tsx";
import {Cloud, Droplet, TreePine, House } from "lucide-react";
import {fetchAuthSession} from "aws-amplify/auth";
import axios from "axios";
// import SignOutButton from "../components/common/SignOutButton.tsx";
import {ZoneCard} from "../components/Farms/ZoneCard.tsx";

import {ConfirmationDialog} from "../components/Farms/ConfirmationDialog.tsx";
import {useNavigate} from "react-router-dom";
import { IrrigationPopup } from '../components/Farms/IrrigationPopup';

interface Farm {
    id: string;
    name: string;
    zones?: Zone[]; // Prefetched zones
}
interface Zone {
    id: string;
    name: string;
    irrigationStatus: string;
    CropImageURL: string;
}

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const [farms, setFarms] = useState<Farm[]>([]);
    const [zones, setZones] = useState<Zone[]>([]);
    const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
    const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
    const [isPopupVisible, setIsPopupVisible] = useState(false);
    const [activeTab, setActiveTab] = useState('manual');
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingZones, setIsLoadingZones] = useState(false);
    const [isLoadingFarms, setIsLoadingFarms] = useState(true);  
    const [confirmationDialog, setConfirmationDialog] = useState<{
        isOpen: boolean;
        action: 'start' | 'stop' | null;
    }>({ isOpen: false, action: null });

    /**
     * Fetches authentication token for API requests
     * @returns Promise containing the ID token or null if not authenticated
     */
    const fetchToken = async (): Promise<string | null> => {
        try {
            const session = await fetchAuthSession();
            return session?.tokens?.idToken?.toString() ?? null;
        } catch (error) {
            console.error('Error fetching session:', error);
            return null;
        }
    };

    /**
     * Initial data fetch - Gets farms and their zones on component mount
     */
    useEffect(() => {
        const fetchFarmsAndZones = async () => {
            setIsLoadingFarms(true);  
            try {
                const idToken = await fetchToken();
                if (!idToken) {
                    console.error('No ID token found');
                    return;
                }

                // Fetch farms
                const farmsResponse = await axios.get('https://vuor0sdlpf.execute-api.us-east-1.amazonaws.com/managerDashboard/Farms', {
                    headers: { Authorization: `Bearer ${idToken}` },
                });

                const fetchedFarms: Farm[] = farmsResponse.data.farms.map((farm: any) => ({
                    id: farm.FarmID,
                    name: farm.FarmName,
                }));

                // Prefetch zones for all farms concurrently
                const prefetchZonesPromises = fetchedFarms.map(async (farm) => {
                    try {
                        const zonesResponse = await axios.get(
                            `https://vuor0sdlpf.execute-api.us-east-1.amazonaws.com/managerDashboard/Farms/${farm.id}/Zones`,
                            {
                                headers: { Authorization: `Bearer ${idToken}` },
                            }
                        );
                        farm.zones = zonesResponse.data.zones.map((zone: any) => ({
                            id: zone.ZoneID,
                            name: zone.ZoneName,
                            irrigationStatus: zone.IrrigationStatus,
                            CropImageURL: zone.CropImageURL,
                        }));
                    } catch (error) {
                        console.error(`Error prefetching zones for farm ${farm.id}:`, error);
                        farm.zones = []; // Fallback to an empty zones array if prefetch fails
                    }
                });

                await Promise.all(prefetchZonesPromises); // Wait for all prefetches to complete
                setFarms(fetchedFarms); // Update farms with prefetched zones
            } catch (error) {
                console.error('Error fetching farms and zones:', error);
            } finally {
                setIsLoadingFarms(false); 
            }
        };

        fetchFarmsAndZones();
    }, []);

    /**
     * Preloads an image to prevent flickering when displaying
     * @param url - The URL of the image to preload
     */
    const preloadImage = (url: string): Promise<void> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = url;
            img.onload = () => resolve();
            img.onerror = () => reject();
        });
    };

    /**
     * Handles farm selection and loads associated zones with images
     * @param farm - The selected farm object
     */
    const handleFarmSelect = async (farm: Farm) => {
        setIsLoadingZones(true);
        setZones([]); // Clear current zones immediately
        setSelectedFarm(farm);

        try {
            const farmZones = farm.zones || [];
            setZones(farmZones.map(zone => ({ ...zone, imageLoaded: false })));

            // Preload all images concurrently
            await Promise.all(
                farmZones
                    .filter(zone => zone.CropImageURL)
                    .map(async (zone) => {
                        try {
                            await preloadImage(zone.CropImageURL);
                            setZones(current =>
                                current.map(z =>
                                    z.id === zone.id ? { ...z, imageLoaded: true } : z
                                )
                            );
                        } catch (error) {
                            console.error(`Failed to load image for zone ${zone.id}:`, error);
                        }
                    })
            );
        } catch (error) {
            console.error('Error switching farms:', error);
        } finally {
            setIsLoadingZones(false);
        }
    };

    /**
     * Initiates the irrigation control confirmation dialog
     * @param action - The irrigation action ('start' or 'stop')
     */
    const handleIrrigationControl = async (action: 'start' | 'stop') => {
        setConfirmationDialog({ isOpen: true, action });
    };

    /**
     * Executes the confirmed irrigation action
     */
    const executeIrrigation = async () => {
        if (!confirmationDialog.action) return;

        setIsLoading(true);
        try {
            const idToken = await fetchToken();
            if (!idToken || !selectedFarm || !selectedZone) return;

            await axios.post(
                `https://vuor0sdlpf.execute-api.us-east-1.amazonaws.com/managerDashboard/Farms/${selectedFarm.id}/Zones/${selectedZone.id}/Irrigate`,
                { action: confirmationDialog.action },
                { headers: { Authorization: `Bearer ${idToken}` } }
            );

            // Update zones state with new irrigation status
            setZones(currentZones => 
                currentZones.map(zone => 
                    zone.id === selectedZone.id 
                        ? { ...zone, irrigationStatus: confirmationDialog.action === 'start' ? 'active' : 'inactive' }
                        : zone
                )
            );

            // Update selected zone state
            setSelectedZone(currentZone => 
                currentZone 
                    ? { ...currentZone, irrigationStatus: confirmationDialog.action === 'start' ? 'active' : 'inactive' }
                    : null
            );

           
        } catch (error) {
            console.error('Error controlling irrigation:', error);
            alert('Failed to control irrigation');
        } finally {
            setIsLoading(false);
            setConfirmationDialog({ isOpen: false, action: null });
        }
    };

    const handleImageLoad = (zoneId: string) => {
        setZones(current =>
            current.map(z =>
                z.id === zoneId ? { ...z, imageLoaded: true } : z
            )
        );
    };

    const handleZoneSelect = (zone: Zone) => {
        setSelectedZone(zone);
        setIsPopupVisible(true);
    };
    return (
        <Authenticator>
            {({ signOut }) => (
                <div className='flex-1 overflow-auto relative z-10'>
                    <Header title='Dashboard'/>
                    <main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
                        {/* STATS */}
                        <motion.div
                            className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8'
                            initial={{opacity: 0, y: 20}}
                            animate={{opacity: 1, y: 0}}
                            transition={{duration: 1}}
                        >
                            <StatCard name='Total Recommendations' icon={Droplet} value='12345' color='#6366F1'/>
                            <StatCard name='Total Farms' icon={House} value='1234' color='#8B5CF6'/>
                            <StatCard name='Total Crops' icon={TreePine} value='11' color='#EC4899'/>
                            <StatCard name='Weather' icon={Cloud} value='12.5°C' color='#10B981'/>
                        </motion.div>

                        {/*    Test*/}

                        <motion.div
                            className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700 mb-8 m-auto"
                            initial={{opacity: 0, y: 20}}
                            animate={{opacity: 1, y: 0}}
                            transition={{delay: 0.2}}
                        >
                            <div>
                                Registered Farms
                            </div>
                            <div style={{padding: '20px'}}>
                                {isLoadingFarms ? (
                                    <div className="flex items-center justify-center p-8">
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <div className="w-6 h-6 border-2 border-teal-400 border-t-transparent rounded-full animate-spin"/>
                                            <span>Loading farms...</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {farms.map((farm) => (
                                            <div
                                                key={farm.id}
                                                onClick={() => handleFarmSelect(farm)}
                                                className={`relative group cursor-pointer rounded-2xl overflow-hidden transition-all duration-500 
                                                    ${selectedFarm?.id === farm.id 
                                                        ? 'ring-2 ring-teal-500 shadow-teal-500/20 shadow-lg' 
                                                        : 'hover:shadow-xl hover:scale-105'}`}
                                                style={{ height: '220px', borderRadius: '1rem' }}
                                            >
                                                {/* Background Image with Overlay */}
                                                <div 
                                                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                                                    style={{
                                                        backgroundImage: `url('https://albilad.s3.me-south-1.amazonaws.com/images/news/2022/07/11/thumbnails/600x314/f11231809.jpg')`,
                                                    }}
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent"/>
                                                
                                                {/* Content */}
                                                <div className="absolute inset-0 p-6 flex flex-col justify-between">
                                                    <div className="backdrop-blur-sm bg-white/10 rounded-lg px-3 py-1 self-start">
                                                        <span className="text-white/90 text-sm font-medium">Farm</span>
                                                    </div>
                                                    <div>
                                                        <h3 className="text-2xl font-bold text-white mb-2">{farm.name}</h3>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-white/60 text-sm">
                                                                {farm.zones?.length || 0} Zones
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {selectedFarm && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                                        {isLoadingZones ? (
                                            <div className="flex items-center gap-2 p-4 text-gray-400 col-span-full justify-center">
                                                <div className="w-5 h-5 border-2 border-teal-400 border-t-transparent rounded-full animate-spin"/>
                                                Loading zones...
                                            </div>
                                        ) : (
                                            zones.map(zone => (
                                                <div
                                                    key={zone.id}
                                                    onClick={() => handleZoneSelect(zone)}
                                                    className="group relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-500 hover:shadow-xl hover:scale-105"
                                                    style={{ height: '300px' }}
                                                >
                                                    {/* Background Image */}
                                                    <div 
                                                        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                                                        style={{
                                                            backgroundImage: `url(${zone.CropImageURL || 'default-crop-image.jpg'})`,
                                                        }}
                                                    />
                                                    
                                                    {/* Gradient Overlay */}
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"/>
                                                    
                                                    {/* Content */}
                                                    <div className="absolute inset-0 p-6 flex flex-col justify-between">
                                                        <div className="flex justify-between items-start">
                                                            <div className="backdrop-blur-sm bg-white/10 rounded-lg px-3 py-1">
                                                                <span className="text-white/90 text-sm font-medium">Zone</span>
                                                            </div>
                                                            <span className={`px-3 py-1 rounded-full text-sm backdrop-blur-sm
                                                                ${zone.irrigationStatus === 'active' 
                                                                    ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                                                                    : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'}`}>
                                                                {zone.irrigationStatus === 'active' ? '● Active' : '○ Inactive'}
                                                            </span>
                                                        </div>
                                                        
                                                        <div>
                                                            <h3 className="text-2xl font-bold text-white mb-4">{zone.name}</h3>
                                                            <button 
                                                                className="w-full bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white 
                                                                    py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2
                                                                    group-hover:bg-teal-500"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleZoneSelect(zone);
                                                                }}
                                                            >
                                                                <span>Manage Zone</span>
                                                                <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" 
                                                                    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                    <path d="M5 12h14M12 5l7 7-7 7"/>
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}

                                {isPopupVisible && selectedZone && (
                                    <>
                                        <div style={{
                                            position: 'fixed',
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            bottom: 0,
                                            backgroundColor: 'rgba(0,0,0,0.5)',
                                            zIndex: 999
                                        }} onClick={() => setIsPopupVisible(false)}/>
                                        <IrrigationPopup
                                            zone={selectedZone}
                                            isLoading={isLoading}
                                            activeTab={activeTab}
                                            onClose={() => setIsPopupVisible(false)}
                                            onTabChange={setActiveTab}
                                            onIrrigationControl={handleIrrigationControl}
                                        />
                                    </>
                                )}

                                {confirmationDialog.isOpen && (
                                    <>
                                        <div style={{
                                            position: 'fixed',
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            bottom: 0,
                                            backgroundColor: 'rgba(0,0,0,0.5)',
                                            zIndex: 1000
                                        }} onClick={() => setConfirmationDialog({isOpen: false, action: null})}/>
                                        <ConfirmationDialog
                                            isLoading={isLoading}
                                            action={confirmationDialog.action}
                                            zoneName={selectedZone?.name}
                                            onConfirm={executeIrrigation}
                                            onCancel={() => setConfirmationDialog({isOpen: false, action: null})}
                                        />
                                    </>
                                )}
                            </div>
                        </motion.div>

                    </main>
                </div>

                )}
        </Authenticator>
    )
        ;
};

export default Dashboard;