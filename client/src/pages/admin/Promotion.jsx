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
            title: 'Chương Trình',
            dataIndex: 'name',
            key: 'name',
            render: (text) => (
                <div>
                    <div className="font-semibold text-gray-800">{text}</div>
                    <div className="text-xs text-gray-400 mt-0.5">Mỗi khách hàng dùng tối đa 1 lần</div>
                </div>
            ),
        },
        {
            title: 'Mã Code',
            dataIndex: 'code',
            key: 'code',
            render: (code) => <Tag color="pink" className="font-mono font-bold text-sm px-2.5 py-0.5">{code}</Tag>,
        },
        {
            title: 'Mức Giảm',
            key: 'discount',
            render: (_, record) => record.type === 'percentage'
                ? <span className="font-medium text-pink-600">Giảm {record.value}%</span>
                : <span className="font-medium text-blue-600">-${record.value.toFixed(2)}</span>
        },
        {
            title: 'Đơn Tối Thiểu',
            dataIndex: 'minOrderValue',
            key: 'minOrderValue',
            render: (val) => val > 0 ? `$${val.toFixed(2)}` : '$0.00',
        },
        {
            title: 'Hạn Sử Dụng',
            key: 'duration',
            render: (_, record) => (
                <div className="text-xs text-gray-600">
                    <div>Từ: {dayjs(record.startDate).format('YYYY-MM-DD')}</div>
                    <div>Đến: {dayjs(record.endDate).format('YYYY-MM-DD')}</div>
                </div>
            )
        },
        {
            title: 'Số Phiếu (Dùng/Tối Đa)',
            key: 'usage',
            render: (_, record) => (
                <Tooltip title={`Đã có ${record.usersUsed?.length || 0} khách hàng sử dụng mã này.`}>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded ${record.usedCount >= record.usageLimit ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-gray-700'}`}>
                        {record.usedCount} / {record.usageLimit} phiếu
                    </span>
                </Tooltip>
            )
        },
        {
            title: 'Trạng Thái',
            dataIndex: 'isActive',
            key: 'isActive',
            render: (isActive, record) => <Switch checked={isActive} onChange={(checked) => handleToggleActive(checked, record)} size="small" />,
        },
        {
            title: 'Hành Động',
            key: 'actions',
            render: (_, record) => (
                <Space size="middle">
                    <Button type="text" icon={<EditOutlined className="text-blue-500" />} onClick={() => openEditModal(record)} />
                    <Popconfirm title="Xóa mã này?" onConfirm={() => handleDelete(record._id)} okText="Xóa" cancelText="Hủy" okButtonProps={{ danger: true }}>
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
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        Promotion Management
                    </h1>
                    <p className="text-gray-500 text-sm mt-0.5">Hệ thống phát hành tối đa 10 phiếu/mã. Khách hàng được quyền tùy chọn áp dụng hoặc để dành cho đơn sau.</p>
                </div>
                <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal} className="bg-pink-600 hover:bg-pink-700 border-none h-10 px-5 font-medium rounded-lg">
                    Tạo Mã Khuyến Mãi
                </Button>
            </div>

            <Card className="shadow-sm border-gray-100 rounded-xl overflow-hidden">
                <div className="mb-4 w-full max-w-md">
                    <Input placeholder="Tìm theo tên hoặc mã giảm giá..." prefix={<SearchOutlined className="text-gray-400" />} value={searchText} onChange={(e) => setSearchText(e.target.value)} allowClear className="h-10 rounded-lg" />
                </div>
                <Table
                    columns={columns}
                    dataSource={filteredPromotions}
                    rowKey="_id"
                    loading={loading}
                    pagination={{ pageSize: 5 }}
                />
            </Card>

            <Modal
                title={<span className="text-lg font-bold text-gray-800">{editingId ? 'Chỉnh Sửa Chương Trình' : 'Tạo Chương Trình Mới (Giới hạn 10 phiếu)'}</span>}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onOk={() => form.submit()}
                okText={editingId ? "Cập Nhật" : "Tạo Mới"}
                cancelText="Hủy Bỏ"
                centered
                width={520}
                okButtonProps={{ className: "bg-pink-600 hover:bg-pink-700 border-none" }}
            >
                <Form form={form} layout="vertical" onFinish={handleFormSubmit} initialValues={{ type: 'percentage', isActive: true, minOrderValue: 0, usageLimit: 10 }} className="pt-3">
                    <Form.Item name="name" label="Tên chương trình" rules={[{ required: true, message: 'Vui lòng điền tên chương trình!' }]}>
                        <Input placeholder="Ví dụ: Tri ân khách hàng thân thiết..." className="h-10" />
                    </Form.Item>

                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item name="code" label="Mã Code" rules={[{ required: true, message: 'Nhập mã code!' }, { pattern: /^[A-Za-z0-9]+$/, message: 'Không chứa ký tự đặc biệt!' }]}>
                            <Input placeholder="Ví dụ: LUCKY10" className="h-10 uppercase font-mono" disabled={!!editingId} />
                        </Form.Item>
                        <Form.Item name="type" label="Loại giảm giá">
                            <Select className="h-10">
                                <Select.Option value="percentage">Phần trăm (%)</Select.Option>
                                <Select.Option value="fixed">Số tiền cố định ($)</Select.Option>
                            </Select>
                        </Form.Item>
                    </div>

                    <Form.Item dependencies={['type']} noStyle>
                        {({ getFieldValue }) => {
                            const isPercentage = getFieldValue('type') === 'percentage';
                            return (
                                <div className="grid grid-cols-2 gap-4">
                                    <Form.Item name="value" label={isPercentage ? "Giá trị giảm (%)" : "Số tiền giảm ($)"} rules={[{ required: true, message: 'Nhập giá trị!' }]}>
                                        <InputNumber min={1} max={isPercentage ? 100 : 1000} className="w-full h-10 flex items-center" />
                                    </Form.Item>
                                    <Form.Item name="maxDiscount" label="Giảm tối đa ($)">
                                        <InputNumber min={0} className="w-full h-10 flex items-center" placeholder="Không giới hạn" />
                                    </Form.Item>
                                </div>
                            );
                        }}
                    </Form.Item>

                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item name="minOrderValue" label="Đơn hàng tối thiểu ($)">
                            <InputNumber min={0} className="w-full h-10 flex items-center" />
                        </Form.Item>
                        <Form.Item name="usageLimit" label="Số lượng phiếu phát hành">
                            <InputNumber min={1} max={10} className="w-full h-10 flex items-center" disabled />
                        </Form.Item>
                    </div>

                    <Form.Item name="dateRange" label="Thời gian hiệu lực" rules={[{ required: true, message: 'Chọn thời gian hiệu lực!' }]}>
                        <RangePicker className="w-full h-10" format="YYYY-MM-DD" />
                    </Form.Item>

                    <Form.Item name="isActive" valuePropName="checked" label="Kích hoạt mã ngay khi lưu">
                        <Switch />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}

export default Promotion;