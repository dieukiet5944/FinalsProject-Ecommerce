import React, { useEffect, useState } from "react";
import axios from 'axios'
import { Input, Form, Card, Button, message, Spin } from 'antd';
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
        <div style={{ width: "100%", height: "100vh", padding: "15px 20px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
            <div style={{ padding: "12px 24px", borderRadius: "8px", boxShadow: "0px 0px 10px 0px #333" }}>
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                    <img src="../src/assets/logo.png" alt="logo" style={{ width: "120px", height: "120px" }} />
                    <h1 style={{ fontSize: "24px", margin: "10px 0" }}>The Crumb & Bean</h1>
                    <h2 style={{ fontSize: "16px", color: "#888" }}>ADMIN CONSOLE</h2>
                </div>
                <Spin spinning={loading} >
                    <Card variant="borderless">
                        <div style={{ marginBottom: "20px" }}>
                            <h3 style={{ margin: 0 }}>Admin Console Access</h3>
                            <p style={{ color: "#999" }}>Enter your credentials to manage the shop system.</p>
                        </div>
                        <Form onFinish={onFinish} layout="vertical">
                            <Form.Item
                                name="email"
                                label="Admin email"
                                rules={[{ required: true, message: 'Please enter your email!' }]}
                            >
                                <Input placeholder="Enter administrator name" />
                            </Form.Item>


                            <Form.Item
                                name="password"
                                label={<div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', gap: "120px" }}>
                                    <span>Password</span>
                                    <a href="/forgot-password" style={{ fontSize: '12px', color: '#EE2C6D' }}>
                                        Forgot password?
                                    </a>
                                </div>}
                                rules={[{ required: true, message: 'Please enter the password!' }]}
                            >
                                <Input.Password placeholder="Enter password" />
                            </Form.Item>

                            <Form.Item>
                                <Button type="primary" htmlType="submit" block loading={loading} color="pink" variant="solid">
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