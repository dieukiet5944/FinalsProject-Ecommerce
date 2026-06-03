import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
  MoreOutlined, EditOutlined, DeleteOutlined, PlusCircleOutlined, AlertOutlined, PlusOutlined, PictureOutlined, ExceptionOutlined, UserOutlined
} from "@ant-design/icons";
import {
  Table,
  Tag,
  Avatar,
  Button,
  Progress,
  Spin,
  Modal,
  Badge,
  message,
  InputNumber,
  Dropdown,
  Form,
  Input,
  Select,
  DatePicker
} from 'antd';

const Inventory = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [form] = Form.useForm();
  const category = Form.useWatch('category', form);
  const [update, setUpdate] = useState(false);

  const API_BASE_URL = 'http://localhost:8080/products';

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_BASE_URL);
      const result = response.data?.data;

      if (result && Array.isArray(result) && result.length > 0) {
        setData(result);
      } else {
        message.warning("Currently, there is no product data available.");
        setData([]);
      }
    } catch (error) {
      console.error(error);
      message.error("Server connection failed!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const calculateStatus = (current, total) => {
    const percentage = (current / total) * 100;
    if (current <= 0) return "OUT OF STOCK";
    if (percentage <= 20) return "LOW STOCK";
    return "IN STOCK";
  };

  const columns = [
    {
      title: 'PRODUCT NAME',
      key: 'product',
      width: 220,
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Avatar
            src={`/product/${record.category?.toLowerCase()}/${record.image}`}
            size={44}
            shape="square"
            className="rounded-lg border border-gray-100 shrink-0 object-cover"
          />
          <div className="min-w-0">
            <p className="font-bold text-gray-800 m-0 truncate text-sm sm:text-base leading-snug">
              {record.name}
            </p>
            <p className="text-xs text-gray-400 m-0 mt-0.5 font-medium">
              SKU: {record._id}
            </p>
          </div>
        </div>
      ),
    },
    {
      title: 'CATEGORY',
      dataIndex: 'category',
      key: 'category',
      width: 130,
      render: (cat) => (
        <Tag
          color={cat === 'DRINK' ? 'blue' : 'orange'}
          className="rounded-md px-2.5 py-0.5 font-medium tracking-wide uppercase text-[11px]"
        >
          {cat}
        </Tag>
      )
    },
    {
      title: 'STOCK LEVEL',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 180,
      render: (quantity, record) => {

        if (quantity === undefined || quantity === null) {
          return <span className="text-gray-400 text-sm italic">N/A</span>;
        }

        const maxCapacity = 100;
        const percentage = Math.min(Math.round((quantity / maxCapacity) * 100), 100);

        let strokeColor = '#52c41a'; // Xanh lá mặc định
        let textColorClass = 'text-green-600';
        let displayStatus = "IN STOCK";

        if (quantity === 0) {
          strokeColor = '#ff4d4f'; // Màu Đỏ
          textColorClass = 'text-red-500 font-bold animate-pulse';
          displayStatus = "OUT OF STOCK";
        } else if (quantity <= 20) {
          strokeColor = '#faad14'; // Màu Cam/Vàng
          textColorClass = 'text-amber-500 font-semibold';
          displayStatus = "LOW STOCK";
        }

        return (
          <div className="w-full max-w-40 bg-gray-50/50 p-2 rounded-lg border border-gray-100/80 shadow-2xs">

            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs font-bold text-gray-700 tracking-tight">
                {quantity} <span className="text-gray-400 font-normal text-[11px]">/ {maxCapacity} Pcs</span>
              </span>

              <span className="text-[10px] font-extrabold text-gray-400">
                {percentage}%
              </span>
            </div>

            <Progress
              percent={percentage === 0 && quantity > 0 ? 8 : percentage}
              showInfo={false}
              strokeColor={strokeColor}
              strokeWidth={6}
              strokeLinecap="round"
              className="m-0 w-full drop-shadow-3xs"
            />
          </div>
        );
      }
    },
    {
      title: 'PRICE',
      dataIndex: 'price',
      key: 'price',
      width: 110,
      render: (price) => (
        <span className="font-bold text-gray-800 text-sm sm:text-base">
          ${Number(price).toFixed(2)}
        </span>
      ),
    },
    {
      title: 'STATUS',
      dataIndex: 'quantity',
      key: 'status',
      width: 140,
      render: (quantity) => {

        const qty = quantity !== undefined && quantity !== null ? Number(quantity) : 0;

        let tagColor = 'green';
        let displayStatus = 'IN STOCK';

        if (qty === 0) {
          tagColor = 'red';
          displayStatus = 'OUT OF STOCK';
        } else if (qty <= 20) {
          tagColor = 'warning';
          displayStatus = 'LOW STOCK';
        }

        return (
          <Tag
            color={tagColor}
            className="rounded-full font-bold px-3 py-0.5 text-[11px] tracking-wider uppercase border-none shadow-sm"
          >
            {displayStatus}
          </Tag>
        );
      },
    },
    {
      title: 'ACTIONS',
      key: 'action',
      width: 80,
      align: 'center',
      render: (_, record) => {
        const actionItems = [
          {
            key: 'restock',
            label: <span className="font-medium text-gray-700">Restock</span>,
            icon: <PlusCircleOutlined className="text-green-500" />,
            onClick: () => handleRestock(record)
          },
          {
            key: 'edit',
            label: <span className="font-medium text-gray-700">Edit Product</span>,
            icon: <EditOutlined className="text-blue-500" />,
            onClick: () => handleEdit(record)
          },
          { type: 'divider' },
          {
            key: 'delete',
            label: <span className="font-medium">Disable</span>,
            icon: <DeleteOutlined />,
            danger: true,
            onClick: () => handleDelete(record)
          },
        ];

        return (
          <Dropdown
            menu={{ items: actionItems }}
            trigger={['click']}
            placement="bottomRight"
            classNames={{ root: "shadow-md rounded-lg" }}
          >
            <Button
              type="text"
              shape="circle"
              className="hover:bg-gray-100! flex items-center justify-center m-auto"
              icon={<MoreOutlined className="text-gray-500 text-xl!" />}
            />
          </Dropdown>
        );
      },
    },
  ];

  const lowStockCount = useMemo(() => {
    return (data || []).filter(item => {
      const qty = item.quantity !== undefined && item.quantity !== null ? Number(item.quantity) : 0;
      return qty <= 20;
    }).length;
  }, [data]);

  const getStatusByStock = (current, all) => {
    const curr = Number(current) || 0;
    const total = Number(all) || 1;
    const percent = (curr / total) * 100;

    if (curr <= 0) return "OUT OF STOCK";
    if (percent <= 20) return "LOW STOCK";
    return "IN STOCK";
  };

  const handleActionRequest = () => {
    const lowStockItems = data.filter(item => {
      const qty = item.quantity !== undefined && item.quantity !== null ? Number(item.quantity) : 0;
      return qty <= 20; // Giữ nguyên luật gom hàng <= 20 cái
    });

    if (lowStockItems.length === 0) {
      message.success("All items are in stock, Admin, please rest assured. ✨");
      return;
    }

    // Khởi tạo object lưu số lượng tạm thời
    let tempAmounts = {};

    Modal.confirm({
      title: <span className="text-base sm:text-lg font-bold text-gray-800 tracking-wide">🚨 LIST OF ITEMS NEEDING URGENT SHIPPING</span>,
      width: 700,
      okText: 'Complete',
      cancelText: 'Close',
      className: "max-w-[calc(100vw-32px)] sm:max-w-[700px]",
      content: (
        <div className="max-h-80 sm:max-h-100 overflow-y-auto pr-2 mt-4 space-y-1 scrollbar-thin scrollbar-thumb-gray-200">
          {lowStockItems.map((item) => (
            /* 1. ĐỒNG BỘ SỬ DỤNG _ID LÀM KEY */
            <div key={item._id} className="flex items-center justify-between py-3.5 border-b border-gray-100 last:border-0 gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Avatar
                  src={`/product/${item.category.toLowerCase()}/${item.image}`}
                  shape="square"
                  size={48}
                  className="rounded-lg border border-gray-100 shrink-0 object-cover"
                />
                <div className="min-w-0">
                  <b className="text-sm sm:text-base text-gray-800 block truncate leading-tight">{item.name}</b>

                  {/* 2. ĐÃ PHẲNG HÓA GIAO DIỆN: Hiển thị trực tiếp quantity dựa trên mốc trần 100 */}
                  <span className="text-xs text-gray-400 block mt-1 font-medium">
                    Still available: <b className="text-red-500 font-bold">{item.quantity ?? 0}</b> / 100 Units
                  </span>

                  <div className="mt-1 flex items-center">
                    <Badge status="error" text={<span className="text-[11px] font-bold text-red-400 uppercase tracking-wider">Alert!</span>} />
                  </div>
                </div>
              </div>
              <div className="shrink-0 pl-1">
                <InputNumber
                  min={0}
                  placeholder="SL"
                  className="w-20 rounded-md font-medium"
                  /* 3. ĐỒNG BỘ: Lưu số lượng nhập vào key _id */
                  onChange={(val) => { tempAmounts[item._id] = val; }}
                />
              </div>
            </div>
          ))}
        </div>
      ),
      onOk: async () => {
        // Lọc chuẩn xác theo key _id
        const itemsToUpdate = lowStockItems.filter(item => tempAmounts[item._id] > 0);

        if (itemsToUpdate.length === 0) {
          message.info("No additional quantities have been imported yet");
          return;
        }

        try {
          setLoading(true);

          // Gửi API restock đồng loạt theo _id
          await Promise.all(itemsToUpdate.map(async (item) => {
            const addedAmount = tempAmounts[item._id];
            const payload = {
              quantityToAdd: Number(addedAmount)
            };
            await axios.put(`${API_BASE_URL}/${item._id}`, payload);
          }));

          // Cập nhật State giao diện thời gian thực
          setData((prev) =>
            prev.map((item) => {
              const addedAmount = tempAmounts[item._id];

              if (addedAmount > 0) {
                const currentQty = item.quantity || 0;
                const newQuantity = currentQty + Number(addedAmount);

                // 4. ĐỒNG BỘ LUẬT 3 MỨC MỚI (>20 In Stock, <=20 Low Stock, 0 Out of Stock)
                let newStatus = "IN STOCK";
                if (newQuantity === 0) {
                  newStatus = "OUT OF STOCK";
                } else if (newQuantity <= 20) {
                  newStatus = "LOW STOCK";
                }

                return {
                  ...item,
                  quantity: newQuantity,
                  status: newStatus
                };
              }
              return item;
            })
          );

          message.success(`Successfully restocked ${itemsToUpdate.length} products! 📦`);
        } catch (error) {
          console.error("Batch restock error:", error);
          message.error("Batch restock failed! Please check connection.");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const countCake = () => data.filter(item => item.category === "CAKE").length;

  const countDrink = () => data.filter(item => item.category === "DRINK").length;

  const avgFreshness = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return 100;

    const cakes = data.filter(item => item.category === 'CAKE' && item.createdAt);
    if (cakes.length === 0) return 100;

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const totalFreshness = cakes.reduce((sum, item) => {

      const createdDate = new Date(item.createdAt);
      const createdStart = new Date(createdDate.getFullYear(), createdDate.getMonth(), createdDate.getDate());

      const timeDiff = todayStart - createdStart;

      const daysOld = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

      let itemFreshness = 100;
      if (daysOld === 1) {
        itemFreshness = 70;
      } else if (daysOld === 2) {
        itemFreshness = 40;  // 
      } else if (daysOld >= 3) {
        itemFreshness = 0;
      }

      return sum + itemFreshness;
    }, 0);

    return Math.round(totalFreshness / cakes.length);
  }, [data]);

  const getFreshnessColor = (percent) => {
    if (percent > 70) return "#52c41a";
    if (percent > 30) return "#faad14";
    return "#ff4d4f";
  };

  const handleRestock = async (record) => {
    let inputAmount = 0;

    // 1. Phẳng hóa dữ liệu lấy từ dòng (record) được click
    const maxCapacity = 100; // Đặt mốc trần cố định là 100 cái theo luật mới
    const currentQty = record.quantity !== undefined && record.quantity !== null ? Number(record.quantity) : 0;

    Modal.confirm({
      title: <span className="font-bold text-gray-800">📦 Import goods for: {record.name}</span>,
      content: (
        <div className="mt-2 space-y-2 text-sm text-gray-600">
          <p>Current quantity: <span className="font-bold text-gray-800">{currentQty}</span> / {maxCapacity} Units</p>
          <div className="flex flex-col gap-1">
            <span>Enter additional quantity:</span>
            <InputNumber
              min={1}
              max={maxCapacity - currentQty} // Giới hạn tối đa chỉ được nhập thêm để đầy mốc 100 cái
              placeholder="e.g., 20"
              onChange={(val) => { inputAmount = Number(val || 0); }}
              className="w-full"
            />
          </div>
        </div>
      ),
      onOk: async () => {
        // Kiểm tra tính hợp lệ của số lượng nhập vào
        if (inputAmount <= 0) {
          message.warning("Please enter a quantity greater than 0.");
          return Promise.reject();
        }
        if (currentQty + inputAmount > maxCapacity) {
          message.error(`Exceeds capacity! Maximum storage is ${maxCapacity} units.`);
          return Promise.reject();
        }

        try {
          setLoading(true);
          const newQuantity = currentQty + inputAmount;

          // 2. Tự động tính toán lại 3 mức Status mới dựa trên quantity mới
          let newStatus = "IN STOCK";
          if (newQuantity === 0) {
            newStatus = "OUT OF STOCK";
          } else if (newQuantity <= 20) {
            newStatus = "LOW STOCK";
          }

          // Tạo payload phẳng gửi lên Backend
          const payload = { quantityToAdd: inputAmount };

          // Gọi API cập nhật restock theo trường _id của MongoDB
          await axios.put(`${API_BASE_URL}/${record._id}`, payload);

          // 3. Cập nhật Real-time lại State hiển thị trên Table giao diện (Cấu trúc phẳng)
          setData((prev) =>
            prev.map((item) =>
              item._id === record._id
                ? { ...item, quantity: newQuantity, status: newStatus }
                : item
            )
          );

          message.success(`Goods received successfully! Total stock: ${newQuantity} 🎉`);
        } catch (error) {
          console.error("Single restock error:", error);
          message.error("Error during goods receiving!");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleAddNew = () => {
    setEditingProduct(null);
    form.resetFields();
    setIsEditModalOpen(true);
  };

  const handleEdit = (record) => {
    setEditingProduct(record);
    form.setFieldsValue({
      _id: record._id,
      name: record.name,
      price: record.price,
      category: record.category,
      quantity: record.quantity,
      status: record.status,
      image: record.image
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      console.log("Sản phẩm đang chuẩn bị sửa:", editingProduct);

      if (editingProduct) {
        const payload = {
          name: values.name,
          price: Number(values.price),
          category: values.category,
          quantity: Number(values.quantity),
          status: values.status,
          image: values.image || editingProduct.image || "default.jpg"
        };

        await axios.put(`${API_BASE_URL}/${editingProduct._id}`, payload);


        setData(prev => prev.map(item =>
          item._id === editingProduct._id ? { ...item, ...payload } : item
        ));

        message.success("Product updated successfully! ❤️");
      } else {
        const payload = {
          name: values.name,
          price: Number(values.price),
          category: values.category,
          quantity: Number(values.quantity),
          status: values.status || "IN STOCK",
          image: values.image || "default.jpg"
        };

        const response = await axios.post(API_BASE_URL, payload);
        const newProd = response.data?.data;

        if (newProd) {
          setData(prev => [newProd, ...prev]);
          message.success("New product added successfully! 🎉");
        } else {
          message.error("Failed to create product");
        }
      }

      setIsEditModalOpen(false);
      form.resetFields();
      setEditingProduct(null);

    } catch (error) {
      console.error("Error Detail:", error);

      const errorMsg = error.response?.data?.message || "Please double-check the input fields!";
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (record) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this product?',
      content: 'This action cannot be undone.',
      okText: 'Disable',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await axios.delete(`${API_BASE_URL}/${record._id}`);
          setData(prev => prev.filter(item => item._id !== record._id));
          message.success("Product disabled successfully!");
        } catch (error) {
          console.error(error);
          message.error("Cannot disable product!");
        }
      },
    });
  };

  return (
    <div className="p-4 sm:p-6 md:p-9 flex flex-col gap-6 min-h-screen bg-gray-50/50">

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#EE2B6C] m-0">Inventory Management</h1>
          <p className="text-xs sm:text-sm text-gray-400 m-0 mt-1 font-medium">Real-time stock tracking for Drink & Cake</p>
        </div>
        <div className="w-full sm:w-auto">
          <Button
            color="pink"
            variant="solid"
            onClick={handleAddNew}
            icon={<PlusOutlined />}
            className="w-full sm:w-auto h-10 font-semibold shadow-sm flex items-center justify-center gap-1.5"
          >
            New product
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">

        <div className="p-5 flex flex-col gap-2 bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.04)] border border-gray-100">
          <p className="text-xs font-bold tracking-wider text-gray-400 m-0">LOW STOCK ALERTS</p>
          <div className="flex justify-between items-center gap-2 mt-1">
            <h2 className="text-xl sm:text-2xl font-bold text-orange-500 m-0">{lowStockCount}</h2>
            <Button
              onClick={handleActionRequest}
              type="text"
              icon={<AlertOutlined className="text-orange-500!" />}
              className="flex! items-center gap-1.5 text-xs font-bold text-orange-600 bg-orange-50 hover:bg-orange-100! border border-orange-200/60 rounded-md px-3 py-1.5 h-auto"
            >
              Action Request
            </Button>
          </div>
        </div>

        <div className="p-5 flex flex-col gap-2 bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.04)] border border-gray-100 transition-all duration-300 hover:shadow-md">

          <p className="text-xs font-bold tracking-wider text-gray-400 m-0 uppercase">BAKERY FRESHNESS</p>

          <div className="flex justify-between items-center gap-3 mt-1 min-w-0">

            <h2 className="text-xl sm:text-2xl font-black m-0 shrink-0 transition-colors duration-300" style={{ color: getFreshnessColor(avgFreshness) }}>
              {avgFreshness}%
            </h2>


            <div className="w-full max-w-35 sm:max-w-45">
              <Progress
                percent={avgFreshness}
                strokeColor={getFreshnessColor(avgFreshness)}
                showInfo={false}
                className="m-0 w-full"
                strokeWidth={6}
                strokeLinecap="round "
              />
            </div>


            <span className="text-xs font-extrabold shrink-0 px-2 py-0.5 rounded-md uppercase tracking-wider transition-colors duration-300"
              style={{
                color: getFreshnessColor(avgFreshness),
                backgroundColor: `${getFreshnessColor(avgFreshness)}15`
              }}>
              {avgFreshness > 70 ? "Fresh" : avgFreshness > 30 ? "Good" : "Stale"}
            </span>
          </div>
        </div>

        <div className="p-4 flex flex-col justify-center gap-2 bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.04)] border border-gray-100">
          <div className="flex justify-between items-center bg-amber-50/70 border border-amber-100/60 rounded-lg px-3 py-1.5">
            <h2 className="text-xs font-bold text-amber-600 m-0 tracking-wider">CAKE</h2>
            <div className="text-sm font-bold text-amber-700">{countCake()}</div>
          </div>
          <div className="flex justify-between items-center bg-blue-50/70 border border-blue-100/60 rounded-lg px-3 py-1.5">
            <h2 className="text-xs font-bold text-blue-600 m-0 tracking-wider">DRINK</h2>
            <div className="text-sm font-bold text-blue-700">{countDrink()}</div>
          </div>
        </div>

      </div>

      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-[0_4px_12px_rgba(0,0,0,0.02)] border border-gray-100 relative flex flex-col gap-5">
        <Spin spinning={loading}>
          <Table
            rowKey="_id"
            rowClassName={(record) => record.disabled ? 'row-disabled' : ''}
            columns={columns}
            dataSource={data}
            scroll={{ x: 800 }}
            pagination={{
              total: data.length,
              pageSize: 5,
              showSizeChanger: false,
              placement: 'bottomRight',
            }}
            className="w-full"
          />

          <Modal
            title={
              <span className="text-base sm:text-lg font-bold text-gray-800">
                {editingProduct ? `Edit Product: ${editingProduct.name}` : "Add New Product"}
              </span>
            }
            open={isEditModalOpen}
            onCancel={() => setIsEditModalOpen(false)}
            onOk={handleSaveEdit}
            confirmLoading={loading}
            okText={editingProduct ? "Save Changes" : "Add Product"}
            cancelText="Cancel"
            width={650}
            className="max-w-[calc(100vw-32px)] sm:max-w-162.5"
          >
            <Form form={form} layout="vertical" className="mt-5">

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 items-start mb-4">
                <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200 gap-2 sm:col-span-1">
                  <Avatar
                    size={90}
                    shape="square"
                    src={`/product/${(form.getFieldValue('category') || 'DRINK').toLowerCase()}/${form.getFieldValue('image') || ''}`}
                    icon={<PictureOutlined />}
                    className="rounded-lg! border border-gray-100 bg-white shadow-sm object-cover"
                  />
                  <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mt-1">Image Preview</span>
                </div>

                <div className="sm:col-span-2 w-full">
                  <Form.Item
                    name="image"
                    label={<span className="font-semibold text-gray-600 text-sm">Image Filename</span>}
                    tooltip="Enter the filename in public/product folder (e.g., cake_1.png)"
                    rules={[{ required: true, message: 'Please enter the image filename!' }]}
                    className="mb-0"
                  >
                    <Input
                      placeholder="e.g., drink_5.png"
                      onChange={() => setUpdate(!update)}
                      className="py-2"
                    />
                  </Form.Item>
                </div>
              </div>


              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">

                {editingProduct && (
                  <Form.Item
                    name="_id"
                    label={<span className="font-semibold text-gray-600 text-sm">Product ID</span>}
                  >
                    <Input disabled className="py-2 bg-gray-100" />
                  </Form.Item>
                )}

                <Form.Item
                  name="name"
                  label={<span className="font-semibold text-gray-600 text-sm">Product Name</span>}
                  rules={[{ required: true, message: 'Product name is required!' }]}
                >
                  <Input placeholder="e.g., Matcha Latte" className="py-2" />
                </Form.Item>


                <Form.Item
                  name="price"
                  label={<span className="font-semibold text-gray-600 text-sm">Price (VND)</span>}
                  rules={[{ required: true, message: 'Price is required!' }]}
                >
                  <InputNumber
                    min={0}
                    className="w-full py-0.5 rounded-md"
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value.replace(/\$\s?|(,*)/g, '')}
                    placeholder="e.g., 45,000"
                  />
                </Form.Item>

                <Form.Item
                  name="category"
                  label={<span className="font-semibold text-gray-600 text-sm">Category</span>}
                  rules={[{ required: true, message: 'Category is required!' }]}
                >
                  <Select className="h-10 rounded-md" placeholder="Select category">
                    <Select.Option value="DRINK">DRINK</Select.Option>
                    <Select.Option value="CAKE">CAKE</Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="quantity"
                  label={<span className="font-semibold text-gray-600 text-sm">Stock Quantity</span>}
                  rules={[{ required: true, message: 'Quantity is required!' }]}
                >
                  <InputNumber min={0} max={editingProduct ? undefined : 100} placeholder="e.g., 50 (Max 100 for new product)" className="w-full py-0.5 rounded-md" />
                </Form.Item>

                <Form.Item
                  name="status"
                  label={<span className="font-semibold text-gray-600 text-sm">Inventory Status</span>}
                  initialValue="IN STOCK"
                >
                  <Select className="h-10 rounded-md">
                    <Select.Option value="IN STOCK">IN STOCK</Select.Option>
                    <Select.Option value="LOW STOCK">LOW STOCK</Select.Option>
                    <Select.Option value="OUT OF STOCK">OUT OF STOCK</Select.Option>
                  </Select>
                </Form.Item>

              </div>
            </Form>
          </Modal>
        </Spin>

        <div className="sm:absolute bottom-7 left-6 text-xs sm:text-sm text-gray-400 font-medium mt-2 sm:mt-0 text-center sm:text-left">
          Showing 1 to 5 of {data.length} records
        </div>
      </div>

    </div>
  );
};

export default Inventory;