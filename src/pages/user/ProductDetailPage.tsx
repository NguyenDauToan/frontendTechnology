import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Star, Minus, Plus, ShoppingCart,
  Truck, ShieldCheck, RefreshCw, Loader2, Zap, Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { fetchProductById } from "@/api/productService";
import { addToCart } from "@/api/cartApi";
import Header from "@/components/layout/user/Header";
import PromoBanner from "./PromoBanner";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { ImagePlus, X } from "lucide-react";
// Countdown Timer Component - Màu cam
const FlashSaleTimer = ({ endTime }: { endTime: string }) => {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!endTime) return;

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const end = new Date(endTime).getTime();
      const diff = end - now;

      if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0 };

      return {
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / 1000 / 60) % 60),
        seconds: Math.floor((diff / 1000) % 60)
      };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      const timeLeft = calculateTimeLeft();
      setTimeLeft(timeLeft);
      if (timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  const formatTime = (num: number) => String(num).padStart(2, '0');

  return (
    <div className="flex items-center gap-3 bg-[#E85D04]/10 border border-[#E85D04]/20 px-3 py-2 rounded-md w-fit mt-3">
      <span className="font-semibold text-[13px] text-[#E85D04] uppercase tracking-wide flex items-center gap-1">
        <Zap size={14} className="fill-[#E85D04]" /> Kết thúc trong
      </span>
      <div className="flex items-center gap-1.5">
        <div className="bg-[#E85D04] text-white font-bold text-xs w-7 h-7 flex items-center justify-center rounded-sm shadow-sm">
          {formatTime(timeLeft.hours)}
        </div>
        <span className="font-bold text-[#E85D04]">:</span>
        <div className="bg-[#E85D04] text-white font-bold text-xs w-7 h-7 flex items-center justify-center rounded-sm shadow-sm">
          {formatTime(timeLeft.minutes)}
        </div>
        <span className="font-bold text-[#E85D04]">:</span>
        <div className="bg-[#E85D04] text-white font-bold text-xs w-7 h-7 flex items-center justify-center rounded-sm shadow-sm">
          {formatTime(timeLeft.seconds)}
        </div>
      </div>
    </div>
  );
};

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const location = useLocation();
  const [images, setImages] = useState<File[]>([]);
  const [videos, setVideos] = useState<File[]>([]);
  const [hasReviewed, setHasReviewed] = useState(false);
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user || !product?.reviews) return;

    const reviewed = product.reviews.some(
      (r: any) => r.user === user._id // 👈 backend phải có field user
    );

    setHasReviewed(reviewed);
  }, [product]);
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("review") === "true") {
      // scroll xuống form review
      const el = document.getElementById("review-section");
      el?.scrollIntoView({ behavior: "smooth" });
    }
  }, [location]);
  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        if (!id) return;
        const data = await fetchProductById(id);

        const now = new Date();
        const isFlashSaleActive =
          data.flashSale?.isSale &&
          new Date(data.flashSale.startTime) <= now &&
          new Date(data.flashSale.endTime) > now;

        const productData = {
          ...data,
          displayPrice: data.current_price || (isFlashSaleActive ? data.flashSale.salePrice : data.price),
          isSaleActive: isFlashSaleActive
        };

        setProduct(productData);
        if (data.images && data.images.length > 0) {
          setSelectedImage(data.images[0]);
        }
      } catch (error) {
        console.error(error);
        toast.error("Không tìm thấy sản phẩm");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [id, navigate]);
  useEffect(() => {
    const checkCanReview = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "null");
        if (!user || !product?._id) return;

        const res = await axios.get(
          "http://localhost:5000/api/orders/my-products",
          {
            headers: {
              Authorization: `Bearer ${user.token}`
            }
          }
        );

        // 👇 check user có mua sản phẩm này không
        const owned = res.data.some(
          (item: any) => item.product_id === product._id
        );

        setCanReview(owned);

      } catch (err) {
        console.error(err);
      }
    };

    if (product?._id) {
      checkCanReview();
    }
  }, [product]);
  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const handleAddToCart = async (buyNow: boolean = false) => {
    const user = localStorage.getItem("user");
    if (!user) {
      toast.error("Vui lòng đăng nhập để mua hàng");
      navigate("/login");
      return;
    }

    try {
      setIsAdding(true);

      if (buyNow) {
        // ✅ KHÔNG thêm vào cart
        navigate("/checkout", {
          state: {
            buyNowItem: {
              product,
              quantity
            }
          }
        });
        return;
      }

      // ✅ chỉ thêm vào cart khi bấm "THÊM GIỎ"
      await addToCart(product._id, quantity);
      toast.success("Đã thêm sản phẩm vào giỏ hàng");

    } catch (error) {
      toast.error("Lỗi khi thao tác");
    } finally {
      setIsAdding(false);
    }
  };
  const StarSelector = ({ rating, setRating }: any) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <button key={star} onClick={() => setRating(star)}>
            <Star
              className={`w-5 h-5 ${star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                }`}
            />
          </button>
        ))}
      </div>
    );
  };
  const handleSubmitReview = async () => {
    const user = JSON.parse(localStorage.getItem("user") || "null");

    if (!user) {
      toast.error("Vui lòng đăng nhập");
      return;
    }

    try {
      setSubmitting(true);

      const formData = new FormData();
      formData.append("rating", rating.toString());
      formData.append("comment", comment);

      images.forEach(img => formData.append("images", img));
      videos.forEach(vid => formData.append("videos", vid));

      await axios.post(
        `http://localhost:5000/api/products/${product._id}/review`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
            "Content-Type": "multipart/form-data"
          }
        }
      );

      toast.success("Đánh giá thành công");

      const data = await fetchProductById(product._id);
      setProduct(data);

      setComment("");
      setRating(5);
      setImages([]);
      setVideos([]);

    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi");
    } finally {
      setSubmitting(false);
    }
  };
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (!product) return null;

  const discountPercent = product.original_price > product.displayPrice
    ? Math.round(((product.original_price - product.displayPrice) / product.original_price) * 100)
    : 0;

  return (
    <div className="bg-[#f1f5f9] min-h-screen pb-12">
      <Header />
      <PromoBanner />

      {/* Max-w-7xl cho form rộng rãi chuẩn web PC */}
      <div className="container mx-auto px-4 py-6 max-w-7xl animate-fade-in">

        {/* --- KHỐI 1: HÌNH ẢNH VÀ THÔNG TIN CHÍNH --- */}
        <div className="bg-white rounded-md shadow-sm border border-gray-200 p-4 md:p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">

            {/* CỘT TRÁI: HÌNH ẢNH */}
            <div className="md:col-span-5 space-y-4">
              <div className="w-full aspect-square rounded-md border border-gray-200 bg-white relative group flex items-center justify-center p-4">
                <img
                  src={selectedImage || product.image}
                  alt={product.name}
                  className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
                />
                {product.isSaleActive && (
                  <div className="absolute top-3 left-3 bg-[#E85D04] text-white px-2 py-1 rounded-sm text-[11px] font-bold flex items-center gap-1 shadow-sm">
                    <Zap size={14} fill="white" /> FLASH SALE
                  </div>
                )}
              </div>

              {product.images && product.images.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x">
                  {product.images.map((img: string, index: number) => (
                    <div
                      key={index}
                      onMouseEnter={() => setSelectedImage(img)}
                      onClick={() => setSelectedImage(img)}
                      className={`w-16 h-16 shrink-0 rounded-md overflow-hidden border transition-all cursor-pointer snap-start flex items-center justify-center bg-white p-1 ${selectedImage === img ? "border-red-600 ring-1 ring-red-600/20" : "border-gray-200 hover:border-gray-300"
                        }`}
                    >
                      <img src={img} alt={`Thumb ${index}`} className="w-full h-full object-contain" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* CỘT PHẢI: THÔNG TIN (Chuẩn phong cách 365pc) */}
            <div className="md:col-span-7 flex flex-col">

              {/* Tiêu đề & Đánh giá */}
              <div className="border-b border-gray-100 pb-4 mb-4">
                <h1 className="text-2xl font-bold text-gray-900 mb-3 leading-snug">
                  {product.name}
                </h1>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-amber-500 font-semibold">
                    <Star className="w-4 h-4 fill-current" /> <span>4.9</span>
                  </div>
                  <span className="w-[1px] h-3 bg-gray-300"></span>
                  <span className="text-gray-600">Đã bán <strong className="text-gray-900">{product.sold || 0}</strong></span>
                  <span className="w-[1px] h-3 bg-gray-300"></span>
                  <span className="text-gray-600">Tình trạng: <strong className="text-green-600">Còn hàng</strong></span>
                </div>
              </div>

              {/* Khối Giá Tiền - Rõ ràng, đỏ rực rỡ */}
              <div className={`rounded-md p-4 mb-6 ${product.isSaleActive ? 'bg-red-50/50 border border-red-100' : 'bg-gray-50 border border-gray-200'}`}>
                <div className="flex items-end gap-3 flex-wrap">
                  <span className="text-3xl font-bold text-red-600">
                    {formatPrice(product.displayPrice)}
                  </span>

                  {product.original_price > product.displayPrice && (
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base text-gray-400 line-through">
                        {formatPrice(product.original_price)}
                      </span>
                      <span className="px-2 py-0.5 rounded-sm bg-red-600 text-white text-xs font-bold shadow-sm">
                        -{discountPercent}%
                      </span>
                    </div>
                  )}
                </div>
                {product.isSaleActive && <FlashSaleTimer endTime={product.flashSale.endTime} />}
              </div>

              {/* Tóm tắt tính năng (Nếu web bạn có, đây là style phổ biến của web PC) */}
              <ul className="space-y-2 mb-6 text-sm text-gray-600">
                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" /> Cam kết chính hãng 100%</li>
                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" /> Lỗi là đổi mới trong 15 ngày tận nhà</li>
                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" /> Bảo hành siêu tốc</li>
              </ul>

              {/* Số lượng */}
              <div className="mb-6 flex items-center gap-4 border-t border-gray-100 pt-6">
                <span className="text-sm font-semibold text-gray-800 w-20">Số lượng:</span>
                <div className="flex items-center border border-gray-300 rounded-md bg-white h-9 shadow-sm">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-9 h-full flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-l-md transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    readOnly
                    className="w-12 text-center text-sm font-semibold border-x border-gray-300 h-full outline-none bg-transparent"
                  />
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="w-9 h-full flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-r-md transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Nút Mua Hàng */}
              <div className="flex gap-3 mb-6 mt-auto">
                <Button
                  variant="outline"
                  className="flex-1 h-12 text-[15px] font-bold border-red-600 text-red-600 hover:bg-red-50 gap-2 rounded-md"
                  onClick={() => handleAddToCart(false)}
                  disabled={isAdding || product.stock <= 0}
                >
                  <ShoppingCart className="w-5 h-5" /> THÊM GIỎ HÀNG
                </Button>
                <Button
                  className="flex-1 h-12 text-[15px] font-bold bg-red-600 hover:bg-red-700 text-white shadow-sm rounded-md"
                  onClick={() => handleAddToCart(true)}
                  disabled={isAdding || product.stock <= 0}
                >
                  MUA NGAY
                </Button>
              </div>

            </div>
          </div>
        </div>

        {/* --- KHỐI 2: THÔNG SỐ & MÔ TẢ TẦNG DƯỚI --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Mô tả chi tiết (Bên trái, to hơn) */}
          <div className="lg:col-span-2 bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 border-b border-gray-200 px-5 py-3">
              <h2 className="text-base font-bold text-gray-800 uppercase">Mô tả sản phẩm</h2>
            </div>
            <div className="p-5 md:p-6">
              <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
                <p className="whitespace-pre-line">{product.description || "Đang cập nhật mô tả..."}</p>
              </div>
            </div>
          </div>

          {/* Thông số kỹ thuật (Bên phải) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden sticky top-4">
              <div className="bg-gray-50 border-b border-gray-200 px-5 py-3">
                <h2 className="text-base font-bold text-gray-800 uppercase">Thông số kỹ thuật</h2>
              </div>

              <div className="p-0">
                {product.specs && Object.keys(product.specs).length > 0 ? (
                  <div className="flex flex-col text-sm">
                    {Object.entries(product.specs).map(([key, value]: any, index) => (
                      <div key={key} className={`flex px-5 py-3 border-b border-gray-100 last:border-0 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                        <span className="w-2/5 text-gray-500 capitalize">{key.replace('_', ' ')}</span>
                        <span className="w-3/5 text-gray-900 font-medium text-right">  {typeof value === "object" ? value.v : value}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-5 text-sm text-gray-500 text-center">Đang cập nhật thông số...</div>
                )}
              </div>
            </div>
          </div>

        </div>
        {/* --- KHỐI 3: ĐÁNH GIÁ --- */}
        <div id="review-section" className="bg-white rounded-md shadow-sm border border-gray-200 mt-6 p-6">

          {/* HEADER */}
          <h2 className="text-lg font-bold mb-4">Đánh giá sản phẩm</h2>

          {/* TỔNG QUAN */}
          <div className="flex items-center gap-6 mb-6">
            <div className="text-3xl font-bold text-yellow-500 flex items-center gap-1">
              {product.rating?.toFixed(1) || 0}
              <Star className="w-6 h-6 fill-yellow-400" />
            </div>

            <div className="text-sm text-gray-500">
              {product.numReviews || 0} đánh giá
            </div>
          </div>

          {/* FORM REVIEW */}
          {canReview && !hasReviewed && (
            <div className="border rounded-lg p-4 mb-6">
              <p className="font-semibold mb-2">Viết đánh giá</p>

              <StarSelector rating={rating} setRating={setRating} />
              <label className="w-28 h-28 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-red-500 transition">
                <ImagePlus className="w-6 h-6 text-gray-500" />
                <span className="text-xs text-gray-500 mt-1">Thêm ảnh/video</span>

                <input
                  type="file"
                  hidden
                  multiple
                  accept="image/*,video/*"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);

                    const imgFiles = files.filter(f => f.type.startsWith("image"));
                    const vidFiles = files.filter(f => f.type.startsWith("video"));

                    setImages(prev => [...prev, ...imgFiles].slice(0, 5));
                    setVideos(prev => [...prev, ...vidFiles].slice(0, 2));
                  }}
                />
              </label>
              <textarea
                className="w-full mt-3 border rounded-md p-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                rows={3}
                placeholder="Nhập cảm nhận của bạn..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              {/* Upload ảnh */}

              <Button
                className="mt-3"
                onClick={handleSubmitReview}
                disabled={submitting}
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Gửi đánh giá"}
              </Button>
            </div>
          )}
          {!canReview && (
            <div className="text-sm text-gray-500 italic mb-6">
              Bạn cần mua và nhận sản phẩm này để đánh giá
            </div>
          )}

          {/* DANH SÁCH REVIEW */}
          <div className="space-y-4">
            {product.reviews && product.reviews.length > 0 ? (
              product.reviews.map((r: any) => (
                <div key={r._id} className="border-b pb-3">

                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{r.name}</p>
                    <span className="text-xs text-gray-400">
                      {new Date(r.createdAt).toLocaleDateString("vi-VN")}
                    </span>
                  </div>

                  <div className="flex text-yellow-400">
                    {"★".repeat(r.rating)}
                    {"☆".repeat(5 - r.rating)}
                  </div>

                  <p className="text-sm text-gray-700 mt-1">{r.comment}</p>
                  <div className="flex gap-2 mt-3 flex-wrap">

                    {/* IMAGE */}
                    {images.map((img, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(img)}
                          className="w-20 h-20 object-cover rounded border"
                        />

                        {/* Nút X */}
                        <button
                          onClick={() =>
                            setImages(prev => prev.filter((_, i) => i !== index))
                          }
                          className="absolute -top-2 -right-2 bg-black/70 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}

                    {/* VIDEO */}
                    {videos.map((vid, index) => (
                      <div key={index} className="relative">
                        <video
                          src={URL.createObjectURL(vid)}
                          className="w-20 h-20 object-cover rounded border"
                        />

                        {/* Nút X */}
                        <button
                          onClick={() =>
                            setVideos(prev => prev.filter((_, i) => i !== index))
                          }
                          className="absolute -top-2 -right-2 bg-black/70 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}

                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">Chưa có đánh giá nào</p>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default ProductDetailPage;