import { useEffect, useState } from "react";
import { Flex, Steps, message, Modal } from 'antd';
import { LoadingOutlined } from '@ant-design/icons'
import axios from "axios";

const content = 'This is a content.';
const items = [
    {
        title: 'Order',
        content: 'Packaging orders',
        status: 'finish'
    },
    {
        title: 'In Progress',
        content: 'Waiting for order confirmation',
        subTitle: <LoadingOutlined />,
    },
    {
        title: 'Waiting...',
        content,
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
                                    <Steps current={1} items={items} variant="outlined" />
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
                        <div className='p-8'>
                            <div className='flex flex-col gap-1'>
                                <h2 className="text-black"><strong>ID: </strong>{selectedOrder._id}</h2>
                                <h2><strong>Status: </strong>{selectedOrder.status}</h2>
                                <div className="max-h-65 overflow-y-auto pr-1 space-y-3 scrollbar-thin">
                                    {selectedOrder.items?.map((item, index) => (
                                        <div key={index} className="flex justify-between items-center pb-2 border-b border-dashed border-gray-100 last:border-0 last:pb-0 gap-4">
                                            <div className="flex flex-col min-w-0">
                                                <span className="font-semibold text-gray-800 text-sm sm:text-base truncate">{item.productId}</span>
                                                <span className="font-semibold text-gray-800 text-sm sm:text-base truncate">{item.name}</span>
                                                <span className="text-xs text-gray-400 mt-0.5 font-medium">
                                                    {item.qty} x ${Number(item.price).toFixed(2)}
                                                </span>
                                            </div>
                                            <b className="text-gray-800 text-sm sm:text-base shrink-0 pl-2">
                                                ${(item.qty * item.price).toFixed(2)}
                                            </b>
                                        </div>
                                    ))}</div>
                                <h2><strong>TotalPrice: </strong>{selectedOrder.totalPrice}</h2>
                                <h2><strong>CreateAt: </strong>{selectedOrder.createdAt}</h2>
                                <h2><strong>UpdatedAt: </strong>{selectedOrder.updatedAt}</h2>
                            </div>
                        </div>

                    )}
                </Modal>

            </div>
        </div>
    )
}

export default Order