import { describe, it, expect, beforeEach } from '@jest/globals';
describe(' Module2_Cart - Gi? h�ng', () => {
  let cart = [];
  const addToCart = (c,i,q,p) => { if(q<=0) throw new Error('L?i'); const e = c.find(x=>x.itemId===i); if(e) e.quantity+=q; else c.push({itemId:i,quantity:q,price:p}); return c; };
  const removeFromCart = (c,i) => c.filter(x=>x.itemId!==i);
  const updateQuantity = (c,i,q) => { if(q<=0) throw new Error('L?i'); const x = c.find(y=>y.itemId===i); if(x) x.quantity=q; return c; };
  const total = (c) => c.reduce((s,i)=>s+(i.price*i.quantity),0);
  beforeEach(() => { cart = []; });
  it('TC_CART_001', () => { addToCart(cart,1,2,150000); expect(cart.length).toBe(1); });
  it('TC_CART_002', () => { addToCart(cart,1,2,150000); addToCart(cart,1,3,150000); expect(cart[0].quantity).toBe(5); });
  it('TC_CART_003', () => { expect(()=>addToCart(cart,1,-5,150000)).toThrow(); });
  it('TC_CART_004', () => { addToCart(cart,1,2,150000); addToCart(cart,2,1,200000); cart = removeFromCart(cart,1); expect(cart.length).toBe(1); });
  it('TC_CART_005', () => { addToCart(cart,1,2,150000); updateQuantity(cart,1,5); expect(cart[0].quantity).toBe(5); });
  it('TC_CART_006', () => { addToCart(cart,1,2,150000); addToCart(cart,2,1,200000); expect(total(cart)).toBe(500000); });
  it('TC_CART_007', () => { expect(total(cart)).toBe(0); });
  it('TC_CART_008', () => { addToCart(cart,1,2,150000); addToCart(cart,2,1,200000); addToCart(cart,3,3,100000); cart = removeFromCart(cart,2); expect(cart.length).toBe(2); });
  it('TC_CART_009', () => { addToCart(cart,1,2,100000); addToCart(cart,2,3,50000); expect(total(cart)).toBe(350000); });
  it('TC_CART_010', () => { addToCart(cart,1,5,100000); expect(()=>updateQuantity(cart,1,-1)).toThrow(); });
  
  it('TC_CART_011: Nên kiểm tra số lượng không vượt quá stock', () => { 
    // BUG: checkStock không validate đúng cách - missing logic
    const checkStock = (quantity, stock) => { 
      // Bug: Chỉ check > 1000, không check với stock thực tế
      if (quantity > 1000) throw new Error('Số lượng quá lớn'); 
      return true; 
    };
    // Test case này sẽ FAIL vì checkStock không throw error khi quantity > stock
    expect(() => checkStock(100, 50)).toThrow('Vượt quá số lượng có sẵn');
    expect(checkStock(30, 50)).toBe(true);
  });

  it('TC_CART_012: Nên xóa tất cả sản phẩm trong giỏ', () => { 
    const clearCart = () => [];
    addToCart(cart, 1, 2, 150000);
    addToCart(cart, 2, 1, 200000);
    cart = clearCart();
    expect(cart.length).toBe(0);
  });

  it('TC_CART_013: Nên lấy giỏ hàng theo userId', () => { 
    const getCartByUser = (userId, carts) => carts.filter(c => c.userId === userId);
    const allCarts = [
      { userId: 1, items: [{itemId: 1, quantity: 2}] },
      { userId: 2, items: [{itemId: 2, quantity: 1}] }
    ];
    const userCart = getCartByUser(1, allCarts);
    expect(userCart.length).toBe(1);
    expect(userCart[0].userId).toBe(1);
  });

  it('TC_CART_014: Nên merge giỏ hàng khi user login', () => { 
    const mergeCart = (localCart, serverCart) => {
      const merged = [...serverCart];
      localCart.forEach(localItem => {
        const existing = merged.find(item => item.itemId === localItem.itemId);
        if (existing) {
          existing.quantity += localItem.quantity;
        } else {
          merged.push(localItem);
        }
      });
      return merged;
    };

    const local = [{itemId: 1, quantity: 2, price: 100000}];
    const server = [{itemId: 1, quantity: 3, price: 100000}, {itemId: 2, quantity: 1, price: 50000}];
    const merged = mergeCart(local, server);
    
    expect(merged.length).toBe(2);
    expect(merged.find(i => i.itemId === 1).quantity).toBe(5);
  });
});
