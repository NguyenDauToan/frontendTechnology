import { useCallback, useEffect, useState } from "react";
import ProductTable, { Product } from "@/components/products/ProductTable";
import { deleteProductAPI, fetchProducts, fetchProductById } from "@/api/productService";
import AddProductModal from "./AddProductPage"; // Kiểm tra lại tên file thực tế của bạn
import EditProductModal from "./EditProductModal";
import ViewProductModal from "./ViewProductModal";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {  ProductType } from "@/types/product";

const ProductPage = () => {
    // 1. State quản lý dữ liệu và trạng thái loading
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // 2. State quản lý Modal
    const [modalState, setModalState] = useState<{
        type: 'ADD' | 'EDIT' | 'VIEW' | null;
        selectedProduct: ProductType | null;
    }>({
        type: null,
        selectedProduct: null
    });

    // 3. Hàm load dữ liệu từ API
    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await fetchProducts();

            // Map dữ liệu từ API sang cấu trúc Product cho bảng
            const mappedProducts: Product[] = data.map((item: any) => ({
                id: item._id,
                name: item.name,
                sku: item.sku,
                category: item.category?.name || "Chưa phân loại",
                brand: item.brand?.name || "No brand", // 👈 thêm dòng này
                price: item.price,
                stock: item.stock,
                image: item.images?.[0] || "",
                status: !item.is_active
                    ? "inactive"
                    : item.stock === 0
                        ? "out_of_stock"
                        : item.stock < 10
                            ? "low_stock"
                            : "active",
                originalData: item
            }));
            setProducts(mappedProducts);
        } catch (err) {
            console.error(err);
            setError("Không thể tải danh sách sản phẩm. Vui lòng thử lại.");
            toast.error("Lỗi tải dữ liệu");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);
   

    // 4. Các hàm xử lý hành động (Action Handlers)

    // Xóa sản phẩm
    const handleDelete = async (id: string) => {
        toast("Xác nhận xóa?", {
            action: {
                label: "Xóa",
                onClick: async () => {
                    try {
                        await deleteProductAPI(id);
                        setProducts(prev => prev.filter(p => p.id !== id));
                        toast.success("Đã xóa");
                    } catch {
                        toast.error("Xóa thất bại");
                    }
                }
            }
        });
    };

    // Mở Modal Thêm mới
    const openAddModal = () => {
        setModalState({ type: 'ADD', selectedProduct: null });
    };

    // Mở Modal Sửa (Gọi API lấy chi tiết mới nhất)
    const openEditModal = (id: string) => {
        const product = products.find(p => p.id === id);
        if (!product) return;

        setModalState({
            type: 'EDIT',
            selectedProduct: product.originalData as ProductType
        });
    };

    // Mở Modal Xem chi tiết
    const openViewModal = (id: string) => {
        const product = products.find(p => p.id === id);
        if (!product) return;

        setModalState({
            type: 'VIEW',
            selectedProduct: product.originalData as ProductType    
        });
    };

    // Đóng Modal
    const closeModal = () => {
        setModalState({ type: null, selectedProduct: null });
    };

    // Callback khi Thêm/Sửa thành công
    const handleSuccess = () => {
        loadData();
        closeModal();
    };

    // 5. Render UI
    return (
        <div className="p-6 md:p-8 space-y-6 bg-gray-50/50 min-h-screen">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Quản lý sản phẩm</h1>
                    <p className="text-sm text-gray-500 mt-1">Quản lý danh sách, tồn kho và thông tin chi tiết sản phẩm.</p>
                </div>
                <button
                    onClick={openAddModal}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg transition-colors flex items-center gap-2 shadow-sm font-medium text-sm"
                >
                    <Plus className="w-4 h-4" />
                    <span>Thêm sản phẩm</span>
                </button>
            </div>

            {/* Content Section */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                        <Loader2 className="w-8 h-8 animate-spin mb-2 text-primary" />
                        <p>Đang tải dữ liệu...</p>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-20 text-red-500">
                        <p className="font-medium">{error}</p>
                        <button
                            onClick={loadData}
                            className="mt-4 text-sm underline hover:text-red-700"
                        >
                            Thử lại
                        </button>
                    </div>
                ) : (
                    <ProductTable
                        products={products}
                        onDelete={handleDelete}
                        onEdit={openEditModal}
                        onView={openViewModal} // Giả sử ProductTable hỗ trợ prop này
                    />
                )}
            </div>

            {/* --- MODALS AREA --- */}

            {/* Modal Thêm */}
            {modalState.type === 'ADD' && (
                <AddProductModal
                    isOpen={true}
                    onClose={closeModal}
                    onSuccess={handleSuccess}
                />
            )}

            {/* Modal Sửa */}
            {modalState.type === 'EDIT' && modalState.selectedProduct && (
                <EditProductModal
                    isOpen={true}
                    onClose={closeModal}
                    onSuccess={handleSuccess}
                    product={modalState.selectedProduct}
                />
            )}

            {/* Modal Xem */}
            {modalState.type === 'VIEW' && modalState.selectedProduct && (
                <ViewProductModal
                    isOpen={true}
                    onClose={closeModal}
                    product={modalState.selectedProduct}
                />
            )}
        </div>
    );
};

export default ProductPage;