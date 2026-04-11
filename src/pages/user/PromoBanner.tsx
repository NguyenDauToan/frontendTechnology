import { Sparkles, Truck, Shield, Headphones } from "lucide-react";

const features = [
  { icon: Truck, text: "Giao hàng nhanh" },
  { icon: Shield, text: "Đảm bảo chất lượng" },
  { icon: Headphones, text: "Hỗ trợ 24/7" },
  { icon: Sparkles, text: "Ưu đãi mỗi ngày" },
];

const PromoBanner = () => {
  return (
    <section className="bg-primary text-primary-foreground py-3">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-6 sm:gap-10 flex-wrap">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-2">
              <feature.icon className="h-4 w-4" />
              <span className="text-sm font-medium">{feature.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PromoBanner;
