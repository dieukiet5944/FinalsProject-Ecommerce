// src/pages/client/Checkout.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const Checkout = () => {
  const { cart, totalPrice, placeOrder, loading } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handlePlaceOrder = async () => {
    if (!user) {
      alert("Vui lòng đăng nhập để đặt hàng");
      return;
    }

    try {
      const result = await placeOrder();
      alert(`🎉 Đặt hàng thành công!\n\nMã đơn hàng: ${result.orderId}`);
      navigate('/');
    } catch (err) {
      console.error(err);
      setError(err.message || "Đặt hàng thất bại. Vui lòng thử lại.");
    }
  };

  if (cart.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="max-w-4xl px-6 py-12 mx-auto">
      <h1 className="mb-10 text-4xl font-bold">Thanh toán</h1>

      {error && <div className="p-4 mb-6 text-red-400 bg-red-500/20 rounded-xl">{error}</div>}

      <div className="p-10 bg-zinc-900 rounded-3xl">
        <h2 className="mb-6 text-2xl">Đơn hàng của bạn</h2>

        {cart.map((item, index) => (
          <div key={index} className="flex justify-between py-4 border-b border-zinc-800 last:border-none">
            <div>
              {item.name} × {item.quantity || 1}
            </div>
            <div>
              {(Number(item.price) * (item.quantity || 1)).toLocaleString()} đ
            </div>
          </div>
        ))}

        <div className="flex justify-between pt-6 mt-10 text-2xl font-bold border-t border-zinc-700">
          <span>Tổng thanh toán</span>
          <span className="text-emerald-500">{totalPrice.toLocaleString()} đ</span>
        </div>

        <button
          onClick={handlePlaceOrder}
          disabled={loading}
          className="w-full py-6 mt-10 text-xl font-semibold transition-colors bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-700 rounded-2xl"
        >
          {loading ? "Đang xử lý..." : "Xác nhận đặt hàng"}
        </button>
      </div>
    </div>
  );
};

export default Checkout;