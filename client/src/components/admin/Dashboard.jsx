import React, { useState } from 'react'
import {PoundCircleOutlined, ShoppingCartOutlined, UserAddOutlined, ThunderboltOutlined, ArrowRightOutlined} from '@ant-design/icons'
import {Cascader, Row, Col} from 'antd'

const options = [
  {
    value: 'last 2 Weeks',
    label: 'last 2 Weeks',
    'aria-label': 'last 2 Weeks',
    'data-title': 'last 2 Weeks',
  },
  {
    value: 'last 7 Days',
    label: 'last 7 Days',
    'aria-label': 'last 7 Days',
    'data-title': 'last 7 Days',
  },
];

const Dashboard = ({name}) => {

    

    return(

    <div style={{padding:"24px 36px", display:"flex", flexDirection:"column", gap:"25px", height:"100vh"}}>
        <div>
            <h1>Dashboard Overview</h1>
            <p style={{color: "#999"}}>Welcome back, {name}! Here's the buzz from your store today</p>
        </div>

        {/* Certification number TOP - TIER  */}

        <div style={{display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gridGap:"20px"}}>
            <div style={{padding:"20px", display:"flex", flexDirection:"column", gap:"10px", backgroundColor:"#fff", borderRadius:"10px", boxShadow:"5px 5px 4px 0px #999"}}>
                 <div style={{display:"flex", justifyContent:"space-between", textAlign:"center"}}>
                      <PoundCircleOutlined style={{fontSize: "20px",padding:"10px", borderRadius:"8px" , backgroundColor:"rgb(220, 252, 231)", color:"rgb(42, 146, 80)"}} />
                      <p style={{padding:"10px", borderRadius:"13px" , backgroundColor:"rgb(220, 252, 231)", color:"rgb(75, 209, 124)"}}>+12,5%</p>
                 </div>
                 <p>Total Revenue</p>
                 <h2>$12,840.50</h2>
            </div>

            <div style={{padding:"20px", display:"flex", flexDirection:"column", gap:"10px", backgroundColor:"#fff", borderRadius:"10px", boxShadow:"5px 5px 4px 0px #999"}}>
                 <div style={{display:"flex", justifyContent:"space-between", textAlign:"center"}}>
                      <ShoppingCartOutlined style={{fontSize: "20px",padding:"10px", borderRadius:"8px" , backgroundColor:"rgb(219, 234, 254)", color:"rgb(73, 113, 191)"}} />
                      <p style={{padding:"10px", borderRadius:"13px" , backgroundColor:"rgb(219, 234, 254)", color:"rgb(128, 166, 244)"}}>+8,2%</p>
                 </div>
                 <p>New Orders</p>
                 <h2>142</h2>
            </div>

            <div style={{padding:"20px", display:"flex", flexDirection:"column", gap:"10px", backgroundColor:"#fff", borderRadius:"10px", boxShadow:"5px 5px 4px 0px #999"}}>
                 <div style={{display:"flex", justifyContent:"space-between", textAlign:"center"}}>
                      <UserAddOutlined style={{fontSize: "20px",padding:"10px", borderRadius:"8px" , backgroundColor:"rgb(254, 234, 241)", color:"rgb(239, 61, 120)"}} />
                      <p style={{padding:"10px", borderRadius:"13px" , backgroundColor:"rgb(254, 234, 241)", color:"rgb(239, 61, 120)"}}>+5,4%</p>
                 </div>
                 <p>Active Customers</p>
                 <h2>892</h2>
            </div>

            <div style={{padding:"20px", display:"flex", flexDirection:"column", gap:"10px", backgroundColor:"#fff", borderRadius:"10px", boxShadow:"5px 5px 4px 0px #999"}}>
                 <div style={{display:"flex", justifyContent:"space-between", textAlign:"center"}}>
                      <ThunderboltOutlined style={{fontSize: "20px",padding:"10px", borderRadius:"8px" , backgroundColor:"rgb(244, 219, 183)", color:"rgb(255, 152, 0)"}} />
                      <p style={{padding:"10px", borderRadius:"13px" , backgroundColor:"rgb(244, 219, 183)", color:"rgb(255, 152, 0)"}}>4.9</p>
                 </div>
                 <p>Average Rating</p>
                 <h2>98% Positive</h2>
            </div>
        </div>

        {/* Progress here slide-2 */}
        <div style={{display:"grid", gridTemplateColumns:"2fr 1fr", gridGap:"10px"}}>
            <div style={{display:"grid", gridTemplateRows:"1fr 2fr", backgroundColor:"#fff",padding:"20px", borderRadius: "10px"}}>
                <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                     <div>
                        <h2>Weekly Sales Performance</h2>
                        <p>0ct 21 - 0ct 27, 2026</p>
                     </div>         

                     <Cascader options={options} placeholder="Last 7 Days" />
                </div>


                <div style={{display:"grid", gridTemplateRows:"3fr 1fr"}}>
                    <div style={{display:"grid", gridTemplateColumns:"repeat(7, 1fr)", gridGap:"10px", textAlign:"center"}} >
                        
                    </div>

                    <div style={{display:"grid", gridTemplateColumns:"repeat(7, 1fr)", gridGap:"10px", textAlign:"center"}}>
                        <p style={{color:"#999"}}>Mon</p>
                        <p style={{color:"#999"}}>Tue</p>
                        <p style={{color:"#999"}}>Web</p>
                        <p style={{color:"#999"}}>Thu</p>
                        <p style={{color:"#999"}}>Fri</p>
                        <p style={{color:"#999"}}>Sat</p>
                        <p style={{color:"#999"}}>Sun</p>
                    </div>
                </div>
            </div> 


            <div style={{backgroundColor:"#fff",padding:"20px", borderRadius: "10px", display:"flex", flexDirection:"column", gap:"10px"}}>
                 <h2>Top Selling Items</h2>

                 <div style={{display: "flex", justifyContent:"space-between", alignItems:"center", gap:"10px"}}>
                    <img src="../src/assets/logo.png" alt="" style={{width:"100px", height:"100px"}}/>

                    <div>
                        <h3>Midnight Chocolate Cake</h3>
                        <p style={{color:"#999"}}>24 sales to day</p>
                    </div>

                    <h3 style={{color:"rgb(239, 61, 120)"}}>$285</h3>
                 </div>
            </div>
        </div>


        

       
    </div>
    )
}

export default Dashboard