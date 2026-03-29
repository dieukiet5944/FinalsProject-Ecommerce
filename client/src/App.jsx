import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import ProductList from "./pages/ProductList";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ProtectedRoute from "./router/ProtectedRoute";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";

// --- PHẦN ADMIN ---
import AdminLogin from './components/admin/AdminLogin'; 
import HomePage from './components/admin/HomePage';
import Dashboard from './components/admin/Dashboard';
import Orders from './components/admin/OrderManagement';
import Inventory from './components/admin/Inventory';
import Customers from './components/admin/CustomerDirectory';
import './App.css';

function App() {
  return (
    <>
      <Header />
      <Routes>
        {/* --- ROUTES CỦA USER --- */}
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

        {/* --- ROUTES CỦA ADMIN --- */}
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin/homepage" element={<HomePage />} />
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/admin/order" element={<Orders />} />
        <Route path="/admin/inventory" element={<Inventory />} />
        <Route path="/admin/customer" element={<Customers />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;