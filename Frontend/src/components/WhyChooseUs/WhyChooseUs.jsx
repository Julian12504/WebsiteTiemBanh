import './WhyChooseUs.css';

const WhyChooseUs = () => {
  const reasons = [
    {
      icon: '🍰',
      title: 'Chất Lượng Premium',
      description: 'Nguyên liệu tươi, hương vị tuyệt vời, đúng chuẩn vệ sinh'
    },
    {
      icon: '❤️',
      title: 'Làm Với Tâm Huyết',
      description: 'Mỗi chiếc bánh được làm với yêu thương và tỉ mỉ từ các đầu bếp giàu kinh nghiệm'
    },
    {
      icon: '🚚',
      title: 'Giao Hàng Nhanh',
      description: 'Chúng tôi đảm bảo giao hàng trong vòng 24-48 giờ'
    },
    {
      icon: '💝',
      title: 'Dịch Vụ Tuyệt Vời',
      description: 'Hỗ trợ khách hàng 24/7, đảm bảo sự hài lòng của bạn'
    }
  ];

  return (
    <div className="why-choose-us">
      <div className="why-choose-us-header">
        <h2>Tại Sao Chọn Chúng Tôi?</h2>
        <p>Chúng tôi cam kết mang đến cho bạn những sản phẩm và dịch vụ tốt nhất</p>
      </div>
      <div className="why-choose-us-grid">
        {reasons.map((reason, index) => (
          <div key={index} className="reason-card">
            <div className="reason-icon">{reason.icon}</div>
            <h3>{reason.title}</h3>
            <p>{reason.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WhyChooseUs;
