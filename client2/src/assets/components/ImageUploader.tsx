import { useState, useCallback } from 'react';

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
}

export const ImageUploader = ({ onImageUpload }: ImageUploaderProps) => {
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
          onImageUpload(file);
        };
        reader.readAsDataURL(file);
      }
    },
    [onImageUpload]
  );

  return (
    <div className="flex flex-col items-center space-y-4">
      {preview ? (
        <div className="w-40 h-40 rounded-full overflow-hidden border-2 border-gray-300">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="w-40 h-40 rounded-full bg-gray-200 flex items-center justify-center">
          <span className="text-gray-500">Sem imagem</span>
        </div>
      )}
      <label className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition duration-200">
        Escolher Imagem
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </label>
    </div>
  );
};