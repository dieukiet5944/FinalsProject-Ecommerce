import React, { useState, useEffect, useMemo } from 'react'
import { PoundCircleOutlined, ShoppingCartOutlined, UserAddOutlined, ThunderboltOutlined, ArrowRightOutlined, ExceptionOutlined, DollarOutlined, UserOutlined } from '@ant-design/icons'
import { Cascader, Row, Col, Progress, Space, DatePicker, Spin, message, Avatar, Typography, Card, Flex } from 'antd'
import axios from 'axios';



const twoColors = {
    '0%': '#108ee9',
    '100%': '#87d068',
};
const conicColors = {
    '0%': '#87d068',
    '50%': '#ffe58f',
    '100%': '#ffccc7',
};

const Dashboard = ({ name }) => {

    const [dataUser, setDataUser] = useState([])
    const [dataProduct, setDataProduct] = useState([])
    const [historyOrders, setHistoryOrders] = useState([])
    const [loading, setLoading] = useState(false)

    const { Text: AntText } = Typography;

    useEffect(() => {

        const getAlldata = async () => {
            setLoading(true)

            try {

                const resUsers = await axios.get("http://localhost:8080/users");

                const resProducts = await axios.get("http://localhost:8080/products");

                const resOrders = await axios.get("http://localhost:8080/orders");

                const usersArray = resUsers.data?.data || [];
                const productsArray = resProducts.data?.data || [];
                const ordersArray = resOrders.data?.data || [];

                if (Array.isArray(ordersArray)) {
                    const formattedOrders = ordersArray.map((order, index) => {

                        const itemsInOrder = order.items || [];
                        const calculatedTotal = itemsInOrder.reduce((sum, item) => {
                            return sum + ((item.qty || 0) * (item.price || 0));
                        }, 0);

                        return {
                            ...order,
                            key: order._id,
                            sumOrders: order.totalPrice || calculatedTotal, // Ưu tiên totalPrice từ DB, nếu không có thì dùng calculatedTotal
                        };
                    });

                    // Cập nhật mảng đơn hàng đã xử lý vào State quản lý orders
                    setHistoryOrders(formattedOrders);
                }

                setDataUser(usersArray)

                setDataProduct(productsArray);

                console.log("Success to get data from server")

            } catch (error) {
                message.error("Error Server 500 !!")

            } finally {
                setLoading(false)
            }
        }

        getAlldata()
    }, [])

    const calculateTotalRevenue = () => {
        const completedOrders = historyOrders.filter(order => order.status === 'Completed');

        const total = completedOrders.reduce((sum, order) => {
            return sum + (Number(order.sumOrders) || 0);
        }, 0);

        return total.toLocaleString('en-US', { minimumFractionDigits: 2 });
    };

    const calculatePendingOrders = () => {
        const pendingOrders = historyOrders.filter(order => order.status === 'Processing');

        return pendingOrders.length;
    };

    const calculateActiveCus = () => {
        const activeCus = dataUser.filter(order => order.status === 'online');

        return activeCus.length;
    };

    const calculateAOV = useMemo(() => {

        const aovOrders = historyOrders.filter(order => order.status === 'Completed');

        if (aovOrders.length === 0) return 0;

        return (calculateTotalRevenue() / aovOrders.length).toFixed(2);

    }, [historyOrders]);

    const topSellingItem = useMemo(() => {
        const imageLookup = {};
        if (dataProduct && dataProduct.length > 0) {
            dataProduct.forEach(p => {
                const folder = p.category.toLowerCase();
                const key = p.name.toLowerCase().trim();

                imageLookup[key] = `/product/${folder}/${p.image}`;
            });
        }

        const itemCounts = {};


        historyOrders
            .filter(order => order.status === 'Completed')
            .forEach(order => {
                order.items?.forEach(item => {
                    if (!itemCounts[item.name]) {
                        itemCounts[item.name] = {
                            name: item.name,
                            qty: 0,
                            price: item.price,
                            image: imageLookup[item.name.toLowerCase().trim()]
                        };
                    }
                    itemCounts[item.name].qty += Number(item.qty || 0);
                });
            });
        return Object.values(itemCounts)
            .sort((a, b) => b.qty - a.qty)
            .slice(0, 5);
    }, [historyOrders, dataProduct]);

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
                        $ {calculateTotalRevenue()}
                    </h2>
                </div>

                <div className="p-5 flex flex-col gap-3 bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.04)] border border-gray-100">
                    <div className="flex justify-between items-center">
                        <ShoppingCartOutlined className="text-lg p-2.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 shrink-0" />
                    </div>
                    <p className="text-xs font-bold tracking-wider text-gray-400 m-0">PENDING ORDERS</p>
                    <h2 className="text-lg sm:text-xl font-bold text-blue-700 bg-blue-50/60 px-3 py-1 rounded-md m-0 inline-flex items-center gap-2 w-fit">
                        {calculatePendingOrders()} <ExceptionOutlined className="text-blue-400 text-sm" />
                    </h2>
                </div>

                <div className="p-5 flex flex-col gap-3 bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.04)] border border-gray-100">
                    <div className="flex justify-between items-center">
                        <UserAddOutlined className="text-lg p-2.5 rounded-lg bg-pink-50 text-[#EF3D78] border border-pink-100 shrink-0" />
                    </div>
                    <p className="text-xs font-bold tracking-wider text-gray-400 m-0">ACTIVE CUSTOMERS</p>
                    <h2 className="text-lg sm:text-xl font-bold text-[#EE2B6C] bg-pink-50/60 px-3 py-1 rounded-md m-0 inline-flex items-center gap-2 w-fit">
                        {calculateActiveCus()} <UserOutlined className="text-pink-400 text-sm" />
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

                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <h2 className="text-base sm:text-lg font-bold text-gray-800 m-0">Weekly Sales Performance</h2>
                        <Space align="center" className="w-full sm:w-auto">
                            <DatePicker
                                picker="week"
                                placeholder="Select week"
                                onChange={(date, dateString) => {
                                    console.log("Selected week:", dateString);
                                }}
                                className="w-full sm:w-auto"
                            />
                        </Space>
                    </div>

                    <div className="flex flex-col gap-8 py-2">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                            <div className="flex flex-col items-center gap-2 bg-gray-50/50 p-3 rounded-xl border border-gray-100/50">
                                <Progress
                                    type="circle"
                                    percent={90}
                                    strokeColor={twoColors}
                                    strokeWidth={8} // Độ dày thanh progress vừa vặn cho mọi màn hình
                                    className="w-20 h-20 sm:w-24 sm:h-24" // Tailwind sẽ tự động điều phối kích thước SVG cực kỳ mượt mà
                                />
                                <span className="text-xs sm:text-sm font-semibold text-gray-600">Monday</span>
                            </div>
                            <div className="flex flex-col items-center gap-2 bg-gray-50/50 p-3 rounded-xl border border-gray-100/50">
                                <Progress
                                    type="circle"
                                    percent={93}
                                    strokeColor={conicColors}
                                    strokeWidth={8}
                                    className="w-20 h-20 sm:w-24 sm:h-24"
                                />
                                <span className="text-xs sm:text-sm font-semibold text-gray-600">Tuesday</span>
                            </div>
                            <div className="flex flex-col items-center gap-2 bg-gray-50/50 p-3 rounded-xl border border-gray-100/50">
                                <Progress
                                    type="circle"
                                    percent={93}
                                    strokeColor={conicColors}
                                    strokeWidth={8}
                                    className="w-20 h-20 sm:w-24 sm:h-24"
                                />
                                <span className="text-xs sm:text-sm font-semibold text-gray-600">Wednesday</span>
                            </div>
                            <div className="flex flex-col items-center gap-2 bg-gray-50/50 p-3 rounded-xl border border-gray-100/50">
                                <Progress
                                    type="circle"
                                    percent={93}
                                    strokeColor={conicColors}
                                    strokeWidth={8}
                                    className="w-20 h-20 sm:w-24 sm:h-24"
                                />
                                <span className="text-xs sm:text-sm font-semibold text-gray-600">Thursday</span>
                            </div>
                        </div>

                        {/* Hàng sau: Thứ 6 đến Chủ nhật */}
                        <div className="grid grid-cols-3 gap-3 text-center">
                            <div className="flex flex-col items-center gap-2 bg-gray-50/50 p-3 rounded-xl border border-gray-100/50">
                                <Progress
                                    type="circle"
                                    percent={93}
                                    strokeColor={conicColors}
                                    strokeWidth={8}
                                    className="w-20 h-20 sm:w-24 sm:h-24"
                                />
                                <span className="text-xs sm:text-sm font-semibold text-gray-600">Friday</span>
                            </div>
                            <div className="flex flex-col items-center gap-2 bg-gray-50/50 p-3 rounded-xl border border-gray-100/50">
                                <Progress
                                    type="circle"
                                    percent={93}
                                    strokeColor={conicColors}
                                    strokeWidth={8}
                                    className="w-20 h-20 sm:w-24 sm:h-24"
                                />
                                <span className="text-xs sm:text-sm font-semibold text-gray-600">Saturday</span>
                            </div>
                            <div className="flex flex-col items-center gap-2 bg-gray-50/50 p-3 rounded-xl border border-gray-100/50">
                                <Progress
                                    type="circle"
                                    percent={93}
                                    strokeColor={conicColors}
                                    strokeWidth={8}
                                    className="w-20 h-20 sm:w-24 sm:h-24"
                                />
                                <span className="text-xs sm:text-sm font-semibold text-gray-600">Sunday</span>
                            </div>
                        </div>
                    </div>

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