import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";

<AuthProvider>
  <CartProvider>
    <App />
  </CartProvider>
</AuthProvider>