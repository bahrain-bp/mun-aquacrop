import React, { useState, useEffect } from 'react';
import { Authenticator } from '@aws-amplify/ui-react';
import axios from 'axios';
import { fetchAuthSession } from 'aws-amplify/auth';

interface Farm {
  id: string;
  name: string;
}

interface Zone {
  id: string;
  name: string;
  irrigationStatus: string;
}

const Dashboard: React.FC = () => {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);

  const fetchToken = async () => {
    try {
      const session = await fetchAuthSession();
      return session?.tokens?.idToken;
    } catch (error) {
      console.error('Error fetching session:', error);
      return null;
    }
  };

  // Fetch farms from backend
  useEffect(() => {
    const fetchFarms = async () => {
      try {
        const idToken = await fetchToken();
        if (!idToken) {
          console.error('No ID token found');
          return;
        }

        // Make the API request with the token
        const response = await axios.get('https://om9882jcr2.execute-api.us-east-1.amazonaws.com/adminDashboard/Farms', {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });

        // Map and set the farms
        const fetchedFarms = response.data.farms.map((farm: any) => ({
          id: farm.FarmID,
          name: farm.FarmName,
        }));
        setFarms(fetchedFarms);
      } catch (error) {
        console.error('Error fetching farms:', error);
      }
    };

    fetchFarms();
  }, []);

  const handleFarmSelect = async (farm: Farm) => {
    setSelectedFarm(farm);

    try {
      const idToken = await fetchToken();
      if (!idToken) {
        console.error('No ID token found');
        return;
      }

      // Fetch zones for the selected farm
      const response = await axios.get(`https://om9882jcr2.execute-api.us-east-1.amazonaws.com/adminDashboard/Farms/${farm.id}/Zones`, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      // Map and set the zones
      const fetchedZones = response.data.zones.map((zone: any) => ({
        id: zone.ZoneID,
        name: zone.ZoneName,
        irrigationStatus: zone.IrrigationStatus,
      }));
      setZones(fetchedZones);
    } catch (error) {
      console.error('Error fetching zones:', error);
    }
  };

  const handleZoneAction = (zone: Zone) => {
    alert(`Triggering irrigation for ${zone.name}`);
    // Replace with AWS IoT Core integration
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
            <div>
              <h2>Zones in {selectedFarm.name}</h2>
              <div style={{ display: 'flex', gap: '10px' }}>
                {zones.map((zone) => (
                  <button
                    key={zone.id}
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
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Authenticator>
  );
};

export default Dashboard;
