// src/App.jsx
import { Routes, Route } from 'react-router-dom';

import UserLayout from './components/layout/UserLayout';   // hoặc './layout/UserLayout' tùy cấu trúc của bạn

import Home from './pages/client/Home';
import ProductList from './pages/client/ProductList';
import ProductDetail from './pages/client/ProductDetail';
import Cart from './pages/client/Cart';
import Checkout from './pages/client/Checkout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

import ProtectedRoute from './router/ProtectedRoute';

// --- PHẦN ADMIN ---
import AdminLogin from '../src/components/admin/AdminLogin'; 
import HomePage from '../src/pages/admin/HomePage';
import Dashboard from '../src/components/admin/Dashboard';
import Orders from '../src/components/admin/OrderManagement';
import Inventory from '../src/components/admin/Inventory';
import Customers from '../src/components/admin/CustomerDirectory';
import './App.css';

function App() {
  return (
    <Routes>
      {/* Nhóm các trang có Header + Footer */}
      <Route element={<UserLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<ProductList />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Checkout cần đăng nhập */}
      <Route
        path="/checkout"
        element={
          <ProtectedRoute>
            <Checkout />
          </ProtectedRoute>
        }
      />
      {/* {route admin } */}

      <Route path="/admin-login" element={<AdminLogin />} />

      <Route path="/admin">
        <Route index element={<HomePage />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="order" element={<Orders />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="customer" element={<Customers />} />
      </Route>
    </Routes>
  );
}

export default App;