import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTransactionStore } from '@/stores/transactionStore';
import PageContainer from '@/components/layout/PageContainer';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { 
  Search, 
  ArrowUpRight, 
  ShoppingCart, 
  ReceiptText, 
  Globe, 
  Store, 
  Clock, 
  CheckCircle2, 
  CheckCircle,
  TrendingUp,
  AlertCircle,
  ShoppingBag,
  DollarSign,
  Pencil,
  Percent
} from 'lucide-react';
import type { Transaction } from '@/types';
import EditTransactionModal from '@/features/pos/components/EditTransactionModal';

export default function SalesListPage() {
  const navigate = useNavigate();
  const { transactions, updateTransactionPaymentStatus } = useTransactionStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'offline' | 'online' | 'pending' | 'lunas'>('all');
  const [confirmModalId, setConfirmModalId] = useState<string | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0 }).format(value);
  };

  // Metrics summary
  const metrics = useMemo(() => {
    let totalSales = 0;
    let offlineCount = 0;
    let offlineTotal = 0;
    let onlineCount = 0;
    let onlineTotal = 0;
    let pendingCount = 0;
    let pendingTotal = 0;

    transactions.forEach(t => {
      totalSales += t.total || 0;
      if (t.transactionType === 'online') {
        onlineCount++;
        onlineTotal += t.total || 0;
      } else {
        offlineCount++;
        offlineTotal += t.total || 0;
      }

      const isPending = t.paymentTiming === 'tertunda' || t.paymentStatus === 'tertunda' || t.status === 'pending';
      if (isPending) {
        pendingCount++;
        pendingTotal += t.total || 0;
      }
    });

    return {
      totalSales,
      offlineCount,
      offlineTotal,
      onlineCount,
      onlineTotal,
      pendingCount,
      pendingTotal
    };
  }, [transactions]);

  // Filtering transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      // Tab filter
      const isPending = t.paymentTiming === 'tertunda' || t.paymentStatus === 'tertunda' || t.status === 'pending';
      if (activeTab === 'offline' && t.transactionType === 'online') return false;
      if (activeTab === 'online' && t.transactionType !== 'online') return false;
      if (activeTab === 'pending' && !isPending) return false;
      if (activeTab === 'lunas' && isPending) return false;

      // Search filter
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        t.id.toLowerCase().includes(term) ||
        (t.cashierName || '').toLowerCase().includes(term) ||
        (t.onlineDetails?.orderNumber || '').toLowerCase().includes(term) ||
        (t.onlineDetails?.trackingNumber || '').toLowerCase().includes(term) ||
        (t.onlineDetails?.marketplace || '').toLowerCase().includes(term) ||
        (t.onlineDetails?.storeName || '').toLowerCase().includes(term) ||
        (t.onlineDetails?.customerName || '').toLowerCase().includes(term)
      );
    });
  }, [transactions, activeTab, searchTerm]);

  const handleMarkAsPaid = (id: string) => {
    updateTransactionPaymentStatus(id, 'lunas', 'success');
    setConfirmModalId(null);
    showToast('Transaksi berhasil ditandai Lunas!');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  return (
    <PageContainer 
      title="List Penjualan (Sales)" 
      description="Daftar dan pantau seluruh transaksi penjualan toko offline dan pesanan online marketplace."
      actions={
        <button
          onClick={() => navigate('/pos')}
          className="h-10 px-4 rounded-xl bg-[#254222] hover:bg-[#1b3119] text-[#ece2b1] text-[13px] font-bold transition-all shadow-sm flex items-center gap-2"
        >
          <ShoppingCart size={18} />
          <span>Buka Terminal Kasir</span>
        </button>
      }
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-[#254222] text-[#ece2b1] px-4 py-3 rounded-xl shadow-lg flex items-center gap-2.5 animate-in fade-in slide-in-from-top-4 border border-[#cae4c5]/30 text-xs font-semibold">
          <CheckCircle2 size={16} className="text-[#99cc66]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Penjualan */}
        <div className="bg-white p-5 rounded-2xl border border-[#cae4c5]/60 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#cae4c5]/30 text-[#254222] flex items-center justify-center shrink-0">
            <TrendingUp size={24} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-[#76777d] uppercase tracking-wider">Total Penjualan</p>
            <h3 className="text-xl font-black text-[#254222] truncate">
              Rp {formatNumber(metrics.totalSales)}
            </h3>
            <p className="text-[11px] text-[#76777d] mt-0.5">{transactions.length} transaksi tercatat</p>
          </div>
        </div>

        {/* Offline Toko */}
        <div className="bg-white p-5 rounded-2xl border border-[#cae4c5]/60 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#cae4c5]/25 text-[#254222] flex items-center justify-center shrink-0">
            <Store size={24} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-[#76777d] uppercase tracking-wider">Offline Toko</p>
            <h3 className="text-xl font-black text-[#254222] truncate">
              Rp {formatNumber(metrics.offlineTotal)}
            </h3>
            <p className="text-[11px] text-[#76777d] mt-0.5">{metrics.offlineCount} transaksi kasir</p>
          </div>
        </div>

        {/* Online Marketplace */}
        <div className="bg-white p-5 rounded-2xl border border-[#cae4c5]/60 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#cae4c5]/40 text-[#254222] flex items-center justify-center shrink-0">
            <Globe size={24} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-[#76777d] uppercase tracking-wider">Online Marketplace</p>
            <h3 className="text-xl font-black text-[#254222] truncate">
              Rp {formatNumber(metrics.onlineTotal)}
            </h3>
            <p className="text-[11px] text-[#76777d] mt-0.5">{metrics.onlineCount} pesanan marketplace</p>
          </div>
        </div>

        {/* Pembayaran Tertunda */}
        <div className="bg-white p-5 rounded-2xl border border-[#cae4c5]/60 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#ece2b1]/40 text-[#254222] flex items-center justify-center shrink-0">
            <Clock size={24} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-[#76777d] uppercase tracking-wider">Pembayaran Tertunda</p>
            <h3 className="text-xl font-black text-[#254222] truncate">
              Rp {formatNumber(metrics.pendingTotal)}
            </h3>
            <p className="text-[11px] text-[#76777d] mt-0.5">{metrics.pendingCount} transaksi belum cair</p>
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#cae4c5]/60 overflow-hidden flex flex-col">
        {/* Tabs & Search Toolbar */}
        <div className="p-4 border-b border-[#cae4c5]/40 bg-white flex flex-col md:flex-row gap-4 justify-between items-center">
          {/* Segmented Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-[#cae4c5]/30 rounded-xl overflow-x-auto max-w-full">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'all'
                  ? 'bg-[#254222] text-[#ece2b1] shadow-sm'
                  : 'text-[#254222]/70 hover:text-[#254222]'
              }`}
            >
              Semua ({transactions.length})
            </button>
            <button
              onClick={() => setActiveTab('offline')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'offline'
                  ? 'bg-[#254222] text-[#ece2b1] shadow-sm'
                  : 'text-[#254222]/70 hover:text-[#254222]'
              }`}
            >
              <Store size={13} />
              <span>Offline Toko ({metrics.offlineCount})</span>
            </button>
            <button
              onClick={() => setActiveTab('online')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'online'
                  ? 'bg-[#254222] text-[#ece2b1] shadow-sm'
                  : 'text-[#254222]/70 hover:text-[#254222]'
              }`}
            >
              <Globe size={13} />
              <span>Online Marketplace ({metrics.onlineCount})</span>
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'pending'
                  ? 'bg-[#ece2b1] text-[#254222] shadow-sm'
                  : 'text-[#254222]/70 hover:text-[#254222]'
              }`}
            >
              <Clock size={13} />
              <span>Tertunda ({metrics.pendingCount})</span>
            </button>
            <button
              onClick={() => setActiveTab('lunas')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'lunas'
                  ? 'bg-[#99cc66] text-[#254222] shadow-sm'
                  : 'text-[#254222]/70 hover:text-[#254222]'
              }`}
            >
              <CheckCircle size={13} />
              <span>Lunas</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#76777d]" size={16} />
            <input
              type="text"
              placeholder="Cari struk, kasir, marketplace, resi, pembeli..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pl-9 pr-4 rounded-xl bg-[#cae4c5]/25 text-xs text-[#254222] placeholder-[#76777d] border border-[#cae4c5]/50 focus:outline-none focus:bg-white focus:border-[#99cc66] focus:ring-2 focus:ring-[#99cc66]/20 transition-all"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className="bg-[#cae4c5]/30 text-[11px] font-bold text-[#254222] uppercase tracking-wider">
                <th className="py-3.5 px-5">Waktu</th>
                <th className="py-3.5 px-5">No. Struk / Info Pesanan</th>
                <th className="py-3.5 px-5">Kasir</th>
                <th className="py-3.5 px-5">Metode Bayar</th>
                <th className="py-3.5 px-5 text-center">Item</th>
                <th className="py-3.5 px-5 text-right">Potongan MP</th>
                <th className="py-3.5 px-5 text-center">% Potongan</th>
                <th className="py-3.5 px-5 text-right">Total Bersih</th>
                <th className="py-3.5 px-5 text-center">Status Pembayaran</th>
                <th className="py-3.5 px-5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#cae4c5]/30 text-[13px]">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((trx) => {
                  const isPending = trx.paymentTiming === 'tertunda' || trx.paymentStatus === 'tertunda' || trx.status === 'pending';
                  const feePercentage = trx.subtotal > 0 && (trx.marketplaceFee || 0) > 0
                    ? ((trx.marketplaceFee! / trx.subtotal) * 100).toFixed(1)
                    : null;

                  return (
                    <tr key={trx.id} className="hover:bg-[#cae4c5]/15 transition-colors">
                      {/* Waktu */}
                      <td className="px-5 py-3.5 text-[#76777d]">
                        {format(new Date(trx.date || trx.createdAt || Date.now()), 'dd MMM yyyy, HH:mm', { locale: localeId })}
                      </td>

                      {/* No Struk & Order Details */}
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-[#254222]">{trx.id}</div>
                        {trx.transactionType === 'online' ? (
                          <div className="flex flex-col gap-0.5 mt-0.5">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#cae4c5] text-[#254222] border border-[#cae4c5]">
                                <Globe size={10} />
                                <span>{trx.onlineDetails?.marketplace || 'Online'}</span>
                              </span>
                              {trx.onlineDetails?.orderNumber && (
                                <span className="text-[11px] text-[#254222] font-mono font-bold">
                                  #{trx.onlineDetails.orderNumber}
                                </span>
                              )}
                            </div>
                            {trx.onlineDetails?.customerName && (
                              <span className="text-[11px] text-[#76777d]">
                                Pembeli: {trx.onlineDetails.customerName}
                                {trx.onlineDetails.trackingNumber && ` | Resi: ${trx.onlineDetails.trackingNumber}`}
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

                      {/* Kasir */}
                      <td className="px-5 py-3.5 font-semibold text-[#254222]">{trx.cashierName}</td>

                      {/* Metode Bayar */}
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-[#cae4c5]/40 text-[#254222] font-bold text-[11px] uppercase">
                          {trx.paymentMethod}
                        </span>
                      </td>

                      {/* Item */}
                      <td className="px-5 py-3.5 text-center text-[#76777d]">
                        {trx.items.reduce((acc, item) => acc + item.quantity, 0)} pcs
                      </td>

                      {/* Potongan Marketplace */}
                      <td className="px-5 py-3.5 text-right font-medium">
                        {(trx.marketplaceFee || 0) > 0 ? (
                          <span className="text-[#ba1a1a] font-semibold">
                            -Rp {formatNumber(trx.marketplaceFee || 0)}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">-</span>
                        )}
                      </td>

                      {/* % Potongan Marketplace */}
                      <td className="px-5 py-3.5 text-center font-bold">
                        {feePercentage ? (
                          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[11px] font-black bg-[#ffdad6] text-[#ba1a1a] border border-[#ffb4ab]">
                            {feePercentage}%
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">-</span>
                        )}
                      </td>

                      {/* Total Tagihan */}
                      <td className="px-5 py-3.5 text-right font-bold text-[#254222]">
                        <span className="text-[11px] font-medium text-[#76777d] mr-1">Rp</span>
                        <span>{formatNumber(trx.total)}</span>
                      </td>

                      {/* Status Pembayaran */}
                      <td className="px-5 py-3.5 text-center">
                        {isPending ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#ece2b1] text-[#254222] text-[11px] font-bold border border-[#ece2b1]">
                            <Clock size={12} />
                            <span>Tertunda</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#cae4c5] text-[#254222] text-[11px] font-bold border border-[#cae4c5]">
                            <CheckCircle2 size={12} />
                            <span>Lunas</span>
                          </span>
                        )}
                      </td>

                      {/* Aksi */}
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Tombol Edit */}
                          <button
                            onClick={() => setEditingTransaction(trx)}
                            className="bg-white hover:bg-[#cae4c5]/30 text-[#254222] px-2.5 py-1 rounded-lg text-[11px] font-bold inline-flex items-center gap-1 transition-colors border border-[#cae4c5]"
                            title="Edit data pesanan, item, potongan & status pembayaran"
                          >
                            <Pencil size={12} />
                            <span>Edit</span>
                          </button>

                          {/* Tombol Tandai Lunas (Jika Tertunda) */}
                          {isPending && (
                            <button
                              onClick={() => setConfirmModalId(trx.id)}
                              className="bg-[#cae4c5] hover:bg-[#b8d8b2] text-[#254222] px-2.5 py-1 rounded-lg text-[11px] font-bold inline-flex items-center gap-1 transition-colors border border-[#cae4c5]"
                              title="Tandai pembayaran telah lunas/cair"
                            >
                              <CheckCircle size={13} />
                              <span>Lunas</span>
                            </button>
                          )}

                          {/* Tombol Lihat Struk */}
                          <button 
                            onClick={() => navigate(`/pos/receipt/${trx.id}`)}
                            className="text-[#254222] hover:bg-[#cae4c5]/30 px-2 py-1 rounded-lg text-[11px] font-bold uppercase inline-flex items-center gap-1 transition-colors"
                            title="Lihat / Cetak Struk"
                          >
                            <span>Struk</span>
                            <ArrowUpRight size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center text-[#76777d]">
                    <ReceiptText size={40} className="mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-[#254222]">Tidak ada transaksi ditemukan</p>
                    <p className="text-xs text-[#76777d] mt-1">Coba ganti filter tab atau kata kunci pencarian.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Edit Transaksi */}
      {editingTransaction && (
        <EditTransactionModal
          transaction={editingTransaction}
          onClose={() => setEditingTransaction(null)}
          onSaveSuccess={() => {
            setEditingTransaction(null);
            showToast('Perubahan transaksi berhasil disimpan!');
          }}
        />
      )}

      {/* Modal Konfirmasi Tandai Lunas */}
      {confirmModalId && (
        <div className="fixed inset-0 bg-[#254222]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 border border-[#cae4c5] text-center animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-[#cae4c5] text-[#254222] mx-auto flex items-center justify-center mb-3">
              <CheckCircle size={26} />
            </div>
            <h3 className="text-base font-bold text-[#254222]">Konfirmasi Pelunasan</h3>
            <p className="text-xs text-[#76777d] mt-1.5 leading-relaxed">
              Apakah Anda yakin ingin menandai transaksi <strong>{confirmModalId}</strong> ini sebagai <strong>LUNAS</strong>?
              (Dana telah dicairkan oleh marketplace atau piutang telah dilunasi).
            </p>
            <div className="flex gap-2 mt-5">
              <button
                type="button"
                onClick={() => setConfirmModalId(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-[#76777d] font-bold text-xs hover:bg-slate-50 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleMarkAsPaid(confirmModalId)}
                className="flex-1 py-2.5 rounded-xl bg-[#254222] hover:bg-[#1b3119] text-[#ece2b1] font-bold text-xs shadow-sm transition-colors"
              >
                Ya, Tandai Lunas
              </button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
