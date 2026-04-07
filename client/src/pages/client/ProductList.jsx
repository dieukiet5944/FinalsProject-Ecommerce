// src/pages/client/ProductList.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProducts } from '../../services/api';
import { useCart } from '../../context/CartContext';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) return <div className="py-20 text-xl text-center">Đang tải sản phẩm...</div>;

  return (
    <div className="px-6 py-10 mx-auto max-w-7xl">
      <h1 className="mb-8 text-4xl font-bold">Tất cả sản phẩm</h1>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <div key={product.id} className="overflow-hidden transition-all border bg-zinc-900 rounded-xl border-zinc-800 hover:border-emerald-500">
            <img
              src={product.image || product.avatar}
              alt={product.name}
              className="object-cover w-full h-56"
            />
            <div className="p-5">
              <h3 className="mb-2 text-lg font-semibold line-clamp-2">{product.name}</h3>
              <p className="mb-4 text-xl font-bold text-emerald-500">
                {Number(product.price).toLocaleString()} đ
              </p>

              <div className="flex gap-3">
                <Link
                  to={`/product/${product.id}`}
                  className="flex-1 py-3 text-center transition-colors border rounded-lg border-zinc-700 hover:border-white"
                >
                  Xem chi tiết
                </Link>
                <button
                  onClick={() => addToCart(product)}
                  className="flex-1 py-3 font-medium transition-colors rounded-lg bg-emerald-600 hover:bg-emerald-500"
                >
                  Thêm vào giỏ
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList;