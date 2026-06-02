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

const WeeklySalesChart = ({ onCurrentWeekRevenueChange, onCurrentWeekOrdersChange }) => {
  const [chartData, setChartData] = useState([]);
  const [filterKey, setFilterKey] = useState('this_week'); 
  const [timeLabel, setTimeLabel] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentWeekRevenue, setCurrentWeekRevenue] = useState(0);
  const [currentWeekOrdersCount, setCurrentWeekOrdersCount] = useState(0);

  // Ánh xạ ngày trong tuần từ Date object sang tên ngày (Thứ 2 = 0, Chủ Nhật = 6)
  const getDayName = (date) => {
    const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    return dayNames[date.getDay()];
  };

  // Tạo khung 7 ngày với giá trị mặc định = 0 (luôn đủ 7 ngày từ MON đến SUN)
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

  // Tính toán doanh thu theo ngày từ danh sách orders
  const calculateDailySales = useCallback((ordersList, startOfWeek, endOfWeek) => {
    // Khởi tạo dữ liệu rỗng cho 7 ngày
    const dailySalesMap = {};
    let currentDay = startOfWeek.clone();
    while (!currentDay.isAfter(endOfWeek, 'day')) {
      const dayName = getDayName(currentDay.toDate());
      dailySalesMap[dayName] = 0;
      currentDay = currentDay.add(1, 'day');
    }

    // Tính doanh thu từ các đơn hàng Completed trong khoảng thời gian
    let totalRevenue = 0;
    let ordersCount = 0;
    ordersList.forEach(order => {
      if (order.status === 'Completed') {
        const orderDate = dayjs(order.createdAt || order.updatedAt);
        if (orderDate.isBetween(startOfWeek, endOfWeek, 'day', '[]')) {
          const dayName = getDayName(orderDate.toDate());
          const sales = order.totalPrice || 0;
          dailySalesMap[dayName] = (dailySalesMap[dayName] || 0) + sales;
          totalRevenue += sales;
          ordersCount += 1;
        }
      }
    });

    // Chuyển thành mảng theo thứ tự MON -> SUN
    const dayOrder = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
    return {
      chartData: dayOrder.map(day => ({ day, sales: dailySalesMap[day] || 0 })),
      totalRevenue,
      ordersCount
    };
  }, []);

  // Fetch orders from API
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

  // Xử lý logic tính toán biểu đồ
  const processChartData = useCallback(() => {
    const now = dayjs();
    let startOfWeek, endOfWeek;

    // Định vị khoảng thời gian theo bộ lọc (isoWeek bắt đầu từ Thứ 2)
    if (filterKey === 'this_week') {
      startOfWeek = now.startOf('isoWeek'); // Thứ 2 đầu tuần
      endOfWeek = now.endOf('isoWeek');     // Chủ Nhật cuối tuần
    } else {
      startOfWeek = now.subtract(1, 'week').startOf('isoWeek');
      endOfWeek = now.subtract(1, 'week').endOf('isoWeek');
    }

    // Cập nhật chuỗi hiển thị thời gian
    setTimeLabel(`${startOfWeek.format('MMM DD')} - ${endOfWeek.format('MMM DD, YYYY')}`);

    // Tính toán doanh thu thực tế từ database
    const { chartData: salesData, totalRevenue, ordersCount } = calculateDailySales(orders, startOfWeek, endOfWeek);
    setChartData(salesData);

    // Chỉ cập nhật currentWeekRevenue khi đang xem tuần hiện tại
    if (filterKey === 'this_week') {
      setCurrentWeekRevenue(totalRevenue);
      setCurrentWeekOrdersCount(ordersCount);
    }
  }, [filterKey, orders, calculateDailySales]);

  // Fetch data lần đầu
  useEffect(() => {
    fetchOrders();
  }, []);

  // Xử lý khi có orders mới hoặc thay đổi filter
  useEffect(() => {
    if (orders.length > 0 || filterKey) {
      processChartData();
    }
  }, [filterKey, orders, processChartData]);

  // Thông báo doanh thu tuần hiện tại lên Dashboard
  useEffect(() => {
    if (filterKey === 'this_week' && onCurrentWeekRevenueChange) {
      onCurrentWeekRevenueChange(currentWeekRevenue);
    }
  }, [currentWeekRevenue, filterKey, onCurrentWeekRevenueChange]);

  // Thông báo số đơn hàng tuần hiện tại lên Dashboard
  useEffect(() => {
    if (filterKey === 'this_week' && onCurrentWeekOrdersChange) {
      onCurrentWeekOrdersChange(currentWeekOrdersCount);
    }
  }, [currentWeekOrdersCount, filterKey, onCurrentWeekOrdersChange]);

  // Auto-reset: Kiểm tra mỗi giây để phát hiện thời điểm chuyển tuần
  useEffect(() => {
    const checkWeekChange = () => {
      const now = dayjs();
      // Kiểm tra nếu vừa mới chuyển sang tuần mới (Thứ 2, 00:00:00)
      const startOfCurrentWeek = now.startOf('isoWeek');
      const isMondayMidnight = now.day() === 1 && now.hour() === 0 && now.minute() === 0;
      
      if (isMondayMidnight && filterKey === 'this_week') {
        // Reset biểu đồ về 0 vì tuần mới chưa có đơn hàng nào
        setChartData(generateEmptyWeekData());
        setCurrentWeekRevenue(0);
        setCurrentWeekOrdersCount(0);
        setTimeLabel(`${startOfCurrentWeek.format('MMM DD')} - ${now.endOf('isoWeek').format('MMM DD, YYYY')}`);
      }
    };

    // Kiểm tra mỗi giây để bắt chính xác thời điểm 00:00:00
    const interval = setInterval(checkWeekChange, 1000);
    return () => clearInterval(interval);
  }, [filterKey]);

  // Cấu hình danh sách Dropdown của Ant Design
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
              dataKey="day" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 500 }} 
            />
            {/* Mở lại hiển thị cho trục Y để Admin dễ đối chiếu các mức doanh số cao thấp */}
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94A3B8', fontSize: 11 }} 
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #F1F5F9' }}
              formatter={(value) => [`${value.toLocaleString()} đ`, 'Doanh thu']}
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