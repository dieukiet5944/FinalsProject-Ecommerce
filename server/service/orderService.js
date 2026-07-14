import { orderRepository } from "../repositories/orderRepository.js";

export const orderService = {
    getOrdersByCustomer: async (customerId, pageNumber = 1, pageSize = 3) => {
        const skip = (pageNumber - 1) * pageSize;
        const filter = { customerId };

        const [orders, totalItems] = await Promise.all([
            orderRepository.findCustomerOrders(customerId, skip, pageSize),
            orderRepository.countCustomerOrders(customerId)
        ]);

        return {
            orders,
            totalItems,
            totalPages: Math.ceil(totalItems / pageSize)
        };
    },

    getAllOrdersForAdmin: async () => {
        return await orderRepository.findAllOrders();
    },

    createOrder: async ({ customerId, items, promotion }) => {
        let subTotalPrice = 0;
        const confirmedItems = [];
        const productsToSave = [];

        for (const item of items) {
            const product = await orderRepository.findProductById(item.productId);
            if (!product) {
                throw new Error(`The product with ID ${item.productId} does not exist in the system.`);
            }

            const currentTotalQuantity = product.stockBatches.reduce((sum, batch) => sum + (batch.quantity || 0), 0);

            if (product.status === "OUT OF STOCK" || currentTotalQuantity < item.qty) {
                throw new Error(`The product "${product.name}" is out of stock or there is insufficient stock available. (Current total quantity: ${currentTotalQuantity})`);
            }

            const currentPrice = Number(product.price) || 0;
            subTotalPrice += currentPrice * item.qty;

            confirmedItems.push({
                productId: product._id,
                name: product.name,
                qty: item.qty,
                price: currentPrice
            });

            product.stockBatches.sort((a, b) => new Date(a.expiredAt) - new Date(b.expiredAt));

            let quantityToDecrease = item.qty;

            for (let i = 0; i < product.stockBatches.length; i++) {
                if (quantityToDecrease <= 0) break;

                let batch = product.stockBatches[i];
                if (batch.quantity <= 0) continue;

                if (batch.quantity >= quantityToDecrease) {
                    batch.quantity -= quantityToDecrease;
                    quantityToDecrease = 0;
                } else {
                    quantityToDecrease -= batch.quantity;
                    batch.quantity = 0;
                }
            }

            product.stockBatches = product.stockBatches.filter(batch => batch.quantity > 0);

            const newTotalQuantity = product.stockBatches.reduce((sum, batch) => sum + (batch.quantity || 0), 0);
            if (newTotalQuantity === 0) {
                product.status = "OUT OF STOCK";
            } else if (newTotalQuantity <= 20) {
                product.status = "LOW STOCK";
            } else {
                product.status = "IN STOCK";
            }

            productsToSave.push(product);
        }

        let discountAmount = 0;
        let appliedCode = null;

        if (promotion && promotion.code) {
            const promoData = await orderRepository.findActivePromoByCode(promotion.code);

            if (promoData && !promoData.usersUsed.includes(customerId) && subTotalPrice >= promoData.minOrderValue) {
                appliedCode = promoData.code;

                if (promoData.type === "percentage") {
                    discountAmount = subTotalPrice * (promoData.value / 100);
                    if (promoData.maxDiscount && discountAmount > promoData.maxDiscount) {
                        discountAmount = promoData.maxDiscount;
                    }
                } else if (promoData.type === "fixed") {
                    discountAmount = promoData.value;
                }

                if (discountAmount > subTotalPrice) discountAmount = subTotalPrice;

                promoData.usedCount += 1;
                promoData.usersUsed.push(customerId);
                await promoData.save();
            }
        }

        const finalTotalPrice = subTotalPrice - discountAmount;

        await Promise.all(productsToSave.map(p => p.save({ runValidators: false })));

        const newOrder = new orderRepository.createOrder({
            customerId,
            items: confirmedItems,
            subTotalPrice,
            totalPrice: finalTotalPrice,
            promotion: {
                code: appliedCode,
                discountAmount
            }
        });

        await orderRepository.clearCartByCustomerId(customerId);

        return newOrder;
    },

    updateOrderDetails: async (id, { status, items }) => {
        const order = await orderRepository.findOrderById(id);
        if (!order) {
            throw new Error("No orders with this ID were found in the system.");
        }

        if (status) {
            if (!["Pending", "Completed", "Canceled"].includes(status)) {
                throw new Error("Invalid order status! Only Pending, Completed, or Canceled will be accepted.");
            }
            order.status = status;
        }

        if (items && Array.isArray(items)) {
            order.items = items;
            let newTotal = 0;
            for (const item of items) {
                newTotal += (item.qty || 0) * (item.price || 0);
            }
            order.totalPrice = newTotal;
        }

        await order.save({ runValidators: true });
        return order;
    },

    completeOrder: async (id) => {
        const order = await orderRepository.findOrderById(id);
        if (!order) {
            throw new Error("No orders with this ID were found in the system.");
        }

        order.status = "Completed";
        await order.save({ runValidators: true });
        return order;
    },

    deleteOrder: async (id) => {
        const order = await orderRepository.deleteOrderById(id);
        if (!order) {
            throw new Error("No orders with this ID were found in the system.");
        }
        return order;
    }
};