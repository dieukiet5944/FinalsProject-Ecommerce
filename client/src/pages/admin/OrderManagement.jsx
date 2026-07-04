import React, { useState, useEffect, useMemo } from 'react'
import { Table, Tag, Avatar, Space, Button, Spin, Modal, Dropdown, message } from 'antd';
import { MoreOutlined, EyeOutlined, CheckCircleOutlined, CloseCircleOutlined, DeleteOutlined, AuditOutlined, EditOutlined } from '@ant-design/icons'
import { deleteOrdersApi, putOrderApi, putStatusOrderApi, getOrdersApi } from '../../services/orderService.js';
import { getUsersApi } from '../../services/userService.js';
import { getProductsApi } from '../../services/productService.js';
import dayjs from 'dayjs';


const Orders = () => {
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [dataUsers, setDataUsers] = useState([])
  const [dataSource, setDataSource] = useState([])
  const [dataProducts, setDataProducts] = useState([])
  const [loading, setLoading] = useState(false);

  const [selectedOrder, setSelectedOrder] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return '#1890ff';
      case 'Completed': return '#52c41a';
      case 'Canceled': return '#f5222d';
      default: return '#888';
    }
  };
  const handleCancel = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);

  }

  const handleDelete = (order) => {
    Modal.confirm({
      title: 'Confirm order deletion',
      content: `Are you sure you want to delete order ${order._id}? This action cannot be completed.`,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          const response = await deleteOrderApi(order._id);

          if (response && response?.success) {
            setDataSource(prevSource => prevSource.filter(item => item.id !== order._id));
            message.success(`Order ${order._id} has been successfully deleted!`);

            if (selectedOrder && selectedOrder.id === order._id) {
              setIsModalOpen(false);
              setSelectedOrder(null);
            }
          } else {
            throw new Error("API Delete Failed");
          }
        } catch (error) {
          console.error("Delete Error:", error);
          message.error(error.response?.message || "The order cannot be deleted!");
        }
      },
    });
  };

  const handleFilter = (status) => {
    setFilterStatus(status);
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {

      const targetOrder = dataSource.find(order => order._id === orderId);

      if (!targetOrder) {
        message.error("Can not find this info in UI!");
        return;
      }

      const response = await putOrderApi(orderId, { status: newStatus });

      if (response && response?.success) {

        setDataSource(prevSource =>
          prevSource.map(order =>
            order._id === orderId ? { ...order, status: newStatus } : order
          )
        );

        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder(prev => ({ ...prev, status: newStatus }));
        }

        message.success(`Order ${orderId} is now ${newStatus}`);
      } else {
        throw new Error("API Update Failed");
      }
    } catch (error) {
      console.error("Update Error:", error);
      message.error(error.response?.message || "Update the failure status!");
    }
  };

  const handleAcceptOrder = async (orderId) => {
    try {
      const response = await putStatusOrderApi(orderId);

      message.success('Order accepted successfully');
    } catch (error) {
      message.error('Failed to accept order');
    }
  };



  const categoryStats = useMemo(() => {
    const lookup = {};

    if (dataProducts && dataProducts.length > 0) {
      dataProducts.forEach(p => {
        if (p._id) {
          lookup[p._id] = p.category;
        }
      });
    }

    return dataSource
      .filter(order => order.status === 'Completed')
      .reduce((stats, order) => {
        order.items?.forEach(item => {
          const pId = item.productId || item.product?._id || item._id;
          if (!pId) return;

          const orderProductId = pId.toString().toLowerCase().trim();
          const category = lookup[orderProductId];

          const cleanCategory = category ? category.toLowerCase() : '';

          if (cleanCategory === 'cake') {
            stats.cake += Number(item.qty || 0);
          } else if (cleanCategory === 'drink') {
            stats.drink += Number(item.qty || 0);
          }
        });
        return stats;
      }, { cake: 0, drink: 0 });
  }, [dataSource, dataProducts]);

  const totalCakes = categoryStats.cake;
  const totalDrinks = categoryStats.drink;


  const loadOrdersData = async () => {
    setLoading(true);
    try {

      const [usersRes, productsRes, ordersRes] = await Promise.all([
        getUsersApi(),
        getProductsApi(),
        getOrdersApi()
      ]);

      const listUsers = usersRes?.data;
      const listProducts = productsRes?.data;
      const listOrders = ordersRes?.data;

      const allOrders = listOrders.map(order => {

        const totalQty = order.items?.reduce((sum, item) => sum + Number(item.qty), 0);
        const calculatedTotal = order.items?.reduce((sum, item) => sum + (Number(item.qty) * Number(item.price)), 0);


        const matchedUser = listUsers.find(u => u._id === order.customerId);

        const singleOrderTime = order.createdAt
          ? dayjs(order.createdAt).format('HH:mm - DD/MM/YYYY')
          : 'Time unknown';

        return {
          ...order,
          key: order.id || order._id,
          productNames: order.items?.map(item => item.name).join(", ").substring(0, 30) + "...",
          quantity: totalQty,
          sumOrders: calculatedTotal,
          status: order.status,
          date: singleOrderTime,
          customer: {
            name: matchedUser?.username || matchedUser?.name,
            avatar: matchedUser?.avatar || "",
            email: matchedUser?.email,
            userId: order.customerId
          }
        };
      });

      setDataProducts(listProducts);
      setDataUsers(listUsers);
      setDataSource(allOrders);


    } catch (error) {
      console.error("Error loading order:", error);
      message.error("Unable to load the data list from the system!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrdersData();
  }, []);

  const filteredData = filterStatus === 'ALL'
    ? dataSource
    : dataSource.filter(item => item.status === filterStatus);

  const columns = [
    {
      title: 'ORDER ID',
      dataIndex: '_id',
      key: '_id',
      width: 130,
      render: (_, record) => (
        <span className="text-gray-800 font-mono font-bold text-sm tracking-wide">
          {`ORD-${String(record._id).slice(-5).toUpperCase()}`}
        </span>
      ),
    },
    {
      title: 'CUSTOMER',
      dataIndex: 'customer',
      key: 'customer',
      width: 260,
      render: (customer) => (
        <div className="flex items-center gap-3 py-0.5">
          <Avatar
            src={`/product/avtusers/${customer?.avatar || 'none-avt.png'}`}
            size={40}
            className="border border-gray-100 shadow-3xs shrink-0 object-cover"
          />
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-gray-800 text-sm truncate leading-tight">
              {customer?.name}
            </span>
            <span className="text-xs text-gray-400 font-medium truncate mt-0.5">
              {customer?.email}
            </span>
          </div>
        </div>
      ),
    },
    {
      title: 'DATE',
      dataIndex: 'date',
      key: 'date',
      width: 140,
      render: (date) => (
        <span className="text-gray-500 font-medium text-xs md:text-sm">
          {date}
        </span>
      ),
    },
    {
      title: 'TOTAL',
      dataIndex: 'sumOrders',
      key: 'sumOrders',
      width: 130,
      render: (sumOrders) => (
        <span className="font-bold text-gray-900 text-sm md:text-base">
          ${Number(sumOrders).toFixed(2)}
        </span>
      ),
    },
    {
      title: 'STATUS',
      key: 'status',
      dataIndex: 'status',
      width: 130,
      render: (status) => {
        let badgeStyle = 'bg-gray-50 text-gray-600 border-gray-200';
        if (status === 'Pending') badgeStyle = 'bg-blue-50 text-blue-600 border-blue-100';
        if (status === 'Completed') badgeStyle = 'bg-green-50 text-green-600 border-green-100';
        if (status === 'Canceled') badgeStyle = 'bg-red-50 text-red-600 border-red-100';

        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border ${badgeStyle}`}>
            {status}
          </span>
        );
      },
    },
    {
      title: '',
      key: 'action',
      width: 60,
      align: 'center',
      render: (_, record) => {
        const viewDetailsItem = {
          key: 'vieworder',
          label: <span className="text-sm text-gray-700 font-medium">View Details</span>,
          icon: <EyeOutlined className="text-gray-400 text-sm" />,
          onClick: () => handleViewOrder(record)
        };

        const acceptItem = {
          key: 'accept',
          label: <span className="text-sm text-gray-700 font-medium">Accept Order</span>,
          icon: <CheckCircleOutlined className="text-green-500 text-sm" />,
          onClick: () => handleAcceptOrder(record._id)
        };

        const rejectItem = {
          key: 'cancel',
          label: <span className="text-sm text-red-600 font-medium">Reject</span>,
          icon: <CloseCircleOutlined className="text-red-400 text-sm" />,
          danger: true,
          onClick: () => handleUpdateStatus(record._id, 'Canceled')
        };

        let menuItems = [viewDetailsItem];

        switch (record.status) {
          case 'Pending':
            menuItems.push(acceptItem, rejectItem);
            break;
          case 'Completed':
          case 'Canceled':
            break;
          default:
            break;
        }

        return (
          <Dropdown
            menu={{ items: menuItems }}
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
      },
    }
  ];

  return (
    <div className="p-4 sm:p-6 md:p-9 flex flex-col gap-6 min-h-screen bg-gray-50/50">

      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#EE2B6C] m-0">Order Management</h1>
        <p className="text-xs sm:text-sm text-gray-400 m-0 mt-1 font-medium">Efficiently process and track your bakery's daily flow</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">

        <div className="p-5 flex flex-col gap-2 border border-blue-100 bg-blue-50/60 rounded-xl shadow-[0_4px_12px_rgba(38,100,235,0.03)]">
          <p className="text-xs font-bold tracking-wider text-blue-700/80 m-0">COMPLETE ORDERS</p>
          <h2 className="text-xl sm:text-2xl font-extrabold text-blue-600 m-0"><AuditOutlined /> {dataSource.reduce((init, item) => { return item.status === "Completed" ? init += 1 : init }, 0)}</h2>
        </div>

        <div className="p-5 flex flex-col gap-2 bg-amber-50/60 border border-amber-100 rounded-xl shadow-[0_4px_12px_rgba(217,119,6,0.03)]">
          <p className="text-xs font-bold tracking-wider text-amber-800 m-0">ITEMS SOLD</p>
          <div className="flex justify-between items-center text-xs sm:text-sm text-amber-800 font-semibold mt-1">
            <span>Cakes: <b className="text-amber-600 font-bold text-base">{totalCakes}</b> units</span>
            <span>Drinks: <b className="text-amber-600 font-bold text-base">{totalDrinks}</b> units</span>
          </div>
        </div>

        <div className="p-5 flex flex-col gap-2 bg-emerald-50/60 border border-emerald-100 rounded-xl shadow-[0_4px_12px_rgba(16,185,129,0.03)] sm:col-span-2 lg:col-span-1">
          <p className="text-xs font-bold tracking-wider text-emerald-800 m-0">TOTAL ORDERS</p>
          <h2 className="text-xl sm:text-2xl font-extrabold text-emerald-600 m-0">{dataSource.length}</h2>
        </div>

      </div>

      <div className="flex justify-center items-center py-2">
        <div className="inline-grid grid-cols-2 sm:grid-cols-4 bg-gray-200/60 p-1 rounded-xl w-full max-w-85 sm:max-w-125 gap-1 text-center">
          <button
            className="py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all text-gray-600 hover:text-gray-900 focus:bg-white focus:text-gray-800 focus:shadow-sm active:bg-white active:shadow-sm"
            onClick={() => handleFilter('ALL')}
          >
            ALL
          </button>
          <button
            className="py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all text-gray-600 hover:text-gray-900 focus:bg-white focus:text-blue-600 focus:shadow-sm active:bg-white active:shadow-sm"
            onClick={() => handleFilter('Pending')}
          >
            PENDING
          </button>
          <button
            className="py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all text-gray-600 hover:text-gray-900 focus:bg-white focus:text-green-600 focus:shadow-sm active:bg-white active:shadow-sm"
            onClick={() => handleFilter('Completed')}
          >
            COMPLETED
          </button>
          <button
            className="py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all text-gray-600 hover:text-gray-900 focus:bg-white focus:text-red-500 focus:shadow-sm active:bg-white active:shadow-sm"
            onClick={() => handleFilter('Canceled')}
          >
            CANCELLED
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={filteredData}
            size="middle"
            scroll={{ x: 800 }}
            pagination={{
              pageSize: 5,
              placement: ['bottomRight'],
              showSizeChanger: false,
              className: "px-6 py-4 border-t border-gray-50 !m-0"
            }}
            className="w-full [&_.ant-table-thead_th]:bg-transparent [&_.ant-table-thead_th]:text-gray-400 [&_.ant-table-thead_th]:text-[11px] [&_.ant-table-thead_th]:font-bold [&_.ant-table-thead_th]:tracking-wider [&_.ant-table-thead_th]:uppercase"
          />
        </Spin>

        <div className="px-6 py-4 border-t border-gray-50 bg-gray-50/40 flex items-center justify-between">
          <div className="text-xs text-gray-400 font-medium">
            Showing <span className="font-semibold text-gray-600">1</span> to{' '}
            <span className="font-semibold text-gray-600">{Math.min(5, filteredData.length)}</span> of{' '}
            <span className="font-semibold text-gray-600">{filteredData.length}</span> records
          </div>
        </div>
      </div>

      <Modal
        title={
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Receipt Details</span>
            <span className="text-base sm:text-lg font-mono font-bold text-gray-800 tracking-wide">
              {selectedOrder ? `ORD-${String(selectedOrder._id || selectedOrder.orderId).slice(-5).toUpperCase()}` : ''}
            </span>
          </div>
        }
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        centered
        width={440} 
      >
        {selectedOrder && (
          <div className="text-gray-700 text-sm pt-4 flex flex-col gap-5">

            <div className="flex justify-between items-center bg-gray-50/50 p-3.5 rounded-xl border border-gray-100 text-xs sm:text-sm">
              <div className="flex flex-col gap-0.5">
                <span className="text-gray-400 font-medium text-[11px] uppercase tracking-wider">Date Created</span>
                <span className="text-gray-700 font-semibold">{selectedOrder.date}</span>
              </div>

              <span
                className="font-bold px-3 py-0.5 rounded-full text-[10px] tracking-wider uppercase border"
                style={{
                  color: getStatusColor(selectedOrder.status),
                  backgroundColor: `${getStatusColor(selectedOrder.status)}10`,
                  borderColor: `${getStatusColor(selectedOrder.status)}25`
                }}
              >
                {selectedOrder.status}
              </span>
            </div>

            <div>
              <h3 className="text-xs font-bold text-gray-400 tracking-wider uppercase mb-3">Items Ordered</h3>
              <div className="max-h-60 overflow-y-auto pr-1 space-y-3 scrollbar-none">
                {selectedOrder.items?.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center pb-3 border-b border-dashed border-gray-100 last:border-0 last:pb-0 gap-4"
                  >
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-gray-800 text-sm sm:text-base truncate">
                        {item.name}
                      </span>
                      <span className="text-xs text-gray-400 mt-0.5 font-mono font-medium">
                        {item.qty} × ${Number(item.price).toFixed(2)}
                      </span>
                    </div>

                    <b className="text-gray-800 font-mono text-sm sm:text-base shrink-0 pl-2">
                      ${(item.qty * item.price).toFixed(2)}
                    </b>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-3xs mt-2">
              <span className="text-sm text-gray-800 font-bold">Total Amount</span>
              <b className="text-xl sm:text-2xl text-primary-500 font-extrabold tracking-tight">
                ${Number(selectedOrder.sumOrders || selectedOrder.totalPrice).toFixed(2)}
              </b>
            </div>

          </div>
        )}
      </Modal>
    </div>
  );
}

export default Orders