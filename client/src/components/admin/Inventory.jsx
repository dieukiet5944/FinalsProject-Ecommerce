import React, {useState, useEffect, useMemo} from 'react'
import {RiseOutlined, WalletOutlined, MoreOutlined, EditOutlined, DeleteOutlined, PlusCircleOutlined, AlertOutlined, PlusOutlined} from "@ant-design/icons"
import { fetchProducts, restockProductApi, updateProductApi,deleteProductApi, createProductApi } from '../../services/api';
import { Table, Tag, Avatar, Space, Button, Progress, Spin, Modal, Badge, message, InputNumber, Dropdown, Form, Input, Select} from 'antd';
// import {inventorySource} from './data'

const Inventory = () =>{

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [form] = Form.useForm();
    
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
      
      const percentage = Math.round((stock.currentstock / stock.allstock) * 100);
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
              {stock.currentstock}/{stock.allstock} <span style={{ color: '#8c8c8c' }}>Units</span>
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
    render: (status) => {
      let color = '';
      if (status === 'IN STOCK') color = 'success';
      if (status === 'LOW STOCK') color = 'error';
      if (status === 'OUT OF STOCK') color = 'default';
      
      return (
        <Tag color={color} style={{ borderRadius: '12px', fontWeight: 'bold', padding: '0 10px' }}>
          {status}
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
        label: 'Nhập hàng', 
        icon: <PlusCircleOutlined />,
        onClick: () => handleRestock(record) 
      },
      { 
        key: 'edit', 
        label: 'Sửa thông tin', 
        icon: <EditOutlined />,
        onClick: () => handleEdit(record) 
      },
      { type: 'divider' }, 
      { 
        key: 'delete', 
        label: 'Vô hiệu hóa', 
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
const lowStockCount = (Array.isArray(data) ? data : []).filter(item => {
    const current = item.stock?.currentstock || 0;
    const all = item.stock?.allstock || 1; 
    const percent = (current / all) * 100;
    return percent <= 20; 
}).length;

//  Status for all product 
const getStatusByStock = (current, all) => {
  const percent = (current / all) * 100;
  if (current <= 0) return "OUT OF STOCK";
  if (percent <= 20) return "LOW STOCK";
  return "IN STOCK";
};


// LOW STOCK ALERTS
const handleActionRequest = () => {
  const lowStockItems = data.filter(item => 
    (item.stock.currentstock / item.stock.allstock) * 100 <= 20
  );
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
                  Still available: <b style={{ color: '#ff4d4f' }}>{item.stock.currentstock}</b> / {item.stock.allstock} Units
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
          const newCurrentStock = item.stock.currentstock + addedAmount;

          const newStatus = getStatusByStock(newCurrentStock, item.stock.allstock);
          
          const updatedStock = { ...item, stock: { ...item.stock, currentstock: newCurrentStock }, status: newStatus };

          return restockProductApi(item.id, updatedStock);
        }));

        setData((prev) =>
          prev.map((item) => {
            const addedAmount = tempAmounts[item.id];
            if (addedAmount > 0) {
              const newCurrentStock = item.stock.currentstock + addedAmount;
              return { 
                ...item, 
                stock: { ...item.stock, currentstock: newCurrentStock },
                status: getStatusByStock(newCurrentStock, item.stock.allstock) 
              };
            }
            return item;
          })
        );

        message.success(`Đã cập nhật kho cho ${itemsToUpdate.length} sản phẩm!`);
      } catch (error) {
        message.error("Lỗi khi nhập hàng hàng loạt!");
      } finally {
        setLoading(false);
      }
    },
  });
};



//Use the results for comparison to establish the state. [useMemo]

const avgFreshness = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return 100;

    const cakes = data.filter(item => item.category === 'CAKE' && item.manufacturedDate);
    if (cakes.length === 0) return 100;

    const now = new Date();
    const totalFreshness = cakes.reduce((sum, item) => {
        const releaseDate = new Date(item.manufacturedDate);
        const passInHours = (now - releaseDate) / (1000 * 60 * 60);
        const shelfLife = item.shelfLife || 24; 
        const itemFreshness = ((shelfLife - passInHours) / shelfLife) * 100;
        return sum + Math.max(0, Math.min(100, itemFreshness));
    }, 0);

    return Math.round(totalFreshness / cakes.length);
}, [data]);

const getFreshnessColor = (percent) => {
    if (percent > 70) return "#6dee89"; 
    if (percent > 30) return "#faad14"; 
    return "#ff4d4f"; 
};

