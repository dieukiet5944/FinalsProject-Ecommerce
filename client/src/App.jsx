import { Routes, Route } from 'react-router-dom';
import AdminLogin from '../components/AdminLogin' 
import HomePage from '../components/HomePage'
import Dashboard from '../components/Dashboard'
import Orders from '../components/OrderManagement'
import Inventory from '../components/Inventory'
import Customers from '../components/CustomerDirectory'
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={
        <div className="min-h-screen bg-blue-100">
          <h1 className="text-center text-4xl font-bold text-green-800 py-20">
            Project E-commerce ReactJS - Đang xây dựng...
          </h1>
          <p className="text-center text-yellow-600">
            Chúng ta sẽ bắt đầu từ Authentication → Router → Context
          </p>
        </div>
      } />

      <Route path="/admin" element={<AdminLogin />} />
      <Route path="/homepage" element={<HomePage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/order" element={<Orders />} />
      <Route path="/inventory" element={<Inventory />} />
      <Route path='/customer' element={<Customers />} />
    </Routes>
  );
}

export default App;