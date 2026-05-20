import React, { useState, useEffect } from 'react'
import { DownloadOutlined, UserAddOutlined, TeamOutlined, TagOutlined, DollarOutlined, FireOutlined, FunnelPlotOutlined, MoreOutlined, ProfileOutlined, DeleteOutlined, AuditOutlined } from '@ant-design/icons'
import { Modal, Table, Tag, Avatar, Space, Button, Dropdown, Spin, message } from 'antd'
import axios from 'axios'
// import {customerSource} from './data'

const Customers = () => {

    const [data, setData] = useState([]);
    const [dataMerge, setDataMerge] = useState([]);
    const [dataOrder, setdataOrder] = useState([])
    const [loading, setLoading] = useState(true)
    const [filterStatus, setFilterStatus] = useState('ALL');


    useEffect(() => {
        const loadAllDashboardData = async () => {
            setLoading(true);
            try {
                const [resUsers, resOrders] = await Promise.all([
                    axios.get("http://localhost:8080/users"),
                    axios.get("http://localhost:8080/orders")
                ]);

                const usersResult = resUsers.data?.data;
                const ordersResult = resOrders.data?.data;

                const mixedUsers = usersResult.map(user => {
                    const matchingOrders = ordersResult.filter(order => order.customerId === user.id);

                    return {
                        ...user,
                        history_orders: matchingOrders
                    };
                });

                if (mixedUsers && Array.isArray(mixedUsers)) {
                    setDataMerge(mixedUsers);
                } else {
                    console.log("Cấu trúc dữ liệu UserMerge  không hợp lệ!");
                    setDataMerge([]);
                }

                if (usersResult && Array.isArray(usersResult)) {
                    setData(usersResult);
                } else {
                    console.log("Cấu trúc dữ liệu User không hợp lệ!");
                    setData([]);
                }

                if (ordersResult && Array.isArray(ordersResult)) {
                    setdataOrder(ordersResult);
                } else {
                    console.log("Cấu trúc dữ liệu Order không hợp lệ!");
                    setdataOrder([]);
                }

                console.log("Tải toàn bộ dữ liệu người dùng và đơn hàng thành công!");

            } catch (error) {
                console.error("Lỗi kết nối hệ thống:", error);
                message.error("Không thể kết nối đến máy chủ dữ liệu!");

                setData([]);
                setDataMerge([]);
                setdataOrder([]);
            } finally {
                setLoading(false);
            }
        };

        loadAllDashboardData();

    }, []);

    const handleFilter = (status) => {
        setFilterStatus(status);
    };

    const filteredData = filterStatus === 'ALL'
        ? dataMerge
        : dataMerge.filter(item => item.status.toLowerCase() === filterStatus.toLowerCase());


    const handleViewProfile = (user) => {
        const bgStatus = user.status === "online" ? "rgb(237, 255, 241)" : "rgb(255, 237, 237)"
        Modal.info({
            title: `Detailed information: ${user.full_name}`,
            width: 500,
            content: (
                <div style={{ marginTop: 20 }}>
                    <div style={{ textAlign: 'center', marginBottom: 20 }}>
                        <Avatar src={`/product/avtusers/${user.avatar}`} size={100} />
                        <h3 style={{ margin: '10px 0' }}>{user.username}</h3>
                        <Tag color={user.role === 'admin' ? 'gold' : 'blue'}>{user.role.toUpperCase()}</Tag>
                    </div>
                    <p><b>📧 Email:</b> {user.email}</p>
                    <p><b>⚽ Total orders:</b> {user.history_orders.length} <AuditOutlined /> </p>
                    <p><b>🕒 Last activity:</b> {user.last_active}</p>
                    <p><b>📅 Date of participation:</b> {user.created_at ? new Date(user.created_at).toLocaleDateString('vi-VN') : "Chưa cập nhật"}</p>
                    <p style={{ backgroundColor: bgStatus, width: "70px", borderRadius: "10px" }}><b>{user.status === "online" ? "🟢" : "🔴"} {user.status}</b></p>
                </div>
            ),
            okText: 'Đóng',
        });
    };


    const handleDeleteUser = (id) => {
        Modal.confirm({
            title: 'Xác nhận xóa người dùng?',
            content: 'Dữ liệu của người dùng này sẽ bị xóa vĩnh viễn khỏi hệ thống MongoDB.',
            okText: 'Xóa ngay lập tức',
            okType: 'danger',
            cancelText: 'Hủy bỏ',
            onOk: async () => {
                try {
                    setLoading(true);
                    const response = await axios.delete(`http://localhost:8080/users/${id}`);

                    if (response.data.success || response.status === 200) {

                        setDataUsers(prev => prev.filter(item => item.id !== id));

                        message.success("Xóa người dùng thành công!");
                    } else {
                        throw new Error("Xóa thất bại từ phía Server");
                    }
                } catch (error) {
                    console.error("Lỗi xóa người dùng:", error);
                    message.error(error.response?.data?.message || "Không thể xóa người dùng này!");
                } finally {
                    setLoading(false);
                }
            },
        });
    };


    const columns = [
        {
            title: 'CUSTOMER',
            width: 250,
            key: 'users',
            render: (_, record) => (
                <Space>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <Avatar src={`/product/avtusers/${record.avatar}`} size={45} shape="square" />
                        <div>
                            <p style={{ fontWeight: 'bold', color: '#2d2424' }}>{record.full_name}</p>
                            <p style={{ fontSize: '12px', color: '#8c8c8c' }}>ID: {record.id}</p>
                        </div>
                    </div>
                </Space>
            )
        },
        {
            title: 'CONTACT INFO',
            width: 250,
            dataIndex: 'email',
            key: 'email',
            render: (_, record) => <span>{record.email}</span>
        },
        {
            title: 'TOTAL ORDERS',
            width: 250,
            dataIndex: 'history_orders', 
            key: 'history_orders',
            render: (history_orders, record) => {
                
                const ordersCount = (record.history_orders || []).length;

                const toptier = ordersCount === 0 ? "New Member"
                    : ordersCount <= 30 ? "Occasional"
                        : ordersCount <= 60 ? "High Frequency"
                            : "Top Tier";

                const colorMap = {
                    "New Member": "#8c8c8c",     
                    "Occasional": "#fa8c16",     
                    "High Frequency": "#52c41a", 
                    "Top Tier": "#f5222d"        
                };

                return (
                    <div >

                        <span style={{
                            color: colorMap[toptier],
                            fontSize: '12px',
                            fontWeight: 'bold',
                            backgroundColor: `${colorMap[toptier]}15`, 
                            padding: '2px 6px',
                            borderRadius: '4px'
                        }}>
                            {toptier}
                        </span>
                    </div>
                );
            }
        },
        {
            title: 'LOYALTY POINTS',
            width: 250,
            dataIndex: 'history_orders', 
            key: 'points',
            render: (history_orders, record) => {
                const ordersCount = (record.history_orders || []).length;

                const point = ordersCount * 10;

                return (
                    <span style={{ fontWeight: 'bold', color: '#fa8c16' }}>⭐ {point.toLocaleString()}</span>
                )
            }
        },
        {
            title: 'STATUS',
            width: 250,
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
            width: 250,
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
                        menu={{ items: actionItems }}
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

        <div style={{ padding: "24px 36px", display: "flex", flexDirection: "column", gap: "20px", height: "100vh" }}>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div>
                    <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#EE2B6C" }}>Customer Directory</h1>
                    <p style={{ color: "#999" }}>Managing {data.length} members of Crumb & Bean Rewards</p>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px" }}>
                    <Button style={{ cursor: "pointer", display: "flex", justifyContent: "space-between", gap: "10px", padding: "10px 12px", alignItems: "center", backgroundColor: "#fff", border: "1px solid rgb(239, 61, 120)", borderRadius: "5px", color: "rgb(239, 61, 120)" }}><DownloadOutlined /> <h4>Export List</h4></Button>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gridGap: "20px" }}>
                <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "10px", backgroundColor: "#fff", borderRadius: "10px", boxShadow: "5px 5px 4px 0px #999" }}>
                    <div style={{ padding: "10px", backgroundColor: "rgb(239, 246, 255)", borderRadius: "5px", display: "flex", justifyContent: "center", alignItems: "center", color: "rgb(38, 99, 235)", border: "1px solid rgb(38, 99, 235)" }}><TeamOutlined /></div>
                    <div>
                        <h2>{data.length}</h2>
                        <p style={{ color: "#999" }}>TOTAL CUSTOMERS</p>
                    </div>
                </div>

                <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "10px", backgroundColor: "#fff", borderRadius: "10px", boxShadow: "5px 5px 4px 0px #999" }}>
                    <div style={{ padding: "10px", backgroundColor: "rgb(253, 233, 240)", borderRadius: "5px", display: "flex", justifyContent: "center", alignItems: "center", color: "rgb(238, 43, 108)", border: "1px solid rgb(238, 43, 108)" }}><TagOutlined /></div>
                    <div>
                        <h2>842</h2>
                        <p style={{ color: "#999" }}>ACTIVE LOYALTY MEMBERS</p>
                    </div>
                </div>

                <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "10px", backgroundColor: "#fff", borderRadius: "10px", boxShadow: "5px 5px 4px 0px #999" }}>
                    <div style={{ padding: "10px", backgroundColor: "rgb(237, 255, 241)", borderRadius: "5px", display: "flex", justifyContent: "center", alignItems: "center", color: "rgb(35, 163, 63)", border: "1px solid rgb(35, 163, 63)" }}><DollarOutlined /></div>
                    <div>
                        <h2>$53.2K</h2>
                        <p style={{ color: "#999" }}>LTV REVENUE</p>
                    </div>
                </div>

                <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "10px", backgroundColor: "#FFF", borderRadius: "10px", boxShadow: "5px 5px 4px 0px #999" }}>
                    <div style={{ padding: "10px", backgroundColor: "rgb(255, 242, 229)", borderRadius: "5px", display: "flex", justifyContent: "center", alignItems: "center", color: "rgb(221, 137, 53)", border: "1px solid rgb(221, 137, 53) ", }}><FireOutlined /></div>
                    <div>
                        <h2>92%</h2>
                        <p style={{ color: "#999" }}>RETENTION RATE</p>
                    </div>
                </div>
            </div>

            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "14p 24px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", borderRadius: "5px", backgroundColor: "#edf4fdce", padding: "5px 10px", textAlign: "center" }}>
                    <button className='btn-orders' onClick={() => handleFilter('ALL')}>ALL</button>
                    <button className='btn-orders' onClick={() => handleFilter('online')}>ONLINE</button>
                    <button className='btn-orders' onClick={() => handleFilter('offline')}>OFFLINE</button>
                </div>
            </div>


            {/* Table lisst customers 👨‍💼  */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px", backgroundColor: "#fff", borderRadius: "8px", padding: "14px 24px" }}>
                <Spin spinning={loading}>
                    <Table
                        rowClassName={(record) => record.disabled ? 'row-disabled' : ''}
                        columns={columns}
                        rowKey="id"
                        dataSource={filteredData}
                        scroll={{ x: 800 }}
                        pagination={{
                            total: filteredData.length,
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