// src/pages/client/ProductDetail.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProduct } from '../../services/api';
import { useCart } from '../../context/CartContext';
import LoadingSpinner from '../../components/client/LoadingSpinner';
import ProductCard from '../../components/client/ProductCard';
import SuccessToast from '../../components/client/SuccessToast';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [addedToCart, setAddedToCart] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await getProduct(id);
        setProduct(data);

        // Mock related products
        const mockRelated = [
          { id: "BC-001", name: "Caramel Macchiato", price: 8.5, image: "caramel-macchiato.jpg", category: "DRINK" },
          { id: "BC-002", name: "Cheesecake", price: 12, image: "cheesecake.jpg", category: "CAKE" },
        ];
        setRelatedProducts(mockRelated);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // Get correct image path based on category
  const getImagePath = (prod) => {
    if (!prod || !prod.image) return 'https://picsum.photos/id/1015/600/600';
    const folder = prod.category?.toLowerCase() === 'cake' ? 'cake' : 'drink';
    return `/product/${folder}/${prod.image}`;
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart({ ...product, quantity });
      setAddedToCart(true);
      setShowToast(true);
      setTimeout(() => setAddedToCart(false), 2000);
      setTimeout(() => setShowToast(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-light-bg">
        <LoadingSpinner />
      </div>
    );
  }

  if (!product) {
    return <div className="py-32 text-center text-xl">Product not found</div>;
  }

  return (
    <div className="min-h-screen bg-light-bg text-light-text pt-10 pb-20">
      <SuccessToast isVisible={showToast} message={`Added ${quantity}x ${product?.name} to cart!`} />
      <div className="max-w-6xl mx-auto px-6">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-8 text-light-text-secondary hover:text-light-text transition-colors"
        >
          ← Back to Shop
        </button>

        <div className="grid md:grid-cols-2 gap-12 lg:gap-16">
          {/* Left - Product Image */}
          <div className="rounded-3xl overflow-hidden shadow-xl bg-light-card">
            <img
              src={getImagePath(product)}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = 'https://picsum.photos/id/1015/600/600';
              }}
            />
          </div>

          {/* Right - Product Information */}
          <div className="flex flex-col">
            <h1 className="text-5xl font-heading font-bold leading-tight mb-4">
              {product.name}
            </h1>

            <p className="text-4xl font-semibold text-warm-400 mb-6">
              ${product.price}
            </p>

            <div className="mb-8">
              <span className="inline-block px-4 py-1.5 bg-light-surface text-sm rounded-full border">
                {product.category}
              </span>
            </div>

            {/* Description */}
            <div className="prose prose-lg text-light-text-secondary mb-10 leading-relaxed">
              <p>
                {product.description ||
                  "High-quality handmade product, freshly made every day at The Crumb & Bean."}
              </p>
            </div>

            {/* Stock Status */}
            {product.stock && (
              <div className="mb-8 text-sm">
                <span className="font-medium">Availability: </span>
                <span className={`font-semibold ${product.status === 'IN STOCK' ? 'text-green-600' : 'text-red-500'}`}>
                  {product.status === 'IN STOCK' ? 'In Stock' : 'Out of Stock'}
                </span>
                {product.stock.currentstock && (
                  <span className="ml-2 text-light-text-secondary">
                    ({product.stock.currentstock} / {product.stock.capacity})
                  </span>
                )}
              </div>
            )}

            {/* Quantity Selector */}
            <div className="mb-8">
              <p className="text-sm font-medium text-light-text-secondary mb-3">QUANTITY</p>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-12 flex items-center justify-center border border-gray-300 rounded-2xl hover:bg-gray-100 text-2xl font-light"
                >
                  −
                </button>
                <span className="w-12 text-center text-2xl font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-12 h-12 flex items-center justify-center border border-gray-300 rounded-2xl hover:bg-gray-100 text-2xl font-light"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              className={`w-full py-5 text-lg font-semibold text-white rounded-3xl transition-all shadow-lg mb-10 ${
                addedToCart
                  ? 'bg-green-500 hover:bg-green-600'
                  : 'bg-primary-500 hover:bg-primary-600'
              }`}
            >
              {addedToCart ? '✓ Added to Cart!' : 'ADD TO CART'}
            </button>

            {/* Additional Info */}
            <div className="border-t border-gray-200 pt-8 space-y-3 text-sm text-light-text-secondary">
              <p>✓ Freshly made daily</p>
              <p>✓ High-quality ingredients</p>
              <p>✓ Made with love in small batches</p>
            </div>
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-20">
          <h2 className="text-3xl font-heading font-semibold mb-8">You May Also Like</h2>
          {relatedProducts.length === 0 ? (
            <p className="text-center text-light-text-secondary">No related products found</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedProducts.map((item) => (
                <ProductCard
                  key={item.id}
                  product={item}
                  onAddToCart={addToCart}
                  showLink={true}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;