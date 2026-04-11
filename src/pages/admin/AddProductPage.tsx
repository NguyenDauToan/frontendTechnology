import { useState, useEffect } from "react";
import { X, Plus, Trash2, Upload, Image as ImageIcon } from "lucide-react";
import { createProductAPI, uploadImageAPI } from "@/api/productService";
import { fetchCategories } from "@/api/categoryService";

interface Category {
  _id: string;
  name: string;
}

interface Spec {
  k: string;
  v: string;
}

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddProductModal = ({ isOpen, onClose, onSuccess }: AddProductModalProps) => {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    import_price: 0,
    original_price: 0,
    price: 0,
    stock: 0,
    category: "",
    description: "",
    warranty_months: 12,
  });

  // --- SỬA: Đổi sang mảng để lưu nhiều ảnh ---
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [specs, setSpecs] = useState<Spec[]>([{ k: "", v: "" }]);

  useEffect(() => {
    if (isOpen) {
        setFormData({
            name: "", sku: "", 
            import_price: 0, original_price: 0, price: 0, 
            stock: 0, category: "", description: "", warranty_months: 12,
        });
        // Reset ảnh
        setImageFiles([]);
        setPreviewUrls([]);
        setSpecs([{ k: "", v: "" }]);
        loadCategories();
    }
  }, [isOpen]);

  const loadCategories = async () => {
    try {
      const data = await fetchCategories();
      setCategories(data);
      if (data.length > 0 && !formData.category) {
          setFormData(prev => ({ ...prev, category: data[0]._id }));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- SỬA: Xử lý chọn nhiều ảnh ---
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newFiles = Array.from(files);
      const newUrls = newFiles.map(file => URL.createObjectURL(file));

      // Cộng dồn vào danh sách cũ
      setImageFiles(prev => [...prev, ...newFiles]);
      setPreviewUrls(prev => [...prev, ...newUrls]);
    }
  };

  // --- MỚI: Xóa ảnh khỏi danh sách chọn ---
  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const addSpec = () => setSpecs([...specs, { k: "", v: "" }]);
  const removeSpec = (index: number) => setSpecs(specs.filter((_, i) => i !== index));
  const handleSpecChange = (index: number, field: 'k' | 'v', value: string) => {
    const newSpecs = [...specs];
    newSpecs[index][field] = value;
    setSpecs(newSpecs);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // --- SỬA: Upload tất cả ảnh ---
      let imageUrls: string[] = [];
      if (imageFiles.length > 0) {
        // Dùng Promise.all để upload song song cho nhanh
        const uploadPromises = imageFiles.map(file => uploadImageAPI(file));
        imageUrls = await Promise.all(uploadPromises);
      }

      const validSpecs = specs.filter(s => s.k.trim() !== "" && s.v.trim() !== "");

      const payload = {
        ...formData,
        import_price: Number(formData.import_price),
        original_price: Number(formData.original_price),
        price: Number(formData.price),
        stock: Number(formData.stock),
        warranty_months: Number(formData.warranty_months),
        specs: validSpecs,
        images: imageUrls, // Gửi mảng ảnh lên backend
      };

      await createProductAPI(payload);
      
      alert("Thêm thành công!");
      onSuccess();
      onClose();

    } catch (error: any) {
      alert(error.response?.data?.message || "Lỗi thêm sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        
        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-bold text-gray-800">Thêm sản phẩm mới</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <form id="add-product-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* CỘT TRÁI: GIỮ NGUYÊN CODE CŨ */}
                <div className="space-y-4">
                    <h3 className="font-semibold text-gray-700 border-b pb-2">Thông tin chung</h3>
                    <div>
                        <label className="text-sm font-medium">Tên sản phẩm</label>
                        <input name="name" required value={formData.name} onChange={handleChange} className="w-full p-2 border rounded mt-1" />
                    </div>
                    <div>
                        <label className="text-sm font-medium">Mã SKU</label>
                        <input name="sku" required value={formData.sku} onChange={handleChange} className="w-full p-2 border rounded mt-1 font-mono" />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label className="text-sm font-medium text-blue-600">Giá nhập</label>
                            <input type="number" name="import_price" required value={formData.import_price} onChange={handleChange} className="w-full p-2 border border-blue-200 rounded mt-1 bg-blue-50" />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Giá niêm yết</label>
                            <input type="number" name="original_price" required value={formData.original_price} onChange={handleChange} className="w-full p-2 border rounded mt-1" />
                        </div>
                        <div>
                            <label className="text-sm font-bold text-green-600">Giá bán</label>
                            <input type="number" name="price" required value={formData.price} onChange={handleChange} className="w-full p-2 border border-green-200 rounded mt-1 bg-green-50 font-bold" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                         <div>
                            <label className="text-sm font-medium">Tồn kho</label>
                            <input type="number" name="stock" required value={formData.stock} onChange={handleChange} className="w-full p-2 border rounded mt-1" />
                        </div>
                        <div>
                             <label className="text-sm font-medium">Danh mục</label>
                            <select name="category" value={formData.category} onChange={handleChange} className="w-full p-2 border rounded mt-1 bg-white">
                                <option value="">-- Chọn --</option>
                                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium">Bảo hành (tháng)</label>
                        <input type="number" name="warranty_months" required value={formData.warranty_months} onChange={handleChange} className="w-full p-2 border rounded mt-1" />
                    </div>
                    <div>
                        <label className="text-sm font-medium">Mô tả</label>
                        <textarea name="description" rows={3} value={formData.description} onChange={handleChange} className="w-full p-2 border rounded mt-1" />
                    </div>
                </div>

                {/* CỘT PHẢI: ẢNH & SPECS */}
                <div className="space-y-6">
                    {/* --- SỬA: KHU VỰC UPLOAD NHIỀU ẢNH --- */}
                    <div>
                        <h3 className="font-semibold text-gray-700 border-b pb-2 mb-4">Hình ảnh ({previewUrls.length})</h3>
                        
                        {/* Khu vực Dropzone */}
                        <div className="w-full h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center bg-gray-50 relative overflow-hidden group hover:border-blue-500 transition-colors cursor-pointer">
                            <div className="text-center text-gray-400 group-hover:text-blue-500">
                                <Upload className="mx-auto h-8 w-8 mb-2" />
                                <span className="text-sm">Nhấn để chọn nhiều ảnh</span>
                            </div>
                            <input 
                                type="file" 
                                multiple // Cho phép chọn nhiều file
                                accept="image/*" 
                                onChange={handleImageChange} 
                                className="absolute inset-0 opacity-0 cursor-pointer" 
                            />
                        </div>

                        {/* Danh sách ảnh đã chọn (Grid) */}
                        {previewUrls.length > 0 && (
                            <div className="grid grid-cols-4 gap-2 mt-4">
                                {previewUrls.map((url, index) => (
                                    <div key={index} className="relative group/img aspect-square border rounded-md overflow-hidden">
                                        <img src={url} alt={`preview-${index}`} className="w-full h-full object-cover" />
                                        <button 
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover/img:opacity-100 transition-opacity"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Specs (Giữ nguyên) */}
                    <div>
                        <div className="flex justify-between items-center border-b pb-2 mb-4">
                             <h3 className="font-semibold text-gray-700">Thông số kỹ thuật</h3>
                             <button type="button" onClick={addSpec} className="text-xs flex items-center text-blue-600 hover:underline">
                                <Plus className="w-3 h-3 mr-1"/> Thêm
                             </button>
                        </div>
                        <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                            {specs.map((spec, index) => (
                                <div key={index} className="flex gap-2">
                                    <input placeholder="Tên (RAM)" value={spec.k} onChange={e => handleSpecChange(index, 'k', e.target.value)} className="w-1/3 p-1 text-sm border rounded" />
                                    <input placeholder="Giá trị (8GB)" value={spec.v} onChange={e => handleSpecChange(index, 'v', e.target.value)} className="flex-1 p-1 text-sm border rounded" />
                                    <button type="button" onClick={() => removeSpec(index)} className="text-red-500 p-1 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
          </form>
        </div>

        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border rounded text-gray-600 hover:bg-white transition">Hủy bỏ</button>
          <button type="submit" form="add-product-form" disabled={loading} className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition disabled:opacity-50 flex items-center">
            {loading ? "Đang upload..." : "Lưu sản phẩm"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddProductModal;