import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import './ReviewSection.css';
import { StoreContext } from '../../context/StoreContext';
import StarRating from '../StarRating/StarRating';
import { toast } from 'react-toastify';

const ReviewSection = ({ itemId }) => {
  const { url } = useContext(StoreContext);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [averageRating, setAverageRating] = useState(0);
  const [userReview, setUserReview] = useState({
    rating: 5,
    comment: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasUserReviewed, setHasUserReviewed] = useState(false);

  // Lấy token từ localStorage
  const getToken = () => {
    try {
      return localStorage.getItem('token');
    } catch (e) {
      console.error("Lỗi khi truy cập localStorage:", e);
      return null;
    }
  };

  // Giải mã user_id từ token
  const getUserIdFromToken = () => {
    const token = getToken();
    if (!token) return null;

    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(window.atob(base64));
      return payload.id;
    } catch (err) {
      console.error('Lỗi khi đọc token:', err);
      return null;
    }
  };

  // Lấy danh sách đánh giá
  useEffect(() => {
    const fetchReviews = async () => {
      if (!itemId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(`${url}/api/review/item/${itemId}`);

        if (response.data.success) {
          const reviewsData = response.data.data.reviews || [];
          setReviews(reviewsData);
          setAverageRating(response.data.data.average_rating || 0);

          const token = getToken();
          const userId = getUserIdFromToken();

          if (token && userId) {
            const userReview = reviewsData.find(review => review.user_id === userId);
            if (userReview) {
              setHasUserReviewed(true);
              setUserReview({
                rating: userReview.rating || 5,
                comment: userReview.comment || ''
              });
            }
          }
        } else {
          setError(response.data.message || "Không thể tải đánh giá");
        }
      } catch (err) {
        console.error('Lỗi khi tải đánh giá:', err);
        setError("Có lỗi khi tải đánh giá. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [url, itemId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserReview(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRatingChange = (newRating) => {
    setUserReview(prev => ({
      ...prev,
      rating: newRating
    }));
  };

  // Gửi đánh giá
  const handleSubmitReview = async (e) => {
    e.preventDefault();

    const token = getToken();
    if (!token) {
      toast.info('Vui lòng đăng nhập để gửi đánh giá');
      return;
    }

    if (!userReview.comment.trim()) {
      toast.error('Vui lòng nhập nội dung đánh giá');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const response = await axios.post(
        `${url}/api/review/submit`,
        {
          item_id: itemId,
          rating: userReview.rating,
          comment: userReview.comment
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        toast.success('Gửi đánh giá thành công!');

        const newReview = response.data.data;

        if (hasUserReviewed) {
          setReviews(prev =>
            prev.map(review =>
              review.user_id === getUserIdFromToken() ? newReview : review
            )
          );
        } else {
          setReviews(prev => [newReview, ...prev]);
          setHasUserReviewed(true);
        }

        // Cập nhật lại điểm trung bình
        if (reviews.length > 0) {
          const totalRating =
            reviews.reduce((sum, review) => sum + review.rating, 0) +
            (hasUserReviewed ? 0 : newReview.rating);
          const newAverage = hasUserReviewed
            ? totalRating / reviews.length
            : totalRating / (reviews.length + 1);
          setAverageRating(newAverage);
        } else {
          setAverageRating(newReview.rating);
        }
      } else {
        toast.error(response.data.message || 'Không thể gửi đánh giá');
      }
    } catch (err) {
      console.error('Lỗi khi gửi đánh giá:', err);
      setError("Không thể gửi đánh giá. Vui lòng thử lại.");
      toast.error(err.response?.data?.message || 'Lỗi khi gửi đánh giá');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (error) {
    return (
      <div className="review-section">
        <h2>Đánh giá của khách hàng</h2>
        <div className="review-error">
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="reload-btn">
            Tải lại đánh giá
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="review-section">
      <h2>Đánh giá của khách hàng</h2>

      <div className="review-summary">
        <div className="average-rating">
          <span className="rating-value">{Number(averageRating).toFixed(1)}</span>
          <StarRating rating={averageRating} size="large" readOnly />
          <span className="review-count">
            ({reviews.length} {reviews.length === 1 ? 'đánh giá' : 'đánh giá'})
          </span>
        </div>
      </div>

      {/* Form thêm/sửa đánh giá */}
      <div className="review-form-container">
        <h3>{hasUserReviewed ? 'Chỉnh sửa đánh giá của bạn' : 'Thêm đánh giá mới'}</h3>

        {!getToken() ? (
          <p className="login-prompt">
            Vui lòng <a href="/login">đăng nhập</a> để gửi đánh giá.
          </p>
        ) : (
          <form className="review-form" onSubmit={handleSubmitReview}>
            <div className="form-group">
              <label>Chọn điểm đánh giá</label>
              <StarRating rating={userReview.rating} onChange={handleRatingChange} />
            </div>

            <div className="form-group">
              <label htmlFor="comment">Nội dung đánh giá</label>
              <textarea
                id="comment"
                name="comment"
                value={userReview.comment}
                onChange={handleInputChange}
                placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..."
                rows="4"
                required
              />
            </div>

            <button
              type="submit"
              className="submit-review-btn"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? 'Đang gửi...'
                : hasUserReviewed
                ? 'Cập nhật đánh giá'
                : 'Gửi đánh giá'}
            </button>
          </form>
        )}
      </div>

      {/* Danh sách đánh giá */}
      <div className="reviews-list">
        <h3>Tất cả đánh giá</h3>

        {loading ? (
          <p className="reviews-loading">Đang tải đánh giá...</p>
        ) : reviews.length === 0 ? (
          <p className="no-reviews">Hãy là người đầu tiên đánh giá sản phẩm này!</p>
        ) : (
          reviews.map((review) => (
            <div className="review-item" key={review.id}>
              <div className="review-header">
                <span className="reviewer-name">
                  {review.user_name || 'Người dùng ẩn danh'}
                </span>
                <span className="review-date">
                  {new Date(review.created_at).toLocaleDateString('vi-VN')}
                </span>
              </div>

              <div className="review-rating">
                <StarRating rating={review.rating} size="small" readOnly />
              </div>

              <div className="review-comment">{review.comment}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReviewSection;
