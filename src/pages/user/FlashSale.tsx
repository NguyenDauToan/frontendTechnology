import { Zap } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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
        if (res.data?.length > 0) {
          setProducts(res.data);
          setEndTime(new Date(res.data[0].endTime));
        }
      } catch (error) {
        console.error("Lỗi Flash Sale", error);
      }
    };
    fetchFlashSale();
  }, []);

  useEffect(() => {
    if (!endTime) return;

    const timer = setInterval(() => {
      const diff = endTime.getTime() - new Date().getTime();
      if (diff <= 0) return clearInterval(timer);

      setTimeLeft({
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / 1000 / 60) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  const formatPrice = (v: number) =>
    new Intl.NumberFormat("vi-VN").format(v) + "₫";

  if (products.length === 0) return null;

  return (
    <section className="py-6">
      <div className="container mx-auto px-4 max-w-7xl">

        {/* 🔥 BOX thu nhỏ */}
        <div className="bg-gradient-to-r from-red-600 to-orange-500 rounded-lg p-3 sm:p-4 shadow">

          {/* Header nhỏ lại */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-300 fill-yellow-300 animate-pulse" />
              <h2 className="text-lg font-bold text-white uppercase">
                Flash Sale
              </h2>
            </div>

            {/* Countdown nhỏ */}
            <div className="flex items-center gap-1 bg-black/20 px-2 py-1 rounded text-xs text-white font-mono">
              <span>{String(timeLeft.hours).padStart(2, "0")}</span> :
              <span>{String(timeLeft.minutes).padStart(2, "0")}</span> :
              <span>{String(timeLeft.seconds).padStart(2, "0")}</span>
            </div>
          </div>

          {/* Grid gọn lại */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {products.map((p) => {
              const discount = Math.round(
                ((p.originalPrice - p.price) / p.originalPrice) * 100
              );

              const soldPercent = Math.min(
                100,
                Math.round((p.sold / p.target) * 100)
              );

              return (
                <div
                  key={p._id}
                  onClick={() => navigate(`/product/${p._id}`)}
                  className="bg-white rounded-md p-2 cursor-pointer hover:-translate-y-1 transition shadow-sm"
                >
                  <div className="relative aspect-square mb-1">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-full h-full object-cover rounded"
                    />

                    <span className="absolute top-0 right-0 bg-yellow-400 text-red-700 text-[10px] font-bold px-1.5 py-0.5 rounded-bl">
                      -{discount}%
                    </span>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[10px] text-gray-400 line-through">
                      {formatPrice(p.originalPrice)}
                    </p>

                    <p className="text-sm font-bold text-red-600 leading-none">
                      {formatPrice(p.price)}
                    </p>

                    {/* progress nhỏ */}
                    <div className="relative w-full h-2 bg-red-100 rounded-full overflow-hidden mt-1">
                      <div
                        className="h-full bg-red-600"
                        style={{ width: `${soldPercent}%` }}
                      ></div>
                    </div>

                    <p className="text-[10px] text-center text-red-500 font-medium">
                      Đã bán {p.sold}
                    </p>
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