import React, { useState, useEffect } from 'react';
import { Authenticator } from '@aws-amplify/ui-react';
import axios from 'axios';
import { fetchAuthSession } from 'aws-amplify/auth';

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
  const [farms, setFarms] = useState<Farm[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);

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
        const farmsResponse = await axios.get('https://vuor0sdlpf.execute-api.us-east-1.amazonaws.com/adminDashboard/Farms', {
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
              `https://vuor0sdlpf.execute-api.us-east-1.amazonaws.com/adminDashboard/Farms/${farm.id}/Zones`,
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

  return (
    <Authenticator>
      {({ signOut }) => (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
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
                  padding: '10px',
                  borderRadius: '5px',
                  border: '1px solid #ccc',
                  backgroundColor: selectedFarm?.id === farm.id ? '#007BFF' : '#fff',
                  color: selectedFarm?.id === farm.id ? '#fff' : '#000',
                  cursor: 'pointer',
                }}
              >
                {farm.name}
              </button>
            ))}
          </div>
          {selectedFarm && (
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
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
      )}
    </Authenticator>
  );
};

export default Dashboard;
