import { Routes, Route } from 'react-router-dom';

import CustomerLayout from './components/layouts/CustomerLayout.jsx';
import Home from './pages/client/Home.jsx';
import ProductList from './pages/client/ProductList';
import ProductDetail from './pages/client/ProductDetail';
import Cart from './pages/client/Cart.jsx';
import Checkout from './pages/client/Checkout';
import Login from './components/auth/Login.jsx';
import Register from './components/auth/Register';
import Order from './pages/client/Order.jsx';
import ProcessPage from './pages/client/ProcessPage.jsx';
import UserProfile from './pages/client/UserProfile.jsx';
import TechnicalSupport from './pages/client/TechnicalSupport.jsx';
import OfferPromotions from './pages/client/OfferPromotion.jsx';

import ProtectedRoute from './router/ProtectedRoute';

import AdminLogin from './pages/admin/AdminLogin.jsx';
import AdminLayout from './components/layouts/AdminLayout.jsx';
import Dashboard from './pages/admin/Dashboard.jsx';
import Orders from './pages/admin/OrderManagement.jsx';
import Promotion from './pages/admin/Promotion.jsx';
import Inventory from './pages/admin/Inventory.jsx';
import Customers from './pages/admin/CustomerDirectory.jsx';
import Setting from './pages/admin/Setting.jsx';
import StoreManagement from './pages/admin/StoreManagement.jsx';
import AdminProtectedRoute from './router/AdminProtectedRoute.jsx';
import AdminReviews from './pages/admin/AdminReviews.jsx';
import './App.css';

function App() {
  return (
    <Routes>
      <Route element={<CustomerLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<ProductList />} />
        <Route path="/products/:slug" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/order" element={<Order />} />
        <Route path="/offerpromo" element={<OfferPromotions />} />
        <Route path="/support" element={<TechnicalSupport />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/process" element={<ProcessPage />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route
        path="/checkout"
        element={
          <ProtectedRoute>
            <Checkout />
          </ProtectedRoute>
        }
      />

      <Route path="/admin-login" element={<AdminLogin />} />

      <Route element={<AdminProtectedRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="order" element={<Orders />} />
          <Route path="promo" element={<Promotion />} />
          <Route path="review" element={<AdminReviews />} />
          <Route path="store" element={<StoreManagement />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="customer" element={<Customers />} />
          <Route path="setting" element={<Setting />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;