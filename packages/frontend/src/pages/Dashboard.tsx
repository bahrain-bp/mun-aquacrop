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
                                <div
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(3, 1fr)',
                                        gap: '10px',
                                        marginBottom: '20px',
                                    }}
                                >
                                    {farms.map((farm) => (
                                        <button
                                            key={farm.id}
                                            onClick={() => handleFarmSelect(farm)}
                                            className={`bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700 ${selectedFarm?.id === farm.id ? 'bg-blue-500 text-white' : ''}`}
                                            style={{
                                                backgroundImage: `url('https://albilad.s3.me-south-1.amazonaws.com/images/news/2022/07/11/thumbnails/600x314/f11231809.jpg')`,
                                                backgroundSize: 'cover',
                                                backgroundPosition: 'center',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '16px',
                                                textAlign: 'center',
                                                transition: 'background-color 0.3s ease',
                                                height: '200px', // Fixed height
                                                minHeight: '200px', // Minimum height for smaller screens
                                                maxHeight: '250px', // Max height to prevent it from growing too large
                                            }}
                                        >
                                            {farm.name}
                                        </button>
                                    ))}
                                </div>

                                {selectedFarm && (
                                    <div style={{display: 'flex', gap: '20px', justifyContent: 'center'}}>
                                        {isLoadingZones ? (
                                            <div style={{
                                                padding: '20px',
                                                color: '#666',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '10px'
                                            }}>
                                                <div style={{
                                                    width: '20px',
                                                    height: '20px',
                                                    border: '2px solid #00BFA6',
                                                    borderTopColor: 'transparent',
                                                    borderRadius: '50%',
                                                    animation: 'spin 1s linear infinite'
                                                }}/>
                                                Loading zones...
                                            </div>
                                        ) : (
                                            zones.map(zone => (
                                                <ZoneCard
                                                    key={zone.id}
                                                    zone={zone}
                                                    onZoneSelect={handleZoneSelect}
                                                    onImageLoad={handleImageLoad}
                                                />
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

const styleSheet = document.createElement('style');
styleSheet.textContent = `
@keyframes spin {
    to
    {
        transform: rotate(360
        deg
    )
        ;
    }
}
`;
document.head.appendChild(styleSheet);

export default Dashboard;