import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import { useCart } from '../../context/CartContext';
import { useEffect } from 'react';
import { EditOutlined, FacebookOutlined, InstagramOutlined, YoutubeOutlined } from '@ant-design/icons'
import { Button, message, Modal } from 'antd'
import { Outlet, Link } from 'react-router-dom';
import { putUsersApi } from '../../services/userService.js';
import { uploadAvatarToCloudApi } from '../../services/userService.js';


function CustomerLayout() {

    const { user, logoutUser, updateUserLocal } = useAuth();
    const { cart } = useCart();

    const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
    const [openLogo, setOpenLogo] = useState(false)
    const [pickPicture, setPickPicture] = useState('')


    const sampleAvatars = ['none-avt.png', 'carrick.jpg', 'davidbeckham.png', 'edwin.jpg', 'evra.jpg', 'ronaldo.jpg', 'tevez.jpg', 'vidic.jpg', 'hargo.jpg', 'rio.jpg'];

    const handleUpdateProfile = async () => {
        if (!user?.id) return;
        try {
            let avatarUrl = pickPicture || user.avatar;

            if (pickPicture && typeof pickPicture !== 'string') {
                message.loading({ content: "Uploading avatar...", key: "avatar_upload" });
                
                avatarUrl = await uploadAvatarToCloudApi(pickPicture); 
                
                message.success({ content: "Avatar uploaded! 🎉", key: "avatar_upload" });
            }

            const payload = {
                avatar: avatarUrl, 
            };

            const response = await putUsersApi(user.id, payload);

            if (response?.success || response?.data?.success) {
                updateUserLocal({ avatar: avatarUrl });

                message.success("Profile updated successfully! ❤️");
                setIsAvatarModalOpen(false);
                setOpenLogo(false);
            }
        } catch (error) {
            console.error("Update profile Error:", error);
            message.error("Failed to update avatar. Please try again!");
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 text-gray-800">
            <header className="bg-[#2a0614] border-b border-white/10 sticky top-0 z-50">
                <div className="max-w-screen-2xl mx-auto">
                    <div className="flex items-center justify-between px-4 lg:px-8 h-20">

                        <Link to="/" className="flex items-center gap-2 shrink-0">
                            <span className="text-3xl font-bold tracking-wider text-white">THE CRUMB</span>
                            <span className="font-light text-pink-500">&</span>
                            <span className="text-3xl font-bold tracking-wider text-white">BEAN</span>
                        </Link>

                        <nav className="hidden md:flex items-center gap-10 text-sm font-medium text-white/90">
                            <Link to="/" className="hover:text-white transition-colors">HOME</Link>
                            <Link to="/products" className="hover:text-white transition-colors">SHOP</Link>
                            <Link to="/cart" className="flex items-center gap-1.5 hover:text-white transition-colors">
                                CART
                                {cart.length > 0 && (
                                    <span className="ml-1 bg-pink-600 text-white text-xs px-2 py-0.5 rounded-full min-w-4.5 h-4.5 flex items-center justify-center">
                                        {cart.length}
                                    </span>
                                )}
                            </Link>

                            {user ? <Link to="/order" className="hover:text-white transition-colors">ORDER</Link> : <button onClick={() => { message.error("You need to login") }} className="hover:text-white transition-colors" >ORDER</button>}
                        </nav>

                        <div className="flex items-center gap-3 shrink-0">
                            {user ? (
                                <div className="flex items-center gap-3">
                                    <span className="hidden text-sm font-medium text-white/90 md:block">
                                        Hi, {user.name}
                                    </span>

                                    <button
                                        onClick={() => setOpenLogo(true)}
                                        className="cursor-pointer rounded-full transition-transform hover:scale-105 focus:outline-none"
                                    >
                                        <img
                                            className="w-9 h-9 rounded-full object-cover border border-white/40 shadow-sm"
                                            src={user.avatar?.startsWith('http') ? user.avatar : `/product/avtusers/${user.avatar || 'default-avatar.png'}`}
                                            alt="user_avatar"
                                        />
                                    </button>

                                    <button
                                        onClick={logoutUser}
                                        className="px-4 py-1.5 text-xs font-medium text-white/90 border border-white/20 hover:border-white/50 rounded-full transition-all focus:outline-none"
                                    >
                                        Logout
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2.5">
                                    <Link
                                        to="/login"
                                        className="px-4 py-1.5 text-xs font-semibold text-white border border-white/20 hover:border-white/50 rounded-full transition-all focus:outline-none"
                                    >
                                        Sign In
                                    </Link>

                                    <Link
                                        to="/register"
                                        className="px-4 py-1.5 text-xs font-semibold bg-white text-gray-900 hover:bg-white/90 rounded-full transition-all shadow-sm focus:outline-none"
                                    >
                                        Join Now
                                    </Link>
                                </div>
                            )}
                        </div>

                        <Modal
                            title={<span className="text-lg font-bold font-heading">User Profile</span>}
                            open={openLogo}
                            onCancel={() => setOpenLogo(false)}
                            onOk={handleUpdateProfile}
                            centered
                            width={380}
                            okText="Save Changes"
                            cancelText="Cancel"
                        >
                            <div className="py-4 px-2">
                                <div className="relative flex justify-center mb-6">
                                    <div className="relative group">
                                        <img
                                            src={pickPicture?.startsWith('http') ? pickPicture : `/product/avtusers/${pickPicture || 'none-avt.png'}`}
                                            alt="user-avatar"
                                            className="w-24 h-24 rounded-full object-cover shadow-md bg-light-surface border-2 border-gray-100 transition-transform duration-300 group-hover:scale-[1.02]"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setIsAvatarModalOpen(true)}
                                            className="absolute bottom-0 right-0 bg-primary-500 text-white w-8 h-8 rounded-full hover:bg-primary-600 transition-colors shadow-md flex items-center justify-center cursor-pointer border-2 border-white"
                                        >
                                            <EditOutlined className="text-xs" />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-3 bg-light-surface p-4 rounded-xl border border-gray-100 text-sm">
                                    <div className="flex justify-between items-center pb-2 border-b border-gray-200/60">
                                        <span className="text-light-text-secondary font-medium">ID</span>
                                        <span className="font-mono text-gray-500 text-xs">{user?.id || user?._id}</span>
                                    </div>
                                    <div className="flex justify-between items-center pb-2 border-b border-gray-200/60">
                                        <span className="text-light-text-secondary font-medium">Role</span>
                                        <span className="px-2 py-0.5 text-xs font-semibold bg-primary-500/10 text-primary-500 rounded-md">
                                            {user?.role}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center pb-2 border-b border-gray-200/60">
                                        <span className="text-light-text-secondary font-medium">Name</span>
                                        <span className="font-semibold text-light-text">{user?.name}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-light-text-secondary font-medium">Email</span>
                                        <span className="text-light-text font-medium">{user?.email}</span>
                                    </div>
                                </div>
                            </div>
                        </Modal>

                        <Modal
                            title={<span className="text-base font-bold font-heading">Select Profile Avatar</span>}
                            open={isAvatarModalOpen}
                            onCancel={() => setIsAvatarModalOpen(false)}
                            footer={null}
                            centered
                            width={420}
                        >
                            <div className="grid grid-cols-3 gap-3 pt-3 max-h-87.5 overflow-y-auto pr-1">
                                {sampleAvatars.map((avtName) => {
                                    const isSelected = pickPicture === avtName;

                                    return (
                                        <div
                                            key={avtName}
                                            onClick={() => {
                                                setPickPicture(avtName);
                                                setIsAvatarModalOpen(false);
                                                message.success(`Selected temporary avatar. Click Save to commit.`);
                                            }}
                                            className={`cursor-pointer border-2 p-1 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-sm overflow-hidden bg-white ${isSelected
                                                ? 'border-primary-500 ring-2 ring-primary-500/20'
                                                : 'border-gray-200 hover:border-primary-400'
                                                }`}
                                        >
                                            <img
                                                src={`/product/avtusers/${avtName}`}
                                                alt={avtName}
                                                className="w-full aspect-square object-cover rounded-lg"
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        </Modal>

                        <button className="md:hidden text-2xl text-white">☰</button>
                    </div>
                </div>
            </header>

            <main className="grow w-full">
                <Outlet />
            </main>

            <footer className="bg-[#2a0614] border-t border-white/10 py-12">
                <div className="px-6 mx-auto max-w-7xl">
                    <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
                        <div>
                            <h2 className="mb-2 text-2xl font-bold tracking-wider text-white">
                                THE CRUMB & BEAN
                            </h2>
                            <p className="text-sm text-white/60">
                                Artisanal coffee & pastry club since 2024
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-white/10 pt-6">

                            <div className="flex flex-wrap justify-center gap-6 text-sm text-white/70">
                                <a href="#" className="transition-colors hover:text-white">Shop</a>
                                <a href="#" className="transition-colors hover:text-white">Membership</a>
                                <a href="#" className="transition-colors hover:text-white">About Us</a>
                                <a href="#" className="transition-colors hover:text-white">Contact</a>
                            </div>

                            <div className="flex items-center gap-4 text-lg text-white/60">
                                <a
                                    href="https://facebook.com"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center transition-all hover:bg-white/20 hover:text-white hover:-translate-y-0.5"
                                >
                                    <FacebookOutlined />
                                </a>
                                <a
                                    href="https://instagram.com"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center transition-all hover:bg-white/20 hover:text-white hover:-translate-y-0.5"
                                >
                                    <InstagramOutlined />
                                </a>
                                <a
                                    href="https://www.youtube.com/watch?v=Q17C4TrJdW0"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center transition-all hover:bg-white/20 hover:text-white hover:-translate-y-0.5"
                                >
                                    <YoutubeOutlined />
                                </a>
                            </div>

                        </div>

                        <div className="text-xs text-center text-white/50 md:text-right">
                            © 2026 THE CRUMB & BEAN<br />
                            Crafted with precision
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default CustomerLayout;