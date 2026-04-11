import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
const ads = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1531297461136-82lw8l92c105?w=1200&q=80", // Gaming Setup
    title: "Đại Tiệc Công Nghệ",
    subtitle: "Săn deal hot giảm đến 50%",
    color: "text-white"
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1200&q=80", // Laptop Work
    title: "Laptop Văn Phòng",
    subtitle: "Mỏng nhẹ - Hiệu năng cao",
    color: "text-gray-800"
  }
];
const AdvertisingBanner = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextAd = () => setCurrentIndex((prev) => (prev === ads.length - 1 ? 0 : prev + 1));
  const prevAd = () => setCurrentIndex((prev) => (prev === 0 ? ads.length - 1 : prev - 1));

  // Tự động chuyển slide
  useEffect(() => {
    const timer = setInterval(nextAd, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    // Đảm bảo h-full để bằng chiều cao với Menu bên trái
    <div className="relative w-full h-full group bg-gray-100">
      
      <div 
        className="flex h-full transition-transform duration-500 ease-out" 
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {ads.map((ad) => (
          <div key={ad.id} className="relative w-full h-full shrink-0">
            <img 
              src={ad.image} 
              alt={ad.title} 
              className="w-full h-full object-cover" // object-cover để ảnh ko bị méo
            />
            
            {/* Căn chỉnh lại Text overlay cho sang hơn */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent flex flex-col justify-center p-8 md:p-14">
              <h2 className={`text-2xl md:text-4xl lg:text-5xl font-extrabold mb-3 ${ad.color} tracking-tight`}>
                {ad.title}
              </h2>
              <p className={`text-sm md:text-lg mb-6 ${ad.color} opacity-90 font-medium max-w-md`}>
                {ad.subtitle}
              </p>
              <Button className="w-fit bg-primary text-white hover:bg-primary/90 h-10 px-6 rounded-full font-semibold shadow-lg shadow-primary/20">
                Mua Ngay
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Buttons - Tối ưu hiệu ứng hover */}
      <button 
        onClick={prevAd}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-white/30 hover:bg-white text-white hover:text-gray-900 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all shadow-sm"
      >
        <ChevronLeft size={20} strokeWidth={2.5} />
      </button>
      <button 
        onClick={nextAd}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-white/30 hover:bg-white text-white hover:text-gray-900 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all shadow-sm"
      >
        <ChevronRight size={20} strokeWidth={2.5} />
      </button>

      {/* Dots Indicator - Hiện đại hơn */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/20 px-3 py-1.5 rounded-full backdrop-blur-sm">
        {ads.map((_, idx) => (
          <button 
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              currentIndex === idx ? "w-6 bg-white" : "w-1.5 bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default AdvertisingBanner;