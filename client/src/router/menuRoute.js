import Dashboard from '../components/admin/Dashboard.jsx';
import Orders from '../components/admin/OrderManagement.jsx';
import Inventory from '../components/admin/Inventory.jsx';
import Customers from '../components/admin/CustomerDirectory.jsx';
import Setting from '../components/admin/Setting.jsx';
import StoreManagement from '../components/admin/StoreManagement.jsx';

export const ADMIN_ROUTES = [
  {
    key: 'dashboard',
    title: 'Dashboard (Bảng điều khiển)',
    path: '/admin/dashboard',
    component: Dashboard,
    keywords: ['thống kê', 'tổng quan', 'home', 'dashboard'] // Từ khóa phụ để tìm kiếm thông minh hơn
  },
  {
    key: 'orders',
    title: 'Order Management (Quản lý đơn hàng)',
    path: '/admin/orders',
    component: Orders,
    keywords: ['đơn hàng', 'hóa đơn', 'orders', 'sales']
  },
  {
    key: 'inventory',
    title: 'Inventory (Quản lý kho hàng)',
    path: '/admin/inventory',
    component: Inventory,
    keywords: ['kho', 'sản phẩm', 'bánh', 'inventory', 'stock']
  },
  {
    key: 'customers',
    title: 'Customer Directory (Danh mục khách hàng)',
    path: '/admin/customers',
    component: Customers,
    keywords: ['khách hàng', 'user', 'customers', 'người dùng']
  },
  {
    key: 'storemanagement',
    title: 'Store Management (Quản lý cửa hàng)',
    path: '/admin/storemanagement',
    component: StoreManagement,
    keywords: ['cửa hàng', 'chi nhánh', 'stores', 'vùng']
  },
  {
    key: 'setting',
    title: 'Settings (Cài đặt hệ thống)',
    path: '/admin/setting',
    component: Setting,
    keywords: ['cài đặt', 'cấu hình', 'setting', 'profile']
  }
];