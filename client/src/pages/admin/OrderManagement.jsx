import React, { useState, useEffect, useMemo } from 'react'
import { Table, Tag, Avatar, Space, Button, Spin, Modal, Dropdown, message } from 'antd';
import { MoreOutlined, EyeOutlined, CheckCircleOutlined, CloseCircleOutlined, DeleteOutlined, AuditOutlined, EditOutlined } from '@ant-design/icons'
import axios from 'axios';
import { API_URL } from '../../config/api.js';

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
          const response = await axios.delete(`${API_URL}/orders/${order._id}`);

          if (response && response.data.success) {
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
          message.error(error.response?.data?.message || "The order cannot be deleted!");
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
        message.error("Không tìm thấy thông tin đơn hàng này trên giao diện!");
        return;
      }

      const userOwner = dataUsers.find(item => item.id === targetOrder.customerId);

      const response = await axios.put(`${API_URL}/orders/${orderId}`,
        { status: newStatus }
      );

      if (response && response.data.success) {

        setDataSource(prevSource =>
          prevSource.map(order =>
            order.id === orderId ? { ...order, status: newStatus } : order
          )
        );

        if (userOwner) {
          const updatedUser = { ...userOwner, status: newStatus };
          setDataUsers(prevUsers =>
            prevUsers.map(u => u.id === userOwner.id ? updatedUser : u)
          );
        }

        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(prev => ({ ...prev, status: newStatus }));
        }

        message.success(`Order ${orderId} is now ${newStatus}`);
      } else {
        throw new Error("API Update Failed");
      }
    } catch (error) {
      console.error("Update Error:", error);
      message.error(error.response?.data?.message || "Update the failure status!");
    }
  };

  const handleAcceptOrder = async (orderId) => {
    try {
      const response = await axios.put(`${API_URL}/orders/changestate/${orderId}`);

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

      const usersRes = await axios.get(`${API_URL}/users`);
      const productsRes = await axios.get(`${API_URL}/products`);
      const ordersRes = await axios.get(`${API_URL}/orders`);

      const listUsers = usersRes.data?.data;
      const listProducts = productsRes.data?.data;
      const listOrders = ordersRes.data?.data;

      const allOrders = listOrders.map(order => {

        const totalQty = order.items?.reduce((sum, item) => sum + Number(item.qty), 0);
        const calculatedTotal = order.items?.reduce((sum, item) => sum + (Number(item.qty) * Number(item.price)), 0);


        const matchedUser = listUsers.find(u => u._id === order.customerId);

        const singleOrderTime = order.createdAt
          ? dayjs(order.createdAt).format('HH:mm - DD/MM/YYYY')
          : 'Không rõ thời gian';

        return {
          ...order,
          key: order.id || order._id,
          productNames: order.items?.map(item => item.name).join(", ").substring(0, 30) + "...",
          quantity: totalQty,
          sumOrders: calculatedTotal,
          status: order.status,
          date: singleOrderTime,
          customer: {
            name: matchedUser?.username || matchedUser?.name || "Khách vãng lai",
            avatar: matchedUser?.avatar || "",
            email: matchedUser?.email || "No email",
            userId: order.customerId
          }
        };
      });

      setDataProducts(listProducts);
      setDataUsers(listUsers);
      setDataSource(allOrders);


    } catch (error) {
      console.error("Error loading order:", error);
      message.error("Không thể tải danh sách dữ liệu từ hệ thống!");
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
      width: 120,
      render: (_, record) => (
        <span className="text-[#ff4d4f] font-bold text-sm sm:text-base">
          {`ORD-${record._id.toString().slice(2,5)}`}
        </span>
      ),
    },
    {
      title: 'CUSTOMER',
      dataIndex: 'customer',
      key: 'customer',
      width: 250,
      render: (customer) => (
        <div className="flex items-center gap-3">
          {console.log("Data", dataSource)}
          <Avatar
            src={`/product/avtusers/${customer.avatar}`}
            size={44}
            className="border border-gray-100 shrink-0 object-cover"
          />
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-gray-800 text-sm sm:text-base truncate leading-snug">
              {customer.name}
            </span>
            <span className="text-xs text-gray-400 font-medium truncate mt-0.5">
              {customer.email}
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
        <span className="text-gray-500 font-medium text-sm">
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
        <span className="font-bold text-gray-800 text-sm sm:text-base">
          ${sumOrders.toFixed(2)}
        </span>
      ),
    },
    {
      title: 'STATUS',
      key: 'status',
      dataIndex: 'status',
      width: 140,
      render: (status) => {
        let color = 'default';
        if (status === 'Pending') color = 'blue';
        if (status === 'Completed') color = 'success';
        if (status === 'Canceled') color = 'error';

        return (
          <Tag
            color={color}
            className="rounded-full font-bold px-3 py-0.5 text-[11px] tracking-wider uppercase"
          >
            {status}
          </Tag>
        );
      },
    },
    {
      title: 'ACTIONS',
      key: 'action',
      width: 80,
      align: 'center',
      render: (_, record) => {

        const viewDetailsItem = {
          key: 'vieworder',
          label: <span className="font-medium text-gray-700">View Details</span>,
          icon: <EyeOutlined className="text-gray-400" />,
          onClick: () => handleViewOrder(record)
        };

        const acceptItem = {
          key: 'accept',
          label: <span className="font-medium text-gray-700">Accept</span>,
          icon: <CheckCircleOutlined className="text-green-500" />,
          onClick: () => handleAcceptOrder(record._id)
        };
        const rejectItem = {
          key: 'cancel',
          label: <span className="font-medium">Reject</span>,
          icon: <CloseCircleOutlined />,
          danger: true,
          onClick: () => handleUpdateStatus(record._id, 'Canceled')
        };

        const deleteItem = {
          key: 'delete',
          label: <span className="font-medium">Delete</span>,
          icon: <DeleteOutlined />,
          danger: true,
          onClick: () => handleDelete(record)
        };

        let menuItems = [viewDetailsItem];

        switch (record.status) {
          case 'Pending':
            menuItems.push(acceptItem, rejectItem);
            break;
          case 'Completed':
            menuItems
            break;
          case 'Canceled':
            break;
          default:
            return null;
        }

        return (
          <Dropdown
            menu={{ items: menuItems }}
            trigger={['click']}
            placement="bottomRight"
            overlayClassName="shadow-md rounded-lg"
          >
            <Button
              type="text"
              shape="circle"
              className="hover:bg-gray-100 flex items-center justify-center m-auto"
              icon={<MoreOutlined className="text-gray-500 text-xl" />}
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

      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-[0_4px_12px_rgba(0,0,0,0.02)] border border-gray-100 relative flex flex-col gap-5">
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={filteredData}
            pagination={{ pageSize: 5, placement: 'bottomRight' }}
            scroll={{ x: 800 }}
            className="w-full"
          />
        </Spin>

        <div className="sm:absolute bottom-7 left-6 text-xs sm:text-sm text-gray-400 font-medium mt-2 sm:mt-0 text-center sm:text-left">
          Showing 1 to 5 of {filteredData.length} records
        </div>
      </div>

      <Modal
        title={<span className="text-base sm:text-lg font-bold text-gray-800">Receipt: {selectedOrder?.orderId}</span>}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        width={500}
        className="max-w-[calc(100vw-32px)] sm:max-w-125"
      >
        {selectedOrder && (
          <div className="text-gray-700 text-sm mt-4 space-y-5">

            <div className="flex justify-between items-center pb-3 border-b border-gray-100 text-xs sm:text-sm">
              <span className="text-gray-500 font-medium">
                Date: <span className="text-gray-800 font-semibold">{selectedOrder.date}</span>
              </span>
              <span
                className="font-bold px-2.5 py-0.5 rounded-md text-xs uppercase tracking-wide"
                style={{
                  color: getStatusColor(selectedOrder.status),
                  backgroundColor: `${getStatusColor(selectedOrder.status)}12`
                }}
              >
                Status: {selectedOrder.status}
              </span>
            </div>

            <div className="max-h-65 overflow-y-auto pr-1 space-y-3 scrollbar-thin">
              {selectedOrder.items?.map((item, index) => (
                <div key={index} className="flex justify-between items-center pb-2 border-b border-dashed border-gray-100 last:border-0 last:pb-0 gap-4">
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-gray-800 text-sm sm:text-base truncate">{item.name}</span>
                    <span className="text-xs text-gray-400 mt-0.5 font-medium">
                      {item.qty} x ${Number(item.price).toFixed(2)}
                    </span>
                  </div>
                  <b className="text-gray-800 text-sm sm:text-base shrink-0 pl-2">
                    ${(item.qty * item.price).toFixed(2)}
                  </b>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
              <span className="text-sm sm:text-base text-gray-500 font-semibold">Total Amount:</span>
              <b className="text-lg sm:text-xl text-red-500 font-extrabold">
                ${Number(selectedOrder.sumOrders).toFixed(2)}
              </b>
            </div>

          </div>
        )}
      </Modal>
    </div>
  );
}

export default Orders