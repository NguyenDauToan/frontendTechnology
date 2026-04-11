import { Zap, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Nhớ sửa URL nếu khác port
const API_URL = "http://localhost:5000/api/products/flash-sale"; 

const FlashSale = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [endTime, setEndTime] = useState<Date | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFlashSale = async () => {
      try {
        const res = await axios.get(API_URL);
        if (res.data && res.data.length > 0) {
          setProducts(res.data);
          // Lấy giờ kết thúc của sản phẩm đầu tiên làm mốc đếm ngược chung
          setEndTime(new Date(res.data[0].endTime));
        }
      } catch (error) {
        console.error("Lỗi Flash Sale", error);
      }
    };
    fetchFlashSale();
  }, []);

  // Logic đếm ngược
  useEffect(() => {
    if (!endTime) return;
    const timer = setInterval(() => {
      const now = new Date();
      const diff = endTime.getTime() - now.getTime();
      if (diff <= 0) {
        clearInterval(timer); // Hết giờ -> Có thể ẩn component hoặc set về 00:00:00
      } else {
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / 1000 / 60) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        setTimeLeft({ hours, minutes, seconds });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [endTime]);

  const formatPrice = (v: number) => new Intl.NumberFormat('vi-VN').format(v) + '₫';

  if (products.length === 0) return null; // Không có flash sale thì ẩn đi

  return (
    <section className="py-6 bg-background">
      <div className="container mx-auto px-4">
        <div className="bg-gradient-to-r from-red-600 to-orange-500 rounded-xl p-4 sm:p-6 shadow-lg">
          
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Zap className="h-7 w-7 text-yellow-300 fill-yellow-300 animate-pulse" />
              <h2 className="text-2xl font-black italic text-white uppercase">Flash Sale</h2>
            </div>
            
            <div className="flex items-center gap-2 bg-black/20 p-2 rounded-lg">
              <span className="text-xs text-white uppercase font-bold mr-1">Kết thúc trong</span>
              <div className="flex items-center gap-1 font-mono text-lg font-bold text-white">
                <span className="bg-black px-2 py-1 rounded">{String(timeLeft.hours).padStart(2, '0')}</span> :
                <span className="bg-black px-2 py-1 rounded">{String(timeLeft.minutes).padStart(2, '0')}</span> :
                <span className="bg-black px-2 py-1 rounded">{String(timeLeft.seconds).padStart(2, '0')}</span>
              </div>
            </div>
          </div>

          {/* List Products */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {products.map((p) => {
               // Tính % giảm giá dựa trên Giá Niêm Yết vs Giá Flash Sale
               const discount = Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100);
               // Tính % đã bán
               const soldPercent = Math.min(100, Math.round((p.sold / p.target) * 100));

               return (
                <div 
                  key={p._id} 
                  onClick={() => navigate(`/product/${p._id}`)}
                  className="bg-white rounded-lg p-2 cursor-pointer hover:-translate-y-1 transition-transform duration-200 shadow-sm"
                >
                  <div className="relative aspect-square mb-2">
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover rounded-md" />
                    <span className="absolute top-0 right-0 bg-yellow-400 text-red-700 text-xs font-bold px-2 py-1 rounded-bl-lg">
                      -{discount}%
                    </span>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="h-10 flex flex-col justify-end">
                        <p className="text-xs text-gray-400 line-through">{formatPrice(p.originalPrice)}</p>
                        <p className="text-lg font-bold text-red-600 leading-none">{formatPrice(p.price)}</p>
                    </div>
                    
                    <div className="relative w-full h-4 bg-red-100 rounded-full overflow-hidden mt-2">
                      <div 
                        className="absolute top-0 left-0 h-full bg-red-600" 
                        style={{ width: `${soldPercent}%` }}
                      ></div>
                      <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white uppercase drop-shadow">
                        Đã bán {p.sold}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
};

export default FlashSale;