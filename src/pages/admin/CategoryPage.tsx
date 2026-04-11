import { useEffect, useState } from "react";
import CategoryTable, { Category } from "@/components/products/CategoryTable";
import AddCategoryModal from "./AddCategoryModal";
import EditCategoryModal from "./EditCategoryModal"; // Import the new modal
import { fetchCategories, deleteCategoryAPI } from "@/api/categoryService";
import { Plus } from "lucide-react";

const CategoryPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State for Add Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // State for Edit Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  // Load data function
  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchCategories();
      setCategories(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // --- DELETE FUNCTION ---
  const handleDelete = async (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa danh mục này? Hành động này không thể hoàn tác.")) {
      try {
        await deleteCategoryAPI(id);
        alert("Đã xóa thành công!");
        // Refresh the list locally to avoid a full reload, or call loadData()
        setCategories(prev => prev.filter(cat => cat._id !== id && cat.id !== id)); 
      } catch (error: any) {
        alert(error.response?.data?.message || "Xóa thất bại (Có thể do danh mục này đang chứa sản phẩm)");
      }
    }
  };

  // --- EDIT FUNCTION ---
  const handleEdit = (category: Category) => {
    // 1. Set the category to be edited
    setSelectedCategory(category);
    // 2. Open the edit modal
    setIsEditModalOpen(true);
  };

  // Helper to close edit modal and clear selection
  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedCategory(null);
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Danh mục sản phẩm</h1>
          <p className="text-gray-500">Quản lý phân loại hàng hóa</p>
        </div>
        
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm danh mục</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10">Đang tải dữ liệu...</div>
      ) : (
        <CategoryTable 
          categories={categories} 
          onDelete={handleDelete} 
          onEdit={handleEdit} // Pass the function down
        />
      )}

      {/* Add Modal */}
      <AddCategoryModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={loadData}
      />

      {/* Edit Modal */}
      <EditCategoryModal 
        isOpen={isEditModalOpen} 
        onClose={closeEditModal}
        onSuccess={loadData}
        category={selectedCategory}
        categories={categories}
      />
    </div>
  );
};

export default CategoryPage;