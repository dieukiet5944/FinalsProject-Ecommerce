import React, { useEffect, useState, useCallback } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DownOutlined, CalendarOutlined } from '@ant-design/icons';
import { Button, Dropdown } from 'antd';
import axios from 'axios';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import isBetween from 'dayjs/plugin/isBetween';

// Kích hoạt plugin để tính tuần từ Thứ 2 đến Chủ Nhật (ISO Week)
dayjs.extend(isoWeek);
dayjs.extend(isBetween);

const WeeklySalesChart = ({
  onCurrentWeekRevenueChange,
  onCurrentWeekOrdersChange,
  onHistoricalRevenueChange
}) => {
  const [chartData, setChartData] = useState([]);
  const [filterKey, setFilterKey] = useState('this_week');
  const [timeLabel, setTimeLabel] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentWeekRevenue, setCurrentWeekRevenue] = useState(0);
  const [currentWeekOrdersCount, setCurrentWeekOrdersCount] = useState(0);

  const getDayName = (date) => {
    const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    return dayNames[date.getDay()];
  };

  const generateEmptyWeekData = () => {
    return [
      { day: 'MON', sales: 0 },
      { day: 'TUE', sales: 0 },
      { day: 'WED', sales: 0 },
      { day: 'THU', sales: 0 },
      { day: 'FRI', sales: 0 },
      { day: 'SAT', sales: 0 },
      { day: 'SUN', sales: 0 },
    ];
  };

  const calculateDailySales = useCallback((ordersList, startOfWeek, endOfWeek) => {
    const dailySalesMap = {};
    let currentDay = startOfWeek.clone();
    while (!currentDay.isAfter(endOfWeek, 'day')) {
      const dayName = getDayName(currentDay.toDate());
      dailySalesMap[dayName] = 0;
      currentDay = currentDay.add(1, 'day');
    }

    let totalRevenue = 0;
    let totalHistoricalRevenue = 0;
    let ordersCount = 0;

    ordersList.forEach(order => {
      if (order.status === 'Completed') {
        const sales = order.totalPrice || 0;
        const orderDate = dayjs(order.createdAt || order.updatedAt);

        totalHistoricalRevenue += sales;

        if (orderDate.isBetween(startOfWeek, endOfWeek, 'day', '[]')) {
          const dayName = getDayName(orderDate.toDate());
          dailySalesMap[dayName] = (dailySalesMap[dayName] || 0) + sales;
          totalRevenue += sales;
          ordersCount += 1;
        }
      }
    });

    const dayOrder = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

    return {
      chartData: dayOrder.map(day => ({ day, sales: dailySalesMap[day] || 0 })),
      totalRevenue,
      totalHistoricalRevenue,
      ordersCount
    };
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8080/orders');
      const ordersData = response.data?.data || [];
      setOrders(ordersData);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const processChartData = useCallback(() => {
    if (!orders || orders.length === 0) return;

    const now = dayjs();
    let startOfWeek, endOfWeek;

    if (filterKey === 'this_week') {
      startOfWeek = now.startOf('isoWeek');
      endOfWeek = now.endOf('isoWeek');
    } else {
      startOfWeek = now.subtract(1, 'week').startOf('isoWeek');
      endOfWeek = now.subtract(1, 'week').endOf('isoWeek');
    }

    setTimeLabel(`${startOfWeek.format('MMM DD')} - ${endOfWeek.format('MMM DD, YYYY')}`);

    const { chartData, totalRevenue, totalHistoricalRevenue, ordersCount } = calculateDailySales(orders, startOfWeek, endOfWeek);

    setChartData(chartData);

    if (onHistoricalRevenueChange) {
      onHistoricalRevenueChange(totalHistoricalRevenue);
    }

    if (filterKey === 'this_week') {
      setCurrentWeekRevenue(totalRevenue);
      setCurrentWeekOrdersCount(ordersCount);
    }
  }, [filterKey, orders, calculateDailySales, onHistoricalRevenueChange]);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (orders.length > 0 || filterKey) {
      processChartData();
    }
  }, [filterKey, orders, processChartData]);

  useEffect(() => {
    if (filterKey === 'this_week' && onCurrentWeekRevenueChange) {
      onCurrentWeekRevenueChange(currentWeekRevenue);
    }
  }, [currentWeekRevenue, filterKey, onCurrentWeekRevenueChange]);

  useEffect(() => {
    if (filterKey === 'this_week' && onCurrentWeekOrdersChange) {
      onCurrentWeekOrdersChange(currentWeekOrdersCount);
    }
  }, [currentWeekOrdersCount, filterKey, onCurrentWeekOrdersChange]);

  useEffect(() => {
    const checkWeekChange = () => {
      const now = dayjs();
      const startOfCurrentWeek = now.startOf('isoWeek');
      const isMondayMidnight = now.day() === 1 && now.hour() === 0 && now.minute() === 0;

      if (isMondayMidnight && filterKey === 'this_week') {
        setChartData(generateEmptyWeekData());
        setCurrentWeekRevenue(0);
        setCurrentWeekOrdersCount(0);
        setTimeLabel(`${startOfCurrentWeek.format('MMM DD')} - ${now.endOf('isoWeek').format('MMM DD, YYYY')}`);
      }
    };

    const interval = setInterval(checkWeekChange, 1000);
    return () => clearInterval(interval);
  }, [filterKey]);

  const items = [
    { key: 'this_week', label: 'Tuần này' },
    { key: 'last_week', label: 'Tuần trước' },
  ];

  return (
    <div className="w-full bg-white rounded-2xl p-5 border border-gray-100/80 shadow-sm">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-base font-bold text-[#1E3A5F] m-0">Weekly Sales Performance</h3>
          {/* Hiện thời gian động thực tế của tuần đang được chọn */}
          <p className="text-xs text-gray-400 font-medium m-0 mt-0.5">{timeLabel}</p>
        </div>

        <Dropdown
          menu={{
            items,
            selectable: true,
            defaultSelectedKeys: ['this_week'],
            onClick: (e) => setFilterKey(e.key)
          }}
          trigger={['click']}
        >
          <Button className="rounded-xl text-xs h-8 px-3 flex items-center gap-1 font-medium border-gray-300 hover:text-[#EE2C6D] hover:border-[#EE2C6D]">
            <CalendarOutlined className="text-gray-400 text-xs" />
            <span>{filterKey === 'this_week' ? 'Tuần này' : 'Tuần trước'}</span>
            <DownOutlined className="text-[10px] text-gray-400" />
          </Button>
        </Dropdown>
      </div>

      {/* Khung vẽ biểu đồ */}
      <div className="w-full h-56 mt-4">
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={chartData} margin={{ top: 10, right: 15, left: -25, bottom: 0 }}>
            <CartesianGrid strokeDasharray="0" vertical={false} stroke="#F1F5F9" />
            <XAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94A3B8', fontSize: 11 }}
              tickFormatter={(value) => `$${value}`}
            />
            {/* Mở lại hiển thị cho trục Y để Admin dễ đối chiếu các mức doanh số cao thấp */}
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94A3B8', fontSize: 11 }}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #F1F5F9' }}
              formatter={(value) => [
                `$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                'Doanh thu'
              ]}
            />
            <Area
              type="monotone"
              dataKey="sales"
              stroke="#EE2C6D"
              strokeWidth={2.5}
              fillOpacity={0.12}
              fill="#EE2C6D"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default WeeklySalesChart;