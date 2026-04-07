// src/pages/client/ProductDetail.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProduct } from '../../services/api';
import { useCart } from '../../context/CartContext';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await getProduct(id);
        setProduct(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return <div className="py-20 text-center">Đang tải...</div>;
  if (!product) return <div>Không tìm thấy sản phẩm</div>;

  return (
    <div className="max-w-5xl px-6 py-12 mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 text-emerald-500 hover:underline"
      >
        ← Quay lại
      </button>

      <div className="grid gap-12 md:grid-cols-2">
        <img
          src={product.image || product.avatar}
          alt={product.name}
          className="w-full rounded-2xl"
        />

        <div>
          <h1 className="mb-4 text-4xl font-bold">{product.name}</h1>
          <p className="mb-6 text-3xl font-semibold text-emerald-500">
            {Number(product.price).toLocaleString()} đ
          </p>

          <div className="mb-8 prose prose-invert">
            <p>{product.description}</p>
          </div>

          <button
            onClick={() => {
              addToCart(product);
              alert("Đã thêm vào giỏ hàng!");
            }}
            className="w-full py-4 text-lg font-semibold transition-colors bg-emerald-600 hover:bg-emerald-500 rounded-xl"
          >
            Thêm vào giỏ hàng
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;