import { useCart } from "../context/CartContext";
import { Link } from "react-router-dom";

const Cart = () => {
  const { cart, removeFromCart } = useCart();

  return (
    <div>
      <h2>Cart</h2>
      {cart.map((item) => (
        <div key={item.id}>
          <p>{item.title}</p>
          <button onClick={() => removeFromCart(item.id)}>Remove</button>
        </div>
      ))}

      <Link to="/checkout">Go to Checkout</Link>
    </div>
  );
};

export default Cart;