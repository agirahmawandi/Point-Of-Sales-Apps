import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Store, Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginForm) => {
    setErrorMsg('');
    const result = await login(data.email, data.password);
    if (result.success) {
      navigate('/');
    } else {
      setErrorMsg(result.error || 'Email atau password salah');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#f8f9ff] font-sans text-slate-800">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#cae4c5]/40 shadow-[0_1px_8px_rgba(37,66,34,0.04)]">
        <div className="h-16 w-full max-w-5xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#254222] rounded-lg flex items-center justify-center text-[#ece2b1] shadow-sm">
              <Store size={18} />
            </div>
            <span className="font-bold text-[#254222] tracking-tight text-lg">Frema Mart</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-[#cae4c5]/30 border border-[#cae4c5]/60 px-3 py-1.5 rounded-full text-[#254222] text-[11px] font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-[#99cc66] animate-pulse"></span>
              <span>Terminal #04 Online</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full pt-16 flex-1 flex flex-col justify-center">
        <div className="w-full max-w-md mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col border border-[#cae4c5]/60">
            <div className="text-center mb-8">
              <div className="w-12 h-12 mx-auto mb-4 bg-[#254222] rounded-xl flex items-center justify-center text-[#ece2b1] shadow-md">
                <Store size={24} />
              </div>
              <h1 className="text-2xl font-bold text-[#254222]">Masuk ke Sistem POS</h1>
              <p className="text-sm text-slate-500 mt-2">Masukkan ID Pengguna atau Email dan Kata Sandi untuk masuk sebagai Admin atau Kasir</p>
            </div>

            {errorMsg && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-4 border border-red-200">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#254222] mb-1.5">ID Pengguna / Email</label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3 text-slate-400" size={18} />
                  <input
                    {...register('email')}
                    type="email"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#cae4c5]/25 border border-[#cae4c5]/50 focus:border-[#99cc66] focus:bg-white focus:ring-4 focus:ring-[#99cc66]/15 text-[#254222] placeholder:text-slate-400 rounded-xl outline-none transition-all text-sm"
                    placeholder="kasir@fremamart.id"
                  />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#254222]">Kata Sandi</label>
                  <a href="#" className="text-xs text-[#254222] hover:underline font-semibold">Lupa Sandi?</a>
                </div>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3 text-slate-400" size={18} />
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    className="w-full pl-10 pr-10 py-2.5 bg-[#cae4c5]/25 border border-[#cae4c5]/50 focus:border-[#99cc66] focus:bg-white focus:ring-4 focus:ring-[#99cc66]/15 text-[#254222] placeholder:text-slate-400 rounded-xl outline-none transition-all text-sm"
                    placeholder="••••••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
              </div>

              <div className="flex items-center pt-1 pb-3">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input type="checkbox" className="w-4 h-4 rounded text-[#254222] border-slate-300 focus:ring-[#99cc66]" />
                  <span className="text-sm text-[#254222] font-medium">Ingat Saya</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#254222] hover:bg-[#1b3119] text-[#ece2b1] font-bold py-3 px-4 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
              >
                <span>{isSubmitting ? 'Memproses...' : 'Masuk'}</span>
                {!isSubmitting && <ArrowRight size={18} />}
              </button>
            </form>

            <div className="mt-8 pt-4 border-t border-slate-100 text-center">
              <span className="text-[12px] font-medium text-slate-400">Terminal ID: 884-FMM-JKT</span>
            </div>
            

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-white py-4 border-t border-[#cae4c5]/40 shadow-[0_-1px_6px_rgba(0,0,0,0.03)] z-10">
        <div className="w-full max-w-5xl mx-auto px-6 flex items-center justify-between text-slate-500 text-xs">
          <span className="font-semibold text-[#254222]">© 2024 Frema Mart</span>
          <span className="font-mono text-[11px] text-slate-400">v3.4.1</span>
        </div>
      </footer>
    </div>
  );
}

