import React, { useState, useEffect } from 'react';
import { Authenticator } from '@aws-amplify/ui-react';
import axios from 'axios';
import { fetchAuthSession } from 'aws-amplify/auth';
import { Link } from 'react-router-dom';

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

const Sidebar: React.FC<{ isCollapsed: boolean; toggleSidebar: () => void }> = ({
                                                                                    isCollapsed,
                                                                                    toggleSidebar,
                                                                                }) => {
    return (
        <div
            style={{
                width: isCollapsed ? '80px' : '250px',
                height: '100vh',
                backgroundColor: '#2C3E50',
                color: 'white',
                padding: '20px',
                position: 'fixed',
                left: '0',
                top: '0',
                display: 'flex',
                flexDirection: 'column',
                transition: 'width 0.3s ease',
            }}
        >
            <h2 style={{ color: '#fff', display: isCollapsed ? 'none' : 'block' }}>Farm Manager</h2>
            <nav>
                <ul style={{listStyleType: 'none', padding: 0}}>
                    <li>
                        <Link
                            to="/" // Link to the Farms page
                            style={{
                                textDecoration: 'none',
                                display: 'block',
                                padding: '10px',
                                backgroundColor: '#34495E',
                                color: 'white',
                                borderRadius: '5px',
                                margin: '10px 0',
                                textAlign: 'center',
                            }}
                        >
                            Dashboard
                        </Link>
                        {/*<button style={sidebarButtonStyle}>Dashboard</button>*/}
                    </li>
                    {/* Add Farms Link */}
                    <li>
                        <Link
                            to="/Farms" // Link to the Farms page
                            style={{
                                textDecoration: 'none',
                                display: 'block',
                                padding: '10px',
                                backgroundColor: '#34495E',
                                color: 'white',
                                borderRadius: '5px',
                                margin: '10px 0',
                                textAlign: 'center',
                            }}
                        >
                            Farms
                        </Link>
                    </li>
                </ul>
            </nav>
            <button
                onClick={toggleSidebar}
                style={{
                    marginTop: 'auto',
                    backgroundColor: '#34495E',
                    border: 'none',
                    padding: '10px',
                    color: 'white',
                    fontSize: '16px',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    textAlign: 'center',
                    width: '100%',
                }}
            >
                {isCollapsed ? '>' : '<'}
            </button>
        </div>
    );
};

const sidebarButtonStyle = {
  backgroundColor: '#34495E',
  border: 'none',
  padding: '10px',
  margin: '10px 0',
  color: 'white',
  fontSize: '16px',
  borderRadius: '5px',
  cursor: 'pointer',
  textAlign: 'left' as 'left',
  width: '100%',
};

const Dashboard: React.FC = () => {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // Track sidebar state

  // Fetch token for API requests
  const fetchToken = async (): Promise<string | null> => {
    try {
      const session = await fetchAuthSession();
      return session?.tokens?.idToken?.toString() ?? null;
    } catch (error) {
      console.error('Error fetching session:', error);
      return null;
    }
  };

  // Fetch farms and prefetch zones
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

  const handleFarmSelect = (farm: Farm) => {
    setSelectedFarm(farm);
    setZones(farm.zones || []); // Use prefetched zones or fallback to empty array
  };

  const handleZoneAction = (zone: Zone) => {
    alert(`Triggering irrigation for ${zone.name}`);
    // AWS IoT Core integration
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prevState) => !prevState); // Toggle sidebar state
  };

  return (
      <Authenticator>
        {({ signOut }) => (
            <div style={{ display: 'flex', minHeight: '100vh' }}>
              {/* Sidebar */}
              <Sidebar isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />

              {/* Main content area */}
              <div
                  style={{
                    marginLeft: isSidebarCollapsed ? '80px' : '250px', // Adjust content based on sidebar state
                    padding: '20px',
                    width: `calc(100% - ${isSidebarCollapsed ? '80px' : '250px'})`, // Dynamically adjust width
                    transition: 'width 0.3s ease',
                  }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h1>Dashboard</h1>
                  <button
                      onClick={signOut}
                      style={{
                        padding: '10px 20px',
                        fontSize: '16px',
                        borderRadius: '5px',
                        border: 'none',
                        backgroundColor: '#FF0000',
                        color: 'white',
                        cursor: 'pointer',
                      }}
                  >
                    Sign Out
                  </button>
                </div>
                <h2>Farms</h2>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                  {farms.map((farm) => (
                      <button
                          key={farm.id}
                          onClick={() => handleFarmSelect(farm)}
                          style={{
                              padding: '20px',
                              width: '150px', // Set a fixed width and height for a larger round button
                              height: '150px',
                              border: 'none', // Remove border to make it cleaner
                              backgroundColor: selectedFarm?.id === farm.id ? '#007BFF' : 'transparent', // Set background color when selected
                              backgroundImage: `url('https://media.istockphoto.com/id/965148388/photo/green-ripening-soybean-field-agricultural-landscape.jpg?s=612x612&w=0&k=20&c=cEVP3uj34-5obt-Jf_WI3O9qfP6tVrFaQIv1rBvvpzc=')`, // Background image
                              backgroundSize: 'cover', // Ensure the background image covers the entire button
                              backgroundPosition: 'center', // Center the image
                              color: selectedFarm?.id === farm.id ? '#fff' : '#fff', // Make text white
                              cursor: 'pointer',
                              display: 'flex', // Use flexbox to center the text
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '16px', // Adjust font size
                              textAlign: 'center',
                              transition: 'background-color 0.3s ease', // Smooth transition for background color change
                          }}
                      >
                          {farm.name}
                      </button>
                  ))}
                </div>
                  {selectedFarm && (
                      <div style={{display: 'flex', gap: '20px', justifyContent: 'center'}}>
                          {zones.map((zone) => (
                              <div
                                  key={zone.id}
                                  style={{
                                      textAlign: 'center',
                                      display: 'flex',
                                      flexDirection: 'column',
                                      alignItems: 'center',
                                      width: '150px',
                                  }}
                              >
                                  {zone.CropImageURL ? (
                                      <img
                                          src={zone.CropImageURL}
                                          alt={zone.name}
                                          style={{
                                              width: '100px',
                                              height: '100px',
                                              objectFit: 'cover',
                                              borderRadius: '8px',
                                              border: '1px solid #ccc',
                                      marginBottom: '10px',
                                    }}
                                />
                            ) : (
                                <p>No Image</p>
                            )}
                            <button
                                onClick={() => handleZoneAction(zone)}
                                style={{
                                  padding: '10px',
                                  borderRadius: '5px',
                                  border: '1px solid #ccc',
                                  backgroundColor: '#00BFA6',
                                  color: '#fff',
                                  cursor: 'pointer',
                                }}
                            >
                              {zone.name}
                            </button>
                          </div>
                      ))}
                    </div>
                )}
              </div>
            </div>
        )}
      </Authenticator>
  );
};

export default Dashboard;
