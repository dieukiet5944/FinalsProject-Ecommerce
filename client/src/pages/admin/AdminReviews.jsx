import React, { useState } from 'react';
import { Table, Tag, Button, Modal, Input, Rate, Space, Typography, Tooltip } from 'antd';
import { CheckCircleOutlined, CommentOutlined, EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Title, Text } = Typography;

const AdminReviews = () => {
    const [reviews, setReviews] = useState([
        {
            id: "REV001",
            userName: "Nguyễn Văn A",
            userEmail: "vana@gmail.com",
            productName: "Bánh Sừng Bò Trứng Muối",
            productThumb: "https://picsum.photos/id/490/50/50",
            rating: 5,
            comment: "Bánh giao tới còn nóng hổi, vỏ giòn rụm, sốt trứng muối béo ngậy rất vừa miệng. Sẽ ủng hộ quán dài dài!",
            reviewImg: "https://picsum.photos/id/312/100/100",
            date: "2026-07-08",
            status: "approved",
            reply: "Cảm ơn bạn A đã dành lời khen cho quán ạ! Rất mong được phục vụ bạn ở những lần tới."
        },
        {
            id: "REV002",
            userName: "Trần Thị B",
            userEmail: "thib@gmail.com",
            productName: "Trà Trái Cây Nhiệt Đới",
            productThumb: "https://picsum.photos/id/1080/50/50",
            rating: 3,
            comment: "Nước vị thanh mát dễ uống nhưng quán bỏ hơi nhiều đá quá, giao tới bị nhạt đi một chút.",
            reviewImg: null,
            date: "2026-07-07",
            status: "pending",
            reply: ""
        },
        {
            id: "REV003",
            userName: "Spam Bot 99",
            userEmail: "spambot@gmail.com",
            productName: "Cà Phê Muối Specialty",
            productThumb: "https://picsum.photos/id/76/50/50",
            rating: 1,
            comment: "Vào đây xem phim miễn phí nhận quà ngay tại trang web abc.xyz...",
            reviewImg: null,
            date: "2026-07-06",
            status: "hidden",
            reply: ""
        }
    ]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentReview, setCurrentReview] = useState(null);
    const [replyText, setReplyText] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");

    const handleUpdateStatus = (key, newStatus) => {
        setReviews(reviews.map(rev => rev.key === key ? { ...rev, status: newStatus } : rev));
    };

    const openReplyModal = (record) => {
        setCurrentReview(record);
        setReplyText(record.reply);
        setIsModalOpen(true);
    };

    const handleSendReply = () => {
        setReviews(reviews.map(rev =>
            rev.key === currentReview.key
                ? { ...rev, reply: replyText, status: "approved" }
                : rev
        ));
        setIsModalOpen(false);
        setCurrentReview(null);
        setReplyText("");
    };

    const columns = [
        {
            title: 'CUSTOMERS',
            dataIndex: 'userName',
            key: 'userName',
            render: (text, record) => (
                <Space direction="vertical" size={1}>
                    <Text className="font-semibold text-gray-900">{text}</Text>
                    <Text type="secondary" className="text-xs">{record.userEmail}</Text>
                    <Text type="secondary" className="text-xs">{record.date}</Text>
                </Space>
            ),
        },
        {
            title: 'PRODUCTS',
            dataIndex: 'productName',
            key: 'productName',
            render: (text, record) => (
                <Space size="middle">
                    <img src={record.productThumb} alt="" className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                    <Text className="font-medium text-gray-700">{text}</Text>
                </Space>
            ),
        },
        {
            title: 'EVALUTE',
            dataIndex: 'comment',
            key: 'comment',
            width: '40%',
            render: (text, record) => (
                <Space direction="vertical" size={2} className="w-full">
                    <Rate disabled defaultValue={record.rating} className="text-sm text-amber-400" />
                    <p className="text-gray-600 leading-relaxed wrap-break-words m-0">{text}</p>
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
            title: 'STATUS',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                let color = 'gold';
                let text = 'Awaiting approval';
                if (status === 'approved') { color = 'green'; text = 'Approved'; }
                if (status === 'hidden') { color = 'gray'; text = 'Hidden'; }
                return <Tag color={color} className="font-semibold rounded-md px-2.5 py-0.5 m-0">{text}</Tag>;
            },
        },
        {
            title: 'ACTION',
            key: 'action',
            align: 'left',
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
                        {record.reply ? 'Edit response' : 'Reply'}
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

    const filteredData = reviews.filter(rev => filterStatus === "all" || rev.status === filterStatus);

    return (
        <div className="p-4 sm:p-6 md:p-9 flex flex-col gap-6 min-h-screen bg-gray-50/50">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-[#EE2B6C] m-0">Review Management</h1>
                    <p className="text-xs sm:text-sm text-gray-400 m-0 mt-1 font-medium">Manage and respond to customer product reviews on the system.</p>
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

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                <Table
                    columns={columns}
                    dataSource={filteredData}
                    scroll={{ x: 800 }}
                    pagination={{
                        total: filteredData.length,
                        pageSize: 5,
                        showSizeChanger: false,
                        placement: ['bottomRight'],
                        className: "px-6 py-4 border-t border-gray-50 !m-0"
                    }}
                    className="w-full [&_.ant-table-thead_th]:bg-transparent [&_.ant-table-thead_th]:text-gray-400 [&_.ant-table-thead_th]:text-[11px] [&_.ant-table-thead_th]:font-bold [&_.ant-table-thead_th]:tracking-wider [&_.ant-table-thead_th]:uppercase"
                />
                <div className="px-6 py-4 border-t border-gray-50 bg-gray-50/40 flex items-center">
                    <div className="text-xs text-gray-400 font-medium">
                        Showing <span className="font-semibold text-gray-600">1</span> to{' '}
                        <span className="font-semibold text-gray-600">{Math.min(5, filteredData.length)}</span> of{' '}
                        <span className="font-semibold text-gray-600">{filteredData.length}</span> records
                    </div>
                </div>
            </div>


            <Modal
                title={<span className="text-lg font-bold text-gray-800">Feedback and reviews</span>}
                open={isModalOpen}
                onOk={handleSendReply}
                onCancel={() => setIsModalOpen(false)}
                okText="Send feedback"
                cancelText="Cancel"
                okButtonProps={{ className: 'bg-amber-500 hover:bg-amber-600 border-none rounded-xl' }}
                cancelButtonProps={{ className: 'rounded-xl' }}
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
                                placeholder="Enter a thank-you message or answer to a customer's question..."
                                className="rounded-xl border-gray-300 focus:border-amber-500 focus:ring-amber-500"
                            />
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default AdminReviews;