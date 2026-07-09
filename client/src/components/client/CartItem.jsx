const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
    const product = item.productId;

    const itemTotal = (Number(product?.price || 0) * (item.quantity || 1)).toFixed(2);

    return (
        <div className="flex gap-6 bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-sm transition-all">
            <div className="w-28 h-28 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                <img
                    src={
                        product?.image?.startsWith('http') 
                            ? product.image 
                            : `/product/${product?.category?.toLowerCase()}/${product?.image}`
                    }
                    alt={product?.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        e.target.src = 'https://picsum.photos/id/1015/300/300';
                    }}
                />
            </div>

            <div className="flex-1 min-w-0">
                <h3 className="font-medium text-lg leading-tight mb-1 line-clamp-2">
                    {product?.name}
                </h3>
                <p className="text-light-text-secondary text-sm mb-3">
                    {product?.category}
                </p>

                <p className="text-xl font-semibold text-warm-400 mb-4">
                    ${Number(product?.price || 0).toFixed(2)}
                </p>

                <div className="flex items-center gap-4">
                    <div className="flex items-center border border-gray-200 rounded-2xl overflow-hidden">
                        <button
                            onClick={() => onUpdateQuantity((item.quantity || 1) - 1)}
                            className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 transition"
                            disabled={item.quantity <= 1} 
                        >
                            −
                        </button>
                        <span className="px-4 font-medium">{item.quantity || 1}</span>
                        <button
                            onClick={() => onUpdateQuantity((item.quantity || 1) + 1)}
                            className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 transition"
                        >
                            +
                        </button>
                    </div>

                    <button
                        onClick={onRemove} 
                        className="text-red-500 hover:text-red-600 text-sm font-medium ml-4 transition"
                    >
                        Remove
                    </button>
                </div>
            </div>

            <div className="text-right shrink-0">
                <p className="font-semibold text-lg text-warm-400">
                    ${itemTotal}
                </p>
            </div>
        </div>
    );
};

export default CartItem;