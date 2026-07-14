import React from 'react';
import { Modal, Button } from 'antd';
import { ArrowRightOutlined, EditOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

const UserProfileModal = ({
    open,
    onCancel,
    onOk,
    user,
    pickPicture,
    onEditClick,
    isLoading
}) => {
    return (
        <Modal
            title={<span className="text-lg font-bold font-heading">User Profile</span>}
            open={open}
            onCancel={onCancel}
            onOk={onOk}
            centered
            width={380}
            okText="Save Changes"
            cancelText="Cancel"
            confirmLoading={isLoading}
        >
            <div className="py-4 px-2">
                <div className="relative flex justify-center mb-6">
                    <div className="relative group">
                        <img
                            src={pickPicture?.startsWith?.('http')
                                ? pickPicture
                                : `/product/avtusers/${pickPicture || 'none-avt.png'}`}
                            alt="user-avatar"
                            className="w-24 h-24 rounded-full object-cover shadow-md bg-light-surface border-2 border-gray-100 transition-transform duration-300 group-hover:scale-[1.02]"
                        />
                        <button
                            type="button"
                            onClick={onEditClick}
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

                <div className="mt-4 flex justify-end">
                    <Link to="/profile" onClick={onCancel}>
                        <Button
                            type="link"
                            icon={<ArrowRightOutlined />}
                            placement="end"
                            className="text-xs font-semibold text-primary-500 p-0 hover:text-primary-600 flex items-center gap-1"
                        >
                            View Full Account Details
                        </Button>
                    </Link>
                </div>
            </div>
        </Modal>
    );
};

export default UserProfileModal;