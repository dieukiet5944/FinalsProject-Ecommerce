import Dashboard from '../pages/admin/Dashboard.jsx';
import Orders from '../pages/admin/OrderManagement.jsx';
import Inventory from '../pages/admin/Inventory.jsx';
import Customers from '../pages/admin/CustomerDirectory.jsx';
import Setting from '../pages/admin/Setting.jsx';
import StoreManagement from '../pages/admin/StoreManagement.jsx';
import Promotion from '../pages/admin/Promotion.jsx';
import AdminReviews from '../pages/admin/AdminReviews.jsx';

export const ADMIN_ROUTES = [
  {
    key: 'dashboard',
    title: 'Dashboard',
    path: '/admin/dashboard',
    component: Dashboard,
    keywords: ['Dash', 'board', 'dashboard']
  },
  {
    key: 'orders',
    title: 'Order Management',
    path: '/admin/orders',
    component: Orders,
    keywords: ['orders', 'sales']
  },
  {
    key: 'inventory',
    title: 'Inventory',
    path: '/admin/inventory',
    component: Inventory,
    keywords: ['inventory', 'stock']
  },
  {
    key: 'customers',
    title: 'Customer Directory',
    path: '/admin/customers',
    component: Customers,
    keywords: ['user', 'customers']
  },
  {
    key: 'promotion',
    title: 'Promotion',
    path: '/admin/promo',
    component: Promotion,
    keywords: ['promo', 'Promotion']
  },
  {
    key: 'review',
    title: 'Feedback',
    path: '/admin/review',
    component: AdminReviews,
    keywords: ['feedback', 'Adminreview', 'review']
  },
  {
    key: 'storemanagement',
    title: 'Store Management',
    path: '/admin/storemanagement',
    component: StoreManagement,
    keywords: ['stores', 'management']
  },
  {
    key: 'setting',
    title: 'Settings',
    path: '/admin/setting',
    component: Setting,
    keywords: ['setting', 'profile']
  }
];