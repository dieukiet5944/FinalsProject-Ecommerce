import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { useCart } from '../../context/CartContext';
import { message, Modal, Radio, Space } from 'antd';
import { validatePromoApi } from '../../services/promotionService.js';
import { CreditCardOutlined, WalletOutlined, SyncOutlined } from '@ant-design/icons';
import { getOrdersApi } from '../../services/orderService.js';

const Checkout = () => {
  const { cart, totalPrice, placeOrder, loading: cartLoading, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: user?.name || user?.full_name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    note: '',
  });

  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);

  const finalPrice = totalPrice - (appliedPromo?.discountAmount || 0);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (validationErrors[e.target.name]) {
      setValidationErrors({ ...validationErrors, [e.target.name]: '' });
    }
  };

  const checkPaymentStatus = (orderId) => {
    setIsCheckingPayment(true);
    const interval = setInterval(async () => {
      try {
        const res = await getOrdersApi(orderId);
        if (res.data.paymentStatus === 'paid') {
          clearInterval(interval);
          message.success("Sepay payment gateway confirms: Payment successful!");
          setQrModalOpen(false);
          navigate('/profile');
        }
      } catch (err) {
        console.error("Error checking the state:", err);
      }
    }, 3000);

    setTimeout(() => {
      clearInterval(interval);
      setIsCheckingPayment(false);
    }, 300000);
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
        paymentMethod,
        paymentStatus: 'unpaid',
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
        totalPrice: finalPrice,
      };

      const result = await placeOrder(orderPayload);

      if (typeof clearCart === 'function') {
        clearCart();
      }

      const generatedOrderId = result?.orderId || result?.data?._id || 'ORD' + Math.floor(1000 + Math.random() * 9000);
      const newOrder = { id: generatedOrderId, totalPrice: finalPrice };

      if (paymentMethod === 'bank') {
        setCurrentOrder(newOrder);
        setQrModalOpen(true);
        checkPaymentStatus(generatedOrderId);
      } else {
        message.success("Order placed successfully via COD!");
        navigate('/profile');
      }

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
        message.success(`Applied successfully!`);
      } else if (response?.data?.success) {
        setAppliedPromo(response.data.data);
      }

    } catch (err) {
      console.error("Promo error:", err);
      message.error(`${err.response?.data?.message || "Invalid code!"}`);
    }
  };

  const handleCancelPromo = () => {
    setAppliedPromo(null);
    setPromoInput('');
    message.info("Promo code removed.");
  };


  const TỶ_GIÁ_USD_VND = 25400;
  const finalPriceVND = Math.round(finalPrice * TỶ_GIÁ_USD_VND);

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
          <div className="lg:col-span-7 space-y-8">
            <div className="bg-white border border-gray-200 rounded-3xl p-8">
              <h2 className="text-2xl font-semibold mb-6">Shipping Information</h2>

              <div className="flex items-center gap-4 mb-8 p-5 bg-gray-50 rounded-2xl">
                {user?.avatar && (
                  <img
                    src={user.avatar.startsWith('http') ? user.avatar : `/product/avtusers/${user.avatar}`}
                    alt={user.full_name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-white shadow"
                  />
                )}
                <div>
                  <p className="font-medium text-lg">{user?.name || user?.full_name}</p>
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
                    className={`w-full px-5 py-4 border rounded-2xl focus:outline-none focus:border-primary-500 ${validationErrors.fullName ? 'border-red-500' : 'border-gray-300'}`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number <span className="text-red-500">*</span></label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full px-5 py-4 border rounded-2xl focus:outline-none focus:border-primary-500 ${validationErrors.phone ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Enter your phone number"
                  />
                  {validationErrors.phone && <p className="text-red-500 text-sm mt-1">{validationErrors.phone}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Address <span className="text-red-500">*</span></label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows={3}
                    className={`w-full px-5 py-4 border rounded-2xl focus:outline-none focus:border-primary-500 ${validationErrors.address ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Street, ward, district, city..."
                  />
                  {validationErrors.address && <p className="text-red-500 text-sm mt-1">{validationErrors.address}</p>}
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

            <div className="bg-white border border-gray-200 rounded-3xl p-8">
              <h2 className="text-2xl font-semibold mb-6">Payment Method</h2>
              <Radio.Group
                onChange={(e) => setPaymentMethod(e.target.value)}
                value={paymentMethod}
                className="w-full"
              >
                <Space orientation="vertical" className="w-full gap-4">
                  <div
                    onClick={() => setPaymentMethod('cod')}
                    className={`flex items-center justify-between p-4 border rounded-2xl cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-primary-500 bg-primary-500/5' : 'border-gray-200'
                      }`}
                  >
                    <Radio value="cod" className="font-semibold text-gray-700 select-none">
                      <span className="flex items-center gap-2"><WalletOutlined /> Cash on Delivery (COD)</span>
                    </Radio>
                  </div>
                  <div
                    onClick={() => setPaymentMethod('bank')}
                    className={`flex items-center justify-between p-4 border rounded-2xl cursor-pointer transition-all ${paymentMethod === 'bank' ? 'border-primary-500 bg-primary-500/5' : 'border-gray-200'
                      }`}
                  >
                    <Radio value="bank" className="font-semibold text-gray-700 select-none">
                      <span className="flex items-center gap-2"><CreditCardOutlined /> Bank transfer (Auto QR code via Sepay)</span>
                    </Radio>
                  </div>
                </Space>
              </Radio.Group>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="bg-white border border-gray-200 rounded-3xl p-8 sticky top-28">
              <h2 className="text-2xl font-semibold mb-6">Order Summary</h2>
              {console.log(cart)}
              <div className="max-h-60 overflow-y-auto pr-2 space-y-5 mb-8">
                {cart.map((item, index) => {
                  const product = item.productId
                  return (
                    <div key={index} className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-gray-600">{product.category} × {item.quantity || 1}</p>
                      </div>
                      <p className="font-semibold text-warm-400 whitespace-nowrap ml-4">
                        ${((Number(product.price) || 0) * (Number(item.quantity) || 1)).toFixed(2)}
                      </p>
                    </div>
                  )
                })}
              </div>

              <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl mb-6">
                <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">🏷️ Have a promo code?</p>
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
                    <button type="button" onClick={handleApplyPromo} className="px-4 py-2 text-sm font-medium bg-gray-900 text-white rounded-xl cursor-pointer">Apply</button>
                  ) : (
                    <button type="button" onClick={handleCancelPromo} className="px-4 py-2 text-sm font-medium bg-red-500 text-white rounded-xl cursor-pointer">Cancel</button>
                  )}
                </div>
                {appliedPromo && <p className="text-xs text-green-600 font-medium mt-2">✓ Code applied! Saving ${(appliedPromo?.discountAmount || 0).toFixed(2)}</p>}
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
                  <span className="text-warm-400">${finalPrice.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={isSubmitting || cartLoading}
                className="w-full mt-10 py-5 text-lg font-semibold bg-primary-500 hover:bg-primary-600 disabled:bg-gray-400 text-white rounded-3xl transition-all cursor-pointer shadow-md"
              >
                {isSubmitting ? "Processing..." : paymentMethod === 'bank' ? "Pay Now with QR" : "Place Order"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <Modal
        title={<span className="font-bold text-lg font-heading">Quét Mã QR Thanh Toán (Sepay)</span>}
        open={qrModalOpen}
        closable={false}
        footer={[
          <button
            key="cancel"
            onClick={() => {
              setQrModalOpen(false);
            }}
            className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold mr-2 hover:bg-gray-50 cursor-pointer"
          >
            Thanh toán sau / Đóng
          </button>
        ]}
        width={340}
        centered
      >
        <div className="py-4 flex flex-col items-center text-center">
          <p className="text-xs text-gray-400 mb-4">
            Please scan the QR code below. The system will automatically process your order once it receives matching funds from the bank.
          </p>

          <div className="py-4 flex flex-col items-center text-center">
            <img
              src={`https://img.vietqr.io/image/ACB-5417941-qr_only.png?amount=${finalPrice}&addInfo=CRUMB_${currentOrder?.id}`}
              alt="Sepay Auto Payment QR"
              className="w-52 h-52 object-contain border border-gray-100 rounded-2xl p-2 bg-white"
            />
            <div className="mt-4 bg-gray-50 border border-gray-100 p-3 rounded-xl w-full text-left text-xs space-y-2 font-medium text-gray-600">
              <div className="flex justify-between items-center">
                <span>Total amount (USD):</span>
                <span className="font-bold text-gray-900">${finalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center border-t border-gray-200/60 pt-1.5">
                <span>Amount converted (VND):</span>
                <span className="font-black text-primary-600 text-sm">
                  {finalPriceVND.toLocaleString('vi-VN')} đ
                </span>
              </div>
              <div className="flex justify-between items-center border-t border-gray-200/60 pt-1.5">
                <span>Transfer details:</span>
                <span className="font-mono font-black text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-100">
                  CRUMB_{currentOrder?.id}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-2xs text-amber-600 mt-5 font-semibold animate-pulse">
              <SyncOutlined spin />
              <span>Waiting for a response from the bank's transaction gateway...</span>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Checkout;