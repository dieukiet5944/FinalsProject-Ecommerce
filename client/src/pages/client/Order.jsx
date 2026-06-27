import { useEffect, useState } from "react";
import { Flex, Steps, message, Modal } from 'antd';
import { LoadingOutlined, CheckCircleOutlined } from '@ant-design/icons'
import axios from "axios";
import dayjs from "dayjs";


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
        subTitle: <CheckCircleOutlined className="text-green-400"/>,
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
        subTitle: <LoadingOutlined className="text-sky-500"/>,
    },
    {
        title: 'Waiting...',
        content: "Still waiting...",
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

    useEffect(() => {
        const loadDataOrder = async () => {
            setLoading(true)
            try {
                const response = await axios.get(`http://localhost:8080/orders?pageNumber=${pageNumber}&pageSize=3`);

                const result = response.data?.data;

                if (response.data?.success) {
                    setListOrder(result)
                    setTotalPages(response.data?.totalPages);
                    setTotalItems(response.data?.totalItems);
                } else {
                    message.error("Error to get Data ")
                }

            } catch (error) {
                console.error("Error from server to get data !!!")
            }
            finally {
                setLoading(false)
            }
        }
        loadDataOrder()

    }, [pageNumber])

    console.log(listOrders)

    return (
        <div className="min-h-screen bg-light-bg py-12 p-20 pl-50 pr-50">
            <div className="w-full flex flex-col gap-4">
                <div className="flex gap-6 flex-row-reverse mt-2">

                    <button
                        disabled={pageNumber === totalPages}
                        onClick={() => setPageNumber(prev => prev + 1)}
                        className="text-light-300 pl-3 pr-3 rounded-3xl bg-pink-700"
                    >
                        Next
                    </button>


                    <span className="text-pink-600">
                        {pageNumber} / {totalPages}
                    </span>

                    <button
                        disabled={pageNumber === 1}
                        onClick={() => setPageNumber(prev => prev - 1)}
                        className="text-light-300 pl-3 pr-3 rounded-3xl  bg-pink-700 "
                    >
                        Prev
                    </button>
                </div>

                {listOrders.length === 0 ?
                    (
                        <div className="shadow-xl/30 border-solid border-20 p-5 rounded-md flex flex-col gap-8">
                            No order here
                        </div>
                    ) : (listOrders.map((item, index) => {
                        return (
                            <div key={item._id} className="shadow-xl/30 border-solid border-20 p-5 rounded-md flex flex-col gap-8">
                                <div className="flex flex-start gap-4">
                                    <h1 className="text-black">ID: {item._id}</h1>
                                    <button onClick={() => { setSelectedOrder(item); setOpenView(true) }} className="bg-pink-500 pl-2 pr-2 rounded-xl active:bg-pink-800 ">View order</button>
                                </div>
                                <Flex vertical gap="large">
                                    { item.status === "Completed" ? <Steps current={2} status="finish" items={itemsCompleted} variant="outlined" /> : <Steps current={1} status="process" items={itemsPending} variant="outlined" />}
                                </Flex>
                            </div>
                        )
                    })
                    )
                }

                <Modal
                    title="View Order Profile"
                    open={openView}
                    onCancel={() => setOpenView(false)}
                    centered
                    width={400}
                    footer={null}
                >
                    {selectedOrder && (
                        <div className="p-6 bg-white rounded-xl shadow-lg">
                            <div className="flex flex-col gap-4">

                                <div className="pb-3 border-b">
                                    <h2 className="text-lg font-bold text-gray-800">
                                        Order Detail
                                    </h2>
                                </div>

                                <div className="grid gap-2 text-sm">
                                    <p>
                                        <span className="font-semibold text-gray-700">ID:</span>{" "}
                                        <span className="text-gray-500 break-all">
                                            {selectedOrder._id}
                                        </span>
                                    </p>

                                    <p>
                                        <span className="font-semibold text-gray-700">Status:</span>{" "}
                                        <span className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                                            {selectedOrder.status}
                                        </span>
                                    </p>
                                </div>

                                <div>
                                    <h3 className="font-semibold text-gray-800 mb-3">
                                        Order Items
                                    </h3>

                                    <div className="max-h-75 overflow-y-auto space-y-3 pr-2">
                                        {selectedOrder.items?.map((item, index) => (
                                            <div
                                                key={index}
                                                className="flex justify-between items-center p-3 rounded-lg bg-gray-50 border"
                                            >
                                                <div className="min-w-0">
                                                    <p className="text-xs text-gray-400 truncate">
                                                        {item.productId}
                                                    </p>

                                                    <p className="font-medium text-gray-800 truncate">
                                                        {item.name}
                                                    </p>

                                                    <p className="text-sm text-gray-500">
                                                        {item.qty} × $
                                                        {Number(item.price).toFixed(2)}
                                                    </p>
                                                </div>

                                                <span className="font-bold text-green-600">
                                                    $
                                                    {(item.qty * item.price).toFixed(2)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="border-t pt-4 space-y-2 text-sm">
                                    <p className="flex justify-between">
                                        <span className="font-semibold text-gray-700">
                                            Total Price
                                        </span>
                                        <span className="font-bold text-lg text-green-600">
                                            ${selectedOrder.totalPrice}
                                        </span>
                                    </p>

                                    <p>
                                        <span className="font-semibold text-gray-700">
                                            Created At:
                                        </span>{" "}
                                        <span className="text-gray-500">
                                            {dayjs(selectedOrder.createdAt).format("DD/MM/YYYY HH:mm")}
                                        </span>
                                    </p>

                                    <p>
                                        <span className="font-semibold text-gray-700">
                                            Updated At:
                                        </span>{" "}
                                        <span className="text-gray-500">
                                            {dayjs(selectedOrder.updatedAt).format("DD/MM/YYYY HH:mm")}
                                        </span>
                                    </p>
                                </div>

                            </div>
                        </div>

                    )}
                </Modal>

            </div>
        </div>
    )
}

export default Order