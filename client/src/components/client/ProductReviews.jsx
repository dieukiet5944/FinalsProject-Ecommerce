import React, { useState, useEffect } from 'react';
import { Rate, List, Avatar, Button, Modal, Input, Upload, message, Progress, Empty, Space, Typography } from 'antd';
import { PlusOutlined, MessageOutlined } from '@ant-design/icons';
import { useAuth } from '../../hooks/useAuth.js'
import { postReview, getApprovedReviews } from '../../services/reviewService.js';

const { Text } = Typography;

const ProductReviews = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [loading, setLoading] = useState(false);

  const { user } = useAuth()


  useEffect(() => {
    const fetchReviews = async () => {
      if (!productId) return;

      try {
        setLoading(true);
        const response = await getApprovedReviews(productId);

        if (response.success) {
          setReviews(response.data);
        }
      } catch (error) {
        console.error("Product review loading error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [productId]);

  const totalReviews = reviews ? reviews.length : 0;

  const averageRating = totalReviews > 0
    ? (reviews.reduce((sum, item) => sum + (item.rating || 0), 0) / totalReviews).toFixed(1)
    : "0.0";

  const starCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

  if (totalReviews > 0) {
    reviews.forEach(item => {
      const floorRating = Math.floor(item.rating);
      if (starCounts[floorRating] !== undefined) {
        starCounts[floorRating]++;
      }
    });
  }

  const getStarPercentage = (starLevel) => {
    if (totalReviews === 0) return 0;
    const count = starCounts[starLevel] || 0;
    return Math.round((count / totalReviews) * 100);
  };

  const handleSubmitReview = async () => {
    if (!newComment.trim()) {
      return message.error("Please enter your review!");
    }

    const reviewData = {
      productId: productId,
      userId: user?.id,
      userName: user?.name,
      userEmail: user?.email,
      rating: newRating,
      comment: newComment,
      reviewImg: null
    };

    try {
      setSubmitting(true);

      const result = await postReview(reviewData);

      if (result.success) {
        message.success(result.message || "Evaluation successful, awaiting approval!");
        setIsModalOpen(false);
        setReviews(result?.data)
        setNewComment("");
        setNewRating(5);
      }
    } catch (error) {
      console.error(error);
      message.error(error.message || "An error occurred, I couldn't submit a review!");
    } finally {
      setSubmitting(false);
    }

  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-sm border border-gray-100 mt-12">

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center border-b border-gray-100 pb-8 mb-6">
        <div className="text-center">
          <h2 className="text-5xl font-bold text-amber-500 m-0">
            {averageRating}
          </h2>
          <Rate
            disabled
            value={parseFloat(averageRating)} 
            allowHalf
            className="text-amber-400 my-2"
          />
          <div className="text-gray-400 text-xs">
            Based on {totalReviews} actual {totalReviews <= 1 ? 'review' : 'reviews'}
          </div>
        </div>

        <div className="md:col-span-2 space-y-1">
          {[5, 4, 3, 2, 1].map((star) => {
            const percentage = getStarPercentage(star); 
            return (
              <div key={star} className="flex items-center gap-2 text-xs">
                <span className="w-3 font-medium text-gray-500">{star}★</span>
                <Progress
                  percent={percentage}
                  strokeColor="#f59e0b"
                  size="small"
                  showInfo={false}
                  className="m-0"
                />
                <span className="text-gray-400 w-8 text-right">{percentage}%</span>
              </div>
            );
          })}
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

      <div className="space-y-6">
        {reviews && reviews.length > 0 ? (
          reviews.map((item) => (
            <div key={item._id} className="border-b border-gray-50 pb-6 last:border-none">

              <div className="flex items-start justify-between mb-2">
                <Space size="middle">
                  <Avatar className="bg-amber-100 text-amber-700 font-bold">
                    {item.userName ? item.userName[0].toUpperCase() : 'U'}
                  </Avatar>
                  <Space orientation="vertical" size={0}>
                    <Text className="font-semibold text-gray-800">{item.userName}</Text>
                    <Rate disabled defaultValue={item.rating} className="text-xs text-amber-400" />
                  </Space>
                </Space>

                <Text className="text-xs text-gray-400 font-light">
                  {item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN') : ''}
                </Text>
              </div>

              <p className="text-gray-600 text-sm leading-relaxed mb-3 pl-12">
                {item.comment}
              </p>

              {item.reviewImg && (
                <div className="pl-12 mb-3">
                  <img src={item.reviewImg} alt="Feedback" className="w-24 h-24 rounded-xl object-cover border border-gray-100" />
                </div>
              )}

              {item.reply && (
                <div className="bg-amber-50/60 border border-amber-100/70 p-3 rounded-xl ml-12 mt-2">
                  <div className="mb-1">
                    <span className="font-bold text-[11px] text-amber-900 bg-amber-200/60 px-2 py-0.5 rounded-md">
                      Feedback from the Restaurant
                    </span>
                  </div>
                  <p className="text-amber-900 text-sm m-0 font-light">{item.reply}</p>
                </div>
              )}
            </div>
          ))
        ) : (
          <Empty description="Sản phẩm chưa có đánh giá nào." />
        )}
      </div>

      <Modal
        title="Chia sẻ trải nghiệm của bạn"
        open={isModalOpen}
        onOk={handleSubmitReview}
        onCancel={() => setIsModalOpen(false)}
        confirmLoading={submitting}
        okText="Gửi đánh giá"
        cancelText="Hủy"
        okButtonProps={{ className: 'bg-amber-500 hover:bg-amber-600 border-none rounded-xl' }}
      >
        <div className="space-y-4 my-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Your level of satisfaction:</label>
            <Rate value={newRating} onChange={setNewRating} className="text-2xl text-amber-400" />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Review content:</label>
            <Text
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