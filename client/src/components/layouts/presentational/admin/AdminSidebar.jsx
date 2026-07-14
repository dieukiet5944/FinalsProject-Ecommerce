import { Link } from 'react-router-dom';
import {
  MenuUnfoldOutlined,
  ShoppingOutlined,
  ShareAltOutlined,
  MessageOutlined,
  ShopOutlined,
  InboxOutlined,
  TeamOutlined,
  SettingOutlined,
} from '@ant-design/icons';

const AdminSidebar = ({ currentPage, onPageSelect, admin }) => {
  const menuItems = [
    { key: 'dashboard', icon: <MenuUnfoldOutlined />, label: 'Dashboard', path: '/admin/dashboard' },
    { key: 'order', icon: <ShoppingOutlined />, label: 'Orders', path: '/admin/order' },
    { key: 'promotion', icon: <ShareAltOutlined />, label: 'Promotion', path: '/admin/promo' },
    { key: 'review', icon: <MessageOutlined />, label: 'Feedback', path: '/admin/review' },
    { key: 'storemanagement', icon: <ShopOutlined />, label: 'Store Management', path: '/admin/store' },
    { key: 'inventory', icon: <InboxOutlined />, label: 'Inventory', path: '/admin/inventory' },
    { key: 'customer', icon: <TeamOutlined />, label: 'Customers', path: '/admin/customer' },
    { key: 'setting', icon: <SettingOutlined />, label: 'Setting', path: '/admin/setting' },
  ];

  return (
    <aside className="hidden md:flex flex-col w-65 lg:w-70 h-full bg-white border-r border-gray-100 shrink-0">
      {/* Header */}
      <div className="flex items-center gap-3 p-5 border-b border-gray-50">
        <img src="/logo/logo.png" alt="logo" className="w-14 h-14 object-contain rounded-full" />
        <div className="min-w-0">
          <h3 className="font-bold text-gray-800 m-0 text-base truncate">Crumb & Bean</h3>
          <h2 className="text-[11px] font-black tracking-wider text-[#EE2C6D] m-0 mt-0.5 uppercase">ADMIN DASHBOARD</h2>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 p-4 flex flex-col gap-3 overflow-y-auto">
        {menuItems.map((item) => (
          <Link
            key={item.key}
            to={item.path}
            onClick={() => onPageSelect(item.key)}
            className={`flex items-center gap-3 w-full h-12 px-4 rounded-xl text-sm font-semibold transition-all justify-start ${
              currentPage === item.key
                ? 'bg-[#EE2B6C] text-white'
                : 'bg-transparent text-gray-500 hover:text-[#EE2B6C] hover:bg-pink-50/50'
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </div>

      {/* Admin Profile */}
      <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex items-center gap-3">
        <img
          src={`/product/adminavt/${admin?.avatar}`}
          alt="avatar"
          className="w-11 h-11 rounded-xl object-cover border border-gray-200"
        />
        <div className="min-w-0">
          <h3 className="font-bold text-gray-800 text-sm m-0 truncate">{admin?.name}</h3>
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider m-0 mt-0.5 truncate">{admin?.role}</p>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
