import React, { useState, useEffect, useMemo } from 'react'
import { PoundCircleOutlined, ShoppingCartOutlined, UserAddOutlined, ThunderboltOutlined, ArrowRightOutlined, ExceptionOutlined, DollarOutlined, UserOutlined, DownOutlined } from '@ant-design/icons'
import { Cascader, Row, Col, Progress, Space, DatePicker, Spin, message, Avatar, Typography, Card, Flex, Button, Dropdown } from 'antd'
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import isBetween from 'dayjs/plugin/isBetween';
import { getOrdersApi } from '../../services/orderService.js'
import { getUsersApi } from '../../services/userService.js'
import { getProductsApi } from '../../services/productService.js'

import WeeklySalesChart from './WeeklySalesChart';

dayjs.extend(isoWeek);
dayjs.extend(isBetween);

const Dashboard = ({ name }) => {

    const [dataUser, setDataUser] = useState([]);
    const [dataProduct, setDataProduct] = useState([]);
    const [historyOrders, setHistoryOrders] = useState([]);
    const [loading, setLoading] = useState(false);

    const { Text: AntText } = Typography;


    useEffect(() => {
        const getAlldata = async () => {
            setLoading(true);
            try {

                const [resUsers, resProducts, resOrders] = await Promise.all([
                    getUsersApi(),
                    getProductsApi(),
                    getOrdersApi()
                ]);

                const usersArray = resUsers?.data || [];
                const productsArray = resProducts?.data || [];
                const ordersArray = resOrders?.data || [];

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
            } catch (error) {
                message.error("Error Server 500 !!");
            } finally {
                setLoading(false);
            }
        };

        getAlldata();
    }, []);

    const startOfCurrentWeek = useMemo(() => {
        return dayjs().startOf('isoWeek');
    }, []);

    const formatCurrency = (value) => {
        return (value || 0).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    const historicalRevenueNumber = useMemo(() => {
        return historyOrders
            .filter(order => order.status === 'Completed')
            .reduce((sum, order) => sum + (Number(order.totalPrice || order.sumOrders) || 0), 0);
    }, [historyOrders]);

    const currentWeekOrders = useMemo(() => {
        return historyOrders.filter(order => {
            if (order.status !== 'Completed' || !order.createdAt) return false;
            return dayjs(order.createdAt).isAfter(startOfCurrentWeek) || dayjs(order.createdAt).isSame(startOfCurrentWeek, 'day');
        });
    }, [historyOrders, startOfCurrentWeek]);

    const currentWeekRevenue = useMemo(() => {
        return currentWeekOrders.reduce((sum, order) => sum + (Number(order.totalPrice || order.sumOrders) || 0), 0);
    }, [currentWeekOrders]);

    const currentWeekOrdersCount = useMemo(() => {
        return currentWeekOrders.length;
    }, [currentWeekOrders]);

    const formattedHistoricalRevenue = useMemo(() => formatCurrency(historicalRevenueNumber), [historicalRevenueNumber]);
    const formattedCurrentWeekRevenue = useMemo(() => formatCurrency(currentWeekRevenue), [currentWeekRevenue]);

    const pendingOrdersCount = useMemo(() => {
        return historyOrders.filter(order => order.status === 'Processing').length;
    }, [historyOrders]);

    const activeCustomersCount = useMemo(() => {
        return dataUser.filter(user => user.status === 'online').length;
    }, [dataUser]);


    const calculateAOV = useMemo(() => {
        if (currentWeekOrdersCount === 0) return "0.00";
        return (currentWeekRevenue / currentWeekOrdersCount).toFixed(2);
    }, [currentWeekRevenue, currentWeekOrdersCount]);

    const topSellingItem = useMemo(() => {
        const imageLookup = {};
        if (dataProduct && dataProduct.length > 0) {
            dataProduct.forEach(p => {
                const folder = p.category ? p.category.toLowerCase().trim() : 'cake';

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

                    const cleanedKey = item.name.toLowerCase().trim();
                    const itemKey = item.name;

                    if (!itemCounts[itemKey]) {
                        const finalImage = imageLookup[cleanedKey];

                        itemCounts[itemKey] = {
                            name: item.name,
                            qty: 0,
                            price: item.price || 0,
                            image: finalImage
                        };
                    }
                    itemCounts[itemKey].qty += Number(item.qty || 0);
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
                    {console.log("Dashboard Overview Rendered", historyOrders)}
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">

                <div className="p-5 flex flex-col gap-3 bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.04)] border border-gray-100">
                    <div className="flex justify-between items-center">
                        <DollarOutlined className="text-lg p-2.5 rounded-lg bg-green-50 text-green-600 border border-green-100 shrink-0" />
                    </div>
                    <p className="text-xs font-bold tracking-wider text-gray-400 m-0">TOTAL REVENUE</p>
                    <h2 className="text-lg sm:text-xl font-bold text-green-700 bg-green-50/60 px-3 py-1 rounded-md m-0 inline-block w-fit" title="Doanh thu các tuần trước (không bao gồm tuần hiện tại)">
                        ${formattedCurrentWeekRevenue}
                    </h2>
                    <p className="text-[10px] text-gray-400 m-0">
                        (Total Revenue For The Year: ${formattedHistoricalRevenue})
                    </p>
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
                    <Spin spinning={loading}>
                        <WeeklySalesChart
                            orders={historyOrders} 
                            onCurrentWeekRevenueChange={setCurrentWeekRevenue}
                            onCurrentWeekOrdersChange={setCurrentWeekOrdersCount}
                        />
                    </Spin>

                </div>

                <div className="right-column-scroll bg-white p-2 rounded-xl border border-gray-100 shadow-[0_4px_12px_rgba(0,0,0,0.02)] h-fit">
                    <Card
                        title={<span className="text-base sm:text-lg font-bold text-gray-800">Top Selling Items</span>}
                        variant="borderless"
                        className="w-full"
                    >
                        <div className="flex flex-col gap-4">
                            {topSellingItem.map((item, index) => (
                                <Spin spinning={loading} key={index}>
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
                                </Spin>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}


export default Dashboard