import { useState, useEffect } from "react";
import { X, Upload } from "lucide-react";
import { createCategoryAPI, fetchCategories } from "@/api/categoryService";
import { uploadImageAPI } from "@/api/productService";

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddCategoryModal = ({ isOpen, onClose, onSuccess }: AddCategoryModalProps) => {
  const [loading, setLoading] = useState(false);
  const [parentCategories, setParentCategories] = useState<any[]>([]); // List để chọn cha

  // State form
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    parent_id: "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Load danh sách danh mục để chọn làm cha
  useEffect(() => {
    if (isOpen) {
      // Reset form
      setFormData({ name: "", slug: "", description: "", parent_id: "" });
      setImageFile(null);
      setPreviewUrl(null);
      
      // Load list
      fetchCategories().then(data => setParentCategories(data));
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let imageUrl = "";
      // Upload ảnh nếu có
      if (imageFile) {
        imageUrl = await uploadImageAPI(imageFile);
      }

      // Payload
      const payload = {
        ...formData,
        image: imageUrl,
        parent_id: formData.parent_id || null, // Nếu rỗng gửi null
      };

      await createCategoryAPI(payload);
      
      alert("Tạo danh mục thành công!");
      onSuccess();
      onClose();
    } catch (error: any) {
      alert(error.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95">
        
        {/* Header */}
        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-bold">Thêm danh mục</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div>
            <label className="block text-sm font-medium mb-1">Tên danh mục</label>
            <input 
              name="name" required 
              value={formData.name} 
              onChange={handleChange} 
              className="w-full p-2 border rounded focus:ring-2 focus:ring-black outline-none"
              placeholder="VD: Laptop Gaming"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Slug (Tùy chọn)</label>
            <input 
              name="slug" 
              value={formData.slug} 
              onChange={handleChange} 
              className="w-full p-2 border rounded focus:ring-2 focus:ring-black outline-none font-mono text-sm"
              placeholder="VD: laptop-gaming (để trống sẽ tự sinh)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Danh mục cha</label>
            <select 
              name="parent_id"
              value={formData.parent_id} 
              onChange={handleChange} 
              className="w-full p-2 border rounded focus:ring-2 focus:ring-black outline-none bg-white"
            >
              <option value="">-- Không có (Danh mục gốc) --</option>
              {parentCategories.map(cat => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Mô tả</label>
            <textarea 
              name="description" rows={2}
              value={formData.description} 
              onChange={handleChange} 
              className="w-full p-2 border rounded focus:ring-2 focus:ring-black outline-none"
            />
          </div>

          {/* Upload Image */}
          <div>
            <label className="block text-sm font-medium mb-2">Ảnh minh họa</label>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 border-2 border-dashed rounded flex items-center justify-center bg-gray-50 relative overflow-hidden">
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <Upload className="w-6 h-6 text-gray-400" />
                )}
                <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
              </div>
              <span className="text-xs text-gray-500">JPG, PNG, WEBP</span>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded hover:bg-gray-50">Hủy</button>
            <button 
              type="submit" disabled={loading}
              className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50"
            >
              {loading ? "Đang lưu..." : "Lưu danh mục"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AddCategoryModal;