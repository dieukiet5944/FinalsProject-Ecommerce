import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getProduct } from "../services/api";
import { useCart } from "../context/CartContext";

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState({});
  const { addToCart } = useCart();

  useEffect(() => {
    getProduct(id).then(setProduct);
  }, [id]);

  return (
    <div>
      <h2>{product.title}</h2>
      <p>{product.description}</p>
      <button onClick={() => addToCart(product)}>Add to Cart</button>
    </div>
  );
};

export default ProductDetail;