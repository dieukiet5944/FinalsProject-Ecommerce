import React, { useEffect, useState } from "react";
import axios from 'axios'
import {Input, Form, Card, Button, message, Spin    } from 'antd';
import {useNavigate} from 'react-router-dom';


const AdminLogin = () => {
    
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate();
    
    useEffect(() => {
    const fetchData = async () => {
        try {
            const response = await axios.get("http://localhost:8080/api/serect-key/admin");
            const result = response.data
            
            if (result.ok && Array.isArray(result.data)) {
                setData(result); 
                console.log("The admin array has been retrieved:", result);
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
    const { username, password } = values;

    const userExists = data.find(
        (u) => u.username === username && u.password === password
    );

    if (userExists) {
        localStorage.setItem("isAdminAuthenticated", "true");

        localStorage.setItem("adminInfo", JSON.stringify({
            id: userExists.id,
            username: userExists.username
        }));

        message.success('Login successful! Welcome back, ' + userExists.username);
        navigate('/homepage');
    } else {
        message.error('Incorrect account or password!');
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
                            rules={[{ required: true, message: 'Please enter your username!' }]}
                        >
                            <Input placeholder="Enter administrator name"/>
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