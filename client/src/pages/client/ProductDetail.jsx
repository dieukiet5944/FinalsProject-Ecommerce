import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { getProductsSlugApi, getProductsApi } from '../../services/productService.js';
import LoadingSpinner from '../../components/client/LoadingSpinner.jsx';
import ProductCard from '../../components/client/ProductCard';
import SuccessToast from '../../components/client/SuccessToast';
import ProductReviews from '../../components/client/ProductReviews.jsx';

const ProductDetail = () => {
  const { slug } = useParams();
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
        const response = await getProductsSlugApi(slug);
        const currentProduct = response?.data;

        setProduct(currentProduct);

        if (currentProduct) {
          const allRes = await getProductsApi();
          const dataAll = allRes?.data || [];
          
          const related = dataAll.filter(
            (item) => item.category === currentProduct.category && item.slug !== currentProduct.slug
          ).slice(0, 3); 

          setRelatedProducts(related);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

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
   <div className="min-h-screen bg-light-bg text-light-text pt-6 pb-16">
      <SuccessToast isVisible={showToast} message={`Added ${quantity}x ${product?.name} to cart!`} />
      
      <div className="max-w-5xl mx-auto px-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-6 text-sm text-light-text-secondary hover:text-light-text transition-colors"
        >
          ← Back to Shop
        </button>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          <div className="rounded-2xl overflow-hidden shadow-md bg-light-card max-h-112.5 flex items-center">
            <img
              src={getImagePath(product)}
              alt={product.name}
              className="w-full h-full object-cover aspect-square"
              onError={(e) => {
                e.target.src = 'https://picsum.photos/id/1015/600/600';
              }}
            />
          </div>

          <div className="flex flex-col">
            <h1 className="text-3xl font-heading font-bold leading-tight mb-2">
              {product.name}
            </h1>

            <p className="text-2xl font-bold text-warm-400 mb-4">
              ${product.price}
            </p>

            <div className="mb-5">
              <span className="inline-block px-3 py-1 bg-light-surface text-xs rounded-full border">
                {product.category}
              </span>
            </div>

            <div className="text-light-text-secondary text-sm md:text-base mb-6 leading-relaxed">
              <p>
                {product.description ||
                  "High-quality handmade product, freshly made every day at The Crumb & Bean."}
              </p>
            </div>

            {product.stock && (
              <div className="mb-6 text-xs md:text-sm">
                <span className="font-medium">Availability: </span>
                <span className={`font-semibold ${product.status === 'IN STOCK' ? 'text-green-600' : 'text-red-500'}`}>
                  {product.status === 'IN STOCK' ? 'In Stock' : 'Out of Stock'}
                </span>
                {product.stock.currentstock && (
                  <span className="ml-2 text-light-text-secondary text-xs">
                    ({product.stock.currentstock} / {product.stock.capacity})
                  </span>
                )}
              </div>
            )}

            <div className="mb-6">
              <p className="text-xs font-semibold text-light-text-secondary mb-2 tracking-wider">QUANTITY</p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-9 h-9 flex items-center justify-center border border-gray-300 rounded-xl hover:bg-gray-100 text-lg font-light transition-colors"
                >
                  −
                </button>
                <span className="w-8 text-center text-base font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-9 h-9 flex items-center justify-center border border-gray-300 rounded-xl hover:bg-gray-100 text-lg font-light transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              className={`w-full py-3 text-sm font-semibold text-white rounded-xl transition-all shadow-md mb-8 tracking-wider ${
                addedToCart
                  ? 'bg-green-500 hover:bg-green-600'
                  : 'bg-primary-500 hover:bg-primary-600'
              }`}
            >
              {addedToCart ? '✓ ADDED TO CART!' : 'ADD TO CART'}
            </button>

            <div className="border-t border-gray-100 pt-5 space-y-2 text-xs text-light-text-secondary">
              <p>✓ Freshly made daily</p>
              <p>✓ High-quality ingredients</p>
              <p>✓ Made with love in small batches</p>
            </div>
          </div>
        </div>

        <div className="mt-16">
          <h2 className="text-2xl font-heading font-bold mb-6">You May Also Like</h2>
          {relatedProducts.length === 0 ? (
            <p className="text-center text-sm text-light-text-secondary">No related products found</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProducts.map((item) => (
                <ProductCard
                  key={item.id || item.name}
                  product={item}
                  onAddToCart={addToCart}
                  showLink={true}
                />
              ))}
            </div>
          )}
        </div>

        <div className="mt-16 border-t border-gray-100 pt-12">
          <ProductReviews productId={product?._id || product?.id} />
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;