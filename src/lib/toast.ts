/**
 * Toast utility helpers menggunakan Sonner
 * Gunakan fungsi ini di seluruh komponen untuk konsistensi notifikasi
 */
import { toast } from 'sonner';

export const showSuccess = (message: string) => {
  toast.success(message);
};

export const showError = (message: string) => {
  toast.error(message);
};

export const showInfo = (message: string) => {
  toast.info(message);
};

export const showLoading = (message: string) => {
  return toast.loading(message);
};

export const dismissToast = (id: string | number) => {
  toast.dismiss(id);
};

/**
 * Wrapper untuk operasi async dengan toast otomatis
 * @param fn - fungsi async yang dijalankan
 * @param messages - pesan sukses, loading, dan error
 */
export const withToast = async <T>(
  fn: () => Promise<T>,
  messages: {
    loading?: string;
    success: string;
    error?: string;
  }
): Promise<T | undefined> => {
  const loadingId = messages.loading ? toast.loading(messages.loading) : undefined;
  try {
    const result = await fn();
    if (loadingId !== undefined) toast.dismiss(loadingId);
    toast.success(messages.success);
    return result;
  } catch (err: any) {
    if (loadingId !== undefined) toast.dismiss(loadingId);
    toast.error(messages.error || err?.message || 'Terjadi kesalahan. Coba lagi.');
    return undefined;
  }
};

export { toast };
