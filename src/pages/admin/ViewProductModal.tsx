import { X } from "lucide-react";

interface ViewProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: any; // Dữ liệu sản phẩm đầy đủ
}

const ViewProductModal = ({ isOpen, onClose, product }: ViewProductModalProps) => {
  if (!isOpen || !product) return null;

  const formatPrice = (value: number) => 
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-bold text-gray-800">Chi tiết sản phẩm</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Ảnh */}
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border">
              {product.images && product.images.length > 0 ? (
                <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">Không có ảnh</div>
              )}
            </div>

            {/* Thông tin */}
            <div className="space-y-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{product.name}</h3>
                <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded mt-1 font-mono">
                  SKU: {product.sku}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                   <p className="text-xs text-blue-600 font-medium">Giá bán</p>
                   <p className="text-lg font-bold text-blue-700">{formatPrice(product.price)}</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                   <p className="text-xs text-green-600 font-medium">Tồn kho</p>
                   <p className="text-lg font-bold text-green-700">{product.stock}</p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <p><span className="font-semibold">Danh mục:</span> {product.category?.name || product.category || "---"}</p>
                <p><span className="font-semibold">Bảo hành:</span> {product.warranty_months} tháng</p>
                <p><span className="font-semibold">Giá nhập:</span> {formatPrice(product.import_price || 0)}</p>
                <p><span className="font-semibold">Giá gốc:</span> {formatPrice(product.original_price || 0)}</p>
              </div>

              {/* Specs */}
              {product.specs && product.specs.length > 0 && (
                <div>
                   <h4 className="font-semibold border-b pb-1 mb-2">Thông số kỹ thuật</h4>
                   <ul className="grid grid-cols-2 gap-2 text-sm">
                      {product.specs.map((spec: any, idx: number) => (
                        <li key={idx} className="flex justify-between border-b border-dashed pb-1">
                          <span className="text-gray-500">{spec.k}:</span>
                          <span className="font-medium">{spec.v}</span>
                        </li>
                      ))}
                   </ul>
                </div>
              )}
            </div>
          </div>

          {/* Mô tả */}
          <div className="mt-8 pt-6 border-t">
            <h4 className="font-semibold mb-2">Mô tả sản phẩm</h4>
            <p className="text-gray-600 whitespace-pre-line leading-relaxed">
              {product.description || "Chưa có mô tả."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewProductModal;