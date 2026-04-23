import { useEffect, useState } from "react";
import axios from "axios";
import { getAddressesAPI, createAddressAPI, deleteAddressAPI, updateAddressAPI } from "@/api/addressApi";
import Header from "@/components/layout/user/Header";
import PromoBanner from "./PromoBanner";
import { Button } from "@/components/ui/button";
import { Plus, MapPin, Trash2, Home, Building, Loader2, Edit } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const AddressBookPage = () => {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // --- STATE ĐỊA CHÍNH ---
  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);

  const [provinceId, setProvinceId] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [wardId, setWardId] = useState("");

  const [isDistrictsLoading, setIsDistrictsLoading] = useState(false);
  const [isWardsLoading, setIsWardsLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "Nhà riêng",
    recipientName: "",
    phone: "",
    street: "",
    city: "",
    isDefault: false
  });

  // --- HÀM HIỂN THỊ ĐỊA CHỈ THÔNG MINH (FIX LỖI HIỂN THỊ) ---
  const formatDisplayAddress = (street: string, city: string) => {
    const s = (street || "").trim();
    const c = (city || "").trim();

    // Nếu không có tên đường, trả về thành phố
    if (!s) return c;
    // Nếu không có thành phố, trả về tên đường
    if (!c) return s;

    // Nếu trong thành phố đã chứa tên đường (Data cũ) -> Trả về thành phố
    if (c.toLowerCase().includes(s.toLowerCase())) {
      return c;
    }

    // Nếu Data chuẩn (Tách biệt) -> Ghép lại
    return `${s}, ${c}`;
  };

  // --- API CALLS ---
  const loadAddresses = async () => {
    try {
      setLoading(true);
      const data = await getAddressesAPI();
      setAddresses(Array.isArray(data) ? data : []);
    } catch (error) {
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAddresses();

    axios.get("https://provinces.open-api.vn/api/v1/?depth=2")
      .then(res => {
        setProvinces(res.data || []);
      })
      .catch(err => console.error(err));
  }, []);

  // --- LOGIC ĐỊA CHÍNH ---
  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    setProvinceId(code);
    setDistrictId("");
    setWardId("");
    setWards([]);

    const selectedProvince = provinces.find(p => p.code == code);
    setDistricts(selectedProvince?.districts || []);
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    setDistrictId(code);
    setWardId("");

    const selectedDistrict = districts.find(d => d.code == code);
    setWards(selectedDistrict?.wards || []);
  };

  // --- XỬ LÝ SỰ KIỆN ---
  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({ name: "Nhà riêng", recipientName: "", phone: "", street: "", city: "", isDefault: false });
    setProvinceId(""); setDistrictId(""); setWardId("");
    setIsModalOpen(true);
  };

  const handleEdit = (addr: any) => {
    setEditingId(addr._id);
    setFormData({
      name: addr.name,
      recipientName: addr.recipientName,
      phone: addr.phone,
      street: addr.street,
      city: addr.city,
      isDefault: addr.isDefault
    });
    setProvinceId(""); setDistrictId(""); setWardId("");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let fullCity = formData.city;

    // Nếu có chọn địa điểm từ dropdown -> Cập nhật city mới (Không kèm street)
    if (provinceId && districtId && wardId) {
      const pName = provinces.find(p => p.code == provinceId)?.name || "";
      const dName = districts.find(d => d.code == districtId)?.name || "";
      const wName = wards.find(w => w.code == wardId)?.name || "";
    
      fullCity = `${wName}, ${dName}, ${pName}`;
    }

    // Gửi street riêng, city riêng để Backend xử lý
    const submitData = {
      ...formData,
      street: formData.street,
      city: fullCity,
    };

    try {
      if (editingId) {
        await updateAddressAPI(editingId, submitData);
        toast.success("Cập nhật thành công");
      } else {
        await createAddressAPI(submitData);
        toast.success("Thêm mới thành công");
      }

      setIsModalOpen(false);
      loadAddresses();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await updateAddressAPI(id, { isDefault: true });
      toast.success("Đã đặt làm địa chỉ mặc định");
      loadAddresses();
    } catch (error) {
      toast.error("Lỗi cập nhật");
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa địa chỉ này?")) return;
    try {
      await deleteAddressAPI(id);
      toast.success("Đã xóa");
      loadAddresses();
    } catch (error) {
      toast.error("Lỗi xóa");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <PromoBanner />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sổ địa chỉ</h1>
            <p className="text-gray-500 text-sm">Quản lý địa chỉ nhận hàng</p>
          </div>

          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" onClick={handleOpenAdd}>
                <Plus className="w-4 h-4" /> Thêm địa chỉ mới
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingId ? "Cập nhật địa chỉ" : "Thêm địa chỉ mới"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Loại địa chỉ</label>
                  <div className="flex gap-4">
                    <label className={`flex items-center gap-2 cursor-pointer border p-2 rounded w-full justify-center transition-colors ${formData.name === "Nhà riêng" ? "border-primary bg-primary/5" : "hover:bg-gray-50"}`}>
                      <input type="radio" name="type" className="hidden" checked={formData.name === "Nhà riêng"} onChange={() => setFormData({ ...formData, name: "Nhà riêng" })} />
                      <Home className="w-4 h-4" /> Nhà riêng
                    </label>
                    <label className={`flex items-center gap-2 cursor-pointer border p-2 rounded w-full justify-center transition-colors ${formData.name === "Văn phòng" ? "border-primary bg-primary/5" : "hover:bg-gray-50"}`}>
                      <input type="radio" name="type" className="hidden" checked={formData.name === "Văn phòng"} onChange={() => setFormData({ ...formData, name: "Văn phòng" })} />
                      <Building className="w-4 h-4" /> Văn phòng
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Tên người nhận</label>
                    <input className="w-full border p-2 rounded mt-1 text-sm focus:outline-primary" required value={formData.recipientName} onChange={e => setFormData({ ...formData, recipientName: e.target.value })} placeholder="Nguyễn Văn A" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Số điện thoại</label>
                    <input className="w-full border p-2 rounded mt-1 text-sm focus:outline-primary" required value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="09xxxxxxxx" />
                  </div>
                </div>

                <div className="space-y-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <p className="text-sm font-semibold text-gray-700">
                    Khu vực vận chuyển
                    {editingId && <span className="text-xs font-normal text-red-500 ml-1">(Chọn lại nếu muốn thay đổi)</span>}
                  </p>

                  <div>
                    <select className="w-full border p-2 rounded text-sm bg-white focus:outline-primary" value={provinceId} onChange={handleProvinceChange} required={!editingId}>
                      <option value="">-- Chọn Tỉnh / Thành phố --</option>
                      {provinces.map((p: any) => (
                        <option key={p.code} value={p.code}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <select className="w-full border p-2 rounded text-sm bg-white focus:outline-primary disabled:bg-gray-100" value={districtId} onChange={handleDistrictChange} disabled={!provinceId} required={!editingId}>
                      <option value="">{isDistrictsLoading ? "Đang tải..." : "-- Chọn Quận / Huyện --"}</option>
                      {districts.map((d: any) => (
                        <option key={d.code} value={d.code}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <select className="w-full border p-2 rounded text-sm bg-white focus:outline-primary disabled:bg-gray-100" value={wardId} onChange={(e) => setWardId(e.target.value)} disabled={!districtId} required={!editingId}>
                      <option value="">{isWardsLoading ? "Đang tải..." : "-- Chọn Phường / Xã --"}</option>
                      {wards.map((w: any) => (
                        <option key={w.code} value={w.code}>
                          {w.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Địa chỉ cụ thể</label>
                  <input className="w-full border p-2 rounded mt-1 text-sm focus:outline-primary" placeholder="Số nhà, tên đường..." required value={formData.street} onChange={e => setFormData({ ...formData, street: e.target.value })} />
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="accent-primary w-4 h-4" checked={formData.isDefault} onChange={e => setFormData({ ...formData, isDefault: e.target.checked })} />
                  <span className="text-sm text-gray-600">Đặt làm địa chỉ mặc định</span>
                </label>

                <Button type="submit" className="w-full font-bold">
                  {editingId ? "Cập nhật" : "Lưu địa chỉ"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.isArray(addresses) && addresses.map((addr) => (
              <div key={addr._id} className={`bg-white p-5 rounded-xl border shadow-sm relative group transition-colors ${addr.isDefault ? 'border-primary bg-blue-50/20' : 'border-gray-200 hover:border-primary/50'}`}>

                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900">{addr.recipientName}</span>
                    {addr.isDefault && <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">Mặc định</span>}
                  </div>

                  <div className="flex items-center gap-1">
                    <button onClick={() => handleEdit(addr)} className="text-gray-400 hover:text-blue-600 p-1 transition-colors" title="Sửa">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(addr._id)} className="text-gray-400 hover:text-red-600 p-1 transition-colors" title="Xóa">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-sm text-gray-500 mb-1">{addr.phone}</p>
                <div className="flex items-start gap-2 text-sm text-gray-600 mt-2">
                  <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-primary" />

                  {/* 👇 ĐÃ SỬA: Dùng hàm formatDisplayAddress để hiển thị cả Street + City */}
                  <span>{formatDisplayAddress(addr.street, addr.city)}</span>
                </div>

                <div className="mt-3 pt-3 border-t flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2 text-gray-400">
                    {addr.name === "Nhà riêng" ? <Home className="w-3 h-3" /> : <Building className="w-3 h-3" />}
                    {addr.name}
                  </div>

                  {!addr.isDefault && (
                    <button
                      onClick={() => handleSetDefault(addr._id)}
                      className="text-primary hover:underline font-medium flex items-center gap-1"
                    >
                      Thiết lập mặc định
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default AddressBookPage;