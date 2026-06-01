// WeeklySalesChart.jsx
import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DownOutlined } from '@ant-design/icons';
import { Button, Dropdown } from 'antd';

const WeeklySalesChart = () => {
  // Biến chartData phải nằm ở đây để quản lý cục bộ
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    // Đổ dữ liệu thực tế tại đây
    const mockData = [
      { day: 'MON', sales: 1200 },
      { day: 'TUE', sales: 1600 },
      { day: 'WED', sales: 1400 },
      { day: 'THU', sales: 2100 },
      { day: 'FRI', sales: 3100 }, 
      { day: 'SAT', sales: 2000 },
      { day: 'SUN', sales: 2500 },
    ];
    setChartData(mockData);
  }, []);

  const items = [{ key: '7', label: 'Last 7 Days' }];

  return (
    <div className="w-full bg-white rounded-2xl p-5 border border-gray-100/80">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-base font-bold text-[#1E3A5F] m-0">Weekly Sales Performance</h3>
          <p className="text-xs text-gray-400 font-medium m-0 mt-0.5">Oct 21 - Oct 27, 2023</p>
        </div>
        <Dropdown menu={{ items }} trigger={['click']}>
          <Button className="rounded-xl text-xs h-8 px-3 flex items-center gap-1">
            Last 7 Days <DownOutlined className="text-[10px]" />
          </Button>
        </Dropdown>
      </div>

      {/* Khung vẽ biểu đồ */}
      <div className="w-full h-56 mt-4">
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={chartData} margin={{ top: 10, right: 15, left: -25, bottom: 0 }}>
            <CartesianGrid strokeDasharray="0" vertical={false} stroke="#F1F5F9" />
            <XAxis dataKey="day" axisLine={false} tickLine={false} />
            <YAxis axisLine={false} tickLine={false} tick={false} />
            <Tooltip />
            <Area type="monotone" dataKey="sales" stroke="#EE2C6D" fillOpacity={0.15} fill="#EE2C6D" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default WeeklySalesChart;