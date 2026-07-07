import React, { useState, useEffect } from 'react';
import {
    Table, Button, Space, Modal, Form, Input,
    Select, InputNumber, DatePicker, Tag, Switch,
    Popconfirm, message, Card, Tooltip
} from 'antd';
import {
    PlusOutlined, EditOutlined, DeleteOutlined,
    SearchOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import {
    getAllPromosApi,
    createPromoApi,
    updatePromoApi,
    deletePromoApi
} from '../../services/promotionService.js';

const { RangePicker } = DatePicker;

function Promotion() {
    const [form] = Form.useForm();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchPromotions = async () => {
        setLoading(true);
        try {
            const response = await getAllPromosApi();
            if (response && response.success) {
                setPromotions(response.data);
            }
        } catch (error) {
            console.error(error);
            message.error(error.response?.data?.message || 'Không thể tải danh sách khuyến mãi!');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPromotions();
    }, []);

    const openCreateModal = () => {
        setEditingId(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const openEditModal = (record) => {
        setEditingId(record._id);
        form.setFieldsValue({
            ...record,
            dateRange: [dayjs(record.startDate), dayjs(record.endDate)]
        });
        setIsModalOpen(true);
    };

    const handleFormSubmit = async (values) => {
        const { dateRange, ...restValues } = values;
        const promotionData = {
            ...restValues,
            code: restValues.code.toUpperCase(),
            startDate: dateRange[0].startOf('day').toDate(),
            endDate: dateRange[1].endOf('day').toDate(),
            maxDiscount: restValues.maxDiscount || 0,
            minOrderValue: restValues.minOrderValue || 0,
        };

        try {
            if (editingId) {
                const response = await updatePromoApi(editingId, promotionData);
                if (response.success) {
                    message.success('Cập nhật chương trình khuyến mãi thành công!');
                }
            } else {
                const response = await createPromoApi(promotionData);
                if (response.success) {
                    message.success('Tạo mới chương trình khuyến mãi thành công! (Giới hạn 10 phiếu) 🎉');
                }
            }
            setIsModalOpen(false);
            fetchPromotions();
        } catch (error) {
            console.error(error);
            message.error(error.response?.message || 'Thao tác thất bại!');
        }
    };

    const handleDelete = async (id) => {
        try {
            const response = await deletePromoApi(id);
            if (response.success) {
                message.success('Đã xóa chương trình khuyến mãi thành công.');
                fetchPromotions();
            }
        } catch (error) {
            message.error(error.response?.data?.message || 'Xóa thất bại!');
        }
    };

    const handleToggleActive = async (checked, record) => {
        try {
            const response = await updatePromoApi(record._id, { isActive: checked });
            if (response.success) {
                message.success(`Đã ${checked ? 'bật' : 'tắt'} hoạt động của mã ${record.code}`);
                setPromotions(prev => prev.map(p => p._id === record._id ? { ...p, isActive: checked } : p));
            }
        } catch (error) {
            message.error('Không thể cập nhật trạng thái!');
        }
    };

    const columns = [
        {
            title: 'Programme',
            dataIndex: 'name',
            key: 'name',
            render: (text) => (
                <div>
                    <div className="font-semibold text-gray-800">{text}</div>
                    <div className="text-xs text-gray-400 mt-0.5">Each customer can use it a maximum of once.</div>
                </div>
            ),
        },
        {
            title: 'Code',
            dataIndex: 'code',
            key: 'code',
            render: (code) => <Tag color="pink" className="font-mono font-bold text-sm px-2.5 py-0.5">{code}</Tag>,
        },
        {
            title: 'Reduction',
            key: 'discount',
            render: (_, record) => record.type === 'percentage'
                ? <span className="font-medium text-pink-600">Decrease {record.value}%</span>
                : <span className="font-medium text-blue-600">-${record.value.toFixed(2)}</span>
        },
        {
            title: 'Minimum Order',
            dataIndex: 'minOrderValue',
            key: 'minOrderValue',
            render: (val) => val > 0 ? `$${val.toFixed(2)}` : '$0.00',
        },
        {
            title: 'Expiry',
            key: 'duration',
            render: (_, record) => (
                <div className="text-xs text-gray-600">
                    <div>From: {dayjs(record.startDate).format('YYYY-MM-DD')}</div>
                    <div>To: {dayjs(record.endDate).format('YYYY-MM-DD')}</div>
                </div>
            )
        },
        {
            title: 'Number of Vouchers (Used/Maximum)',
            key: 'usage',
            render: (_, record) => (
                <Tooltip title={`There are already ${record.usersUsed?.length || 0} customers using this code.`}>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded ${record.usedCount >= record.usageLimit ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-gray-700'}`}>
                        {record.usedCount} / {record.usageLimit} ticket
                    </span>
                </Tooltip>
            )
        },
        {
            title: 'Status',
            dataIndex: 'isActive',
            key: 'isActive',
            render: (isActive, record) => <Switch checked={isActive} onChange={(checked) => handleToggleActive(checked, record)} size="small" />,
        },
        {
            title: 'Action',
            key: 'actions',
            render: (_, record) => (
                <Space size="middle">
                    <Button type="text" icon={<EditOutlined className="text-blue-500" />} onClick={() => openEditModal(record)} />
                    <Popconfirm title="Delete this code?" onConfirm={() => handleDelete(record._id)} okText="Delete" cancelText="Cancel" okButtonProps={{ danger: true }}>
                        <Button type="text" icon={<DeleteOutlined className="text-red-500" />} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const filteredPromotions = promotions.filter(p =>
        p.name.toLowerCase().includes(searchText.toLowerCase()) ||
        p.code.toLowerCase().includes(searchText.toLowerCase())
    );

    return (
        <div className="p-4 sm:p-6 md:p-9 flex flex-col gap-6 min-h-screen bg-gray-50/50">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-[#EE2B6C] m-0">
                        Promotion Management
                    </h1>
                    <p className="text-xs sm:text-sm text-gray-400 m-0 mt-1 font-medium">The system issues a maximum of 10 vouchers/codes. Customers have the option to apply them or save them for a later order.</p>
                </div>
                <Button color="pink" variant="solid" icon={<PlusOutlined />} onClick={openCreateModal} className="w-full sm:w-auto h-10 font-semibold shadow-sm flex items-center justify-center gap-1.5">
                    Create a Promotion Code
                </Button>
            </div>

            <Card className="shadow-sm border-gray-100 rounded-xl overflow-hidden">
                <div className="mb-4 w-full max-w-md">
                    <Input placeholder="Search by name or discount code..." prefix={<SearchOutlined className="text-gray-400" />} value={searchText} onChange={(e) => setSearchText(e.target.value)} allowClear className="h-10 rounded-lg" />
                </div>
                <Table
                    columns={columns}
                    dataSource={filteredPromotions}
                    rowKey="_id"
                    loading={loading}
                    pagination={{
                        total: filteredPromotions.length,
                        pageSize: 5, 
                        showSizeChanger: false,
                        placement: ['bottomRight'],
                        className: "px-6 py-4 border-t border-gray-50 !m-0"
                    }}
                />
            </Card>

            <Modal
                title={<span className="text-lg font-bold text-gray-800">{editingId ?'Edit Program' : 'Create New Program (Limit 10 votes)'}</span>}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onOk={() => form.submit()}
                okText={editingId ? "Update" : "Create new"}
                cancelText="Cancel"
                centered
                width={520}
                okButtonProps={{ className: "bg-pink-600 hover:bg-pink-700 border-none" }}
            >
                <Form form={form} layout="vertical" onFinish={handleFormSubmit} initialValues={{ type: 'percentage', isActive: true, minOrderValue: 0, usageLimit: 10 }} className="pt-3">
                    <Form.Item name="name" label="Program name" rules={[{ required: true, message: 'Please fill in the program name!' }]}>
                        <Input placeholder="Ví dụ: Showing appreciation to our loyal customers..." className="h-10" />
                    </Form.Item>

                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item name="code" label="Code" rules={[{ required: true, message: 'Enter the code!' }, { pattern: /^[A-Za-z0-9]+$/, message: 'No special characters allowed!' }]}>
                            <Input placeholder="Ví dụ: LUCKY10" className="h-10 uppercase font-mono" disabled={!!editingId} />
                        </Form.Item>
                        <Form.Item name="type" label="Type of discount">
                            <Select className="h-10">
                                <Select.Option value="percentage">Percent (%)</Select.Option>
                                <Select.Option value="fixed">Fixed amount ($)</Select.Option>
                            </Select>
                        </Form.Item>
                    </div>

                    <Form.Item dependencies={['type']} noStyle>
                        {({ getFieldValue }) => {
                            const isPercentage = getFieldValue('type') === 'percentage';
                            return (
                                <div className="grid grid-cols-2 gap-4">
                                    <Form.Item name="value" label={isPercentage ? "Decrease Value (%)" : "Decrease Amount ($)"} rules={[{ required: true, message: 'Nhập giá trị!' }]}>
                                        <InputNumber min={1} max={isPercentage ? 100 : 1000} className="w-full h-10 flex items-center" />
                                    </Form.Item>
                                    <Form.Item name="maxDiscount" label="Maximum discount ($)">
                                        <InputNumber min={0} className="w-full h-10 flex items-center" placeholder="Unlimited" />
                                    </Form.Item>
                                </div>
                            );
                        }}
                    </Form.Item>

                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item name="minOrderValue" label="Minimum order ($)">
                            <InputNumber min={0} className="w-full h-10 flex items-center" />
                        </Form.Item>
                        <Form.Item name="usageLimit" label="Number of ballots issued">
                            <InputNumber min={1} max={10} className="w-full h-10 flex items-center" disabled />
                        </Form.Item>
                    </div>

                    <Form.Item name="dateRange" label="Thời gian hiệu lực" rules={[{ required: true, message: 'Choose your validity period!' }]}>
                        <RangePicker className="w-full h-10" format="YYYY-MM-DD" />
                    </Form.Item>

                    <Form.Item name="isActive" valuePropName="checked" label="Activate the code immediately after saving.">
                        <Switch />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}

export default Promotion;