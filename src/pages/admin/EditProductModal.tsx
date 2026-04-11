import { useState, useEffect } from "react";
import { X, Plus, Trash2, Upload, Zap } from "lucide-react";
import { updateProductAPI, uploadImageAPI } from "@/api/productService";
import { fetchCategories } from "@/api/categoryService";

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  product: any;
}

const EditProductModal = ({ isOpen, onClose, onSuccess, product }: EditProductModalProps) => {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  
  // --- STATE QUẢN LÝ DỮ LIỆU SẢN PHẨM ---
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

  // --- STATE QUẢN LÝ FLASH SALE ---
  const [flashSale, setFlashSale] = useState({
    isSale: false,
    salePrice: 0,
    startTime: "",
    endTime: "",
    target: 100,
  });

  // --- STATE QUẢN LÝ ẢNH ---
  const [existingImages, setExistingImages] = useState<string[]>([]); // Ảnh cũ (URL)
  const [newFiles, setNewFiles] = useState<File[]>([]);               // Ảnh mới (File)
  const [newPreviews, setNewPreviews] = useState<string[]>([]);       // Preview ảnh mới
  
  const [specs, setSpecs] = useState<any[]>([{ k: "", v: "" }]);

  // Load danh mục khi mở modal
  useEffect(() => {
    const loadCats = async () => {
        try {
            const data = await fetchCategories();
            setCategories(data);
        } catch (error) {
            console.error("Lỗi tải danh mục", error);
        }
    };
    if (isOpen) loadCats();
  }, [isOpen]);

  // Helper: Format Date từ ISO string sang chuỗi input 'YYYY-MM-DDTHH:mm'
  const formatDateForInput = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    // Điều chỉnh múi giờ để hiển thị đúng giờ địa phương
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date.toISOString().slice(0, 16);
  };

  // Đổ dữ liệu cũ vào Form khi có sản phẩm được chọn
  useEffect(() => {
    if (isOpen && product) {
        // 1. Thông tin cơ bản
        setFormData({
            name: product.name || "",
            sku: product.sku || "",
            import_price: product.import_price || 0,
            original_price: product.original_price || 0,
            price: product.price || 0,
            stock: product.stock || 0,
            category: product.category && typeof product.category === 'object' ? product.category._id : product.category || "",
            description: product.description || "",
            warranty_months: product.warranty_months || 12,
        });

        // 2. Thông tin Flash Sale
        if (product.flashSale) {
            setFlashSale({
                isSale: product.flashSale.isSale || false,
                salePrice: product.flashSale.salePrice || 0,
                startTime: formatDateForInput(product.flashSale.startTime),
                endTime: formatDateForInput(product.flashSale.endTime),
                target: product.flashSale.target || 100,
            });
        } else {
            // Reset nếu không có data flash sale
            setFlashSale({ isSale: false, salePrice: 0, startTime: "", endTime: "", target: 100 });
        }

        // 3. Xử lý ảnh cũ
        if (product.images && Array.isArray(product.images)) {
            setExistingImages(product.images);
        } else if (typeof product.image === 'string') {
            setExistingImages([product.image]); 
        } else {
            setExistingImages([]);
        }
        
        // Reset ảnh mới
        setNewFiles([]);
        setNewPreviews([]);

        // 4. Specs
        setSpecs(product.specs && product.specs.length > 0 ? product.specs : [{ k: "", v: "" }]);
    }
  }, [isOpen, product]);

  // --- CÁC HÀM XỬ LÝ SỰ KIỆN ---

  const handleChange = (e: React.ChangeEvent<any>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFlashSaleChange = (e: React.ChangeEvent<any>) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFlashSale({ ...flashSale, [e.target.name]: value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const selectedFiles = Array.from(files);
      const selectedUrls = selectedFiles.map(file => URL.createObjectURL(file));

      setNewFiles(prev => [...prev, ...selectedFiles]);
      setNewPreviews(prev => [...prev, ...selectedUrls]);
    }
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeNewFile = (index: number) => {
    setNewFiles(prev => prev.filter((_, i) => i !== index));
    setNewPreviews(prev => prev.filter((_, i) => i !== index));
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
      // 1. Upload ảnh mới (nếu có)
      let uploadedUrls: string[] = [];
      if (newFiles.length > 0) {
        const uploadPromises = newFiles.map(file => uploadImageAPI(file));
        uploadedUrls = await Promise.all(uploadPromises);
      }

      // 2. Gộp ảnh cũ + ảnh mới
      const finalImages = [...existingImages, ...uploadedUrls];

      // 3. Chuẩn bị payload gửi lên server
      const payload = {
        ...formData,
        import_price: Number(formData.import_price),
        original_price: Number(formData.original_price),
        price: Number(formData.price),
        stock: Number(formData.stock),
        warranty_months: Number(formData.warranty_months),
        specs: specs.filter(s => s.k.trim() !== "" && s.v.trim() !== ""), // Lọc specs rỗng
        images: finalImages,
        
        // Gửi thêm thông tin Flash Sale
        flashSale: {
            isSale: flashSale.isSale,
            salePrice: Number(flashSale.salePrice),
            startTime: flashSale.startTime, // Chuỗi ISO từ input
            endTime: flashSale.endTime,
            target: Number(flashSale.target)
        }
      };

      await updateProductAPI(product._id || product.id, payload);
      
      alert("Cập nhật thành công!");
      onSuccess();
      onClose();

    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.message || "Lỗi cập nhật sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b flex justify-between items-center bg-yellow-50">
          <h2 className="text-xl font-bold text-yellow-800">Cập nhật sản phẩm</h2>
          <button onClick={onClose} className="p-2 hover:bg-yellow-200 rounded-full transition">
            <X className="w-5 h-5 text-yellow-800" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">
          <form id="edit-product-form" onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* --- CỘT TRÁI: THÔNG TIN CƠ BẢN --- */}
                <div className="space-y-4">
                    <h3 className="font-semibold text-gray-700 border-b pb-2">Thông tin chung</h3>
                    
                    <div>
                        <label className="text-sm font-medium text-gray-700">Tên sản phẩm</label>
                        <input name="name" required value={formData.name} onChange={handleChange} className="w-full p-2 border rounded mt-1 focus:ring-2 focus:ring-yellow-500 outline-none" />
                    </div>
                    
                    <div>
                        <label className="text-sm font-medium text-gray-700">Mã SKU</label>
                        <input name="sku" required value={formData.sku} onChange={handleChange} className="w-full p-2 border rounded mt-1 font-mono bg-gray-50" />
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
                            <label className="text-sm font-medium text-gray-700">Tồn kho</label>
                            <input type="number" name="stock" required value={formData.stock} onChange={handleChange} className="w-full p-2 border rounded mt-1" />
                        </div>
                        <div>
                             <label className="text-sm font-medium text-gray-700">Danh mục</label>
                            <select name="category" value={formData.category} onChange={handleChange} className="w-full p-2 border rounded mt-1 bg-white">
                                <option value="">-- Chọn danh mục --</option>
                                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* --- KHU VỰC FLASH SALE --- */}
                    <div className="border-2 border-red-100 rounded-lg p-4 bg-red-50/30 mt-4">
                        <div className="flex items-center gap-2 mb-3 border-b border-red-200 pb-2">
                            <Zap className="w-5 h-5 text-red-600 fill-red-600" />
                            <h3 className="font-bold text-red-700">Cấu hình Flash Sale</h3>
                            <label className="flex items-center gap-2 ml-auto cursor-pointer select-none">
                                <input 
                                    type="checkbox" 
                                    name="isSale"
                                    checked={flashSale.isSale}
                                    onChange={handleFlashSaleChange}
                                    className="w-4 h-4 accent-red-600 cursor-pointer"
                                />
                                <span className="text-sm font-medium text-gray-700">Bật Flash Sale</span>
                            </label>
                        </div>

                        {/* Chỉ hiện các trường nhập liệu khi bật Flash Sale */}
                        {flashSale.isSale && (
                            <div className="space-y-3 animate-in slide-in-from-top-2 fade-in duration-300">
                                <div>
                                    <label className="text-xs font-bold text-red-600">Giá Sale Sốc</label>
                                    <input 
                                        type="number" 
                                        name="salePrice" 
                                        value={flashSale.salePrice} 
                                        onChange={handleFlashSaleChange}
                                        className="w-full p-2 border border-red-200 rounded text-red-600 font-bold focus:ring-2 focus:ring-red-500 outline-none" 
                                    />
                                    {/* Hiển thị % giảm giá dự kiến */}
                                    {formData.original_price > 0 && flashSale.salePrice > 0 && (
                                        <p className="text-xs text-red-500 mt-1 italic">
                                            🔥 Giảm {Math.round(((formData.original_price - flashSale.salePrice) / formData.original_price) * 100)}% so với giá niêm yết
                                        </p>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="text-xs font-medium text-gray-600">Bắt đầu</label>
                                        <input 
                                            type="datetime-local" 
                                            name="startTime"
                                            value={flashSale.startTime}
                                            onChange={handleFlashSaleChange}
                                            className="w-full p-2 border rounded text-xs"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-600">Kết thúc</label>
                                        <input 
                                            type="datetime-local" 
                                            name="endTime"
                                            value={flashSale.endTime}
                                            onChange={handleFlashSaleChange}
                                            className="w-full p-2 border rounded text-xs"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-600">Số lượng mở bán (Target)</label>
                                    <input 
                                        type="number"
                                        name="target"
                                        value={flashSale.target}
                                        onChange={handleFlashSaleChange}
                                        className="w-full p-2 border rounded text-sm"
                                        placeholder="VD: 100"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                    {/* --------------------------- */}

                    <div>
                        <label className="text-sm font-medium text-gray-700">Bảo hành (tháng)</label>
                        <input type="number" name="warranty_months" required value={formData.warranty_months} onChange={handleChange} className="w-full p-2 border rounded mt-1" />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700">Mô tả chi tiết</label>
                        <textarea name="description" rows={4} value={formData.description} onChange={handleChange} className="w-full p-2 border rounded mt-1" />
                    </div>
                </div>

                {/* --- CỘT PHẢI: ẢNH & SPECS --- */}
                <div className="space-y-6">
                    {/* Quản lý ảnh */}
                    <div>
                        <h3 className="font-semibold text-gray-700 border-b pb-2 mb-4">
                            Hình ảnh ({existingImages.length + newFiles.length})
                        </h3>
                        
                        {/* Dropzone */}
                        <div className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center bg-gray-50 relative overflow-hidden group hover:border-yellow-500 transition-colors cursor-pointer">
                            <div className="text-center text-gray-400 group-hover:text-yellow-600">
                                <Upload className="mx-auto h-8 w-8 mb-2" />
                                <span className="text-sm">Nhấn để thêm ảnh mới</span>
                            </div>
                            <input type="file" multiple accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                        </div>

                        {/* Grid hiển thị ảnh */}
                        <div className="grid grid-cols-4 gap-2 mt-4 max-h-[200px] overflow-y-auto p-1 scrollbar-hide">
                            {/* 1. Ảnh cũ */}
                            {existingImages.map((url, index) => (
                                <div key={`exist-${index}`} className="relative group/img aspect-square border border-yellow-200 rounded-md overflow-hidden bg-gray-100">
                                    <img src={url} alt="old" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity" />
                                    <button 
                                        type="button"
                                        onClick={() => removeExistingImage(index)}
                                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover/img:opacity-100 transition-opacity transform hover:scale-110"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}

                            {/* 2. Ảnh mới */}
                            {newPreviews.map((url, index) => (
                                <div key={`new-${index}`} className="relative group/img aspect-square border border-green-300 rounded-md overflow-hidden bg-gray-100">
                                    <img src={url} alt="new" className="w-full h-full object-cover" />
                                    <div className="absolute bottom-0 left-0 right-0 bg-green-500 text-white text-[10px] text-center py-0.5">Mới</div>
                                    <button 
                                        type="button"
                                        onClick={() => removeNewFile(index)}
                                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover/img:opacity-100 transition-opacity transform hover:scale-110"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Specs */}
                    <div>
                        <div className="flex justify-between items-center border-b pb-2 mb-4">
                             <h3 className="font-semibold text-gray-700">Thông số kỹ thuật</h3>
                             <button type="button" onClick={addSpec} className="text-xs flex items-center text-blue-600 hover:underline font-medium">
                                <Plus className="w-3 h-3 mr-1"/> Thêm thông số
                             </button>
                        </div>
                        <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                            {specs.map((spec, index) => (
                                <div key={index} className="flex gap-2 items-center">
                                    <input placeholder="Tên (RAM)" value={spec.k} onChange={e => handleSpecChange(index, 'k', e.target.value)} className="w-1/3 p-2 text-sm border rounded bg-gray-50" />
                                    <input placeholder="Giá trị (8GB)" value={spec.v} onChange={e => handleSpecChange(index, 'v', e.target.value)} className="flex-1 p-2 text-sm border rounded bg-gray-50" />
                                    <button type="button" onClick={() => removeSpec(index)} className="text-red-500 p-2 hover:bg-red-50 rounded transition"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-white transition font-medium">
            Hủy bỏ
          </button>
          <button 
            type="submit" 
            form="edit-product-form" 
            disabled={loading}
            className="px-6 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition disabled:opacity-50 flex items-center shadow-sm font-medium"
          >
            {loading ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default EditProductModal;