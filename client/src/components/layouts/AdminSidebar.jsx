import React from 'react';
import { Link } from 'react-router-dom';
import { 
    MenuUnfoldOutlined, ShoppingOutlined, ShareAltOutlined, 
    MessageOutlined, ShopOutlined, InboxOutlined, 
    TeamOutlined, SettingOutlined 
} from '@ant-design/icons';

const AdminSidebar = ({ currentPage, setCurrentPage, admin, onItemClick }) => {
    
    const menuItems = [
        { key: 'dashboard', label: 'Dashboard', path: '/admin/dashboard', icon: <MenuUnfoldOutlined /> },
        { key: 'order', label: 'Orders', path: '/admin/order', icon: <ShoppingOutlined /> },
        { key: 'promotion', label: 'Promotion', path: '/admin/promo', icon: <ShareAltOutlined /> },
        { key: 'review', label: 'Feedback', path: '/admin/review', icon: <MessageOutlined /> },
        { key: 'storemanagement', label: 'Store Management', path: '/admin/store', icon: <ShopOutlined /> },
        { key: 'inventory', label: 'Inventory', path: '/admin/inventory', icon: <InboxOutlined /> },
        { key: 'customer', label: 'Customers', path: '/admin/customer', icon: <TeamOutlined /> },
        { key: 'setting', label: 'Setting', path: '/admin/setting', icon: <SettingOutlined /> },
    ];

    const handleLinkClick = (key) => {
        setCurrentPage(key);
        if (onItemClick) onItemClick(); 
    };

    return (
        <div className="flex flex-col h-full bg-white">
            <div className="flex items-center gap-3 p-5 border-b border-gray-50">
                <img src="/logo/logo.png" alt="logo" className="w-14 h-14 object-contain rounded-full" />
                <div className="min-w-0">
                    <h3 className="font-bold text-gray-800 m-0 text-base truncate">Crumb & Bean</h3>
                    <h2 className="text-[11px] font-black tracking-wider text-[#EE2C6D] m-0 mt-0.5 uppercase">ADMIN DASHBOARD</h2>
                </div>
            </div>

            <div className="flex-1 p-4 flex flex-col gap-3 overflow-y-auto">
                {menuItems.map((item) => (
                    <Link
                        key={item.key}
                        to={item.path}
                        onClick={() => handleLinkClick(item.key)}
                        className={`flex items-center gap-3 w-full h-12 px-4 rounded-xl text-sm font-semibold transition-all justify-start border-none outline-none ${
                            currentPage === item.key
                                ? 'bg-[#EE2B6C] text-white shadow-md'
                                : 'bg-transparent text-gray-500 hover:text-[#EE2B6C] hover:bg-pink-50/50'
                        }`}
                    >
                        <span className="text-lg flex items-center">{item.icon}</span>
                        <span>{item.label}</span>
                    </Link>
                ))}
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex items-center gap-3">
                <img 
                    src={admin?.avatar ? `/product/adminavt/${admin.avatar}` : '/logo/logo.png'} 
                    alt="avatar" 
                    className="w-11 h-11 rounded-xl object-cover border border-gray-200" 
                />
                <div className="min-w-0">
                    <h3 className="font-bold text-gray-800 text-sm m-0 truncate">{admin?.name || 'Admin'}</h3>
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider m-0 mt-0.5 truncate">{admin?.role || 'Staff'}</p>
                </div>
            </div>
        </div>
    );
};

export default AdminSidebar;