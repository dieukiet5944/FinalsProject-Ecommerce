import { useState, useEffect } from 'react';
import { Tabs, ConfigProvider, Form, Input, Button, Avatar, Upload, message, Card } from 'antd';
import { UserOutlined, ShoppingOutlined, EnvironmentOutlined, LockOutlined, UploadOutlined } from '@ant-design/icons';
import { useAuth } from '../../hooks/useAuth'; 
import Order from './Order.jsx';

const UserProfile = () => {
    const { user, updateProfileApi } = useAuth();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            form.setFieldsValue({
                name: user.name,
                email: user.email,
                phone: user.phone,
                address: user.address,
            });
        }
    }, [user, form]);

    const onFinishProfile = async (values) => {
        setLoading(true);
        try {
            message.success("Update profile successfully!");
        } catch (error) {
            message.error("Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    const onFinishPassword = async (values) => {
        try {
            message.success("Password changed successfully!");
        } catch (error) {
            message.error("Current password is incorrect");
        }
    };

    const tabItems = [
        {
            key: 'profile',
            label: (
                <span className="flex items-center gap-2 text-sm font-medium py-1">
                    <UserOutlined /> Account Info
                </span>
            ),
            children: (
                <Card variant={false} className="shadow-2xs rounded-2xl bg-white border border-gray-100">
                    <h3 className="text-lg font-bold font-heading mb-6 text-gray-800">Personal Information</h3>

                    <div className="flex items-center gap-5 mb-8 pb-6 border-b border-gray-100">
                        <Avatar size={72} src={user?.avatar} icon={<UserOutlined />} className="bg-primary-500/10 text-primary-500 font-bold" />
                        <div>
                            <Upload maxCount={1} showUploadList={false}>
                                <Button icon={<UploadOutlined />} className="rounded-xl text-xs font-semibold hover:border-primary-500 hover:text-primary-500">Change Avatar</Button>
                            </Upload>
                            <p className="text-2xs text-light-text-secondary mt-1.5">JPG, GIF or PNG. Max size of 2MB</p>
                        </div>
                    </div>

                    <Form form={form} layout="vertical" onFinish={onFinishProfile} requiredMark={false}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5">
                            <Form.Item name="name" label={<span className="text-xs font-bold text-gray-600">Full Name</span>} rules={[{ required: true, message: 'Please enter your name' }]}>
                                <Input className="rounded-xl h-10 border-gray-200 focus:border-primary-500" placeholder="John Doe" />
                            </Form.Item>
                            <Form.Item name="email" label={<span className="text-xs font-bold text-gray-600">Email Address</span>}>
                                <Input className="rounded-xl h-10 bg-gray-50 border-gray-200 text-light-text-secondary" disabled />
                            </Form.Item>
                            <Form.Item name="phone" label={<span className="text-xs font-bold text-gray-600">Phone Number</span>}>
                                <Input className="rounded-xl h-10 border-gray-200" placeholder="090XXXXXXXX" />
                            </Form.Item>
                            <Form.Item name="address" label={<span className="text-xs font-bold text-gray-600">Default Shipping Address</span>}>
                                <Input className="rounded-xl h-10 border-gray-200" placeholder="123 Street, District 1, HCMC" />
                            </Form.Item>
                        </div>
                        <Button type="primary" htmlType="submit" loading={loading} className="mt-4 bg-primary-500 hover:bg-primary-600 border-none h-10 px-6 rounded-xl font-semibold shadow-sm tracking-wide text-xs">
                            SAVE CHANGES
                        </Button>
                    </Form>
                </Card>
            ),
        },
        {
            key: 'orders',
            label: (
                <span className="flex items-center gap-2 text-sm font-medium py-1">
                    <ShoppingOutlined /> My Orders
                </span>
            ),
            children: <Order />, 
        },
        {
            key: 'security',
            label: (
                <span className="flex items-center gap-2 text-sm font-medium py-1">
                    <LockOutlined /> Security
                </span>
            ),
            children: (
                <Card variant={false}className="shadow-2xs rounded-2xl bg-white border border-gray-100 max-w-xl">
                    <h3 className="text-lg font-bold font-heading mb-6 text-gray-800">Change Password</h3>
                    <Form layout="vertical" onFinish={onFinishPassword} requiredMark={false}>
                        <Form.Item name="currentPassword" label={<span className="text-xs font-bold text-gray-600">Current Password</span>} rules={[{ required: true, message: 'Please enter current password' }]}>
                            <Input.Password className="rounded-xl h-10" />
                        </Form.Item>
                        <Form.Item name="newPassword" label={<span className="text-xs font-bold text-gray-600">New Password</span>} rules={[{ required: true, message: 'Please enter new password' }]}>
                            <Input.Password className="rounded-xl h-10" />
                        </Form.Item>
                        <Form.Item name="confirmPassword" label={<span className="text-xs font-bold text-gray-600">Confirm New Password</span>} dependencies={['newPassword']} rules={[{ required: true }, ({ getFieldValue }) => ({ validator(_, value) { if (!value || getFieldValue('newPassword') === value) return Promise.resolve(); return Promise.reject(new Error('Passwords do not match!')); }, })]}>
                            <Input.Password className="rounded-xl h-10" />
                        </Form.Item>
                        <Button type="primary" htmlType="submit" className="bg-gray-900 hover:bg-gray-800 border-none h-10 px-6 rounded-xl font-semibold text-xs tracking-wide">
                            UPDATE PASSWORD
                        </Button>
                    </Form>
                </Card>
            ),
        }
    ];

    return (
        <div className="min-h-screen bg-light-bg py-12 text-light-text">
            <div className="max-w-6xl mx-auto px-4">
                <h1 className="text-3xl font-bold font-heading mb-8">My Account</h1>

                <ConfigProvider
                    theme={{
                        components: {
                            Tabs: {
                                itemSelectedColor: '#FF1493', 
                                inkBarColor: '#FF1493',
                                itemHoverColor: '#ffddf0',
                            },
                        },
                    }}
                >
                    <Tabs
                        tabPlacement="left"
                        items={tabItems}
                        className="account-tabs bg-transparent gap-8"
                        type="line"
                    />
                </ConfigProvider>
            </div>
        </div>
    );
};

export default UserProfile;