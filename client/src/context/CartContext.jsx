// src/context/CartContext.jsx
import { createContext, useContext, useState } from "react";
import { placeOrder as placeOrderApi } from "../services/api";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const addToCart = (product) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex(item => item.id === product.id);
      if (existingIndex !== -1) {
        const updatedCart = [...prev];
        updatedCart[existingIndex] = {
          ...updatedCart[existingIndex],
          quantity: (updatedCart[existingIndex].quantity || 1) + 1
        };
        return updatedCart;
      } else {
        return [...prev, { ...product, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;
    setCart((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const clearCart = () => setCart([]);

  const placeOrder = async () => {
    if (!user || !user.id) throw new Error("Bạn cần đăng nhập để đặt hàng");
    if (cart.length === 0) throw new Error("Giỏ hàng của bạn đang trống");

    setLoading(true);
    try {
      const result = await placeOrderApi(user.id, cart);
      clearCart();
      return {
        success: true,
        orderId: result.order.orderId,
      };
    } catch (error) {
      console.error(error);
      throw new Error(error.message || "Đặt hàng thất bại");
    } finally {
      setLoading(false);
    }
  };

  const totalPrice = cart.reduce((sum, item) => {
    return sum + (Number(item.price) || 0) * (item.quantity || 1);
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        placeOrder,
        loading,
        totalPrice,
        cartCount: cart.length,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => useContext(CartContext);