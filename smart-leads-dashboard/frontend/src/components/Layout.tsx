import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LogOut, Moon, Sun, LayoutDashboard } from 'lucide-react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, logout } = useAuth();
    const { isDark, toggleTheme } = useTheme();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-gray-100 flex flex-col transition-colors duration-300">
            <header className="bg-white dark:bg-dark-surface shadow-sm border-b border-gray-200 dark:border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center gap-2">
                            <LayoutDashboard className="h-6 w-6 text-primary-600 dark:text-primary-500" />
                            <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-white">
                                SmartLeads
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                                {isDark ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5 text-gray-600" />}
                            </button>
                            <div className="flex items-center gap-3 border-l border-gray-200 dark:border-gray-700 pl-4">
                                <span className="text-sm font-medium">
                                    {user?.name} <span className="text-xs text-gray-500 dark:text-gray-400">({user?.role})</span>
                                </span>
                                <button
                                    onClick={logout}
                                    className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                                    title="Logout"
                                >
                                    <LogOut className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
        </div>
    );
};

export default Layout;
