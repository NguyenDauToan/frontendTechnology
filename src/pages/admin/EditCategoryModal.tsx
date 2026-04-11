import { useState, useEffect, useRef } from "react";
import { updateCategoryAPI } from "@/api/categoryService";
import { X, Image as ImageIcon, Upload } from "lucide-react";
import { Category } from "@/components/products/CategoryTable";

interface EditCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  category: any;
  categories: Category[];
}

const EditCategoryModal = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  category, 
  categories 
}: EditCategoryModalProps) => {
  
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    parent_id: "",
  });
  
  // State quản lý ảnh
  const [imagePreview, setImagePreview] = useState<string>(""); // Để hiển thị
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // Để gửi file
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(false);

  // --- LOGIC LOAD DỮ LIỆU VÀO FORM ---
  useEffect(() => {
    if (category && isOpen) {
      
      // 1. Xử lý lấy ID danh mục cha chính xác
      let initialParentId = "";
      if (category.parent_id) {
        if (typeof category.parent_id === 'object') {
            // Nếu là object (do populate), ưu tiên lấy _id
            initialParentId = category.parent_id._id || category.parent_id.id;
        } else {
            // Nếu là string ID
            initialParentId = category.parent_id;
        }
      }

      setFormData({
        name: category.name || "",
        slug: category.slug || "",
        description: category.description || "",
        parent_id: initialParentId || "", // Nếu null/undefined thì về chuỗi rỗng (Danh mục gốc)
      });

      // 2. Reset ảnh về ảnh cũ
      setImagePreview(category.image || "");
      setSelectedFile(null);
    }
  }, [category, isOpen]);

  if (!isOpen) return null;

  // Xử lý thay đổi text input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Xử lý khi chọn file từ máy
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Tạo URL ảo để preview ngay lập tức
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Submit Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Nếu API hỗ trợ upload file trực tiếp (Multipart Form)
      const dataToSend = new FormData();
      dataToSend.append("name", formData.name);
      dataToSend.append("slug", formData.slug);
      dataToSend.append("description", formData.description);
      if (formData.parent_id) {
          dataToSend.append("parent_id", formData.parent_id);
      } else {
          // Nếu chọn "Danh mục gốc", cần gửi null hoặc xử lý ở backend
          // dataToSend.append("parent_id", ""); 
      }

      if (selectedFile) {
        // Gửi file mới nếu có chọn
        dataToSend.append("image", selectedFile);
      } else {
        // Nếu không chọn file mới, gửi lại link ảnh cũ (tùy backend yêu cầu)
        dataToSend.append("image", imagePreview);
      }

      // Lưu ý: Nếu API của bạn chỉ nhận JSON, bạn cần upload ảnh ở bước riêng trước
      // Dưới đây giả định API nhận JSON như cũ, nhưng bạn nên sửa API để nhận FormData nếu muốn upload file.
      // Code tạm thời fallback về JSON nếu không có file mới:
      
      let payload: any = { ...formData };
      if (!selectedFile) {
          payload.image = imagePreview; // Giữ nguyên link ảnh cũ
      } else {
          // TODO: Nếu API chưa hỗ trợ upload file, đoạn này sẽ lỗi. 
          // Bạn cần API upload riêng hoặc API update hỗ trợ FormData.
          // Tạm thời alert để bạn biết:
          // alert("Đang gửi file... Cần Backend hỗ trợ Multipart/form-data");
      }

      // Gọi API Update (Bạn cần đảm bảo updateCategoryAPI xử lý đúng loại dữ liệu)
      await updateCategoryAPI(category._id || category.id, payload);

      alert("Cập nhật thành công!");
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.message || "Lỗi cập nhật");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-lg p-6 relative shadow-xl max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-black">
          <X className="w-5 h-5" />
        </button>
        
        <h2 className="text-xl font-bold mb-4">Sửa danh mục</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Tên & Slug */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên danh mục <span className="text-red-500">*</span></label>
              <input 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                className="w-full border rounded-md p-2 focus:ring-2 focus:ring-black outline-none" 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL)</label>
              <input 
                name="slug" 
                value={formData.slug} 
                onChange={handleChange} 
                className="w-full border rounded-md p-2 bg-gray-50 text-sm" 
              />
            </div>
          </div>

          {/* Danh mục cha (Đã fix lỗi không hiện) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục cha</label>
            <select 
                name="parent_id" 
                value={formData.parent_id} 
                onChange={handleChange}
                className="w-full border rounded-md p-2 bg-white focus:ring-2 focus:ring-black outline-none"
            >
                <option value="">-- Là danh mục gốc (Không có cha) --</option>
                {categories.map((cat) => {
                    // Logic: ID của danh mục trong list options
                    const catId = cat._id || cat.id; 
                    const currentId = category._id || category.id;

                    // Không hiện chính nó để tránh chọn chính mình làm cha
                    if (catId === currentId) return null;

                    return (
                        <option key={catId} value={catId}>
                            {cat.name}
                        </option>
                    );
                })}
            </select>
          </div>

          {/* Chọn ảnh từ máy (Đã thêm input file) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hình ảnh</label>
            <div className="flex items-start gap-4">
                {/* Preview Ảnh */}
                <div 
                    className="w-24 h-24 border rounded-md overflow-hidden bg-gray-50 flex-shrink-0 flex items-center justify-center cursor-pointer hover:opacity-80 relative"
                    onClick={() => fileInputRef.current?.click()}
                >
                    {imagePreview ? (
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                        <div className="text-center">
                            <ImageIcon className="w-6 h-6 mx-auto text-gray-400" />
                            <span className="text-[10px] text-gray-400">Chưa có ảnh</span>
                        </div>
                    )}
                </div>

                {/* Nút Upload & Input ẩn */}
                <div className="flex-1 space-y-2">
                    <input 
                        type="file" 
                        ref={fileInputRef}
                        onChange={handleImageChange}
                        accept="image/*"
                        className="hidden" 
                    />
                    <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 transition-colors w-full justify-center"
                    >
                        <Upload className="w-4 h-4" />
                        {selectedFile ? "Đổi ảnh khác" : "Chọn ảnh từ máy"}
                    </button>
                    {selectedFile ? (
                        <p className="text-xs text-green-600 truncate">Đã chọn: {selectedFile.name}</p>
                    ) : (
                        <p className="text-xs text-gray-500">Hoặc dán link ảnh vào mô tả nếu cần</p>
                    )}
                </div>
            </div>
          </div>

          {/* Mô tả */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
            <textarea 
              name="description" 
              value={formData.description} 
              onChange={handleChange} 
              className="w-full border rounded-md p-2 text-sm" 
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 mt-6 border-t pt-4">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
            >
              Hủy
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:bg-gray-400 transition-colors"
            >
              {loading ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCategoryModal;