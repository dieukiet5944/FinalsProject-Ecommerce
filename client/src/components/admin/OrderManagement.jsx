import React, { useState, useEffect } from 'react'
import { Table, Tag, Avatar, Space, Button, Spin } from 'antd';
import { MoreOutlined } from '@ant-design/icons'
import { fetchUsers } from '../../services/api';


const Orders = () => {
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [dataSource, setDataSource] = useState([])
    const [loading, setLoading] = useState(false);

    const handleFilter = (status) => {
        setFilterStatus(status);
    };

    const loadOrdersData = async () => {
      setLoading(true);
       try{
         const users = await fetchUsers();
         const allOrders = users.flatMap(user => 
          user.history_orders.map(order => ({
            ...order,
            key: order.orderId,
            customer: {
              name: user.username,
              avatar: user.avatar,
              email: user.email
            }
          }))
        );
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
      dataIndex: 'total',
      key: 'total',
      render: (total) => <span style={{ fontWeight: 'bold' }}>${total.toFixed(2)}</span>,
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
      render: () => (
        <Button type="text" icon={<MoreOutlined />} />
      ),
    },
  ];

    return (
        <div style={{padding:"24px 36px", display:"flex", flexDirection:"column", gap:"32px", height:"100vh"}}>
            
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-end"}}>
                    <div>
                        <h1>Order Management</h1>
                        <p style={{color: "#999"}}>Efficiently process and track your bakery's daily flow</p>
                    </div>

                    <div style={{display:"flex", justifyContent:"center", alignItems:"center"}}>
                        <Button color="pink" variant="solid">
                            + New Order
                        </Button>
                    </div>
            </div>

            

            <div style={{display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gridGap:"20px"}}>
                <div style={{padding:"20px", display:"flex", flexDirection:"column", gap:"10px", backgroundColor:"#fff", borderRadius:"10px", boxShadow:"5px 5px 4px 0px #999"}}>
                    <p style={{color:"#999"}}>DAILY REVENUE</p>
                    <h2>$2,482</h2>
                </div>

                <div style={{padding:"20px", display:"flex", flexDirection:"column", gap:"10px", backgroundColor:"#fff", borderRadius:"10px", boxShadow:"5px 5px 4px 0px #999"}}>
                    <p style={{color:"#999"}}>PENDING ORDERS</p>
                    <h2>18</h2>
                </div>

                <div style={{padding:"20px", display:"flex", flexDirection:"column", gap:"10px", backgroundColor:"#fff", borderRadius:"10px", boxShadow:"5px 5px 4px 0px #999"}}>
                    <p style={{color:"#999"}}>READY FOR PICKUP</p>
                    <h2>34</h2>
                </div>

                <div style={{border:"1px solid rgb(239, 61, 120) ",padding:"20px", display:"flex", flexDirection:"column", gap:"10px", backgroundColor:"rgba(242, 197, 212, 0.87)", borderRadius:"10px", boxShadow:"5px 5px 4px 0px #999"}}>
                    <p style={{color:"rgb(243, 93, 143)"}}>AVG. PREP TIME</p>
                    <h2 style={{color:"rgb(239, 61, 120)"}}>24m</h2>
                </div>
            </div>

        
            <div style={{display:"flex", justifyContent:"center", alignItems:"center", padding:"14p 24px"}}>
                <div style={{display:"grid", gridTemplateColumns:"repeat(5, 1fr)", borderRadius:"5px",backgroundColor:"#edf4fdce", padding:"5px 10px", textAlign:"center"}}>
                        <button className='btn-orders' onClick={() => handleFilter('ALL')}>ALL</button>
                        <button className='btn-orders' onClick={() => handleFilter('Processing')}>PROCESSING</button>
                        <button className='btn-orders' onClick={() => handleFilter('Completed')}>COMPLETED</button>
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
    </div>
    )
}

export default Orders