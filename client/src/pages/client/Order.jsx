import { useEffect, useState } from "react";
import { Flex, Steps, message, Modal } from 'antd';
import { LoadingOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons'
import dayjs from "dayjs";
import { getOrderBreakPageApi } from "../../services/orderService.js";
import { useAuth } from "../../hooks/useAuth.js";


const itemsCompleted = [
    {
        title: 'Order',
        content: 'Packaging orders',
        status: 'finish'
    },
    {
        title: 'In Progress',
        content: 'Waiting for order confirmation',
    },
    {
        title: 'Completed',
        content: "Confirmed",
        subTitle: <CheckCircleOutlined className="text-green-400" />,
    },
];

const itemsPending = [
    {
        title: 'Order',
        content: 'Packaging orders',
        status: 'finish'
    },
    {
        title: 'In Progress',
        content: 'Waiting for order confirmation',
        subTitle: <LoadingOutlined className="text-sky-500" />,
    },
    {
        title: 'Waiting...',
        content: "Still waiting...",
    },
];

const itemsCanceled = [
    {
        title: 'Order',
        content: 'Packaging orders',
        status: 'finish'
    },
    {
        title: 'Canceled',
        content: 'Order has been rejected',
        subTitle: <CloseCircleOutlined className="text-red-500" />,
    },
    {
        title: 'Failed',
        content: "Transaction terminated",
    },
];

const Order = () => {
    const [listOrders, setListOrder] = useState([]);
    const [loading, setLoading] = useState(false)
    const [pageNumber, setPageNumber] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);

    const [selectedOrder, setSelectedOrder] = useState(null);

    const [openView, setOpenView] = useState(false)

    const { user } = useAuth();

    useEffect(() => {
        const loadDataOrder = async () => {
            if (!user?.id) return;
            setLoading(true)
            try {
                const response = await getOrderBreakPageApi(user.id, pageNumber, 3);

                const result = response?.data;

                if (Array.isArray(result)) {
                    setListOrder(result);

                    if (result.length === 3) {
                        setTotalPages(pageNumber + 1); 
                    } else {
                        setTotalPages(pageNumber);
                    }

                    console.log("The raw array has been processed smoothly, with no more errors!");
                } else {
                    message.error("Data format is incorrect");
                }

            } catch (error) {
                console.error("Error from server to get data !!!")
            }
            finally {
                setLoading(false)
            }
        }
        loadDataOrder()

    }, [pageNumber, user?.id])

    return (
        <div className="min-h-screen bg-light-bg py-10 text-light-text">
            <div className="max-w-4xl mx-auto px-4 flex flex-col gap-6">

                <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
                    <span className="text-xs font-semibold text-light-text-secondary tracking-wider uppercase pl-2">
                        Order History
                    </span>

                    <div className="flex items-center gap-3">
                        <button
                            disabled={pageNumber === 1}
                            onClick={() => setPageNumber(prev => prev - 1)}
                            className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white transition-all cursor-pointer"
                        >
                            Prev
                        </button>

                        <span className="text-xs font-bold px-2.5 py-1 bg-gray-100 rounded-lg text-gray-600">
                            {pageNumber} / {totalPages}
                        </span>

                        <button
                            disabled={pageNumber === totalPages}
                            onClick={() => setPageNumber(prev => prev + 1)}
                            className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white transition-all cursor-pointer"
                        >
                            Next
                        </button>
                    </div>
                </div>

                {listOrders.length === 0 ? (
                    <div className="bg-white border border-gray-100 p-8 rounded-2xl text-center text-light-text-secondary text-sm shadow-sm">
                        No orders found. Start exploring our shop!
                    </div>
                ) : (
                    listOrders.map((item) => (
                        <div
                            key={item._id}
                            className="bg-white border border-gray-100 p-5 rounded-2xl flex flex-col gap-6 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                                <div className="flex items-center gap-2 min-w-0">
                                    <span className="text-xs font-bold text-primary-500 bg-primary-500/10 px-2 py-0.5 rounded-md shrink-0">
                                        ORDER
                                    </span>
                                    <h1 className="text-sm font-bold text-gray-700 tracking-wider" style={{ fontFamily: '"Courier New", Courier, monospace' }}>
                                        #CB-{String(item._id).slice(-5).toUpperCase()}
                                    </h1>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => { setSelectedOrder(item); setOpenView(true); }}
                                    className="px-3 py-1.5 text-xs font-semibold bg-gray-900 text-white hover:bg-gray-800 rounded-xl transition-colors cursor-pointer shadow-sm shrink-0"
                                >
                                    View details
                                </button>
                            </div>

                            <div className="px-2 py-1">
                                <Flex vertical gap="large">
                                    {(() => {
                                        if (item.status === "Completed") {
                                            return (
                                                <Steps current={2} status="finish" items={itemsCompleted} variant="outlined" size="small" />
                                            );
                                        }
                                        if (item.status === "Canceled") {
                                            return (
                                                <Steps current={1} status="error" items={itemsCanceled} variant="outlined" size="small" />
                                            );
                                        }
                                        return (
                                            <Steps current={1} status="process" items={itemsPending} variant="outlined" size="small" />
                                        );
                                    })()}
                                </Flex>
                            </div>
                        </div>
                    ))
                )}

                <Modal
                    title={<span className="text-base font-bold font-heading">Order Information</span>}
                    open={openView}
                    onCancel={() => setOpenView(false)}
                    centered
                    width={420}
                    footer={null}
                >
                    {selectedOrder && (
                        <div className="pt-2 flex flex-col gap-5">
                            <div className="bg-light-surface p-4 rounded-xl border border-gray-100 space-y-2.5 text-xs">
                                <div className="flex justify-between items-center">
                                    <span className="text-light-text-secondary font-medium">Order ID</span>
                                    <span className="text-sm font-bold text-gray-700 tracking-wider" style={{ fontFamily: '"Courier New", Courier, monospace' }}>
                                        #CB-{String(selectedOrder._id).slice(-5).toUpperCase()}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-light-text-secondary font-medium">Status</span>
                                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase ${selectedOrder.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                        selectedOrder.status === 'Canceled' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-700'
                                        }`}>
                                        {selectedOrder.status}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-light-text-secondary font-medium">Date</span>
                                    <span className="text-gray-700 font-medium">
                                        {dayjs(selectedOrder.createdAt).format("DD/MM/YYYY HH:mm")}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-xs font-bold text-light-text-secondary tracking-wider uppercase mb-2.5">
                                    Items Ordered
                                </h3>

                                <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                                    {selectedOrder.items?.map((item, index) => (
                                        <div
                                            key={index}
                                            className="flex justify-between items-center p-3 rounded-xl bg-white border border-gray-100 shadow-3xs"
                                        >
                                            <div className="min-w-0 pr-2">
                                                <p className="font-semibold text-sm text-gray-800 truncate">
                                                    {item.name}
                                                </p>
                                                <p className="text-xs text-light-text-secondary mt-0.5">
                                                    {item.qty} × ${Number(item.price).toFixed(2)}
                                                </p>
                                            </div>

                                            <span className="font-bold text-sm text-gray-800 shrink-0">
                                                ${(item.qty * item.price).toFixed(2)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="border-t border-gray-100 pt-4 space-y-2 text-xs text-gray-600">
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span className="font-medium text-gray-800">
                                        ${Number(selectedOrder.subTotalPrice || selectedOrder.totalPrice).toFixed(2)}
                                    </span>
                                </div>

                                {selectedOrder.promotion && selectedOrder.promotion.code && selectedOrder.promotion.discountAmount > 0 && (
                                    <div className="flex justify-between items-center text-green-600 font-medium bg-green-50/60 px-3 py-2 rounded-xl border border-green-100/50">
                                        <span className="flex items-center gap-1">
                                            🏷️ Promo Code: <span className="font-mono font-bold uppercase text-xs bg-green-100 px-1.5 py-0.5 rounded text-green-700">{selectedOrder.promotion.code}</span>
                                        </span>
                                        <span>-${Number(selectedOrder.promotion.discountAmount).toFixed(2)}</span>
                                    </div>
                                )}

                                <div className="flex justify-between">
                                    <span>Shipping</span>
                                    <span className="text-green-600 font-medium">Free</span>
                                </div>
                            </div>

                            <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
                                <span className="text-sm font-bold text-gray-800">Total Amount</span>
                                <span className="font-bold text-xl text-primary-500">
                                    ${Number(selectedOrder.totalPrice).toFixed(2)}
                                </span>
                            </div>
                        </div>
                    )}
                </Modal>

            </div>
        </div>
    )
}

export default Order