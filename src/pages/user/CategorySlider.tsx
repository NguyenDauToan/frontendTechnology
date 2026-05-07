import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchCategories } from "@/api/categoryService";

interface Category {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  parent_id?: {
    _id: string;
    name: string;
  } | null;
}

const CategorySlider = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchCategories();
        setCategories(data);
      } catch (error) {
        console.error("Lỗi load category", error);
      }
    };
    fetchData();
  }, []);

  const parentCategories = categories.filter((cat) => !cat.parent_id);
  const getChildren = (parentId: string) => {
    return categories.filter(cat => cat.parent_id?._id === parentId);
  };
  return (
    <div className="w-full mb-4">
      {/* Container nằm ngang, hỗ trợ scroll nếu quá nhiều category */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-2">

        {parentCategories.map((cat) => {
          const children = getChildren(cat._id);

          return (
            <button
              key={cat._id}
              onClick={() => {
                if (children.length > 0) {
                  // 🔥 Nếu là danh mục cha → nhảy vào thằng con đầu tiên
                  navigate(`/category/${children[0].slug}`);
                } else {
                  navigate(`/category/${cat.slug}`);
                }
              }}
              className="px-4 py-1.5 bg-[#f3f4f6] hover:bg-gray-200 text-gray-700 text-[14px] 
                 font-medium rounded-lg whitespace-nowrap transition-colors duration-200 
                 border border-transparent hover:border-gray-300"
            >
              {cat.name}
            </button>
          );
        })}

        {/* Nút Xem tất cả (Nếu cần giống ảnh mẫu) */}
        <button
          onClick={() => navigate("/products")}
          className="px-4 py-1.5 bg-[#f3f4f6] hover:bg-gray-200 text-gray-700 text-[14px] 
                     font-medium rounded-lg whitespace-nowrap border border-transparent"
        >
          Xem tất cả
        </button>
      </div>
    </div>
  );
};

export default CategorySlider;