import { useState, useRef } from 'react';
import { ImageUploader } from './ImageUploader';

export const QRCodeGenerator = () => {
  const [text, setText] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const qrCodeRef = useRef<HTMLDivElement>(null);

  const handleImageUpload = (file: File) => {
    setImageFile(file);
  };

  const generateQRCode = async () => {
    if (!text.trim()) {
      setError('Por favor, insira um texto ou URL');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('text', text);
      if (imageFile) {
        formData.append('logo', imageFile);
      }

      const response = await fetch('https://qrgenerator-iki6.onrender.com/generate-qrcode', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erro ao gerar QR Code');
      }

      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      setQrCode(imageUrl);
    } catch (err) {
      setError('Erro ao gerar QR Code. Tente novamente.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadQRCode = () => {
    if (qrCode && qrCodeRef.current) {
      const link = document.createElement('a');
      link.href = qrCode;
      link.download = 'custom-qrcode.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className=" mx-auto p-6 bg-white rounded-lg shadow-">
      <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
        Gerador de QR Code Personalizado
      </h1>

      <div className="mb-6">
        <label className="block text-gray-700 mb-2" htmlFor="text">
          Texto ou URL para o QR Code
        </label>
        <input
          type="text"
          id="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Digite o texto ou URL"
        />
      </div>

      <div className="mb-6">
        <label className="block text-gray-700 mb-2">Logo Personalizado</label>
        <ImageUploader onImageUpload={handleImageUpload} />
      </div>

      <button
        onClick={generateQRCode}
        disabled={isLoading}
        className={`w-full py-3 px-4 rounded-lg font-semibold ${
          isLoading
            ? 'bg-blue-400 cursor-not-allowed'
            : 'bg-blue-500 hover:bg-blue-600'
        } transition duration-200`}
      >
        {isLoading ? 'Gerando...' : 'Gerar QR Code'}
      </button>

      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {qrCode && (
        <div className="mt-6 flex flex-col items-center">
          <div ref={qrCodeRef} className="mb-4">
            <img
              src={qrCode}
              alt="QR Code Personalizado"
              className="w-64 h-64 border border-gray-200"
            />
          </div>
          <button
            onClick={downloadQRCode}
            className="py-2 px-6 bg-green-500 hover:bg-green-600  rounded-lg transition duration-200"
          >
            Baixar QR Code
          </button>
        </div>
      )}
    </div>
  );
};