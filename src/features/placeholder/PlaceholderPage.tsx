import React from 'react';
import PageContainer from '@/components/layout/PageContainer';
import { Sparkles, Construction, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PlaceholderPageProps {
  title: string;
}

const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title }) => {
  const navigate = useNavigate();

  return (
    <PageContainer 
      title={title} 
      description={`Modul ${title} sedang dalam tahap pengembangan (Roadmap Fase 4).`}
      actions={
        <button
          onClick={() => navigate('/')}
          className="h-10 px-4 rounded-xl bg-white text-[#0b1c30] border border-slate-200/80 shadow-sm hover:bg-[#eff4ff] text-[13px] font-semibold flex items-center gap-2 transition-all"
        >
          <ArrowLeft size={16} />
          <span>Kembali ke Dashboard</span>
        </button>
      }
    >
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 flex flex-col items-center justify-center text-center max-w-2xl mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-[#eff4ff] text-[#3755c3] flex items-center justify-center mb-4 shadow-sm">
          <Sparkles size={32} />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#d3e4fe] text-[#3755c3] text-xs font-bold uppercase tracking-wider mb-3">
          <Construction size={14} />
          <span>Fitur Segera Hadir</span>
        </div>
        <h2 className="text-xl font-bold text-[#0b1c30] font-heading">{title}</h2>
        <p className="text-sm text-[#45464d] mt-2 max-w-md">
          Modul ini direncanakan hadir pada iterasi berikutnya. Seluruh data operasional kasir, inventaris produk, dan pembelian tetap tersinkronisasi secara otomatis.
        </p>
      </div>
    </PageContainer>
  );
};

export default PlaceholderPage;
