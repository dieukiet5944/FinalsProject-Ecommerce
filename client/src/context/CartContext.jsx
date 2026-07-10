import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth.js";
import { getCartApi, postCartApi, deleteCartApi } from "../services/cartService.js";
import { createOrderApi } from "../services/orderService.js";
import { message } from "antd";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchCart = async () => {
      if (!user?.id) {
        setCart([]);
        return;
      }
      try {
        setLoading(true);
        const response = await getCartApi(user.id);
        if (response?.success) {
          setCart(response?.data?.items || []);
        }
      } catch (error) {
        console.error("Error fetching cart from server:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [user?.id]);

  const addToCart = async (productOrId, quantity = 1) => {
    if (!user || (!user.id && !user._id)) {
      message.warning("Vui lòng đăng nhập để thêm vào giỏ hàng!");
      return;
    }

    const productId = typeof productOrId === 'object' ? (productOrId._id || productOrId.id) : productOrId;

    if (!productId) {
      console.error("Invalid product ID passed to addToCart");
      return;
    }

    try {
      setLoading(true);
      const currentUserId = user.id || user._id;
      const payload = {
        customerId: currentUserId,
        items: [{ productId, quantity }]
      };
      const response = await postCartApi(currentUserId, payload);
      const result = response?.data;


      if (result && result.items) {
        setCart(result.items);
        message.success("The product is already in carrt ");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      setLoading(true);
      const payload = {
        items: [{ productId, quantity: newQuantity }]
      };

      const response = await postCartApi(user.id, payload);
      const result = response?.data;

      if (result && result.items) {
        setCart(result.items);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId) => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const response = await deleteCartApi(user.id, productId);

      const result = response?.data;
      if (result && result.items) {
        setCart(result.items);
      }
    } catch (error) {
      console.error("Error removing item:", error);
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setCart([]);
      setTotalPrice(0);
    } catch (error) {
      console.error("Error clearing cart:", error);
    }
  };

  const placeOrder = async (orderData = {}) => {
    if (!user?.id) throw new Error("You need to log in to place an order");
    if (cart.length === 0) throw new Error("Your shopping cart is empty");

    setLoading(true);
    try {
      const payload = {
        customerId: user.id,
        items: cart.map((item) => ({
          productId: item.productId?._id || item.productId,
          quantity: item.quantity,
        })),
        ...orderData,
      };

      const response = await createOrderApi(payload);
      const result = response?.data;
      if (result?.success) {
        clearCart();
        return {
          success: true,
          orderId: result?.data?._id || result?.data?.data?._id
        };
      }
    } catch (error) {
      console.error(error);
      const errorMsg = error.response?.message || "Order failed. Please try again.";
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const totalPrice = cart.reduce((sum, item) => {
    const price = Number(item.productId?.price) || 0;
    return sum + price * (item.quantity || 1);
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
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);