import { useEffect, useState } from 'react';
import { useCart } from '../../context/CartContext';
import ProductCard from '../../components/client/ProductCard';
import LoadingSpinner from '../../components/client/LoadingSpinner';
import SuccessToast from '../../components/client/SuccessToast';
import { getProductsApi } from '../../services/productService.js';
import { SearchOutlined, FilterOutlined, DownOutlined } from '@ant-design/icons'
import { Dropdown, Button, Space } from 'antd';

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

  const handleAddToCart = (product) => {
    addToCart(product);
    setToastMessage(`Added ${product.name} to cart!`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await getProductsApi();

        const result = response?.data;

        setProducts(result);
        setFilteredProducts(result);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const allCategories = ['All Items', ...new Set(products.map(p => p.category))];

  useEffect(() => {
    let result = [...products];

    if (selectedCategory !== 'All Items') {
      result = result.filter(p => p.category === selectedCategory);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(term));
    }

    if (sortOption === 'price-low') result.sort((a, b) => a.price - b.price);
    if (sortOption === 'price-high') result.sort((a, b) => b.price - a.price);
    if (sortOption === 'name') result.sort((a, b) => a.name.localeCompare(b.name));

    setFilteredProducts(result);
  }, [selectedCategory, searchTerm, sortOption, products]);

  const sortItems = [
    { key: 'default', label: 'Sort By' },
    { key: 'price-low', label: 'Price: Low to High' },
    { key: 'price-high', label: 'Price: High to Low' },
    { key: 'name', label: 'Name A-Z' },
  ];

  const currentSortLabel = sortItems.find(item => item.key === sortOption)?.label || 'Sort By';

  if (loading) {
    return (
      <div className="min-h-screen bg-light-bg">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-bg text-light-text pt-6 pb-16">
      <SuccessToast isVisible={showToast} message={toastMessage} />
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-4xl font-heading font-bold tracking-tight mb-1">
          Our Daily Menu
        </h1>
        <p className="text-light-text-secondary text-base mb-8">
          Freshly baked every morning with love
        </p>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-56 shrink-0">
            <div className="sticky top-20">
              <h3 className="font-semibold text-sm mb-4 tracking-wider text-gray-400">CATEGORIES</h3>

              <div className="space-y-1 mb-8">
                {allCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-full text-left px-4 py-2.5 text-sm rounded-xl transition-all ${selectedCategory === cat
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

          <div className="flex-1">
            <div className="flex flex-col md:flex-row gap-3 mb-8 items-center justify-between">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search for your favorites..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-primary-500"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base text-gray-400">
                  <SearchOutlined />
                </span>
              </div>

              <Dropdown
                menu={{
                  items: sortItems,
                  selectable: true,
                  selectedKeys: [sortOption],
                  onClick: ({ key }) => setSortOption(key), 
                }}
                trigger={['click']}
                placement="bottomRight"
              >
                <Button
                  className="bg-white border border-gray-200 rounded-xl px-4 py-5 text-sm h-auto flex items-center justify-between hover:border-primary-500! hover:text-primary-500! group transition-all"
                >
                  <Space className="gap-2">
                    <FilterOutlined className="text-gray-400 group-hover:text-primary-500 transition-colors" />
                    <span>{currentSortLabel}</span>
                    <DownOutlined className="text-xs text-gray-400 group-hover:text-primary-500 transition-colors" />
                  </Space>
                </Button>
              </Dropdown>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-xl text-light-text-secondary mb-2">
                  No products found
                </p>
                <p className="text-sm text-light-text-secondary">
                  Try adjusting your filters or search term
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id || product._id}
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