//import React from 'react'
import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import Home from "./pages/Home/Home";
import Cart from "./pages/Cart/Cart";
import PlaceOrder from "./pages/PlacerOrder/PlaceOrder";
import Footer from "./components/Footer/Footer";
import LoginPopup from "./components/LoginPopup/LoginPopup";
import { useContext } from "react";
import Verify from "./pages/Verify/Verify";
import MyOrders from "./pages/MyOrders/MyOrders";
import ProductDetail from "./components/ProductDetail/ProductDetail"; 
import ViewItems from "./pages/ViewItems/ViewItems";
import StoreContextProvider, { StoreContext } from "./context/StoreContext";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AppContent = () => {
  const { showLoginPopup, setShowLoginPopup } = useContext(StoreContext);

  return (
    <>
      {showLoginPopup && <LoginPopup setShowLogin={setShowLoginPopup} />}
        <div className='app'>
          <Navbar />
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/viewitems' element={<ViewItems />} />
            <Route path="/product/:itemId" element={<ProductDetail/>} />
            <Route path='/cart' element={<Cart />} />
            <Route path='/order' element={<PlaceOrder />} />
            <Route path='/verify' element = {<Verify/>}/>
            <Route path='/myorders' element={<MyOrders/>} />
          </Routes>
        </div>
        <Footer />
    </>
  );
};

const App = () => {
  return (
    <StoreContextProvider>
      <ToastContainer 
        position="top-right" 
        autoClose={3000} 
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <AppContent />
    </StoreContextProvider>
  );
};

export default App;
