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
            title: <span className="text-base sm:text-lg font-bold text-gray-800">Detailed information: {user.full_name}</span>,
            width: 500,
            content: (
                <div className="mt-5 text-gray-700 text-sm sm:text-base space-y-3">
                    <div className="text-center mb-5 flex flex-col items-center">
                        <Avatar
                            src={`/product/avtusers/${user.avatar}`}
                            size={100}
                            className="border-2 border-gray-100 shadow-sm"
                        />
                        <h3 className="text-lg sm:text-xl font-bold text-gray-800 my-2">{user.username}</h3>
                        <Tag color={user.role === 'admin' ? 'gold' : 'blue'} className="px-3 py-0.5 font-medium rounded">
                            {user.role.toUpperCase()}
                        </Tag>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3">
                        <p className="flex items-center gap-2 m-0">
                            <span className="font-semibold text-gray-500 w-36 sm:w-40 shrink-0">📧 Email:</span>
                            <span className="text-gray-800 break-all">{user.email}</span>
                        </p>
                        <p className="flex items-center gap-2 m-0">
                            <span className="font-semibold text-gray-500 w-36 sm:w-40 shrink-0">⚽ Total orders:</span>
                            <span className="text-gray-800 font-medium flex items-center gap-1.5">
                                {user.length} <AuditOutlined className="text-gray-400" />
                            </span>
                        </p>
                        <p className="flex items-center gap-2 m-0">
                            <span className="font-semibold text-gray-500 w-36 sm:w-40 shrink-0">🕒 Last activity:</span>
                            <span className="text-gray-800">{user.last_active}</span>
                        </p>
                        <p className="flex items-center gap-2 m-0">
                            <span className="font-semibold text-gray-500 w-36 sm:w-40 shrink-0">📅 Date of participation:</span>
                            <span className="text-gray-800">
                                {user.created_at ? new Date(user.created_at).toLocaleDateString('vi-VN') : "Chưa cập nhật"}
                            </span>
                        </p>

                        <p className="flex items-center gap-2 m-0 pt-1">
                            <span className="font-semibold text-gray-500 w-36 sm:w-40 shrink-0">Status:</span>
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${user.status === "online"
                                ? "bg-green-50 text-green-700 border border-green-200"
                                : "bg-red-50 text-red-600 border border-red-200"
                                }`}>
                                <span className={`w-2 h-2 rounded-full ${user.status === "online" ? "bg-green-500" : "bg-red-500"}`}></span>
                                {user.status}
                            </span>
                        </p>
                    </div>
                </div>
            ),
            okText: 'Đóng',
            className: "max-w-[calc(100vw-32px)] sm:max-w-[500px]",
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
            width: 200, // Thu nhỏ một chút để tối ưu không gian hiển thị
            key: 'users',
            render: (_, record) => (
                <div className="flex items-center gap-3">
                    <Avatar
                        src={`/product/avtusers/${record.avatar}`}
                        size={44}
                        shape="square"
                        className="rounded-md border border-gray-100 object-cover shrink-0"
                    />
                    <div className="min-w-0">
                        <p className="font-bold text-gray-800 m-0 truncate text-sm sm:text-base">
                            {record.full_name}
                        </p>
                        <p className="text-xs text-gray-400 m-0 mt-0.5 font-medium">
                            ID: {record.id}
                        </p>
                    </div>
                </div>
            )
        },
        {
            title: 'CONTACT INFO',
            width: 220,
            dataIndex: 'email',
            key: 'email',
            render: (email) => (
                <span className="text-gray-600 text-sm break-all font-medium">
                    {email}
                </span>
            )
        },
        {
            title: 'TOTAL ORDERS',
            width: 180,
            dataIndex: 'history_orders',
            key: 'history_orders',
            render: (history_orders) => {
                const ordersCount = (history_orders || []).length;

                let toptier = "New Member";
                let badgeClass = "text-gray-500 bg-gray-100 border-gray-200";

                if (ordersCount > 0 && ordersCount <= 30) {
                    toptier = "Occasional";
                    badgeClass = "text-orange-600 bg-orange-50 border-orange-200";
                } else if (ordersCount <= 60 && ordersCount > 30) {
                    toptier = "High Frequency";
                    badgeClass = "text-green-600 bg-green-50 border-green-200";
                } else if (ordersCount > 60) {
                    toptier = "Top Tier";
                    badgeClass = "text-red-600 bg-red-50 border-red-200";
                }

                return (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold border uppercase tracking-wider ${badgeClass}`}>
                        {toptier}
                    </span>
                );
            }
        },
        {
            title: 'LOYALTY POINTS',
            width: 160,
            dataIndex: 'history_orders',
            key: 'points',
            render: (history_orders) => {
                const ordersCount = (history_orders || []).length;
                const point = ordersCount * 10;

                return (
                    <span className="font-bold text-orange-500 text-sm sm:text-base flex items-center gap-1">
                        <span>⭐</span> {point.toLocaleString()}
                    </span>
                );
            }
        },
        {
            title: 'STATUS',
            width: 140,
            key: 'status',
            dataIndex: 'status',
            render: (status) => (
                <Tag
                    color={status === 'online' ? 'success' : 'error'}
                    className="rounded-full px-3 py-0.5 font-medium uppercase text-[11px] tracking-wider"
                >
                    {status}
                </Tag>
            )
        },
        {
            title: 'ACTIONS',
            width: 80,
            align: 'center',
            key: 'action',
            render: (_, record) => {
                const actionItems = [
                    {
                        key: 'viewprofile',
                        label: <span className="font-medium text-gray-700">View Info</span>,
                        icon: <ProfileOutlined className="text-gray-400" />,
                        onClick: () => handleViewProfile(record)
                    },
                    {
                        key: 'delete',
                        label: <span className="font-medium">Delete User</span>,
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
                        classNames={{ root: "shadow-lg" }}
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


    return (

        <div className="p-4 sm:p-6 md:p-9 flex flex-col gap-6 min-h-screen bg-gray-50/50">

            {/* Header Section: Title & Action Button */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-[#EE2B6C] m-0">Customer Directory</h1>
                    <p className="text-xs sm:text-sm text-gray-400 m-0 mt-1 font-medium">
                        Managing {data.length} members of Crumb & Bean Rewards
                    </p>
                </div>

                <Button
                    className="flex! items-center gap-2 px-4 py-2 bg-white border border-[#EF3D78] rounded-md text-[#EF3D78] font-semibold hover:text-white! hover:bg-[#EF3D78]! hover:border-[#EF3D78]! transition-all cursor-pointer shadow-sm w-full sm:w-auto justify-center"
                >
                    <DownloadOutlined className="text-base" />
                    <span className="text-xs sm:text-sm">Export List</span>
                </Button>
            </div>

            {/* Stats Cards Grid: 1 cột trên phone, 2 cột trên tablet, 4 cột trên desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                {/* Card 1: Total Customers */}
                <div className="p-5 flex items-center gap-4 bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-gray-100">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center text-xl border border-blue-100 shrink-0">
                        <TeamOutlined />
                    </div>
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 m-0">{data.length}</h2>
                        <p className="text-[11px] font-bold tracking-wider text-gray-400 m-0 mt-0.5">TOTAL CUSTOMERS</p>
                    </div>
                </div>

                {/* Card 2: Active Loyalty Members */}
                <div className="p-5 flex items-center gap-4 bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-gray-100">
                    <div className="p-3 bg-pink-50 text-[#EE2B6C] rounded-lg flex items-center justify-center text-xl border border-pink-100 shrink-0">
                        <TagOutlined />
                    </div>
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 m-0">842</h2>
                        <p className="text-[11px] font-bold tracking-wider text-gray-400 m-0 mt-0.5">LOYALTY MEMBERS</p>
                    </div>
                </div>

                {/* Card 3: LTV Revenue */}
                <div className="p-5 flex items-center gap-4 bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-gray-100">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center text-xl border border-emerald-100 shrink-0">
                        <DollarOutlined />
                    </div>
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 m-0">$53.2K</h2>
                        <p className="text-[11px] font-bold tracking-wider text-gray-400 m-0 mt-0.5">LTV REVENUE</p>
                    </div>
                </div>

                {/* Card 4: Retention Rate */}
                <div className="p-5 flex items-center gap-4 bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-gray-100">
                    <div className="p-3 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center text-xl border border-orange-100 shrink-0">
                        <FireOutlined />
                    </div>
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 m-0">92%</h2>
                        <p className="text-[11px] font-bold tracking-wider text-gray-400 m-0 mt-0.5">RETENTION RATE</p>
                    </div>
                </div>
            </div>

            {/* Filter Navigation Tabs */}
            <div className="flex justify-center items-center py-2">
                <div className="inline-grid grid-cols-3 bg-gray-200/60 p-1 rounded-lg w-full max-w-[320px] sm:max-w-90">
                    <button
                        className="py-1.5 text-xs sm:text-sm font-semibold rounded-md transition-all text-gray-600 hover:text-gray-900 focus:bg-white focus:text-gray-800 focus:shadow-sm active:bg-white active:shadow-sm"
                        onClick={() => handleFilter('ALL')}
                    >
                        ALL
                    </button>
                    <button
                        className="py-1.5 text-xs sm:text-sm font-semibold rounded-md transition-all text-gray-600 hover:text-gray-900 focus:bg-white focus:text-green-600 focus:shadow-sm active:bg-white active:shadow-sm"
                        onClick={() => handleFilter('online')}
                    >
                        ONLINE
                    </button>
                    <button
                        className="py-1.5 text-xs sm:text-sm font-semibold rounded-md transition-all text-gray-600 hover:text-gray-900 focus:bg-white focus:text-red-500 focus:shadow-sm active:bg-white active:shadow-sm"
                        onClick={() => handleFilter('offline')}
                    >
                        OFFLINE
                    </button>
                </div>
            </div>

            {/* Table List Customers Section */}
            <div className="flex flex-col gap-5 bg-white rounded-xl p-4 sm:p-6 shadow-[0_4px_12px_rgba(0,0,0,0.02)] border border-gray-100 relative">
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
                        className="w-full"
                    />
                </Spin>

                {/* Bộ đếm dữ liệu vị trí tương đối chuẩn UI Antd */}
                <div className="sm:absolute bottom-7 left-6 text-xs sm:text-sm text-gray-400 font-medium mt-2 sm:mt-0 text-center sm:text-left">
                    Showing 1 to 5 of {filteredData.length} records
                </div>
            </div>

        </div>
    )
}

export default Customers;