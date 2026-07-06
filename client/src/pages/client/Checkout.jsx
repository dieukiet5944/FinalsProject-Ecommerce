import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { useCart } from '../../context/CartContext';
import { validatePromoApi } from '../../services/promotionService.js';
import { message } from 'antd';

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

  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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

    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";

    if (Object.keys(newErrors).length > 0) {
      setValidationErrors(newErrors);
      setError("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const orderPayload = {
        ...formData,
        userId: user.id || user._id,
        items: cart.map(item => ({
          productId: item.productId || item._id,
          name: item.name,
          qty: item.quantity || 1,
          price: Number(item.price)
        })),
        subTotalPrice: totalPrice,

        promotion: {
          code: appliedPromo ? appliedPromo.code : null,
          discountAmount: appliedPromo ? appliedPromo.discountAmount : 0
        },

        totalPrice: totalPrice - (appliedPromo?.discountAmount || 0),
      };

      const result = await placeOrder(orderPayload);

      alert(`Order placed successfully!\n\nOrder ID: ${result.orderId || 'ORD-' + Date.now()}`);

      navigate('/order');
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to place order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/cart');
    }
  }, [user, navigate]);

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return message.warning("Please enter a promo code!");

    try {

      const response = await validatePromoApi({
        code: promoInput.trim().toUpperCase(),
        orderAmount: totalPrice,
        userId: user.id || user._id
      });

      if (response && response.success) {
        setAppliedPromo(response.data);
        alert(`🎉 Applied successfully!`);
      } else if (response?.data?.success) {
        setAppliedPromo(response.data.data);
      }

    } catch (err) {
      console.error("Promo error:", err);
      alert(`${err.response?.data?.message || "Invalid code!"}`);
    }
  };

  const handleCancelPromo = () => {
    setAppliedPromo(null);
    setPromoInput('');
    message.info("Promo code removed. You can save it for your next order!");
  };

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
                    className={`w-full px-5 py-4 border rounded-2xl focus:outline-none focus:border-primary-500 ${validationErrors.fullName ? 'border-red-500' : 'border-gray-300'
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
                    className={`w-full px-5 py-4 border rounded-2xl focus:outline-none focus:border-primary-500 ${validationErrors.phone ? 'border-red-500' : 'border-gray-300'
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
                    className={`w-full px-5 py-4 border rounded-2xl focus:outline-none focus:border-primary-500 ${validationErrors.address ? 'border-red-500' : 'border-gray-300'
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

          <div className="lg:col-span-5">
            <div className="bg-white border border-gray-200 rounded-3xl p-8 sticky top-28">
              <h2 className="text-2xl font-semibold mb-6">Order Summary</h2>

              <div className="max-h-105 overflow-y-auto pr-2 space-y-5 mb-8">
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

              <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl mb-6">
                <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                  🏷️ Have a promo code?
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g., CRUMBBIGBEANS"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                    disabled={!!appliedPromo}
                    className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-primary-500 uppercase font-mono disabled:bg-gray-100"
                  />
                  {!appliedPromo ? (
                    <button
                      type="button"
                      onClick={handleApplyPromo}
                      className="px-4 py-2 text-sm font-medium bg-gray-900 hover:bg-gray-800 text-white rounded-xl transition-colors cursor-pointer"
                    >
                      Apply
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleCancelPromo}
                      className="px-4 py-2 text-sm font-medium bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                </div>

                {appliedPromo && (
                  <p className="text-xs text-green-600 font-medium mt-2 flex items-center gap-1">
                    ✓ Code applied successfully! Saving you ${(appliedPromo?.discountAmount || 0).toFixed(2)}
                  </p>
                )}
              </div>

              <div className="border-t border-gray-200 pt-6 space-y-4">
                <div className="flex justify-between text-lg">
                  <span className="text-gray-600">Subtotal</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>

                {appliedPromo && (
                  <div className="flex justify-between text-lg text-green-600 font-medium">
                    <span>Discount ({appliedPromo?.code})</span>
                    <span>-${(appliedPromo?.discountAmount || 0).toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-lg">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6 mt-6">
                <div className="flex justify-between text-3xl font-bold">
                  <span>Total</span>
                  <span className="text-warm-400">
                    ${(totalPrice - (appliedPromo?.discountAmount || 0)).toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={isSubmitting || cartLoading}
                className="w-full mt-10 py-5 text-lg font-semibold bg-primary-500 hover:bg-primary-600 disabled:bg-gray-400 text-white rounded-3xl transition-all cursor-pointer"
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