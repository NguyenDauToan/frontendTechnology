import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getCart } from "@/api/cartApi";
import { createOrder } from "@/api/orderService";
import { getAddressesAPI } from "@/api/addressApi";
import { toast } from "sonner";
import { Loader2, MapPin, CreditCard, ShoppingBag, Plus, AlertCircle, ChevronRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose
} from "@/components/ui/dialog";
import Header from "@/components/layout/user/Header";
import PromoBanner from "./PromoBanner";
import { useLocation } from "react-router-dom";
import axios from "axios"; // BẮT BUỘC IMPORT THÊM AXIOS

const CheckoutPage = () => {
    const navigate = useNavigate();
    const [cart, setCart] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [dataLoading, setDataLoading] = useState(true);
    const location = useLocation();
    const buyNowItem = location.state?.buyNowItem;
    const selectedItems = location.state?.selectedItems; // ✅ NEW   
    const [addresses, setAddresses] = useState<any[]>([]);
    const [selectedAddress, setSelectedAddress] = useState<any>(null);
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

    const [paymentMethod, setPaymentMethod] = useState("COD");

    useEffect(() => {
        const initData = async () => {
            try {
                setDataLoading(true);
    
                // ✅ 1. BUY NOW
                if (buyNowItem) {
                    setCart({
                        items: [
                            {
                                product: buyNowItem.product,
                                quantity: buyNowItem.quantity
                            }
                        ]
                    });
                }
    
                // ✅ 2. CHECKOUT TỪ CART (CHỈ ITEM ĐƯỢC CHỌN)
                else if (selectedItems && selectedItems.length > 0) {
                    setCart({
                        items: selectedItems
                    });
                }
    
                // ❌ 3. fallback (nếu user vào trực tiếp /checkout)
                else {
                    const cartData = await getCart();
                    if (cartData && cartData.items) {
                        cartData.items = cartData.items.filter((i: any) => i.product);
                        setCart(cartData);
                    }
                }
    
                // 👉 load address
                const addressList = await getAddressesAPI();
                if (Array.isArray(addressList)) {
                    setAddresses(addressList);
                    const defaultAddr = addressList.find((a: any) => a.isDefault);
                    setSelectedAddress(defaultAddr || addressList[0]);
                }
    
            } catch (e) {
                toast.error("Lỗi tải dữ liệu");
            } finally {
                setDataLoading(false);
            }
        };
    
        initData();
    }, []);

    const handlePlaceOrder = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!cart || cart.items.length === 0) return;

        if (!selectedAddress) {
            toast.error("Vui lòng chọn địa chỉ nhận hàng");
            return;
        }

        setLoading(true);

        try {
            const itemsPrice = cart.items.reduce(
                (acc: number, item: any) => acc + item.product.price * item.quantity,
                0
            );

            const shippingPrice = 30000;
            const totalPrice = itemsPrice + shippingPrice;

            const orderData = {
                orderItems: cart.items.map((item: any) => ({
                    product: item.product._id,
                    name: item.product.name,
                    image: item.product.images?.[0] || item.product.image,
                    price: item.product.price,
                    quantity: item.quantity
                })),
                shippingAddress: {
                    recipient_name: selectedAddress.recipientName,
                    address: selectedAddress.street,
                    city: selectedAddress.city,
                    phone: selectedAddress.phone,
                    country: "Vietnam"
                },
                paymentMethod,
                shippingPrice,
                totalPrice
            };

            // ✅ 1. Tạo đơn hàng
            const createdOrder = await createOrder(orderData);

            // 🔥 FIX CHẮC CHẮN lấy được orderId
            const orderId = createdOrder?._id || createdOrder?.data?._id;

            if (!orderId) {
                throw new Error("Không lấy được orderId");
            }

            // ✅ 2. COD
            if (paymentMethod === "COD") {
                toast.success("Đặt hàng thành công!");
                navigate("/orders");
                return;
            }

            // ✅ 3. PAYOS
            if (paymentMethod === "Banking") {
                toast.loading("Đang chuyển đến cổng thanh toán...");

                const res = await axios.post(
                    "http://localhost:5000/api/payment/create-payment-link",
                    {
                        amount: totalPrice,
                        description: `DH ${orderId}`,
                        orderId
                    }
                );

                if (!res.data || !res.data.checkoutUrl) {
                    throw new Error("Không tạo được link thanh toán");
                }

                // 🔥 Delay nhẹ cho UX mượt
                setTimeout(() => {
                    window.location.href = res.data.checkoutUrl;
                }, 1000);
            }

        } catch (error: any) {
            console.error("❌ Lỗi đặt hàng:", error);

            toast.dismiss();

            toast.error(
                error.response?.data?.message || error.message || "Đặt hàng thất bại"
            );
        } finally {
            setLoading(false);
        }
    };
    if (dataLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>;
    if (!cart) return <div className="h-screen flex items-center justify-center">Giỏ hàng trống</div>;

    return (
        <>
            <Header />
            <PromoBanner />
            <div className="container mx-auto px-4 py-8 max-w-6xl">
                <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <ShoppingBag className="w-6 h-6" /> Xác nhận thanh toán
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* CỘT TRÁI: THÔNG TIN */}
                    <div className="space-y-6">

                        {/* --- PHẦN 1: ĐỊA CHỈ (GIAO DIỆN MỚI) --- */}
                        <div className="bg-white p-6 rounded-xl border shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-semibold flex items-center gap-2 text-lg">
                                    <MapPin className="w-5 h-5 text-primary" /> Địa chỉ nhận hàng
                                </h3>
                            </div>

                            {addresses.length === 0 ? (
                                <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
                                    <p className="text-gray-500 mb-3">Chưa có địa chỉ nào.</p>
                                    <Button onClick={() => navigate("/addresses")} variant="outline" size="sm">
                                        <Plus className="w-4 h-4 mr-2" /> Thêm địa chỉ mới
                                    </Button>
                                </div>
                            ) : (
                                // Giao diện hiển thị 1 địa chỉ đang chọn + Nút thay đổi
                                <div className="flex items-start justify-between gap-4 p-4 border rounded-lg bg-gray-50/50">
                                    {selectedAddress ? (
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-bold text-gray-900">{selectedAddress.recipientName}</span>
                                                <span className="text-gray-500 text-sm">| {selectedAddress.phone}</span>
                                                {selectedAddress.isDefault && <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full font-bold">Mặc định</span>}
                                            </div>
                                            <p className="text-sm text-gray-600">{selectedAddress.street}, {selectedAddress.city}</p>
                                        </div>
                                    ) : (
                                        <p className="text-red-500 text-sm italic">Vui lòng chọn địa chỉ</p>
                                    )}

                                    <Dialog open={isAddressModalOpen} onOpenChange={setIsAddressModalOpen}>
                                        <DialogTrigger asChild>
                                            <Button variant="link" className="text-blue-600 h-auto p-0 font-semibold hover:text-blue-700">
                                                Thay đổi
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
                                            <DialogHeader>
                                                <DialogTitle>Chọn địa chỉ nhận hàng</DialogTitle>
                                            </DialogHeader>

                                            <div className="space-y-3 mt-2">
                                                {addresses.map((addr) => (
                                                    <div
                                                        key={addr._id}
                                                        onClick={() => {
                                                            setSelectedAddress(addr);
                                                            setIsAddressModalOpen(false); // Đóng modal sau khi chọn
                                                        }}
                                                        className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer hover:bg-gray-50 transition-all ${selectedAddress?._id === addr._id ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-gray-200"
                                                            }`}
                                                    >
                                                        <div className={`mt-1 w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${selectedAddress?._id === addr._id ? "border-primary" : "border-gray-400"
                                                            }`}>
                                                            {selectedAddress?._id === addr._id && <div className="w-2 h-2 rounded-full bg-primary"></div>}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-bold text-gray-900">{addr.recipientName}</span>
                                                                <span className="text-gray-500 text-sm">| {addr.phone}</span>
                                                                {addr.isDefault && <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full font-bold">Mặc định</span>}
                                                            </div>
                                                            <p className="text-sm text-gray-600 mt-1">{addr.street}, {addr.city}</p>
                                                        </div>
                                                        {selectedAddress?._id === addr._id && <Check className="w-5 h-5 text-primary" />}
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="mt-4 pt-4 border-t flex justify-end">
                                                <Button variant="outline" onClick={() => navigate("/addresses")} className="gap-2">
                                                    <Plus className="w-4 h-4" /> Thêm địa chỉ mới
                                                </Button>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            )}
                        </div>

                        {/* --- PHẦN 2: PHƯƠNG THỨC THANH TOÁN (Giữ nguyên) --- */}
                        <div className="bg-white p-6 rounded-xl border shadow-sm">
                            <h3 className="font-semibold mb-4 flex items-center gap-2 text-lg">
                                <CreditCard className="w-5 h-5 text-primary" /> Phương thức thanh toán
                            </h3>
                            <div className="space-y-3">
                                <label className={`flex items-center gap-3 border p-4 rounded-lg cursor-pointer transition-all ${paymentMethod === 'COD' ? 'border-primary bg-primary/5' : 'hover:bg-gray-50'}`}>
                                    <input type="radio" name="pay" value="COD" checked={paymentMethod === "COD"} onChange={() => setPaymentMethod("COD")} className="accent-primary w-4 h-4" />
                                    <span className="font-medium">Thanh toán khi nhận hàng (COD)</span>
                                </label>
                                <label className={`flex items-center gap-3 border p-4 rounded-lg cursor-pointer transition-all ${paymentMethod === 'Banking' ? 'border-primary bg-primary/5' : 'hover:bg-gray-50'}`}>
                                    <input type="radio" name="pay" value="Banking" checked={paymentMethod === "Banking"} onChange={() => setPaymentMethod("Banking")} className="accent-primary w-4 h-4" />
                                    <span className="font-medium">Chuyển khoản ngân hàng</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* CỘT PHẢI: TÓM TẮT ĐƠN HÀNG (Giữ nguyên) */}
                    <div className="bg-gray-50 p-6 rounded-xl h-fit border sticky top-24">
                        <h3 className="font-bold text-lg mb-4">Đơn hàng của bạn</h3>
                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar mb-6">
                            {cart.items.map((item: any) => (
                                <div key={item.product._id} className="flex gap-4 text-sm bg-white p-3 rounded-lg border border-gray-100">
                                    <img
                                        src={item.product.images?.[0] || "https://placehold.co/100"}
                                        className="w-16 h-16 object-cover rounded-md border"
                                        alt={item.product.name}
                                    />
                                    <div className="flex-1 flex flex-col justify-center">
                                        <p className="font-semibold text-gray-900 line-clamp-2">{item.product.name}</p>
                                        <p className="text-gray-500 mt-1">Số lượng: <span className="font-bold text-gray-900">x{item.quantity}</span></p>
                                    </div>
                                    <div className="flex items-center">
                                        <p className="font-bold text-primary">{(item.product.price * item.quantity).toLocaleString()}đ</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-gray-200 pt-4 space-y-3">
                            <div className="flex justify-between text-gray-600">
                                <span>Tạm tính</span>
                                <span>{cart.items.reduce((a: any, b: any) => a + b.product.price * b.quantity, 0).toLocaleString()}đ</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Phí vận chuyển</span>
                                <span>30.000đ</span>
                            </div>
                            <div className="h-[1px] bg-gray-200 my-1"></div>
                            <div className="flex justify-between text-xl font-bold items-center">
                                <span>Tổng thanh toán</span>
                                <span className="text-red-600">
                                    {(cart.items.reduce((a: any, b: any) => a + b.product.price * b.quantity, 0) + 30000).toLocaleString()}đ
                                </span>
                            </div>
                        </div>

                        <Button
                            onClick={handlePlaceOrder}
                            disabled={loading || !selectedAddress}
                            className="w-full mt-6 py-6 text-lg font-bold shadow-lg shadow-primary/25 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin mr-2" /> : "ĐẶT HÀNG NGAY"}
                        </Button>

                        {!selectedAddress && (
                            <p className="text-xs text-red-500 text-center mt-2">
                                * Vui lòng chọn địa chỉ nhận hàng để tiếp tục
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default CheckoutPage;