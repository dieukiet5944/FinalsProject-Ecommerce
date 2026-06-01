import React, { useState } from 'react';
import { Table, Button, Input, Tag, Space, Card, Modal, Form, Select, notification } from 'antd';
import { SearchOutlined, FilterOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

import { initialStores } from './mock/mockData.js';

const StoreManagement = () => {
  const [stores, setStores] = useState(initialStores);
  const [searchText, setSearchText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState(null);
  const [form] = Form.useForm();

  // Xử lý Tìm kiếm theo tên
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchText(value);
    if (value === '') {
      setStores(initialStores);
    } else {
      const filtered = initialStores.filter(store =>
        store.name.toLowerCase().includes(value.toLowerCase())
      );
      setStores(filtered);
    }
  };

  // Mở modal Thêm mới / Chỉnh sửa
  const showModal = (store = null) => {
    setEditingStore(store);
    if (store) {
      form.setFieldsValue(store);
    } else {
      form.resetFields();
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    form.validateFields().then((values) => {
      if (editingStore) {
        setStores(stores.map(item => item.key === editingStore.key ? { ...item, ...values } : item));
        notification.success({ message: 'Cập nhật cửa hàng thành công!' });
      } else {
        const newStore = {
          key: Date.now().toString(),
          logo: '🏪',
          ...values
        };
        setStores([...stores, newStore]);
        notification.success({ message: 'Thêm cửa hàng mới thành công!' });
      }
      setIsModalOpen(false);
    });
  };

  const handleDelete = (key) => {
    Modal.confirm({
      title: 'Bạn có chắc chắn muốn xóa cửa hàng này?',
      content: 'Hành động này không thể hoàn tác.',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk() {
        setStores(stores.filter(item => item.key !== key));
        notification.success({ message: 'Đã xóa cửa hàng.' });
      }
    });
  };

  const columns = [
    {
      title: 'STORE NAME',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center text-lg">
            {record.logo}
          </div>
          <span className="font-bold text-gray-800">{text}</span>
        </div>
      ),
    },
    {
      title: 'ADDRESS',
      dataIndex: 'address',
      key: 'address',
      render: (text) => <span className="text-gray-600 text-sm">{text}</span>
    },
    {
      title: 'MANAGER',
      dataIndex: 'manager',
      key: 'manager',
      render: (text) => <span className="font-semibold text-gray-800">{text}</span>
    },
    {
      title: 'CONTACT',
      dataIndex: 'contact',
      key: 'contact',
      render: (text) => <span className="text-gray-500 text-sm whitespace-pre-line">{text}</span>
    },
    {
      title: 'STATUS',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag className={`font-bold px-3 py-0.5 rounded-full border-none ${
          status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'
        }`}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'ACTIONS',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="text" 
            icon={<EditOutlined className="text-gray-500 hover:text-pink-600 transition-colors" />} 
            onClick={() => showModal(record)} 
          />
          <Button 
            type="text" 
            icon={<DeleteOutlined className="text-gray-400 hover:text-red-500 transition-colors" />} 
            onClick={() => handleDelete(record.key)} 
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="p-8 bg-[#f9fafc] min-h-screen">
      {/* 1. Header & KPI Cards */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#EE2B6C] m-0">Store Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage and monitor all your pâtisserie locations globally.</p>
        </div>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          size="large"
          className="bg-[#de1e60] hover:bg-[#be185d] border-none font-bold rounded-xl px-5 h-12 flex items-center shadow-md shadow-pink-100"
          onClick={() => showModal()}
        >
          Add New Store
        </Button>
      </div>

      {/* KPI Cards Widget Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-5 flex flex-col gap-3 bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.04)] border border-gray-100">
          <div className="text-xs font-bold text-gray-400 tracking-wider">TOTAL BRANCHES</div>
          <div className="text-4xl font-black text-[#de1e60] my-1">08</div>
          <div className="text-xs font-semibold text-emerald-500">↗ +2 this quarter</div>
        </Card>
        <Card className="p-5 flex flex-col gap-3 bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.04)] border border-gray-100">
          <div className="text-xs font-bold text-gray-400 tracking-wider">ACTIVE REGIONS</div>
          <div className="text-4xl font-black text-slate-900 my-1">03</div>
          <div className="text-xs text-gray-500 font-medium">Paris, Lyon, Bordeaux</div>
        </Card>
        <Card className="p-5 flex flex-col gap-3 bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.04)] border border-gray-100">
          <div className="text-xs font-bold text-gray-400 tracking-wider">TOTAL STAFF</div>
          <div className="text-4xl font-black text-slate-900 my-1">42</div>
          <div className="text-xs font-semibold text-emerald-500">✓ 95% full attendance</div>
        </Card>
      </div>

      {/* 2. Toolbar Filters */}
      <div className="bg-white p-4 rounded-t-2xl border-b border-gray-100 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
        <div className="flex flex-1 max-w-md gap-3">
          <Input 
            placeholder="Filter by name..." 
            prefix={<SearchOutlined className="text-gray-400" />} 
            value={searchText}
            onChange={handleSearch}
            className="rounded-xl border-gray-200 py-2"
          />
          <Button icon={<FilterOutlined />} className="rounded-xl border-gray-200 text-gray-600 font-medium py-2 h-auto flex items-center">
            Filters
          </Button>
        </div>
        <div className="text-sm font-semibold text-gray-400 self-center">
          Showing {stores.length} of {initialStores.length} locations
        </div>
      </div>

      {/* 3. Main Data Table */}
      <div className="bg-white rounded-b-2xl shadow-xs overflow-hidden">
        <Table 
          columns={columns} 
          dataSource={stores} 
          pagination={{
            position: ['bottomRight'],
            defaultPageSize: 4,
            showSizeChanger: false,
            className: "pr-6 py-4"
          }}
        />
      </div>

      {/* 4. Modal component phục vụ Thêm / Sửa (AD-ADM01) */}
      <Modal
        title={<span className="text-xl font-bold text-gray-800">{editingStore ? 'Edit Store Info' : 'Add New Store'}</span>}
        open={isModalOpen}
        onOk={handleSave}
        onCancel={() => setIsModalOpen(false)}
        okText={editingStore ? "Save Changes" : "Create Store"}
        cancelText="Cancel"
        okButtonProps={{ className: 'bg-[#de1e60] border-none hover:bg-[#be185d]' }}
        className="rounded-2xl overflow-hidden"
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item name="name" label="Store Name" rules={[{ required: true, message: 'Please input store name!' }]}>
            <Input className="rounded-lg" />
          </Form.Item>
          <Form.Item name="address" label="Address" rules={[{ required: true, message: 'Please input address!' }]}>
            <Input className="rounded-lg" />
          </Form.Item>
          <Form.Item name="manager" label="Manager Name" rules={[{ required: true, message: 'Please input manager name!' }]}>
            <Input className="rounded-lg" />
          </Form.Item>
          <Form.Item name="contact" label="Contact Number" rules={[{ required: true, message: 'Please input contact info!' }]}>
            <Input className="rounded-lg" />
          </Form.Item>
          <Form.Item name="status" label="Status" initialValue="ACTIVE">
            <Select className="rounded-lg">
              <Select.Option value="ACTIVE">ACTIVE</Select.Option>
              <Select.Option value="INACTIVE">INACTIVE</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default StoreManagement;