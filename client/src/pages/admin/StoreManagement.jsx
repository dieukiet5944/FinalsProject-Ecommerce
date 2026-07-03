import React, { useEffect, useState, useRef } from 'react';
import { Table, Button, Input, Tag, Card, Modal, Form, Select, notification, message, Spin, Dropdown, Descriptions } from 'antd';
import {UserAddOutlined,MoreOutlined ,SearchOutlined, FilterOutlined, PlusOutlined, EditOutlined, DeleteOutlined, ShopOutlined } from '@ant-design/icons';
import { createStoreApi, getStoreApi } from '../../services/storeService.js';

const StoreManagement = () => {

  const [loading, setLoading] = useState(false)
  const [stores, setStores] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState(null);

  const formValues = useRef({ storeName: '', email: '', phone: '', address: '', description: '' });

  useState(() => {
    const getData = async (req, res) => {
      setLoading(true)
      try {
        const response = await getStoreApi();

        const result = response?.data;

        if (result === 0) {
          setStores([])
        }
        else {
          setStores(result)
        }

      } catch (error) {
        console.log("Error from server")
        message.error(response.message)
      }
      finally {
        setLoading(false)
      }
    }

    getData()
  }, [])
 

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    formValues.current[name] = value;
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); 

    setLoading(true);

    const payload = {
      storeName: formValues.current.storeName?.trim(),
      email: formValues.current.email?.trim(),
      address: formValues.current.address?.trim(),
      phone: formValues.current.phone?.trim(),
      description: formValues.current.description?.trim()
    };
    
    try {
      const response = await createStoreApi(payload);
      
      if (response?.status === 201) {
        message.success('Successfull create new store ❤️');
        setIsModalOpen(false);
        
        formValues.current = { storeName: '', email: '', phone: '', address: '', description: '' }; 
      }
    } catch (error) {
      console.error("Error when calling API:", error);
      message.error(error.response?.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (key) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this store?',
      content: 'This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk() {
        setStores(stores.filter(item => item.key !== key));
        notification.success({ message: 'The store has been deleted.' });
      }
    });
  };

  const columns = [
    {
      title: 'STORE NAME',
      key: 'storeName',
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center text-lg text-pink-500 ">
            <ShopOutlined />
          </div>
          <div className='flex flex-col p-2'>
             <span className='text-gray-500'><strong>Name:</strong> {record.storeName}</span>
             <span className='text-gray-500'><strong>Code:</strong> {record.storeCode}</span>
          </div>
        </div>
      ),
    },
    {
      title: 'ADDRESS',
      key: 'address',
      render: (_,record) => <span className="text-gray-600 text-sm">{record.address}</span>
    },
    {
      title: 'MANAGER',
      key: 'manager',
      render: (_,record) => 
        (
          <div className='flex flex-col gap-2'>
             <span className={`${record.ownerId === "None" ? 'text-red-400 bg-red-200  text-center rounded-xl' : 'text-green-500 bg-green-300'}`}>OwnerID: {record.ownerId === "None" ? "No owner yet" : record.ownerId }</span>
             <span className={`${record.ownerId === "None" ? 'text-red-400 bg-red-200  text-center rounded-xl' : 'text-green-500 bg-green-300'}`}>OwnerName: {record.ownerName === "None" ? "No owner yet" : record.ownerName } </span>
          </div>
        )
      
    },
    {
      title: 'CONTACT',
      key: 'contact',
      render: (_,record) => (
         <div className='flex flex-col'>
            <span className='text-gray-500'><strong>Email:</strong> {record.email}</span>
            <span className='text-gray-500'><strong>Phone:</strong> {record.phone}</span>
         </div>
      )
    },
    {
      title: 'STATUS',
      key: 'status',
      render: (_,record) => (
        <span className={`font-bold p-1 rounded-sm border-none ${record.status === 'Close' ? 'bg-red-100 text-red-400' : 'bg-green-100 text-green-400'}`}>
          {record.status}
        </span>
      ),
    },
    {
      title: 'ACTIONS',
      key: 'actions',
      render: (_, record) =>  {
        const actionItems = [
          {
            key: 'Edit',
            label: <span className="font-medium text-gray-700">Edit</span>,
            icon: <EditOutlined className="text-green-500" />,
          },
          {
            key: 'Delete',
            label: <span className="font-medium text-gray-700">Delete</span>,
            icon: <DeleteOutlined className="text-blue-500" />,
          },
          { type: 'divider' },
          record.ownerId === 'None' && { 
            key: 'Owner',
            label: <span className="font-medium text-gray-700">Add Owner</span>,
            icon: <UserAddOutlined className="text-blue-500" />,
          }
        ].filter(Boolean);

        return (
          <Dropdown
            menu={{ items: actionItems }}
            trigger={['click']}
            placement="bottomRight"
            classNames={{ root: "shadow-md rounded-lg" }}
          >
            <Button
              type="text"
              shape="circle"
              className="hover:bg-gray-100! flex items-center justify-center m-auto"
              icon={<MoreOutlined className="text-gray-500 text-xl!" />}
            />
          </Dropdown>
        );
      }
    },
  ];

  return (
    <div className="p-4 sm:p-6 md:p-9 flex flex-col gap-6 min-h-screen bg-gray-50/50">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#EE2B6C] m-0">Store Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage and monitor all your pâtisserie locations globally.</p>
        </div>
        <Button
          color="pink"
          variant="solid"
          icon={<PlusOutlined />}
          className="w-full sm:w-auto h-10 font-semibold shadow-sm flex items-center justify-center gap-1.5"
          onClick={() => setIsModalOpen(true)}
        >
          Add New Store
        </Button>
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

      <div className="bg-white rounded-b-2xl shadow-xs overflow-hidden">
        <Spin spinning={loading} >
          <Table
            rowKey="_id"
            columns={columns}
            dataSource={stores}
            pagination={{
              placement: ['bottomRight'],
              defaultPageSize: 4,
              showSizeChanger: false,
              className: "pr-6 py-4"
            }}
          />
        </Spin>
      </div>

      <Modal
        title={<span className="text-xl font-bold text-gray-800">{editingStore ? 'Edit Store Info' : 'Add New Store'}</span>}
        open={isModalOpen}
        confirmLoading={loading}
        onCancel={() => setIsModalOpen(false)}
        okText="Create"
        cancelText="Cancel"
        okButtonProps={{ htmlType: 'submit', form: 'modal-form' }}
        className="rounded-2xl overflow-hidden"
      >
        <form id='modal-form' onSubmit={handleSubmit} className='p-5 flex flex-col gap-5'>
          <div className=' flex flex-col gap-2'>
            <label className="before:content-['*'] before:text-red-500 before:mr-1">Store Name</label>
            <input name='storeName' onChange={handleInputChange} className='border-2 p-2 rounded-sm outline-none' type='string' placeholder='please fill your name' required />
          </div>
          <div className=' flex flex-col gap-2'>
            <label className="before:content-['*'] before:text-red-500 before:mr-1">Email</label>
            <input type="email" name='email' onChange={handleInputChange} className='border-2 p-2 rounded-sm outline-none' type='email' required />
          </div>
          <div className=' flex flex-col gap-2'>
            <label className="before:content-['*'] before:text-red-500 before:mr-1">Phone</label>
            <input name='phone' onChange={handleInputChange} className='border-2 p-2 rounded-sm outline-none' type="string" required />
          </div>
          <div className=' flex flex-col gap-2'>
            <label className="before:content-['*'] before:text-red-500 before:mr-1">Address</label>
            <input name='address' onChange={handleInputChange} className='border-2 p-2 rounded-sm outline-none' type='string' required />
          </div>
          <div className=' flex flex-col gap-2'>
            <label className="before:content-['*'] before:text-red-500 before:mr-1" >Description</label>
            <textarea name='description' onChange={handleInputChange} className='border-2 p-2 rounded-sm outline-none' required />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StoreManagement;