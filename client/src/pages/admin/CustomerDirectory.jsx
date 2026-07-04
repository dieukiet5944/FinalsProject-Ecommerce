import React, { useState, useEffect, useMemo } from 'react'
import { CrownFilled ,StarFilled, DownloadOutlined, UserAddOutlined, TeamOutlined, TagOutlined, TrophyOutlined, DollarOutlined, FireOutlined, FunnelPlotOutlined, MoreOutlined, ProfileOutlined, DeleteOutlined, AuditOutlined } from '@ant-design/icons'
import { Modal, Table, Tag, Avatar, Space, Button, Dropdown, Spin, message } from 'antd'
import { getOrdersApi } from '../../services/orderService.js'
import { getUsersApi, deleteUserApi } from '../../services/userService.js'

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
                    getUsersApi(),
                    getOrdersApi()
                ]);


                const usersResult = resUsers?.data;

                const ordersResult = resOrders?.data;



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


                if (mixedUsers && Array.isArray(mixedUsers)) {
                    setdataUser(mixedUsers);
                } else {
                    console.log("The data User data structure is invalid!");
                    setdataUser([]);
                }

                if (usersResult && Array.isArray(usersResult)) {
                    setData(usersResult);
                } else {
                    console.log("The User data structure is invalid!");
                    setData([]);
                }

                if (ordersResult && Array.isArray(ordersResult)) {
                    setdataOrder(ordersResult);
                } else {
                    console.log("The Order data structure is invalid!");
                    setdataOrder([]);
                }

            } catch (error) {
                console.error("System connection error:", error);
                message.error("Unable to connect to the data server! Please try again later.");

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
        Modal.info({
            title: (
                <div className="flex flex-col gap-0.5">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">User Management</span>
                    <span className="text-base font-bold text-gray-800">Customer Profile</span>
                </div>
            ),
            width: 380,
            centered: true,
            okText: 'Close',
            okButtonProps: {
                className: "rounded-xl font-semibold border-gray-200 hover:bg-gray-50 transition-colors"
            },
            className: "max-w-[calc(100vw-32px)]",
            content: (
                <div className="pt-4 flex flex-col gap-5 text-sm">

                    <div className="flex flex-col items-center text-center bg-gray-50/50 p-4 rounded-xl border border-gray-100/70">
                        <Avatar
                            src={`/product/avtusers/${user?.avatar || 'none-avt.png'}`}
                            size={84}
                            className="border-2 border-white shadow-md object-cover rounded-full"
                        />
                        <h3 className="text-base font-bold text-gray-800 mt-2.5 mb-1.5 tracking-wide">
                            {user?.username}
                        </h3>

                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase border ${user?.role === 'admin'
                            ? 'bg-amber-50 text-amber-600 border-amber-100'
                            : 'bg-blue-50 text-blue-600 border-blue-100'
                            }`}>
                            {user?.role}
                        </span>
                    </div>

                    <div className="bg-white p-1 rounded-xl space-y-3 text-xs sm:text-sm">
                        <div className="flex justify-between items-center pb-2.5 border-b border-gray-100">
                            <span className="text-gray-400 font-medium">Email Address</span>
                            <span className="text-gray-800 font-semibold max-w-45 truncate text-right">
                                {user?.email}
                            </span>
                        </div>

                        <div className="flex justify-between items-center pb-2.5 border-b border-gray-100">
                            <span className="text-gray-400 font-medium">Total Orders</span>
                            <span className="text-gray-800 font-bold font-mono flex items-center gap-1">
                                {user?.history_orders?.length || 0}
                                <AuditOutlined className="text-gray-300 text-xs" />
                            </span>
                        </div>

                        <div className="flex justify-between items-center pb-2.5 border-b border-gray-100">
                            <span className="text-gray-400 font-medium">Joined Date</span>
                            <span className="text-gray-700 font-medium font-mono">
                                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : "N/A"}
                            </span>
                        </div>

                        <div className="flex justify-between items-center pt-0.5">
                            <span className="text-gray-400 font-medium">Account Status</span>
                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${user?.status === "online"
                                ? "bg-green-50 text-green-600 border-green-100"
                                : "bg-red-50 text-red-600 border-red-100"
                                }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${user?.status === "online" ? "bg-green-500" : "bg-red-500"}`}></span>
                                {user?.status || 'offline'}
                            </span>
                        </div>
                    </div>

                </div>
            ),
        });
    };


    const handleDeleteUser = (record) => {
        Modal.confirm({
            title: 'Confirm user disabling?',
            content: 'This user is data will be invalidated due to some system breach.',
            okText: 'Disable immediately',
            okType: 'danger',
            cancelText: 'Cancel',
            centered: true,
            onOk: async () => {
                try {
                    setLoading(true);
                    const response = await deleteUserApi(record._id);

                    if (response?.success || response?.data) {

                        setdataUser(prev => prev.filter(item => item._id !== record._id));

                        message.success("Disabled user successfully!");
                    } else {
                        throw new Error("Disabling user failed! Please try again later.");
                    }
                } catch (error) {
                    console.error("Error disable user:", error);
                    message.error(error.response?.data?.message || "Cannot disable user! Please try again later.");
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

    const calculateRetentionRate = useMemo(() => {
        if (!Array.isArray(dataOrder) || dataOrder.length === 0) return 0;

        const customerOrderCounts = {};

        dataOrder.forEach(order => {
            if (order.customerId && order.status === 'Completed') {
                const customerIdStr = order.customerId.toString();

                customerOrderCounts[customerIdStr] = (customerOrderCounts[customerIdStr] || 0) + 1;
            }
        });

        const countsArray = Object.values(customerOrderCounts);

        const totalCustomersOrdered = countsArray.length;

        const totalCustomerMoreThanOnce = countsArray.filter(count => count >= 2).length;

        const retentionRate = totalCustomersOrdered === 0 ? 0 : (totalCustomerMoreThanOnce / totalCustomersOrdered) * 100;

        return retentionRate.toFixed(0);
    }, [dataOrder]);

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
            width: 220,
            key: 'users',
            render: (_, record) => (
                <div className="flex items-center gap-3 py-0.5">
                    <Avatar
                        src={`/product/avtusers/${record?.avatar || 'none-avt.png'}`}
                        size={40}
                        className="border border-gray-100 shadow-3xs shrink-0 object-cover rounded-full"
                    />
                    <div className="min-w-0">
                        <p className="font-bold text-gray-800 m-0 truncate text-sm leading-tight">
                            {record.username}
                        </p>
                        <p className="text-[10px] font-mono text-gray-400 m-0 mt-1 uppercase tracking-wider">
                            ID: {String(record._id).slice(-6).toUpperCase()}
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
                <span className="text-gray-600 text-xs md:text-sm font-medium block truncate max-w-50">
                    {email}
                </span>
            )
        },
        {
            title: 'TIER RANK',
            width: 160,
            dataIndex: 'totalPrice',
            key: 'history_orders',
            render: (_, record) => {
                const totalProductsCount = (record.totalPrice || 0) * 2;

                let toptier = "New Member";
                let badgeStyle = "bg-gray-50 text-gray-500 border-gray-200";

                if (totalProductsCount > 40 && totalProductsCount <= 100) {
                    toptier = "Cool";
                    badgeStyle = "bg-blue-50 text-blue-600 border-blue-100";
                } else if (totalProductsCount > 100 && totalProductsCount <= 500) {
                    toptier = "Occasional";
                    badgeStyle = "bg-orange-50 text-orange-600 border-orange-100";
                } else if (totalProductsCount > 500 && totalProductsCount <= 1500) {
                    toptier = "High Frequency";
                    badgeStyle = "bg-green-50 text-green-600 border-green-100";
                } else if (totalProductsCount > 1500) {
                    toptier = "Top Tier";
                    badgeStyle = "bg-red-50 text-red-600 border-red-100 font-bold";
                }

                return (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider ${badgeStyle}`}>
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
                const totalProductsCount = (record.totalPrice || 0) * 2;
                return (
                    <div className="flex items-center gap-1.5 font-bold text-xs text-amber-400 md:text-sm font-mono">
                        <StarFilled className="text-amber-400 text-xs md:text-sm" />
                        <span className="text-gray-600">{totalProductsCount.toFixed(0)}</span>
                    </div>
                );
            }
        },
        {
            title: 'STATUS',
            width: 130,
            key: 'status',
            dataIndex: 'status',
            render: (status) => {
                const currentStatus = status || 'offline';
                const isOnline = currentStatus === 'online';

                return (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border ${isOnline
                        ? 'bg-green-50 text-green-600 border-green-100'
                        : 'bg-red-50 text-red-400 border-red-200'
                        } ${isOnline ? 'animate-pulse' : ''}`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isOnline ? 'bg-green-500' : 'bg-red-400'}`} />
                        {currentStatus}
                    </span>
                );
            }
        },
        {
            title: '',
            width: 60,
            align: 'center',
            key: 'action',
            render: (_, record) => {
                const actionItems = [
                    {
                        key: 'viewprofile',
                        label: <span className="text-sm text-gray-700 font-medium">View Info</span>,
                        icon: <ProfileOutlined className="text-gray-400 text-sm" />,
                        onClick: () => handleViewProfile(record)
                    },
                    { type: 'divider' },
                    {
                        key: 'delete',
                        label: <span className="text-sm text-red-600 font-medium">Disable Account</span>,
                        icon: <DeleteOutlined className="text-red-400 text-sm" />,
                        danger: true,
                        onClick: () => handleDeleteUser(record)
                    },
                ];

                return (
                    <Dropdown menu={{ items: actionItems }} trigger={['click']} placement="bottomRight">
                        <Button
                            type="text"
                            shape="circle"
                            className="flex items-center justify-center hover:bg-gray-100! text-gray-400 hover:text-gray-600 transition-colors"
                            icon={<MoreOutlined className="text-lg" />}
                        />
                    </Dropdown>
                );
            }
        }
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
                        </h2>

                        <p className="text-[11px] font-bold tracking-wider text-amber-500 m-0 mt-0.5 uppercase truncate">
                            <CrownFilled className="text-amber-500 mr-1" /> {topSpender?.username}
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
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 m-0">{calculateRetentionRate}%</h2>
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

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                <Spin spinning={loading}>
                    <Table
                        rowClassName={(record) => record.disabled ? 'opacity-40 bg-gray-50/50 pointer-events-none' : ''}
                        columns={columns}
                        rowKey="_id"
                        dataSource={filteredData}
                        size="middle"
                        scroll={{ x: 800 }}
                        pagination={{
                            total: filteredData.length,
                            pageSize: 5,
                            showSizeChanger: false,
                            placement: ['bottomRight'],
                            className: "px-6 py-4 border-t border-gray-50 !m-0"
                        }}
                        className="w-full [&_.ant-table-thead_th]:bg-transparent [&_.ant-table-thead_th]:text-gray-400 [&_.ant-table-thead_th]:text-[11px] [&_.ant-table-thead_th]:font-bold [&_.ant-table-thead_th]:tracking-wider [&_.ant-table-thead_th]:uppercase"
                    />
                </Spin>

                <div className="px-6 py-4 border-t border-gray-50 bg-gray-50/40 flex items-center">
                    <div className="text-xs text-gray-400 font-medium">
                        Showing <span className="font-semibold text-gray-600">1</span> to{' '}
                        <span className="font-semibold text-gray-600">{Math.min(5, filteredData.length)}</span> of{' '}
                        <span className="font-semibold text-gray-600">{filteredData.length}</span> records
                    </div>
                </div>
            </div>

        </div>
    )
}

export default Customers;