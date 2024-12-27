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
        backgroundColor: '#ffffff',
        padding: '30px',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        zIndex: 1000,
        minWidth: '400px',
        maxWidth: '90vw'
    }}>
        {/* Zone Header */}
        <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '25px',
            borderBottom: '2px solid #e0e0e0',
            paddingBottom: '15px'
        }}>
            <div>
                <h3 style={{ 
                    margin: '0', 
                    color: '#1a1a1a',
                    fontSize: '20px',
                    fontWeight: '600'
                }}>{zone.name}</h3>
                <span style={{ 
                    fontSize: '14px',
                    color: zone.irrigationStatus === 'active' ? '#2e7d32' : '#d32f2f',
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
                    color: '#666',
                    padding: '5px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
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
            borderBottom: '1px solid #e0e0e0',
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
                        backgroundColor: activeTab === tab ? '#1976d2' : '#f5f5f5',
                        color: activeTab === tab ? 'white' : '#424242',
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
                            backgroundColor: '#f5f5f5',
                            border: '1px solid #e0e0e0', 
                            borderRadius: '8px',
                            marginBottom: '15px'
                        }}>
                            <h4 style={{ 
                                margin: '0 0 10px 0', 
                                color: '#1a1a1a',
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
                                    backgroundColor: zone.irrigationStatus === 'active' ? '#2e7d32' : '#d32f2f',
                                    border: '2px solid white',
                                    boxShadow: '0 0 0 1px ' + (zone.irrigationStatus === 'active' ? '#2e7d32' : '#d32f2f')
                                }} />
                                <span style={{
                                    color: '#1a1a1a',
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
                                    backgroundColor: '#2e7d32',
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
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
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
                                    backgroundColor: '#d32f2f',
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
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
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
                    backgroundColor: '#f5f5f5',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    textAlign: 'center'
                }}>
                    <h4 style={{ 
                        margin: '0 0 10px 0', 
                        color: '#1a1a1a',
                        fontSize: '16px',
                        fontWeight: '600'
                    }}>Automated Irrigation</h4>
                    <p style={{ 
                        color: '#424242', 
                        margin: '0',
                        fontSize: '14px'
                    }}>Currently testing</p>
                </div>
            )}
        </div>
    </div>
);