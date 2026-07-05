import React, { useState, useEffect, useMemo } from 'react';
import { getProductsApi, putProductsApi, deleteProductsApi, createProductApi, deleteBatchsApi } from '../../services/productService.js';
import {
  WarningFilled, EyeOutlined, MoreOutlined, EditOutlined, DeleteOutlined, PlusCircleOutlined, AlertOutlined, PlusOutlined, PictureOutlined, ExceptionOutlined, UserOutlined
} from "@ant-design/icons";
import { Table, Tag, Avatar, Button, Progress, Spin, Modal, Badge, message, InputNumber, Dropdown, Form, Input, Select, DatePicker } from 'antd';

const Inventory = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [editingProduct, setEditingProduct] = useState(null);

  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();

  const [update, setUpdate] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await getProductsApi();
      const result = response?.data;

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
      width: 240,
      render: (_, record) => (
        <div className="flex items-center gap-3 py-0.5">
          <Avatar
            src={`/product/${record.category?.toLowerCase()}/${record.image}`}
            size={42}
            shape="square"
            className="rounded-xl border border-gray-100 shadow-3xs shrink-0 object-cover bg-gray-50"
          />
          <div className="min-w-0">
            <p className="font-bold text-gray-800 m-0 truncate text-sm leading-tight">
              {record.name}
            </p>
            <p className="text-[11px] font-mono text-gray-400 m-0 mt-1 uppercase tracking-wider">
              SKU: {String(record._id).slice(-6).toUpperCase()}
            </p>
          </div>
        </div>
      ),
    },
    {
      title: 'CATEGORY',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (cat) => {
        const isDrink = cat === 'DRINK';
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-bold tracking-wider border ${isDrink
            ? 'bg-blue-50 text-blue-600 border-blue-100'
            : 'bg-amber-50 text-amber-600 border-amber-100'
            }`}>
            {cat}
          </span>
        );
      }
    },
    {
      title: 'STOCK LEVEL',
      dataIndex: 'stockBatches',
      key: 'stockBatches',
      width: 190,
      render: (stockBatches) => {
        if (!stockBatches || !Array.isArray(stockBatches) || stockBatches.length === 0) {
          return <span className="text-gray-400 text-xs italic font-medium">N/A</span>;
        }

        const totalStock = stockBatches.reduce((sum, batch) => sum + (batch.quantity || 0), 0);
        const maxCapacity = 100;
        const percentage = Math.min(Math.round((totalStock / maxCapacity) * 100), 100);

        let strokeColor = '#10b981';
        let textColorClass = 'text-green-600';

        if (totalStock === 0) {
          strokeColor = '#ef4444';
          textColorClass = 'text-red-500 font-bold';
        } else if (totalStock <= 20) {
          strokeColor = '#f59e0b';
          textColorClass = 'text-amber-500 font-semibold';
        }

        return (
          <div className="w-full max-w-37.5 flex flex-col gap-1.5 py-1">
            <div className="flex justify-between items-baseline text-xs">
              <span className="font-bold text-gray-700 font-mono">
                {totalStock} <span className="text-gray-400 font-normal text-[10px]">/ {maxCapacity}</span>
              </span>
              <span className={`text-[10px] font-mono font-bold ${textColorClass}`}>
                {percentage}%
              </span>
            </div>
            <Progress
              percent={percentage}
              showInfo={false}
              strokeColor={strokeColor}
              strokeWidth={5}
              strokeLinecap="round"
              className="m-0 w-full"
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
        <span className="font-bold text-gray-800 text-sm font-mono">
          ${Number(price).toFixed(2)}
        </span>
      ),
    },
    {
      title: 'STATUS',
      dataIndex: 'stockBatches',
      key: 'status',
      width: 130,
      render: (stockBatches) => {
        if (!stockBatches || !Array.isArray(stockBatches) || stockBatches.length === 0) {
          return <span className="text-gray-400 text-xs italic">N/A</span>;
        }

        const totalStock = stockBatches.reduce((sum, batch) => sum + (batch.quantity || 0), 0);
        let badgeStyle = 'bg-green-50 text-green-600 border-green-100';
        let displayStatus = 'IN STOCK';

        if (totalStock === 0) {
          badgeStyle = 'bg-red-50 text-red-600 border-red-100 font-bold';
          displayStatus = 'OUT OF STOCK';
        } else if (totalStock <= 20) {
          badgeStyle = 'bg-amber-50 text-amber-600 border-amber-100 font-semibold';
          displayStatus = 'LOW STOCK';
        }

        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border ${badgeStyle}`}>
            {displayStatus}
          </span>
        );
      },
    },
    {
      title: '',
      key: 'action',
      width: 60,
      align: 'center',
      render: (_, record) => {
        const actionItems = [
          {
            key: 'restock',
            label: <span className="text-sm text-gray-700 font-medium">Restock</span>,
            icon: <PlusCircleOutlined className="text-green-500 text-sm" />,
            onClick: () => handleRestock(record)
          },
          {
            key: 'edit',
            label: <span className="text-sm text-gray-700 font-medium">Edit Product</span>,
            icon: <EditOutlined className="text-primary-500 text-sm" />,
            onClick: () => handleEdit(record)
          },
          { type: 'divider' },
          {
            key: 'delete',
            label: <span className="text-sm text-red-600 font-medium">{record.disabled ? 'Enable' : 'Disable'}</span>,
            icon: <DeleteOutlined className="text-red-400 text-sm" />,
            danger: true,
            onClick: () => handleDelete(record)
          },
        ];

        return (
          <Dropdown menu={{ items: actionItems }} trigger={['click']} placement="bottomRight">
            <Button
              type="text"
              shape="circle"
              className="flex items-center justify-center hover:bg-gray-100! text-gray-400 hover:text-gray-600 transition-colors"
              icon={<MoreOutlined className="text-lg" />}
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
      title: (
        <div className="flex flex-col gap-0.5">
          <span className="text-[11px] font-bold text-amber-500 uppercase tracking-wider">Inventory Alert</span>
          <span className="text-base font-bold text-gray-800 flex items-center gap-1.5">
            🚨 Restock Required Immediately
          </span>
        </div>
      ),
      width: 540, 
      okText: 'Complete Restock',
      cancelText: 'Close',
      centered: true,
      okButtonProps: {
        className: "bg-primary-500 hover:bg-primary-600! font-semibold px-4 rounded-xl shadow-sm cursor-pointer"
      },
      cancelButtonProps: {
        className: "rounded-xl font-medium"
      },
      content: (
        <div className="max-h-80 sm:max-h-96 overflow-y-auto pr-1 mt-4 space-y-3 scrollbar-none">
          <p className="text-gray-400 text-xs leading-relaxed">
            The following items have dropped below safety thresholds. Please input the shipping quantity and expiration date to update inventory:
          </p>

          {lowStockItems.map((item) => {
            const currentQty = item.stockBatches?.reduce((sum, batch) => sum + (batch.quantity || 0), 0) || 0;

            return (
              <div
                key={item._id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-gray-50/50 border border-gray-100 rounded-2xl gap-3 transition-colors hover:bg-gray-50"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar
                    src={`/product/${item.category.toLowerCase()}/${item.image}`}
                    shape="square"
                    size={42}
                    className="rounded-xl border border-gray-100 shrink-0 object-cover bg-white shadow-3xs"
                  />
                  <div className="min-w-0">
                    <b className="text-sm text-gray-800 block truncate leading-tight">
                      {item.name}
                    </b>
                    <span className="text-xs text-gray-400 block mt-1 font-medium">
                      Available: <b className="text-red-500 font-semibold font-mono">{currentQty}</b> / 100 U
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-500 bg-red-50 border border-red-100 px-1.5 py-0.2 mt-1 rounded uppercase tracking-wider animate-pulse">
                      Critical
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto [&_.ant-input-number]:rounded-xl [&_.ant-picker]:rounded-xl">
                  <InputNumber
                    min={0}
                    placeholder="Qty"
                    className="w-20 font-semibold text-center font-mono py-0.5"
                    onChange={(val) => { tempAmounts[item._id] = val; }}
                  />
                  <DatePicker
                    placeholder="Expiry Date"
                    className="flex-1 sm:w-32 py-2 text-xs"
                    format="YYYY-MM-DD"
                    disabledDate={(current) => current && current.valueOf() < Date.now()}
                    onChange={(date, dateString) => {
                      tempExpiryDates[item._id] = dateString;
                    }}
                  />
                </div>
              </div>
            );
          })}
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
                throw new Error(`Product ${item.name} has not had an expiration date selected!`);
              }

              const payload = {
                quantity: Number(addedAmount),
                expiredAt: expiryDate
              };

              const result = await putProductsApi(payload, item._id);

              console.log("Updated items after restock:", result);

              return result;
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
    let totalAllBatchesFreshness = 0;
    let totalActiveBatchesCount = 0;

    data.forEach(item => {
      if (!Array.isArray(item.stockBatches)) return;

      item.stockBatches.forEach(batch => {
        if (!batch.expiredAt || batch.stock === 0) return;

        const expiredDate = new Date(batch.expiredAt);

        const batchCreateTime = batch.createdAt || item.createdAt;
        const startDate = batchCreateTime
          ? new Date(batchCreateTime)
          : new Date(expiredDate.getTime() - 7 * 24 * 60 * 60 * 1000);

        const totalDuration = expiredDate.getTime() - startDate.getTime();
        const timeRemaining = expiredDate.getTime() - now.getTime();
        let batchFreshness = 100;

        if (timeRemaining <= 0) {
          batchFreshness = 0;
        } else if (totalDuration > 0) {
          batchFreshness = Math.round((timeRemaining / totalDuration) * 100);

          batchFreshness = Math.max(0, Math.min(100, batchFreshness));
        }

        totalAllBatchesFreshness += batchFreshness;
        totalActiveBatchesCount++;
      });
    });

    if (totalActiveBatchesCount === 0) {
      return 100;
    }

    const finalResult = Math.round(totalAllBatchesFreshness / totalActiveBatchesCount);
    return finalResult;
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
      title: <span className="font-bold text-gray-800"> Import goods for: {record.name}</span>,
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

          const result = await putProductsApi(payload, record._id);

          if (result?.success) {
            const updatedProductFromServer = result?.data;

            setData((prev) =>
              prev.map((item) =>
                item._id === record._id ? updatedProductFromServer : item
              )
            );

            message.success(`Successfully imported ${inputAmount} units for ${record.name}! 🎉`);
          }
        } catch (error) {
          console.error("Single restock error:", error);
          message.error(error.result?.message || "Error during goods receiving!");
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
      title: (
        <div className="flex flex-col gap-0.5">
          <span className="text-[11px] font-bold text-red-500 uppercase tracking-wider">System Alert</span>
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-red-500 flex items-center gap-1.5"> <WarningFilled /> </span>
            <span className="text-base font-bold text-gray-800 flex items-center gap-1.5">
              Expired Batches Detected
            </span>
          </div>
        </div>
      ),
      width: 460,
      okText: 'Close Alert',
      okButtonProps: {
        type: 'default',
        className: "rounded-xl font-semibold border-gray-200 hover:bg-gray-50 transition-colors"
      },
      cancelButtonProps: { style: { display: 'none' } },
      centered: true,
      content: (
        <div className="max-h-80 overflow-y-auto pr-1 mt-3 space-y-2.5 text-sm scrollbar-none">
          <p className="text-gray-400 text-xs leading-relaxed">
            The following batches have reached their expiration dates. Please remove them from active stock immediately:
          </p>

          {expiredBatches.map((batch) => (
            <div
              key={batch.batchId}
              className="flex items-center justify-between p-3 bg-red-50/40 border border-red-100 rounded-xl gap-4 hover:bg-red-50/70 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Avatar
                  src={`/product/${batch.category.toLowerCase()}/${batch.image}`}
                  shape="square"
                  size={40}
                  className="rounded-xl shrink-0 border border-red-200/60 object-cover bg-white"
                />
                <div className="min-w-0 flex flex-col">
                  <b className="text-xs sm:text-sm text-gray-800 truncate">
                    {batch.productName}
                  </b>
                  <span className="text-[11px] text-gray-400 font-medium mt-0.5">
                    Qty: <b className="text-red-500 font-bold">{batch.quantity} pcs</b>
                  </span>
                  <span className="text-[10px] font-bold text-red-600 bg-red-100/60 px-2 py-0.5 rounded-md mt-1 w-fit tracking-wide uppercase">
                    EXP: {new Date(batch.expiredAt).toLocaleDateString('en-CA')}
                  </span>
                </div>
              </div>

              <Button
                type="primary"
                danger
                shape="circle"
                size="middle"
                className="flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-transform shadow-2xs shrink-0"
                icon={<DeleteOutlined className="text-sm" />}
                onClick={async () => {
                  try {
                    console.log(`Attempting to delete expired batch: Product ID ${batch.productId}, Batch ID ${batch.batchId}`);
                    const response = await deleteBatchsApi(batch.productId, batch.batchId);

                    if (response?.success) {
                      message.success(`Removed expired batch of ${batch.productName}!`);

                      const updatedProduct = response?.data;

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
        slug: values.slug || values.name.toLowerCase().replace(/ /g, '-'),
        quantity: Number(values.quantity),
        expiredAt: values.expiredAt ? values.expiredAt.format('YYYY-MM-DD') : null
      };

      const result = await createProductApi(payload);

      const newProd = result?.data;

      if (newProd) {
        setData(prev => [newProd, ...prev]);
        message.success("New product added successfully! 🎉");
        setIsAddModalOpen(false);
        addForm.resetFields();
      }
    } catch (error) {
      console.error("Create Product Error:", error);
      message.error(error.result?.message || "Please double-check the inputs!");
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

      const result = await putProductsApi(payload, editingProduct._id);

      if (result?.success) {
        const updatedProd = result?.data;
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
          await deleteProductsApi(record._id);
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

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
        <Spin spinning={loading}>
          <Table
            rowKey="_id"
            rowClassName={(record) => record.disabled ? 'opacity-40 bg-gray-50/50 pointer-events-none' : ''}
            columns={columns}
            dataSource={data}
            scroll={{ x: 800 }}
            size="middle"
            pagination={{
              total: data.length,
              pageSize: 5,
              showSizeChanger: false,
              placement: ['bottomRight'],
              className: "px-6 py-4 border-t border-gray-50 !m-0"
            }}
            className="w-full [&_.ant-table-thead_th]:bg-transparent [&_.ant-table-thead_th]:text-gray-400 [&_.ant-table-thead_th]:text-[11px] [&_.ant-table-thead_th]:font-bold [&_.ant-table-thead_th]:tracking-wider [&_.ant-table-thead_th]:uppercase"
          />
        </Spin>

        <div className="px-6 py-4 border-t border-gray-50 bg-gray-50/40 flex items-center">
          <div className="text-xs text-gray-400 font-medium">
            Showing <span className="font-semibold text-gray-600">1</span> to{' '}
            <span className="font-semibold text-gray-600">{Math.min(5, data.length)}</span> of{' '}
            <span className="font-semibold text-gray-600">{data.length}</span> records
          </div>
        </div>

        <Modal
          title={<span className="text-base font-bold font-heading text-gray-800">Add New Product</span>}
          open={isAddModalOpen}
          onCancel={() => { setIsAddModalOpen(false); addForm.resetFields(); }}
          onOk={handleCreateSubmit}
          confirmLoading={loading}
          okText="Add Product"
          cancelText="Cancel"
          width={460}
          className="rounded-2xl"
          okButtonProps={{ className: "bg-primary-500 hover:bg-primary-600! font-semibold px-4 rounded-xl shadow-sm cursor-pointer" }}
          cancelButtonProps={{ className: "rounded-xl font-medium" }}
          centered
        >
          <Form
            form={addForm}
            layout="vertical"
            className="mt-4 text-sm flex flex-col gap-3.5 [&_.ant-input]:rounded-xl [&_.ant-input-number]:rounded-xl [&_.ant-select-selector]:rounded-xl! [&_.ant-picker]:rounded-xl"
            initialValues={{ status: "IN STOCK" }}
          >
            <Form.Item name="name" label={<span className="font-semibold text-gray-700">Product Name</span>} rules={[{ required: true }]} className="mb-0">
              <Input placeholder="e.g., Tiramisu" className="py-2" />
            </Form.Item>

            <Form.Item name="category" label={<span className="font-semibold text-gray-700">Category</span>} rules={[{ required: true }]} className="mb-0">
              <Select placeholder="Select type" className="h-9" options={[{ value: 'CAKE', label: 'CAKE' }, { value: 'DRINK', label: 'DRINK' }]} />
            </Form.Item>

            <Form.Item noStyle shouldUpdate={(prev, curr) => prev.category !== curr.category || prev.image !== curr.image}>
              {({ getFieldsValue }) => {
                const values = getFieldsValue();
                const category = values?.category?.toLowerCase() || 'drink' || 'cake';
                const image = values?.image || '';
                const slug = values?.slug || values?.name?.toLowerCase()?.replace(/ /g, '-');

                return (
                  <div className="flex flex-col gap-2.5 bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                    <Form.Item
                      name="image"
                      label={<span className="font-semibold text-gray-700 text-xs">Image Filename</span>}
                      tooltip="File must exist in public/product/[category]/ folder"
                      rules={[{ required: true, message: 'Please enter filename!' }]}
                      className="mb-0"
                    >
                      <Input placeholder="e.g., cake_1.png" className="py-2" />
                    </Form.Item>

                    <div className="flex items-center gap-3 bg-white p-2 rounded-lg border border-gray-200/60">
                      <Avatar
                        size={44}
                        shape="square"
                        src={`/product/${category}/${image}`}
                        icon={<PictureOutlined />}
                        className="rounded-lg! border border-gray-100 bg-gray-50 shadow-3xs object-cover"
                      />
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Image Preview</span>
                    </div>
                  </div>
                );
              }}
            </Form.Item>

            <Form.Item name="price" label={<span className="font-semibold text-gray-700">Price ($)</span>} rules={[{ required: true }]} className="mb-0">
              <InputNumber className="w-full py-0.5" min={0} placeholder="8.50" />
            </Form.Item>

            <Form.Item name="quantity" label={<span className="font-semibold text-gray-700">Initial Quantity</span>} rules={[{ required: true }]} className="mb-0">
              <InputNumber min={1} max={100} className="w-full py-0.5" placeholder="50" />
            </Form.Item>

            <Form.Item name="expiredAt" label={<span className="font-semibold text-gray-700">Expiration Date</span>} rules={[{ required: true }]} className="mb-0">
              <DatePicker format="YYYY-MM-DD" className="w-full py-2" disabledDate={(curr) => curr && curr.valueOf() < Date.now()} />
            </Form.Item>

            <Form.Item name="status" label={<span className="font-semibold text-gray-700">Initial Status</span>} className="mb-0">
              <Select className="h-9" options={[{ value: 'IN STOCK', label: 'IN STOCK' }, { value: 'LOW STOCK', label: 'LOW STOCK' }]} />
            </Form.Item>

            <Form.Item name="slug" label={<span className="font-semibold text-gray-700">Slug</span>} rules={[{ required: true }]} className="mb-0">
              <Input className="py-2" />
            </Form.Item>
          </Form>
        </Modal>

        <Modal
          title={<span className="text-base font-bold font-heading text-gray-800">Edit Product Info</span>}
          open={isEditModalOpen}
          onCancel={() => { setIsEditModalOpen(false); editForm.resetFields(); setEditingProduct(null); }}
          onOk={handleUpdateSubmit}
          confirmLoading={loading}
          okText="Save Changes"
          cancelText="Cancel"
          width={460}
          className="rounded-2xl"
          okButtonProps={{ className: "bg-primary-500 hover:bg-primary-600! font-semibold px-4 rounded-xl shadow-sm cursor-pointer" }}
          cancelButtonProps={{ className: "rounded-xl font-medium" }}
          centered
        >
          <Form
            form={editForm}
            layout="vertical"
            className="mt-4 text-sm flex flex-col gap-3.5 [&_.ant-input]:rounded-xl [&_.ant-input-number]:rounded-xl [&_.ant-select-selector]:rounded-xl! [&_.ant-picker]:rounded-xl"
          >
            <Form.Item name="name" label={<span className="font-semibold text-gray-700">Product Name</span>} rules={[{ required: true }]} className="mb-0">
              <Input className="py-2" />
            </Form.Item>

            <Form.Item name="category" label={<span className="font-semibold text-gray-700">Category</span>} rules={[{ required: true }]} className="mb-0">
              <Select className="h-9" options={[{ value: 'CAKE', label: 'CAKE' }, { value: 'DRINK', label: 'DRINK' }]} />
            </Form.Item>

            <Form.Item noStyle shouldUpdate={(prev, curr) => prev.category !== curr.category || prev.image !== curr.image}>
              {({ getFieldsValue }) => {
                const values = getFieldsValue();
                const category = (values?.category || 'DRINK').toLowerCase();
                const image = values?.image || '';

                return (
                  <div className="flex flex-col gap-2.5 bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                    <Form.Item
                      name="image"
                      label={<span className="font-semibold text-gray-700 text-xs">Image Filename</span>}
                      rules={[{ required: true, message: 'Please enter filename!' }]}
                      className="mb-0"
                    >
                      <Input className="py-2" />
                    </Form.Item>

                    <div className="flex items-center gap-3 bg-white p-2 rounded-lg border border-gray-200/60">
                      <Avatar
                        size={44}
                        shape="square"
                        src={`/product/${category}/${image}`}
                        icon={<PictureOutlined />}
                        className="rounded-lg! border border-gray-100 bg-gray-50 shadow-3xs object-cover"
                      />
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Image Preview</span>
                    </div>
                  </div>
                );
              }}
            </Form.Item>

            <Form.Item name="price" label={<span className="font-semibold text-gray-700">Price ($)</span>} rules={[{ required: true }]} className="mb-0">
              <InputNumber className="w-full py-0.5" min={0} />
            </Form.Item>

            <Form.Item name="status" label={<span className="font-semibold text-gray-700">Status</span>} className="mb-0">
              <Select className="h-9" options={[{ value: 'IN STOCK', label: 'IN STOCK' }, { value: 'LOW STOCK', label: 'LOW STOCK' }, { value: 'OUT OF STOCK', label: 'OUT OF STOCK' }]} />
            </Form.Item>
          </Form>
        </Modal>
      </div>

    </div >
  );
};

export default Inventory;