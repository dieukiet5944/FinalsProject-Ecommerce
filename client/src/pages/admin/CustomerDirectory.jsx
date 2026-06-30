import React, { useState, useEffect, useMemo } from 'react'
import { DownloadOutlined, UserAddOutlined, TeamOutlined, TagOutlined, TrophyOutlined, DollarOutlined, FireOutlined, FunnelPlotOutlined, MoreOutlined, ProfileOutlined, DeleteOutlined, AuditOutlined } from '@ant-design/icons'
import { Modal, Table, Tag, Avatar, Space, Button, Dropdown, Spin, message } from 'antd'
import axios from 'axios'
import { API_URL } from '../../config/api.js'

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const Customers = () => {

    const [data, setData] = useState([]);
    const [dataUser, setdataUser] = useState([]);
    const [dataOrder, setdataOrder] = useState([])
    const [loading, setLoading] = useState(true)
    const [filterStatus, setFilterStatus] = useState('ALL');


    useEffect(() => {
        const loadAllDashboardData = async () => {
            setLoading(true);
            try {
                const [resUsers, resOrders] = await Promise.all([
                    axios.get(`${API_URL}/users`),
                    axios.get(`${API_URL}/orders`)
                ]);

                const usersResult = resUsers.data?.data;
                const ordersResult = resOrders.data?.data;

                const mixedUsers = usersResult.map(user => {
                    const userIdStr = user._id ? user._id.toString() : '';

                    const matchingOrders = ordersResult.filter(order => {
                        if (!order.customerId) return false;
                        const orderCustomerIdStr = order.customerId.toString();
                        return orderCustomerIdStr === userIdStr;
                    });

                    const calculatedTotalPrice = matchingOrders.reduce((sum, order) => {
                        return sum + (Number(order.totalPrice) || 0);
                    }, 0);

                    return {
                        ...user,
                        history_orders: matchingOrders,
                        totalPrice: calculatedTotalPrice
                    };
                });

                console.log("this", mixedUsers)

                if (mixedUsers && Array.isArray(mixedUsers)) {
                    setdataUser(mixedUsers);
                } else {
                    console.log("Cấu trúc dữ liệu dataUser  không hợp lệ!");
                    setdataUser([]);
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
                setdataUser([]);
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
        ? dataUser
        : dataUser.filter(item => item.status.toLowerCase() === filterStatus.toLowerCase());


    const handleViewProfile = (user) => {
        const bgStatus = user.status === "online" ? "rgb(237, 255, 241)" : "rgb(255, 237, 237)"
        Modal.info({
            title: <span className="text-base sm:text-lg font-bold text-gray-800">Detailed information: {user.username}</span>,
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
                                {user.history_orders.length} <AuditOutlined className="text-gray-400" />
                            </span>
                        </p>
                        <p className="flex items-center gap-2 m-0">
                            <span className="font-semibold text-gray-500 w-36 sm:w-40 shrink-0">🕒 Last activity:</span>
                            <span className="text-gray-800">{user.createdAt}</span>
                        </p>
                        <p className="flex items-center gap-2 m-0">
                            <span className="font-semibold text-gray-500 w-36 sm:w-40 shrink-0">📅 Date of participation:</span>
                            <span className="text-gray-800">
                                {user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : "Chưa cập nhật"}
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


    const handleDeleteUser = (record) => {
        Modal.confirm({
            title: 'Xác nhận xóa người dùng?',
            content: 'Dữ liệu của người dùng này sẽ bị xóa vĩnh viễn khỏi hệ thống MongoDB.',
            okText: 'Xóa ngay lập tức',
            okType: 'danger',
            cancelText: 'Hủy bỏ',
            centered: true,
            onOk: async () => {
                try {
                    setLoading(true);
                    const response = await axios.delete(`http://localhost:8080/users/${record._id}`);

                    if (response.data?.success || response.status === 200) {

                        setdataUser(prev => prev.filter(item => item._id !== record._id));

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

    const activeLoyaltyCount = useMemo(() => {
        if (!Array.isArray(dataUser) || dataUser.length === 0) return 0;

        const loyaltyMembers = dataUser.filter(user => {
            const ordersCount = (user.history_orders || []).length;
            return ordersCount > 0;
        });

        return loyaltyMembers.length;
    }, [dataUser]);

    const formatShortUSD = (value) => {
        if (!value || isNaN(value)) return "$0";

        const num = Number(value);

        if (num >= 1_000_000) {
            return `$${(num / 1_000_000).toFixed(1)}M`;
        } else if (num >= 1_000) {
            return `$${(num / 1_000).toFixed(1)}K`;
        }

        return `$${num.toFixed(2)}`;
    };

    const topSpender = useMemo(() => {
        if (!Array.isArray(dataUser) || dataUser.length === 0) return null;

        return dataUser.reduce((highest, currentUser) => {
            const currentTotal = (currentUser.history_orders || []).reduce((sum, order) => {
                return sum + (Number(order.totalPrice) || 0);
            }, 0);

            const updatedUser = {
                ...currentUser,
                totalSpent: currentTotal
            };

            if (!highest) return updatedUser;

            return currentTotal > (highest.totalSpent || 0) ? updatedUser : highest;
        }, null);
    }, [dataUser]);

    const handleExportPDF = () => {
        const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

        doc.setFontSize(18);
        doc.text("THE CRUMB & BEAN - CUSTOMER REPORT", 14, 20);

        doc.setFontSize(10);
        doc.text(`Exported date: ${new Date().toLocaleDateString('vi-VN')}`, 14, 26);

        const tableHeaders = [["STT", "Full Name", "Email", "Status", "Total Orders", "LTV Revenue"]];

        const tableRows = (dataUser || []).map((user, index) => {
            const ordersCount = (user.history_orders || []).length;
            const totalRevenue = (user.history_orders || []).reduce((sum, order) => sum + (order.totalPrice || 0), 0);

            let tier = "New Member";
            if (ordersCount > 0 && ordersCount <= 30) tier = "Occasional";
            else if (ordersCount > 30 && ordersCount <= 60) tier = "High Frequency";
            else if (ordersCount > 60) tier = "Top Tier";

            return [
                index + 1,
                user.full_name || user.username || "N/A",
                user.email || "N/A",
                tier.toUpperCase(),
                `${ordersCount} Orders`,
                new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalRevenue)
            ];
        });

       
        autoTable(doc, {
            startY: 32,
            head: tableHeaders,
            body: tableRows,
            theme: 'striped',
            headStyles: { fillColor: [239, 61, 120] },
            styles: { fontSize: 9, cellPadding: 3 },
            columnStyles: {
                0: { cellWidth: 12 }, 
                5: { fontStyle: 'bold' }
            }
        });

        doc.save("TheCrumbAndBean_Customer_List.pdf");
    };


    const columns = [
        {
            title: 'CUSTOMER',
            width: 200,
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
                            {record.username}
                        </p>
                        <p className="text-xs text-gray-400 m-0 mt-0.5 font-medium">
                            ID: {record._id.toString().slice(0,8)}
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
            width: 160,
            dataIndex: 'totalPrice',
            key: 'history_orders',
            render: (_, record) => {
                const totalProductsCount = record.totalPrice * 2

                let toptier = "New Member";
                let badgeClass = "text-gray-500 bg-gray-50 border-gray-200";

                if(totalProductsCount > 40 && totalProductsCount <= 100){
                    toptier = "Cool";
                    badgeClass = "text-blue-600 bg-blue-50 border-blue-200";
                } else if (totalProductsCount > 100 && totalProductsCount <= 500) {
                    toptier = "Occasional ";
                    badgeClass = "text-orange-600 bg-orange-50 border-orange-200";
                } else if (totalProductsCount > 500 && totalProductsCount <= 1500) {
                    toptier = "High Frequency";
                    badgeClass = "text-green-600 bg-green-50 border-green-200";
                } else if (totalProductsCount > 1500) {
                    toptier = "Top Tier";
                    badgeClass = "text-red-600 bg-red-50 border-red-200 font-bold";
                }

                return (
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold border uppercase tracking-wider ${badgeClass}`}>
                        {toptier}
                    </span>
                );
            }
        },
        {
            title: 'LOYALTY POINTS',
            width: 160,
            dataIndex: 'totalPrice',
            key: 'points',
            render: (_, record) => {
                if (!record.totalPrice || record.totalPrice === 0) {
                    return (
                        <div className="flex items-center gap-1.5 font-bold text-sm text-gray-800">
                            <span className="text-base text-amber-500">⭐</span>
                            <span>0</span>
                        </div>
                    )
                }

                const totalProductsCount = record.totalPrice * 2

                return (
                    <div className="flex items-center gap-1.5 font-bold text-sm text-gray-800">
                        <span className="text-base text-amber-500">⭐</span>
                        <span>{totalProductsCount.toFixed(0)}</span>
                    </div>
                );
            }
        },
        {
            title: 'STATUS',
            width: 140,
            key: 'status',
            dataIndex: 'status',
            render: (status) => {

                const currentStatus = status || 'offline';
                const isOnline = currentStatus === 'online';

                return (
                    <Tag
                        color={isOnline ? 'success' : 'error'}
                        className={`rounded-full px-3 py-0.5 font-bold uppercase text-[11px] tracking-wider border-none shadow-xs ${isOnline ? 'animate-pulse' : ''
                            }`}
                    >
                        {/* Thêm một dấu chấm tròn nhỏ tinh tế trước chữ */}
                        <span className="inline-block w-1.5 h-1.5 rounded-full mr-1.5 bg-current" />
                        {currentStatus}
                    </Tag>
                );
            }
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

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-[#EE2B6C] m-0">Customer Directory</h1>
                    <p className="text-xs sm:text-sm text-gray-400 m-0 mt-1 font-medium">
                        Managing {data.length} members of Crumb & Bean Rewards
                    </p>
                </div>

                <Button
                    onClick={handleExportPDF}
                    className="flex! items-center gap-2 px-4 py-2 bg-white border border-[#EF3D78] rounded-md text-[#EF3D78] font-semibold hover:text-white! hover:bg-[#EF3D78]! hover:border-[#EF3D78]! transition-all cursor-pointer shadow-sm w-full sm:w-auto justify-center"
                >
                    <DownloadOutlined className="text-base" />
                    <span className="text-xs sm:text-sm">Export List</span>
                </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                <div className="p-5 flex items-center gap-4 bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-gray-100">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center text-xl border border-blue-100 shrink-0">
                        <TeamOutlined />
                    </div>
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 m-0">{dataUser.length}</h2>
                        <p className="text-[11px] font-bold tracking-wider text-gray-400 m-0 mt-0.5">TOTAL CUSTOMERS</p>
                    </div>
                </div>

                <div className="p-5 flex items-center gap-4 bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-gray-100">
                    <div className="p-3 bg-pink-50 text-[#EE2B6C] rounded-lg flex items-center justify-center text-xl border border-pink-100 shrink-0">
                        <TagOutlined />
                    </div>
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 m-0">{activeLoyaltyCount}</h2>
                        <p className="text-[11px] font-bold tracking-wider text-gray-400 m-0 mt-0.5">LOYALTY MEMBERS</p>
                    </div>
                </div>

                <div className="p-5 flex items-center gap-4 bg-linear-to-br from-amber-50 to-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-amber-100 transition-all duration-300 hover:shadow-md relative overflow-hidden group">
                    <div className="p-3 bg-amber-500 text-white rounded-lg flex items-center justify-center text-xl shrink-0 shadow-sm shadow-amber-200">
                        <TrophyOutlined className="animate-bounce" style={{ animationDuration: '3s' }} />
                    </div>

                    <div className="min-w-0 flex-1">
                        <h2 className="text-xl sm:text-2xl font-black text-amber-600 m-0 truncate" title={new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(topSpender?.totalSpent || 0)}>
                            {topSpender?.totalSpent ? formatShortUSD(topSpender.totalSpent) : "$0.00"}
                            {console.log(topSpender)}
                        </h2>

                        <p className="text-[11px] font-bold tracking-wider text-gray-500 m-0 mt-0.5 uppercase truncate">
                            👑 {topSpender?.username}
                        </p>
                    </div>

                    <span className="absolute -top-1 -right-1 bg-amber-500 text-white font-extrabold text-[8px] px-2 py-1 rounded-bl-lg uppercase tracking-widest scale-90">
                        TOP VIP
                    </span>
                </div>

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

                <div className="sm:absolute bottom-7 left-6 text-xs sm:text-sm text-gray-400 font-medium mt-2 sm:mt-0 text-center sm:text-left">
                    Showing 1 to 5 of {filteredData.length} records
                </div>
            </div>

        </div>
    )
}

export default Customers;