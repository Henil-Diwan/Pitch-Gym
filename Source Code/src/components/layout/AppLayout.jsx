import {Outlet} from "react-router-dom";
import Header from "@/components/header";
import Footer from "../Footer";
import ScrollToTop from '@/components/ScrollToTop.jsx';
const AppLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
   
         <Header/>
          <ScrollToTop />
        <Outlet />
        <Footer />
  
    </div>
  );
};

export default AppLayout;