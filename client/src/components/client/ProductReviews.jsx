import React, { useState } from 'react';
import { Rate, List, Avatar, Button, Modal, Input, Upload, message, Progress } from 'antd';
import { PlusOutlined, MessageOutlined } from '@ant-design/icons';

const { TextArea } = Input;

const ProductReviews = ({ productId }) => {
  const [reviews, setReviews] = useState([
    {
      id: "1",
      userName: "Nguyễn Văn A",
      rating: 5,
      comment: "Bánh giao tới còn nóng hổi, vỏ giòn rụm, sốt trứng muối béo ngậy rất vừa miệng. Sẽ ủng hộ quán dài dài!",
      reviewImg: "https://picsum.photos/id/312/120/120",
      date: "2026-07-08",
      reply: "Cảm ơn bạn A đã dành lời khen cho quán ạ! Rất mong được phục vụ bạn ở những lần tới."
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");

  const handleSubmitReview = () => {
    if (!newComment.trim()) {
      return message.error("Please enter your review!");
    }

    const mockNewReview = {
      id: Date.now().toString(),
      userName: "Existing Customers", 
      rating: newRating,
      comment: newComment,
      reviewImg: null,
      date: new Date().toISOString().split('T')[0],
      reply: ""
    };

    message.success("Your review has been successfully submitted and is awaiting approval!");
    setIsModalOpen(false);
    setNewComment("");
    setNewRating(5);
    
  
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-sm border border-gray-100 mt-12">
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center border-b border-gray-100 pb-8 mb-6">
        <div className="text-center">
          <h2 className="text-5xl font-bold text-amber-500 m-0">4.8</h2>
          <Rate disabled defaultValue={4.8} allowHalf className="text-amber-400 my-2" />
          <div className="text-gray-400 text-xs">Based on actual reviews</div>
        </div>
        
        <div className="md:col-span-2 space-y-1">
          <div className="flex items-center gap-2 text-xs"><span className="w-3">5★</span><Progress percent={85} strokeColor="#f59e0b" size="small" showInfo={false} /><span className="text-gray-400">85%</span></div>
          <div className="flex items-center gap-2 text-xs"><span className="w-3">4★</span><Progress percent={10} strokeColor="#f59e0b" size="small" showInfo={false} /><span className="text-gray-400">10%</span></div>
          <div className="flex items-center gap-2 text-xs"><span className="w-3">3★</span><Progress percent={5} strokeColor="#f59e0b" size="small" showInfo={false} /><span className="text-gray-400">5%</span></div>
          <div className="flex items-center gap-2 text-xs"><span className="w-3">2★</span><Progress percent={0} strokeColor="#f59e0b" size="small" showInfo={false} /><span className="text-gray-400">0%</span></div>
          <div className="flex items-center gap-2 text-xs"><span className="w-3">1★</span><Progress percent={0} strokeColor="#f59e0b" size="small" showInfo={false} /><span className="text-gray-400">0%</span></div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-gray-800 m-0">What do customers say about this dish?</h3>
        <Button 
          type="primary" 
          icon={<MessageOutlined />} 
          className="bg-amber-500 hover:bg-amber-600 border-none rounded-xl"
          onClick={() => setIsModalOpen(true)}
        >
          Write a review
        </Button>
      </div>

      <List
        itemLayout="vertical"
        dataSource={reviews}
        renderItem={(item) => (
          <List.Item key={item.id} className="border-b border-gray-50 pb-6 last:border-none">
            <List.Item.Meta
              avatar={<Avatar className="bg-amber-100 text-amber-700 font-bold">{item.userName[0]}</Avatar>}
              title={
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-800">{item.userName}</span>
                  <span className="text-xs text-gray-400 font-light">{item.date}</span>
                </div>
              }
              description={<Rate disabled defaultValue={item.rating} className="text-xs text-amber-400" />}
            />
            <p className="text-gray-600 text-sm leading-relaxed mb-3 mt-1">{item.comment}</p>
            
            {item.reviewImg && (
              <img src={item.reviewImg} alt="Feedback" className="w-24 h-24 rounded-xl object-cover border border-gray-100 mb-3" />
            )}

            {item.reply && (
              <div className="bg-amber-50/60 border border-amber-100/70 p-3 rounded-xl ml-4 mt-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-xs text-amber-900 bg-amber-200/60 px-2 py-0.5 rounded-md">Feedback from the Restaurant</span>
                </div>
                <p className="text-amber-900 text-sm m-0 font-light">{item.reply}</p>
              </div>
            )}
          </List.Item>
        )}
      />

      <Modal
        title={<span className="text-lg font-bold text-gray-800">Share your experience</span>}
        open={isModalOpen}
        onOk={handleSubmitReview}
        onCancel={() => setIsModalOpen(false)}
        okText="Submit a review"
        cancelText="Cancel"
        okButtonProps={{ className: 'bg-amber-500 hover:bg-amber-600 border-none rounded-xl' }}
        cancelButtonProps={{ className: 'rounded-xl' }}
      >
        <div className="space-y-4 my-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Your level of satisfaction:</label>
            <Rate value={newRating} onChange={setNewRating} className="text-2xl text-amber-400" />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Review content:</label>
            <TextArea
              rows={4}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Did you like the taste of this drink/cake? Please share your thoughts with The Crumb & Bean..."
              className="rounded-xl border-gray-300"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Add actual photos (if available):</label>
            <Upload listType="picture-card" maxCount={1} beforeUpload={() => false}>
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>Download image</div>
              </div>
            </Upload>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProductReviews;