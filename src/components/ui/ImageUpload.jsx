import { useRef } from 'react';
import { Image as ImageIcon, X, Upload } from 'lucide-react';

// Lit un File et retourne une data URL (persiste en mémoire)
function readAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function ImageUpload({ value, onChange, label = 'Image', className = '' }) {
  const inputRef = useRef(null);

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    // TODO Supabase : upload dans Storage bucket "product-images", récupérer public URL
    const dataUrl = await readAsDataURL(file);
    onChange(dataUrl);
    e.target.value = '';
  }

  function clear() {
    onChange(null);
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
          onClick={() => inputRef.current?.click()}
          className="w-full aspect-video rounded-xl border-2 border-dashed border-outline flex flex-col items-center justify-center gap-2 hover:border-primary-light dark:hover:border-primary-dark transition text-muted"
        >
          <div className="w-12 h-12 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center">
            <ImageIcon size={24} />
          </div>
          <span className="text-xs font-semibold flex items-center gap-1.5">
            <Upload size={14} /> Choisir une image
          </span>
          <span className="text-[10px]">PNG, JPG — max 5 MB</span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
}