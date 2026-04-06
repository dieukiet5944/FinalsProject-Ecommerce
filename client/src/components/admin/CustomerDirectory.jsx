import React, {useState, useEffect}from 'react'
import {DownloadOutlined, UserAddOutlined, TeamOutlined, TagOutlined, DollarOutlined, FireOutlined, FunnelPlotOutlined, MoreOutlined, ProfileOutlined, DeleteOutlined} from '@ant-design/icons'
import {Modal, Table, Tag, Avatar, Space, Button, Dropdown, Spin, message} from 'antd'
import {fetchUsers} from '../../services/api'
// import {customerSource} from './data'

const Customers = () => {

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true)

    useEffect(() => {
      const loadDataUsers = async () => {
        setLoading(true);
        try {
          setLoading(true);
          const data = await fetchUsers(); 
          setData(data);
        } catch (error) {
          console.error("Lỗi rồi Hòa ơi:", error);
          message.error("Không thể kết nối đến server MockAPI (Lỗi 503)");
        } finally {
          setLoading(false);
        }
      };
      loadDataUsers();
    }, []);

    const handleViewProfile = (user) => {
    Modal.info({
        title: `Thông tin chi tiết: ${user.full_name}`,
        width: 500,
        content: (
        <div style={{ marginTop: 20 }}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <Avatar src={`/product/avtusers/${user.avatar}`} size={100} />
            <h3 style={{ margin: '10px 0' }}>{user.username}</h3>
            <Tag color={user.role === 'admin' ? 'gold' : 'blue'}>{user.role.toUpperCase()}</Tag>
            </div>
            <p><b>📧 Email:</b> {user.email}</p>
            <p><b>📞 Phone:</b> {user.phone}</p>
            <p><b>⚽ Tổng đơn hàng:</b> {user.order} đơn</p>
            <p><b>🕒 Hoạt động cuối:</b> {user.last_active}</p>
            <p><b>📅 Ngày tham gia:</b> {new Date(user.created_at).toLocaleDateString()}</p>
        </div>
        ),
        okText: 'Đóng',
    });
    };


    const handleDeleteUser = (id) => {
    Modal.confirm({
        title: 'Xác nhận xóa người dùng?',
        content: 'Dữ liệu của cầu thủ này sẽ bị xóa vĩnh viễn khỏi hệ thống MU 2008.',
        okText: 'Xóa ngay',
        okType: 'danger',
        cancelText: 'Hủy',
        onOk: async () => {
        try {
            setLoading(true);

            await fetch(`https://69cb64510b417a19e07a9a7e.mockapi.io/users/${id}`, { method: 'DELETE' });

            setData(prev => prev.filter(item => item.id !== id));
            
            message.success("Đã xóa người dùng thành công!");
        } catch (error) {
            message.error("Không thể xóa người dùng này!");
        } finally {
            setLoading(false);
        }
        },
    });
    };


    const columns = [
    {
      title: 'CUSTOMER',
      key: 'customer',
      render: (_, record) => (
        <Space>
          <div style={{display:"flex", alignItems:"center", gap:"10px"}}>
            <Avatar src={`/product/avtusers/${record.avatar}`} size={45} shape="square" />
            <div>
                <p style={{ fontWeight: 'bold', color: '#2d2424' }}>{record.username}</p>
                <p style={{ fontSize: '12px', color: '#8c8c8c' }}>ID: {record.id}</p>
            </div>
          </div>
        </Space>
      )
    },
    {
      title: 'CONTACT INFO',
      dataIndex: 'email',
      key: 'email',
      render: (_, record) => <span>{record.email}</span>
    },
    {
      title: 'TOTAL ORDERS',
      dataIndex: 'order',
      key: 'order',
      render: (_, record) => {
            const toptier = record.order <= 10 ? "New Member" : record.order <=30 ? "Occasional" : record.order <=60 ? "High Frequency" : "Top Tier"
            
            const colorMap = {
            "New Member": "orange",
            "Occasional": "gray",
            "High Frequency": "green",
            "Top Tier": "red"
            };

            return (
                <div style={{ display: "flex", alignItems: 'center', gap: "8px" }}>
                    <h3 style={{ margin: 0 }}>{record.order}</h3>
                    <span style={{ color: colorMap[toptier], fontSize: '12px', fontWeight: 'bold' }}>{toptier}</span>
                </div>
            )
      }
    },
    {
      title: 'LOYALTY POINTS',
      key: 'points',
      render: (_, record) => {
        const point = record.order * 10; 

        return (
                 <span style={{ fontWeight: 'bold' }}>⭐ {point}</span>
        )
      }
    },
    {
      title: 'STATUS',
      key: 'status',
      dataIndex: 'status',
      render: (_, record) => (
        <Tag color={record.status === 'online' ? 'success' : 'error'} style={{ borderRadius: '12px' }}>
          {record.status}
        </Tag>
      )
    },
    {
      title: 'ACTIONS',
      width: 60,
      align: 'center',
      key: 'action',
      render: (_, record) => {


         const actionItems = [
            { 
                key: 'viewprofile', 
                label: 'ViewInfo', 
                icon: <ProfileOutlined />,
                onClick: () => handleViewProfile(record) 
            },
            { 
                key: 'delete', 
                label: 'Delete User', 
                icon: <DeleteOutlined />,
                danger: true,
                onClick: () => handleDeleteUser(record) 
            },
        ];

        return (

            <Dropdown 
                menu={{ items: actionItems  }} 
                trigger={['click']}
                placement="bottomRight"
            >
            <Button type="text" icon={<MoreOutlined style={{ fontSize: '20px' }} />} />
            </Dropdown>
        )
      },
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
                        <h2>{data.length}</h2>
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
                <Spin spinning={loading}>
                    <Table 
                        rowClassName={(record) => record.disabled ? 'row-disabled' : ''}
                        columns={columns} 
                        rowKey="id"
                        dataSource={data} 
                        pagination={{
                        total: data.length,
                        pageSize: 5,
                        showSizeChanger: false,
                        placement: 'bottomRight',
                        }}
                    />
                </Spin>
                <div style={{ marginTop: '-45px', color: '#8c8c8c' }}>
                    Showing 1 to 5 of 128 orders
                </div>
            </div>


        </div>
    )
}

export default Customers;