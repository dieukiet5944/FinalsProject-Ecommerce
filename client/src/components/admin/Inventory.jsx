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
              SKU: {record.id}
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
      dataIndex: 'stock',
      key: 'stock',
      width: 180,
      render: (stock) => {
        if (!stock) return <span className="text-gray-400 text-sm italic">N/A</span>;

        const percentage = Math.round((stock.currentstock / stock.capacity) * 100);

        let strokeColor = '#52c41a';
        let textColorClass = 'text-green-600';

        if (percentage <= 20) {
          strokeColor = '#ff4d4f';
          textColorClass = 'text-red-500 font-bold animate-pulse';
        } else if (percentage <= 60) {
          strokeColor = '#faad14';
          textColorClass = 'text-amber-500';
        }

        return (
          <div className="w-full max-w-35">
            <div className="flex justify-between items-end mb-1">
              <span className="text-xs font-medium text-gray-600">
                {stock.currentstock}/{stock.capacity} <span className="text-gray-400 font-normal">Units</span>
              </span>
              <span className={`text-xs font-bold ${percentage <= 60 ? textColorClass : 'text-[#6F4E37]'}`}>
                {percentage}%
              </span>
            </div>
            <Progress
              percent={percentage}
              size="small"
              showInfo={false}
              strokeColor={strokeColor}
              strokeWidth={6}
              className="m-0"
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
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (_, record) => {
        const currentStatus = calculateStatus(record.stock?.currentstock, record.stock?.capacity);

        let color = 'success';
        if (currentStatus === 'OUT OF STOCK') color = 'default';
        if (currentStatus === 'LOW STOCK') color = 'error';

        return (
          <Tag
            color={color}
            className="rounded-full font-bold px-3 py-0.5 text-[11px] tracking-wider uppercase"
          >
            {currentStatus}
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
            onClick: () => handleDelete(record.id)
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
      const current = item.stock?.currentstock || 0;
      const capacity = item.stock?.capacity || 1;
      return (current / capacity) * 100 <= 20;
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
      const current = item.stock?.currentstock ?? 0;
      const capacity = item.stock?.capacity || 100;
      return (current / capacity) * 100 <= 20;
    });

    if (lowStockItems.length === 0) {
      message.success("All items are in stock, Admin, please rest assured.");
      return;
    }

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
            <div key={item.id} className="flex items-center justify-between py-3.5 border-b border-gray-100 last:border-0 gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Avatar
                  src={`/product/${item.category.toLowerCase()}/${item.image}`}
                  shape="square"
                  size={48}
                  className="rounded-lg border border-gray-100 shrink-0 object-cover"
                />
                <div className="min-w-0">
                  <b className="text-sm sm:text-base text-gray-800 block truncate leading-tight">{item.name}</b>
                  <span className="text-xs text-gray-400 block mt-1 font-medium">
                    Still available: <b className="text-red-500 font-bold">{item.stock?.currentstock ?? 0}</b> / {item.stock?.capacity || 100} Units
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
                  onChange={(val) => { tempAmounts[item.id] = val; }}
                />
              </div>
            </div>
          ))}
        </div>
      ),
      onOk: async () => {
        const itemsToUpdate = lowStockItems.filter(item => tempAmounts[item.id] > 0);
        if (itemsToUpdate.length === 0) {
          message.info("No additional quantities have been imported yet");
          return;
        }

        try {
          setLoading(true);
          await Promise.all(itemsToUpdate.map(async (item) => {
            const addedAmount = tempAmounts[item.id];
            const current = item.stock?.currentstock || 0;
            const capacity = item.stock?.capacity || 100;
            const newCurrentStock = current + addedAmount;
            const newStatus = getStatusByStock(newCurrentStock, capacity);

            const payload = {
              stock: { capacity, currentstock: newCurrentStock },
              status: newStatus
            };
            await axios.put(`${API_BASE_URL}/${item.id}`, payload);
          }));

          setData((prev) =>
            prev.map((item) => {
              const addedAmount = tempAmounts[item.id];
              if (addedAmount > 0) {
                const current = item.stock?.currentstock || 0;
                const capacity = item.stock?.capacity || 100;
                const newCurrentStock = current + addedAmount;
                return {
                  ...item,
                  stock: { ...item.stock, currentstock: newCurrentStock },
                  status: getStatusByStock(newCurrentStock, capacity)
                };
              }
              return item;
            })
          );
          message.success(`Successfully restocked ${itemsToUpdate.length} products!`);
        } catch (error) {
          console.error(error);
          message.error("Batch restock failed!");
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
    const cakes = data.filter(item => item.category === 'CAKE' && item.createdAt && item.expiryDate);
    if (cakes.length === 0) return 100;

    const now = new Date();
    const totalFreshness = cakes.reduce((sum, item) => {
      const start = new Date(item.createdAt);
      const end = new Date(item.expiryDate);
      const totalLifeSpan = end - start;
      const timePassed = now - start;
      let itemFreshness = ((totalLifeSpan - timePassed) / totalLifeSpan) * 100;

      return sum + Math.max(0, Math.min(100, itemFreshness));
    }, 0);

    return Math.round(totalFreshness / cakes.length);
  }, [data]);

  const getFreshnessColor = (percent) => {
    if (percent > 70) return "#6dee89";
    if (percent > 30) return "#faad14";
    return "#ff4d4f";
  };

  const handleRestock = async (record) => {
    let inputAmount = 0;
    const maxCapacity = record.stock?.capacity || 100;
    const current = record.stock?.currentstock || 0;

    Modal.confirm({
      title: <span className="font-bold text-gray-800">Import goods for: {record.name}</span>,
      content: (
        <div className="mt-2 space-y-2 text-sm text-gray-600">
          <p>Current quantity: <span className="font-bold text-gray-800">{current}</span></p>
          <div className="flex flex-col gap-1">
            <span>Enter additional quantity:</span>
            <InputNumber
              min={1}
              max={maxCapacity - current}
              defaultValue={0}
              onChange={(val) => { inputAmount = val; }}
              className="w-full"
            />
          </div>
        </div>
      ),
      onOk: async () => {
        if (inputAmount <= 0) {
          message.warning("Please enter a quantity greater than 0.");
          return Promise.reject();
        }
        if (current + inputAmount > maxCapacity) {
          message.error(`Exceeds capacity!`);
          return Promise.reject();
        }

        try {
          setLoading(true);
          const newCurrentStock = current + inputAmount;
          const newStatus = calculateStatus(newCurrentStock, maxCapacity);
          const cleanStock = { capacity: maxCapacity, currentstock: newCurrentStock };

          const payload = { stock: cleanStock, status: newStatus };
          await axios.put(`${API_BASE_URL}/${record.id}`, payload);

          setData((prev) =>
            prev.map((item) =>
              item.id === record.id ? { ...item, stock: cleanStock, status: newStatus } : item
            )
          );
          message.success(`Goods received successfully! Main warehouse: ${newCurrentStock}`);
        } catch (error) {
          console.error(error);
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
      ...record,
      stock: {
        capacity: record.stock?.capacity,
        currentstock: record.stock?.currentstock
      }
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const { stock: formStock, image, ...otherValues } = values;
      const initialStatus = !editingProduct
        ? getStatusByStock(formStock.currentstock || 0, formStock.capacity || 100)
        : editingProduct.status;

      const payload = {
        ...otherValues,
        image: image || (editingProduct?.image || "default.jpg"),
        stock: {
          capacity: formStock.capacity,
          currentstock: editingProduct ? editingProduct.stock.currentstock : (formFormStock.currentstock || 0)
        },
        status: editingProduct ? editingProduct.status : initialStatus,
      };

      if (payload.category === "CAKE" && !editingProduct) {
        payload.createdAt = new Date().toISOString().split('T')[0];
      }

      if (editingProduct) {
        await axios.put(`${API_BASE_URL}/${editingProduct.id}`, payload);
        setData(prev => prev.map(item =>
          item.id === editingProduct.id ? { ...item, ...payload, id: item.id } : item
        ));
        message.success("Product updated successfully!");
      } else {
        const response = await axios.post(API_BASE_URL, payload);
        const newProd = response.data;
        setData(prev => [newProd, ...prev]);
        message.success("New product added successfully!");
      }
      setIsEditModalOpen(false);
      form.resetFields();
      setEditingProduct(null);
    } catch (error) {
      console.error("Error", error);
      message.error("Please double-check the input fields!");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this product?',
      content: 'This action cannot be undone.',
      okText: 'Disable',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await axios.delete(`${API_BASE_URL}/${id}`);
          setData(prev => prev.filter(item => item.id !== id));
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">

        <div className="p-5 flex flex-col gap-2 bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.04)] border border-gray-100">
          <p className="text-xs font-bold tracking-wider text-gray-400 m-0">TOTAL SKU</p>
          <div className="flex justify-between items-center mt-1">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 m-0">{data.length}</h2>
          </div>
        </div>

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

        <div className="p-5 flex flex-col gap-2 bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.04)] border border-gray-100">
          <p className="text-xs font-bold tracking-wider text-gray-400 m-0">BAKERY FRESHNESS</p>
          <div className="flex justify-between items-center gap-3 mt-1 min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold m-0 shrink-0" style={{ color: getFreshnessColor(avgFreshness) }}>
              {avgFreshness}%
            </h2>
            <div className="w-full max-w-35 sm:max-w-45">
              <Progress
                percent={avgFreshness}
                strokeColor={getFreshnessColor(avgFreshness)}
                showInfo={false}
                className="m-0"
                size={{ strokeWidth: 6 }}
              />
            </div>
            <span className="text-base sm:text-lg font-bold shrink-0" style={{ color: getFreshnessColor(avgFreshness) }}>
              {avgFreshness > 30 ? "✔" : "⚠"}
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
            rowKey="id"
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
            title={<span className="text-base sm:text-lg font-bold text-gray-800">{editingProduct ? `Edit Product: ${editingProduct.name}` : "Add New Product"}</span>}
            open={isEditModalOpen}
            onCancel={() => setIsEditModalOpen(false)}
            onOk={handleSaveEdit}
            confirmLoading={loading}
            okText="Save Changes"
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
                    src={`/product/${(category || 'drink').toLowerCase()}/${form.getFieldValue('image')}`}
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
                <Form.Item
                  name="id"
                  label={<span className="font-semibold text-gray-600 text-sm">Stock Keeping Unit (SKU)</span>}
                  rules={[{ required: !editingProduct, message: 'Please enter the code!' }]}
                >
                  <Input placeholder="e.g. BC-011" disabled={!!editingProduct} className="py-2" />
                </Form.Item>

                <Form.Item
                  name="name"
                  label={<span className="font-semibold text-gray-600 text-sm">Product Name</span>}
                  rules={[{ required: true, message: 'Product name is required!' }]}
                >
                  <Input className="py-2" />
                </Form.Item>

                <Form.Item
                  name="price"
                  label={<span className="font-semibold text-gray-600 text-sm">Price ($)</span>}
                  rules={[{ required: true, message: 'Price is required!' }]}
                >
                  <InputNumber min={0} className="w-full py-0.5 rounded-md" />
                </Form.Item>

                <Form.Item name="category" label={<span className="font-semibold text-gray-600 text-sm">Category</span>}>
                  <Select className="h-10 rounded-md">
                    <Select.Option value="DRINK">DRINK</Select.Option>
                    <Select.Option value="CAKE">CAKE</Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item name={['stock', 'capacity']} label={<span className="font-semibold text-gray-600 text-sm">Max Capacity</span>}>
                  <InputNumber min={1} className="w-full py-0.5 rounded-md" />
                </Form.Item>

                <Form.Item name={['stock', 'currentstock']} label={<span className="font-semibold text-gray-600 text-sm">Initial Stock</span>}>
                  <InputNumber min={0} disabled={!!editingProduct} className="w-full py-0.5 rounded-md" />
                </Form.Item>
              </div>

              {category === 'CAKE' && (
                <Form.Item
                  name="expiryDate"
                  label={<span className="font-semibold text-gray-600 text-sm">Expiry Date</span>}
                  rules={[{ required: true, message: 'Expiry date is required for cakes!' }]}
                  className="mt-2"
                >
                  <DatePicker className="w-full py-2 rounded-md" placeholder="Select expiry date" />
                </Form.Item>
              )}
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