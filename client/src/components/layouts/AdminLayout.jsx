import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShopOutlined, MenuUnfoldOutlined, ShoppingOutlined, InboxOutlined, TeamOutlined, StockOutlined, SettingOutlined, SearchOutlined, BellOutlined, LogoutOutlined, MenuOutlined, ArrowRightOutlined } from '@ant-design/icons'
import { Input, Button, Modal, message, Drawer } from 'antd'
import { Outlet, Link } from 'react-router-dom';

import { logoutAdminApi } from '../../services/authService.js';

import Dashboard from '../../pages/admin/Dashboard.jsx'
import Orders from '../../pages/admin/OrderManagement.jsx'
import Inventory from '../../pages/admin/Inventory.jsx'
import Customers from '../../pages/admin/CustomerDirectory.jsx'
import Setting from '../../pages/admin/Setting.jsx'
import StoreManagement from '../../pages/admin/StoreManagement.jsx';

import { ADMIN_ROUTES } from "../../router/menuRoute";

function AdminLayout() {

    const [isModalOpen, setIsModalOpen] = useState(false);

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const [searchText, setSearchText] = useState('');

    const [admin, setAdmin] = useState([])

    const searchResults = useMemo(() => {
        if (!searchText.trim()) return [];

        return ADMIN_ROUTES.filter(route =>
            route.title.toLowerCase().includes(searchText.toLowerCase()) ||
            route.keywords.some(kw =>
                kw.toLowerCase().includes(searchText.toLowerCase())
            )
        );
    }, [searchText]);


    const handleSearch = (e) => {
        setSearchText(e.target.value);
    }

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

            'customer': '/admin/customer',
            'customers': '/admin/customer',

            'setting': '/admin/setting',
            'settings': '/admin/setting'
        };

        const targetRoute = routesMap[cleanKey];

        if (targetRoute) {
            if (cleanKey === 'store') {
                setCurrentPage('storemanagement');
            } else if (cleanKey === 'orders') {
                setCurrentPage('order');
            } else if (cleanKey === 'customers') {
                setCurrentPage('customer');
            } else {
                setCurrentPage(cleanKey);
            }

            navigate(targetRoute);
        } else {
            console.error(`Not found route key: "${pageKey}"`);
        }
    };

    const showModal = () => {
        setIsModalOpen(true);
    };
    const handleOk = () => {
        localStorage.removeItem("isAdminAuthenticated");

        message.info("Logout successful!");

        navigate("/admin-login");
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const navigate = useNavigate();

    useEffect(() => {
        const getData = async () => {
            try {
                const response = localStorage.getItem("admin")
                if (response) {
                    const currentAdmin = JSON.parse(response);

                    setAdmin(currentAdmin);
                }
            } catch (error) {
                console.error("Data retrieval error:", error);
            }
        };

        getData();
    }, [])

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
                    const storedAdmin = JSON.parse(localStorage.getItem('admin'));

                    const adminId = storedAdmin?.id;

                    if (adminId) {
                        await logoutAdminApi(adminId);
                    }

                    localStorage.removeItem('admin');
                    localStorage.removeItem('token');

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

    const [currentPage, setCurrentPage] = useState('welcome');

    return (
        <div className="flex h-screen w-screen bg-gray-50 overflow-hidden">
            <aside className="hidden md:flex flex-col w-65 lg:w-70 h-full bg-white border-r border-gray-100 shrink-0">
                <div className="hidden md:flex flex-col w-65 lg:w-70 h-full bg-white border-r border-gray-100 shrink-0">

                    <div className="flex items-center gap-3 p-5 border-b border-gray-50">
                        <img src="/logo/logo.png" alt="logo" className="w-14 h-14 object-contain rounded-full" />
                        <div className="min-w-0">
                            <h3 className="font-bold text-gray-800 m-0 text-base truncate">Crumb & Bean</h3>
                            <h2 className="text-[11px] font-black tracking-wider text-[#EE2C6D] m-0 mt-0.5 uppercase">ADMIN DASHBOARD</h2>
                        </div>
                    </div>

                    <div className="flex-1 p-4 flex flex-col gap-3 overflow-y-auto">
                        <Link to="/admin/dashboard" onClick={() => setCurrentPage('dashboard')}
                            className={`flex! items-center! gap-3! w-full! h-12! px-4! rounded-xl! text-sm! font-semibold! border-none! shadow-none! outline-none! transition-all! justify-start! ${currentPage === 'dashboard'
                                ? 'bg-[#EE2B6C]! text-white!'
                                : 'bg-transparent! text-gray-500! hover:text-[#EE2B6C]! hover:bg-pink-50/50!'
                                }`}
                        >
                            <MenuUnfoldOutlined className="text-lg" /> <span>Dashboard</span>
                        </Link>
                        <Link to="/admin/order" onClick={() => setCurrentPage('order')}
                            className={`flex! items-center! gap-3! w-full! h-12! px-4! rounded-xl! text-sm! font-semibold! border-none! shadow-none! outline-none! transition-all! justify-start! ${currentPage === 'order'
                                ? 'bg-[#EE2B6C]! text-white!'
                                : 'bg-transparent! text-gray-500! hover:text-[#EE2B6C]! hover:bg-pink-50/50!'
                                }`}
                        >
                            <ShoppingOutlined className="text-lg" /> <span>Orders</span>
                        </Link>
                        <Link to="/admin/store" onClick={() => setCurrentPage('storemanagement')}
                            className={`flex! items-center! gap-3! w-full! h-12! px-4! rounded-xl! text-sm! font-semibold! border-none! shadow-none! outline-none! transition-all! justify-start! ${currentPage === 'storemanagement'
                                ? 'bg-[#EE2B6C]! text-white!'
                                : 'bg-transparent! text-gray-500! hover:text-[#EE2B6C]! hover:bg-pink-50/50!'
                                }`}
                        >
                            <ShopOutlined className="text-lg" /> <span>Store Management</span>
                        </Link>
                        <Link to="/admin/inventory" onClick={() => setCurrentPage('inventory')}
                            className={`flex! items-center! gap-3! w-full! h-12! px-4! rounded-xl! text-sm! font-semibold! border-none! shadow-none! outline-none! transition-all! justify-start! ${currentPage === 'inventory'
                                ? 'bg-[#EE2B6C]! text-white!'
                                : 'bg-transparent! text-gray-500! hover:text-[#EE2B6C]! hover:bg-pink-50/50!'
                                }`}
                        >
                            <InboxOutlined className="text-lg" /> <span>Inventory</span>
                        </Link>
                        <Link to="/admin/customer" onClick={() => setCurrentPage('customer')}
                            className={`flex! items-center! gap-3! w-full! h-12! px-4! rounded-xl! text-sm! font-semibold! border-none! shadow-none! outline-none! transition-all! justify-start! ${currentPage === 'customer'
                                ? 'bg-[#EE2B6C]! text-white!'
                                : 'bg-transparent! text-gray-500! hover:text-[#EE2B6C]! hover:bg-pink-50/50!'
                                }`}
                        >
                            <TeamOutlined className="text-lg" /> <span>Customers</span>
                        </Link>
                        <Link to="/admin/setting" onClick={() => setCurrentPage('setting')}
                            className={`flex! items-center! gap-3! w-full! h-12! px-4! rounded-xl! text-sm! font-semibold! border-none! shadow-none! outline-none! transition-all! justify-start! ${currentPage === 'setting'
                                ? 'bg-[#EE2B6C]! text-white!'
                                : 'bg-transparent! text-gray-500! hover:text-[#EE2B6C]! hover:bg-pink-50/50!'
                                }`}
                        >
                            <SettingOutlined className="text-lg" /> <span>Setting</span>
                        </Link>
                    </div>

                    <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex items-center gap-3">
                        <img src={`/product/adminavt/${admin.avatar}`} alt="avatar" className="w-11 h-11 rounded-xl object-cover border border-gray-200" />

                        <div key={admin.id} className="min-w-0">
                            <h3 className="font-bold text-gray-800 text-sm m-0 truncate">{admin.name}</h3>
                            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider m-0 mt-0.5 truncate">{admin.role}</p>
                        </div>
                    </div>
                </div>
            </aside>

            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm">
                    <div className="sticky top-0 z-1000 w-full h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 sm:px-6 shrink-0 gap-4">

                        <div className="flex items-center gap-3 flex-1 max-w-xl">

                            <Button
                                type="text"
                                shape="circle"
                                icon={<MenuOutlined className="text-lg text-gray-600" />}
                                onClick={() => setIsDrawerOpen(true)}
                                className="md:hidden! items-center justify-center hover:bg-gray-100 shrink-0"
                            />

                            <div className="relative w-full">
                                <div className="w-full h-10 px-3 bg-slate-100 hover:bg-slate-200/70 focus-within:bg-white focus-within:border-pink-400 transition-colors rounded-xl flex items-center gap-2 border border-transparent">
                                    <SearchOutlined className="text-gray-400 text-base" />
                                    <Input
                                        placeholder="Search orders, items, or customers..."
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

                            <Button type="text" shape="circle" className="flex! items-center justify-center text-gray-500 shrink-0">
                                <BellOutlined className="text-lg" />
                            </Button>
                        </div>

                        <div className="flex items-center gap-3 pl-4 border-l border-gray-200 shrink-0">
                            <img src={`/product/adminavt/${admin.avatar}`} alt="avatar" className="w-9 h-9 rounded-lg object-cover hidden sm:block border border-gray-100" />
                            <Button
                                type="text"
                                shape="circle"
                                onClick={showLogoutConfirm}
                                className="hover:bg-red-50! text-gray-400! hover:text-red-500! flex! items-center justify-center transition-colors"
                            >
                                <LogoutOutlined className="text-base" />
                            </Button>
                        </div>
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
                size={270}
                className='md:hidden'
            >
                <div className="flex flex-col gap-3">
                    <Link to="/admin/dashboard" onClick={() => { setCurrentPage('dashboard'); setIsDrawerOpen(false) }}
                        className={`flex! items-center! gap-3! w-full! h-12! px-4! rounded-xl! text-sm! font-semibold! border-none! shadow-none! outline-none! transition-all! justify-start! ${currentPage === 'dashboard'
                            ? 'bg-[#EE2B6C]! text-white!'
                            : 'bg-transparent! text-gray-500! hover:text-[#EE2B6C]! hover:bg-pink-50/50!'
                            }`}
                    >
                        <MenuUnfoldOutlined className="text-lg" /> <span>Dashboard</span>
                    </Link>
                    <Link to="/admin/order" onClick={() => { setCurrentPage('order'); setIsDrawerOpen(false) }}
                        className={`flex! items-center! gap-3! w-full! h-12! px-4! rounded-xl! text-sm! font-semibold! border-none! shadow-none! outline-none! transition-all! justify-start! ${currentPage === 'order'
                            ? 'bg-[#EE2B6C]! text-white!'
                            : 'bg-transparent! text-gray-500! hover:text-[#EE2B6C]! hover:bg-pink-50/50!'
                            }`}
                    >
                        <ShoppingOutlined className="text-lg" /> <span>Orders</span>
                    </Link>
                    <Link to="/admin/store" onClick={() => { setCurrentPage('storemanagement'); setIsDrawerOpen(false) }}
                        className={`flex! items-center! gap-3! w-full! h-12! px-4! rounded-xl! text-sm! font-semibold! border-none! shadow-none! outline-none! transition-all! justify-start! ${currentPage === 'store'
                            ? 'bg-[#EE2B6C]! text-white!'
                            : 'bg-transparent! text-gray-500! hover:text-[#EE2B6C]! hover:bg-pink-50/50!'
                            }`}
                    >
                        <ShopOutlined className="text-lg" /> <span>Store Management</span>
                    </Link>
                    <Link to="/admin/inventory" onClick={() => { setCurrentPage('inventory'); setIsDrawerOpen(false) }}
                        className={`flex! items-center! gap-3! w-full! h-12! px-4! rounded-xl! text-sm! font-semibold! border-none! shadow-none! outline-none! transition-all! justify-start! ${currentPage === 'inventory'
                            ? 'bg-[#EE2B6C]! text-white!'
                            : 'bg-transparent! text-gray-500! hover:text-[#EE2B6C]! hover:bg-pink-50/50!'
                            }`}
                    >
                        <InboxOutlined className="text-lg" /> <span>Inventory</span>
                    </Link>
                    <Link to="/admin/customer" onClick={() => { setCurrentPage('customer'); setIsDrawerOpen(false) }}
                        className={`flex! items-center! gap-3! w-full! h-12! px-4! rounded-xl! text-sm! font-semibold! border-none! shadow-none! outline-none! transition-all! justify-start! ${currentPage === 'customer'
                            ? 'bg-[#EE2B6C]! text-white!'
                            : 'bg-transparent! text-gray-500! hover:text-[#EE2B6C]! hover:bg-pink-50/50!'
                            }`}
                    >
                        <TeamOutlined className="text-lg" /> <span>Customers</span>
                    </Link>
                    <Link to="/admin/setting" onClick={() => { setCurrentPage('setting'); setIsDrawerOpen(false) }}
                        className={`flex! items-center! gap-3! w-full! h-12! px-4! rounded-xl! text-sm! font-semibold! border-none! shadow-none! outline-none! transition-all! justify-start! ${currentPage === 'setting'
                            ? 'bg-[#EE2B6C]! text-white!'
                            : 'bg-transparent! text-gray-500! hover:text-[#EE2B6C]! hover:bg-pink-50/50!'
                            }`}
                    >
                        <SettingOutlined className="text-lg" /> <span>Setting</span>
                    </Link>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-gray-50 flex items-center gap-3">
                    <img src={`/product/adminavt/${admin?.avatar}`} alt="avatar" className="w-10 h-10 rounded-xl object-cover shrink-0" />
                    <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-gray-800 text-sm m-0 truncate">
                            {admin.name}
                        </h4>
                        <p className="text-[11px] text-gray-400 font-bold uppercase m-0 mt-0.5 truncate">
                            {admin.role}
                        </p>
                    </div>
                </div>
            </Drawer>


            <Modal
                title={null}
                closable={{ 'aria-label': 'Custom Close Button' }}
                open={isModalOpen}
                onOk={handleOk}
                onCancel={handleCancel}
                okText="Logout"
                okButtonProps={{ danger: true, className: "font-semibold" }}
                cancelButtonProps={{ className: "font-semibold" }}
                className="max-w-[calc(100vw-32px)] sm:max-w-100"
                centered
            >
                <div className="text-center py-4">
                    <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center m-auto mb-3 text-xl">
                        <LogoutOutlined />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 m-0">Confirm Logout</h3>
                    <p className="text-sm text-gray-400 m-0 mt-1.5 font-medium">Are you sure you want to log out of the admin center?</p>
                </div>
            </Modal>
        </div>
    );
}

export default AdminLayout;