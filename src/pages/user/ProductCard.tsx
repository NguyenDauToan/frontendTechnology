import { Heart, ShoppingCart, Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { addToCart } from "@/api/cartApi"; 
import { useNavigate } from "react-router-dom";

interface ProductCardProps {
  _id: string;
  name: string;
  price: number;        // Giá bán thực tế
  originalPrice?: number; // Giá gốc/Niêm yết (Có thể null/undefined)
  rating: number;
  reviews: number;
  image?: string;
  badge?: string;
  sold?: number;
}

const ProductCard = ({ _id, name, price, originalPrice, rating, reviews, image, badge, sold }: ProductCardProps) => {
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  
  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('vi-VN').format(value) + '₫';
  };

  // 1. Logic kiểm tra có giảm giá hay không
  // Chỉ coi là giảm giá khi có originalPrice VÀ originalPrice lớn hơn giá bán
  const hasDiscount = originalPrice && originalPrice > price;
  
  // Tính % giảm giá (Chỉ tính khi hasDiscount = true)
  const discount = hasDiscount && originalPrice 
    ? Math.round(((originalPrice - price) / originalPrice) * 100) 
    : 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation(); 
    
    const user = localStorage.getItem("user");
    if (!user) {
      toast.error("Vui lòng đăng nhập để mua hàng");
      navigate("/login");
      return;
    }

    try { 
      setIsAdding(true);
      await addToCart(_id, 1);
      window.dispatchEvent(new Event("cart-updated"));
      toast.success("Đã thêm vào giỏ hàng thành công!");
    } catch (error: any) {
      toast.error("Lỗi khi thêm vào giỏ hàng");
      console.error(error);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="group card-hover bg-card overflow-hidden border border-border/50 h-full flex flex-col">
      {/* Image Area */}
      <div className="relative aspect-square bg-secondary/30 overflow-hidden">
        {image ? (
          <img 
            src={image} 
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
              <span className="text-xl font-bold text-primary/40">HG</span>
            </div>
          </div>
        )}
        
        {/* Badges Area */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {/* Chỉ hiện nhãn giảm giá nếu có giảm giá thực sự */}
          {hasDiscount && discount > 0 && (
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-destructive text-destructive-foreground shadow-sm">
              -{discount}%
            </span>
          )}
          {badge && (
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-accent text-accent-foreground shadow-sm">
              {badge}
            </span>
          )}
        </div>
        
        <Button 
          size="icon" 
          variant="ghost" 
          className={`absolute top-2 right-2 h-8 w-8 rounded-full bg-card/90 hover:bg-card shadow-sm ${liked ? 'text-destructive' : ''}`}
          onClick={(e) => { e.stopPropagation(); setLiked(!liked); }}
        >
          <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
        </Button>
        
        <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
          <Button 
            className="w-full h-9 gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg" 
            size="sm"
            onClick={handleAddToCart}
            disabled={isAdding}
          >
            {isAdding ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ShoppingCart className="h-4 w-4" />
            )}
            <span className="text-sm">{isAdding ? "Đang thêm..." : "Thêm vào giỏ"}</span>
          </Button>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-3 space-y-2 flex flex-col flex-1">
        <h3 
          className="font-medium text-foreground line-clamp-2 text-sm leading-snug group-hover:text-primary transition-colors cursor-pointer min-h-[2.5em]"
          onClick={() => navigate(`/product/${_id}`)}
        >
          {name}
        </h3>
        
        {/* Price Section - Phần hiển thị giá đã sửa logic */}
        <div className="flex items-center gap-2 mt-auto">
          {/* Giá bán hiện tại (Luôn hiển thị) */}
          <span className="text-base font-bold text-primary">{formatPrice(price)}</span>
          
          {/* Giá gốc (Chỉ hiển thị khi có giảm giá) */}
          {hasDiscount && originalPrice && (
            <span className="text-xs text-muted-foreground line-through">
              {formatPrice(originalPrice)}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span>{rating}</span>
            {/* Ẩn bớt số đánh giá trên mobile nếu quá chật */}
            {reviews > 0 && (
                <>
                    <span className="text-border">|</span>
                    <span className="hidden min-[350px]:inline">{reviews} đánh giá</span>
                </>
            )}
          </div>
          {sold && sold > 0 && <span>Đã bán {sold}</span>}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;