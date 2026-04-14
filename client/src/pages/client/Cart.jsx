// src/pages/client/Cart.jsx
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import CartItem from '../../components/client/CartItem';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, totalPrice } = useCart();

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-light-bg flex items-center justify-center py-20">
        <div className="max-w-md mx-auto text-center px-6">
          <div className="text-7xl mb-6">🛍️</div>
          <h2 className="text-4xl font-heading font-semibold mb-4">Your Cart is Empty</h2>
          <p className="text-light-text-secondary mb-8">
            You haven't added any products to your cart yet.
          </p>
          <Link
            to="/products"
            className="inline-block bg-primary-500 hover:bg-primary-600 text-white px-10 py-4 rounded-2xl font-semibold transition-all"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-bg text-light-text py-12">
      <div className="max-w-6xl mx-auto px-6">
        <h1 className="text-4xl font-heading font-bold tracking-tight mb-10">
          Your Cart ({cart.length})
        </h1>

        <div className="grid lg:grid-cols-12 gap-10">
          {/* Product List - Scrollable */}
          <div className="lg:col-span-7">
            <div
              className="bg-light-card border border-gray-100 rounded-3xl p-6 max-h-[620px] overflow-y-auto custom-scroll"
            >
              <div className="space-y-6 pr-2">
                {cart.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeFromCart}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary - Sticky */}
          <div className="lg:col-span-5">
            <div className="bg-light-card border border-gray-100 rounded-3xl p-8 sticky top-28">
              <h2 className="text-2xl font-semibold mb-8">Order Summary</h2>

              <div className="space-y-4 mb-8 text-lg">
                <div className="flex justify-between">
                  <span className="text-light-text-secondary">Subtotal</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-light-text-secondary">Shipping</span>
                  <span className="text-green-600 font-medium">Free</span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6 flex justify-between items-baseline text-3xl font-bold mb-10">
                <span>Total</span>
                <span className="text-warm-400">${totalPrice.toFixed(2)}</span>
              </div>

              <Link
                to="/checkout"
                className="block w-full py-5 text-center text-lg font-semibold bg-primary-500 hover:bg-primary-600 text-white rounded-3xl transition-all shadow-lg"
              >
                Proceed to Checkout
              </Link>

              <Link
                to="/products"
                className="block text-center mt-6 text-light-text-secondary hover:text-primary-500 transition-colors"
              >
                ← Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;