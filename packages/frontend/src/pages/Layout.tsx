import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface LayoutProps {
    children: ReactNode; // The content that will be passed to the Layout component
    isSidebarCollapsed: boolean;
    toggleSidebar: () => void;
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
                <ul style={{ listStyleType: 'none', padding: 0 }}>
                    <li>
                        <Link
                            to="/"
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
                    </li>
                    <li>
                        <Link
                            to="/farms"
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

const Layout: React.FC<LayoutProps> = ({ children, isSidebarCollapsed, toggleSidebar }) => {
    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />
            <div
                style={{
                    marginLeft: isSidebarCollapsed ? '80px' : '250px',
                    padding: '20px',
                    width: `calc(100% - ${isSidebarCollapsed ? '80px' : '250px'})`,
                    transition: 'width 0.3s ease',
                }}
            >
                {children}
            </div>
        </div>
    );
};

export default Layout;
