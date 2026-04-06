import { Routes, Route } from "react-router-dom";
import Home from "./pages/client/Home";
import ProductList from "./pages/client/ProductList";
import ProductDetail from "./pages/client/ProductDetail";
import Cart from "./pages/client/Cart";
import Checkout from "./pages/client/Checkout";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ProtectedRoute from "./router/ProtectedRoute";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";

// --- PHẦN ADMIN ---
import AdminLogin from '../src/components/admin/AdminLogin'; 
import HomePage from '../src/pages/admin/HomePage';
import Dashboard from '../src/components/admin/Dashboard';
import Orders from '../src/components/admin/OrderManagement';
import Inventory from '../src/components/admin/Inventory';
import Customers from '../src/components/admin/CustomerDirectory';
import './App.css';

// Layout for all 
import UserLayout from "./components/layout/UserLayout";

function App() {
  return (
    <>
      <Routes>
        {/* --- ROUTES CỦA USER --- */}
        <Route element={<UserLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<ProductList />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          
            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              }
            />
        </Route>

        {/* --- ROUTES CỦA ADMIN --- */}
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin">
          <Route path="homepage" element={<HomePage />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="order" element={<Orders />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="customer" element={<Customers />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;