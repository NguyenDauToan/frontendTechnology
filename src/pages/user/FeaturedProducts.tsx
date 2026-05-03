import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import { fetchProducts } from "@/api/productService";
import { Loader2, AlertCircle, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const FeaturedProducts = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsLoading(true);
        const data = await fetchProducts();

        let dataToSet = [];
        if (Array.isArray(data)) {
          dataToSet = data;
        } else if (data && Array.isArray(data.data)) {
          dataToSet = data.data;
        } else if (data && Array.isArray(data.products)) {
          dataToSet = data.products;
        }

        setProducts(dataToSet);
      } catch (err) {
        console.error("Lỗi khi tải sản phẩm:", err);
        setError("Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.");
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, []);

  if (isLoading) {
    return (
      <section className="py-6">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Box Loading */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-6">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center items-center py-16 text-destructive gap-3">
            <AlertCircle className="w-8 h-8" />
            <p className="font-medium">{error}</p>
            <Button variant="outline" onClick={() => window.location.reload()} className="mt-2">
              Tải lại trang
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-6">
      <div className="container mx-auto px-4 max-w-7xl">

        {/* --- KHUNG BAO BỌC (BOX) GIỐNG TRONG ẢNH --- */}
        <div className="bg-white border border-gray-200 shadow-sm p-4 sm:p-5">

          {/* Header Section */}
          <div className="flex items-center justify-between mb-5 border-b border-gray-100 pb-3">
            <h2 className="text-xl font-bold text-primary uppercase tracking-tight">
              Gợi ý hôm nay
            </h2>
            <a
              href="/products"
              className="text-[13px] font-medium text-gray-600 hover:text-primary transition-colors flex items-center gap-1"
            >
              Xem thêm &raquo;
            </a>
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              {products.map((product) => {
                const now = new Date();
                const isFlashSale =
                  product.flashSale?.isSale &&
                  new Date(product.flashSale.startTime) <= now &&
                  new Date(product.flashSale.endTime) > now;

                const displayPrice = isFlashSale ? product.flashSale.salePrice : product.price;
                const displayOriginalPrice = product.original_price;

                return (
                  <div
                    key={product._id}
                    onClick={() => navigate(`/product/${product._id}`)}
                    className="
                    cursor-pointer relative group rounded-lg 
                    transition-transform hover:-translate-y-1
                    hover:z-50
                  "                  >
                    {isFlashSale && (
                      <div className="absolute top-2 left-2 z-10 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-sm shadow-sm flex items-center gap-1 animate-pulse">
                        <Zap size={10} fill="white" /> FLASH SALE
                      </div>
                    )}

                    <ProductCard
                      _id={product._id}
                      name={product.name}
                      price={displayPrice}
                      originalPrice={displayOriginalPrice}
                      image={product.images && product.images.length > 0 ? product.images[0] : ""}
                      rating={product.rating || 0}
                      reviews={product.numReviews || 0}
                      sold={product.sold || 0}
                      badge={isFlashSale ? undefined : (product.stock < 10 ? "Sắp hết" : undefined)}
                    />
                    {/* 🔥 HOVER SPECS */}
                    {product.specs?.length > 0 && (
                      <div
                        className="
      absolute top-1/2 left-full ml-3 -translate-y-1/2
      w-[320px]
      bg-white border border-green-500 shadow-xl
      rounded-xl
      
      opacity-0 invisible
      group-hover:opacity-100 group-hover:visible
      
      transition duration-200
      z-50
    "
                        onClick={(e) => e.stopPropagation()}
                      >

                        {/* Header */}
                        <div className="bg-green-500 text-white text-sm font-semibold px-4 py-2 rounded-t-xl">
                          Thông số sản phẩm
                        </div>

                        {/* Table */}
                        <div className="p-3">
                          <div className="border border-gray-200 rounded-md overflow-hidden text-xs">
                            {product.specs.map((spec: any, i: number) => (
                              <div
                                key={i}
                                className={`grid grid-cols-2 ${i % 2 === 0 ? "bg-gray-50" : "bg-white"
                                  }`}
                              >
                                <div className="px-2 py-2 text-gray-600 border-r border-gray-200">
                                  {spec.k.replace(/_/g, " ")}
                                </div>
                                <div className="px-2 py-2 text-gray-800">
                                  {spec.v}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Mũi tên bên trái */}
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 bg-white border-l border-t border-green-500 rotate-45"></div>

                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground border border-dashed border-gray-200 rounded-lg">
              Chưa có sản phẩm nào.
            </div>
          )}

        </div> {/* Kết thúc khối Box */}

      </div>
    </section>
  );
};

export default FeaturedProducts;