import React from 'react'
import { NavLink } from "react-router-dom";

interface AppLayoutProps {
    children: React.ReactNode;
    headerComponent?: React.ReactNode;
    showLoadingOverlay?: boolean;
};

const AppLayout: React.FC<AppLayoutProps> = ({ children, headerComponent, showLoadingOverlay }) => {
    return (
        <div className="flex h-screen">
            {/* Left sidebar - fixed width */}
            <aside className="w-56 bg-gray-900 text-gray-200 flex flex-col p-4 flex-none">
                <div className="text-xl font-bold mb-6">Monzo Dashboard</div>
                <nav className="flex flex-col gap-2">
                    <NavLink
                        to="/"
                        className={({ isActive }) =>
                            isActive ? 'bg-gray-700 p-2 rounded' : 'hover:bg-gray-700 p-2 rounded'
                    }
                    >
                        Dashboard
                    </NavLink>
                    <NavLink
                        to="/profile"
                        className={({ isActive }) =>
                            isActive ? 'bg-gray-700 p-2 rounded' : 'hover:bg-gray-700 p-2 rounded'
                        }
                    >
                        Profile
                    </NavLink>
                    <NavLink
                        to="/settings"
                        className={({ isActive }) =>
                            isActive ? 'bg-gray-700 p-2 rounded' : 'hover:bg-gray-700 p-2 rounded'
                        }
                    >
                        Settings
                    </NavLink>
                </nav>
            </aside>

            {/* Right content area */}
            <div className="flex flex-col flex-1 h-full">
                {headerComponent && (
                    <header className="bg-gray-800 text-white p-4 flex justify-between items-center flex-none">
                        {headerComponent}
                    </header>
                )}
                <main className="flex-1 overflow-y-auto p-4 relative">
                    {showLoadingOverlay && (
                        <div className="absolute inset-0 bg-gray-500 opacity-25 flex items-center justify-center z-50">
                            <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    )}
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AppLayout;
