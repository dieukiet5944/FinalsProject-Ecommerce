import React, { useState, useEffect, useMemo } from 'react'
import { PoundCircleOutlined, ShoppingCartOutlined, UserAddOutlined, ThunderboltOutlined, ArrowRightOutlined, ExceptionOutlined, DollarOutlined, UserOutlined, DownOutlined } from '@ant-design/icons'
import { Cascader, Row, Col, Progress, Space, DatePicker, Spin, message, Avatar, Typography, Card, Flex, Button, Dropdown } from 'antd'
import axios from 'axios';

import WeeklySalesChart from './WeeklySalesChart';

const twoColors = {
    '0%': '#108ee9',
    '100%': '#87d068',
};
const conicColors = {
    '0%': '#87d068',
    '50%': '#ffe58f',
    '100%': '#ffccc7',
};

const mockWeeklySales = [
    { day: 'MON', sales: 1200, isPeak: false },
    { day: 'TUE', sales: 1900, isPeak: false },
    { day: 'WED', sales: 1500, isPeak: false },
    { day: 'THU', sales: 2200, isPeak: false },
    { day: 'FRI', sales: 3100, isPeak: true },
    { day: 'SAT', sales: 2400, isPeak: false },
    { day: 'SUN', sales: 2800, isPeak: false },
];

