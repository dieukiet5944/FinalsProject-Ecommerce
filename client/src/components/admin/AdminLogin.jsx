import React, { useEffect, useState } from "react";
import axios from 'axios'
import { Input, Form, Card, Button, message, Spin } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';



const AdminLogin = () => {

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await axios.get("http://localhost:8080/secret-key/admin");
                const result = response.data;

                if (result && result.success && Array.isArray(result.data)) {
                    setData(result.data);
                    console.log("Danh sách tài khoản Admin đã lấy về thành công:", result.data);
                } else {
                    console.error("The API structure has changed; the admin array is not found!");
                    setData([]);
                }
            } catch (error) {
                console.error("Loading error:", error);
                setData([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <Spin size="large" />;
    console.log("Data being used for comparison:", data);
    const onFinish = (values) => {

        console.log("Dữ liệu người dùng gõ từ Form:", values);
        const emailInput = values.email;
        const passwordInput = values.password;

        const userExists = data.find(
            (u) => u.email === emailInput && String(u.password) === String(passwordInput)
        );
        if (userExists) {
            localStorage.setItem("isAdminAuthenticated", "true");

            localStorage.setItem("adminInfo", JSON.stringify({
                id: userExists.id,
                email: userExists.email
            }));

            message.success('Login successful! Welcome back, ' + userExists.email);
            navigate('/homepage');
        } else {
            message.error('Incorrect account or password!');
        }
    };

    return (
        <div className="w-full min-h-screen p-4 md:p-5 flex flex-col justify-center items-center bg-gray-50">
            <div className="w-full max-w-90 sm:max-w-105 md:max-w-115 p-4 sm:p-6 md:p-8 bg-white rounded-lg shadow-[0_0_10px_0_rgba(51,51,51,0.15)]">

                <div className="flex flex-col justify-center items-center text-center">
                    <img
                        src="../src/assets/logo.png"
                        alt="logo"
                        className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 object-contain"
                    />
                    <h1 className="text-xl sm:text-2xl font-bold my-2 text-gray-800">The Crumb & Bean</h1>
                    <h2 className="text-sm font-semibold tracking-wider text-gray-400 uppercase mb-4">ADMIN CONSOLE</h2>
                </div>

                <Spin spinning={loading}>
                    <Card variant="borderless" className="p-0!">
                        <div className="mb-5 text-center sm:text-left">
                            <h3 className="m-0 text-base sm:text-lg font-medium text-gray-700">Admin Console Access</h3>
                            <p className="text-xs sm:text-sm text-gray-400 mt-1">Enter your credentials to manage the shop system.</p>
                        </div>

                        <Form onFinish={onFinish} layout="vertical" className="w-full">
                            <Form.Item
                                name="email"
                                label={<span className="font-medium text-gray-600 text-sm">Admin email</span>}
                                rules={[{ required: true, message: 'Please enter your email!' }, { type: 'email' }]}
                            >
                                <Input prefix={<MailOutlined className="text-gray-400" />} placeholder="Enter administrator name" className="h-11 rounded-lg" />
                            </Form.Item>

                            <Form.Item
                                name="password"
                                label={<span className="text-xs font-semibold text-slate-600 uppercase">Secret Password</span>}
                                rules={[{ required: true, message: 'Please enter the password!' }]}
                            >
                                <Input.Password prefix={<LockOutlined className="text-gray-400" />} autoComplete="new-password" placeholder="••••••" className="h-11 rounded-lg" />
                            </Form.Item>

                            <Form.Item className="mb-0 mt-6">
                                <Button type="primary" htmlType="submit" block loading={loading} color="pink" variant="solid" className="h-10 text-sm font-medium">
                                    Confirm
                                </Button>
                            </Form.Item>
                        </Form>
                    </Card>
                </Spin>
            </div>
        </div>
    )
}

export default AdminLogin;