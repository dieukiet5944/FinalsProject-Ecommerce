import React, {useState, useEffect, useMemo} from 'react'
import {RiseOutlined, WalletOutlined, MoreOutlined, EditOutlined, DeleteOutlined, PlusCircleOutlined, AlertOutlined, PlusOutlined, PictureOutlined} from "@ant-design/icons"
import { fetchProducts, restockProductApi, updateProductApi,deleteProductApi, createProductApi } from '../../services/api';
import { Table, Tag, Avatar, Space, Button, Progress, Spin, Modal, Badge, message, InputNumber, Dropdown, Form, Input, Select, DatePicker} from 'antd';
// import {inventorySource} from './data'

const Inventory = () =>{

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [form] = Form.useForm();


    
    const category = Form.useWatch('category', form);

    const [update, setUpdate] = useState(false);

    useEffect(() => {
      const loadData = async () => {
        setLoading(true);
        try {
          const response = await fetchProducts(); 
          if (Array.isArray(response) && response.length > 0) {
            setData(response);
          } else {
            message.warning("Hiện tại không có dữ liệu sản phẩm.");
            setData([]);
          }
        } catch (error) {
          message.error("Kết nối Server thất bại!");
        } finally {
          setLoading(false);
        }
      };
      loadData();
    }, []);

   const columns = [
  {
    title: 'PRODUCT NAME',
    key: 'product',
    render: (_, record) => (
      <Space>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Avatar 
            src={`/product/${record.category?.toLowerCase()}/${record.image}`} 
            size={45} 
            shape="square" 
          />
          <div>
            <p style={{ fontWeight: 'bold', color: '#2d2424', margin: 0, lineHeight: '1.2' }}>
              {record.name}
            </p>
            <p style={{ fontSize: '12px', color: '#8c8c8c', margin: 0 }}>
              SKU: {record.id}
            </p>
          </div>
        </div>
      </Space>
    ),
  },
  {
    title: 'CATEGORY',
    dataIndex: 'category',
    key: 'category',
    render: (category) => (
      <Tag color={category === 'DRINK' ? 'blue' : 'orange'} style={{ borderRadius: '6px' }}>
        {category}
      </Tag>
    )
  },
  {
    title: 'STOCK LEVEL',
    dataIndex: 'stock',
    key: 'stock',
    render: (stock) => {
      if (!stock) return "N/A";
      
      const percentage = Math.round((stock.currentstock / stock.capacity) * 100);
      const strokecolor = percentage <= 20 ? '#ff4d4f' : percentage <= 60 ? '#faad14' : '#52c41a';

      return (
        <div style={{ width: 140 }}>
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "flex-end", 
            marginBottom: 4 
          }}>
            <span style={{ fontSize: '12px', fontWeight: '500' }}>
              {stock.currentstock}/{stock.capacity} <span style={{ color: '#8c8c8c' }}>Units</span>
            </span>
            <span style={{ fontSize: '12px', color: '#6F4E37', fontWeight: 'bold' }}>
              {percentage}%
            </span>
          </div>
          <Progress 
            percent={percentage} 
            size="small" 
            showInfo={false} 
            strokeColor={strokecolor} 
          />
        </div>
      );
    }
  },
  {
    title: 'PRICE',
    dataIndex: 'price',
    key: 'price',
    render: (price) => <span style={{ fontWeight: 'bold' }}>${Number(price).toFixed(2)}</span>,
  },
  {
    title: 'STATUS',
    dataIndex: 'status',
    key: 'status',
    render: (_, record) => {

      const currentStatus = calculateStatus(record.stock.currentstock, record.stock.capacity);
      let color = 'green';
      if (currentStatus === 'OUT OF STOCK') color = 'default';
      if (currentStatus === 'LOW STOCK') color = 'error';
      
      return (
        <Tag color={color} style={{ borderRadius: '12px', fontWeight: 'bold', padding: '0 10px' }}>
          {currentStatus}
        </Tag>
      );
    },
  },
  {
    title: 'ACTIONS',
    key: 'action',
    width: 60,
    align: 'center',
    render: (_, record) => {

      const actionItems = [
      { 
        key: 'restock', 
        label: 'Restock', 
        icon: <PlusCircleOutlined />,
        onClick: () => handleRestock(record) 
      },
      { 
        key: 'edit', 
        label: 'Edit', 
        icon: <EditOutlined />,
        onClick: () => handleEdit(record) 
      },
      { type: 'divider' }, 
      { 
        key: 'delete', 
        label: 'Disable', 
        icon: <DeleteOutlined />, 
        danger: true,
        onClick: () => handleDelete(record)
      },
    ];

    return (

          <Dropdown 
            menu={{ items: actionItems  }} 
            trigger={['click']}
            placement="bottomRight"
          >
          <Button type="text" icon={<MoreOutlined style={{ fontSize: '20px' }}/>} />
          </Dropdown>
    )
        },
  },
];

