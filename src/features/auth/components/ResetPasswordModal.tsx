import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { KeyRound, X, Save } from 'lucide-react';
import { toast } from 'sonner';

// Cek hash URL sebelum React Router sempat menghapusnya saat redirect ke /login
const initialIsRecovery = typeof window !== 'undefined' && window.location.hash.includes('type=recovery');

export default function ResetPasswordModal() {
  const [isOpen, setIsOpen] = useState(initialIsRecovery);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Dengarkan event dari Supabase Auth
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      // PASSWORD_RECOVERY dipicu ketika user mengklik link reset password dari email
      if (event === 'PASSWORD_RECOVERY') {
        setIsOpen(true);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error('Password tidak cocok! Silakan periksa kembali.');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password minimal 6 karakter.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw error;
      }

      toast.success('Password berhasil diperbarui! Silakan gunakan password baru Anda untuk login berikutnya.');
      setIsOpen(false);
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err.message || 'Gagal memperbarui password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#eff4ff] text-[#3755c3] flex items-center justify-center">
            <KeyRound size={16} />
          </div>
          <h3 className="font-bold text-lg text-[#0b1c30]">Buat Password Baru</h3>
          <button 
            onClick={() => setIsOpen(false)}
            className="ml-auto text-slate-400 hover:text-slate-600 transition-colors p-1"
            title="Tutup (Batal mereset)"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-[#eff4ff] text-[#3755c3] p-3 rounded-lg text-[13px] font-medium border border-[#3755c3]/20">
            Anda sedang dalam mode reset password. Silakan masukkan password baru untuk akun Anda.
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#0b1c30] mb-1.5">Password Baru</label>
            <input 
              type="password" 
              required
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-[14px] focus:ring-2 focus:ring-[#3755c3]/20 focus:border-[#3755c3] focus:bg-white outline-none transition-all"
              placeholder="Minimal 6 karakter"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-[#0b1c30] mb-1.5">Konfirmasi Password Baru</label>
            <input 
              type="password" 
              required
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-[14px] focus:ring-2 focus:ring-[#3755c3]/20 focus:border-[#3755c3] focus:bg-white outline-none transition-all"
              placeholder="Ketik ulang password baru"
            />
          </div>
          
          <div className="pt-4 flex gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 rounded-xl font-bold text-white bg-[#3755c3] hover:bg-[#2a429c] flex items-center justify-center gap-2 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save size={18} />
                  Simpan Password Baru
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
