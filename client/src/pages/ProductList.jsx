import { useEffect, useState } from "react";
import { getProducts } from "../services/api";
import { Link } from "react-router-dom";

const ProductList = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    getProducts().then(setProducts);
  }, []);

  return (
    <div>
      <h2>Products</h2>
      {products.map((p) => (
        <div key={p.id}>
          <Link to={`/product/${p.id}`}>
            <h4>{p.title}</h4>
          </Link>
        </div>
      ))}
    </div>
  );
};

export default ProductList;