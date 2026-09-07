import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTransactionStore } from '@/stores/transactionStore';
import PageContainer from '@/components/layout/PageContainer';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { Search, ArrowUpRight, ShoppingCart, ReceiptText, Globe, Store } from 'lucide-react';

export default function TransactionHistoryPage() {
  const navigate = useNavigate();
  const { transactions } = useTransactionStore();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTransactions = transactions.filter(t => 
    t.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (t.cashierName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.onlineDetails?.orderNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.onlineDetails?.marketplace || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.onlineDetails?.customerName || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0 }).format(value);
  };

  return (
    <PageContainer 
      title="Riwayat Transaksi" 
      description="Daftar seluruh transaksi kasir yang tercatat di terminal POS (Offline & Online Marketplace)."
      actions={
        <button
          onClick={() => navigate('/pos')}
          className="h-10 px-4 rounded-xl bg-[#3755c3] hover:bg-[#2a429c] text-white text-[13px] font-semibold transition-all shadow-sm flex items-center gap-2"
        >
          <ShoppingCart size={18} />
          <span>Buka Terminal Kasir</span>
        </button>
      }
    >
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-[#eff4ff] bg-white flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#76777d]" size={18} />
            <input
              type="text"
              placeholder="Cari ID struk, kasir, marketplace, no pesanan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-[#eff4ff] text-[13px] text-[#0b1c30] placeholder-[#76777d] border border-transparent focus:outline-none focus:bg-white focus:border-[#3755c3]/30 focus:ring-2 focus:ring-[#3755c3]/15 transition-all"
            />
          </div>
          <div className="text-xs font-semibold text-[#76777d]">
            Total Transaksi: <strong className="text-[#0b1c30]">{transactions.length}</strong>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className="bg-[#eff4ff] text-[11px] font-bold text-[#76777d] uppercase tracking-wider">
                <th className="py-3.5 px-5">Waktu</th>
                <th className="py-3.5 px-5">No. Struk / Info Pesanan</th>
                <th className="py-3.5 px-5">Kasir</th>
                <th className="py-3.5 px-5">Metode</th>
                <th className="py-3.5 px-5 text-center">Item</th>
                <th className="py-3.5 px-5 text-right">Total Bayar</th>
                <th className="py-3.5 px-5 text-center">Status</th>
                <th className="py-3.5 px-5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eff4ff] text-[13px]">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((trx) => (
                  <tr key={trx.id} className="hover:bg-[#eff4ff]/40 transition-colors">
                    <td className="px-5 py-3.5 text-[#76777d]">
                      {format(new Date(trx.date || trx.createdAt || Date.now()), 'dd MMM yyyy, HH:mm', { locale: localeId })}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-[#3755c3]">{trx.id}</div>
                      {trx.transactionType === 'online' ? (
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#e0edff] text-[#173bab] border border-[#3755c3]/20">
                            <Globe size={10} />
                            <span>{trx.onlineDetails?.marketplace || 'Online'}</span>
                          </span>
                          {trx.onlineDetails?.orderNumber && (
                            <span className="text-[11px] text-[#76777d] font-mono">
                              #{trx.onlineDetails.orderNumber}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-[11px] text-[#76777d] mt-0.5">
                          <Store size={11} />
                          <span>Offline Toko</span>
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3.5 font-medium text-[#0b1c30]">{trx.cashierName}</td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-[#e5eeff] text-[#0b1c30] font-semibold text-[11px] uppercase">
                        {trx.paymentMethod}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center text-[#76777d]">
                      {trx.items.reduce((acc, item) => acc + item.quantity, 0)} pcs
                    </td>
                    <td className="px-5 py-3.5 text-right font-bold text-[#0b1c30]">
                      <span className="text-[11px] font-medium text-[#76777d] mr-1">Rp</span>
                      <span>{formatNumber(trx.total)}</span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-[#d3e4fe] text-[#3755c3] text-[11px] font-bold uppercase">
                        {trx.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button 
                        onClick={() => navigate(`/pos/receipt/${trx.id}`)}
                        className="text-[#3755c3] hover:text-[#173bab] hover:bg-[#eff4ff] px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase inline-flex items-center gap-1 transition-colors"
                      >
                        <span>Struk</span>
                        <ArrowUpRight size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-[#76777d]">
                    <ReceiptText size={40} className="mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-[#0b1c30]">Belum ada riwayat transaksi</p>
                    <p className="text-xs text-[#76777d] mt-1">Transaksi kasir akan muncul di sini setelah transaksi selesai.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PageContainer>
  );
}
