import CategorySlider from "./CategorySlider";
import FlashSale from "./FlashSale";
import FeaturedProducts from "./FeaturedProducts";
import BestSellers from "./BestSellers";
import PromoBanner from "./PromoBanner";
const HomePage = () => {
  return (
    <div className="bg-gray-50 min-h-screen pb-12">


      {/* SẢN PHẨM */}
      <div className="flex flex-col gap-2 mt-3">
        <FlashSale />
        <BestSellers />
        <div className="bg" style={{ marginTop: -60 }}>
          <FeaturedProducts /></div>
      </div>

    </div>
  );
};

export default HomePage;