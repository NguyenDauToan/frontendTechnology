  import { ChevronRight, Menu } from "lucide-react";
  import { useState, useEffect } from "react";
  import { cn } from "@/lib/utils";
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
    const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

    // =============================
    // FETCH DATA
    // =============================
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

    // =============================
    // BUILD TREE (CHA - CON)
    // =============================
    const parentCategories = categories.filter(cat => !cat.parent_id);

    const getChildren = (parentId: string) => {
      return categories.filter(cat => cat.parent_id?._id === parentId);
    };

    return (
      <div className="bg-white rounded-md shadow-sm border border-gray-100 h-full relative flex flex-col z-40">

        {/* HEADER */}
        <div className="px-4 py-3 border-b flex items-center gap-2 bg-gray-50/50">
          <Menu className="w-4 h-4" />
          <h3 className="font-bold text-sm uppercase">Danh mục</h3>
        </div>

        {/* LIST */}
        <div className="flex-1 py-1 relative">
          {parentCategories.map((parent) => {
            const children = getChildren(parent._id);

            return (
              <div
                key={parent._id}
                onMouseEnter={() => setHoveredCategory(parent._id)}
                onMouseLeave={() => setHoveredCategory(null)}
                className="group"
              >
                {/* PARENT */}
                <div
                  className={cn(
                    "px-4 py-2.5 flex justify-between cursor-pointer",
                    hoveredCategory === parent._id
                      ? "bg-red-50 text-primary font-semibold"
                      : "hover:bg-gray-50"
                  )}
                >
                  <span>{parent.name}</span>
                  <ChevronRight className="w-4 h-4" />
                </div>

                {/* CHILD */}
                {hoveredCategory === parent._id && children.length > 0 && (
                  <div className="absolute left-full top-0 w-[600px] h-full bg-white shadow-lg border p-6 z-50">

                    <h4 className="font-bold mb-4">{parent.name}</h4>

                    <div className="grid grid-cols-4 gap-4">
                      {children.map((child) => (
                        <div
                          key={child._id}
                          onClick={() => navigate(`/category/${child.slug}`)}
                          className="cursor-pointer text-center"
                        >
                          <img
                            src={child.image || "https://placehold.co/100"}
                            className="w-14 h-14 mx-auto rounded-full object-cover"
                          />
                          <p className="text-sm mt-2">{child.name}</p>
                        </div>
                      ))}
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* FOOTER */}
        <div className="p-3 border-t text-center">
          <button
            onClick={() => navigate("/categories")}
            className="text-sm text-primary"
          >
            Xem tất cả
          </button>
        </div>
      </div>
    );
  };

  export default CategorySlider;