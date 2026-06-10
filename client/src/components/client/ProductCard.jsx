// Reusable product card component
import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';

const ProductCard = ({ product, onAddToCart, showLink = true }) => {
  const [isAdded, setIsAdded] = useState(false);
  const timeoutRef = useRef(null);

  const imageFolder = product.category?.toLowerCase() === 'cake' ? 'cake' : 'drink';
  const imagePath = product.image
    ? `/product/${imageFolder}/${product.image}`
    : 'https://picsum.photos/id/1015/400/400';

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!onAddToCart) return;

    onAddToCart(product);
    setIsAdded(true);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setIsAdded(false);
      timeoutRef.current = null;
    }, 2000);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const productKey = product.id || product._id;

  const card = (
    <div className="product-card bg-light-card border border-gray-100 rounded-3xl overflow-hidden hover:shadow-xl transition-all group">
      <div className="relative h-64 overflow-hidden bg-gray-100">
        <img
          src={imagePath}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            e.target.src = 'https://picsum.photos/id/1015/400/400';
          }}
        />
      </div>

      <div className="p-6">
        <h3 className="font-medium text-xl mb-2 line-clamp-2 group-hover:text-primary-500 transition-colors">
          {product.name}
        </h3>
        <p className="text-light-text-secondary text-sm">{product.category}</p>
      </div>

      <div className="px-6 pb-6 flex items-center justify-between">
        <span className="text-2xl font-semibold text-warm-400">${product.price}</span>

        {onAddToCart && (
          <button
            type="button"
            onClick={handleAddToCart}
            className={`text-white px-6 py-3 rounded-2xl text-sm font-semibold transition-all ${
              isAdded
                ? 'bg-green-500 hover:bg-green-600'
                : 'bg-primary-500 hover:bg-primary-600'
            }`}
          >
            {isAdded ? '✓ Added!' : 'ADD TO CART'}
          </button>
        )}
      </div>
    </div>
  );

  return showLink ? <Link to={`/product/${productKey}`}>{card}</Link> : card;
};

export default ProductCard;
