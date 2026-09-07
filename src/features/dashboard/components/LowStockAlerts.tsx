import React from 'react';
import { AlertTriangle, ChevronRight } from 'lucide-react';

const lowStockItems = [
  { id: '1', name: 'Sabun Cuci Piring', stock: 0, minStock: 10 },
  { id: '2', name: 'Beras Premium 5kg', stock: 3, minStock: 10 },
  { id: '3', name: 'Kopi Kapal Api', stock: 5, minStock: 20 },
  { id: '4', name: 'Gula Pasir 1kg', stock: 8, minStock: 25 },
  { id: '5', name: 'Minyak Goreng 2L', stock: 4, minStock: 15 },
  { id: '6', name: 'Susu Kental Manis', stock: 2, minStock: 12 },
  { id: '7', name: 'Tepung Terigu 1kg', stock: 6, minStock: 20 },
];

export default function LowStockAlerts() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 h-full flex flex-col">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center">
        <h3 className="font-semibold text-slate-800 flex items-center">
          <AlertTriangle size={18} className="text-amber-500 mr-2" />
          Low Stock Alerts
        </h3>
        <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-full">
          {lowStockItems.length}
        </span>
      </div>
      <div className="p-0 overflow-auto flex-1">
        <ul className="divide-y divide-slate-100">
          {lowStockItems.map((item) => (
            <li key={item.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between cursor-pointer group">
              <div>
                <p className="font-medium text-slate-800 text-sm">{item.name}</p>
                <div className="flex items-center mt-1 text-xs">
                  <span className={`font-semibold ${item.stock === 0 ? 'text-red-600' : 'text-amber-600'}`}>
                    Stok: {item.stock}
                  </span>
                  <span className="text-slate-400 mx-1">•</span>
                  <span className="text-slate-500">Min: {item.minStock}</span>
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
            </li>
          ))}
        </ul>
      </div>
      <div className="p-4 border-t border-slate-100">
        <button className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-sm font-medium rounded-md transition-colors border border-slate-200">
          Lihat Semua Produk
        </button>
      </div>
    </div>
  );
}
