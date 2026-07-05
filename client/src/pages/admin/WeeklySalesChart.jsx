import React, { useEffect, useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DownOutlined, CalendarOutlined } from '@ant-design/icons';
import { Button, Dropdown } from 'antd';
import { getOrdersApi } from '../../services/orderService.js';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import isBetween from 'dayjs/plugin/isBetween';

dayjs.extend(isoWeek);
dayjs.extend(isBetween);

const WeeklySalesChart = ({ orders = [], onCurrentWeekRevenueChange, onCurrentWeekOrdersChange }) => {
  const [filterKey, setFilterKey] = useState('this_week');
  const [timeLabel, setTimeLabel] = useState('');

  const { startOfWeek, endOfWeek } = useMemo(() => {
    const now = dayjs();
    if (filterKey === 'this_week') {
      return { startOfWeek: now.startOf('isoWeek'), endOfWeek: now.endOf('isoWeek') };
    }
    return { startOfWeek: now.subtract(1, 'week').startOf('isoWeek'), endOfWeek: now.subtract(1, 'week').endOf('isoWeek') };
  }, [filterKey]);

  useEffect(() => {
    setTimeLabel(`${startOfWeek.format('MMM DD')} - ${endOfWeek.format('MMM DD, YYYY')}`);
  }, [startOfWeek, endOfWeek]);

  const processedData = useMemo(() => {
    const dayOrder = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
    const dailySalesMap = { MON: 0, TUE: 0, WED: 0, THU: 0, FRI: 0, SAT: 0, SUN: 0 };
    
    let totalRevenue = 0;
    let ordersCount = 0;

    orders.forEach(order => {
      if (!order.createdAt || order.status !== 'Completed') return;

      const orderDate = dayjs(order.createdAt);
      const inWeek = orderDate.isBetween(startOfWeek, endOfWeek, 'day', '[]');

      if (inWeek) {
        const sales = Number(order.totalPrice || order.sumOrders) || 0;
        const dayName = orderDate.format('ddd').toUpperCase(); 
        
        if (dailySalesMap[dayName] !== undefined) {
          dailySalesMap[dayName] += sales;
        }
        totalRevenue += sales;
        ordersCount += 1;
      }
    });

    return {
      chartData: dayOrder.map(day => ({ day, sales: dailySalesMap[day] })),
      totalRevenue,
      ordersCount
    };
  }, [orders, startOfWeek, endOfWeek]);

  const { chartData, totalRevenue, ordersCount } = processedData;

  useEffect(() => {
    if (filterKey === 'this_week') {
      if (onCurrentWeekRevenueChange) onCurrentWeekRevenueChange(processedData.totalRevenue);
      if (onCurrentWeekOrdersChange) onCurrentWeekOrdersChange(processedData.ordersCount);
    }
  }, [processedData.totalRevenue, processedData.ordersCount, filterKey, onCurrentWeekRevenueChange, onCurrentWeekOrdersChange]);

  const items = [
    { key: 'this_week', label: 'This Week' },
    { key: 'last_week', label: 'Last Week' },
  ];

  return (
    <div className="w-full bg-white rounded-2xl p-5 border border-gray-100/80 shadow-sm">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-base font-bold text-[#1E3A5F] m-0">Weekly Sales Performance</h3>
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
            <span>{filterKey === 'this_week' ? 'This Week' : 'Last Week'}</span>
            <DownOutlined className="text-[10px] text-gray-400" />
          </Button>
        </Dropdown>
      </div>

      <div className="w-full h-56 mt-4">
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={chartData} margin={{ top: 10, right: 15, left: -25, bottom: 0 }}>
            <CartesianGrid strokeDasharray="0" vertical={false} stroke="#F1F5F9" />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94A3B8', fontSize: 11 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94A3B8', fontSize: 11 }}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #F1F5F9' }}
              formatter={(value) => [
                `$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                'Revenue'
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