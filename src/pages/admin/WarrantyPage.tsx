import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Plus, Search, Wrench, CheckCircle, Clock, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { getTicketsAPI, createTicketAPI, updateTicketStatusAPI } from '@/api/warranty';
// Map trạng thái sang tiếng Việt và màu sắc
const STATUS_MAP = {
    'RECEIVED': { label: 'Mới tiếp nhận', color: 'bg-gray-100 text-gray-800' },
    'CHECKING': { label: 'Đang kiểm tra', color: 'bg-blue-100 text-blue-800' },
    'WAITING_PARTS': { label: 'Chờ linh kiện', color: 'bg-yellow-100 text-yellow-800' },
    'FIXING': { label: 'Đang sửa', color: 'bg-purple-100 text-purple-800' },
    'DONE': { label: 'Đã xong', color: 'bg-green-100 text-green-800' },
    'RETURNED': { label: 'Đã trả khách', color: 'bg-gray-200 text-gray-500 line-through' },
};

const WarrantyPage = () => {
    const [tickets, setTickets] = useState([]);
    const [keyword, setKeyword] = useState('');
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    // Form data
    const [newTicket, setNewTicket] = useState({
        customerName: '', customerPhone: '', productName: '', issue: ''
    });

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            
            const data = await getTicketsAPI(keyword);
            if (Array.isArray(data)){
                setTickets(data);
            }
            else {
                console.log('Dữ liệu API trả về', data);
                setTickets([])
            }
        } catch (error) {
            console.error(error);
            setTickets([])
        }
    };

    const handleCreate = async () => {
        try {
            await createTicketAPI({
                customer: { name: newTicket.customerName, phone: newTicket.customerPhone },
                product: { name: newTicket.productName },
                issueDescription: newTicket.issue
            });
            setIsCreateOpen(false);
            fetchTickets();
            alert("Đã tạo phiếu tiếp nhận!");
        } catch (error) {
            alert("Lỗi tạo phiếu");
        }
    };

    const handleUpdateStatus = async (id: string, status: string) => {
        try {
            await updateTicketStatusAPI(id, {status});
            fetchTickets();
        } catch (error) {
            alert("Lỗi cập nhật");
        }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <Wrench className="w-6 h-6" /> Quản lý Bảo hành & Sửa chữa
                </h1>

                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                            <Plus className="w-4 h-4" /> Tiếp nhận máy mới
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader><DialogTitle>Tiếp nhận bảo hành</DialogTitle></DialogHeader>
                        <div className="space-y-4 mt-2">
                            <input className="w-full border p-2 rounded" placeholder="Tên khách hàng"
                                onChange={e => setNewTicket({ ...newTicket, customerName: e.target.value })} />
                            <input className="w-full border p-2 rounded" placeholder="Số điện thoại"
                                onChange={e => setNewTicket({ ...newTicket, customerPhone: e.target.value })} />
                            <input className="w-full border p-2 rounded" placeholder="Tên thiết bị (VD: Laptop Dell...)"
                                onChange={e => setNewTicket({ ...newTicket, productName: e.target.value })} />
                            <textarea className="w-full border p-2 rounded" placeholder="Mô tả lỗi (VD: Không lên nguồn...)"
                                onChange={e => setNewTicket({ ...newTicket, issue: e.target.value })} />
                            <Button onClick={handleCreate} className="w-full">Lưu phiếu</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Search Bar */}
            <div className="bg-white p-4 rounded-lg shadow-sm mb-4 flex gap-2">
                <input
                    className="flex-1 border p-2 rounded"
                    placeholder="Tìm theo Mã phiếu, SĐT hoặc Tên khách..."
                    value={keyword}
                    onChange={e => setKeyword(e.target.value)}
                />
                <Button variant="outline" onClick={fetchTickets}><Search className="w-4 h-4" /></Button>
            </div>

            {/* Ticket List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tickets.map(ticket => (
                    <div key={ticket._id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                            <span className="font-mono text-xs font-bold bg-gray-100 px-2 py-1 rounded text-gray-600">
                                {ticket.code}
                            </span>
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${STATUS_MAP[ticket.status]?.color}`}>
                                {STATUS_MAP[ticket.status]?.label}
                            </span>
                        </div>

                        <h3 className="font-bold text-lg text-gray-900 mb-1">{ticket.product.name}</h3>
                        <p className="text-red-500 text-sm font-medium mb-2">⚠ Lỗi: {ticket.issueDescription}</p>

                        <div className="text-sm text-gray-500 mb-4 space-y-1 border-t pt-2 mt-2">
                            <p className="flex items-center gap-2"><Clock className="w-3 h-3" /> {new Date(ticket.createdAt).toLocaleDateString('vi-VN')}</p>
                            <p className="font-medium text-gray-700">Khách: {ticket.customer.name} - {ticket.customer.phone}</p>
                            {ticket.technician && <p className="text-blue-600">KTV: {ticket.technician.name}</p>}
                        </div>

                        {/* Quick Actions */}
                        <div className="flex gap-2 mt-auto">
                            {ticket.status === 'REQUESTED' && (
                                <div className="flex w-full gap-2">
                                    <Button size="sm" variant="outline" className="flex-1 text-red-600 border-red-200"
                                        onClick={() => handleUpdateStatus(ticket._id, 'CANCELLED')}>
                                        Hủy bỏ
                                    </Button>
                                    <Button size="sm" className="flex-1 bg-blue-600 text-white"
                                        onClick={() => handleUpdateStatus(ticket._id, 'RECEIVED')}>
                                        Tiếp nhận máy
                                    </Button>
                                </div>
                            )}
                            {ticket.status === 'RECEIVED' && (
                                <Button size="sm" variant="outline" className="flex-1 text-blue-600 border-blue-200"
                                    onClick={() => handleUpdateStatus(ticket._id, 'CHECKING')}>
                                    Bắt đầu kiểm tra
                                </Button>
                            )}
                            {ticket.status === 'CHECKING' && (
                                <Button size="sm" variant="outline" className="flex-1 text-purple-600 border-purple-200"
                                    onClick={() => handleUpdateStatus(ticket._id, 'FIXING')}>
                                    Tiến hành sửa
                                </Button>
                            )}
                            {ticket.status === 'FIXING' && (
                                <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                    onClick={() => handleUpdateStatus(ticket._id, 'DONE')}>
                                    <CheckCircle className="w-4 h-4 mr-1" /> Hoàn thành
                                </Button>
                            )}
                            {ticket.status === 'DONE' && (
                                <Button size="sm" variant="secondary" className="flex-1"
                                    onClick={() => handleUpdateStatus(ticket._id, 'RETURNED')}>
                                    Trả máy khách
                                </Button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default WarrantyPage;