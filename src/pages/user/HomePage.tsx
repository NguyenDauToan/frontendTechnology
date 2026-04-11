import PromoBanner from "./PromoBanner";
import CategorySlider from "./CategorySlider";
import RightSidebar from "./RightSidebar"; 
import FlashSale from "./FlashSale";
import FeaturedProducts from "./FeaturedProducts";
import BestSellers from "./BestSellers";
import AdvertisingBanner from "./AdvertisingBanner";

const HomePage = () => {
  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      <PromoBanner />

      {/* --- 1. HERO SECTION (Banner & Menu) --- */}
      <div className="container mx-auto px-4 pt-6 pb-2 max-w-7xl"style={{marginBottom: "-15px"}}>
        
        {/* Dùng Flexbox với chiều cao cố định trên Desktop (lg) */}
        {/* Thêm w-full để đảm bảo flex container không bị tràn */}
        <div className="flex flex-col md:flex-row gap-4 lg:h-[380px] w-full">

          {/* CỘT TRÁI: Danh mục - Cố định 240px */}
          <div className="hidden xl:block w-[240px] flex-shrink-0 h-full">
            <CategorySlider />
          </div>

          {/* CỘT GIỮA: Banner chính */}
          {/* min-w-0 CỰC KỲ QUAN TRỌNG: Ngăn chặn slider bên trong bẻ gãy layout flex */}
          {/* flex-1 giúp nó tự động lấy phần không gian còn lại */}
          <div className="flex-1 min-w-0 w-full h-[180px] md:h-[280px] lg:h-full rounded-md overflow-hidden shadow-sm">
            <AdvertisingBanner/>
          </div>

          {/* CỘT PHẢI: Khách hàng & Quyền lợi - Cố định 240px */}
          <div className="hidden xl:block w-[240px] flex-shrink-0 h-full">
            <RightSidebar />
          </div>

        </div>
      </div>

      {/* --- 2. CÁC SECTION SẢN PHẨM BÊN DƯỚI --- */}
      <div className="flex flex-col mt-4">
        <FlashSale />
        <div className="mb-[-15px]" style={{marginBottom: "-15px"}}>

        <BestSellers />
        </div>

          <FeaturedProducts />
      </div>
    </div>
  );
};
export default HomePage;