// Action - Restock
const handleRestock = async (record) => {

  let inputAmount = 0;

  Modal.confirm({
    title: `Nhập hàng cho: ${record.name}`,
    content: (
      <div>
        <p>Số lượng hiện tại: <b>{record.stock.currentstock}</b></p>
        <span>Nhập thêm số lượng: </span>
        <InputNumber 
          min={1} 
          defaultValue={0} 
          onChange={(val) => (inputAmount = val)} 
          style={{ width: '100%' }}
        />
      </div>
    ),
    onOk: async () => {
      if (inputAmount <= 0) {
        message.warning("Vui lòng nhập số lượng lớn hơn 0");
        return;
      }

      try {
        setLoading(true);
        const newCurrentStock = record.stock.currentstock + inputAmount;

        const newStatus = calculateStatus(newCurrentStock, record.stock.allstock);

        const updatedStock = { 
          ...record.stock, 
          currentstock: newCurrentStock 
        };
        await restockProductApi(record.id, {
             stock: updatedStock, 
             status: newStatus
        });

        setData((prev) =>
          prev.map((item) =>
            item.id === record.id 
              ? { ...item, stock: updatedStock, status: newStatus } 
              : item
          )
        );

        message.success(`Đã nhập thêm ${inputAmount} sản phẩm. Trạng thái: ${newStatus}`);
      } catch (error) {
        message.error("Lỗi khi nhập hàng!");
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
const handleEdit = (product) => {
  setEditingProduct(product);
  form.setFieldsValue({
    id: product.id,       
    name: product.name,
    price: product.price,
    category: product.category,
    stock: {
      allstock: product.stock.allstock 
    }
  });
 setIsEditModalOpen(true);
};

const handleSaveEdit = async () => {
  try {
    console.log("Đang bắt đầu validate form...");
    const values = await form.validateFields();
    setLoading(true);

    const payload = {
      ...values, 
      stock: {
        allstock: values.stock.allstock, 
        currentstock: editingProduct ? editingProduct.stock.currentstock : 0 
      },
      status: editingProduct ? editingProduct.status : "OUT OF STOCK",
      image: editingProduct?.image || "default.jpg"
    };

    if (editingProduct) {
      await updateProductApi(editingProduct.id, payload);
      setData(prev => prev.map(item => 
        item.id === editingProduct.id ? { ...item, ...payload } : item
      ));
      message.success("Cập nhật sản phẩm thành công!");
    } else {
      const newProd = await createProductApi(payload);
      setData(prev => [newProd, ...prev]);
      message.success("Đã thêm sản phẩm mới!");
    }
    setIsEditModalOpen(false);
    form.resetFields();
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
    title: 'Bạn có chắc chắn muốn xóa sản phẩm này?',
    content: 'Hành động này không thể hoàn tác.',
    okText: 'Xóa',
    okType: 'danger',
    cancelText: 'Hủy',
    onOk: async () => {
      try {
        await deleteProductApi(id);
        setData(prev => prev.filter(item => item.id !== id));
        message.success("Đã xóa sản phẩm!");
      } catch (error) {
        message.error("Không thể xóa sản phẩm!");
      }
    },
  });
};


console.log("DỮ LIỆU TRONG STATE:", data);

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
                        <div style={{display:"flex", color:"orange"}}>
                            <RiseOutlined />
                            <p>+0%</p>
                        </div>
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
                        <h2 style={{color:"#6dee89"}}>{avgFreshness}%</h2>
                        <div style={{ width: "200px" }}>
                            <Progress percent={avgFreshness} strokeColor={getFreshnessColor(avgFreshness)} showInfo={false}/>
                        </div>
                        
                        <span style={{ color: "#6dee89", fontSize: '18px' }}>{avgFreshness > 30 ? "✔" : "⚠"}</span>
                    </div>
                </div>
                 
                 {/* Phần này cần xử lý sau - xử lý thời gian từ lúc nhận đơn đến khi hoàn thành đơn  */}
                <div style={{padding:"20px", display:"flex", flexDirection:"column", gap:"10px",backgroundColor:"#fff", borderRadius:"10px", boxShadow:"5px 5px 4px 0px #999"}}>
                    <p style={{color:"#999"}}>AVG. PREP TIME</p>
                    <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                        <h2>14 min</h2>
                        <div>
                            <WalletOutlined style={{color:"#999", fontSize:"2rem"}}/>
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
                    title={editingProduct ? `Chỉnh sửa: ${editingProduct.name}` : "Thêm sản phẩm mới"}
                    open={isEditModalOpen}
                    onCancel={() => {
                      setIsEditModalOpen(false); 
                    }}
                    onOk={handleSaveEdit}
                    confirmLoading={loading}
                    okText="Lưu thay đổi"
                    cancelText="Hủy"
                    >
                    <Form form={form} layout="vertical">
                        <Form.Item 
                          name="id" 
                          label="Mã sản phẩm (SKU)" 
                          rules={[{ required: !editingProduct, message: 'Vui lòng nhập mã!' }]}
                        ><Input placeholder="Ví dụ: BC-011" disabled={!!editingProduct} /></Form.Item>
                        <Form.Item name="name" label="Tên sản phẩm" rules={[{ required: true }]}>
                        <Input />
                        </Form.Item>
                        <Form.Item name="price" label="Giá bán ($)" rules={[{ required: true }]}>
                        <InputNumber min={0} style={{ width: '100%' }} />
                        </Form.Item>
                        <Form.Item name={['stock', 'allstock']} label="Tổng sức chứa kho">
                            <InputNumber min={1} style={{ width: '100%' }} />
                        </Form.Item>
                        <Form.Item name="category" label="Danh mục">
                        <Select>
                            <Select.Option value="DRINK">DRINK</Select.Option>
                            <Select.Option value="CAKE">CAKE</Select.Option>
                        </Select>
                        </Form.Item>
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