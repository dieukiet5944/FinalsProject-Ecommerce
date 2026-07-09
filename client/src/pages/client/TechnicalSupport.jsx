import { useState } from 'react';
import { Form, Input, Select, Button, Upload, message, Card } from 'antd';
import { ToolOutlined, UploadOutlined, SendOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useAuth } from '../../hooks/useAuth'; 

const { TextArea } = Input;

const TechnicalSupport = () => {
    const { user } = useAuth();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('userId', user?.id || 'Guest');
            formData.append('issueType', values.issueType);
            formData.append('title', values.title);
            formData.append('description', values.description);

            if (values.screenshot && values.screenshot.fileList.length > 0) {
                formData.append('screenshot', values.screenshot.fileList[0].originFileObj);
            }
            message.success("The issue report has been submitted! The technical department will respond to you via email.");
            form.resetFields();
        } catch (error) {
            message.error("Unable to submit the report, please try again later.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-light-bg py-12 px-4 text-light-text">
            <div className="max-w-2xl mx-auto">

                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary-500/10 text-primary-500 mb-3 text-xl">
                        <ToolOutlined />
                    </div>
                    <h1 className="text-2xl font-bold font-heading text-gray-800">Contact Technical Department</h1>
                    <p className="text-sm text-light-text-secondary mt-1.5">
                        Experiencing issues with your account, order, or payment? Please let us know.</p>
                </div>

                <Card bordered={false} className="shadow-2xs rounded-2xl bg-white border border-gray-100 p-2 sm:p-4">
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={onFinish}
                        requiredMark={false}
                        initialValues={{ issueType: 'payment' }}
                    >
                        <Form.Item
                            name="issueType"
                            label={<span className="text-xs font-bold text-gray-600">Type of Incident</span>}
                        >
                            <Select className="h-10 rounded-xl">
                                <Select.Option value="account">Login/Account Error</Select.Option>
                                <Select.Option value="payment">Payment Error/Deduction</Select.Option>
                                <Select.Option value="order">Order Not Found/Cart</Select.Option>
                                <Select.Option value="ui">Interface Display Error</Select.Option>
                                <Select.Option value="other">Other Technical Issues</Select.Option>
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="title"
                            label={<span className="text-xs font-bold text-gray-600">Short Title</span>}
                            rules={[{ required: true, message: 'Please enter the incident title!' }]}
                        >
                            <Input className="rounded-xl h-10 border-gray-200" placeholder="Example: Payment was deducted via MoMo, but the order was reported as failed." />
                        </Form.Item>

                        <Form.Item
                            name="description"
                            label={<span className="text-xs font-bold text-gray-600">Detailed Incident Description</span>}
                            rules={[{ required: true, message: 'Please describe the error in detail!' }]}
                        >
                            <TextArea
                                rows={5}
                                className="rounded-xl border-gray-200 p-3"
                                placeholder="Please describe the steps that led to the error or the error message you saw on the screen..."
                            />
                        </Form.Item>

                        <Form.Item
                            name="screenshot"
                            label={<span className="text-xs font-bold text-gray-600">Illustrative Screenshot (if available)</span>}
                        >
                            <Upload maxCount={1} beforeUpload={() => false} listType="picture">
                                <Button icon={<UploadOutlined />} className="rounded-xl text-xs font-semibold hover:border-primary-500 hover:text-primary-500">
                                    Select the Image with the Error
                                </Button>
                            </Upload>
                        </Form.Item>

                        <div className="flex gap-2 items-start bg-gray-50 p-3 rounded-xl border border-gray-100 mb-6 text-2xs text-gray-500 leading-relaxed">
                            <InfoCircleOutlined className="text-primary-500 mt-0.5 text-xs" />
                            <span>
                                Your request will be forwarded directly to the technical administrator dashboard. We typically respond and process your request within 1-2 business hours.              </span>
                        </div>

                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            icon={<SendOutlined />}
                            className="w-full bg-primary-500 hover:bg-primary-600 border-none h-11 rounded-xl font-bold tracking-wide text-xs shadow-md"
                        >
                            SUBMIT TECHNICAL REPORT
                        </Button>
                    </Form>
                </Card>
            </div>
        </div>
    );
};

export default TechnicalSupport;