import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { List, Calendar, BarChart2, Settings } from 'lucide-react';
import clsx from 'clsx';

export const Layout: React.FC = () => {
    return (
        <div className="flex flex-col h-screen bg-gray-50 text-gray-900 font-sans">
            <header className="bg-white shadow-sm p-4 sticky top-0 z-10">
                <h1 className="text-xl font-bold text-center text-blue-600">PushStreak</h1>
            </header>

            <main className="flex-1 overflow-y-auto p-4 max-w-md mx-auto w-full">
                <Outlet />
            </main>

            <nav className="bg-white border-t border-gray-200">
                <ul className="flex justify-around items-center h-16 max-w-md mx-auto w-full">
                    <li>
                        <NavLink
                            to="/"
                            className={({ isActive }) =>
                                clsx(
                                    "flex flex-col items-center p-2 rounded-lg transition-colors",
                                    isActive ? "text-blue-600 bg-blue-50" : "text-gray-500 hover:text-gray-700"
                                )
                            }
                        >
                            <List size={24} />
                            <span className="text-xs font-medium mt-1">Today</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/calendar"
                            className={({ isActive }) =>
                                clsx(
                                    "flex flex-col items-center p-2 rounded-lg transition-colors",
                                    isActive ? "text-blue-600 bg-blue-50" : "text-gray-500 hover:text-gray-700"
                                )
                            }
                        >
                            <Calendar size={24} />
                            <span className="text-xs font-medium mt-1">Calendar</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/stats"
                            className={({ isActive }) =>
                                clsx(
                                    "flex flex-col items-center p-2 rounded-lg transition-colors",
                                    isActive ? "text-blue-600 bg-blue-50" : "text-gray-500 hover:text-gray-700"
                                )
                            }
                        >
                            <BarChart2 size={24} />
                            <span className="text-xs font-medium mt-1">Stats</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/settings"
                            className={({ isActive }) =>
                                clsx(
                                    "flex flex-col items-center p-2 rounded-lg transition-colors",
                                    isActive ? "text-blue-600 bg-blue-50" : "text-gray-500 hover:text-gray-700"
                                )
                            }
                        >
                            <Settings size={24} />
                            <span className="text-xs font-medium mt-1">Settings</span>
                        </NavLink>
                    </li>
                </ul>
            </nav>
        </div>
    );
};
