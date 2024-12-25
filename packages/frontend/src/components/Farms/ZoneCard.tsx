import React from 'react';

interface Zone {
    id: string;
    name: string;
    irrigationStatus: string;
    CropImageURL: string;
    imageLoaded?: boolean;
}

interface ZoneCardProps {
    zone: Zone;
    onZoneSelect: (zone: Zone) => void;
    onImageLoad: (zoneId: string) => void;
}

export const ZoneCard: React.FC<ZoneCardProps> = ({
    zone,
    onZoneSelect,
    onImageLoad
}) => (
    <div style={{
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '150px',
        position: 'relative'
    }}>
        <div style={{
            width: '100px',
            height: '100px',
            borderRadius: '8px',
            border: '1px solid #ccc',
            marginBottom: '10px',
            overflow: 'hidden',
            position: 'relative'
        }}>
            {!zone.imageLoaded && (
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: '#f0f0f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <div style={{
                        width: '20px',
                        height: '20px',
                        border: '2px solid #00BFA6',
                        borderTopColor: 'transparent',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                    }} />
                </div>
            )}
            {zone.CropImageURL && (
                <img
                    src={zone.CropImageURL}
                    alt={zone.name}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        opacity: zone.imageLoaded ? 1 : 0,
                        transition: 'opacity 0.3s ease'
                    }}
                    onLoad={() => onImageLoad(zone.id)}
                />
            )}
        </div>
        <button
            onClick={() => onZoneSelect(zone)}
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
);
