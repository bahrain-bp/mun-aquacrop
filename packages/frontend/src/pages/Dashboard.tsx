import React, { useState, useEffect } from 'react';

interface Farm {
  id: string;
  name: string;
}

interface Zone {
  id: string;
  name: string;
}

const Dashboard: React.FC = () => {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);

  useEffect(() => {
    // Simulatign fetching farms from a backend for later integration
    const fetchFarms = async () => {
      const fetchedFarms: Farm[] = [
        { id: 'farm1', name: 'Farm A' },
        { id: 'farm2', name: 'Farm B' },
      ];
      setFarms(fetchedFarms); // Dynamically update farms
    };

    fetchFarms();
  }, []); // Runs only once on component mount

  const handleFarmSelect = (farm: Farm) => {
    setSelectedFarm(farm);
    // Simulate fetching zones for the selected farm
    setZones([
      { id: 'zone1', name: 'Tomato Zone' },
      { id: 'zone2', name: 'Carrot Zone' },
    ]);
  };

  const handleZoneAction = (zone: Zone) => {
    alert(`Triggering irrigation for ${zone.name}`);
    // Replace with AWS IoT Core integration
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Dashboard</h1>
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
  );
};

export default Dashboard;