// TOTAL SKU 
const lowStockCount = (
  Array.isArray(data) ? data : []).filter(item => {
    const current = item.stock?.currentstock || 0;
    const all = item.stock?.capacity || 1; 
    const percent = (current / all) * 100;
    return percent <= 20; 
}).length;

//  Status for all product 
const getStatusByStock = (current, all) => {
  const curr = Number(current) || 0;
  const total = Number(all) || 1; 

  const percent = (curr / total) * 100;

  if (curr <= 0) return "OUT OF STOCK";
  if (percent <= 20) return "LOW STOCK"; 
  return "IN STOCK";
};


// LOW STOCK ALERTS
const handleActionRequest = () => {
  const lowStockItems = data.filter(item => {
    const current = item.stock?.currentstock ?? 0; 
    const capacity = item.stock?.capacity || 100;
    const percentage = (current / capacity) * 100;
    return percentage <= 20;
  });
  if (lowStockItems.length === 0) {
    message.success("All items are in stock, Admin, please rest assured.");
    return;
  }

  let tempAmounts = {};

  Modal.confirm({
    title: '🚨 LIST OF ITEMS NEEDING URGENT SHIPPING',
    width: 700,
    okText: 'Complete',
    cancelText: 'Close',
   content: (
      <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '10px' }}>
        {lowStockItems.map((item) => (
          <div 
            key={item.id} 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              padding: '12px 0', 
              borderBottom: '1px solid #f0f0f0' 
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
              <Avatar 
                src={`/product/${item.category.toLowerCase()}/${item.image}`} 
                shape="square" 
                size={48} 
              />
              <div>
                <b style={{ color: '#2d2424', display: 'block' }}>{item.name}</b>
                <span style={{ fontSize: '12px', color: '#8c8c8c' }}>
                  Still available: <b style={{ color: '#ff4d4f' }}>{item.stock?.currentstock ?? 0}</b> / {item.stock?.capacity || 100} Units
                </span>
                <div style={{ marginTop: '4px' }}>
                  <Badge status="error" text="Alert!" style={{ fontSize: '11px' }} />
                </div>
              </div>
            </div>
            
            <div style={{ marginLeft: '10px' }}>
              <InputNumber 
                min={0} 
                placeholder="SL" 
                style={{ width: 80 }} 
                onChange={(val) => { tempAmounts[item.id] = val }} 
              />
            </div>
          </div>
        ))}
      </div>
    ),

     onOk: async () => {

      const itemsToUpdate = lowStockItems.filter(item => tempAmounts[item.id] > 0);

      if (itemsToUpdate.length === 0) {
        message.info("Chưa có số lượng nào được nhập thêm.");
        return;
      }

      try {
        setLoading(true);
        
        await Promise.all(itemsToUpdate.map(async (item) => {
          const addedAmount = tempAmounts[item.id];

          const current = item.stock?.currentstock || 0;

          const capacity = item.stock?.capacity || 100;

          const newCurrentStock = current+ addedAmount;

          const newStatus = getStatusByStock(newCurrentStock, capacity);
          
          const payload = { 
            stock: { 
              capacity: capacity, 
              currentstock: newCurrentStock 
            }, 
            status: newStatus 
          };

          return restockProductApi(item.id, payload);
        }));

        setData((prev) =>
          prev.map((item) => {
            const addedAmount = tempAmounts[item.id];
            if (addedAmount > 0) {
              const current = item.stock?.currentstock || 0;
              const capacity = item.stock?.capacity || 100;
              const newCurrentStock = current + addedAmount;
              const newStatus = getStatusByStock(newCurrentStock, capacity);
              return { 
                ...item, 
                stock: { ...item.stock, currentstock: newCurrentStock, capacity: capacity },
                status: newStatus
              };
            }
            return item;
          })
        );

        message.success(`Successfully restocked ${itemsToUpdate.length} products!`);
      } catch (error) {
        console.error("Lỗi đây Hòa ơi:", error);
        message.error("Batch restock failed!");
      } finally {
        setLoading(false);
      }
    },
  });
};

