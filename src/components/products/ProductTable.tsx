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

// ✅ Type specs an toàn
interface Spec {
  k?: string;
  v?: string;
}

// Interface định nghĩa dữ liệu sản phẩm
export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  brand?: string; // 👈 THÊM BRAND
  price: number;
  stock: number;
  image: string;
  status: "active" | "inactive" | "low_stock";
  originalData?: {
    specs?: Spec[];
  };
}

interface ProductTableProps {
  products: Product[];
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onView?: (id: string) => void;
}

const ProductTable = ({ products, onDelete, onEdit, onView }: ProductTableProps) => {

  const safeProducts = Array.isArray(products) ? products : [];

  const formatPrice = (value: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);

  return (
    <div className="rounded-md border border-gray-200 overflow-hidden">
      <Table>
        <TableHeader className="bg-gray-50">
          <TableRow>
            <TableHead className="w-[80px]">Hình ảnh</TableHead>
            <TableHead>Tên sản phẩm</TableHead>
            <TableHead>Mã SKU</TableHead>
            <TableHead>Danh mục</TableHead>
            <TableHead>Thương hiệu</TableHead> {/* 👈 THÊM */}
            <TableHead className="text-right">Giá bán</TableHead>
            <TableHead className="text-center">Tồn kho</TableHead>
            <TableHead className="text-center">Trạng thái</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {safeProducts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-10 text-gray-500">
                Chưa có sản phẩm nào
              </TableCell>
            </TableRow>
          ) : (
            safeProducts.map((product) => (
              <TableRow key={product.id} className="hover:bg-gray-50/50 transition-colors">

                {/* IMAGE */}
                <TableCell>
                  <div className="w-12 h-12 rounded-md border overflow-hidden bg-white flex items-center justify-center">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "/no-image.png"; // 👈 fallback
                        }}
                      />
                    ) : (
                      <ImageIcon className="w-5 h-5 text-gray-300" />
                    )}
                  </div>
                </TableCell>

                {/* NAME + TOOLTIP */}
                <TableCell className="font-medium">
                  <div className="relative group max-w-[220px]">

                    <div className="line-clamp-2 cursor-pointer">
                      {product.name}
                    </div>

                    {/* TOOLTIP SPECS */}
                    {product.originalData?.specs?.length ? (
                      <div className="absolute left-0 top-full mt-2 w-64 bg-white border shadow-lg rounded-md p-3 
                      opacity-0 invisible group-hover:opacity-100 group-hover:visible 
                      transition duration-200 z-50">

                        <p className="text-xs font-semibold mb-2 text-gray-700">
                          Thông số kỹ thuật
                        </p>

                        <div className="text-xs space-y-1 max-h-40 overflow-auto">
                          {product.originalData.specs.map((spec, i) => (
                            <div key={i} className="flex justify-between gap-2">
                              <span className="text-gray-500">
                                {spec.k ? spec.k.replace(/_/g, " ") : "---"}
                              </span>
                              <span className="font-medium text-right">
                                {spec.v || "---"}
                              </span>
                            </div>
                          ))}
                        </div>

                      </div>
                    ) : null}

                  </div>
                </TableCell>

                <TableCell className="font-mono text-xs text-gray-500">
                  {product.sku}
                </TableCell>

                <TableCell>{product.category}</TableCell>

                {/* ✅ BRAND */}
                <TableCell>
                  <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium">
                    {product.brand || "N/A"}
                  </span>
                </TableCell>

                <TableCell className="text-right font-medium text-gray-900">
                  {formatPrice(product.price)}
                </TableCell>

                <TableCell className="text-center">
                  <span className={product.stock < 10 ? "text-red-500 font-bold" : "text-gray-700"}>
                    {product.stock}
                  </span>
                </TableCell>

                <TableCell className="text-center">
                  {product.status === "active" && (
                    <Badge className="bg-green-100 text-green-700 border-green-200">
                      Hoạt động
                    </Badge>
                  )}
                  {product.status === "inactive" && (
                    <Badge variant="secondary" className="text-gray-500">
                      Đã ẩn
                    </Badge>
                  )}
                  {product.status === "low_stock" && (
                    <Badge className="bg-orange-100 text-orange-700 border-orange-200">
                      Sắp hết
                    </Badge>
                  )}
                </TableCell>

                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    {onView && (
                      <button
                        onClick={() => onView(product.id)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                      >
                        <Eye size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => onEdit(product.id)}
                      className="p-2 text-amber-600 hover:bg-amber-50 rounded-md"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => onDelete(product.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-md"
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