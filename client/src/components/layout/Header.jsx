import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useEffect } from 'react';
import { EditOutlined } from '@ant-design/icons'
import { Button, message, Modal } from 'antd'
import axios from 'axios';

const Header = () => {
  const { user, logout, updateUserLocal  } = useAuth();
  const { cart } = useCart();

  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [openLogo, setOpenLogo] = useState(false)
  const [pickPicture, setPickPicture] = useState('')

  console.log(pickPicture)

  const sampleAvatars = ['none-avt.png', 'carrick.jpg', 'davidbeckham.png', 'edwin.jpg', 'evra.jpg'];

  const handleUpdateProfile = async () => {
    if (!user?.id) return;
    try {
      const payload = {
        avatar: pickPicture,
      };

      const response = await axios.put(`http://localhost:8080/users/${user?.id}`, payload);

      console.log(response)

      if (response.data.success) {
        updateUserLocal({ avatar: pickPicture }); 

        message.success("Product updated successfully! ❤️");
        setIsAvatarModalOpen(false);
        setOpenLogo(false)
      }
    } catch (error) {
      console.error("Update profile Error:", error);
    }
  }

  return (
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
             
            { user ? <Link to="/order" className="hover:text-white transition-colors">ORDER</Link> : <button onClick={() => { message.error("You need to login") }} className="hover:text-white transition-colors" >ORDER</button>}
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            {user ? (
              <div className="flex items-center gap-4">
                <span className="hidden text-sm text-white/80 md:block">
                  Hi, {user.name}
                </span>
                <button onClick={() => setOpenLogo(true)} className='cursor-pointer' >
                  <img className='w-10 h-10 rounded-xl border-2 border-solid' src={`/product/avtusers/${user.avatar}`} alt="img_logo" />
                </button>

                <button
                  onClick={logout}
                  className="px-5 py-2 text-sm border border-white/30 hover:border-white/60 rounded-full transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-6 py-2.5 text-sm border border-white/30 hover:border-white/60 rounded-full transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-6 py-2.5 text-sm bg-white text-[#2a0614] font-semibold rounded-full hover:bg-white/90 transition-colors"
                >
                  Join Now
                </Link>
              </div>
            )}
          </div>

          <Modal
            title="Profile"
            open={openLogo}
            onCancel={() => setOpenLogo(false)}
            onOk={handleUpdateProfile}
            centered
            width={400}
          >
            <div className='p-8'>
              <div className="relative pr-5 pl-5 mb-8 flex justify-center">
                <img
                  src={`/product/avtusers/${pickPicture.length === 0 ? 'none-avt.png' : pickPicture}`}
                  alt="admin-avatar"
                  className="w-12 h-12 sm:w-28 sm:h-28 rounded-xl object-cover bg-slate-800 border border-gray-150"
                />
                <button
                  onClick={() => setIsAvatarModalOpen(true)}
                  className="absolute -bottom-1 right-20 bg-[#EF3D78] text-white p-2 rounded-lg hover:bg-[#5e151a] transition-colors shadow-md flex items-center justify-center cursor-pointer border-2 border-white"
                >
                  <EditOutlined className="text-xs" />
                </button>
              </div>

              <div className='flex flex-col gap-1'>
                <h2><strong>ID: </strong>{user?.id}</h2>
                <h2><strong>Role: </strong>{user?.role}</h2>
                <h2><strong>Name: </strong>{user?.name}</h2>
                <h2><strong>Mail: </strong>{user?.email}</h2>
              </div>
            </div>
          </Modal>

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
                    setPickPicture(avtName)
                    setIsAvatarModalOpen(false);
                    message.success(`Đã chọn tạm hình ảnh ${avtName}, nhấn Save để lưu lưu!`);
                  }}
                  className={`cursor-pointer border-2 p-1 rounded-xl transition-all overflow-hidden bg-slate-800 hover:border-[#EF3D78] border-[#EF3D78] scale-95 shadow-md }`}
                >
                  <img src={`/product/avtusers/${avtName}`} alt={avtName} className="w-full h-28 object-cover rounded-lg" />
                </div>
              ))}
            </div>
          </Modal>

          <button className="md:hidden text-2xl text-white">☰</button>
        </div>
      </div>
    </header>
  );
};

export default Header;