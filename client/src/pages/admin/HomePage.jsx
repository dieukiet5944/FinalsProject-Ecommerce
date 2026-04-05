
import React, { useEffect, useState } from 'react'
import {useNavigate} from 'react-router-dom'
import {MenuUnfoldOutlined, ShoppingOutlined, InboxOutlined, TeamOutlined, StockOutlined, SettingOutlined, SearchOutlined, BellOutlined, LogoutOutlined} from '@ant-design/icons'
import { Input,Button, Modal } from 'antd'

import Dashboard from '../../components/admin/Dashboard'
import Orders from '../../components/admin/OrderManagement'
import Inventory from '../../components/admin/Inventory'
import Customers from '../../components/admin/CustomerDirectory'



const HomePage = () => {

    const [isModalOpen, setIsModalOpen] = useState(false);

    const showModal = () => {
        setIsModalOpen(true);
    };
    const handleOk = () => {
        navigate('/')
    };
    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const [currentPage, setCurrentPage] = useState('welcome');

    const renderContent = () => {
        switch (currentPage) {
        case 'dashboard': return <Dashboard name={adminName} />;
        case 'orders': return <Orders />;
        case 'inventory': return <Inventory />;
        case 'customers': return <Customers />;
        case 'welcome': 
            return (
            <div className='welcome' style={{padding: "14px 24px", display:"flex", justifyContent:"center", alignItems:"center", height:"100vh", gap:"20px"}}>
                <div><img src="../src/assets/logo.png" alt="" style={{width:"350px", height:"350px", borderRadius:"50%"}} /></div>
                <div style={{display:"flex", flexDirection:"column", gap: "5px", textAlign: "center"}}><h2 style={{fontSize: "3.5rem"}}>Welcome back {adminName}!</h2> <p style={{fontSize: "1.5rem",color: "rgb(238, 44, 109)"}}>Wishing you a productive and exciting workday!</p></div>
            </div>
            );
        default: return null;
        }
    };

    const navigate = useNavigate();

    const [adminName, setAdminName] = useState("")
    const [adminRole, setAdminRole] = useState("")
    const URL_DATA = "https://mindx-mockup-server.vercel.app/api/resources/APT-Project-Ecomerce?apiKey=69bc8f883d77cdfa59f97d31"

    useEffect(() => {
        const getData = async () => {
            try {
                const response = await fetch(URL_DATA);
                const jsonData = await response.json();
                const name = jsonData?.data?.data?.[0]?.admin?.[0]?.username;
                const role = jsonData?.data?.data?.[0]?.admin?.[0]?.role;
                
                setAdminName(name);
                setAdminRole(role)
            } catch (error) {
                console.error("Lỗi lấy data:", error);
            }
        };

        getData();
    }, [])
    

    return (
        <div style={{display: "grid", gridTemplateColumns:"20% 80%", width: "100%", height:"100vh", overflow: "hidden"}}>
            <div className='menu-Nav' style={{ display: "grid", gridTemplateRows: "1fr 3fr 0fr", overflowY:"auto"}}>
                <div className='logo-brand' style={{display: "flex",alignItems: "center", gap: "10px", padding: "12px 18px", flex:"1"}}>
                    <img src="../src/assets/logo.png" alt="" style={{width: "120px", height: "120px"}} />

                    <div>
                        <h3 style={{fontWeight: "bold"}}>Crumb & Bean</h3>
                        <p style={{color: "rgb(238, 44, 109)", fontSize:"0,5rem"}}>ADMIN CONSOLE</p>
                    </div>
                </div>

                <div className='navigation-menu' style={{padding: "12px 18px",display: "flex", flexDirection: "column", gap: "10px"}}>
                    <Button 
                        onClick={() => setCurrentPage('dashboard')}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "flex-start",
                            gap: "12px",
                            width: "100%",
                            height: "50px",
                            padding: "0 20px", 
                            borderRadius: "10px",
                            border: "none",
                            fontSize: "16px",
                            cursor: "pointer",
                            transition: "0.3s",
                            boxShadow: "none",
                            backgroundColor: currentPage === 'dashboard' ? '#EE2B6C' : '#ffffff',
                            color: currentPage === 'dashboard' ? '#ffffff' : '#555555',
                        }}
                    >
                        <MenuUnfoldOutlined style={{ fontSize: '20px' }}/> <span style={{ margin: 0, lineHeight: 1 }}>Dashboard</span>
                    </Button>

                    <Button 
                        onClick={() => setCurrentPage('orders')}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "flex-start",
                            gap: "12px",
                            width: "100%",
                            height: "50px",
                            padding: "0 20px", 
                            borderRadius: "10px",
                            border: "none",
                            fontSize: "16px",
                            cursor: "pointer",
                            transition: "0.3s",
                            boxShadow: "none",
                            backgroundColor: currentPage === 'orders' ? '#EE2B6C' : '#ffffff',
                            color: currentPage === 'orders' ? '#ffffff' : '#555555',
                        }}
                    >
                        <ShoppingOutlined style={{ fontSize: '20px' }}/> <span style={{ margin: 0, lineHeight: 1 }}>Orders</span>
                    </Button>

                    <Button 
                        onClick={() => setCurrentPage('inventory')}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "flex-start",
                            gap: "12px",
                            width: "100%",
                            height: "50px",
                            padding: "0 20px", 
                            borderRadius: "10px",
                            border: "none",
                            fontSize: "16px",
                            cursor: "pointer",
                            transition: "0.3s",
                            boxShadow: "none",
                            backgroundColor: currentPage === 'inventory' ? '#EE2B6C' : '#ffffff',
                            color: currentPage === 'inventory' ? '#ffffff' : '#555555',
                        }}
                    >
                        <InboxOutlined style={{ fontSize: '20px' }}/> <span style={{ margin: 0, lineHeight: 1 }}>Inventory</span>
                    </Button>

                    <Button 
                        onClick={() => setCurrentPage('customers')}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "flex-start",
                            gap: "12px",
                            width: "100%",
                            height: "50px",
                            padding: "0 20px", 
                            borderRadius: "10px",
                            border: "none",
                            fontSize: "16px",
                            cursor: "pointer",
                            transition: "0.3s",
                            boxShadow: "none",
                            backgroundColor: currentPage === 'customers' ? '#EE2B6C' : '#ffffff',
                            color: currentPage === 'customers' ? '#ffffff' : '#555555',
                        }}
                    >
                        <TeamOutlined style={{ fontSize: '20px' }}/> <span style={{ margin: 0, lineHeight: 1 }}>Customers</span>
                    </Button>

                    <Button 
                        onClick={() => setCurrentPage('setting')}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "flex-start",
                            gap: "12px",
                            width: "100%",
                            height: "50px",
                            padding: "0 20px", 
                            borderRadius: "10px",
                            border: "none",
                            fontSize: "16px",
                            cursor: "pointer",
                            transition: "0.3s",
                            boxShadow: "none", 
                            backgroundColor: currentPage === 'setting' ? '#EE2B6C' : '#ffffff',
                            color: currentPage === 'setting' ? '#ffffff' : '#555555',
                        }}
                    >
                        <SettingOutlined style={{ fontSize: '20px' }}/> <span style={{ margin: 0, lineHeight: 1 }}>Setting</span>
                    </Button>
                    
                </div>

                <div className='profile-nav' style={{display: "flex",alignItems: "center", gap: "10px", padding: "12px 18px", flex:"1", borderTop: "2px solid #99999982"}}>
                     <img src="../src/assets/logo-admin.jpg" alt="" style={{width: "50px", height: "50px"}}/>
                     <div>
                        <h3 style={{fontWeight: "bold"}}>{adminName}</h3>
                        <p style={{color: "#999", fontSize:"0,5rem"}}>{adminRole}</p>
                     </div>
                </div>

            </div>


            <div className='slide-navigation' style={{backgroundColor: "#F8F6F6", position:"relative", overflowY:"auto", display:"flex", flexDirection:"column", gap:"10px" }}>
                  <div className='slide-searching' style={{zIndex:"1050",position:"sticky",top:"0",padding: "14px 24px", display:"grid",gridGap:"20px", gridTemplateColumns:"80% 20%", width: "100%", backgroundColor:"#fff"}}>
                       <div style={{display:"flex", alignItems: "center", width:"100%", gap:"30px"}}>
                             <div style={{width:"100%",padding: "5px 10px", borderRadius: "8px", backgroundColor:"rgb(241, 245, 249)", display:"flex", justifyContent:"space-between", alignItems: "center"}}>
                                <SearchOutlined style={{color:"#999"}}/>
                                <Input placeholder="Search orders, items, or customers..." variant="borderless"/>
                             </div>
                             <BellOutlined />

                       </div>

                       <div style={{display:"flex", justifyContent:"center", alignItems:"center", borderLeft:"2px solid #99999967"}}>
                          <img src="../src/assets/logo-admin.jpg" alt="" style={{width: "50px", height: "50px"}}/>
                          <Button type="text" onClick={showModal}><LogoutOutlined style={{fontSize:"1.2rem", color:"#999"}}/></Button>
                       </div>

                       <Modal
                            closable={{ 'aria-label': 'Custom Close Button' }}
                            open={isModalOpen}
                            onOk={handleOk}
                            onCancel={handleCancel}
                        >
                            <h1>You want to LOGOUT!</h1>
                        </Modal>
                       
                  </div>

 
                  <div className="main-content">
                        {/* Chỉ render nội dung dựa trên state */}
                        {renderContent()}
                  </div>
            </div>
          
        </div>
    ) 
}


export default HomePage