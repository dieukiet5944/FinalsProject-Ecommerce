import React, { useState, useEffect, useMemo } from 'react'
import { Table, Tag, Avatar, Space, Button, Spin, Modal, Dropdown, message } from 'antd';
import { MoreOutlined, EyeOutlined, CheckCircleOutlined, CloseCircleOutlined,  DeleteOutlined } from '@ant-design/icons'
import { fetchUsers, fetchProducts } from '../../services/api';


const Orders = () => {
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [dataUsers, setDataUsers] = useState([])
    const [dataSource, setDataSource] = useState([])
    const [dataProducts, setDataProducts] = useState([])
    const [loading, setLoading] = useState(false);

    const [selectedOrder, setSelectedOrder] = useState(null); 

    const [isModalOpen, setIsModalOpen] = useState(false);

    const getStatusColor = (status) => {
      switch (status) {
        case 'Processing': return '#1890ff';
        case 'Completed': return '#52c41a';   
        case 'Cancel': return '#f5222d';    
        default: return '#888';              
      }
    };
    
    const handleCancel = () => {
    setIsModalOpen(false);
    setSelectedOrder(null); 
    };

    const handleViewOrder = (order) => {
       setSelectedOrder(order); 
       setIsModalOpen(true);
       
    }
    const handleFilter = (status) => {
        setFilterStatus(status);
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
      try {
          const userOwner = dataUsers.find(user => 
              user.history_orders.some(order => order.orderId === orderId)
          );

          if (!userOwner) {
              message.error("No owner of this order can be found!");
              return;
          }

          const updatedHistory = userOwner.history_orders.map(order =>
              order.orderId === orderId ? { ...order, status: newStatus } : order
          );

          const response = await fetch(`https://69cfba0fa4647a9fc675e215.mockapi.io/users/${userOwner.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                  ...userOwner, 
                  history_orders: updatedHistory 
              })
          });

          if (response.ok) {
          
              setDataUsers(prevUsers => 
                  prevUsers.map(u => 
                      u.id === userOwner.id ? { ...u, history_orders: updatedHistory } : u
                  )
              );
              message.success(`Order ${orderId} is now ${newStatus}`);
          } else {
              throw new Error("API Update Failed");
          }
      } catch (error) {
          console.error("Update Error:", error);
          message.error("Update the failure status!");
      }
  };


    const calculateTotalRevenue = () => {

      const today = new Date().toISOString().split('T')[0];

      const todayOrders = dataSource.filter(order => order.date === today && order.status === 'Completed');

      const total = todayOrders.reduce((sum, order) => {
          return sum + (Number(order.sumOrders) || 0);
      }, 0);

      return total.toLocaleString('en-US', { minimumFractionDigits: 2 });
  };

  
    const categoryStats = useMemo(() => {
        const lookup = {};

        if (dataProducts && dataProducts.length > 0) {
        dataProducts.forEach(p => {
          lookup[p.name] = p.category;
        });
        }

        return dataSource
        .filter(order => order.status === 'Completed')
        .reduce((stats, order) => {
          order.items?.forEach(item => {
            const category = lookup[item.name]; 

            if (category?.toLowerCase() === 'cake') {
              stats.cake += Number(item.qty || 0);
            } else if (category?.toLowerCase() === 'drink') {
              stats.drink += Number(item.qty || 0);
            }
          });
          return stats;
        }, { cake: 0, drink: 0 });
        }, [dataSource, dataProducts]);

       
      const totalCakes = categoryStats.cake;
      const totalDrinks = categoryStats.drink;


    const loadOrdersData = async () => {
      setLoading(true);
       try{
         const users = await fetchUsers();
         const products = await fetchProducts();
         


         const allOrders = users.flatMap(user => 
          user.history_orders.map(order => {

            const totalQty = order.items?.reduce((sum, item) => sum + item.qty, 0) || 0 ;
            const calculatedTotal = order.items?.reduce((sum, item) => sum + (item.qty * item.price), 0) || 0;

            return {
              
                ...order,
                key: order.orderId,
                name: order.items?.map(item => item.name).join(", ").substring(0, 30) + "...",  
                quantity: totalQty,
                sumOrders: calculatedTotal,
                customer: {
                  name: user.username,
                  avatar: user.avatar,
                  email: user.email,
                  userId: user.id
                }
            }
          })
        );
        setDataProducts(products);
        setDataUsers(users);
        setDataSource(allOrders); 
       }catch (error) {
        console.error("Error loading order:", error);
      }finally {
      setLoading(false);
    }
    }

    useEffect(() => {
    loadOrdersData();
  }, []);

    const filteredData = filterStatus === 'ALL' 
    ? dataSource
    : dataSource.filter(item => item.status === filterStatus);

    const columns = [
    {
      title: 'ORDER ID',
      dataIndex: 'orderId',
      key: 'orderId',
      render: (id) => <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>{id}</span>,
    },
    {
      title: 'CUSTOMER',
      dataIndex: 'customer',
      key: 'customer',
      render: (customer) => (
        <Space>
          <Avatar src={`/product/avtusers/${customer.avatar}`} size={45} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: 'bold', color: '#2d2424' }}>{customer.name}</span>
            <span style={{ fontSize: '12px', color: '#8c8c8c' }}>{customer.email}</span>
          </div>
        </Space>
      ),
    },
    {
      title: 'DATE',
      dataIndex: 'date',
      key: 'date',
      render: (date) => <span style={{ color: '#595959' }}>{date}</span>,
    },
    {
      title: 'TOTAL',
      dataIndex: 'sumOrders',
      key: 'sumOrders',
      render: (sumOrders) => <span style={{ fontWeight: 'bold' }}>${sumOrders.toFixed(2)}</span>,
    },
    {
      title: 'STATUS',
      key: 'status',
      dataIndex: 'status',
      render: (status) => {
        let color = '';
        if (status === 'Processing') color = 'processing';
        if (status === 'Completed') color = 'success';
        
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
      render: (_, record) => {

        const actionItems = [
            {
              key: 'vieworder', 
              label: 'View',
              icon: <EyeOutlined />,
              onClick: () => handleViewOrder(record)
            },


            ...(record.status === 'Processing' ? [
            { 
              key: 'accept', 
              label: 'Accept', 
              icon: <CheckCircleOutlined />,
              onClick: () => handleUpdateStatus(record.orderId, 'Completed') 
            },
            { 
              key: 'cancel', 
              label: 'Reject', 
              icon: <CloseCircleOutlined />, 
              danger: true,
              onClick: () => handleUpdateStatus(record.orderId, 'Cancel')
            }
          ] : []),

            { type: 'divider' },
            { 
              key: 'delete', 
              label: 'Delete', 
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
          >
            <Button type="text" icon={<MoreOutlined style={{ fontSize: '20px' }}/>} />
          </Dropdown>
       );
    },

  }
]


    return (
        <div style={{padding:"24px 36px", display:"flex", flexDirection:"column", gap:"32px", height:"100vh"}}>
            
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-end"}}>
                    <div>
                        <h1 style={{fontSize:"1.5rem", fontWeight:"bold", color:"#EE2B6C"}}>Order Management</h1>
                        <p style={{color: "#999"}}>Efficiently process and track your bakery's daily flow</p>
                    </div>
            </div>

            

            <div style={{display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gridGap:"20px"}}>
                <div style={{padding:"20px", display:"flex", flexDirection:"column", gap:"10px", border: "1px solid #91d5ff", backgroundColor: "#e6f7ff", borderRadius:"10px", boxShadow:"5px 5px 4px 0px #999"}}>
                    <p style={{ color: "#0050b3", fontWeight: "bold"}}>TODAY'S REVENUE</p>
                    <h2 style={{ color: "#096dd9"}}>${calculateTotalRevenue()}</h2>
                </div>

                <div style={{padding:"20px", display:"flex", flexDirection:"column", gap:"10px", backgroundColor: "#fffbe6", border: "1px solid #ffe58f", borderRadius:"10px", boxShadow:"5px 5px 4px 0px #999"}}>
                    <p style={{ color: "#874d00", fontWeight: "bold" }}>ITEM SOLD</p>
                    <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                      <span style={{color:"#874d00"}}>Cakes: <b>{totalCakes}</b> dishes</span>
                      <span style={{color:"#874d00"}}>Drinks: <b>{totalDrinks}</b> dishes</span>
                    </div>
                </div>

                <div style={{padding:"20px", display:"flex", flexDirection:"column", gap:"10px", backgroundColor: "#f6ffed", border: "1px solid #b7eb8f", borderRadius:"10px", boxShadow:"5px 5px 4px 0px #999"}}>
                    <p style={{ color: "#237804", fontWeight: "bold"}}>TOTAL ORDERS</p>
                    <h2 style={{ color: "#389e0d"}}>{dataSource.length}</h2>
                </div>
            </div>

        
            <div style={{display:"flex", justifyContent:"center", alignItems:"center", padding:"14p 24px"}}>
                <div style={{display:"grid", gridTemplateColumns:"repeat(4, 1fr)", borderRadius:"5px",backgroundColor:"#edf4fdce", padding:"5px 10px", textAlign:"center"}}>
                        <button className='btn-orders' onClick={() => handleFilter('ALL')}>ALL</button>
                        <button className='btn-orders' onClick={() => handleFilter('Processing')}>PROCESSING</button>
                        <button className='btn-orders' onClick={() => handleFilter('Completed')}>COMPLETED</button>
                        <button className='btn-orders' onClick={() => handleFilter('Cancel')}>CANCELLED</button>
                </div>
            </div>


            <div style={{ padding: '20px', background: '#fff', borderRadius: '8px' }}>
              <Spin spinning={loading}>
                <Table 
                    columns={columns} 
                    dataSource={filteredData} 
                    pagination={{ pageSize: 5 }}
                />
              </Spin>
                <div style={{ marginTop: '-45px', color: '#8c8c8c' }}>
                    Showing 1 to 5 of 128 orders
                </div>
            </div>


            <Modal
              title={`Receipt: ${selectedOrder?.orderId}`}
              open={isModalOpen}
              onCancel={handleCancel}
              footer={null} 
            >
              
              {selectedOrder && (
                <div style={{ color: '#333', padding: '10px' }}>
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', pb: '10px', mb: '15px' }}>
                    <span><b>Date:</b> {selectedOrder.date}</span>
                    <span style={{
                       color: getStatusColor(selectedOrder.status)
                    }}><b>Status:</b> {selectedOrder.status}</span>
                  </div>

                  {/* Content */}
                  <div style={{ marginBottom: '20px' }}>
                    {selectedOrder.items?.map((item, index) => (
                      <div key={index} style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        marginBottom: '10px',
                        paddingBottom: '5px',
                        borderBottom: '1px dashed #f0f0f0'
                      }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: '500' }}>{item.name}</span>
                          <small style={{ color: '#8c8c8c' }}>{item.qty} x ${Number(item.price).toFixed(2)}</small>
                        </div>
                        <b style={{ alignSelf: 'center' }}>
                          ${(item.qty * item.price).toFixed(2)}
                        </b>
                      </div>
                    ))}
                  </div>

                  {/* Total */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '5px' }}>
                    <span style={{ fontSize: '16px' }}>Total Amount:</span>
                    <b style={{ fontSize: '20px', color: '#d4380d' }}>${Number(selectedOrder.sumOrders).toFixed(2)}</b>
                  </div>
                </div>
              )}
            </Modal>
    </div>
    )
}

export default Orders