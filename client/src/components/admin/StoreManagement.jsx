import React, { useState } from 'react';
import { Table, Button, Input, Tag, Space, Card, Modal, Form, Select, notification } from 'antd';
import { SearchOutlined, FilterOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

const StoreManagement = () => {
  // const [stores, setStores] = useState(initialStores);
  const [searchText, setSearchText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState(null);
  const [form] = Form.useForm();

  // const handleSearch = (e) => {
  //   const value = e.target.value;
  //   setSearchText(value);
  //   if (value === '') {
  //     setStores(initialStores);
  //   } else {
  //     const filtered = initialStores.filter(store =>
  //       store.name.toLowerCase().includes(value.toLowerCase())
  //     );
  //     setStores(filtered);
  //   }
  // };


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
        <Tag className={`font-bold px-3 py-0.5 rounded-full border-none ${status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'
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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#EE2B6C] m-0">Store Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage and monitor all your pâtisserie locations globally.</p>
        </div>
        <button
          type="primary"
          size="large"
          className="bg-[#de1e60] text-amber-50 hover:bg-[#be185d] border-none font-bold rounded-xl px-5 h-12 flex items-center shadow-md shadow-pink-100"
          onClick={() => setIsModalOpen(true)}
        >
          <PlusOutlined className='mr-3' />
          Add New Store
        </button>
      </div>

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

      {/* <div className="bg-white rounded-b-2xl shadow-xs overflow-hidden">
        <Table 
          columns={columns} 
          dataSource={stores} 
          pagination={{
            placement: ['bottomRight'],
            defaultPageSize: 4,
            showSizeChanger: false,
            className: "pr-6 py-4"
          }}
        />
      </div> */}

      <Modal
        title={<span className="text-xl font-bold text-gray-800">{editingStore ? 'Edit Store Info' : 'Add New Store'}</span>}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        okText={editingStore ? "Save Changes" : "Create Store"}
        cancelText="Cancel"
        okButtonProps={{ className: 'bg-[#de1e60] border-none hover:bg-[#be185d]' }}
        className="rounded-2xl overflow-hidden"
      >
        <div className='p-5 flex flex-col gap-5'>
            <div className=' flex flex-col gap-2'>
               <label className="before:content-['*'] before:text-red-500 before:mr-1">Store Name</label>
               <input className='border-2 p-1 rounded-sm outline-none' type='string' placeholder='please fill your name' required/>
            </div>
            <div className=' flex flex-col gap-2'>
               <label className="before:content-['*'] before:text-red-500 before:mr-1">Email</label>
               <input className='border-2 p-1 rounded-sm outline-none' type='email' required/>
            </div>
            <div className=' flex flex-col gap-2'>
               <label className="before:content-['*'] before:text-red-500 before:mr-1">Phone</label>
               <input className='border-2 p-1 rounded-sm outline-none' type="string" required/>
            </div>
            <div className=' flex flex-col gap-2'>
               <label className="before:content-['*'] before:text-red-500 before:mr-1">Address</label>
               <input className='border-2 p-1 rounded-sm outline-none' type='string' required/>
            </div>
            <div className=' flex flex-col gap-2'>
               <label >Description</label>
               <textarea className='border-2 p-1 rounded-sm outline-none' required/>
            </div>
        </div>
      </Modal>
    </div>
  );
};

export default StoreManagement;