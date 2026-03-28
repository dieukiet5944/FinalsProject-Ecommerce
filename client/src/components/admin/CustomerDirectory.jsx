import React, {useState}from 'react'
import {DownloadOutlined, UserAddOutlined, TeamOutlined, TagOutlined, DollarOutlined, FireOutlined, FunnelPlotOutlined} from '@ant-design/icons'
import {Modal, Table, Tag, Avatar, Space, Button} from 'antd'
import {customerSource} from './data'

const Customers = () => {

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null); 

    const showModal = (customer) => {
        setSelectedCustomer(customer);
        setIsModalOpen(true);
    };

    const columns = [
    {
      title: 'CUSTOMER',
      dataIndex: 'customer',
      key: 'customer',
      render: (customer) => 
        <Space>
          <div style={{display:"flex", alignItems:"center", gap:"10px"}}>
            <Avatar src={customer.avatar} />
            <div>
                <p style={{ fontWeight: 'bold', color: '#2d2424' }}>{customer.name}</p>
                <p style={{ fontSize: '12px', color: '#8c8c8c' }}>ID: {customer.customerId}</p>
            </div>
          </div>
        </Space>
    },
    {
      title: 'CONTACT INFO',
      dataIndex: 'email',
      key: 'email',
      render: (contact) => <span>{contact}</span>
    },
    {
      title: 'TOTAL ORDERS',
      dataIndex: 'allorders',
      key: 'allorders',
      render: (allorders) => {
            const toptier = allorders <= 10 ? "New Member" : allorders <=30 ? "Occasional" : allorders <=60 ? "High Frequency" : "Top Tier"
            
            const colorMap = {
            "New Member": "orange",
            "Occasional": "gray",
            "High Frequency": "green",
            "Top Tier": "red"
            };

            return (
                <div style={{ display: "flex", alignItems: 'center', gap: "8px" }}>
                    <h3 style={{ margin: 0 }}>{allorders}</h3>
                    <span style={{ color: colorMap[toptier], fontSize: '12px', fontWeight: 'bold' }}>{toptier}</span>
                </div>
            )
      }
    },
    {
      title: 'LOYALTY POINTS',
      dataIndex: 'points',
      key: 'points',
      render: (points) => <span style={{ fontWeight: 'bold' }}>⭐ {points}pts</span>,
    },
    {
      title: 'STATUS',
      key: 'status',
      dataIndex: 'status',
      render: (status) => (
        <Tag color={status === 'Online' ? 'success' : 'error'} style={{ borderRadius: '12px' }}>
          {status}
        </Tag>
      )
    },
    {
      title: 'ACTIONS',
      key: 'action',
      render: (_, record) => ( 
        <Button type="default" onClick={() => showModal(record.customer)}>
          View Profile
        </Button>
      ),
    },
  ];


    return (

        <div style={{padding:"24px 36px", display:"flex", flexDirection:"column", gap:"32px", height:"100vh"}}>

            <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-end"}}>
                    <div>
                        <h1>Customer Directory</h1>
                        <p style={{color: "#999"}}>Managing 1,248 active members of Velvet Crumb Rewards</p>
                    </div>

                    <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", gap:"10px"}}>
                        <Button style={{cursor:"pointer",display:"flex", justifyContent:"space-between", gap:"10px", padding:"10px 12px", alignItems:"center", backgroundColor:"#fff", border:"1px solid rgb(239, 61, 120)", borderRadius:"5px", color:"rgb(239, 61, 120)"}}><DownloadOutlined /> <h4>Export List</h4></Button>
                        <Button style={{cursor:"pointer",display:"flex", justifyContent:"space-between", gap:"10px", padding:"10px 12px", alignItems:"center", backgroundColor:"rgb(239, 61, 120)", border:"1px solid rgb(239, 61, 120)", borderRadius:"5px", color:"#fff"}}><UserAddOutlined /> <h4>New Customer</h4></Button>
                    </div>
            </div>

            <div style={{display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gridGap:"20px"}}>
                <div style={{padding:"20px", display:"flex", flexDirection:"column", gap:"10px", backgroundColor:"#fff", borderRadius:"10px", boxShadow:"5px 5px 4px 0px #999"}}>
                    <div style={{padding:"10px", backgroundColor:"rgb(239, 246, 255)", borderRadius:"5px", display:"flex", justifyContent:"center", alignItems:"center", color:"rgb(38, 99, 235)", border:"1px solid rgb(38, 99, 235)"}}><TeamOutlined /></div>
                    <div>
                        <h2>1,248</h2>
                        <p style={{color:"#999"}}>TOTAL CUSTOMERS</p>
                    </div>
                </div>

                <div style={{padding:"20px", display:"flex", flexDirection:"column", gap:"10px", backgroundColor:"#fff", borderRadius:"10px", boxShadow:"5px 5px 4px 0px #999"}}>
                    <div style={{padding:"10px", backgroundColor:"rgb(253, 233, 240)", borderRadius:"5px", display:"flex", justifyContent:"center", alignItems:"center", color:"rgb(238, 43, 108)",  border:"1px solid rgb(238, 43, 108)"}}><TagOutlined /></div>
                    <div>
                        <h2>842</h2>
                        <p style={{color:"#999"}}>ACTIVE LOYALTY MEMBERS</p>
                    </div>
                </div>

                <div style={{padding:"20px", display:"flex", flexDirection:"column", gap:"10px", backgroundColor:"#fff", borderRadius:"10px", boxShadow:"5px 5px 4px 0px #999"}}>
                    <div style={{padding:"10px", backgroundColor:"rgb(237, 255, 241)", borderRadius:"5px", display:"flex", justifyContent:"center", alignItems:"center", color:"rgb(35, 163, 63)", border:"1px solid rgb(35, 163, 63)"}}><DollarOutlined /></div>
                    <div>
                        <h2>$53.2K</h2>
                        <p style={{color:"#999"}}>LTV REVENUE</p>
                    </div>
                </div>

                <div style={{padding:"20px", display:"flex", flexDirection:"column", gap:"10px", backgroundColor:"#FFF", borderRadius:"10px", boxShadow:"5px 5px 4px 0px #999"}}>
                    <div style={{padding:"10px", backgroundColor:"rgb(255, 242, 229)", borderRadius:"5px", display:"flex", justifyContent:"center", alignItems:"center", color:"rgb(221, 137, 53)", border:"1px solid rgb(221, 137, 53) ",}}><FireOutlined /></div>
                    <div>
                        <h2>92%</h2>
                        <p style={{color:"#999"}}>RETENTION RATE</p>
                    </div>
                </div>
            </div>

 
            {/* Table lisst customers 👨‍💼  */}
            <div style={{display:"flex", flexDirection:"column", gap:"20px", backgroundColor:"#fff", borderRadius:"8px", padding:"14px 24px"}}>
                <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                        
                        <div style={{display:"flex", alignItems:"center", gap:"10px"}}>
                            <h3>Member List</h3>
                            <button className='btn-customer'>ALL</button>
                            <button className='btn-customer'>VIP</button>
                            <button className='btn-customer'>INACTIVE</button>
                        </div>

                        <div><FunnelPlotOutlined /></div>


                </div>

                <Table 
                    columns={columns} 
                    dataSource={customerSource} 
                    pagination={{
                    total: 128,
                    pageSize: 5,
                    showSizeChanger: false,
                    position: ['bottomRight'],
                    }}
                />
                <div style={{ marginTop: '-45px', color: '#8c8c8c' }}>
                    Showing 1 to 5 of 128 orders
                </div>


                <Modal
                    title={selectedCustomer ? `Customer ID: ${selectedCustomer.customerId}` : "Loading..."}
                    open={isModalOpen}
                    onOk={() => setIsModalOpen(false)}
                    onCancel={() => setIsModalOpen(false)}
                >
                    {selectedCustomer && (
                    <div style={{ textAlign: 'center' }}>
                        <Avatar size={64} src={selectedCustomer.avatar} />
                        <h2 style={{ marginTop: '10px' }}>{selectedCustomer.name}</h2>
                        <p>Thông tin chi tiết về khách hàng sẽ hiển thị ở đây...</p>
                    </div>
                    )}
                </Modal>
            </div>


        </div>
    )
}

export default Customers;