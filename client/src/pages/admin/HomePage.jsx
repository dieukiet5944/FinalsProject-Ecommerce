
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShopOutlined, MenuUnfoldOutlined, ShoppingOutlined, InboxOutlined, TeamOutlined, StockOutlined, SettingOutlined, SearchOutlined, BellOutlined, LogoutOutlined, MenuOutlined, ArrowRightOutlined } from '@ant-design/icons'
import { Input, Button, Modal, message, Drawer } from 'antd'

import axios from 'axios';

import Dashboard from '../../components/admin/Dashboard'
import Orders from '../../components/admin/OrderManagement'
import Inventory from '../../components/admin/Inventory'
import Customers from '../../components/admin/CustomerDirectory'
import Setting from '../../components/admin/Setting'
import StoreManagement from '../../components/admin/StoreManagement';

import { ADMIN_ROUTES } from "../../router/menuRoute";



const HomePage = () => {

    const [isModalOpen, setIsModalOpen] = useState(false);

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const [searchText, setSearchText] = useState('');

    const [searchResults, setSearchResults] = useState([]);

    const [admin, setAdmin] = useState([])

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchText(value);

        if (value.trim() === '') {
            setSearchResults([]);
        } else {
            const filtered = ADMIN_ROUTES.filter(route =>
                route.title.toLowerCase().includes(value.toLowerCase()) ||
                route.keywords.some(kw => kw.toLowerCase().includes(value.toLowerCase()))
            );
            setSearchResults(filtered);
        }
    };

    const handleSelectPage = (pageKey) => {
        setCurrentPage(pageKey);
        setSearchText('');
        setSearchResults([]);
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
                const response = await axios.get("http://localhost:8080/secret-key/admin");
                const result = response.data

                if (result && result.success && Array.isArray(result.data)) {
                    setAdmin(result.data);
                    console.log("Danh sách tài khoản Admin đã lấy về thành công:", result.data);
                } else {
                    console.error("The API structure has changed; the admin array is not found!");
                    setAdmin([]);
                }
            } catch (error) {
                console.error("Data retrieval error:", error);
            }
        };

        getData();
    }, [])

    const [currentPage, setCurrentPage] = useState('welcome');

    const renderContent = () => {
        switch (currentPage) {
            case 'dashboard':
                return admin.map((item, index) => (
                    <Dashboard key={item.id || index} name={item.userName} />
                ));
            case 'orders': return <Orders />;
            case 'storemanagement': return <StoreManagement />;
            case 'inventory': return <Inventory />;
            case 'customers': return <Customers />;
            case 'setting': return <Setting />;
            case 'welcome':
                return (
                    <div className="w-full min-h-screen p-4 sm:p-6 md:p-8 flex flex-col md:flex-row justify-center items-center gap-6 sm:gap-10 bg-gray-50/30">
                        <div className="shrink-0">
                            <img
                                src="../src/assets/logo.png"
                                alt="logo"
                                className="w-48 h-48 sm:w-64 sm:h-64 md:w-87.5 md:h-87.5 rounded-full object-cover shadow-md border-4 border-white"
                            />
                        </div>

                        <div className="flex flex-col gap-2.5 text-center md:text-left max-w-xl">
                            {admin.map((item, index) => (
                                <h2
                                    key={item.id || index}
                                    className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-gray-800 m-0 leading-tight tracking-tight"
                                >
                                    Welcome back, <span className="text-gray-900 block sm:inline">{item.userName}</span>!
                                </h2>
                            ))}
                            <p className="text-sm sm:text-lg md:text-xl font-semibold text-[#EE2C6D] m-0 mt-1">
                                Wishing you a productive and exciting workday!
                            </p>
                        </div>
                    </div>
                );
            default: return null;
        }
    };


    return (
        <div className="flex w-full h-screen overflow-hidden bg-slate-50">

            <div className="hidden md:flex flex-col w-65 lg:w-70 h-full bg-white border-r border-gray-100 shrink-0">

                <div className="flex items-center gap-3 p-5 border-b border-gray-50">
                    <img src="../src/assets/logo.png" alt="logo" className="w-14 h-14 object-contain rounded-full" />
                    <div className="min-w-0">
                        <h3 className="font-bold text-gray-800 m-0 text-base truncate">Crumb & Bean</h3>
                        <h2 className="text-[11px] font-black tracking-wider text-[#EE2C6D] m-0 mt-0.5 uppercase">ADMIN DASHBOARD</h2>
                    </div>
                </div>

                <div className="flex-1 p-4 flex flex-col gap-3 overflow-y-auto">
                    <Button
                        onClick={() => setCurrentPage('dashboard')}
                        className={`flex! items-center! gap-3! w-full! h-12! px-4! rounded-xl! text-sm! font-semibold! border-none! shadow-none! outline-none! transition-all! justify-start! ${currentPage === 'dashboard'
                            ? 'bg-[#EE2B6C]! text-white!'
                            : 'bg-transparent! text-gray-500! hover:text-[#EE2B6C]! hover:bg-pink-50/50!'
                            }`}
                    >
                        <MenuUnfoldOutlined className="text-lg" /> <span>Dashboard</span>
                    </Button>

                    <Button
                        onClick={() => setCurrentPage('orders')}
                        className={`flex! items-center! gap-3! w-full! h-12! px-4! rounded-xl! text-sm! font-semibold! border-none! shadow-none! outline-none! transition-all! justify-start! ${currentPage === 'orders'
                            ? 'bg-[#EE2B6C]! text-white!'
                            : 'bg-transparent! text-gray-500! hover:text-[#EE2B6C]! hover:bg-pink-50/50!'
                            }`}
                    >
                        <ShoppingOutlined className="text-lg" /> <span>Orders</span>
                    </Button>

                    <Button
                        onClick={() => setCurrentPage('storemanagement')}
                        className={`flex! items-center! gap-3! w-full! h-12! px-4! rounded-xl! text-sm! font-semibold! border-none! shadow-none! outline-none! transition-all! justify-start! ${currentPage === 'storemanagement'
                            ? 'bg-[#EE2B6C]! text-white!'
                            : 'bg-transparent! text-gray-500! hover:text-[#EE2B6C]! hover:bg-pink-50/50!'
                            }`}
                    >
                        <ShopOutlined className="text-lg" /> <span>Store Management</span>
                    </Button>

                    <Button
                        onClick={() => setCurrentPage('inventory')}
                        className={`flex! items-center! gap-3! w-full! h-12! px-4! rounded-xl! text-sm! font-semibold! border-none! shadow-none! outline-none! transition-all! justify-start! ${currentPage === 'inventory'
                            ? 'bg-[#EE2B6C]! text-white!'
                            : 'bg-transparent! text-gray-500! hover:text-[#EE2B6C]! hover:bg-pink-50/50!'
                            }`}
                    >
                        <InboxOutlined className="text-lg" /> <span>Inventory</span>
                    </Button>

                    <Button
                        onClick={() => setCurrentPage('customers')}
                        className={`flex! items-center! gap-3! w-full! h-12! px-4! rounded-xl! text-sm! font-semibold! border-none! shadow-none! outline-none! transition-all! justify-start! ${currentPage === 'customers'
                            ? 'bg-[#EE2B6C]! text-white!'
                            : 'bg-transparent! text-gray-500! hover:text-[#EE2B6C]! hover:bg-pink-50/50!'
                            }`}
                    >
                        <TeamOutlined className="text-lg" /> <span>Customers</span>
                    </Button>

                    <Button
                        onClick={() => setCurrentPage('setting')}
                        className={`flex! items-center! gap-3! w-full! h-12! px-4! rounded-xl! text-sm! font-semibold! border-none! shadow-none! outline-none! transition-all! justify-start! ${currentPage === 'setting'
                            ? 'bg-[#EE2B6C]! text-white!'
                            : 'bg-transparent! text-gray-500! hover:text-[#EE2B6C]! hover:bg-pink-50/50!'
                            }`}
                    >
                        <SettingOutlined className="text-lg" /> <span>Setting</span>
                    </Button>
                </div>

                <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex items-center gap-3">
                    <img src="../src/assets/logo-admin.jpg" alt="avatar" className="w-11 h-11 rounded-xl object-cover border border-gray-200" />
                    {admin.map((item, index) => (
                        <div key={item.id || index} className="min-w-0">
                            <h3 className="font-bold text-gray-800 text-sm m-0 truncate">{item.userName}</h3>
                            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider m-0 mt-0.5 truncate">{item.role}</p>
                        </div>
                    ))}
                </div>
            </div>


            <div className="flex-1 flex flex-col h-full overflow-hidden">

                <div className="sticky top-0 z-1000 w-full h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 sm:px-6 shrink-0 gap-4">

                    <div className="flex items-center gap-3 flex-1 max-w-xl">

                        <Button
                            type="text"
                            shape="circle"
                            icon={<MenuOutlined className="text-lg text-gray-600" />}
                            onClick={() => setIsDrawerOpen(true)}
                            className="md:hidden flex! items-center justify-center hover:bg-gray-100! shrink-0"
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
                                                <span className="text-xs text-slate-400">Chức năng quản trị</span>
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
                        <img src="../src/assets/logo-admin.jpg" alt="avatar" className="w-9 h-9 rounded-lg object-cover hidden sm:block border border-gray-100" />
                        <Button
                            type="text"
                            shape="circle"
                            onClick={showModal}
                            className="hover:bg-red-50! text-gray-400! hover:text-red-500! flex! items-center justify-center transition-colors"
                        >
                            <LogoutOutlined className="text-base" />
                        </Button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto main-content focus:outline-none">
                    {renderContent()}
                </div>
            </div>


            <Drawer
                title={
                    <div className="flex items-center gap-2.5">
                        <img src="../src/assets/logo.png" alt="logo" className="w-9 h-9 object-contain rounded-full" />
                        <span className="font-bold text-gray-800 text-base">Crumb & Bean Menu</span>
                    </div>
                }
                placement="left"
                onClose={() => setIsDrawerOpen(false)}
                open={isDrawerOpen}
                size={270}
                styles={{ body: { padding: '16px 12px' } }}
            >
                <div className="flex flex-col gap-3">
                    <Button
                        onClick={() => { setCurrentPage('dashboard'); setIsDrawerOpen(false); }}
                        className={`flex! items-center! gap-3! w-full! h-12! px-4! rounded-xl! text-sm! font-semibold! border-none! shadow-none! outline-none! transition-all! justify-start! ${currentPage === 'dashboard'
                            ? 'bg-[#EE2B6C]! text-white!'
                            : 'bg-transparent! text-gray-500! hover:text-[#EE2B6C]! hover:bg-pink-50/50!'
                            }`}
                    >
                        <MenuUnfoldOutlined className="text-lg" /> <span>Dashboard</span>
                    </Button>

                    <Button
                        onClick={() => { setCurrentPage('orders'); setIsDrawerOpen(false); }}
                        className={`flex! items-center! gap-3! w-full! h-12! px-4! rounded-xl! text-sm! font-semibold! border-none! shadow-none! outline-none! transition-all! justify-start! ${currentPage === 'orders'
                            ? 'bg-[#EE2B6C]! text-white!'
                            : 'bg-transparent! text-gray-500! hover:text-[#EE2B6C]! hover:bg-pink-50/50!'
                            }`}
                    >
                        <ShoppingOutlined className="text-lg" /> <span>Orders</span>
                    </Button>

                    <Button
                        onClick={() => { setCurrentPage('inventory'); setIsDrawerOpen(false); }}
                        className={`flex! items-center! gap-3! w-full! h-12! px-4! rounded-xl! text-sm! font-semibold! border-none! shadow-none! outline-none! transition-all! justify-start! ${currentPage === 'inventory'
                            ? 'bg-[#EE2B6C]! text-white!'
                            : 'bg-transparent! text-gray-500! hover:text-[#EE2B6C]! hover:bg-pink-50/50!'
                            }`}
                    >
                        <InboxOutlined className="text-lg" /> <span>Inventory</span>
                    </Button>

                    <Button
                        onClick={() => { setCurrentPage('customers'); setIsDrawerOpen(false); }}
                        className={`flex! items-center! gap-3! w-full! h-12! px-4! rounded-xl! text-sm! font-semibold! border-none! shadow-none! outline-none! transition-all! justify-start! ${currentPage === 'customers'
                            ? 'bg-[#EE2B6C]! text-white!'
                            : 'bg-transparent! text-gray-500! hover:text-[#EE2B6C]! hover:bg-pink-50/50!'
                            }`}
                    >
                        <TeamOutlined className="text-lg" /> <span>Customers</span>
                    </Button>

                    <Button
                        onClick={() => { setCurrentPage('setting'); setIsDrawerOpen(false); }}
                        className={`flex! items-center! gap-3! w-full! h-12! px-4! rounded-xl! text-sm! font-semibold! border-none! shadow-none! outline-none! transition-all! justify-start! ${currentPage === 'setting'
                            ? 'bg-[#EE2B6C]! text-white!'
                            : 'bg-transparent! text-gray-500! hover:text-[#EE2B6C]! hover:bg-pink-50/50!'
                            }`}
                    >
                        <SettingOutlined className="text-lg" /> <span>Setting</span>
                    </Button>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-gray-50 flex items-center gap-3">
                    <img src="../src/assets/logo-admin.jpg" alt="avatar" className="w-10 h-10 rounded-xl object-cover" />
                    {admin.map((item, index) => (
                        <div key={item.id || index} className="min-w-0">
                            <h4 className="font-bold text-gray-800 text-sm m-0 truncate">{item.userName}</h4>
                            <p className="text-[11px] text-gray-400 font-bold uppercase m-0 mt-0.5 truncate">{item.role}</p>
                        </div>
                    ))}
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


export default HomePage