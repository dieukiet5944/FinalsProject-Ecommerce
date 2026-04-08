import React, { useEffect, useState } from "react";
import {Input, Form, Card, Button, message, Spin    } from 'antd';
import {useNavigate} from 'react-router-dom';


const AdminLogin = () => {
    
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate();
    const URL_DATA = "https://mindx-mockup-server.vercel.app/api/resources/APT-Project-Ecomerce?apiKey=69bc8f883d77cdfa59f97d31";
    
    useEffect(() => {
    const fetchData = async () => {
        try {
            const response = await fetch(URL_DATA);
            const result = await response.json();
            
            console.log("Dữ liệu thô từ API:", result);

            const adminList = result?.data?.data?.[0]?.admin;

            if (Array.isArray(adminList)) {
                setData(adminList); 
                console.log("Đã lấy được mảng admin:", adminList);
            } else {
                console.error("Cấu trúc API thay đổi, không tìm thấy mảng admin!");
                setData([]); 
            }
        } catch (error) {
            console.error("Lỗi fetch:", error);
            setData([]); 
        } finally {
            setLoading(false);
        }
    };
    fetchData();
}, []);

    if (loading) return <Spin size="large" />;
    console.log("Dữ liệu đang dùng để so sánh:", data);
    const onFinish = (values) => {
    const { username, password } = values;

    const userExists = data.find(
        (u) => u.username === username && u.password === password
    );

    if (userExists) {
        message.success('Đăng nhập thành công!');
        navigate('/admin');
    } else {
        message.error('Sai tài khoản hoặc mật khẩu!');
    }
};

    return (
        <div style={{width: "100%", height: "100vh", padding: "15px 20px", display: "flex", flexDirection:"column", justifyContent: "center", alignItems:"center"}}>
            <div style={{padding: "12px 24px", borderRadius: "8px", boxShadow: "0px 0px 10px 0px #333"}}>
                <div style={{display:"flex", flexDirection:"column", justifyContent:"center", alignItems: "center"}}>
                    <img src="../src/assets/logo.png" alt="logo" style={{width:"120px", height: "120px"}} />
                    <h1 style={{ fontSize: "24px", margin: "10px 0" }}>The Crumb & Bean</h1>
                    <h2 style={{ fontSize: "16px", color: "#888" }}>ADMIN CONSOLE</h2>
                </div>
                <Spin spinning={loading} >
                <Card variant="borderless">
                    <div style={{ marginBottom: "20px" }}>
                        <h3 style={{ margin: 0 }}>Admin Console Access</h3>
                        <p style={{color: "#999"}}>Enter your credentials to manage the shop system.</p>
                    </div>
                    <Form onFinish={onFinish} layout="vertical">
                        <Form.Item 
                            name="username"
                            label="Admin username"
                            rules={[{ required: true, message: 'Vui lòng nhập username!' }]}
                        >
                            <Input placeholder="Nhập tên quản trị"/>
                        </Form.Item>


                        <Form.Item 
                            name="password"
                            label={<div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', gap: "120px" }}>
                                    <span>Password</span>
                                    <a href="/forgot-password" style={{ fontSize: '12px', color: '#EE2C6D' }}>
                                        Forgot password?
                                    </a>
                                    </div>}
                            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                        >
                            <Input.Password placeholder="Nhập mật khẩu" />
                        </Form.Item>

                        <Form.Item>
                            <Button type="primary" htmlType="submit" block loading={loading} color="pink" variant="solid">
                            Xác nhận
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