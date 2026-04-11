import { useEffect, useState } from "react";
import { X, ShoppingBag, Trash2, Plus, Minus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { getCart, removeFromCart, updateCartItem } from "@/api/cartApi";
import { toast } from "sonner";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartDrawer = ({ isOpen, onClose }: CartDrawerProps) => {
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const [selectedItems, setSelectedItems] = useState<string[]>([]); // ✅ NEW
  const [totalPrice, setTotalPrice] = useState(0);

  const [inputQuantities, setInputQuantities] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      fetchCartData();
    }
  }, [isOpen]);

  // ===============================
  // FETCH CART
  // ===============================
  const fetchCartData = async () => {
    setLoading(true);
    try {
      const data = await getCart();
      if (data && data.items) {
        const validItems = data.items.filter((i: any) => i.product);

        setCartItems(validItems);

        // ✅ auto select all
        setSelectedItems(validItems.map((item: any) => item.product._id));

        calculateTotal(validItems, validItems.map((item: any) => item.product._id));

        const initialInputs: Record<string, string> = {};
        validItems.forEach((item: any) => {
          initialInputs[item.product._id] = item.quantity.toString();
        });
        setInputQuantities(initialInputs);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // CALCULATE TOTAL (CHỈ ITEM ĐÃ CHỌN)
  // ===============================
  const calculateTotal = (items: any[], selected: string[]) => {
    const total = items.reduce((acc, item) => {
      if (!selected.includes(item.product._id)) return acc;
      return acc + item.product.price * item.quantity;
    }, 0);

    setTotalPrice(total);
  };

  // ===============================
  // TOGGLE CHECKBOX
  // ===============================
  const toggleSelectItem = (productId: string) => {
    const newSelected = selectedItems.includes(productId)
      ? selectedItems.filter(id => id !== productId)
      : [...selectedItems, productId];

    setSelectedItems(newSelected);
    calculateTotal(cartItems, newSelected);
  };

  // ===============================
  // UPDATE QUANTITY
  // ===============================
  const updateQuantityAPI = async (productId: string, newQuantity: number, stock: number) => {
    if (newQuantity < 1) newQuantity = 1;
    if (newQuantity > stock) {
      newQuantity = stock;
      toast.warning(`Kho chỉ còn ${stock} sản phẩm`);
    }

    setInputQuantities(prev => ({ ...prev, [productId]: newQuantity.toString() }));

    try {
      setIsUpdating(true);
      const updatedCart = await updateCartItem(productId, newQuantity);

      const validItems = updatedCart.items.filter((item: any) => item.product);
      setCartItems(validItems);

      calculateTotal(validItems, selectedItems);

      const updatedInputs: Record<string, string> = {};
      validItems.forEach((item: any) => {
        updatedInputs[item.product._id] = item.quantity.toString();
      });
      setInputQuantities(updatedInputs);

    } catch (error) {
      toast.error("Lỗi cập nhật");
      fetchCartData();
    } finally {
      setIsUpdating(false);
    }
  };

  const handleInputChange = (productId: string, value: string) => {
    if (!/^\d*$/.test(value)) return;
    setInputQuantities(prev => ({ ...prev, [productId]: value }));
  };

  const handleInputBlur = (productId: string, stock: number) => {
    const rawValue = inputQuantities[productId];
    let quantity = parseInt(rawValue || "1", 10);

    if (isNaN(quantity) || quantity < 1) quantity = 1;

    const currentItem = cartItems.find(item => item.product._id === productId);

    if (currentItem && currentItem.quantity !== quantity) {
      updateQuantityAPI(productId, quantity, stock);
    } else {
      setInputQuantities(prev => ({
        ...prev,
        [productId]: currentItem?.quantity.toString() || "1"
      }));
    }
  };

  // ===============================
  // REMOVE
  // ===============================
  const handleRemove = async (productId: string) => {
    try {
      const res = await removeFromCart(productId);
      const validItems = res.items.filter((i: any) => i.product);

      setCartItems(validItems);

      const newSelected = selectedItems.filter(id => id !== productId);
      setSelectedItems(newSelected);

      calculateTotal(validItems, newSelected);

      toast.success("Đã xóa sản phẩm");
    } catch (error) {
      toast.error("Lỗi xóa sản phẩm");
    }
  };

  // ===============================
  // CHECKOUT
  // ===============================
  const handleCheckout = () => {
    const selected = cartItems.filter(item =>
      selectedItems.includes(item.product._id)
    );
  
    if (selected.length === 0) {
      toast.error("Vui lòng chọn sản phẩm");
      return;
    }
  
    navigate("/checkout", {
      state: { selectedItems: selected } // ✅ chuẩn format
    });
  
    onClose();
  };

  // ===============================
  // UI
  // ===============================
  return (
    <div className={`fixed inset-0 z-50 flex justify-end ${isOpen ? "visible" : "invisible"}`}>

      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white h-full flex flex-col">

        {/* HEADER */}
        <div className="p-4 border-b flex justify-between">
          <h2 className="font-bold">Giỏ hàng ({cartItems.length})</h2>
          <button onClick={onClose}><X /></button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <Loader2 className="animate-spin" />
          ) : (
            cartItems.map(item => {
              const inputValue = inputQuantities[item.product._id] ?? item.quantity;

              return (
                <div
                  key={item._id}
                  onClick={() => toggleSelectItem(item.product._id)}
                  className={`flex gap-3 border p-3 rounded mb-3 cursor-pointer transition ${selectedItems.includes(item.product._id)
                      ? "border-primary bg-primary/5"
                      : "hover:bg-gray-50"
                    }`}
                >
                  {/* ✅ CHECKBOX */}
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.product._id)}
                    onChange={() => toggleSelectItem(item.product._id)}
                  />

                  <img src={item.product.images?.[0]} className="w-16 h-16" />

                  <div className="flex-1">
                    <h4>{item.product.name}</h4>

                    <div className="flex gap-2 mt-2">
                      <button onClick={() => updateQuantityAPI(item.product._id, item.quantity - 1, item.product.stock)}>
                        <Minus />
                      </button>

                      <input
                        value={inputValue}
                        onChange={(e) => handleInputChange(item.product._id, e.target.value)}
                        onBlur={() => handleInputBlur(item.product._id, item.product.stock)}
                        className="w-10 text-center"
                      />

                      <button onClick={() => updateQuantityAPI(item.product._id, item.quantity + 1, item.product.stock)}>
                        <Plus />
                      </button>
                    </div>
                  </div>

                  <div>
                    <p>{item.product.price.toLocaleString()}đ</p>
                    <button onClick={() => handleRemove(item.product._id)}>
                      <Trash2 />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t">
          <div className="flex justify-between mb-3">
            <span>Tổng</span>
            <span>{totalPrice.toLocaleString()}đ</span>
          </div>

          <Button onClick={handleCheckout} className="w-full">
            THANH TOÁN ({selectedItems.length})
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;