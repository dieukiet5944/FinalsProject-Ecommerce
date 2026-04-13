import React, { useState, useEffect, useMemo } from 'react'
import {PoundCircleOutlined, ShoppingCartOutlined, UserAddOutlined, ThunderboltOutlined, ArrowRightOutlined, ExceptionOutlined, DollarOutlined, UserOutlined} from '@ant-design/icons'
import {Cascader, Row, Col, Progress, Space, DatePicker, Spin, message, Avatar, Typography, Card, Flex} from 'antd'
import { fetchUsers, fetchProducts } from '../../services/api';



const twoColors = {
  '0%': '#108ee9',
  '100%': '#87d068',
};
const conicColors = {
  '0%': '#87d068',
  '50%': '#ffe58f',
  '100%': '#ffccc7',
};

const Dashboard = ({name}) => {

    const [dataUser, setDataUser] = useState([])
    const [dataProduct, setDataProduct]= useState([])
    const [historyOrders, setHistoryOrders] = useState([])
    const [loading, setLoading] = useState(false)

    const { Text: AntText } = Typography;

    useEffect(() => {
        
        const getAlldata = async () => {
            setLoading(true)

            try {

                const users = await fetchUsers();

                const products = await fetchProducts()

                const allOrders = users.flatMap(user => 
                    user.history_orders.map(order => {

                        
                        const calculatedTotal = order.items?.reduce((sum, item) => sum + (item.qty * item.price), 0) || 0;

                        return {
                        
                            ...order,
                            key: order.orderId,
                            sumOrders: calculatedTotal,
                        }
                    })
                );

                setHistoryOrders(allOrders);
                setDataUser(users)

                setDataProduct(products);

                console.log("Success to get data from server")
                
            } catch (error) {
             message.error("Error Server 500 !!")
                
            } finally {
              setLoading(false)
            }
        }

        getAlldata()
    }, [])

    const calculateTotalRevenue = () => {
      const completedOrders = historyOrders.filter(order => order.status === 'Completed');

      const total = completedOrders.reduce((sum, order) => {
          return sum + (Number(order.sumOrders) || 0);
      }, 0);

      return total.toLocaleString('en-US', { minimumFractionDigits: 2 });
  };

    const calculatePendingOrders = () => {
        const pendingOrders = historyOrders.filter(order => order.status === 'Processing');
        
        return pendingOrders.length;
    };

    const calculateActiveCus = () => {
        const activeCus = dataUser.filter(order => order.status === 'online');
        
        return activeCus.length;
    };

    const calculateAOV = useMemo(() => {
     
        const aovOrders = historyOrders.filter(order => order.status === 'Completed');

        if (aovOrders.length === 0) return 0;

        return (calculateTotalRevenue() / aovOrders.length).toFixed(2);

    }, [historyOrders]);

    const topSellingItem = useMemo(() => {
        const imageLookup = {};
        if (dataProduct && dataProduct.length > 0) {
            dataProduct.forEach(p => {
                const folder = p.category.toLowerCase(); 
                const key = p.name.toLowerCase().trim();

                imageLookup[key] = `/product/${folder}/${p.image}`;
            });
        }

        const itemCounts = {};

    
        historyOrders
            .filter(order => order.status === 'Completed')
            .forEach(order => {
            order.items?.forEach(item => {
                if (!itemCounts[item.name]) {
                    itemCounts[item.name] = { 
                    name: item.name, 
                    qty: 0, 
                    price: item.price, 
                    image: imageLookup[item.name.toLowerCase().trim()] 
                    };
                }
                itemCounts[item.name].qty += Number(item.qty || 0);
            });
            });
        return Object.values(itemCounts)
            .sort((a, b) => b.qty - a.qty)
            .slice(0, 5); 
    }, [historyOrders, dataProduct]);

    return(

    <div style={{padding:"24px 36px", display:"flex", flexDirection:"column", gap:"25px", height:"100vh"}}>
        <div>
            <h1 style={{fontSize:"1.5rem", fontWeight:"bold", color:"#EE2B6C"}}>Dashboard Overview</h1>
            <p style={{color: "#999"}}>Welcome back, {name}! Here's the buzz from your store today</p>
        </div>

        {/* Certification number TOP - TIER  */}

        <div style={{display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gridGap:"20px"}}>
            <div style={{padding:"20px", display:"flex", flexDirection:"column", gap:"10px", backgroundColor:"#fff", borderRadius:"10px", boxShadow:"5px 5px 4px 0px #999"}}>
                 <div style={{display:"flex", justifyContent:"space-between", textAlign:"center"}}>
                      <DollarOutlined style={{fontSize: "20px",padding:"10px", borderRadius:"8px" , backgroundColor:"rgb(220, 252, 231)", color:"rgb(42, 146, 80)"}} />
                      {/* <p style={{padding:"10px", borderRadius:"13px" , backgroundColor:"rgb(220, 252, 231)", color:"rgb(75, 209, 124)"}}>+12,5%</p> */}
                 </div>
                 <p style={{fontWeight:"bold"}}>TOTAL REVENUE</p>
                 <h2 style={{color:"rgb(42, 146, 80)", backgroundColor:"rgb(220, 252, 231)", padding:"5px 12px", borderRadius:"8px"}}>$ {calculateTotalRevenue()}</h2>
            </div>

            <div style={{padding:"20px", display:"flex", flexDirection:"column", gap:"10px", backgroundColor:"#fff", borderRadius:"10px", boxShadow:"5px 5px 4px 0px #999"}}>
                 <div style={{display:"flex", justifyContent:"space-between", textAlign:"center"}}>
                      <ShoppingCartOutlined style={{fontSize: "20px",padding:"10px", borderRadius:"8px" , backgroundColor:"rgb(219, 234, 254)", color:"rgb(73, 113, 191)"}} />
                      {/* <p style={{padding:"10px", borderRadius:"13px" , backgroundColor:"rgb(219, 234, 254)", color:"rgb(128, 166, 244)"}}>+8,2%</p> */}
                 </div>
                 <p style={{fontWeight:"bold"}}>PENDING ORDERS</p>
                 <h2 style={{color:"rgb(73, 113, 191)", backgroundColor:"rgb(219, 234, 254)", padding:"5px 12px", borderRadius:"8px"}}>{calculatePendingOrders()} <ExceptionOutlined /></h2>
            </div>

            <div style={{padding:"20px", display:"flex", flexDirection:"column", gap:"10px", backgroundColor:"#fff", borderRadius:"10px", boxShadow:"5px 5px 4px 0px #999"}}>
                 <div style={{display:"flex", justifyContent:"space-between", textAlign:"center"}}>
                      <UserAddOutlined style={{fontSize: "20px",padding:"10px", borderRadius:"8px" , backgroundColor:"rgb(254, 234, 241)", color:"rgb(239, 61, 120)"}} />
                      {/* <p style={{padding:"10px", borderRadius:"13px" , backgroundColor:"rgb(254, 234, 241)", color:"rgb(239, 61, 120)"}}>+5,4%</p> */}
                 </div>
                 <p style={{fontWeight:"bold"}}>ACTIVE CUSTOMERS</p>
                 <h2 style={{color:"rgb(239, 61, 120)", backgroundColor:"rgb(254, 234, 241)", padding:"5px 12px", borderRadius:"8px"}}>{calculateActiveCus()} <UserOutlined /></h2>
            </div>

            <div style={{padding:"20px", display:"flex", flexDirection:"column", gap:"10px", backgroundColor:"#fff", borderRadius:"10px", boxShadow:"5px 5px 4px 0px #999"}}>
                 <div style={{display:"flex", justifyContent:"space-between", textAlign:"center"}}>
                      <ThunderboltOutlined style={{fontSize: "20px",padding:"10px", borderRadius:"8px" , backgroundColor:"rgb(244, 219, 183)", color:"rgb(255, 152, 0)"}} />
                      {/* <p style={{padding:"10px", borderRadius:"13px" , backgroundColor:"rgb(244, 219, 183)", color:"rgb(255, 152, 0)"}}>4.9</p> */}
                 </div>
                 <p style={{fontWeight:"bold"}}>AOV</p>
                 <h2 style={{color:"rgb(255, 152, 0)", backgroundColor:"rgb(244, 219, 183)", padding:"5px 12px", borderRadius:"8px"}}>$ {calculateAOV}</h2>
            </div>
        </div>

        {/* Progress here slide-2 */}
        <div style={{display:"grid", gridTemplateColumns:"2fr 1fr", gridGap:"10px", height: "80vh"}}>
            <div style={{display:"grid", gridTemplateRows:"1fr 4fr", backgroundColor:"#fff",padding:"20px", borderRadius: "10px", gridGap:"10px"}}>
                <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                     <div style={{display:"flex", flexDirection:"column", gap:"10px"}}>
                        <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>Weekly Sales Performance</h2>
                     </div>      

                     <Space align="center">
                        <DatePicker 
                        picker="week" 
                        placeholder="Select week"
                        onChange={(date, dateString) => {
                            console.log("Selected week:", dateString);
                        }}
                        />
                        </Space>
                </div>


                <div style={{ display: "grid", gridTemplateRows: "1fr 1fr", rowGap: "40px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gridGap: "20px", textAlign: "center" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                            <Progress type="circle" percent={90} strokeColor={twoColors} />
                            <span style={{ marginTop: "10px", fontWeight: "bold" }}>Monday</span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                            <Progress type="circle" percent={100} strokeColor={twoColors} />
                            <span style={{ marginTop: "10px", fontWeight: "bold" }}>Tuesday</span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                            <Progress type="circle" percent={93} strokeColor={conicColors} />
                            <span style={{ marginTop: "10px", fontWeight: "bold" }}>Wednesday</span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                            <Progress type="circle" percent={93} strokeColor={conicColors} />
                            <span style={{ marginTop: "10px", fontWeight: "bold" }}>Thursday</span>
                        </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gridGap: "20px", textAlign: "center" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                            <Progress type="circle" percent={93} strokeColor={conicColors} />
                            <span style={{ marginTop: "10px", fontWeight: "bold" }}>Friday</span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                            <Progress type="circle" percent={90} strokeColor={twoColors} />
                            <span style={{ marginTop: "10px", fontWeight: "bold" }}>Saturday</span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                            <Progress type="circle" percent={100} strokeColor={twoColors} />
                            <span style={{ marginTop: "10px", fontWeight: "bold" }}>Sunday</span>
                        </div>
                    </div>
                </div>
            </div> 


            <div className="right-column-scroll" style={{backgroundColor:"#fff",padding:"20px", borderRadius: "10px"}}>
                 <Card 
                    title={<span style={{ fontSize: '20px', fontWeight: 'bold' }}>Top Selling Items</span>} 
                    variant="borderless" 
                    style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                    >
                    <Flex vertical gap="large"> 
                        {topSellingItem.map((item, index) => (
                        <Flex key={index} justify="space-between" align="center" style={{ paddingBottom: '16px', borderBottom: '1px solid #f0f0f0' }}>
                            <Flex gap="middle" align="center">
                            <Avatar 
                                src={item.image} 
                                shape="square" 
                                size={40} 
                                style={{ borderRadius: '8px', border: '1px solid #f0f0f0' }} 
                            />
                            <Flex vertical>
                                <AntText style={{ fontSize: '17px', fontWeight: '600' }}>{item.name}</AntText>
                                <AntText type="secondary" style={{ fontSize: '14px' }}>{item.qty} sales</AntText>
                            </Flex>
                            </Flex>
                            
                            <AntText style={{ color: '#ff4d4f', fontSize: '20px', fontWeight: '500' }}>
                            ${item.price}
                            </AntText>
                        </Flex>
                        ))}
                    </Flex>
                </Card>

            </div>
        </div>


        

       
    </div>
    )
}

export default Dashboard