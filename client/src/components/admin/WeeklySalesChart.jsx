import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DownOutlined, CalendarOutlined } from '@ant-design/icons';
import { Button, Dropdown } from 'antd';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';

// Kích hoạt plugin để tính tuần từ Thứ 2 đến Chủ Nhật (ISO Week)
dayjs.extend(isoWeek);

const WeeklySalesChart = () => {
  const [chartData, setChartData] = useState([]);
  const [filterKey, setFilterKey] = useState('this_week'); 
  const [timeLabel, setTimeLabel] = useState('');

 // Tạo tuần đầu tiên set về 0 
  const generateDefaultWeeklyData = () => [
    { day: 'MON', sales: 0 },
    { day: 'TUE', sales: 0 },
    { day: 'WED', sales: 0 },
    { day: 'THU', sales: 0 },
    { day: 'FRI', sales: 0 },
    { day: 'SAT', sales: 0 },
    { day: 'SUN', sales: 0 },
  ];

  useEffect(() => {
    const now = dayjs();
    let startOfWeek, endOfWeek;

    // 2. Định vị khoảng thời gian theo bộ lọc
    if (filterKey === 'this_week') {
      startOfWeek = now.startOf('isoWeek');
      endOfWeek = now.endOf('isoWeek');
    } else {
      startOfWeek = now.subtract(1, 'week').startOf('isoWeek');
      endOfWeek = now.subtract(1, 'week').endOf('isoWeek');
    }

    // Cập nhật chuỗi hiển thị thời gian ở Subtitle (Ví dụ: "Jun 01 - Jun 07, 2026")
    setTimeLabel(`${startOfWeek.format('MMM DD')} - ${endOfWeek.format('MMM DD, YYYY')}`);

    /**
     * 3. MÔ PHỎNG LOGIC ĐỔ DATA TỪ DATABASE
     * Ở môi trường thực tế, hôm nay là thứ 3 (TUE) thì DB tuần này sẽ chỉ trả về đơn của MON và TUE.
     * Giả lập mảng data thực tế lấy về từ API/Database:
     */
    const dbSalesData = filterKey === 'this_week'   
      ? [
          { day: 'MON', sales: 1200 },
          { day: 'TUE', sales: 1600 }, 
          // WED, THU, FRI, SAT, SUN chưa đi qua nên DB hoàn toàn không có data
        ]
      : [
          // Nếu chọn tuần trước thì hiển thị đầy đủ cả tuần cũ
          { day: 'MON', sales: 1500 }, { day: 'TUE', sales: 1800 },
          { day: 'WED', sales: 1400 }, { day: 'THU', sales: 2200 },
          { day: 'FRI', sales: 2900 }, { day: 'SAT', sales: 3500 },
          { day: 'SUN', sales: 4000 },
        ];

    // 4. BIẾN ĐỔI LOGIC (MAPPING): Trộn data thực tế vào khung 7 ngày mặc định
    const finalData = generateDefaultWeeklyData().map((defaultItem) => {
      // Tìm xem ngày này trong Database có doanh thu chưa
      const matchedData = dbSalesData.find(item => item.day === defaultItem.day);
      // Nếu có thì lấy số tiền từ DB, chưa có (chưa đi qua/không có đơn) thì giữ nguyên 0
      return matchedData ? { ...defaultItem, sales: matchedData.sales } : defaultItem;
    });

    setChartData(finalData);
  }, [filterKey]); // Mỗi lần đổi filterKey (Tuần này / Tuần trước) useEffect sẽ chạy lại

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