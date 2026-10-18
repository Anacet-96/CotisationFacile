import { useRef, useState } from 'react';
import { Image as ImageIcon, X, Upload, Loader2, AlertCircle } from 'lucide-react';
import { uploadImage } from '../../lib/storage';

export default function ImageUpload({
  value,
  onChange,
  label = 'Image',
  folder = 'misc',
  className = '',
}) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState('');

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setErr('');
    setUploading(true);

    const { url, error } = await uploadImage(file, folder);

    setUploading(false);
    e.target.value = '';

    if (error) {
      setErr(error);
      return;
    }
    onChange(url);
  }

  function clear() {
    onChange(null);
    setErr('');
  }

  return (
    <div className={className}>
      <label className="text-xs font-semibold text-muted block mb-2">{label}</label>

      {value ? (
        <div className="relative rounded-xl overflow-hidden border border-outline/40 aspect-video bg-black/5 dark:bg-white/5">
          <img src={value} alt="" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={clear}
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
            aria-label="Retirer"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="w-full aspect-video rounded-xl border-2 border-dashed border-outline flex flex-col items-center justify-center gap-2 hover:border-primary-light dark:hover:border-primary-dark transition text-muted disabled:opacity-60"
        >
          {uploading ? (
            <>
              <Loader2 size={28} className="animate-spin text-primary-light dark:text-primary-dark" />
              <span className="text-xs font-semibold">Upload en cours…</span>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center">
                <ImageIcon size={24} />
              </div>
              <span className="text-xs font-semibold flex items-center gap-1.5">
                <Upload size={14} /> Choisir une image
              </span>
              <span className="text-[10px]">PNG, JPG — max 5 MB</span>
            </>
          )}
        </button>
      )}

      {err && (
        <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
          <AlertCircle size={12} /> {err}
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
}