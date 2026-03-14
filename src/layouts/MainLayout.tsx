import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import {
    LayoutDashboard,
    LogOut,
    Menu,
    HeartPulse,
    Home,
    Settings,
    ClipboardList,
    Activity,
    Package
} from 'lucide-react';

export default function MainLayout() {
    const { signOut, user } = useAuth();
    const { i18n } = useTranslation();
    const [sidebarOpen, setSidebarOpen] = React.useState(false);

    const toggleLanguage = () => {
        i18n.changeLanguage(i18n.language === 'en' ? 'hi' : 'en');
    };

    const NavItem = ({ to, icon: Icon, label }: { to: string, icon: any, label: string }) => (
        <NavLink
            to={to}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) => `
        flex items-center px-4 py-3 rounded-lg transition-all duration-200
        ${isActive
                    ? 'bg-green-100/80 text-green-800 font-semibold shadow-sm'
                    : 'text-neutral-600 hover:bg-green-50 hover:text-green-700'
                }
      `}
        >
            <Icon className={`w-5 h-5 mr-3 transition-transform duration-200`} />
            {label}
        </NavLink>
    );

    return (
        <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans">

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
        fixed inset-y-0 left-0 bg-white shadow-xl shadow-neutral-200/50 z-50 w-72 transform transition-transform duration-300 ease-in-out flex flex-col border-r border-neutral-100
        md:relative md:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
                <div className="p-6 flex items-center justify-between">
                    Govamsh (GCS)
                </div>

                <div className="px-6 pb-2">
                    <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Menu</div>
                </div>

                <nav className="flex-1 overflow-y-auto px-4 space-y-1.5">
                    <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
                    <NavItem to="/cows" icon={HeartPulse} label="Cow Registry" />
                    <NavItem to="/sheds" icon={Home} label="Cow Shed Project" />
                    <NavItem to="/tasks" icon={ClipboardList} label="Daily Tasks" />
                    <NavItem to="/health" icon={Activity} label="Health Tracking" />
                    <NavItem to="/inventory" icon={Package} label="Inventory Control" />
                    <NavItem to="/admin" icon={Settings} label="Admin Panel" />
                </nav>

                <div className="p-5 border-t border-neutral-100 space-y-4 bg-neutral-50/50">
                    <div className="flex items-center px-2">
                        <div className="w-10 h-10 rounded-full bg-green-200 text-green-700 flex items-center justify-center font-bold text-lg mr-3 shadow-sm border border-green-300">
                            {user?.email?.[0].toUpperCase() || 'U'}
                        </div>
                        <div className="overflow-hidden">
                            <div className="text-xs text-neutral-500 font-medium">Logged in as</div>
                            <div className="font-semibold text-neutral-800 text-sm truncate">{user?.email}</div>
                        </div>
                    </div>

                    <button
                        onClick={toggleLanguage}
                        className="w-full flex items-center justify-center px-4 py-2.5 bg-white border border-neutral-200 hover:border-green-300 rounded-xl text-sm font-medium text-neutral-700 hover:bg-green-50 hover:text-green-700 transition-all shadow-sm active:scale-95"
                    >
                        {i18n.language === 'en' ? 'अ ⇄ A  (Hindi)' : 'A ⇄ अ  (English)'}
                    </button>

                    <button
                        onClick={signOut}
                        className="w-full flex items-center justify-center px-4 py-2.5 bg-red-50 text-red-600 font-medium rounded-xl hover:bg-red-100 hover:text-red-700 transition-colors border border-red-100 active:scale-95"
                    >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">

                {/* Mobile Header */}
                <header className="md:hidden bg-white border-b border-neutral-200 px-4 py-3 flex items-center justify-between z-30 shadow-sm sticky top-0">
                    GCS
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 text-neutral-600 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors focus:outline-none"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                </header>

                {/* Dynamic Page Content */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto w-full">
                    {/* Subtle background pattern */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>

                    <div className="relative z-10 w-full h-full p-4 md:p-8 lg:p-10">
                        <Outlet />
                    </div>
                </main>

            </div>
        </div>
    );
}
