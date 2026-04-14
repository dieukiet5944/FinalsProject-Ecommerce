// src/pages/client/Checkout.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const Checkout = () => {
  const { cart, totalPrice, placeOrder, loading: cartLoading } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: user?.full_name || '',
    phone: user?.phone || '',
    address: '',
    note: '',
  });

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear validation error for this field when user starts typing
    if (validationErrors[e.target.name]) {
      setValidationErrors({ ...validationErrors, [e.target.name]: '' });
    }
  };

  const handlePlaceOrder = async () => {
    const newErrors = {};
    
    if (!user) {
      alert("Please log in to place an order");
      navigate('/login');
      return;
    }

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }
    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setValidationErrors(newErrors);
      setError("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const result = await placeOrder({
        ...formData,
        userId: user.id || user._id,
      });

      alert(`🎉 Order placed successfully!\n\nOrder ID: ${result.orderId || 'ORD-' + Date.now()}`);
      navigate('/profile');
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to place order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="min-h-screen bg-light-bg py-12">
      <div className="max-w-6xl mx-auto px-6">
        <h1 className="text-4xl font-heading font-bold mb-10">Checkout</h1>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl">
            {error}
          </div>
        )}

        <div className="grid lg:grid-cols-12 gap-10">
          {/* Shipping Information */}
          <div className="lg:col-span-7">
            <div className="bg-white border border-gray-200 rounded-3xl p-8">
              <h2 className="text-2xl font-semibold mb-6">Shipping Information</h2>

              <div className="flex items-center gap-4 mb-8 p-5 bg-gray-50 rounded-2xl">
                {user?.avatar && (
                  <img
                    src={`/product/avtusers/${user.avatar}`}
                    alt={user.full_name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-white shadow"
                  />
                )}
                <div>
                  <p className="font-medium text-lg">{user?.full_name}</p>
                  <p className="text-sm text-gray-600">{user?.email}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className={`w-full px-5 py-4 border rounded-2xl focus:outline-none focus:border-primary-500 ${
                      validationErrors.fullName ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full px-5 py-4 border rounded-2xl focus:outline-none focus:border-primary-500 ${
                      validationErrors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your phone number"
                  />
                  {validationErrors.phone && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delivery Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows={3}
                    className={`w-full px-5 py-4 border rounded-2xl focus:outline-none focus:border-primary-500 ${
                      validationErrors.address ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Street, ward, district, city..."
                  />
                  {validationErrors.address && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.address}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Note (Optional)</label>
                  <textarea
                    name="note"
                    value={formData.note}
                    onChange={handleChange}
                    rows={2}
                    className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:border-primary-500"
                    placeholder="Special instructions for delivery..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-5">
            <div className="bg-white border border-gray-200 rounded-3xl p-8 sticky top-28">
              <h2 className="text-2xl font-semibold mb-6">Order Summary</h2>

              <div className="max-h-[420px] overflow-y-auto pr-2 space-y-5 mb-8">
                {cart.map((item, index) => (
                  <div key={index} className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-600">
                        {item.category} × {item.quantity || 1}
                      </p>
                    </div>
                    <p className="font-semibold text-warm-400 whitespace-nowrap ml-4">
                      ${(Number(item.price) * (item.quantity || 1)).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-6 space-y-4">
                <div className="flex justify-between text-lg">
                  <span className="text-gray-600">Subtotal</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6 mt-6">
                <div className="flex justify-between text-3xl font-bold">
                  <span>Total</span>
                  <span className="text-warm-400">${totalPrice.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={isSubmitting || cartLoading}
                className="w-full mt-10 py-5 text-lg font-semibold bg-primary-500 hover:bg-primary-600 disabled:bg-gray-400 text-white rounded-3xl transition-all"
              >
                {isSubmitting ? "Processing..." : "Place Order"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;