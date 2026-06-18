import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
  EyeOutlined, MoreOutlined, EditOutlined, DeleteOutlined, PlusCircleOutlined, AlertOutlined, PlusOutlined, PictureOutlined, ExceptionOutlined, UserOutlined
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

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [editingProduct, setEditingProduct] = useState(null);

  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();

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
              SKU: {`ORD-${record._id.slice(-6).toUpperCase()}`}
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
      dataIndex: 'stockBatches',
      key: 'stockBatches',
      width: 180,
      render: (stockBatches, record) => {
        if (!stockBatches || !Array.isArray(stockBatches) || stockBatches.length === 0) {
          return <span className="text-gray-400 text-sm italic">N/A</span>;
        }

        const totalStock = stockBatches.reduce((sum, batch) => sum + (batch.quantity || 0), 0);

        const maxCapacity = 100;

        const percentage = Math.min(Math.round((totalStock / maxCapacity) * 100), 100);

        let strokeColor = '#52c41a';
        let textColorClass = 'text-green-600';
        let displayStatus = "IN STOCK";

        if (totalStock === 0) {
          strokeColor = '#ff4d4f';
          textColorClass = 'text-red-500 font-bold animate-pulse';
          displayStatus = "OUT OF STOCK";
        } else if (totalStock <= 20) {
          strokeColor = '#faad14';
          textColorClass = 'text-amber-500 font-semibold';
          displayStatus = "LOW STOCK";
        }

        return (
          <div className="w-full max-w-40 bg-gray-50/50 p-2 rounded-lg border border-gray-100/80 shadow-2xs">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs font-bold text-gray-700 tracking-tight">
                {totalStock} <span className="text-gray-400 font-normal text-[11px]">/ {maxCapacity} Pcs</span>
              </span>

              <span className={`text-[10px] font-extrabold ${textColorClass}`}>
                {percentage}%
              </span>
            </div>

            <Progress
              percent={percentage}
              showInfo={false}
              strokeColor={strokeColor}
              size={{ strokeWidth: 6 }}
              strokeLinecap="round"
              className="m-0 w-full drop-shadow-3xs"
            />

            <div className="text-[10px] font-bold mt-1 text-right tracking-tight">
              <span className={textColorClass}>{displayStatus}</span>
            </div>
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
      dataIndex: 'stockBatches',
      key: 'status',
      width: 140,
      render: (stockBatches) => {

        if (!stockBatches || !Array.isArray(stockBatches) || stockBatches.length === 0) {
          return <span className="text-gray-400 text-sm italic">N/A</span>;
        }

        const totalStock = stockBatches.reduce((sum, batch) => sum + (batch.quantity || 0), 0);


        let strokeColor = '#52c41a';
        let tagColor = 'text-green-600';
        let displayStatus = 'IN STOCK';

        if (totalStock === 0) {
          strokeColor = '#ff4d4f'
          tagColor = 'text-red-500 font-bold animate-pulse';
          displayStatus = 'OUT OF STOCK';
        } else if (totalStock <= 20) {
          strokeColor = '#faad14';
          tagColor = 'text-amber-500 font-semibold';
          displayStatus = 'LOW STOCK';
        }
        return (
          <Tag
            color={strokeColor}
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
  if (!Array.isArray(data)) return 0;

  return data.filter(item => {
    if (!item.stockBatches || !Array.isArray(item.stockBatches)) return false;

    const totalQty = item.stockBatches.reduce((sum, batch) => sum + (batch.quantity || 0), 0);

    return totalQty > 0 && totalQty <= 20;
  }).length;
}, [data]);

  const handleActionRequest = () => {
    const lowStockItems = data.filter(item => {
      const totalQty = item.stockBatches?.reduce((sum, batch) => sum + (batch.quantity || 0), 0) || 0;
      return totalQty <= 20;
    });

    if (lowStockItems.length === 0) {
      message.success("All items are in stock, Admin, please rest assured. ✨");
      return;
    }

    let tempAmounts = {};

    const tempExpiryDates = {};

    Modal.confirm({
      title: <span className="text-base sm:text-lg font-bold text-gray-800 tracking-wide">🚨 LIST OF ITEMS NEEDING URGENT SHIPPING</span>,
      width: 700,
      okText: 'Complete',
      cancelText: 'Close',
      className: "max-w-[calc(100vw-32px)] sm:max-w-[700px]",
      content: (
        <div className="max-h-80 sm:max-h-100 overflow-y-auto pr-2 mt-4 space-y-1 scrollbar-thin scrollbar-thumb-gray-200">
          {lowStockItems.map((item) => (
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

                  <span className="text-xs text-gray-400 block mt-1 font-medium">
                    Still available: <b className="text-red-500 font-bold">{item.stockBatches?.reduce((sum, batch) => sum + (batch.quantity || 0), 0) || 0}</b> / 100 Units
                  </span>

                  <div className="mt-1 flex items-center">
                    <Badge status="error" text={<span className="text-[11px] font-bold text-red-400 uppercase tracking-wider">Alert!</span>} />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 pl-1">
                <InputNumber
                  min={0}
                  placeholder="SL"
                  className="w-20 rounded-md font-medium"
                  onChange={(val) => { tempAmounts[item._id] = val; }}
                />
                <DatePicker
                  placeholder="Expiration date"
                  className="w-32 rounded-md"
                  format="YYYY-MM-DD"
                  disabledDate={(current) => current && current.valueOf() < Date.now()}
                  onChange={(date, dateString) => {
                    tempExpiryDates[item._id] = dateString;
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      ),
      onOk: async () => {
        const itemsToUpdate = lowStockItems.filter(item => tempAmounts[item._id] > 0);

        if (itemsToUpdate.length === 0) {
          message.info("No additional quantities have been imported yet");
          return;
        }

        try {
          setLoading(true);

          const updatedItems = await Promise.all(
            itemsToUpdate.map(async (item) => {
              const addedAmount = tempAmounts[item._id];
              const expiryDate = tempExpiryDates[item._id];

              if (Number(addedAmount) > 0 && !expiryDate) {
                throw new Error(`Sản phẩm ${item.name} chưa chọn hạn sử dụng!`);
              }

              const payload = {
                quantity: Number(addedAmount),
                expiredAt: expiryDate
              };

              const response = await axios.put(`${API_BASE_URL}/${item._id}`, payload);

              return response.data.data;
            })
          );

          setData((prev) => 
            prev.map((currentItem) => {
              const matchUpdatedItem = updatedItems.find((u) => u._id === currentItem._id);

              return matchUpdatedItem ? matchUpdatedItem : currentItem;
            })
          );

          message.success(`Successfully restocked ${itemsToUpdate.length} products! 📦`);
        } catch (error) {
          console.error("Batch restock error:", error);
          message.error("Batch restock failed! Please check connection.");
          return Promise.reject();
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

    const validProducts = data.filter(item => Array.isArray(item.stockBatches) && item.stockBatches.length > 0);

    if (validProducts.length === 0) return 100;

    const now = new Date();

    const totalFreshness = validProducts.reduce((sum, item) => {
      let itemFreshnessSum = 0;
      let validBatchesCount = 0;

      item.stockBatches.forEach(batch => {
        if (!batch.expiredAt) return;

        const expiredDate = new Date(batch.expiredAt);

        const startDate = item.createdAt ? new Date(batch.createdAt) : new Date(expiredDate.getTime() - 3 * 24 * 60 * 60 * 1000);
        
        const totalDuration = expiredDate - startDate;
        const timeRemaining = expiredDate - now;
        let batchFreshness = 100;

        if (timeRemaining <= 0) {
          batchFreshness = 0;
        } else if (totalDuration > 0) {
          batchFreshness = Math.round((timeRemaining / totalDuration) * 100);
        }

        itemFreshnessSum += batchFreshness;
        validBatchesCount++;
      });

      const finalItemFreshness = validBatchesCount > 0 ? (itemFreshnessSum / validBatchesCount) : 100;

      return sum + finalItemFreshness;
    }, 0);

    return Math.round(totalFreshness / validProducts.length);
  }, [data]);


  const getFreshnessColor = (percent) => {
    if (percent > 70) return "#52c41a";
    if (percent > 30) return "#faad14";
    return "#ff4d4f";
  };

  const handleRestock = async (record) => {
    const maxCapacity = 100;

    const currentQty = record.stockBatches?.reduce((sum, batch) => sum + (batch.quantity || 0), 0) || 0;

    const batchData = {
      quantity: 0,
      expiredAt: ""
    };

    Modal.confirm({
      title: <span className="font-bold text-gray-800">📦 Import goods for: {record.name}</span>,
      width: 450,
      okText: "Confirm",
      cancelText: "Cancel",
      content: (
        <div className="mt-4 space-y-4 text-sm text-gray-600">
          <p>Current quantity: <span className="font-bold text-gray-800">{currentQty}</span> / {maxCapacity} Units</p>

          <div className="flex flex-col gap-1.5">
            <span className="font-semibold text-gray-700">Enter additional quantity:</span>
            <InputNumber
              min={1}
              max={maxCapacity - currentQty}
              placeholder="e.g., 20"
              className="w-full py-0.5 rounded-md"
              onChange={(val) => {
                batchData.quantity = Number(val || 0);
              }}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="font-semibold text-gray-700">Select expiration date:</span>
            <DatePicker
              placeholder="YYYY-MM-DD"
              className="w-full py-0.5 rounded-md"
              format="YYYY-MM-DD"
              disabledDate={(current) => current && current.valueOf() < Date.now()}
              onChange={(date, dateString) => {
                batchData.expiredAt = dateString;
              }}
            />
          </div>
        </div>
      ),
      onOk: async () => {
        const inputAmount = batchData.quantity;
        const expiredAt = batchData.expiredAt;

        if (!inputAmount || inputAmount <= 0) {
          message.warning("Please enter a valid quantity greater than 0! ⚠️");
          return Promise.reject();
        }

        if (!expiredAt) {
          message.warning("Please select an expiration date for this batch! 📅");
          return Promise.reject();
        }

        if (currentQty + inputAmount > maxCapacity) {
          message.error(`Exceeds capacity! Maximum storage is ${maxCapacity} units.`);
          return Promise.reject();
        }

        try {
          setLoading(true);

          const payload = {
            quantity: Number(inputAmount),
            expiredAt: expiredAt
          };

          const response = await axios.put(`${API_BASE_URL}/${record._id}`, payload);

          if (response.data.success) {
            const updatedProductFromServer = response.data.data;

            setData((prev) =>
              prev.map((item) =>
                item._id === record._id ? updatedProductFromServer : item
              )
            );

            message.success(`Successfully imported ${inputAmount} units for ${record.name}! 🎉`);
          }
        } catch (error) {
          console.error("Single restock error:", error);
          message.error(error.response?.data?.message || "Error during goods receiving!");
          return Promise.reject();
        } finally {
          setLoading(false);
        }
      },
    });
  };


  const handleCheckExpiredItems = () => {
    const today = new Date();
    const expiredBatches = [];

    data.forEach((product) => {
      product.stockBatches?.forEach((batch) => {
        if (batch.expiredAt && new Date(batch.expiredAt) < today) {
          expiredBatches.push({
            productId: product._id,
            productName: product.name,
            category: product.category,
            image: product.image,
            batchId: batch._id,
            quantity: batch.quantity,
            expiredAt: batch.expiredAt,
          });
        }
      });
    });

    if (expiredBatches.length === 0) {
      Modal.success({
        title: "🎉 ALL GOOD!",
        content: "No expired items found in the stock. Everything is fresh!",
      });
      return;
    }

    const modalRef = Modal.confirm({
      title: <span className="text-red-600 font-bold text-lg">⚠️ EXPIRED ITEMS ALERT!</span>,
      width: 650,
      okText: 'Close',
      okButtonProps: { type: 'default' },
      cancelButtonProps: { style: { display: 'none' } },
      content: (
        <div className="max-h-96 overflow-y-auto pr-2 mt-4 space-y-3">
          <p className="text-gray-500 text-sm">The following batches have expired. Please remove them from the stock:</p>

          {expiredBatches.map((batch) => (
            <div key={batch.batchId} className="flex items-center justify-between p-3 bg-red-50/50 border border-red-100 rounded-xl gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar
                  src={`/product/${batch.category.toLowerCase()}/${batch.image}`}
                  shape="square"
                  size={44}
                  className="rounded-md shrink-0 border border-red-200"
                />
                <div className="min-w-0">
                  <b className="text-sm text-gray-800 block truncate">{batch.productName}</b>
                  <span className="text-xs text-gray-500 block mt-0.5">
                    Expired Batch Qty: <b className="text-red-500">{batch.quantity} pcs</b>
                  </span>
                  <span className="text-[11px] bg-red-100 text-red-600 font-semibold px-1.5 py-0.5 rounded mt-1 inline-block">
                    Expired on: {new Date(batch.expiredAt).toLocaleDateString('en-CA')}
                  </span>
                </div>
              </div>

              <Button
                type="primary"
                danger
                shape="circle"
                icon={<DeleteOutlined />}
                onClick={async () => {
                  try {
                    const response = await axios.delete(`${API_BASE_URL}/expired/${batch.productId}/${batch.batchId}`);

                    if (response.data.success) {
                      message.success(`Removed expired batch of ${batch.productName}!`);

                      const updatedProduct = response.data.data;

                      setData((prev) =>
                        prev.map((p) => p._id === batch.productId ? updatedProduct : p)
                      );

                      modalRef.destroy();
                      setTimeout(() => handleCheckExpiredItems(), 300);
                    }
                  } catch (error) {
                    console.error("Delete batch error:", error);
                    message.error("Failed to delete expired batch.");
                  }
                }}
              />
            </div>
          ))}
        </div>
      ),
    });
  };

  const handleAddNew = () => {
    addForm.resetFields();
    setIsAddModalOpen(true);
  };

  const handleEdit = (record) => {
    setEditingProduct(record);
    editForm.setFieldsValue({
      name: record.name,
      price: record.price,
      category: record.category,
      status: record.status,
      image: record.image
    });
    setIsEditModalOpen(true);
  };

  const handleCreateSubmit = async () => {
    try {
      const values = await addForm.validateFields();
      setLoading(true);

      const payload = {
        name: values.name,
        price: Number(values.price),
        category: values.category,
        status: values.status || "IN STOCK",
        image: values.image || "default.jpg",
        quantity: Number(values.quantity),
        expiredAt: values.expiredAt ? values.expiredAt.format('YYYY-MM-DD') : null
      };

      const response = await axios.post(API_BASE_URL, payload);
      const newProd = response.data?.data;

      if (newProd) {
        setData(prev => [newProd, ...prev]);
        message.success("New product added successfully! 🎉");
        setIsAddModalOpen(false);
        addForm.resetFields();
      }
    } catch (error) {
      console.error("Create Product Error:", error);
      message.error(error.response?.data?.message || "Please double-check the inputs!");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSubmit = async () => {
    try {
      const values = await editForm.validateFields();

      setLoading(true);

      const payload = {
        name: values.name,
        price: Number(values.price),
        category: values.category,
        status: values.status,
        image: values.image || editingProduct.image || "default.jpg"
      };

      const response = await axios.put(`${API_BASE_URL}/${editingProduct._id}`, payload);

      if (response.data.success) {
        const updatedProd = response.data.data;
        setData(prev => prev.map(item => item._id === editingProduct._id ? updatedProd : item));

        message.success("Product updated successfully! ❤️");
        setIsEditModalOpen(false);
        editForm.resetFields();
        setEditingProduct(null);
      }
    } catch (error) {
      console.error("Update Product Error:", error);
      if (error.errorFields) {
        message.warning("Please fill in all required fields correctly! ⚠️");
      } else {
        message.error(error.response?.data?.message || "Server error, update failed!");
      }
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

          <div className="flex justify-between items-center">
            <p className="text-xs font-bold tracking-wider text-gray-400 m-0 uppercase">BAKERY FRESHNESS</p>

            <Button
              type="link"
              size="small"
              danger
              icon={<EyeOutlined />}
              className="text-xs font-bold p-0 h-auto flex items-center gap-1 hover:underline"
              onClick={handleCheckExpiredItems}
            >
              Check Expiry
            </Button>
          </div>

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
                size={{ strokeWidth: 6 }}
                strokeLinecap="round"
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
            title={<span className="text-lg font-bold text-gray-800">✨ Add New Product</span>}
            open={isAddModalOpen}
            onCancel={() => { setIsAddModalOpen(false); addForm.resetFields(); }}
            onOk={handleCreateSubmit}
            confirmLoading={loading}
            okText="Add Product"
            cancelText="Cancel"
            width={650}
            className="max-w-[calc(100vw-32px)]"
          >
            <Form form={addForm} layout="vertical" className="mt-4" initialValues={{ status: "IN STOCK" }}>
              <Form.Item name="name" label={<span className="font-semibold text-gray-600">Product Name</span>} rules={[{ required: true }]}>
                <Input placeholder="e.g., Tiramisu" />
              </Form.Item>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 items-start mb-4">
                <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200 gap-2 sm:col-span-1">
                  <Avatar
                    size={90}
                    shape="square"
                    src={`/product/${(addForm.getFieldsValue()?.category || 'DRINK').toLowerCase()}/${addForm.getFieldsValue()?.image || ''}`} icon={<PictureOutlined />}
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

              <div className="grid grid-cols-2 gap-4">
                <Form.Item name="price" label={<span className="font-semibold text-gray-600">Price</span>} rules={[{ required: true }]}>
                  <InputNumber className="w-full" min={0} />
                </Form.Item>
                <Form.Item name="category" label={<span className="font-semibold text-gray-600">Category</span>} rules={[{ required: true }]}>
                  <Select options={[{ value: 'CAKE', label: 'CAKE' }, { value: 'DRINK', label: 'DRINK' }]} />
                </Form.Item>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Form.Item name="quantity" label={<span className="font-semibold text-gray-600">Initial Quantity</span>} rules={[{ required: true }]}>
                  <InputNumber min={1} max={100} className="w-full" />
                </Form.Item>
                <Form.Item name="expiredAt" label={<span className="font-semibold text-gray-600">Expiration Date</span>} rules={[{ required: true }]}>
                  <DatePicker format="YYYY-MM-DD" className="w-full" disabledDate={(curr) => curr && curr.valueOf() < Date.now()} />
                </Form.Item>
              </div>

              <Form.Item name="status" label={<span className="font-semibold text-gray-600">Status</span>}>
                <Select defaultValue="IN STOCK" options={[{ value: 'IN STOCK', label: 'IN STOCK' }, { value: 'LOW STOCK', label: 'LOW STOCK' }]} />
              </Form.Item>
            </Form>
          </Modal>

          <Modal
            title={<span className="text-lg font-bold text-gray-800">📝 Edit Product: {editingProduct?.name}</span>}
            open={isEditModalOpen}
            onCancel={() => { setIsEditModalOpen(false); editForm.resetFields(); setEditingProduct(null); }}
            onOk={handleUpdateSubmit}
            confirmLoading={loading}
            okText="Save Changes"
            cancelText="Cancel"
            width={650}
            className="max-w-[calc(100vw-32px)]"
          >
            <Form form={editForm} layout="vertical" className="mt-4">
              <Form.Item name="name" label={<span className="font-semibold text-gray-600">Product Name</span>} rules={[{ required: true }]}>
                <Input />
              </Form.Item>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 items-start mb-4">
                <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200 gap-2 sm:col-span-1">
                  <Avatar
                    size={90}
                    shape="square"
                    src={`/product/${(editForm.getFieldsValue()?.category || 'DRINK').toLowerCase()}/${editForm.getFieldsValue()?.image || ''}`} icon={<PictureOutlined />}
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

              <div className="grid grid-cols-2 gap-4">
                <Form.Item name="price" label={<span className="font-semibold text-gray-600">Price</span>} rules={[{ required: true }]}>
                  <InputNumber className="w-full" min={0} />
                </Form.Item>
                <Form.Item name="category" label={<span className="font-semibold text-gray-600">Category</span>} rules={[{ required: true }]}>
                  <Select options={[{ value: 'CAKE', label: 'CAKE' }, { value: 'DRINK', label: 'DRINK' }]} />
                </Form.Item>
              </div>


              <Form.Item name="status" label={<span className="font-semibold text-gray-600">Status</span>}>
                <Select options={[{ value: 'IN STOCK', label: 'IN STOCK' }, { value: 'LOW STOCK', label: 'LOW STOCK' }, { value: 'OUT OF STOCK', label: 'OUT OF STOCK' }]} />
              </Form.Item>
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