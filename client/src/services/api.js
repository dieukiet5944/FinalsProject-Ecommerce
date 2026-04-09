// src/services/api.js
const MOCKAPI_BASE = "https://69cfba0fa4647a9fc675e215.mockapi.io";

// ==================== PRODUCTS ====================
export const getProducts = async () => {
    const res = await fetch(`${MOCKAPI_BASE}/products`);
    if (!res.ok) throw new Error("Không thể lấy danh sách sản phẩm");
    return res.json();
};

export const getProduct = async (id) => {
    const res = await fetch(`${MOCKAPI_BASE}/products/${id}`);
    if (!res.ok) throw new Error("Không tìm thấy sản phẩm");
    return res.json();
};

// ==================== USERS & ORDERS ====================
export const getUserById = async (userId) => {
    const res = await fetch(`${MOCKAPI_BASE}/users/${userId}`);
    if (!res.ok) throw new Error("Không tìm thấy người dùng");
    return res.json();
};

export const updateUser = async (userId, updatedData) => {
    const res = await fetch(`${MOCKAPI_BASE}/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
    });
    if (!res.ok) throw new Error("Cập nhật user thất bại");
    return res.json();
};

// Hàm đặt hàng chính - lưu vào history_orders
export const placeOrder = async (userId, cartItems) => {
    // Lấy thông tin user hiện tại
    const user = await getUserById(userId);

    // Tạo đơn hàng mới theo đúng cấu trúc
    const newOrder = {
        orderId: `ORD-${Date.now().toString().slice(-6)}`,
        date: new Date().toISOString().split("T")[0], // YYYY-MM-DD
        items: cartItems.map((item) => ({
            name: item.name || item.title || "Sản phẩm không tên",
            qty: item.quantity || 1,
            price: Number(item.price) || 0,
        })),
    };

    // Thêm đơn hàng mới vào mảng history_orders
    const updatedHistory = [...(user.history_orders || []), newOrder];

    // Cập nhật user
    const updatedUser = {
        ...user,
        history_orders: updatedHistory,
    };

    // Gửi lên MockAPI
    const result = await updateUser(userId, updatedUser);

    return {
        success: true,
        order: newOrder,
        user: result,
    };
};
// Phần này của admin 👨‍💼
const API_URL_PRODUCTS = "https://69cfba0fa4647a9fc675e215.mockapi.io/products";

export const fetchProducts = async () => {
    const res = await fetch(API_URL_PRODUCTS);
    return await res.json();
};

// 2. Nhập thêm hàng (PATCH)
export const restockProductApi = async (id, payload) => {
    const res = await fetch(`${API_URL_PRODUCTS}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Không thể nhập hàng");
    return await res.json();
};

// 3. Chỉnh sửa thông tin (PATCH)
export const updateProductApi = async (id, values) => {
    const res = await fetch(`${API_URL_PRODUCTS}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
    });
    if (!res.ok) throw new Error("Lỗi khi cập nhật sản phẩm");
    return await res.json();
};

// 4. Vô hiệu hóa (PATCH)
export const deleteProductApi = async (id) => {
    const res = await fetch(`${API_URL_PRODUCTS}/${id}`, {
        method: "DELETE",
    });
    if (!res.ok) throw new Error("Lỗi khi xóa sản phẩm");
    return await res.json();
};

export const createProductApi = async (values) => {
    const res = await fetch(API_URL_PRODUCTS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
    });
    if (!res.ok) throw new Error("Lỗi khi thêm sản phẩm");
    return await res.json();
};

const API_URL_USERS = "https://69cfba0fa4647a9fc675e215.mockapi.io/users";

export const fetchUsers = async () => {
    const res = await fetch(API_URL_USERS);
    if (!res.ok) {
        throw new Error(`Lỗi server: ${res.status}`);
    }
    return await res.json();
};
