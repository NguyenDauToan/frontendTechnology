import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getCart, updateCartItem, removeFromCart } from "@/api/cartApi";
import Header from "@/components/layout/user/Header";
import PromoBanner from "./PromoBanner";

const CartPage = () => {
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState<any[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [inputQuantities, setInputQuantities] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setIsLoading(true);
      const data = await getCart();
      const validItems = (data.items || []).filter((i: any) => i.product);

      setCartItems(validItems);

      const initialInputs: Record<string, string> = {};
      validItems.forEach((item: any) => {
        initialInputs[item.product._id] = item.quantity.toString();
      });
      setInputQuantities(initialInputs);

    } catch (error) {
      toast.error("Không thể tải giỏ hàng");
    } finally {
      setIsLoading(false);
    }
  };

  // =========================
  // ✅ SELECT ITEM
  // =========================
  const handleSelectItem = (productId: string) => {
    setSelectedItems(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === cartItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cartItems.map(i => i.product._id));
    }
  };

  // =========================
  // ✅ UPDATE QUANTITY
  // =========================
  const updateQuantityAPI = async (productId: string, newQuantity: number, stock: number) => {
    if (newQuantity < 1) newQuantity = 1;
    if (newQuantity > stock) {
      newQuantity = stock;
      toast.warning(`Chỉ còn ${stock} sản phẩm`);
    }

    setInputQuantities(prev => ({ ...prev, [productId]: newQuantity.toString() }));

    try {
      setIsUpdating(true);
      const updatedCart = await updateCartItem(productId, newQuantity);

      const validItems = updatedCart.items.filter((i: any) => i.product);
      setCartItems(validItems);

    } catch {
      toast.error("Lỗi cập nhật");
      fetchCart();
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemoveItem = async (productId: string) => {
    try {
      setIsUpdating(true);
      const updatedCart = await removeFromCart(productId);
      setCartItems(updatedCart.items.filter((i: any) => i.product));

      // remove khỏi selected luôn
      setSelectedItems(prev => prev.filter(id => id !== productId));

      toast.success("Đã xóa");
    } catch {
      toast.error("Lỗi xóa");
    } finally {
      setIsUpdating(false);
    }
  };

  // =========================
  // ✅ CALCULATE
  // =========================
  const selectedCartItems = cartItems.filter(item =>
    selectedItems.includes(item.product._id)
  );

  const subtotal = selectedCartItems.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );

  const shipping = subtotal > 0 ? 30000 : 0;
  const total = subtotal + shipping;

  const format = (n: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

  // =========================
  // UI
  // =========================
  if (isLoading)
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>;

  if (cartItems.length === 0)
    return <div className="text-center py-20">Giỏ hàng trống</div>;

  return (
    <>
      <Header />
      <PromoBanner />

      <div className="container mx-auto max-w-6xl py-8">
        <h1 className="text-2xl font-bold mb-6">Giỏ hàng</h1>

        {/* SELECT ALL */}
        <div className="mb-4 flex items-center gap-2">
          <input
            type="checkbox"
            checked={selectedItems.length === cartItems.length}
            onChange={handleSelectAll}
          />
          <span>Chọn tất cả</span>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* LEFT */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map(item => (
              <div key={item._id} className="flex gap-4 p-4 border rounded-lg">

                {/* CHECKBOX */}
                <input
                  type="checkbox"
                  checked={selectedItems.includes(item.product._id)}
                  onChange={() => handleSelectItem(item.product._id)}
                />

                <img src={item.product.images?.[0]} className="w-20 h-20 object-cover" />

                <div className="flex-1">
                  <h3>{item.product.name}</h3>

                  {/* QUANTITY */}
                  <div className="flex items-center mt-2">
                    <button onClick={() => updateQuantityAPI(item.product._id, item.quantity - 1, item.product.stock)}>
                      <Minus />
                    </button>

                    <span className="px-3">{item.quantity}</span>

                    <button onClick={() => updateQuantityAPI(item.product._id, item.quantity + 1, item.product.stock)}>
                      <Plus />
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-bold">{format(item.product.price * item.quantity)}</p>
                  <button onClick={() => handleRemoveItem(item.product._id)}>
                    <Trash2 />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT */}
          <div className="border p-4 rounded-lg h-fit">
            <h3 className="font-bold mb-4">Thanh toán</h3>

            <p>Tạm tính: {format(subtotal)}</p>
            <p>Ship: {format(shipping)}</p>
            <p className="font-bold text-lg">Tổng: {format(total)}</p>

            <Button
              className="w-full mt-4"
              onClick={() => {
                if (selectedItems.length === 0) {
                  toast.error("Chọn sản phẩm trước");
                  return;
                }

                navigate("/checkout", {
                  state: {
                    selectedItems: selectedCartItems
                  }
                });
              }}
            >
              Thanh toán <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>

        </div>
      </div>
    </>
  );
};

export default CartPage;