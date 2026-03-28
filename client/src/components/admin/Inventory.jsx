import React from 'react'
import {RiseOutlined, WalletOutlined, MoreOutlined} from "@ant-design/icons"
import { Table, Tag, Avatar, Space, Button, Progress} from 'antd';
import {inventorySource} from './data'

const Inventory = () =>{

    const columns = [
    {
      title: 'PRODUCT NAME',
      dataIndex: 'product',
      key: 'product',
      render: (product) => 
        <Space>
          <div style={{display:"flex", alignItems:"center", gap:"10px"}}>
            <Avatar src={product.avatar} />
            <div>
                <p style={{ fontWeight: 'bold', color: '#2d2424' }}>{product.name}</p>
                <p style={{ fontSize: '12px', color: '#8c8c8c' }}>SKU: {product.productId}</p>
            </div>
          </div>
        </Space>
    },
    {
      title: 'CATEGORY',
      dataIndex: 'category',
      key: 'category',
      render: (category) => (
        <Tag style={{ fontWeight: 'bold', padding: '0 10px', backgroundColor:"#999999e1" }}>
            {category}
        </Tag>
      ),
    },
    {
      title: 'STOCK LEVEL',
      dataIndex: 'stock',
      key: 'stock',
      render: (stock) => {

        const percentage = Math.round((stock.currentstock / stock.allstock) * 100);

        const strokecolor = percentage <=20 ? '#ff4d4f' : percentage <=60 ? '#faad14' : '#52c41a'

        return (

        <div style={{ width: 140 }}>
            <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "flex-end", 
                marginBottom: 4 
            }}>
                <span style={{ fontSize: '12px', fontWeight: '500' }}>
                {stock.currentstock}/{stock.allstock} <span style={{color: '#8c8c8c'}}>Units</span>
                </span>
                <span style={{ fontSize: '12px', color: '#6F4E37', fontWeight: 'bold' }}>
                {percentage}%
                </span>
            </div>
            
            <Progress 
                percent={percentage} 
                size="small" 
                showInfo={false} 
                strokeColor={strokecolor} 
            />
        </div>
        )
      }
    },
    {
      title: 'PRICE',
      dataIndex: 'price',
      key: 'price',
      render: (price) => <span style={{ fontWeight: 'bold' }}>${price.toFixed(2)}</span>,
    },
    {
      title: 'STATUS',
      key: 'status',
      dataIndex: 'status',
      render: (status) => {
        let color = '';
        if (status === 'LOW STOCK A') color = 'warning';
        if (status === 'OUT OF STOCK') color = 'default';
        if (status === 'IN STOCK') color = 'success';
        if (status === 'LOW STOCK') color = 'error';
        
        return (
          <Tag color={color} style={{ borderRadius: '12px', fontWeight: 'bold', padding: '0 10px' }}>
            {status}
          </Tag>
        );
      },
    },
    {
      title: 'ACTIONS',
      key: 'action',
      render: () => (
        <Button type="text" icon={<MoreOutlined />} />
      ),
    },
  ];


    return (
        <div style={{padding:"24px 36px", display:"flex", flexDirection:"column", gap:"32px", height:"100vh"}}>
            <div>
                <h1>Inventory Management</h1>
                <p style={{color: "#999"}}>Real-time stock tracking for Drink & Cake lab</p>
            </div>

            

            <div style={{display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gridGap:"20px"}}>
                <div style={{padding:"20px", display:"flex", flexDirection:"column", gap:"10px", backgroundColor:"#fff", borderRadius:"10px", boxShadow:"5px 5px 4px 0px #999"}}>
                    <p style={{color:"#999"}}>TOTAL SKU</p>
                    <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                        <h2>$2,482</h2>
                        <div style={{display:"flex", color:"orange"}}>
                            <RiseOutlined />
                            <p>+8%</p>
                        </div>
                    </div>
                </div>

                <div style={{padding:"20px", display:"flex", flexDirection:"column", gap:"10px", backgroundColor:"#fff", borderRadius:"10px", boxShadow:"5px 5px 4px 0px #999"}}>
                    <p style={{color:"#999"}}>LOW STOCK ALERTS</p>
                    <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                        <h2 style={{color:"#ff8e04"}}>12</h2>
                        <div style={{display:"flex", color:"orange", padding:"5px 10px", backgroundColor:"#fadcb7"}}>
                            <p style={{color:"#ff8e04"}}>ACTION REQUEST</p>
                        </div>
                    </div>
                </div>

                <div style={{padding:"20px", display:"flex", flexDirection:"column", gap:"10px", backgroundColor:"#fff", borderRadius:"10px", boxShadow:"5px 5px 4px 0px #999"}}>
                    <p style={{color:"#999"}}>BAKERY FRESHNESS</p>
                    <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", gap:"10px"}}>
                        <h2 style={{color:"#6dee89"}}>98%</h2>
                        <div style={{ width: "200px" }}>
                            <Progress percent={100} strokeColor="#6dee89"/>
                        </div>
                    </div>
                </div>

                <div style={{padding:"20px", display:"flex", flexDirection:"column", gap:"10px",backgroundColor:"#fff", borderRadius:"10px", boxShadow:"5px 5px 4px 0px #999"}}>
                    <p style={{color:"#999"}}>AVG. PREP TIME</p>
                    <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                        <h2>$14.2k</h2>
                        <div>
                            <WalletOutlined style={{color:"#999", fontSize:"2rem"}}/>
                        </div>
                    </div>
                </div>
            </div>


            <div style={{ padding: '20px', background: '#fff', borderRadius: '8px' }}>
                <Table 
                    columns={columns} 
                    dataSource={inventorySource} 
                    pagination={{
                    total: 128,
                    pageSize: 5,
                    showSizeChanger: false,
                    position: ['bottomRight'],
                    }}
                />
                <div style={{ marginTop: '-45px', color: '#8c8c8c' }}>
                    Showing 1 to 5 of 128 orders
                </div>
            </div>
    </div>
    )
}

export default Inventory