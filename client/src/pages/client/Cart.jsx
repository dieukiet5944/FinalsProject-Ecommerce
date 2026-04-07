// src/pages/client/Cart.jsx
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, totalPrice } = useCart();

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl px-6 py-20 mx-auto text-center">
        <h2 className="mb-4 text-3xl">Giỏ hàng trống</h2>
        <Link to="/products" className="text-emerald-500 hover:underline">
          Tiếp tục mua sắm →
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl px-6 py-10 mx-auto">
      <h1 className="mb-10 text-4xl font-bold">Giỏ hàng của bạn</h1>

      <div className="space-y-6">
        {cart.map((item) => (
          <div key={item.id} className="flex gap-6 p-6 bg-zinc-900 rounded-2xl">
            <img
              src={item.image || item.avatar}
              alt={item.name}
              className="object-cover w-32 h-32 rounded-xl"
            />

            <div className="flex-1">
              <h3 className="text-xl font-semibold">{item.name}</h3>
              <p className="mt-1 text-emerald-500">
                {Number(item.price).toLocaleString()} đ
              </p>

              <div className="flex items-center gap-4 mt-6">
                <button
                  onClick={() => updateQuantity(item.id, (item.quantity || 1) - 1)}
                  className="w-10 h-10 border rounded-lg border-zinc-700 hover:bg-zinc-800"
                >
                  −
                </button>
                <span className="w-8 text-xl text-center">{item.quantity || 1}</span>
                <button
                  onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)}
                  className="w-10 h-10 border rounded-lg border-zinc-700 hover:bg-zinc-800"
                >
                  +
                </button>

                <button
                  onClick={() => removeFromCart(item.id)}
                  className="ml-auto text-red-400 hover:text-red-500"
                >
                  Xóa
                </button>
              </div>
            </div>

            <div className="font-semibold text-right">
              {(Number(item.price) * (item.quantity || 1)).toLocaleString()} đ
            </div>
          </div>
        ))}
      </div>

      <div className="p-8 mt-12 bg-zinc-900 rounded-2xl">
        <div className="flex justify-between text-2xl font-bold">
          <span>Tổng tiền:</span>
          <span className="text-emerald-500">{totalPrice.toLocaleString()} đ</span>
        </div>

        <Link
          to="/checkout"
          className="block w-full py-5 mt-8 text-xl font-semibold text-center transition-colors bg-emerald-600 hover:bg-emerald-500 rounded-2xl"
        >
          Tiến hành thanh toán
        </Link>
      </div>
    </div>
  );
};

export default Cart;