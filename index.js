const express = require('express');
const multer = require('multer');
const QRCode = require('qrcode');
const Jimp = require('jimp');
const path = require('path');
const fs = require('fs');
const cors = require('cors'); // Adicione esta linha

const app = express();
app.use(cors()); // E esta linha
const upload = multer({ dest: 'uploads/' });

app.use(express.json());

app.post('/generate-qrcode', upload.single('logo'), async (req, res) => {
  try {
    const { text } = req.body;
    const logoPath = req.file?.path;

    // Gerar o QR Code como buffer
    const qrBuffer = await QRCode.toBuffer(text, {
      errorCorrectionLevel: 'H',
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });

    // Carregar a imagem do QR Code
    const qrImage = await Jimp.read(qrBuffer);

    // Alterar a cor dos pontos internos
    const qrWidth = qrImage.bitmap.width;
    const qrHeight = qrImage.bitmap.height;
    const newDarkColor = Jimp.cssColorToHex('#000000');

    for (let y = 0; y < qrHeight; y++) {
      for (let x = 0; x < qrWidth; x++) {
        const pixelColor = qrImage.getPixelColor(x, y);
        const { r, g, b } = Jimp.intToRGBA(pixelColor);

        if (r === 0 && g === 0 && b === 0) {
          qrImage.setPixelColor(newDarkColor, x, y);
        }
      }
    }

    // Se houver logo, adicionar ao QR Code
    if (logoPath) {
      const logo = await Jimp.read(logoPath);
      const logoSize = qrWidth * 0.3;
      logo.resize(logoSize, logoSize);

      const x = (qrWidth - logoSize) / 2;
      const y = (qrWidth - logoSize) / 2;
      qrImage.composite(logo, x, y, {
        mode: Jimp.BLEND_SOURCE_OVER,
        opacitySource: 1,
        opacityDest: 1
      });

      // Remover o arquivo temporário
      fs.unlinkSync(logoPath);
    }

    // Enviar a imagem como resposta
    qrImage.getBuffer(Jimp.MIME_PNG, (err, buffer) => {
      if (err) throw err;
      res.set('Content-Type', 'image/png');
      res.send(buffer);
    });
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ error: 'Erro ao gerar QR Code' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});