const Dashboard = ({ name }) => {

    const [dataUser, setDataUser] = useState([]);
    const [dataProduct, setDataProduct] = useState([]);
    const [historyOrders, setHistoryOrders] = useState([]);
    const [loading, setLoading] = useState(false);

    const { Text: AntText } = Typography;

    // ==========================================
    // 1. CÁC HOOK LUÔN LUÔN ĐẶT Ở TRÊN CÙNG COMPONENT
    // ==========================================

    useEffect(() => {
        const getAlldata = async () => {
            setLoading(true);
            try {
                const resUsers = await axios.get("http://localhost:8080/users");
                const resProducts = await axios.get("http://localhost:8080/products");
                const resOrders = await axios.get("http://localhost:8080/orders");

                const usersArray = resUsers.data?.data || [];
                const productsArray = resProducts.data?.data || [];
                const ordersArray = resOrders.data?.data || [];

                if (Array.isArray(ordersArray)) {
                    const formattedOrders = ordersArray.map((order) => {
                        const itemsInOrder = order.items || [];
                        const calculatedTotal = itemsInOrder.reduce((sum, item) => {
                            return sum + ((item.qty || 0) * (item.price || 0));
                        }, 0);

                        return {
                            ...order,
                            key: order._id,
                            sumOrders: order.totalPrice || calculatedTotal,
                        };
                    });
                    setHistoryOrders(formattedOrders);
                }

                setDataUser(usersArray);
                setDataProduct(productsArray);
                console.log("Success to get data from server");
            } catch (error) {
                message.error("Error Server 500 !!");
            } finally {
                setLoading(false);
            }
        };

        getAlldata();
    }, []);

    // 2. Tính tổng doanh thu bằng useMemo (Trả về kiểu số để dễ tính toán bắc cầu)
    const totalRevenueNumber = useMemo(() => {
        return historyOrders
            .filter(order => order.status === 'Completed')
            .reduce((sum, order) => sum + (Number(order.sumOrders) || 0), 0);
    }, [historyOrders]);

    // Hàm chuyển đổi doanh thu sang chuỗi hiển thị giao diện (Chỉ gọi khi cần render)
    const formattedTotalRevenue = useMemo(() => {
        return totalRevenueNumber.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }, [totalRevenueNumber]);

    // 3. Tính toán số đơn hàng đang xử lý
    const pendingOrdersCount = useMemo(() => {
        return historyOrders.filter(order => order.status === 'Processing').length;
    }, [historyOrders]);

    // 4. Tính toán số khách hàng online
    const activeCustomersCount = useMemo(() => {
        return dataUser.filter(user => user.status === 'online').length;
    }, [dataUser]);

    // 5. Tính toán Giá trị đơn hàng trung bình (AOV) - SỬA LỖI CHIA CHUỖI KHÔNG BỊ NaN
    const calculateAOV = useMemo(() => {
        const completedOrders = historyOrders.filter(order => order.status === 'Completed');
        if (completedOrders.length === 0) return "0.00";

        // Lấy số thuần túy chia cho số lượng đơn hàng
        return (totalRevenueNumber / completedOrders.length).toFixed(2);
    }, [historyOrders, totalRevenueNumber]);

    // 6. Tính toán Top 5 sản phẩm bán chạy nhất
    const topSellingItem = useMemo(() => {
        const imageLookup = {};
        if (dataProduct && dataProduct.length > 0) {
            dataProduct.forEach(p => {
                const folder = p.category ? p.category.toLowerCase() : 'unknown';
                const key = p.name ? p.name.toLowerCase().trim() : '';
                if (key) {
                    imageLookup[key] = `/product/${folder}/${p.image}`;
                }
            });
        }

        const itemCounts = {};

        historyOrders
            .filter(order => order.status === 'Completed')
            .forEach(order => {
                order.items?.forEach(item => {
                    if (!item.name) return;
                    const itemKey = item.name;
                    if (!itemCounts[itemKey]) {
                        itemCounts[itemKey] = {
                            name: item.name,
                            qty: 0,
                            price: item.price || 0,
                            image: imageLookup[item.name.toLowerCase().trim()] || ''
                        };
                    }
                    itemCounts[itemKey].qty += Number(item.qty || 0);
                });
            });

        return Object.values(itemCounts)
            .sort((a, b) => b.qty - a.qty)
            .slice(0, 5);
    }, [historyOrders, dataProduct]);

    // Component vẽ nhãn đỉnh cho biểu đồ
    const CustomLabel = (props) => {
        const { x, y, value, payload } = props;
        if (payload.day === 'FRI') {
            return (
                <g>
                    <foreignObject x={x - 30} y={y - 45} width={65} height={26}>
                        <div className="bg-[#1A1518] text-[9px] text-white font-black tracking-wider px-1.5 py-0.5 rounded-md flex items-center justify-center gap-0.5 shadow-sm">
                            <span className="text-[7px]">▲</span> PEAK
                        </div>
                    </foreignObject>
                    <text x={x} y={y - 8} fill="#EE2C6D" className="text-[11px] font-black" textAnchor="middle">
                        ${(value / 1000).toFixed(1)}k
                    </text>
                </g>
            );
        }
        return null;
    };

    const items = [
        { key: '7', label: 'Last 7 Days' },
        { key: '30', label: 'Last 30 Days' },
        { key: '12', label: 'Last Year' },
    ];

    // ==========================================
    // 2. CÁC CÂU LỆNH CHẶN RENDER (IF RETURN) LUÔN LUÔN ĐẶT DƯỚI HOOK
    // ==========================================
    if (loading) {
        return <div className="p-6 bg-white rounded-2xl h-80 flex items-center justify-center text-gray-400">Loading chart...</div>;
    }

    return (
        <div className="p-4 sm:p-6 md:p-9 flex flex-col gap-6 min-h-screen bg-gray-50/50">

            <div>
                <h1 className="text-xl sm:text-2xl font-bold text-[#EE2B6C] m-0">Dashboard Overview</h1>
                <p className="text-xs sm:text-sm text-gray-400 m-0 mt-1 font-medium">
                    Welcome back, {name}! Here's the buzz from your store today
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">

                <div className="p-5 flex flex-col gap-3 bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.04)] border border-gray-100">
                    <div className="flex justify-between items-center">
                        <DollarOutlined className="text-lg p-2.5 rounded-lg bg-green-50 text-green-600 border border-green-100 shrink-0" />
                    </div>
                    <p className="text-xs font-bold tracking-wider text-gray-400 m-0">TOTAL REVENUE</p>
                    <h2 className="text-lg sm:text-xl font-bold text-green-700 bg-green-50/60 px-3 py-1 rounded-md m-0 inline-block w-fit">
                        ${totalRevenueNumber}
                    </h2>
                </div>

                <div className="p-5 flex flex-col gap-3 bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.04)] border border-gray-100">
                    <div className="flex justify-between items-center">
                        <ShoppingCartOutlined className="text-lg p-2.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 shrink-0" />
                    </div>
                    <p className="text-xs font-bold tracking-wider text-gray-400 m-0">PENDING ORDERS</p>
                    <h2 className="text-lg sm:text-xl font-bold text-blue-700 bg-blue-50/60 px-3 py-1 rounded-md m-0 inline-flex items-center gap-2 w-fit">
                        {pendingOrdersCount} <ExceptionOutlined className="text-blue-400 text-sm" />
                    </h2>
                </div>

                <div className="p-5 flex flex-col gap-3 bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.04)] border border-gray-100">
                    <div className="flex justify-between items-center">
                        <UserAddOutlined className="text-lg p-2.5 rounded-lg bg-pink-50 text-[#EF3D78] border border-pink-100 shrink-0" />
                    </div>
                    <p className="text-xs font-bold tracking-wider text-gray-400 m-0">ACTIVE CUSTOMERS</p>
                    <h2 className="text-lg sm:text-xl font-bold text-[#EE2B6C] bg-pink-50/60 px-3 py-1 rounded-md m-0 inline-flex items-center gap-2 w-fit">
                        {activeCustomersCount} <UserOutlined className="text-pink-400 text-sm" />
                    </h2>
                </div>

                <div className="p-5 flex flex-col gap-3 bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.04)] border border-gray-100">
                    <div className="flex justify-between items-center">
                        <ThunderboltOutlined className="text-lg p-2.5 rounded-lg bg-orange-50 text-orange-500 border border-orange-100 shrink-0" />
                    </div>
                    <p className="text-xs font-bold tracking-wider text-gray-400 m-0">AOV</p>
                    <h2 className="text-lg sm:text-xl font-bold text-orange-600 bg-orange-50/60 px-3 py-1 rounded-md m-0 inline-block w-fit">
                        $ {calculateAOV}
                    </h2>
                </div>

            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                <div className="lg:col-span-2 flex flex-col bg-white p-5 sm:p-6 rounded-xl border border-gray-100 shadow-[0_4px_12px_rgba(0,0,0,0.02)] gap-6">

                    <WeeklySalesChart />

                </div>

                <div className="right-column-scroll bg-white p-2 rounded-xl border border-gray-100 shadow-[0_4px_12px_rgba(0,0,0,0.02)] h-fit">
                    <Card
                        title={<span className="text-base sm:text-lg font-bold text-gray-800">Top Selling Items</span>}
                        variant="borderless"
                        className="w-full"
                    >
                        <div className="flex flex-col gap-4">
                            {topSellingItem.map((item, index) => (
                                <div
                                    key={index}
                                    className="flex justify-between items-center pb-4 border-b border-gray-100 last:border-0 last:pb-0"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <Avatar
                                            src={item.image}
                                            shape="square"
                                            size={42}
                                            className="rounded-lg border border-gray-100 shrink-0 object-cover"
                                        />
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-gray-800 m-0 truncate">
                                                {item.name}
                                            </p>
                                            <p className="text-xs text-gray-400 m-0 mt-0.5">
                                                {item.qty} sales
                                            </p>
                                        </div>
                                    </div>

                                    <span className="text-base font-bold text-red-500 shrink-0 pl-2">
                                        ${item.price}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}


export default Dashboard