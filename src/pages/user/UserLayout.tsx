import { Outlet } from "react-router-dom";
import Header from "@/components/layout/user/Header";
import Footer from "@/components/layout/user/Footer";
import CartDrawer from "./CartDrawer";
import { useState } from "react";

const UserLayout = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header nằm cố định ở Layout */}
      <Header />
      
      {/* Outlet là nơi nội dung thay đổi (HomePage, ProductDetail...) sẽ hiển thị */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer nằm cố định ở Layout */}
      <Footer />
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />
    </div>
    
  );
};

export default UserLayout;