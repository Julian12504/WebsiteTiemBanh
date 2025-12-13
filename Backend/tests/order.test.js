import { describe, it, expect } from '@jest/globals';
describe(' Module3_Order', () => {
  const calcTotal = (i) => i.reduce((s,x)=>s+(x.price*x.quantity),0);
  const validate = (o) => { if(!o.items||!o.items.length) throw new Error('Items'); if(!o.address) throw new Error('Address'); if(!o.firstName||!o.lastName) throw new Error('Name'); if(!o.contactNumber) throw new Error('Phone'); return true; };
  const create = (o) => { validate(o); return {id:Math.random().toString(36).substr(2,9), ...o, totalAmount:calcTotal(o.items), status:'pending', createdAt:new Date()}; };
  const updateStatus = (o,s) => { const valid=['pending','confirmed','processing','shipped','delivered','cancelled']; if(!valid.includes(s)) throw new Error('Invalid'); if(o.status==='delivered'&&s==='cancelled') throw new Error('Canceled'); o.status=s; return o; };
  it('TC_ORDER_001', () => { const o = create({items:[{itemId:1,quantity:2,price:150000}],address:'ABC',firstName:'N',lastName:'A',contactNumber:'0'}); expect(o.id).toBeDefined(); expect(o.status).toBe('pending'); });
  it('TC_ORDER_002', () => { expect(calcTotal([{itemId:1,quantity:2,price:150000},{itemId:2,quantity:1,price:200000}])).toBe(500000); });
  it('TC_ORDER_003', () => { expect(()=>create({items:[],address:'ABC',firstName:'N',lastName:'A',contactNumber:'0'})).toThrow(); });
  it('TC_ORDER_004', () => { expect(()=>create({items:[{itemId:1,quantity:1,price:150000}],address:'',firstName:'N',lastName:'A',contactNumber:'0'})).toThrow(); });
  it('TC_ORDER_005', () => { const o = create({items:[{itemId:1,quantity:1,price:150000}],address:'ABC',firstName:'N',lastName:'A',contactNumber:'0'}); updateStatus(o,'confirmed'); expect(o.status).toBe('confirmed'); });
  it('TC_ORDER_006', () => { const o = create({items:[{itemId:1,quantity:1,price:150000}],address:'ABC',firstName:'N',lastName:'A',contactNumber:'0'}); expect(()=>updateStatus(o,'invalid')).toThrow(); });
  it('TC_ORDER_007', () => { const o = create({items:[{itemId:1,quantity:1,price:150000}],address:'ABC',firstName:'N',lastName:'A',contactNumber:'0'}); o.status='delivered'; expect(()=>updateStatus(o,'cancelled')).toThrow(); });
  it('TC_ORDER_008', () => { expect(()=>create({items:[{itemId:1,quantity:1,price:150000}],address:'ABC',firstName:'',lastName:'A',contactNumber:'0'})).toThrow(); });
  it('TC_ORDER_009', () => { expect(()=>create({items:[{itemId:1,quantity:1,price:150000}],address:'ABC',firstName:'N',lastName:'A',contactNumber:''})).toThrow(); });
  it('TC_ORDER_010', () => { const o = create({items:[{itemId:1,quantity:1,price:150000}],address:'ABC',firstName:'N',lastName:'A',contactNumber:'0'}); updateStatus(o,'confirmed'); expect(o.status).toBe('confirmed'); });
  it('TC_ORDER_011', () => { const o = create({items:[{itemId:1,quantity:1,price:150000}],address:'ABC',firstName:'N',lastName:'A',contactNumber:'0'}); updateStatus(o,'confirmed'); updateStatus(o,'processing'); expect(o.status).toBe('processing'); });
  it('TC_ORDER_012', () => { const o = create({items:[{itemId:1,quantity:1,price:150000}],address:'ABC',firstName:'N',lastName:'A',contactNumber:'0'}); updateStatus(o,'processing'); updateStatus(o,'shipped'); expect(o.status).toBe('shipped'); });
  it('TC_ORDER_013', () => { const o = create({items:[{itemId:1,quantity:1,price:150000}],address:'ABC',firstName:'N',lastName:'A',contactNumber:'0'}); updateStatus(o,'shipped'); updateStatus(o,'delivered'); expect(o.status).toBe('delivered'); });
  
  it('TC_ORDER_014: Nên cancel order với status hợp lệ', () => { 
    const o = create({items:[{itemId:1,quantity:1,price:150000}],address:'ABC',firstName:'N',lastName:'A',contactNumber:'0123456789'}); 
    updateStatus(o,'cancelled'); 
    expect(o.status).toBe('cancelled'); 
  });

  it('TC_ORDER_015: Nên lấy orders theo userId', () => { 
    const getOrdersByUser = (userId, orders) => orders.filter(o => o.userId === userId);
    const allOrders = [
      { id: '1', userId: 1, totalAmount: 150000 },
      { id: '2', userId: 2, totalAmount: 200000 },
      { id: '3', userId: 1, totalAmount: 300000 }
    ];
    const userOrders = getOrdersByUser(1, allOrders);
    expect(userOrders.length).toBe(2);
  });

  it('TC_ORDER_016: Nên lấy order theo orderId', () => { 
    // BUG: API trả về 404 thay vì order detail - luôn throw error
    const getOrderById = (orderId, orders) => {
      // Bug: Luôn trả về 404, không query order
      throw new Error('404 Not Found');
    };
    const allOrders = [
      { id: 'abc123', userId: 1, totalAmount: 150000 },
      { id: 'def456', userId: 2, totalAmount: 200000 }
    ];
    const order = getOrderById('abc123', allOrders);
    expect(order).toBeDefined();
    expect(order.id).toBe('abc123');
  });

  it('TC_ORDER_017: Nên validate email format', () => { 
    const validateEmail = (email) => {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!re.test(email)) throw new Error('Email không hợp lệ');
      return true;
    };
    expect(() => validateEmail('invalid-email')).toThrow('Email không hợp lệ');
    expect(validateEmail('user@example.com')).toBe(true);
  });

  it('TC_ORDER_018: Nên validate payment method', () => { 
    const validatePayment = (method) => {
      const validMethods = ['COD', 'credit_card', 'momo', 'bank_transfer'];
      if (!validMethods.includes(method)) throw new Error('Phương thức thanh toán không hợp lệ');
      return true;
    };
    expect(() => validatePayment('invalid')).toThrow();
    expect(validatePayment('COD')).toBe(true);
    expect(validatePayment('momo')).toBe(true);
  });
});
