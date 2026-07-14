import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { MenuOutlined, SearchOutlined, BellOutlined, LogoutOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { Input, Button, Modal, message, Drawer } from 'antd';

import { logoutAdminApi } from '../../services/authService.js';
import { ADMIN_ROUTES } from "../../router/menuRoute";
import AdminSidebar from './AdminSidebar.jsx';

function AdminLayout() {
    const navigate = useNavigate();
    
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [admin, setAdmin] = useState(null);
    const [currentPage, setCurrentPage] = useState('dashboard');

    useEffect(() => {
        try {
            const response = localStorage.getItem("admin");
            if (response) {
                setAdmin(JSON.parse(response));
            }
        } catch (error) {
            console.error("Data retrieval error:", error);
        }
    }, []);

    const searchResults = useMemo(() => {
        if (!searchText.trim()) return [];
        return ADMIN_ROUTES.filter(route =>
            route.title.toLowerCase().includes(searchText.toLowerCase()) ||
            route.keywords.some(kw => kw.toLowerCase().includes(searchText.toLowerCase()))
        );
    }, [searchText]);

    const handleSearch = (e) => {
        setSearchText(e.target.value);
    };

    const handleSelectPage = (pageKey) => {
        const cleanKey = pageKey ? pageKey.toLowerCase().trim() : '';
        setSearchText('');

        const routesMap = {
            'dashboard': '/admin/dashboard',
            'order': '/admin/order',
            'orders': '/admin/order',
            'storemanagement': '/admin/store',
            'store': '/admin/store',
            'inventory': '/admin/inventory',
            'promotion': '/admin/promo',
            'review': '/admin/review',
            'customer': '/admin/customer',
            'customers': '/admin/customer',
            'setting': '/admin/setting',
            'settings': '/admin/setting'
        };

        const targetRoute = routesMap[cleanKey];

        if (targetRoute) {
            const stateMap = { store: 'storemanagement', orders: 'order', customers: 'customer' };
            setCurrentPage(stateMap[cleanKey] || cleanKey);
            navigate(targetRoute);
        }
    };

    const showLogoutConfirm = () => {
        Modal.confirm({
            title: <span className="font-bold text-gray-800">Confirm Logout</span>,
            content: "Are you sure you want to sign out of the Admin Dashboard?",
            okText: 'Logout',
            okType: 'danger',
            cancelText: 'Cancel',
            centered: true,
            onOk: async () => {
                try {
                    if (admin?.id) {
                        await logoutAdminApi(admin.id);
                    }
                    localStorage.removeItem('admin');
                    localStorage.removeItem('token');
                    localStorage.removeItem("isAdminAuthenticated");
                    
                    message.success("Logged out successfully! See you again. 👋");
                    navigate('/login');
                } catch (error) {
                    console.error("Logout error:", error);
                    localStorage.clear();
                    navigate('/login');
                }
            },
        });
    };

    return (
        <div className="flex h-screen w-screen bg-gray-50 overflow-hidden">
            <aside className="hidden md:flex flex-col w-65 lg:w-70 h-full border-r border-gray-100 shrink-0">
                <AdminSidebar 
                    currentPage={currentPage} 
                    setCurrentPage={setCurrentPage} 
                    admin={admin} 
                />
            </aside>

            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 shadow-sm shrink-0 gap-4">
                    <div className="flex items-center gap-3 flex-1 max-w-xl">
                        <Button
                            type="text"
                            shape="circle"
                            icon={<MenuOutlined className="text-lg text-gray-600" />}
                            onClick={() => setIsDrawerOpen(true)}
                            className="md:hidden flex items-center justify-center hover:bg-gray-100 shrink-0"
                        />

                        <div className="relative w-full">
                            <div className="w-full h-10 px-3 bg-slate-100 hover:bg-slate-200/70 focus-within:bg-white focus-within:border-pink-400 transition-colors rounded-xl flex items-center gap-2 border border-transparent">
                                <SearchOutlined className="text-gray-400 text-base" />
                                <Input
                                    placeholder="Search features..."
                                    variant="borderless"
                                    value={searchText}
                                    onChange={handleSearch}
                                    className="p-0 text-sm font-medium text-gray-700 placeholder-gray-400 w-full"
                                />
                            </div>

                            {searchResults.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl shadow-xl border border-slate-100 z-50 max-h-60 overflow-y-auto p-1.5 flex flex-col gap-1">
                                    {searchResults.map((item) => (
                                        <button
                                            key={item.key}
                                            type="button"
                                            onClick={() => handleSelectPage(item.key)}
                                            className="w-full text-left px-4 py-2.5 hover:bg-pink-50 text-slate-700 rounded-lg transition-colors flex justify-between items-center cursor-pointer group"
                                        >
                                            <div>
                                                <span className="text-sm font-semibold block group-hover:text-[#EE2C6D] transition-colors">
                                                    {item.title}
                                                </span>
                                                <span className="text-xs text-slate-400">Administration functions</span>
                                            </div>
                                            <span className="text-[10px] uppercase font-bold tracking-wider bg-slate-100 text-slate-400 px-2 py-0.5 rounded-md group-hover:bg-pink-100 group-hover:text-[#EE2C6D]">
                                                <ArrowRightOutlined />
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <Button type="text" shape="circle" className="flex items-center justify-center text-gray-500 shrink-0">
                            <BellOutlined className="text-lg" />
                        </Button>
                    </div>

                    <div className="flex items-center gap-3 pl-4 border-l border-gray-200 shrink-0">
                        <img 
                            src={admin?.avatar ? `/product/adminavt/${admin.avatar}` : '/logo/logo.png'} 
                            alt="avatar" 
                            className="w-9 h-9 rounded-lg object-cover hidden sm:block border border-gray-100" 
                        />
                        <Button
                            type="text"
                            shape="circle"
                            onClick={showLogoutConfirm}
                            className="hover:bg-red-50 text-gray-400 hover:text-red-500 flex items-center justify-center transition-colors"
                        >
                            <LogoutOutlined className="text-base" />
                        </Button>
                    </div>
                </header>

                <main className="flex-1 overflow-x-hidden overflow-y-auto p-8 bg-zinc-100/50">
                    <Outlet />
                </main>
            </div>

            <Drawer
                title={
                    <div className="flex items-center gap-2.5">
                        <img src="/logo/logo.png" alt="logo" className="w-9 h-9 object-contain rounded-full" />
                        <span className="font-bold text-gray-800 text-base">Crumb & Bean Menu</span>
                    </div>
                }
                placement="left"
                onClose={() => setIsDrawerOpen(false)}
                open={isDrawerOpen}
                width={270}
                styles={{ body: { padding: 0 } }} 
            >
                <AdminSidebar 
                    currentPage={currentPage} 
                    setCurrentPage={setCurrentPage} 
                    admin={admin} 
                    onItemClick={() => setIsDrawerOpen(false)} 
                />
            </Drawer>
        </div>
    );
}

export default AdminLayout;