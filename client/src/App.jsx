import { Routes, Route } from "react-router-dom";
// --- PHẦN CỦA BẠN HÒA (USER) ---
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Home from "./pages/Home";
import ProductList from "./pages/ProductList";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import ProtectedRoute from "./router/ProtectedRoute";

// --- PHẦN CỦA HÒA (ADMIN) ---
import AdminLogin from './components/AdminLogin'; 
import HomePage from './components/HomePage';
import Dashboard from './components/Dashboard';
import Orders from './components/OrderManagement';
import Inventory from './components/Inventory';
import Customers from './components/CustomerDirectory';
import './App.css';

function App() {
  return (
    <Routes>
      {/* --- CỤM USER --- */}
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/home" element={<Home />} />
        <Route path="/products" element={<ProductList />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
      </Route>

      {/* --- CỤM ADMIN CỦA HÒA --- */}
      {/* Để tránh trùng với / của user, admin sẽ bắt đầu bằng /admin-login */}
      <Route path="/admin-login" element={<AdminLogin />} />
      <Route path="/admin/homepage" element={<HomePage />} />
      <Route path="/admin/dashboard" element={<Dashboard />} />
      <Route path="/admin/order" element={<Orders />} />
      <Route path="/admin/inventory" element={<Inventory />} />
      <Route path="/admin/customer" element={<Customers />} />
    </Routes>
  );
}

export default App;