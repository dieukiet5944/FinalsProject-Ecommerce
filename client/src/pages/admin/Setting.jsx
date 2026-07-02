import React, { useEffect, useState } from "react";
import { UserOutlined, LockOutlined, EditOutlined, PhoneOutlined, MailOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { message, Modal } from "antd";
import { loginAdminApi, putAdminApi } from "../../services/authService.js";

const Setting = () => {

    const [dataAdmin, setdataAdmin] = useState([]);
    const [loading, setLoading] = useState(true)


    const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

    const [editProfile, setEditProfile] = useState({
        name: '',
        email: '',
        avatar: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const sampleAvatars = ['logo-admin.jpg', 'avt-admin.jpg', 'avt-2d-admin.jpg', 'avt-admin1.jpg'];

    useEffect(() => {
        setLoading(true);
        const loadDataAdmin = async () => {
            try {
                const savedAdminInfo = localStorage.getItem("adminInfo");

                if (savedAdminInfo) {
                    const currentAdmin = JSON.parse(savedAdminInfo);

                    setdataAdmin(currentAdmin);

                    setEditProfile({
                        name: currentAdmin.name || '',
                        email: currentAdmin.email || '',
                        avatar: currentAdmin.avatar || 'logo-admin.jpg',
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: ''
                    });

                    console.log("Đã lấy thông tin Admin đăng nhập từ localStorage:", currentAdmin);
                } else {
                    console.warn("Không tìm thấy dữ liệu adminInfo trong localStorage!");
                }

                console.log("Tải toàn bộ dữ liệu admin và đơn hàng thành công!");
            } catch (error) {
                console.error("Lỗi kết nối hệ thống:", error);
                message.error("Không thể kết nối đến máy chủ dữ liệu!");

                setdataAdmin([])
            }
            finally {
                setLoading(false)
            }
        }

        loadDataAdmin();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditProfile(prev => ({ ...prev, [name]: value }));
    };

    const handleDiscard = () => {
        loadDataAdmin();
        message.info("Đã hủy bỏ các thay đổi thô 🔄");
    };

    const handleSaveProfile = async () => {
        try {
            const updatePayload = {};

            if (editProfile.avatar !== dataAdmin.avatar) {
                updatePayload.avatar = editProfile.avatar;
            }

            if (editProfile.name !== dataAdmin.name) {
                if (!editProfile.name) return message.error("Tên không được để trống!");
                updatePayload.name = editProfile.name;
            }

            if (editProfile.email !== dataAdmin.email) {
                if (!editProfile.email) return message.error("Email không được để trống!");
                updatePayload.email = editProfile.email;
            }

            const hasTypedPassword = editProfile.currentPassword || editProfile.newPassword || editProfile.confirmPassword;
            if (hasTypedPassword) {
                if (!editProfile.currentPassword || !editProfile.newPassword) {
                    return message.error("Vui lòng nhập đầy đủ Mật khẩu hiện tại và Mật khẩu mới!");
                }
                if (editProfile.newPassword !== editProfile.confirmPassword) {
                    return message.error("Mật khẩu mới và Xác nhận mật khẩu không trùng khớp! ❌");
                }
                updatePayload.currentPassword = editProfile.currentPassword;
                updatePayload.newPassword = editProfile.newPassword;
            }

            if (Object.keys(updatePayload).length === 0) {
                return message.info("Bạn chưa thay đổi thông tin nào cả! 🤔");
            }

            const response = await putAdminApi(dataAdmin._id, updatePayload);

            if (response.data?.success || response.status === 200) {
                
                const updatedAdminInfo = {
                    ...dataAdmin,
                    ...updatePayload 
                };

                localStorage.setItem("adminInfo", JSON.stringify(updatedAdminInfo));
                setdataAdmin(updatedAdminInfo);

                setEditProfile(prev => ({
                    ...prev,
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                }));

                message.success("Cập nhật dữ liệu thành công! ❤️");
            }

        } catch (error) {
            console.error("Update error:", error);
            message.error(error.response?.data?.message || "Mật khẩu hiện tại không chính xác hoặc trùng Email!");
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6 bg-gray-50 min-h-screen">

            <div className="bg-white rounded-xl border border-gray-100 p-6 flex flex-col sm:flex-row items-center gap-6 relative shadow-xs">

                <div className="relative shrink-0">
                    <img
                        src={`/product/adminavt/${editProfile.avatar || 'logo-admin.jpg'}`}
                        alt="admin-avatar"
                        className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl object-cover bg-slate-800 border border-gray-150"
                    />
                    <button
                        onClick={() => setIsAvatarModalOpen(true)}
                        className="absolute -bottom-1 -right-1 bg-[#EF3D78] text-white p-2 rounded-lg hover:bg-[#d63065] transition-colors shadow-md flex items-center justify-center cursor-pointer border-2 border-white"
                    >
                        <EditOutlined className="text-xs" />
                    </button>
                </div>

                <div className="text-center sm:text-left flex-1">
                    <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 m-0">{dataAdmin?.name || "ADMIN"}</h1>
                    <p className="text-[#EF3D78] font-extrabold text-xs tracking-wider uppercase m-0 mt-1">{dataAdmin?.role || "SUPER ADMIN"}</p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-center sm:justify-end mt-4 sm:mt-0">
                    <button
                        onClick={handleDiscard}
                        className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-500 font-bold text-xs sm:text-sm hover:bg-gray-50 transition-all cursor-pointer"
                    >
                        Discard
                    </button>
                    <button
                        onClick={handleSaveProfile}
                        className="px-5 py-2 bg-[#EF3D78] text-white rounded-lg font-bold text-xs sm:text-sm hover:bg-[#d63065] transition-all cursor-pointer shadow-xs shadow-pink-100"
                    >
                        Save Changes
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-xs">
                <div className="flex items-center gap-2 text-[#EF3D78] font-bold text-base border-b border-gray-50 pb-4 mb-5">
                    <UserOutlined />
                    <span className="text-gray-900 font-extrabold tracking-tight">Personal Information</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Full Name</label>
                        <input
                            type="text"
                            name="name"
                            autoComplete="none"
                            value={editProfile.name}
                            onChange={handleInputChange}
                            className="w-full bg-gray-50/70 border border-gray-100 rounded-lg px-3 py-2.5 text-sm font-semibold text-gray-800 focus:outline-hidden focus:border-[#EF3D78] focus:bg-white transition-all"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Notification Email</label>
                        <input
                            type="email"
                            name="email"
                            autoComplete="none"
                            value={editProfile.email}
                            onChange={handleInputChange}
                            className="w-full bg-gray-50/70 border border-gray-100 rounded-lg px-3 py-2.5 text-sm font-semibold text-gray-800 focus:outline-hidden focus:border-[#EF3D78] focus:bg-white transition-all"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-xs flex flex-col gap-5">
                <div className="flex items-center gap-2 text-[#EF3D78] font-bold text-base border-b border-gray-50 pb-4 mb-1">
                    <LockOutlined />
                    <span className="text-gray-900 font-extrabold tracking-tight">Change Password</span>
                </div>
                <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Current Password</label>
                    <input
                        type="password"
                        name="currentPassword"
                        autoComplete="new-password"
                        placeholder="••••••••"
                        value={editProfile.currentPassword}
                        onChange={handleInputChange}
                        className="w-full bg-gray-50/70 border border-gray-100 rounded-lg px-3 py-2.5 text-sm font-semibold text-gray-800 focus:outline-hidden focus:border-[#EF3D78] focus:bg-white transition-all"
                    />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">New Password</label>
                        <input
                            type="password"
                            name="newPassword"
                            autoComplete="new-password"
                            placeholder="••••••••"
                            value={editProfile.newPassword}
                            onChange={handleInputChange}
                            className="w-full bg-gray-50/70 border border-gray-100 rounded-lg px-3 py-2.5 text-sm font-semibold text-gray-800 focus:outline-hidden focus:border-[#EF3D78] focus:bg-white transition-all"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Confirm New Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            autoComplete="new-password"
                            placeholder="••••••••"
                            value={editProfile.confirmPassword}
                            onChange={handleInputChange}
                            className="w-full bg-gray-50/70 border border-gray-100 rounded-lg px-3 py-2.5 text-sm font-semibold text-gray-800 focus:outline-hidden focus:border-[#EF3D78] focus:bg-white transition-all"
                        />
                    </div>
                </div>
            </div>

            <Modal
                title="Select Admin Avatar"
                open={isAvatarModalOpen}
                onCancel={() => setIsAvatarModalOpen(false)}
                footer={null}
                centered
                width={400}
            >
                <div className="grid grid-cols-2 gap-4 pt-4">
                    {sampleAvatars.map((avtName) => (
                        <div
                            key={avtName}
                            onClick={() => {
                                setEditProfile(prev => ({ ...prev, avatar: avtName }));
                                setIsAvatarModalOpen(false);
                                message.success(`Đã chọn tạm hình ảnh ${avtName}, nhấn Save để lưu lưu!`);
                            }}
                            className={`cursor-pointer border-2 p-1 rounded-xl transition-all overflow-hidden bg-slate-800 hover:border-[#EF3D78] ${editProfile.avatar === avtName ? 'border-[#EF3D78] scale-95 shadow-md' : 'border-transparent'}`}
                        >
                            <img src={`/product/adminavt/${avtName}`} alt={avtName} className="w-full h-28 object-cover rounded-lg" />
                        </div>
                    ))}
                </div>
            </Modal>

        </div>
    );
}


export default Setting