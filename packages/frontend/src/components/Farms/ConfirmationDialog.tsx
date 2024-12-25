import React from 'react';

interface ConfirmationDialogProps {
    isLoading: boolean;
    action: 'start' | 'stop' | null;
    zoneName?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
    isLoading,
    action,
    zoneName,
    onConfirm,
    onCancel
}) => (
    <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        zIndex: 1001,
        minWidth: '300px',
        textAlign: 'center'
    }}>
        <h4 style={{ margin: '0 0 15px 0', color: '#1a1a1a' }}>
            Confirm Irrigation {action ? (action.charAt(0).toUpperCase() + action.slice(1)) : ''}
        </h4>
        <p style={{ margin: '0 0 20px 0', color: '#424242' }}>
            Are you sure you want to {action} irrigation for {zoneName}?
        </p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button
                onClick={onConfirm}
                disabled={isLoading}
                style={{
                    padding: '8px 16px',
                    backgroundColor: action === 'start' ? '#2e7d32' : '#d32f2f',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    opacity: isLoading ? 0.7 : 1
                }}
            >
                {isLoading ? 'Processing...' : 'Confirm'}
            </button>
            <button
                onClick={onCancel}
                disabled={isLoading}
                style={{
                    padding: '8px 16px',
                    backgroundColor: '#9e9e9e',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                }}
            >
                Cancel
            </button>
        </div>
    </div>
);
