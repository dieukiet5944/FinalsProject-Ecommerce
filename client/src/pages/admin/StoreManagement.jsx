import React, { useEffect, useState } from 'react';
import { Table, Button, Input, InputNumber, Tag, Card, Modal, Form, Select, notification, message, Spin, Dropdown, Descriptions } from 'antd';
import { UserAddOutlined, MoreOutlined, SearchOutlined, FilterOutlined, PlusOutlined, EditOutlined, DeleteOutlined, ShopOutlined } from '@ant-design/icons';
import { createStoreApi, getStoreApi, updateStoreApi, deleteStoreApi } from '../../services/storeService.js';

const StoreManagement = () => {

  const [loading, setLoading] = useState(false)
  const [stores, setStores] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState(null);

  const [form] = Form.useForm();


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


  const handleSubmit = async (values) => {
    setLoading(true);

    const admin = localStorage.getItem('admin');
    const result = JSON.parse(admin);

    const payload = {
      storeName: values.storeName?.trim(),
      email: values.email?.trim(),
      address: values.address?.trim(),
      phone: values.phone?.trim(),
      description: values.description?.trim(),
      staff: Number(values.staff),
      status: values.status,
      ownerId: result?.id,
      ownerName: result?.name
    };

    try {
      let response;

      if (editingStore) {
        response = await updateStoreApi(editingStore, payload);
      } else {
        response = await createStoreApi(payload);
      }

      if (response?.success === true) {
        message.success(
          editingStore
            ? 'Successfully updated store info ✨'
            : 'Successfully created new store ❤️'
        );

        setIsModalOpen(false);
        form.resetFields();
      }
    } catch (error) {
      console.error("Error when calling API:", error);
      message.error(error.response?.data?.message || 'Something went wrong!');
    } finally {
      setLoading(false);
    }
  };

  const handleEditStore = (record) => {
    setEditingStore(record._id);
    setIsModalOpen(true);

    form.setFieldsValue({
      storeName: record.storeName,
      email: record.email,
      phone: record.phone,
      address: record.address,
      staff: record.staff,
      description: record.description,
      status: record.status
    });
  };

  const handleDelete = (record) => {
    const storeId = record._id;

    Modal.confirm({
      title: 'Are you sure you want to delete this store?',
      content: 'This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      async onOk() {
        try {
          await deleteStoreApi(storeId)
          notification.success({ title: 'The store has been deleted successfully.' });
          setStores(prevStores => prevStores.filter(item => item._id !== storeId));

        } catch (error) {
          console.error("Error when delete store:", error);
          notification.error({
            title: 'Failed to delete store',
            description: error.response?.data?.message || 'Something went wrong.'
          });
        }
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
                <span className="inline-block w-fit px-2.5 py-0.5 text-xs font-medium text-green-600 bg-green-50 rounded-md border border-green-100">
                  {record.ownerName}
                </span>
                <span className="inline-block w-fit px-2.5 py-0.5 text-xs font-medium text-gray-600 bg-gray-50 rounded-md border border-gray-100">
                  Staff: {record.staff}
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
      width: 110,
      align: 'center',
      render: (_, record) => {
        const isOpen = record.status === 'Open';

        return (
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border transition-all shadow-3xs ${isOpen
                ? 'bg-emerald-50 text-emerald-600 border-emerald-200/60'
                : 'bg-rose-50 text-rose-600 border-rose-200/60'
              }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isOpen ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            {isOpen ? 'Open' : 'Close'}
          </span>
        );
      }
    },
    {
      title: '',
      key: 'actions',
      width: 60,
      align: 'center',
      render: (_, record) => {
        const actionItems = [
          {
            key: 'edit',
            label: <span className="text-sm text-gray-700 font-medium">Edit Store</span>,
            icon: <EditOutlined className="text-gray-400 text-sm" />,
          },
          ...(record.ownerId === 'None' ? [{
            key: 'owner',
            label: <span className="text-sm text-gray-700 font-medium">Assign Owner</span>,
            icon: <UserAddOutlined className="text-primary-500 text-sm" />,
          }] : []),

          { type: 'divider' },
          {
            key: 'delete',
            label: <span className="text-sm text-red-600 font-medium">Delete</span>,
            icon: <DeleteOutlined className="text-red-400 text-sm" />,
            danger: true,
          },
        ];

        const handleMenuClick = ({ key }) => {
          if (key === 'edit') {
            handleEditStore(record);
          } else if (key === 'delete') {
            handleDelete(record);
          } else if (key === 'owner') {
            // handleAssignOwner(record); (Nếu bạn có làm tính năng này)
          }
        };

        return (
          <Dropdown
            menu={{
              items: actionItems,
              onClick: handleMenuClick
            }}
            trigger={['click']}
            placement="bottomRight"
          >
            <Button
              type="text"
              shape="circle"
              className="flex items-center justify-center hover:bg-gray-100! text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              icon={<MoreOutlined className="text-lg" />}
            />
          </Dropdown>
        );
      }
    },
  ];
  const handleOpenCreate = () => {
    setEditingStore(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const totalBranches = stores.filter(item => item.status === "Open")
  const uniqueRegions = [...new Set(stores.map(store => {
    const parts = store.address?.split(',') || [];
    return parts[parts.length - 1]?.trim() || 'Unknown';
  }))].filter(region => region !== 'Unknown');

  const totalRegions = uniqueRegions.length;
  const regionsDisplay = uniqueRegions.length > 0
    ? uniqueRegions.slice(0, 3).join(', ')
    : 'No regions active';

  const totalStaff = stores.reduce((sum, store) => sum + (Number(store.staff) || 0), 0);

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
          className="w-full sm:w-auto h-10 font-semibold shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
          onClick={handleOpenCreate}
        >
          Add New Store
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-5 flex flex-col gap-3 bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.04)] border border-gray-100">
          <div className="text-xs font-bold text-gray-400 tracking-wider">TOTAL BRANCHES</div>
          <div className="text-4xl font-black text-[#de1e60] my-1">
            {String(totalBranches.length)}
          </div>
          <div className="text-xs font-semibold text-emerald-500">
            ↗ Active branches in system
          </div>
        </Card>

        <Card className="p-5 flex flex-col gap-3 bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.04)] border border-gray-100">
          <div className="text-xs font-bold text-gray-400 tracking-wider">ACTIVE REGIONS</div>
          <div className="text-4xl font-black text-slate-900 my-1">
            {String(totalRegions)}
          </div>
          <div className="text-xs text-gray-500 font-medium truncate" title={regionsDisplay}>
            {regionsDisplay}
          </div>
        </Card>

        <Card className="p-5 flex flex-col gap-3 bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.04)] border border-gray-100">
          <div className="text-xs font-bold text-gray-400 tracking-wider">TOTAL STAFF</div>
          <div className="text-4xl font-black text-slate-900 my-1">
            {String(totalStaff).padStart(2, '0')}
          </div>
          <div className="text-xs font-semibold text-emerald-500">
            ✓ Employed across all stores
          </div>
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
        <Form
          form={form}
          id="modal-form"
          onFinish={handleSubmit}
          layout="vertical"
          requiredMark={false}
          className="pt-4 flex flex-col gap-4 text-sm"
        >
          <Form.Item
            name="storeName"
            label={
              <span className="font-semibold text-gray-700 flex items-center">
                Store Name <span className="text-red-500 ml-1">*</span>
              </span>
            }
            rules={[{ required: true, message: 'Please enter store name' }]}
            className="mb-0"
          >
            <Input
              placeholder="e.g. The Crumb & Bean District 1"
              className="w-full px-3.5 py-2 border border-gray-200 rounded-xl outline-none text-gray-800 placeholder-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 transition-all"
            />
          </Form.Item>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Form.Item
              name="email"
              label={
                <span className="font-semibold text-gray-700 flex items-center">
                  Email Address <span className="text-red-500 ml-1">*</span>
                </span>
              }
              rules={[
                { required: true, message: 'Please enter email address' },
                { type: 'email', message: 'Please enter a valid email' }
              ]}
              className="mb-0"
            >
              <Input
                placeholder="store@example.com"
                className="w-full px-3.5 py-2 border border-gray-200 rounded-xl outline-none text-gray-800 placeholder-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 transition-all"
              />
            </Form.Item>

            <Form.Item
              name="phone"
              label={
                <span className="font-semibold text-gray-700 flex items-center">
                  Phone Number <span className="text-red-500 ml-1">*</span>
                </span>
              }
              rules={[{ required: true, message: 'Please enter phone number' }]}
              className="mb-0"
            >
              <Input
                placeholder="0901234567"
                className="w-full px-3.5 py-2 border border-gray-200 rounded-xl outline-none text-gray-800 placeholder-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 transition-all"
              />
            </Form.Item>
          </div>

          <Form.Item
            name="address"
            label={
              <span className="font-semibold text-gray-700 flex items-center">
                Address <span className="text-red-500 ml-1">*</span>
              </span>
            }
            rules={[{ required: true, message: 'Please enter store address' }]}
            className="mb-0"
          >
            <Input
              placeholder="Enter store full address"
              className="w-full px-3.5 py-2 border border-gray-200 rounded-xl outline-none text-gray-800 placeholder-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 transition-all"
            />
          </Form.Item>

          <Form.Item
            name="status"
            label={
              <span className="font-semibold text-gray-700 flex items-center">
                Status <span className="text-red-500 ml-1">*</span>
              </span>
            }
            initialValue="Open"
            rules={[{ required: true, message: 'Please select store status' }]}
            className="mb-0"
          >
            <Select
              className="w-full h-10 border border-gray-200 rounded-xl outline-none text-gray-800 placeholder-gray-400 focus:border-primary-500 transition-all"
              options={[
                { value: 'Open', label: <span className="text-emerald-600 font-medium">● Open (Active)</span> },
                { value: 'Close', label: <span className="text-rose-600 font-medium">● Close (Inactive)</span> },
              ]}
            />
          </Form.Item>

          <Form.Item
            name="staff"
            label={
              <span className="font-semibold text-gray-700 flex items-center">
                Staff <span className="text-red-500 ml-1">*</span>
              </span>
            }
            rules={[{ required: true, message: 'Please enter staff quantity' }]}
            className="mb-0"
          >
            <InputNumber
              placeholder="Enter staff quantity"
              min={1}
              className="w-full px-3.5 py-1 border border-gray-200 rounded-xl outline-none text-gray-800 placeholder-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 transition-all flex items-center"
            />
          </Form.Item>

          <Form.Item
            name="description"
            label={
              <span className="font-semibold text-gray-700 flex items-center">
                Description <span className="text-red-500 ml-1">*</span>
              </span>
            }
            rules={[{ required: true, message: 'Please enter brief description' }]}
            className="mb-0"
          >
            <Input.TextArea
              placeholder="Write a brief description about this store branch..."
              rows={3}
              className="w-full px-3.5 py-2 border border-gray-200 rounded-xl outline-none text-gray-800 placeholder-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 transition-all resize-none"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default StoreManagement;