import { Edit, Trash2, Eye, Image as ImageIcon } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

// Interface định nghĩa dữ liệu sản phẩm
export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  image: string;
  status: "active" | "inactive" | "low_stock";
  originalData?: any;
}

interface ProductTableProps {
  products: Product[];
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onView?: (id: string) => void;
}

const ProductTable = ({ products, onDelete, onEdit, onView }: ProductTableProps) => {
  
  // --- KHẮC PHỤC LỖI TẠI ĐÂY ---
  // Tạo một biến an toàn: Nếu products bị null/undefined thì dùng mảng rỗng []
  const safeProducts = Array.isArray(products) ? products : [];

  const formatPrice = (value: number) => 
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

  return (
    <div className="rounded-md border border-gray-200 overflow-hidden">
      <Table>
        <TableHeader className="bg-gray-50">
          <TableRow>
            <TableHead className="w-[80px]">Hình ảnh</TableHead>
            <TableHead>Tên sản phẩm</TableHead>
            <TableHead>Mã SKU</TableHead>
            <TableHead>Danh mục</TableHead>
            <TableHead className="text-right">Giá bán</TableHead>
            <TableHead className="text-center">Tồn kho</TableHead>
            <TableHead className="text-center">Trạng thái</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* Sử dụng safeProducts thay vì products để tránh lỗi .length */}
          {safeProducts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-10 text-gray-500">
                Chưa có sản phẩm nào
              </TableCell>
            </TableRow>
          ) : (
            safeProducts.map((product) => (
              <TableRow key={product.id} className="hover:bg-gray-50/50 transition-colors">
                
                {/* Cột Hình ảnh */}
                <TableCell>
                  <div className="w-12 h-12 rounded-md border border-gray-200 overflow-hidden bg-white flex items-center justify-center">
                    {product.image ? (
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="w-full h-full object-cover"
                        onError={(e) => { e.currentTarget.src = ""; }} 
                      />
                    ) : (
                      <ImageIcon className="w-5 h-5 text-gray-300" />
                    )}
                  </div>
                </TableCell>

                <TableCell className="font-medium">
                    <div className="line-clamp-2 max-w-[220px]" title={product.name}>
                        {product.name}
                    </div>
                </TableCell>
                <TableCell className="font-mono text-xs text-gray-500">{product.sku}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell className="text-right font-medium text-gray-900">
                    {formatPrice(product.price)}
                </TableCell>
                <TableCell className="text-center">
                    <span className={product.stock < 10 ? "text-red-500 font-bold" : "text-gray-700"}>
                        {product.stock}
                    </span>
                </TableCell>
                <TableCell className="text-center">
                  {product.status === "active" && <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200 shadow-none">Hoạt động</Badge>}
                  {product.status === "inactive" && <Badge variant="secondary" className="text-gray-500 shadow-none">Đã ẩn</Badge>}
                  {product.status === "low_stock" && <Badge variant="destructive" className="bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-100 shadow-none">Sắp hết</Badge>}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    {onView && (
                        <button 
                            onClick={() => onView(product.id)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            title="Xem chi tiết"
                        >
                            <Eye size={16} />
                        </button>
                    )}
                    <button 
                      onClick={() => onEdit(product.id)}
                      className="p-2 text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                      title="Sửa"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      onClick={() => onDelete(product.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      title="Xóa"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProductTable;