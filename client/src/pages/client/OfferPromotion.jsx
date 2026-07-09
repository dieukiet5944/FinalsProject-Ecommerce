import { useState } from 'react';
import { Tabs, Button, message, Tooltip, Badge } from 'antd';
import { GiftOutlined, CopyOutlined, ClockCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';

const OfferPromotions = () => {
    const [activeTab, setActiveTab] = useState('all');

    const promoList = [
        {
            id: 1,
            code: 'WELCOMEBEAR',
            title: '20% Off First Order',
            description: 'Applies to the entire Cake & Coffee menu for new accounts.',
            expiry: 'Expires: 31/12/2026',
            type: 'voucher',
            discount: '20%',
            minSpend: 'Minimum Order 0đ'
        },
        {
            id: 2,
            code: 'COFFEEBREAK',
            title: 'All Items at 29k During Happy Hour',
            description: 'All machine-made coffees at the same price from 14:00 - 17:00 every day.',
            expiry: 'Expires: 30/09/2026',
            type: 'combo',
            discount: '29K',
            minSpend: '14:00 - 17:00'
        },
        {
            id: 3,
            code: 'SWEETPAIR',
            title: 'Tea & Croissant Combo',
            description: 'Save 15% when you buy one fruit tea and one croissant together.',
            expiry: 'Expiration: Until further notice',
            type: 'combo',
            discount: '15%',
            minSpend: 'Buy by Combo'
        },
        {
            id: 4,
            code: 'VIPBEAN',
            title: 'Birthday Gift for Members',
            description: 'Get a 50k discount for members with birthdays in July.',
            expiry: 'Expiration: 31/07/2026',
            type: 'member',
            discount: '50K',
            minSpend: 'Membership level Bronze or higher'
        }
    ];

    const handleCopyCode = (code) => {
        navigator.clipboard.writeText(code);
        message.success(`Code has been copied successfully: ${code}!`);
    };

    const filteredPromos = activeTab === 'all'
        ? promoList
        : promoList.filter(promo => promo.type === activeTab);

    const tabItems = [
        { key: 'all', label: 'All Offers' },
        { key: 'voucher', label: 'Discount Code' },
        { key: 'combo', label: 'Combo / Same Price' },
        { key: 'member', label: 'VIP Privileges' },
    ];

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

                <div className="flex justify-center mb-8">
                    <Tabs
                        activeKey={activeTab}
                        onChange={(key) => setActiveTab(key)}
                        items={tabItems}
                        className="w-full max-w-xl text-center [&_.ant-tabs-tab-active_.ant-tabs-tab-btn]:text-primary-500! [&_.ant-tabs-ink-bar]:bg-primary-500!"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredPromos.map((promo) => (
                        <div
                            key={promo.id}
                            className="flex bg-white rounded-2xl border border-gray-100 shadow-3xs overflow-hidden h-36 relative group hover:shadow-xs transition-shadow duration-300"
                        >
                            <div className="w-28 sm:w-32 bg-[#2a0614] text-white flex flex-col justify-center items-center p-3 text-center border-r-2 border-dashed border-gray-200 relative">
                                <span className="text-2xl sm:text-3xl font-black tracking-tighter">{promo.discount}</span>
                                <span className="text-3xs uppercase tracking-wider text-white/70 mt-1 font-semibold">{promo.minSpend}</span>

                                <div className="absolute -top-2 -right-2 w-4 h-4 bg-light-bg rounded-full border border-gray-100"></div>
                                <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-light-bg rounded-full border border-gray-100"></div>
                            </div>

                            <div className="flex-1 p-4 flex flex-col justify-between bg-white">
                                <div>
                                    <div className="flex justify-between items-start gap-2">
                                        <h3 className="font-bold text-sm sm:text-base text-gray-800 line-clamp-1 group-hover:text-primary-500 transition-colors">
                                            {promo.title}
                                        </h3>
                                        <Tooltip title={promo.description}>
                                            <InfoCircleOutlined className="text-gray-400 text-xs cursor-pointer hover:text-gray-600" />
                                        </Tooltip>
                                    </div>
                                    <p className="text-2xs sm:text-xs text-light-text-secondary line-clamp-2 mt-1 pr-2">
                                        {promo.description}
                                    </p>
                                </div>

                                <div className="flex justify-between items-center pt-2 border-t border-gray-50/80">
                                    <span className="text-3xs text-gray-400 flex items-center gap-1">
                                        <ClockCircleOutlined /> {promo.expiry}
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

                {filteredPromos.length === 0 && (
                    <div className="text-center py-12 text-gray-400 text-sm">
                        Currently, there are no promotional programs in this category.                    
                    </div>
                )}
            </div>
        </div>
    );
};

export default OfferPromotions;