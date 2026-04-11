import React, { useState, useEffect } from 'react';
import Header from "@/components/layout/user/Header";
import { Button } from "@/components/ui/button";
import { Wrench, Plus, AlertCircle, X } from "lucide-react";
import { toast } from "sonner";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";

import {
    getMyTicketsAPI,
    createWarrantyRequestAPI,
    uploadImageAPI,
    fetchMyProductsAPI
} from '@/api/warranty';

const WarrantyRequestPage = () => {
    const [myTickets, setMyTickets] = useState<any[]>([]);
    const [myProducts, setMyProducts] = useState<any[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    const [mode, setMode] = useState<"SYSTEM" | "MANUAL">("SYSTEM");

    const [images, setImages] = useState<string[]>([]);
    const [loadingUpload, setLoadingUpload] = useState(false);
    const [loadingProducts, setLoadingProducts] = useState(false);

    const [selectedProductId, setSelectedProductId] = useState("");

    const [form, setForm] = useState({
        productName: '',
        serialNumber: '',
        phone: '',
        issueDescription: ''
    });

    // ================= FETCH =================
    useEffect(() => {
        fetchMyTickets();
        fetchMyProducts();
    }, []);

    const fetchMyTickets = async () => {
        try {
            const data = await getMyTicketsAPI();
            setMyTickets(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchMyProducts = async () => {
        try {
            setLoadingProducts(true);
            const data = await fetchMyProductsAPI();
            setMyProducts(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
            setMyProducts([]);
        } finally {
            setLoadingProducts(false);
        }
    };

    // ================= UPLOAD IMAGE =================
    const handleUpload = async (e: any) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;

        setLoadingUpload(true);

        try {
            const uploaded: string[] = [];

            for (const file of files as File[]) {
                const url = await uploadImageAPI(file);
                uploaded.push(url);
            }

            setImages(prev => [...prev, ...uploaded]);
        } catch (err) {
            toast.error("Upload ảnh thất bại");
        } finally {
            setLoadingUpload(false);
        }
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    // ================= SUBMIT =================
    const handleSubmit = async (e: any) => {
        e.preventDefault();

        if (!form.productName) {
            toast.error("Vui lòng nhập tên sản phẩm");
            return;
        }

        try {
            await createWarrantyRequestAPI({
                ...form,
                images
            });

            toast.success("Gửi yêu cầu thành công!");

            // RESET
            setForm({
                productName: '',
                serialNumber: '',
                phone: '',
                issueDescription: ''
            });
            setImages([]);
            setSelectedProductId("");
            setIsOpen(false);

            fetchMyTickets();

        } catch (error) {
            toast.error("Lỗi gửi yêu cầu");
        }
    };

    // ================= STATUS =================
    const getStatusBadge = (status: string) => {
        const map: any = {
            REQUESTED: 'bg-yellow-100 text-yellow-800',
            RECEIVED: 'bg-blue-100 text-blue-800',
            FIXING: 'bg-purple-100 text-purple-800',
            DONE: 'bg-green-100 text-green-800',
            CANCELLED: 'bg-red-100 text-red-800',
        };

        const label: any = {
            REQUESTED: 'Chờ duyệt',
            RECEIVED: 'Đã nhận',
            FIXING: 'Đang sửa',
            DONE: 'Hoàn tất',
            CANCELLED: 'Đã hủy',
        };

        return (
            <span className={`px-2 py-1 rounded text-xs font-bold ${map[status]}`}>
                {label[status]}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <div className="container mx-auto px-4 py-8 max-w-4xl">

                {/* HEADER */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold">Bảo hành & Sửa chữa</h1>
                        <p className="text-gray-500 text-sm">Theo dõi tiến độ sửa chữa</p>
                    </div>

                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-blue-600 hover:bg-blue-700">
                                <Plus className="w-4 h-4 mr-2" />
                                Gửi yêu cầu
                            </Button>
                        </DialogTrigger>

                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Gửi yêu cầu bảo hành</DialogTitle>
                            </DialogHeader>

                            {/* MODE SWITCH */}
                            <div className="flex gap-4 mt-2">
                                <button
                                    type="button"
                                    onClick={() => setMode("SYSTEM")}
                                    className={mode === "SYSTEM" ? "font-bold text-blue-600" : ""}
                                >
                                    Đã mua
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setMode("MANUAL")}
                                    className={mode === "MANUAL" ? "font-bold text-blue-600" : ""}
                                >
                                    Bên ngoài
                                </button>
                            </div>

                            {/* FORM */}
                            <form onSubmit={handleSubmit} className="space-y-4 mt-4">

                                {/* SYSTEM */}
                                {mode === "SYSTEM" && (
                                    <select
                                        value={selectedProductId}
                                        onChange={(e) => {
                                            const id = e.target.value;
                                            setSelectedProductId(id);

                                            const selected = myProducts.find(p => p._id === id);

                                            setForm(prev => ({
                                                ...prev,
                                                productName: selected?.name || '',
                                                serialNumber: selected?.imei || ''
                                            }));
                                        }}
                                        className="w-full border p-2 rounded"
                                        required
                                    >
                                        <option value="">
                                            {loadingProducts ? "Đang tải..." : "-- Chọn sản phẩm --"}
                                        </option>

                                        {myProducts.map((p) => (
                                            <option key={p._id} value={p._id}>
                                                {p.name} - IMEI: {p.imei}
                                            </option>
                                        ))}
                                    </select>
                                )}

                                {/* MANUAL */}
                                {mode === "MANUAL" && (
                                    <>
                                        <input
                                            className="w-full border p-2 rounded"
                                            placeholder="Tên thiết bị"
                                            value={form.productName}
                                            onChange={e => setForm({ ...form, productName: e.target.value })}
                                            required
                                        />
                                        <input
                                            className="w-full border p-2 rounded"
                                            placeholder="IMEI / Serial"
                                            value={form.serialNumber}
                                            onChange={e => setForm({ ...form, serialNumber: e.target.value })}
                                        />
                                    </>
                                )}

                                {/* PHONE */}
                                <input
                                    className="w-full border p-2 rounded"
                                    placeholder="SĐT"
                                    value={form.phone}
                                    onChange={e => setForm({ ...form, phone: e.target.value })}
                                    required
                                />

                                {/* ISSUE */}
                                <textarea
                                    className="w-full border p-2 rounded h-24"
                                    placeholder="Mô tả lỗi"
                                    value={form.issueDescription}
                                    onChange={e => setForm({ ...form, issueDescription: e.target.value })}
                                    required
                                />

                                {/* UPLOAD */}
                                <input type="file" multiple onChange={handleUpload} />

                                {loadingUpload && <p>Đang upload...</p>}

                                <div className="flex gap-2 flex-wrap">
                                    {images.map((img, i) => (
                                        <div key={i} className="relative">
                                            <img src={img} className="w-16 h-16 rounded object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(i)}
                                                className="absolute top-0 right-0 bg-black text-white rounded-full p-1"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <Button type="submit" className="w-full">
                                    Gửi yêu cầu
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* LIST */}
                <div className="space-y-4">
                    {myTickets.length === 0 ? (
                        <div className="text-center py-10 bg-white rounded">
                            <Wrench className="w-10 h-10 mx-auto text-gray-300" />
                            <p className="text-gray-500">Chưa có yêu cầu</p>
                        </div>
                    ) : (
                        myTickets.map(ticket => (
                            <div key={ticket._id} className="bg-white p-4 rounded border">
                                <div className="flex justify-between">
                                    <div>
                                        <b>{ticket.product.name}</b>
                                        <div className="text-xs text-gray-400">#{ticket.code}</div>
                                    </div>
                                    {getStatusBadge(ticket.status)}
                                </div>

                                <div className="bg-red-50 p-2 mt-2 rounded flex gap-2">
                                    <AlertCircle className="w-4 h-4 text-red-500" />
                                    <span>{ticket.issueDescription}</span>
                                </div>

                                {ticket.images?.length > 0 && (
                                    <div className="flex gap-2 mt-2">
                                        {ticket.images.map((img: string, i: number) => (
                                            <img key={i} src={img} className="w-14 h-14 rounded object-cover" />
                                        ))}
                                    </div>
                                )}

                                <div className="text-xs text-gray-400 mt-2 text-right">
                                    {new Date(ticket.createdAt).toLocaleDateString("vi-VN")}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default WarrantyRequestPage;