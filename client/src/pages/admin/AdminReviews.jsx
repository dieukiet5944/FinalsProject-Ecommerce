import React, { useState, useEffect } from 'react';
import { Table, Tag, Button, Modal, Input, Rate, Space, Typography, Tooltip, message } from 'antd';
import { CheckCircleOutlined, CommentOutlined, EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import { getAllReviewsForAdmin, updateReviewStatus, submitAdminReply } from '../../services/reviewService.js';

const { TextArea } = Input;
const { Title, Text } = Typography;

const AdminReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentReview, setCurrentReview] = useState(null);
    const [replyText, setReplyText] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");

    const fetchAllReviews = async () => {
        try {
            setLoading(true);
            const response = await getAllReviewsForAdmin();

            const formattedData = response.map(item => ({
                ...item,
                key: item._id
            }));

            setReviews(formattedData);
        } catch (error) {
            console.error(error);
            message.error("Unable to load the review list from the system!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllReviews();
    }, []);

    const handleUpdateStatus = async (key, newStatus) => {
        try {
            await updateReviewStatus(key, newStatus);

            message.success("Status updated: Review successful!");
            fetchAllReviews();
        } catch (error) {
            console.error(error);
            message.error("Update the failure status!");
        }
    };

    const handleSendReply = async () => {
        if (!replyText.trim()) {
            return message.error("Please enter your feedback!");
        }

        try {
            await submitAdminReply(currentReview.key, replyText);
            message.success("Feedback has been sent to the customer!");
            setIsModalOpen(false);
            setCurrentReview(null);
            setReplyText("");
            fetchAllReviews();
        } catch (error) {
            console.error(error);
            message.error("Unable to send feedback!");
        }
    };

    const openReplyModal = (record) => {
        setCurrentReview(record);
        setReplyText(record.reply || "");
        setIsModalOpen(true);
    };

    const filteredData = reviews.filter(rev => filterStatus === "all" || rev.status === filterStatus);

    const columns = [
        {
            title: 'Customers',
            dataIndex: 'userName',
            key: 'userName',
            render: (text, record) => (
                <Space orientation="vertical" size={1}>
                    <Text className="font-semibold text-gray-900">{text}</Text>
                    <Text type="secondary" className="text-xs">{record.userEmail}</Text>
                    <Text type="secondary" className="text-xs">
                        {new Date(record.createdAt).toLocaleDateString('vi-VN')}
                    </Text>
                </Space>
            ),
        },
        {
            title: 'Product Code',
            dataIndex: 'productId',
            key: 'productId',
            render: (text) => (
                <Text copyable className="font-mono text-xs text-gray-500">{text}</Text>
            ),
        },
        {
            title: 'Evaluate',
            dataIndex: 'comment',
            key: 'comment',
            width: '45%',
            render: (text, record) => (
                <Space orientation="vertical" size={2} className="w-full">
                    <Rate disabled defaultValue={record.rating} className="text-sm text-amber-400" />
                    <p className="text-gray-600 leading-relaxed wrap-break-wordbreak-words m-0">{text}</p>
                    {record.reviewImg && (
                        <img src={record.reviewImg} alt="Feedback" className="mt-1 w-14 h-14 rounded-lg object-cover border border-gray-200" />
                    )}
                    {record.reply && (
                        <div className="mt-2 p-2 bg-amber-50 rounded-lg border border-amber-100 text-xs text-amber-800">
                            <span className="font-bold">Shop's response:</span> {record.reply}
                        </div>
                    )}
                </Space>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                let color = 'gold';
                let text = 'Pending';
                if (status === 'approved') { color = 'green'; text = 'Approved'; }
                if (status === 'hidden') { color = 'gray'; text = 'Hidden'; }
                return <Tag color={color} className="font-semibold rounded-md px-2.5 py-0.5 m-0">{text}</Tag>;
            },
        },
        {
            title: 'Action',
            key: 'action',
            align: 'right',
            render: (_, record) => (
                <Space size="small">
                    {record.status === 'pending' && (
                        <Tooltip title="Approve now!">
                            <Button
                                type="primary"
                                className="bg-green-600 hover:bg-green-700 text-white"
                                icon={<CheckCircleOutlined />}
                                onClick={() => handleUpdateStatus(record.key, 'approved')}
                            />
                        </Tooltip>
                    )}

                    <Button
                        type="default"
                        icon={<CommentOutlined />}
                        onClick={() => openReplyModal(record)}
                        className="border-amber-500 text-amber-600 hover:text-amber-700"
                    >
                        {record.reply ? 'Edit feedback' : 'Feedback'}
                    </Button>

                    {record.status !== 'hidden' ? (
                        <Button
                            danger
                            type="text"
                            icon={<EyeInvisibleOutlined />}
                            onClick={() => handleUpdateStatus(record.key, 'hidden')}
                        >
                            Hide
                        </Button>
                    ) : (
                        <Button
                            type="text"
                            icon={<EyeOutlined />}
                            className="text-gray-500"
                            onClick={() => handleUpdateStatus(record.key, 'pending')}
                        >
                            Appear
                        </Button>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <div className="p-4 sm:p-6 md:p-9 flex flex-col gap-6 min-h-screen bg-gray-50/50">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-[#EE2B6C] m-0">Review Manager</h1>
                    <p className="text-xs sm:text-sm text-gray-400 m-0 mt-1 font-medium">Approve real data and incorporate customer feedback.</p>
                </div>

                <div className="flex bg-white border border-gray-200 p-1 rounded-xl shadow-sm self-start">
                    {['all', 'pending', 'approved', 'hidden'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-4 py-2 text-sm font-medium rounded-lg capitalize transition-all ${filterStatus === status
                                ? 'bg-pink-500 text-white shadow-sm'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                }`}
                        >
                            {status === 'all' ? 'All' : status === 'pending' ? 'Pending' : status === 'approved' ? 'Approved' : 'Hidden'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <Table
                    columns={columns}
                    dataSource={filteredData}
                    loading={loading}
                    pagination={{ pageSize: 6 }}
                />
            </div>

            <Modal
                title={<span className="text-lg font-bold text-gray-800">Feedback and reviews</span>}
                open={isModalOpen}
                onOk={handleSendReply}
                onCancel={() => setIsModalOpen(false)}
                okText="Save response"
                cancelText="Cancel"
                okButtonProps={{ className: 'bg-amber-500 hover:bg-amber-600 border-none rounded-xl' }}
            >
                {currentReview && (
                    <div className="space-y-4 my-4">
                        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                            <div className="flex justify-between items-center mb-1">
                                <Text className="font-semibold text-gray-800">{currentReview.userName}</Text>
                                <Rate disabled defaultValue={currentReview.rating} className="text-xs text-amber-400" />
                            </div>
                            <Text className="text-gray-600 italic font-light">"{currentReview.comment}"</Text>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                                Here's the response from The Crumb & Bean:
                            </label>
                            <TextArea
                                rows={4}
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Enter the reply to send to the customer..."
                                className="rounded-xl"
                            />
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default AdminReviews;