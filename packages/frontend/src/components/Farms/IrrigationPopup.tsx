import React from 'react';

interface Zone {
    id: string;
    name: string;
    irrigationStatus: string;
    CropImageURL: string;
}

interface IrrigationPopupProps {
    zone: Zone;
    isLoading: boolean;
    activeTab: string;
    onClose: () => void;
    onTabChange: (tab: string) => void;
    onIrrigationControl: (action: 'start' | 'stop') => void;
}

export const IrrigationPopup: React.FC<IrrigationPopupProps> = ({
                                                                    zone,
                                                                    isLoading,
                                                                    activeTab,
                                                                    onClose,
                                                                    onTabChange,
                                                                    onIrrigationControl
                                                                }) => (
    <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: '#1f2937',  // Dark background to match bg-gray-900
        padding: '30px',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',  // Dark shadow for contrast
        zIndex: 1000,
        minWidth: '400px',
        maxWidth: '90vw',
        color: '#f3f4f6',  // Light text color to match text-gray-100
    }}>
        {/* Zone Header */}
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '25px',
            borderBottom: '2px solid #4b5563', // Lighter border to fit the theme
            paddingBottom: '15px'
        }}>
            <div>
                <h3 style={{
                    margin: '0',
                    color: '#f3f4f6',  // Light text color
                    fontSize: '20px',
                    fontWeight: '600'
                }}>{zone.name}</h3>
                <span style={{
                    fontSize: '14px',
                    color: zone.irrigationStatus === 'active' ? '#10b981' : '#ef4444', // Green for active, red for stopped
                    fontWeight: '500'
                }}>
                    Status: {zone.irrigationStatus}
                </span>
            </div>
            <button
                onClick={onClose}
                style={{
                    border: 'none',
                    background: 'none',
                    fontSize: '24px',
                    cursor: 'pointer',
                    color: '#f3f4f6',
                    padding: '5px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    transition: 'background-color 0.2s',
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#4b5563'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
                ×
            </button>
        </div>

        {/* Control Modes */}
        <div style={{
            display: 'flex',
            gap: '10px',
            marginBottom: '20px',
            borderBottom: '1px solid #4b5563',
            paddingBottom: '10px'
        }}>
            {['manual', 'automated'].map((tab) => (
                <button
                    key={tab}
                    onClick={() => onTabChange(tab)}
                    style={{
                        padding: '8px 16px',
                        border: 'none',
                        borderRadius: '20px',
                        backgroundColor: activeTab === tab ? '#3b82f6' : '#4b5563', // Active tab color
                        color: activeTab === tab ? 'white' : '#e5e7eb', // Light text for active tab
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 500,
                        transition: 'all 0.2s'
                    }}
                >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
            ))}
        </div>

        {/* Control Panel */}
        <div style={{ padding: '15px 0' }}>
            {activeTab === 'manual' ? (
                <div>
                    {/* Status Display */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '15px'
                    }}>
                        <div style={{
                            padding: '15px',
                            backgroundColor: '#2d3748',  // Dark background for status box
                            border: '1px solid #4b5563',
                            borderRadius: '8px',
                            marginBottom: '15px'
                        }}>
                            <h4 style={{
                                margin: '0 0 10px 0',
                                color: '#f3f4f6',
                                fontSize: '16px',
                                fontWeight: '600'
                            }}>Current Status</h4>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                            }}>
                                <div style={{
                                    width: '12px',
                                    height: '12px',
                                    borderRadius: '50%',
                                    backgroundColor: zone.irrigationStatus === 'active' ? '#10b981' : '#ef4444', // Green for active, red for stopped
                                    border: '2px solid #1f2937',
                                    boxShadow: '0 0 0 1px ' + (zone.irrigationStatus === 'active' ? '#10b981' : '#ef4444')
                                }} />
                                <span style={{
                                    color: '#f3f4f6',
                                    fontWeight: '500',
                                    fontSize: '14px'
                                }}>
                                    {zone.irrigationStatus === 'active' ? 'Running' : 'Stopped'}
                                </span>
                            </div>
                        </div>

                        {/* Control Buttons */}
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                onClick={() => onIrrigationControl('start')}
                                disabled={isLoading}
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    backgroundColor: '#10b981', // Green button for start
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: isLoading ? 'wait' : 'pointer',
                                    opacity: isLoading ? 0.7 : 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    fontSize: '14px',
                                    fontWeight: 500,
                                    transition: 'background-color 0.2s',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                }}
                            >
                                {isLoading ? 'Starting...' : 'Start Irrigation'}
                            </button>
                            <button
                                onClick={() => onIrrigationControl('stop')}
                                disabled={isLoading}
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    backgroundColor: '#ef4444', // Red button for stop
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: isLoading ? 'wait' : 'pointer',
                                    opacity: isLoading ? 0.7 : 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    fontSize: '14px',
                                    fontWeight: 500,
                                    transition: 'background-color 0.2s',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                }}
                            >
                                {isLoading ? 'Stopping...' : 'Stop Irrigation'}
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div style={{
                    padding: '20px',
                    backgroundColor: '#2d3748',  // Dark background
                    border: '1px solid #4b5563',
                    borderRadius: '8px',
                    textAlign: 'center'
                }}>
                    <h4 style={{
                        margin: '0 0 10px 0',
                        color: '#f3f4f6',
                        fontSize: '16px',
                        fontWeight: '600'
                    }}>Automated Irrigation</h4>
                    <p style={{
                        color: '#e5e7eb',
                        margin: '0',
                        fontSize: '14px'
                    }}>Currently testing</p>
                </div>
            )}
        </div>
    </div>
);
