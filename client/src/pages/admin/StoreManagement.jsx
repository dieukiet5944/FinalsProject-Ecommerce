import React, { useEffect, useState, useRef } from 'react';
import { Table, Button, Input, Tag, Card, Modal, Form, Select, notification, message, Spin, Dropdown, Descriptions } from 'antd';
import { UserAddOutlined, MoreOutlined, SearchOutlined, FilterOutlined, PlusOutlined, EditOutlined, DeleteOutlined, ShopOutlined } from '@ant-design/icons';
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
      title: 'STORE INFO',
      key: 'storeName',
      render: (_, record) => (
        <div className="flex items-center gap-3 py-1">
          <div className="w-9 h-9 rounded-xl bg-primary-500/10 flex items-center justify-center text-base text-primary-500 shrink-0">
            <ShopOutlined />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-sm text-gray-800 truncate">
              {record.storeName}
            </span>
            <span className="text-xs font-mono text-gray-400 mt-0.5">
              {record.storeCode}
            </span>
          </div>
        </div>
      ),
    },
    {
      title: 'ADDRESS',
      key: 'address',
      render: (_, record) => (
        <span className="text-gray-600 text-xs md:text-sm font-medium block max-w-50 truncate">
          {record.address}
        </span>
      ),
    },
    {
      title: 'MANAGER',
      key: 'manager',
      render: (_, record) => {
        const hasOwner = record.ownerId !== "None";
        return (
          <div className="flex flex-col gap-1 max-w-40">
            {hasOwner ? (
              <>
                <span className="text-sm font-semibold text-gray-800 truncate">
                  {record.ownerName}
                </span>
                <span className="text-xs font-mono text-gray-400 truncate">
                  ID: {record.ownerId}
                </span>
              </>
            ) : (
              <span className="inline-block w-fit px-2.5 py-0.5 text-xs font-medium text-red-600 bg-red-50 rounded-md border border-red-100">
                Vacant
              </span>
            )}
          </div>
        );
      }
    },
    {
      title: 'CONTACT',
      key: 'contact',
      render: (_, record) => (
        <div className="flex flex-col text-xs md:text-sm">
          <span className="text-gray-700 font-medium truncate max-w-45">
            {record.email}
          </span>
          <span className="text-gray-400 text-xs font-mono mt-0.5">
            {record.phone}
          </span>
        </div>
      )
    },
    {
      title: 'STATUS',
      key: 'status',
      width: 100,
      render: (_, record) => {
        const isClose = record.status === 'Close';
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase border ${isClose
            ? 'bg-red-50 text-red-600 border-red-100'
            : 'bg-green-50 text-green-600 border-green-100'
            }`}>
            {record.status}
          </span>
        );
      },
    },
    {
      title: '',
      key: 'actions',
      width: 60,
      align: 'center',
      render: (_, record) => {
        const actionItems = [
          {
            key: 'Edit',
            label: <span className="text-sm text-gray-700 font-medium">Edit Store</span>,
            icon: <EditOutlined className="text-gray-400 text-sm" />,
          },
          record.ownerId === 'None' && {
            key: 'Owner',
            label: <span className="text-sm text-gray-700 font-medium">Assign Owner</span>,
            icon: <UserAddOutlined className="text-primary-500 text-sm" />,
          },
          { type: 'divider' },
          {
            key: 'Delete',
            label: <span className="text-sm text-red-600 font-medium">Delete</span>,
            icon: <DeleteOutlined className="text-red-400 text-sm" />,
            danger: true,
          },
        ].filter(Boolean);

        return (
          <Dropdown
            menu={{ items: actionItems }}
            trigger={['click']}
            placement="bottomRight"
          >
            <Button
              type="text"
              shape="circle"
              className="flex items-center justify-center hover:bg-gray-100! text-gray-400 hover:text-gray-600 transition-colors"
              icon={<MoreOutlined className="text-lg" />}
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
        <Spin spinning={loading}>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <Table
              rowKey="_id"
              columns={columns}
              dataSource={stores}
              size="middle"
              pagination={{
                placement: ['bottomRight'],
                defaultPageSize: 4,
                showSizeChanger: false,
                className: "px-6 py-4 border-t border-gray-50 !m-0"
              }}
              className="[&_.ant-table-thead_th]:bg-transparent [&_.ant-table-thead_th]:text-gray-400 [&_.ant-table-thead_th]:text-[11px] [&_.ant-table-thead_th]:font-bold [&_.ant-table-thead_th]:tracking-wider [&_.ant-table-thead_th]:uppercase"
            />
          </div>
        </Spin>
      </div>

      <Modal
        title={
          <span className="text-lg font-bold font-heading text-gray-800 block pb-1">
            {editingStore ? 'Edit Store Info' : 'Add New Store'}
          </span>
        }
        open={isModalOpen}
        confirmLoading={loading}
        onCancel={() => setIsModalOpen(false)}
        okText={editingStore ? "Save Changes" : "Create Store"}
        cancelText="Cancel"
        okButtonProps={{
          htmlType: 'submit',
          form: 'modal-form',
          className: "bg-primary-500 hover:bg-primary-600! font-semibold px-4 rounded-xl shadow-sm cursor-pointer"
        }}
        cancelButtonProps={{
          className: "rounded-xl font-medium"
        }}
        centered
        width={520} 
      >
        <form
          id="modal-form"
          onSubmit={handleSubmit}
          className="pt-4 flex flex-col gap-4 text-sm"
        >
          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-gray-700 flex items-center">
              Store Name <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              name="storeName"
              onChange={handleInputChange}
              type="text"
              placeholder="e.g. The Crumb & Bean District 1"
              className="w-full px-3.5 py-2 border border-gray-200 rounded-xl outline-none text-gray-800 placeholder-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 transition-all"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-gray-700 flex items-center">
                Email Address <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                name="email"
                onChange={handleInputChange}
                type="email"
                placeholder="store@example.com"
                className="w-full px-3.5 py-2 border border-gray-200 rounded-xl outline-none text-gray-800 placeholder-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 transition-all"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-gray-700 flex items-center">
                Phone Number <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                name="phone"
                onChange={handleInputChange}
                type="text"
                placeholder="0901234567"
                className="w-full px-3.5 py-2 border border-gray-200 rounded-xl outline-none text-gray-800 placeholder-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 transition-all"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-gray-700 flex items-center">
              Address <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              name="address"
              onChange={handleInputChange}
              type="text"
              placeholder="Enter store full address"
              className="w-full px-3.5 py-2 border border-gray-200 rounded-xl outline-none text-gray-800 placeholder-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 transition-all"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-gray-700 flex items-center">
              Description <span className="text-red-500 ml-1">*</span>
            </label>
            <textarea
              name="description"
              onChange={handleInputChange}
              placeholder="Write a brief description about this store branch..."
              rows={3}
              className="w-full px-3.5 py-2 border border-gray-200 rounded-xl outline-none text-gray-800 placeholder-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 transition-all resize-none"
              required
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StoreManagement;