const BASE_URL = "https://fakestoreapi.com";

export const getProducts = async () => {
  const res = await fetch(`${BASE_URL}/products`);
  return res.json();
};

export const getProduct = async (id) => {
  const res = await fetch(`${BASE_URL}/products/${id}`);
  return res.json();
};

export const loginUser = async (data) => {
  // fake login
  return { token: "fake-token", user: data.email };
};



// Phần này của admin 👨‍💼
const API_URL_PRODUCTS = "https://69cfba0fa4647a9fc675e215.mockapi.io/products";


export const fetchProducts = async () => {
  const res = await fetch(API_URL_PRODUCTS);
  return await res.json(); 
};

// 2. Nhập thêm hàng (PATCH)
export const restockProductApi = async (id, newStockData) => {
  const res = await fetch(`${API_URL_PRODUCTS}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ stock: newStockData }),
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



const API_URL_USERS = "https://69cfba0fa4647a9fc675e215.mockapi.io/users"


export const fetchUsers = async () => {
  const res = await fetch(API_URL_USERS);
  if (!res.ok) {
    throw new Error(`Lỗi server: ${res.status}`);
  }
  return await res.json(); 
};
