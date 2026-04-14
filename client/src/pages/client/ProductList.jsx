// src/pages/client/ProductList.jsx
import { useEffect, useState } from 'react';
import { getProducts } from '../../services/api';
import { useCart } from '../../context/CartContext';
import ProductCard from '../../components/client/ProductCard';
import LoadingSpinner from '../../components/client/LoadingSpinner';
import SuccessToast from '../../components/client/SuccessToast';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Items');
  const [sortOption, setSortOption] = useState('default');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const { addToCart } = useCart();

  // Handle add to cart with toast notification
  const handleAddToCart = (product) => {
    addToCart(product);
    setToastMessage(`Added ${product.name} to cart!`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
        setFilteredProducts(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Get dynamic categories from actual data
  const allCategories = ['All Items', ...new Set(products.map(p => p.category))];

  useEffect(() => {
    let result = [...products];

    // Filter by category
    if (selectedCategory !== 'All Items') {
      result = result.filter(p => p.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(term));
    }

    // Sort
    if (sortOption === 'price-low') result.sort((a, b) => a.price - b.price);
    if (sortOption === 'price-high') result.sort((a, b) => b.price - a.price);
    if (sortOption === 'name') result.sort((a, b) => a.name.localeCompare(b.name));

    setFilteredProducts(result);
  }, [selectedCategory, searchTerm, sortOption, products]);

  if (loading) {
    return (
      <div className="min-h-screen bg-light-bg">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-bg text-light-text pt-8 pb-20">
      <SuccessToast isVisible={showToast} message={toastMessage} />
      <div className="max-w-7xl mx-auto px-6">
        <h1 className="text-5xl font-heading font-bold tracking-tight mb-2">
          Our Daily Menu
        </h1>
        <p className="text-light-text-secondary text-lg mb-10">
          Freshly baked every morning with love
        </p>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Sidebar - Categories */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="sticky top-24">
              <h3 className="font-medium text-lg mb-5 tracking-wider">CATEGORIES</h3>

              <div className="space-y-1 mb-10">
                {allCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-full text-left px-5 py-3.5 rounded-2xl transition-all ${selectedCategory === cat
                        ? 'bg-primary-500 text-white font-medium'
                        : 'hover:bg-light-surface text-light-text-secondary hover:text-light-text'
                      }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="flex flex-col md:flex-row gap-4 mb-10">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search for your favorites..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-2xl py-4 pl-12 pr-6 focus:outline-none focus:border-primary-500"
                />
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-xl text-gray-400">🔍</span>
              </div>

              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="bg-white border border-gray-200 rounded-2xl px-6 py-4 focus:outline-none focus:border-primary-500"
              >
                <option value="default">Sort By</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name A-Z</option>
              </select>
            </div>

            {/* Product Grid */}
            {filteredProducts.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-2xl text-light-text-secondary mb-4">
                  No products found
                </p>
                <p className="text-light-text-secondary">
                  Try adjusting your filters or search term
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductList;