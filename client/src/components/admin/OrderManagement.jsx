import React, { useState, useEffect } from 'react'
import { Table, Tag, Avatar, Space, Button, Spin, Modal, Dropdown, message } from 'antd';
import { MoreOutlined, EyeOutlined, CheckCircleOutlined, CloseCircleOutlined,  DeleteOutlined } from '@ant-design/icons'
import { fetchUsers } from '../../services/api';


const Orders = () => {
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [dataUsers, setDataUsers] = useState([])
    const [dataSource, setDataSource] = useState([])
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
              message.error("Không tìm thấy chủ nhân của đơn hàng này!");
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
          message.error("Cập nhật trạng thái thất bại!");
      }
  };


    const calculateTotalRevenue = () => {
      const completedOrders = dataSource.filter(order => order.status === 'Completed');

      const total = completedOrders.reduce((sum, order) => {
          return sum + (Number(order.sumOrders) || 0);
      }, 0);

      return total.toLocaleString('en-US', { minimumFractionDigits: 2 });
  };

    const countPendingOrders = () => {
        const pendingList = dataSource.filter(order => 
            order.status?.toLowerCase() === 'processing'
        );

        return pendingList.length;
    };


    const loadOrdersData = async () => {
      setLoading(true);
       try{
         const users = await fetchUsers();
         const allOrders = users.flatMap(user => 
          user.history_orders.map(order => ({
            ...order,
            key: order.orderId,
            price: order.items?.[0]?.price,
            name: order.items?.[0]?.name,
            quantity: order.items?.[0]?.qty,
            sumOrders: order.items?.[0]?.qty * order.items?.[0]?.price,
            customer: {
              name: user.username,
              avatar: user.avatar,
              email: user.email,
              userId: user.id
            }
          }))
        );
        setDataUsers(users);
        setDataSource(allOrders); 
       }catch (error) {
        console.error("Lỗi khi load đơn hàng:", error);
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
                        <h1>Order Management</h1>
                        <p style={{color: "#999"}}>Efficiently process and track your bakery's daily flow</p>
                    </div>
            </div>

            

            <div style={{display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gridGap:"20px"}}>
                <div style={{padding:"20px", display:"flex", flexDirection:"column", gap:"10px", border: "1px solid #91d5ff", backgroundColor: "#e6f7ff", borderRadius:"10px", boxShadow:"5px 5px 4px 0px #999"}}>
                    <p style={{ color: "#0050b3", fontWeight: "bold"}}>TOTAL REVENUE</p>
                    <h2 style={{ color: "#096dd9"}}>${calculateTotalRevenue()}</h2>
                </div>

                <div style={{padding:"20px", display:"flex", flexDirection:"column", gap:"10px", backgroundColor: "#fffbe6", border: "1px solid #ffe58f", borderRadius:"10px", boxShadow:"5px 5px 4px 0px #999"}}>
                    <p style={{ color: "#874d00", fontWeight: "bold" }}>PENDING ORDERS</p>
                    <h2 style={{ color: "#d48806" }}>{countPendingOrders()}</h2>
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
              title={`Hóa đơn: ${selectedOrder?.orderId}`}
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <span>{selectedOrder.name} <b>x{selectedOrder.quantity}</b></span>
                    <b>${Number(selectedOrder.price).toFixed(2)}</b>
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