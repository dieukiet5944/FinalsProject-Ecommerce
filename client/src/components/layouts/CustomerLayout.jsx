import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import { useCart } from '../../context/CartContext';
import { FireFilled, FacebookOutlined, GithubFilled, YoutubeOutlined } from '@ant-design/icons';
import { message } from 'antd';
import { Outlet, Link } from 'react-router-dom';
import { putUsersApi, uploadAvatarToCloudApi } from '../../services/userService.js';

import UserProfileModal from '../modals/UserProfileModal.jsx';
import AvatarSelectionModal from '../modals/AvatarSelectionModal.jsx';

function CustomerLayout() {
    const { user, logoutUser, updateUserLocal } = useAuth();
    const { cart } = useCart();

    const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
    const [openLogo, setOpenLogo] = useState(false);
    const [pickPicture, setPickPicture] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleUpdateProfile = async () => {
        if (!user?.id) return;
        try {
            setIsLoading(true);
            let avatarUrl = pickPicture || user.avatar;

            if (pickPicture && typeof pickPicture !== 'string') {
                message.loading({ content: "Uploading avatar...", key: "avatar_upload" });
                avatarUrl = await uploadAvatarToCloudApi(pickPicture);
                message.success({ content: "Avatar uploaded! 🎉", key: "avatar_upload" });
            }

            const response = await putUsersApi(user.id, { avatar: avatarUrl });

            if (response?.success || response?.data?.success) {
                updateUserLocal({ avatar: avatarUrl });
                message.success("Profile updated successfully!");
                setOpenLogo(false);
            }
        } catch (error) {
            console.error("Update profile Error:", error);
            message.error("Failed to update avatar. Please try again!");
        } finally {
            setIsLoading(false);
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
                            <Link to="/offerpromo" className="hover:text-white transition-colors flex items-center gap-1">
                                OFFERS <span className="text-xs animate-pulse"><FireFilled /></span>
                            </Link>
                            <Link to="/cart" className="flex items-center gap-1.5 hover:text-white transition-colors">
                                CART
                                {cart.length > 0 && (
                                    <span className="ml-1 bg-pink-600 text-white text-xs px-2 py-0.5 rounded-full min-w-4.5 h-4.5 flex items-center justify-center">
                                        {cart.length}
                                    </span>
                                )}
                            </Link>
                        </nav>

                        <div className="flex items-center gap-3 shrink-0">
                            {user ? (
                                <div className="flex items-center gap-3">
                                    <span className="hidden text-sm font-medium text-white/90 md:block">Hi, {user.name}</span>
                                    <button
                                        onClick={() => { setOpenLogo(true); setPickPicture(user.avatar); }}
                                        className="cursor-pointer rounded-full transition-transform hover:scale-105 focus:outline-none"
                                    >
                                        <img
                                            className="w-9 h-9 rounded-full object-cover border border-white/40 shadow-sm"
                                            src={user.avatar?.startsWith('http') ? user.avatar : `/product/avtusers/${user.avatar || 'default-avatar.png'}`}
                                            alt="user_avatar"
                                        />
                                    </button>
                                    <button onClick={logoutUser} className="px-4 py-1.5 text-xs font-medium text-white/90 border border-white/20 hover:border-white/50 rounded-full transition-all focus:outline-none">
                                        Logout
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2.5">
                                    <Link to="/login" className="px-4 py-1.5 text-xs font-semibold text-white border border-white/20 hover:border-white/50 rounded-full transition-all focus:outline-none">Sign In</Link>
                                    <Link to="/register" className="px-4 py-1.5 text-xs font-semibold bg-white text-gray-900 hover:bg-white/90 rounded-full transition-all shadow-sm focus:outline-none">Join Now</Link>
                                </div>
                            )}
                        </div>

                        <UserProfileModal
                            open={openLogo}
                            onCancel={() => setOpenLogo(false)}
                            onOk={handleUpdateProfile}
                            user={user}
                            pickPicture={pickPicture}
                            onEditClick={() => setIsAvatarModalOpen(true)}
                            isLoading={isLoading}
                        />

                        <AvatarSelectionModal
                            open={isAvatarModalOpen}
                            onCancel={() => setIsAvatarModalOpen(false)}
                            currentPick={pickPicture}
                            onSelect={(avtName) => {
                                setPickPicture(avtName);
                                setIsAvatarModalOpen(false);
                            }}
                        />

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
                            <h2 className="mb-2 text-2xl font-bold tracking-wider text-white">THE CRUMB & BEAN</h2>
                            <p className="text-sm text-white/60">Artisanal coffee & pastry club since 2024</p>
                        </div>
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-white/10 pt-6">
                            <div className="flex flex-wrap justify-center gap-6 text-sm text-white/70">
                                <Link to="/products" className="transition-colors hover:text-white">Shop</Link>
                                <Link to="/" className="transition-colors hover:text-white">Membership</Link>
                                <Link to="/process" className="transition-colors hover:text-white">About Us</Link>
                                <Link to="/contact" className="transition-colors hover:text-white">Contact</Link>
                            </div>
                            <div className="flex items-center gap-4 text-lg text-white/60">
                                <a href="https://facebook.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center transition-all hover:bg-white/20 hover:text-white hover:-translate-y-0.5"><FacebookOutlined /></a>
                                <a href="https://github.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center transition-all hover:bg-white/20 hover:text-white hover:-translate-y-0.5"><GithubFilled /></a>
                                <a href="https://www.youtube.com/watch?v=Q17C4TrJdW0" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center transition-all hover:bg-white/20 hover:text-white hover:-translate-y-0.5"><YoutubeOutlined /></a>
                            </div>
                        </div>
                        <div className="text-xs text-center text-white/50 md:text-right">
                            © 2026 THE CRUMB & BEAN<br />Crafted with precision
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default CustomerLayout;