import { createContext, useContext, useState } from "react";
import { useAuth } from "../hooks/useAuth.js";
import {createOrderApi} from '../services/orderService.js';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth(); 

  const getCartItemId = (product) => {
    return product.id || product._id || `${product.name}-${product.price}`;
  };

  const isSameCartItem = (item, id) => {
    return item.id === id || item._id === id;
  };

  const addToCart = (product) => {
    const cartId = getCartItemId(product);
    const quantityToAdd = Number(product.quantity) > 0 ? Number(product.quantity) : 1;

    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => isSameCartItem(item, cartId));

      if (existingIndex !== -1) {
        const updatedCart = [...prev];
        const existingItem = updatedCart[existingIndex];
        updatedCart[existingIndex] = {
          ...existingItem,
          id: cartId,
          quantity: (existingItem.quantity || 1) + quantityToAdd,
        };
        return updatedCart;
      }

      return [...prev, { ...product, id: cartId, quantity: quantityToAdd }];
    });
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => !isSameCartItem(item, id)));
  };

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;
    setCart((prev) =>
      prev.map((item) =>
        isSameCartItem(item, id) ? { ...item, id: getCartItemId(item), quantity: newQuantity } : item
      )
    );
  };

  const clearCart = () => setCart([]);

  const placeOrder = async (orderData = {}) => {
    if (!user || !user.id) throw new Error("Bạn cần đăng nhập để đặt hàng");
    if (cart.length === 0) throw new Error("Giỏ hàng của bạn đang trống");

    setLoading(true);
    try { 
      const payload = {
        customerId: user.id,
        items: cart.map((item) => ({
          productId: item._id,
          qty: item.quantity ,
          name: item.name,
          price: item.price,
        })),
        ...orderData,
      };

      const response = await createOrderApi(payload);
      const result = response.data?.data

      clearCart();
      return {
        success: true,
        orderId: result._id 
      };
    } catch (error) {
      console.error(error);
      const errorMsg = error.response?.data?.message || "Đặt hàng thất bại";
      throw new Error(errorMsg);
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

export const useCart = () => useContext(CartContext);