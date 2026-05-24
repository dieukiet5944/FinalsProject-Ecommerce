import React from "react";
import { SignatureOutlined, ToolOutlined, FormatPainterOutlined, SunFilled, MoonFilled, InfoCircleFilled, SafetyCertificateFilled, HistoryOutlined, GlobalOutlined } from "@ant-design/icons"
import { Input, Button, Switch, Checkbox, ConfigProvider } from "antd";

const Setting = () => {

    const onChange = checked => {
        console.log(`switch to ${checked}`);
    };

    return (
        <div className="p-4 sm:p-6 md:p-9 flex flex-col gap-6 min-h-screen bg-gray-50/50">

            {/* Title Header */}
            <div>
                <h1 className="text-xl sm:text-2xl font-bold text-[#EE2B6C] m-0">Advanced Settings</h1>
                <p className="text-xs sm:text-sm text-gray-400 m-0 mt-1 font-medium">Configure global platform parameters and personalize your administrative experience</p>
            </div>

            {/* Main Layout Grid: Xếp dọc trên mobile/tablet, chia cột trên desktop */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column - Accounts & Configs (Chiếm 2 phần ba diện tích) */}
                <div className="lg:col-span-2 flex flex-col gap-6">

                    {/* Profile Settings Card */}
                    <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.04)] border border-gray-100 p-5 flex flex-col gap-5">
                        <div className="flex gap-3 items-center">
                            <span className="w-10 h-10 rounded-lg bg-pink-50 text-[#EE2B6C] flex items-center justify-center border border-pink-100/60 shrink-0">
                                <SignatureOutlined className="text-lg" />
                            </span>
                            <div className="min-w-0">
                                <h2 className="text-base sm:text-lg font-bold text-gray-800 m-0">Profile Settings</h2>
                                <p className="text-xs text-gray-400 m-0 mt-0.5 truncate">Update your personal information used for system logs and notifications</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-1">
                            <div className="sm:col-span-2 flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-gray-500 tracking-wider">FULL NAME</label>
                                <Input className="bg-slate-100/80! hover:bg-slate-100! py-2 rounded-md" variant="borderless" />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-gray-500 tracking-wider">PHONE</label>
                                <Input className="bg-slate-100/80! hover:bg-slate-100! py-2 rounded-md" variant="borderless" />
                            </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-gray-500 tracking-wider">EMAIL ADDRESS</label>
                            <Input className="bg-slate-100/80! hover:bg-slate-100! py-2 rounded-md" variant="borderless" />
                        </div>

                        <div className="flex justify-end mt-2">
                            <Button color="pink" variant="solid" className="h-10 font-semibold px-6 shadow-sm">
                                Save Changes
                            </Button>
                        </div>
                    </div>

                    {/* System Configuration Card */}
                    <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.04)] border border-gray-100 p-5 flex flex-col gap-5">
                        <div className="flex gap-3 items-center">
                            <span className="w-10 h-10 rounded-lg bg-amber-50 text-[#D97909] flex items-center justify-center border border-amber-100/60 shrink-0">
                                <ToolOutlined className="text-lg" />
                            </span>
                            <div className="min-w-0">
                                <h2 className="text-base sm:text-lg font-bold text-gray-800 m-0">System Configuration</h2>
                                <p className="text-xs text-gray-400 m-0 mt-0.5 truncate">Control the global state of the customer-facing system</p>
                            </div>
                        </div>

                        <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-1">
                            <div className="min-w-0">
                                <h3 className="text-sm font-bold text-gray-700 m-0">Maintenance Mode</h3>
                                <p className="text-xs text-gray-400 m-0 mt-1 leading-relaxed">When enabled, customers will see an "Under Maintenance" message across the entire site.</p>
                            </div>
                            <Switch defaultChecked onChange={onChange} className="shrink-0 mt-1 sm:mt-0" />
                        </div>
                    </div>

                </div>

                <div className="flex flex-col gap-6">

                    <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.04)] border border-gray-100 p-5 flex flex-col gap-4">
                        <div className="flex gap-3 items-center pb-1">
                            <span className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center border border-indigo-100/60 shrink-0">
                                <FormatPainterOutlined className="text-lg" />
                            </span>
                            <div className="min-w-0">
                                <h2 className="text-base sm:text-lg font-bold text-gray-800 m-0">Appearance & UI</h2>
                                <p className="text-xs text-gray-400 m-0 mt-0.5 truncate">Choose how the dashboard looks for you</p>
                            </div>
                        </div>

                        <div className="flex justify-between items-center p-3 rounded-xl border border-gray-100 hover:bg-slate-50/60 cursor-pointer transition-all gap-4">
                            <div className="flex items-center gap-3 min-w-0">
                                <span className="w-9 h-9 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center border border-amber-100/50 shrink-0">
                                    <SunFilled className="text-base" />
                                </span>
                                <div className="min-w-0">
                                    <h3 className="text-sm font-bold text-gray-700 m-0">Light Mode</h3>
                                    <p className="text-xs text-gray-400 m-0 truncate">Standard bright interface</p>
                                </div>
                            </div>
                            <ConfigProvider theme={{ token: { colorPrimary: 'rgb(238, 43, 108)' } }}>
                                <Checkbox onChange={onChange} className="shrink-0" />
                            </ConfigProvider>
                        </div>

                        <div className="flex justify-between items-center p-3 rounded-xl border border-gray-100 hover:bg-slate-50/60 cursor-pointer transition-all gap-4">
                            <div className="flex items-center gap-3 min-w-0">
                                <span className="w-9 h-9 rounded-lg bg-slate-800 text-indigo-300 flex items-center justify-center shrink-0">
                                    <MoonFilled className="text-base" />
                                </span>
                                <div className="min-w-0">
                                    <h3 className="text-sm font-bold text-gray-700 m-0">Dark Mode</h3>
                                    <p className="text-xs text-gray-400 m-0 truncate">Reduced eye strain at night</p>
                                </div>
                            </div>
                            <ConfigProvider theme={{ token: { colorPrimary: 'rgb(238, 43, 108)' } }}>
                                <Checkbox onChange={onChange} className="shrink-0" />
                            </ConfigProvider>
                        </div>

                        <div className="flex gap-2.5 items-start border-t border-gray-100 pt-4 mt-1 text-xs text-gray-400 leading-normal">
                            <InfoCircleFilled className="text-gray-400 mt-0.5 text-sm shrink-0" />
                            <p className="m-0">Switching themes will update your local CSS variables and library components</p>
                        </div>
                    </div>

                    <div className="flex flex-col justify-center bg-pink-50/40 border border-pink-100 rounded-xl shadow-[0_4px_12px_rgba(238,43,108,0.02)] p-5 gap-4">
                        <h4 className="text-xs font-bold tracking-wider text-[#EE436C] m-0">QUICK NAVIGATION</h4>

                        <div className="flex items-center gap-3 text-sm font-semibold text-gray-600 hover:text-[#EE2B6C] cursor-pointer transition-colors group">
                            <SafetyCertificateFilled className="text-gray-400 group-hover:text-[#EE2B6C] text-base shrink-0 transition-colors" />
                            <span className="m-0">Security & API Keys</span>
                        </div>

                        <div className="flex items-center gap-3 text-sm font-semibold text-gray-600 hover:text-[#EE2B6C] cursor-pointer transition-colors group">
                            <HistoryOutlined className="text-gray-400 group-hover:text-[#EE2B6C] text-base shrink-0 transition-colors" />
                            <span className="m-0">Audit logs</span>
                        </div>

                        <div className="flex items-center gap-3 text-sm font-semibold text-gray-600 hover:text-[#EE2B6C] cursor-pointer transition-colors group">
                            <GlobalOutlined className="text-gray-400 group-hover:text-[#EE2B6C] text-base shrink-0 transition-colors" />
                            <span className="m-0">Localization</span>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}


export default Setting