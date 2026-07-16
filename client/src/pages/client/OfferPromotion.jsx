import { useState, useEffect } from 'react';
import { Tabs, Button, message, Tooltip, Badge } from 'antd';
import { GiftOutlined, CopyOutlined, ClockCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { getAllPromosApi } from '../../services/promotionService.js';
import dayjs from 'dayjs';

const OfferPromotions = () => {
    const [promotion, setPromotion] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPromotion = async () => {
            try {
                const response = await getAllPromosApi();

                const result = response?.data;

                setPromotion(result);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchPromotion();
    }, []);

    const handleCopyCode = (code) => {
        navigator.clipboard.writeText(code);
        message.success(`Code has been copied successfully: ${code}!`);
    };

    return (
        <div className="min-h-screen bg-light-bg py-12 px-4 text-light-text">
            <div className="max-w-5xl mx-auto">

                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary-500/10 text-primary-500 mb-3 text-xl">
                        <GiftOutlined />
                    </div>
                    <h1 className="text-3xl font-bold font-heading text-gray-800 tracking-tight">Crumb & Bean Deals Station</h1>
                    <p className="text-sm text-light-text-secondary mt-2">
                        Grab the best discount codes and promotions today!
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {promotion.map((promo) => (
                        <div
                            key={promo.id}
                            className="flex bg-white rounded-2xl border border-[#2a0614] shadow-3xs overflow-hidden h-36 relative group hover:shadow-xs transition-shadow duration-300"
                        >
                            <div className="w-28 sm:w-32 bg-[#2a0614] text-white flex flex-col justify-center items-center p-3 text-center border-r-2 border-dashed border-gray-200 relative">
                                <span className="text-2xl sm:text-3xl font-black tracking-tighter">{promo.value}%</span>

                                <div className="absolute -top-2 -right-2 w-4 h-4 bg-light-bg rounded-full border border-gray-100"></div>
                                <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-light-bg rounded-full border border-gray-100"></div>
                            </div>

                            <div className="flex-1 p-4 flex flex-col justify-between bg-white">
                                <div>
                                    <div className="flex justify-between items-start gap-2">
                                        <h3 className="font-bold text-sm sm:text-base text-gray-800 line-clamp-1 group-hover:text-primary-500 transition-colors">
                                            {promo.name}
                                        </h3>
                                        <div className="flex items-center gap-1.5">
                                            <Badge
                                                status={promo.isActive ? "success" : "default"}
                                                text={
                                                    <span className={promo.isActive ? "text-green-600 font-medium" : "text-gray-500"}>
                                                        {promo.isActive ? "Active" : "Inactive"}
                                                    </span>
                                                }
                                            />

                                            <Tooltip title={promo.isActive ? "The program is currently being implemented." : "The program has been hidden or expired."}>
                                                <InfoCircleOutlined className="text-gray-400 text-xs cursor-pointer hover:text-gray-600 dynamic-pulse" />
                                            </Tooltip>
                                        </div>
                                    </div>
                                    <p className="text-2xs sm:text-xs text-light-text-secondary line-clamp-2 mt-1 pr-2">
                                        Quantity: {promo.usedCount}/{promo.usageLimit}
                                    </p>
                                </div>

                                <div className="flex justify-between items-center pt-2 border-t border-gray-50/80">
                                    <span className="text-3xs text-gray-400 flex items-center gap-1">
                                        <ClockCircleOutlined /> Expires: {dayjs(promo.endDate).format("DD/MM/YYYY")}
                                    </span>

                                    <Button
                                        type="primary"
                                        size="small"
                                        icon={<CopyOutlined />}
                                        onClick={() => handleCopyCode(promo.code)}
                                        className="bg-primary-500 hover:bg-primary-600 border-none text-3xs font-bold rounded-lg px-3 flex items-center h-7 shadow-2xs"
                                    >
                                        CODE: {promo.code}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {promotion.length === 0 && (
                    <div className="text-center py-12 text-gray-400 text-sm">
                        Currently, there are no promotional programs in this category.
                    </div>
                )}
            </div>
        </div>
    );
};

export default OfferPromotions;