const countCake = () => {
    return data.reduce((sum, index) => {
       if(index.category === "CAKE"){
           sum += 1
       }
       return sum
    }, 0)
}

const countDrink = () => {
    return data.reduce((sum, index) => {
       if(index.category === "DRINK"){
           sum += 1
       }

       return sum
    }, 0)
}

//Use the results for comparison to establish the state. [useMemo]

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

const calculateStatus = (current, total) => {
    const percentage = (current / total) * 100;

    if (current <= 0) {
        return "OUT OF STOCK";
    } else if (percentage <= 20) {
        return "LOW STOCK";
    } else {
        return "IN STOCK";
    }
};

// Action - Restock
const handleRestock = async (record) => {

  let inputAmount = 0;

  const maxCapacity = record.stock?.capacity || 100; 
  const current = record.stock?.currentstock || 0;

  Modal.confirm({
    title: `Nhập hàng cho: ${record.name}`,
    content: (
      <div>
        <p>Số lượng hiện tại: <b>{record.stock.currentstock}</b></p>
        <span>Nhập thêm số lượng: </span>
        <InputNumber 
          min={1} 
          max={maxCapacity - current}
          defaultValue={0} 
          onChange={(val) => (inputAmount = val)} 
          style={{ width: '100%' }}
        />
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
        const newStatus = calculateStatus(newCurrentStock, maxCapacity  );

        const cleanStock = { 
          capacity: maxCapacity, 
          currentstock: newCurrentStock 
        };

        const payload = {
          stock: cleanStock, 
          status: newStatus
        };


        await restockProductApi(record.id, payload);

        setData((prev) =>
          prev.map((item) =>
            item.id === record.id 
              ? { ...item, stock: cleanStock, status: newStatus } 
              : item
          )
        );

        message.success(`Goods received successfully! Main warehouse: ${newCurrentStock}`)
      } catch (error) {
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

// Action - Edit
const handleEdit = (record) => {
  setEditingProduct(record);
  form.setFieldsValue({
    ...record,
    id: record.id,       
    name: record.name,
    price: record.price,
    category: record.category,
    stock: {
      capacity: record.stock.capacity,
      currentstock: record.stock.currentstock
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
        currentstock: editingProduct ? editingProduct.stock.currentstock : (formStock.currentstock || 0)
      },
      status: editingProduct ? editingProduct.status : initialStatus,
    };

    if (payload.category === "CAKE" && !editingProduct) {
      payload.createdAt = new Date().toISOString().split('T')[0];
    }

    if (editingProduct) {
      await updateProductApi(editingProduct.id, payload);
      setData(prev => prev.map(item => 
        item.id === editingProduct.id ? { ...item, ...payload, id: item.id } : item
      ));
      message.success("Product updated successfully!");
    } else {
      const newProd = await createProductApi(payload);
      setData(prev => [newProd, ...prev]);
      message.success("New product added successfully!");
    }
    setIsEditModalOpen(false);
    form.resetFields();
    setEditingProduct(null);
  } catch (error) {
    console.error("Lỗi thực sự đây Hòa ơi:", error);
    message.error("Vui lòng kiểm tra lại các trường nhập liệu!");
  } finally {
    setLoading(false);
  }
};


// Action - Delete
const handleDelete = async (id) => {
  Modal.confirm({
    title: 'Are you sure you want to delete this product?',
    content: 'This action cannot be completed',
    okText: 'Disable',
    okType: 'danger',
    cancelText: 'Cancel',
    onOk: async () => {
      try {
        await deleteProductApi(id);
        setData(prev => prev.filter(item => item.id !== id));
        message.success("Product disable!");
      } catch (error) {
        message.error("Cannot disable product!");
      }
    },
  });
};


    return (
        <div style={{padding:"24px 36px", display:"flex", flexDirection:"column", gap:"32px", height:"100vh"}}>

            <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-end"}}>
                    <div>
                        <h1>Inventory Management</h1>
                        <p style={{color: "#999"}}>Real-time stock tracking for Drink & Cake la</p>
                    </div>

                    <div style={{display:"flex", justifyContent:"center", alignItems:"center"}}>
                        <Button color="pink" variant="solid" onClick={handleAddNew} icon={<PlusOutlined />} >
                            New product
                        </Button>
                    </div>
            </div>

            

            <div style={{display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gridGap:"20px"}}>
                <div style={{padding:"20px", display:"flex", flexDirection:"column", gap:"10px", backgroundColor:"#fff", borderRadius:"10px", boxShadow:"5px 5px 4px 0px #999"}}>
                    <p style={{color:"#999"}}>TOTAL SKU</p>
                    <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                        <h2>{data.length}</h2>
                    </div>
                </div>

                <div style={{padding:"20px", display:"flex", flexDirection:"column", gap:"10px", backgroundColor:"#fff", borderRadius:"10px", boxShadow:"5px 5px 4px 0px #999"}}>
                    <p style={{color:"#999"}}>LOW STOCK ALERTS</p>
                    <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                        <h2 style={{color:"#ff8e04"}}>{lowStockCount}</h2>
                        <Button onClick={handleActionRequest} type="text" icon={<AlertOutlined />} style={{display:"flex", color:"orange", padding:"5px 15px", backgroundColor:"#fadcb7"}}>Action Request</Button>
                    </div>
                </div>

                <div style={{padding:"20px", display:"flex", flexDirection:"column", gap:"10px", backgroundColor:"#fff", borderRadius:"10px", boxShadow:"5px 5px 4px 0px #999"}}>
                    <p style={{color:"#999"}}>BAKERY FRESHNESS</p>
                    <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", gap:"10px"}}>
                        <h2 style={{ color: getFreshnessColor(avgFreshness) }}>{avgFreshness}%</h2>
                        <div style={{ width: "200px" }}>
                            <Progress percent={avgFreshness} strokeColor={getFreshnessColor(avgFreshness)} showInfo={false}/>
                        </div>
                        
                        <span style={{ color: getFreshnessColor(avgFreshness), fontSize: '18px' }}>{avgFreshness > 30 ? "✔" : "⚠"}</span>
                    </div>
                </div>
                 
                 
                <div style={{padding:"20px", display:"flex", flexDirection:"column", gap:"10px",backgroundColor:"#fff", borderRadius:"10px", boxShadow:"5px 5px 4px 0px #999"}}>
                    <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", backgroundColor:"#FFF7E6", borderRadius:"10px", padding:"0px 8px"}}>
                        <h2 style={{color:"orange"}}>CAKE</h2>
                        <div>
                            {countCake()}
                        </div>
                    </div>
                    <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", backgroundColor:"#E4F6FF", borderRadius:"10px", padding:"0px 8px"}}>
                        <h2 style={{color:"blue"}}>DRINK</h2>
                        <div>
                            {countDrink()}
                        </div>
                    </div>
                </div>
            </div>


            <div style={{ padding: '20px', background: '#fff', borderRadius: '8px' }}>
                <Spin spinning={loading} >
                    <Table 
                        rowClassName={(record) => record.disabled ? 'row-disabled' : ''}
                        columns={columns} 
                        dataSource={data} 
                        pagination={{
                        total: data.length,
                        pageSize: 5,
                        showSizeChanger: false,
                        placement: 'bottomRight',
                        }}
                    />
                    <Modal
                    title={editingProduct ? `Edit Product: ${editingProduct.name}` : "Add New Product"}
                    open={isEditModalOpen}
                    onCancel={() => {
                      setIsEditModalOpen(false); 
                    }}
                    onOk={handleSaveEdit}
                    confirmLoading={loading}
                    okText="Save Changes"
                    cancelText="Cancel"
                    >
                    <Form form={form} layout="vertical">
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px', gap: '8px' }}>
                            <Avatar 
                                size={100} 
                                shape="square" 
                                src={`/product/${(form.getFieldValue('category') || 'drink').toLowerCase()}/${form.getFieldValue('image')}`} 
                                icon={<PictureOutlined />}
                                style={{ border: '1px dashed #d9d9d9', backgroundColor: '#fafafa' }}
                            />
                            <span style={{ fontSize: '12px', color: '#8c8c8c' }}>Image Preview</span>
                        </div>
                        <Form.Item 
                            name="image" 
                            label="Image Filename" 
                            tooltip="Enter the filename in public/product folder (e.g., cake_1.png)"
                            rules={[{ required: true, message: 'Please enter the image filename!' }]}
                        >
                            <Input 
                                placeholder="e.g., drink_5.png" 
                                onChange={() => setUpdate(!update)} 
                            />
                        </Form.Item>
                        <Form.Item 
                          name="id" 
                          label="Stock Keeping Unit (SKU)" 
                          rules={[{ required: !editingProduct, message: 'Vui lòng nhập mã!' }]}
                        ><Input placeholder="e.g. BC-011" disabled={!!editingProduct} /></Form.Item>
                        <Form.Item name="name" label="Product Name" rules={[{ required: true }]}>
                        <Input />
                        </Form.Item>
                        <Form.Item name="price" label="Price ($)" rules={[{ required: true }]}>
                        <InputNumber min={0} style={{ width: '100%' }} />
                        </Form.Item>
                        <Form.Item name="category" label="Category">
                        <Select>
                            <Select.Option value="DRINK">DRINK</Select.Option>
                            <Select.Option value="CAKE">CAKE</Select.Option>
                        </Select>
                        </Form.Item>

                        <Form.Item name={['stock', 'capacity']} label="Max Capacity" style={{ flex: 1 }}>
                          <InputNumber min={1} defaultValue={100} style={{ width: '100%' }} />
                        </Form.Item>
                        
                        <Form.Item name={['stock', 'currentstock']} label="Initial Stock" style={{ flex: 1 }}>
                          <InputNumber min={0} defaultValue={0} style={{ width: '100%' }} />
                        </Form.Item>

                        {category === 'CAKE' && (
                          <Form.Item 
                            name="expiryDate" 
                            label="Expiry Date" 
                            rules={[{ required: true, message: 'Expiry date is required for cakes!' }]}
                          >
                            <DatePicker style={{ width: '100%' }} placeholder="Select expiry date" />
                          </Form.Item>
                        )}
                    </Form>
                    </Modal>
                </Spin>
                <div style={{ marginTop: '-45px', color: '#8c8c8c' }}>
                    Showing 1 to 5 of 128 orders
                </div>
            </div>
    </div>
    )
}

export default Inventory