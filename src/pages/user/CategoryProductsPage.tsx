import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchFilteredProducts } from "@/api/productService";
import ProductCard from "./ProductCard";
import Header from "@/components/layout/user/Header";
import PromoBanner from "@/pages/user/PromoBanner";
import { Loader2 } from "lucide-react";

const CategoryProductsPage = () => {
  const { slug } = useParams();

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔥 FILTER STATE
  const [filters, setFilters] = useState({
    minPrice: "",
    maxPrice: "",
    cpu: [] as string[],
  });

  // ============================
  // LOAD DATA
  // ============================
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);

        const data = await fetchFilteredProducts({
          categorySlug: slug,
          ...filters,
          cpu: filters.cpu,
        });

        setProducts(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (slug) loadProducts();
  }, [slug, filters]);

  // ============================
  // HANDLE CPU
  // ============================
  const handleCpuChange = (value: string) => {
    setFilters((prev) => {
      const exists = prev.cpu.includes(value);

      return {
        ...prev,
        cpu: exists
          ? prev.cpu.filter((c) => c !== value)
          : [...prev.cpu, value],
      };
    });
  };

  return (
    <>
      <Header />
      <PromoBanner />
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="grid grid-cols-12 gap-5">
          {/* ================= SIDEBAR ================= */}
          <div className="col-span-3 bg-white border p-4 rounded-lg h-fit">
            <h3 className="font-bold mb-4">Bộ lọc</h3>
            {/* PRICE */}
            <div className="mb-5">
              <h4 className="font-semibold mb-2">Khoảng giá</h4>

              <label className="block">
                <input
                  type="radio"
                  name="price"
                  onChange={() =>
                    setFilters({ ...filters, minPrice: "", maxPrice: "5000000", cpu: filters.cpu })
                  }
                /> Dưới 5 triệu
              </label>

              <label className="block">
                <input
                  type="radio"
                  name="price"
                  onChange={() =>
                    setFilters({ ...filters, minPrice: "5000000", maxPrice: "10000000", cpu: filters.cpu })
                  }
                /> 5 - 10 triệu
              </label>

              <label className="block">
                <input
                  type="radio"
                  name="price"
                  onChange={() =>
                    setFilters({ ...filters, minPrice: "10000000", maxPrice: "20000000", cpu: filters.cpu })
                  }
                /> 10 - 20 triệu
              </label>
            </div>

            {/* CPU */}
            <div>
              <h4 className="font-semibold mb-2">Dòng CPU</h4>

              {[
                "Intel Core i3",
                "Intel Core i5",
                "Intel Core i7",
                "AMD Ryzen 5",
                "AMD Ryzen 7",
              ].map((cpu) => (
                <label key={cpu} className="flex items-center gap-2 mb-1">
                  <input
                    type="checkbox"
                    onChange={() => handleCpuChange(cpu)}
                  />
                  {cpu}
                </label>
              ))}
            </div>

          </div>

          {/* ================= PRODUCTS ================= */}
          <div className="col-span-9">

            <div className="mb-5">
              <h2 className="text-xl font-bold text-primary uppercase">
                Danh mục: {slug}
              </h2>
            </div>

            <div className="bg-white border border-gray-200 shadow-sm p-4 sm:p-5">

              {loading ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="animate-spin w-8 h-8 text-primary" />
                </div>
              ) : products.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {products.map((product) => (
                    <ProductCard
                      key={product._id}
                      _id={product._id}
                      name={product.name}
                      price={product.price}
                      originalPrice={product.original_price}
                      image={product.images?.[0]}
                      rating={product.rating || 5}
                      reviews={product.numReviews || 0}
                      sold={product.sold || 0}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-gray-500">
                  Không có sản phẩm
                </div>
              )}

            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default CategoryProductsPage;