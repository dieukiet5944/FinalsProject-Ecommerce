import { useState } from 'react';
import { Table, Tag, Input, Select, Space, Card, Statistic, Row, Col, DatePicker } from 'antd';
import { 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  ExclamationCircleOutlined, 
  SearchOutlined, 
  DollarCircleOutlined, 
  SwapOutlined 
} from '@ant-design/icons';

const { RangePicker } = DatePicker;

const TransactionManagement = () => {
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const transactionsData = [
    {
      key: '1',
      transactionId: 'FT261902834', 
      orderCode: 'CRUMB_8392',     
      amount: 125000,
      bank: 'MB Bank',
      accountNumber: '0987654321',
      content: 'CRUMB_8392',        
      createdAt: '2026-07-09 14:23:11',
      status: 'success', 
    },
    {
      key: '2',
      transactionId: 'FT261902901',
      orderCode: 'CRUMB_8401',
      amount: 45000,
      bank: 'Vietcombank',
      accountNumber: '1023456789',
      content: 'CRUMB 8401 HOA CHUYEN TIEN', 
      createdAt: '2026-07-09 15:10:02',
      status: 'success',
    },
    {
      key: '3',
      transactionId: 'FT261903112',
      orderCode: 'CRUMB_8415',
      amount: 90000,
      bank: 'Techcombank',
      accountNumber: '1903556789',
      content: 'CHUYEN TIEN BANH NUOC', 
      createdAt: '2026-07-09 16:45:30',
      status: 'pending_manual',
    },
    {
      key: '4',
      transactionId: 'FT261904000',
      orderCode: 'CRUMB_8350',
      amount: 150000,
      bank: 'VietinBank',
      accountNumber: '101102103',
      content: 'CRUMB_8350',
      createdAt: '2026-07-08 10:20:00',
      status: 'failed', 
    }
  ];

  const columns = [
    {
      title: 'Mã GD (Bank)',
      dataIndex: 'transactionId',
      key: 'transactionId',
      render: (text) => <span className="font-mono font-semibold text-gray-700 text-xs">{text}</span>,
    },
    {
      title: 'Mã Đơn Hàng',
      dataIndex: 'orderCode',
      key: 'orderCode',
      render: (text) => <span className="font-bold text-primary-600 text-xs">{text}</span>,
    },
    {
      title: 'Số Tiền',
      dataIndex: 'amount',
      key: 'amount',
      sorter: (a, b) => a.amount - b.amount,
      render: (amount) => (
        <span className="font-bold text-gray-800">
          {amount.toLocaleString('vi-VN')}đ
        </span>
      ),
    },
    {
      title: 'Ngân Hàng',
      dataIndex: 'bank',
      key: 'bank',
      render: (text, record) => (
        <div className="text-xs">
          <div className="font-semibold text-gray-700">{text}</div>
          <div className="text-gray-400 font-mono">{record.accountNumber}</div>
        </div>
      ),
    },
    {
      title: 'Nội Dung CK',
      dataIndex: 'content',
      key: 'content',
      render: (text) => <span className="bg-gray-50 border border-gray-100 px-2 py-1 rounded-md text-2xs font-mono text-gray-600">{text}</span>,
    },
    {
      title: 'Thời Gian',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text) => <span className="text-xs text-gray-500">{text}</span>,
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        if (status === 'success') {
          return <Tag icon={<CheckCircleOutlined />} color="success" className="rounded-md font-semibold text-2xs px-2 py-0.5">Thành công</Tag>;
        }
        if (status === 'pending_manual') {
          return <Tag icon={<ExclamationCircleOutlined />} color="warning" className="rounded-md font-semibold text-2xs px-2 py-0.5">Sai nội dung (Check tay)</Tag>;
        }
        return <Tag icon={<CloseCircleOutlined />} color="error" className="rounded-md font-semibold text-2xs px-2 py-0.5">Thất bại</Tag>;
      },
    },
  ];

  const filteredData = transactionsData.filter(item => {
    const matchesSearch = 
      item.transactionId.toLowerCase().includes(searchText.toLowerCase()) ||
      item.orderCode.toLowerCase().includes(searchText.toLowerCase()) ||
      item.content.toLowerCase().includes(searchText.toLowerCase());
      
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen text-slate-700">
      
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <SwapOutlined className="text-primary-500" /> Quản Lý Giao Dịch Thanh Toán (Sepay Log)
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          Đối soát dòng tiền chuyển khoản tự động qua hệ thống ngân hàng thời gian thực.
        </p>
      </div>

      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} md={8}>
          <Card bordered={false} className="shadow-3xs rounded-xl bg-white border border-gray-100/60">
            <Statistic 
              title={<span className="text-xs font-semibold text-gray-400 uppercase">Tổng thu tự động</span>} 
              value={170000} 
              precision={0}
              valueStyle={{ color: '#10b981', fontWeight: '800', fontSize: '1.5rem' }}
              prefix={<DollarCircleOutlined />}
              suffix="đ"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card bordered={false} className="shadow-3xs rounded-xl bg-white border border-gray-100/60">
            <Statistic 
              title={<span className="text-xs font-semibold text-gray-400 uppercase">Giao dịch thành công</span>} 
              value={2} 
              valueStyle={{ color: '#10b981', fontWeight: '800', fontSize: '1.5rem' }}
              suffix="/ 4 GD"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card bordered={false} className="shadow-3xs rounded-xl bg-white border border-gray-100/60">
            <Statistic 
              title={<span className="text-xs font-semibold text-gray-400 uppercase">Cần đối soát tay</span>} 
              value={1} 
              valueStyle={{ color: '#f59e0b', fontWeight: '800', fontSize: '1.5rem' }}
              suffix="Lỗi nội dung"
            />
          </Card>
        </Col>
      </Row>

      <Card bordered={false} className="shadow-3xs rounded-xl bg-white border border-gray-100/60 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Space wrap size="middle" className="w-full sm:w-auto">
            <Input
              placeholder="Tìm mã GD, mã đơn, nội dung..."
              prefix={<SearchOutlined className="text-gray-400" />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full sm:w-64 rounded-lg h-9 border-gray-200"
            />
            <Select
              value={statusFilter}
              onChange={(value) => setStatusFilter(value)}
              className="w-full sm:w-44 h-9"
              options={[
                { value: 'all', label: 'Tất cả trạng thái' },
                { value: 'success', label: 'Thành công (Khớp)' },
                { value: 'pending_manual', label: 'Cần check tay' },
                { value: 'failed', label: 'Thất bại' },
              ]}
            />
          </Space>
          
          <RangePicker className="rounded-lg h-9 border-gray-200 w-full sm:w-auto" />
        </div>
      </Card>

      <Card bordered={false} className="shadow-3xs rounded-xl bg-white border border-gray-100/60 overflow-hidden">
        <Table 
          columns={columns} 
          dataSource={filteredData} 
          pagination={{ pageSize: 5 }}
          className="[&_.ant-table-thead_th]:bg-gray-50/80 [&_.ant-table-thead_th]:text-gray-600 [&_.ant-table-thead_th]:font-bold [&_.ant-table-thead_th]:text-xs"
        />
      </Card>
    </div>
  );
};

export default TransactionManagement;