import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';

const ProductCard = ({ product, onAddToCart, showLink = true }) => {
  const [isAdded, setIsAdded] = useState(false);
  const timeoutRef = useRef(null);

  const imagePath = product.image?.startsWith('http') 
    ? product.image 
    : `/product/${product.category?.toLowerCase()}/${product.image}`;

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

  const productKey = product.slug || product.id || product._id;

  const card = (
    <div className="product-card bg-light-card border border-gray-100 rounded-2xl ease-out overflow-hidden hover:-translate-y-1.5 hover:shadow-lg hover:border-primary-100/50 transition-all group">
      <div className="relative h-48 overflow-hidden bg-gray-100">
        <img
          src={imagePath}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            e.target.src = 'https://picsum.photos/id/1015/400/400';
          }}
        />
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-lg mb-1 line-clamp-1 group-hover:text-primary-500 transition-colors">
          {product.name}
        </h3>
        <p className="text-light-text-secondary text-xs">{product.category}</p>
      </div>

      <div className="px-4 pb-4 flex items-center justify-between">
        <span className="text-xl font-bold text-warm-400">${product.price}</span>

        {onAddToCart && (
          <button
            type="button"
            onClick={handleAddToCart}
            className={`text-white px-4 py-2 rounded-xl text-xs font-semibold tracking-wider transition-all ${
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

  return showLink ? <Link to={`/products/${productKey}`}>{card}</Link> : card;
};

export default ProductCard;
