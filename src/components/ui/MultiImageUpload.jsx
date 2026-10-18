import { useRef, useState } from 'react';
import { Image as ImageIcon, X, Upload, Loader2 } from 'lucide-react';
import { uploadImage } from '../../lib/storage';

export default function MultiImageUpload({
  values = [],
  onChange,
  max = 5,
  label = 'Photos',
  folder = 'misc',
}) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  async function handleFiles(e) {
    const files = Array.from(e.target.files || []);
    const remaining = max - values.length;
    const toUpload = files.slice(0, remaining);
    e.target.value = '';
    if (!toUpload.length) return;

    setUploading(true);
    const uploaded = [];
    for (const file of toUpload) {
      const { url } = await uploadImage(file, folder);
      if (url) uploaded.push(url);
    }
    setUploading(false);
    if (uploaded.length) onChange([...values, ...uploaded]);
  }

  function remove(idx) {
    onChange(values.filter((_, i) => i !== idx));
  }

  return (
    <div>
      <label className="text-xs font-semibold text-muted flex items-center gap-1.5 mb-2">
        <ImageIcon size={14} />
        {label} ({values.length}/{max})
      </label>

      <div className="grid grid-cols-3 gap-2">
        {values.map((url, i) => (
          <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-outline/40">
            <img src={url} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => remove(i)}
              className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
              aria-label="Retirer"
            >
              <X size={14} />
            </button>
          </div>
        ))}

        {values.length < max && (
          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="aspect-square rounded-xl border-2 border-dashed border-outline flex flex-col items-center justify-center gap-1 hover:border-primary-light dark:hover:border-primary-dark transition text-muted disabled:opacity-60"
          >
            {uploading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <>
                <Upload size={20} />
                <span className="text-[10px] font-semibold">Ajouter</span>
              </>
            )}
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        className="hidden"
        onChange={handleFiles}
      />
    </div>
  );
}