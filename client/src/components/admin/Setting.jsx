import React from "react";
import {SignatureOutlined, ToolOutlined, FormatPainterOutlined, SunFilled, MoonFilled, InfoCircleFilled, SafetyCertificateFilled, HistoryOutlined, GlobalOutlined} from "@ant-design/icons"
import { Input, Button, Switch, Checkbox, ConfigProvider } from "antd";

const Setting = () => {

    const onChange = checked => {
    console.log(`switch to ${checked}`);
    };

    return (

        <div style={{padding:"24px 36px", display:"flex", flexDirection:"column", gap:"25px", height:"100vh"}}>
            <div>
                <h1 style={{fontSize:"1.5rem", fontWeight:"bold", color:"#EE2B6C"}}>Advanced Settings</h1>
                <p style={{color: "#999"}}>Configure global platform parameters and personalize your administrative experience</p>
            </div>

            <div style={{display:"grid", gridTemplateColumns:"2fr 1fr", gridGap:"20px"}}>
                <div style={{padding:"20px", display:"grid", gridTemplateRows:"2fr 1fr", gap:"10px", gridGap:"20px"}}>
                    <div className="profile-setting" style={{backgroundColor:"#fff", borderRadius:"10px", boxShadow:"5px 5px 4px 0px #999",padding:"12px 20px", display:"grid", gridTemplateRows:"repeat(4, 1fr)", gap: "20px"} }>
                        <div style={{display: "flex", gap: "10px", alignItems:"center"}}>
                            <span style={{borderRadius:"10px",width:"40px", height:"40px", display:"flex", alignContent:"center"}}><SignatureOutlined style={{borderRadius:"10px",padding: "10px 12px",backgroundColor: "rgb(253, 233, 240)", color:"#EE2B6C"}}/></span>
                            <div><h2 style={{fontWeight:"bold"}}>Profile Settings</h2><p style={{color:"#999"}}>Update your personal information used for system logs and notifications</p></div>
                        </div>

                        <div style={{display: "grid", gridTemplateColumns:"2fr 1fr", gridGap:"10px"}}> 
                            <div><label>FULL NAME</label> <Input style={{backgroundColor:"#F1F5F9"}} variant="borderless"/></div>
                            <div><label>PHONE</label> <Input style={{backgroundColor:"#F1F5F9"}} variant="borderless"/></div>
                        </div>

                        <div><label>EMAIL ADDRESS</label>  <Input style={{backgroundColor:"#F1F5F9"}} variant="borderless"/></div>

                        <div style={{display:"flex", justifyContent:"flex-end"}}>
                            <Button color="pink" variant="solid"  >
                                Save Changes
                            </Button>
                        </div>
                    </div>
                    

                    <div className="system-configuration" style={{backgroundColor:"#fff", borderRadius:"10px", boxShadow:"5px 5px 4px 0px #999",padding:"12px 20px", display:"grid", gridTemplateRows:"repeat(2, 1fr)", gap: "5px"} }>
                        <div style={{display: "flex", gap: "10px", alignItems:"center"}}>
                            <span style={{borderRadius:"10px",width:"60px", height:"60px", display:"flex", alignContent:"center"}}><ToolOutlined style={{borderRadius:"10px",padding: "10px 12px",backgroundColor: "rgb(255, 251, 235)", color:"#D97909"}}/></span>
                            <div><h2 style={{fontWeight:"bold"}}>System Configuration</h2><p style={{color:"#999"}}>Control the global state of the customer-facing </p></div>
                        </div>

                        <div style={{borderRadius:"10px",backgroundColor:"#F8FAFC",padding:"20px 24px",display:"flex", justifyContent:"space-between", alignItems:"center", gap:"10px"}}>
                            <div><h3 style={{fontWeight:"bold"}}>Maintenance Mode</h3><p style={{color:"#999"}}>When enable, customers will see a "Under Maintenance" message across the entire site.</p></div>
                            <Switch defaultChecked onChange={onChange} />
                        </div>
                    </div>


                </div>

                <div style={{padding:"20px", display:"grid", gridTemplateRows:"2fr 1fr", gap:"10px", gridGap:"20px"}}>
                    <div style={{backgroundColor:"#fff", borderRadius:"10px", boxShadow:"5px 5px 4px 0px #999",padding:"12px 20px", display:"grid", gridTemplateRows:"repeat(4, 1fr)", gap: "20px"} }>
                         <div style={{display: "flex", gap: "20px", alignItems:"center", padding:"10px 14px"}}>
                             <span style={{borderRadius:"10px",width:"40px", height:"40px", display:"flex", alignContent:"center"}}><FormatPainterOutlined style={{borderRadius:"10px",padding: "10px 12px",backgroundColor: "#EEF2FF", color:"rgb(124, 119, 236)"}} /></span>
                             <div><h2 style={{fontWeight:"bold"}}>Appearance & UI</h2><p style={{color:"#999"}}>Choose how the admin dashboard looks for you</p></div>
                         </div>

                         <div className="sunLight"  style={{display: "flex", gap: "20px", alignItems:"center", padding:"10px 14px", borderRadius:"10px", cursor:"pointer"}}>
                             <span style={{borderRadius:"10px",width:"40px", height:"40px", display:"flex", alignContent:"center"}}><SunFilled style={{borderRadius:"10px",padding: "10px 12px",backgroundColor: "#ebebebcd", color:"rgb(245, 158, 11)"}} /></span>
                             <div className="light"><h2 style={{fontWeight:"bold"}}>Light Mode</h2><p style={{color:"#999"}}>Standard bright interface</p></div>
                             <ConfigProvider
                                theme={{
                                token: {
                                    colorPrimary: 'rgb(238, 43, 108)', 
                                },
                                }}
                             >
                                <Checkbox onChange={onChange}></Checkbox>
                            </ConfigProvider>
                         </div>

                         <div className="moonLight" style={{display: "flex", gap: "20px", alignItems:"center", padding:"10px 14px", borderRadius:"10px", cursor:"pointer"}}>
                             <span style={{borderRadius:"10px",width:"40px", height:"40px", display:"flex", alignContent:"center"}}><MoonFilled style={{borderRadius:"10px",padding: "10px 12px",backgroundColor: "rgb(30, 41, 59)", color:"rgb(165, 180, 252)"}} /></span>
                             <div className="light"><h2 style={{fontWeight:"bold"}}>Light Mode</h2><p style={{color:"#999"}}>Reduced eye strain at night</p></div>
                             <ConfigProvider
                                theme={{
                                token: {
                                    colorPrimary: 'rgb(238, 43, 108)', 
                                },
                                }}
                            >
                                <Checkbox onChange={onChange}></Checkbox>
                            </ConfigProvider>
                         </div>

                         <div style={{display: "flex", gap: "20px", alignItems:"center", borderTop:"1px solid #999"}}>
                             <div><p style={{color:"#999"}}><InfoCircleFilled style={{borderRadius:"10px",padding: "10px 12px", color:"rgb(55, 55, 62)"}} /> Switching themes will update your local CSS variables and library components</p></div>
                         </div>
                    </div>

                    <div style={{display:"flex", flexDirection:"column", justifyContent:"space-around",backgroundColor:"rgb(255, 231, 240)", borderRadius:"10px", boxShadow:"5px 5px 4px 0px #999",padding:"12px 20px", gap: "20px", border:"1px solid rgb(238, 43, 108)"}}>
                         <h4 style={{color:"rgb(238, 43, 108)", fontWeight:"bold"}}>QUICK NAVIGATION</h4>
                         <div style={{display: "flex", gap: "20px", alignItems:"center", color: "#777", cursor:"pointer"}}>
                            <span><SafetyCertificateFilled /></span>
                            <h4>Security & API Keys</h4>
                         </div>
                         <div style={{display: "flex", gap: "20px", alignItems:"center", color: "#777", cursor:"pointer"}}>
                            <span><HistoryOutlined /></span>
                            <h4>Audit logs</h4>
                         </div>
                         <div style={{display: "flex", gap: "20px", alignItems:"center", color: "#777", cursor:"pointer"}}>
                            <span><GlobalOutlined /></span>
                            <h4>Localization</h4>
                         </div>
                    </div>

                </div>
            </div>
        </div>
    )
}


export default Setting