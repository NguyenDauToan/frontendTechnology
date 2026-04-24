import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import { Loader2, TrendingUp } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// API URL
const API_URL = "http://localhost:5000/api/products/best-sellers";

const BestSellers = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBestSellers = async () => {
      try {
        const res = await axios.get(API_URL);

        let dataToSet = [];
        if (Array.isArray(res.data)) {
          dataToSet = res.data;
        } else if (res.data && Array.isArray(res.data.data)) {
          dataToSet = res.data.data;
        }

        setProducts(dataToSet);
      } catch (err) {
        console.error("Lỗi tải sản phẩm bán chạy:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBestSellers();
  }, []);

  if (isLoading) {
    return (
      <section className="py-6">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="bg-white border border-gray-200 shadow-sm flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-red-600" />
          </div>
        </div>
      </section>
    )
  }

  if (products.length === 0) return null;

  return (
    // Đã trả section về lại bình thường (không có background)
    <section className="py-6">
      <div className="container mx-auto px-4 max-w-7xl">

        {/* --- CHÈN BACKGROUND VÀO ĐÚNG CÁI KHUNG NÀY --- */}
        <div
          className="border border-gray-200 shadow-sm p-4 sm:p-5 bg-cover bg-center rounded-md relative"
          style={{ backgroundImage: "url('https://i.imgur.com/vHqB3qQ.')" }} // Nhớ thay bằng link ảnh bảng xanh của bạn nhé
        >

          {/* Header Section (Mình thêm bg-white/80 để lót dưới chữ cho dễ đọc nếu ảnh nền quá rối) */}
          {/* Header Section */}
          <div className="flex items-center justify-between mb-5 w-full">

            {/* Khối Tiêu đề bên trái */}
            <div className="flex items-center gap-2 bg-white/90 px-4 py-2 rounded-md backdrop-blur-sm border border-white/50 shadow-sm">
              <TrendingUp className="w-5 h-5 text-red-600" />
              <h2 className="text-xl font-bold text-red-600 uppercase tracking-tight">
                Top Bán Chạy
              </h2>
            </div>

            {/* Nút Xem thêm sát lề bên phải */}
            <a
              href="/products"
              className="text-[13px] font-medium text-gray-800 hover:text-red-600 transition-colors flex items-center gap-1 bg-white/90 px-3 py-2 rounded-md backdrop-blur-sm border border-white/50 shadow-sm"
            >
              Xem thêm &raquo;
            </a>

          </div>

          {/* Grid Sản Phẩm */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 relative z-10">
            {products.map((product, index) => {
              const now = new Date();
              const isFlashSale =
                product.flashSale?.isSale &&
                new Date(product.flashSale.startTime) <= now &&
                new Date(product.flashSale.endTime) > now;

              const displayPrice = isFlashSale ? product.flashSale.salePrice : product.price;

              return (
                <div
                  key={product._id}
                  onClick={() => navigate(`/product/${product._id}`)}
                  className="cursor-pointer relative group transition-transform hover:-translate-y-1"
                >
                  {/* Badge Top 1, 2, 3 */}
                  {index < 3 && (
                    <div className="absolute top-[-10px] left-[-15px] z-10 bg-white/90 backdrop-blur-sm p-1 rounded-full shadow-sm border border-gray-100">
                      <img
                        src={`https://cdn-icons-png.flaticon.com/512/541/54141${index === 0 ? '5' : (index === 1 ? '4' : '3')}.png`}
                        alt={`Top ${index + 1}`}
                        className="w-5 h-5 drop-shadow-sm"
                      />
                    </div>
                  )}

                  {/* Bản thân thẻ ProductCard đã có màu nền trắng (bg-white) nên nó sẽ nổi bật hẳn lên trên cái khung ảnh */}
                  <ProductCard
                    _id={product._id}
                    name={product.name}
                    price={displayPrice}
                    originalPrice={product.original_price}
                    image={product.images && product.images.length > 0 ? product.images[0] : (product.image || "")}
                    rating={product.rating || 0}
                    reviews={product.numReviews || 0}
                    sold={product.sold}
                    badge={isFlashSale ? "Flash Sale" : undefined}
                  />
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
};

export default BestSellers;