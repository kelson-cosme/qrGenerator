const QRCode = require('qrcode');
const Jimp = require('jimp');
const fs = require('fs');

async function generateQRCodeWithLogo(text, outputFile, logoPath) {
    try {
        // Gerar o QR Code como buffer
        const qrBuffer = await QRCode.toBuffer(text, {
            errorCorrectionLevel: 'H',
            color: {
                dark: '#000000', // Cor dos pontos (preto)
                light: '#ffffff' // Fundo branco
            }
        });

        // Carregar a imagem do QR Code
        const qrImage = await Jimp.read(qrBuffer);

        // Alterar a cor apenas dos pontos internos do QR Code (não afetando a borda)
        const qrWidth = qrImage.bitmap.width;
        const qrHeight = qrImage.bitmap.height;
        const newDarkColor = Jimp.cssColorToHex('#000000');  // Cor personalizada dos pontos (exemplo: laranja)

        for (let y = 0; y < qrHeight; y++) {
            for (let x = 0; x < qrWidth; x++) {
                const pixelColor = qrImage.getPixelColor(x, y);
                const { r, g, b, a } = Jimp.intToRGBA(pixelColor);

                // Se o pixel for preto (ponto interno do QR Code), alteramos a cor para o laranja
                if (r === 0 && g === 0 && b === 0) {
                    qrImage.setPixelColor(newDarkColor, x, y);
                }
                // Se o pixel for branco (fundo), deixamos como está
                // A borda será a área em torno do QR Code que permanece sem alteração
            }
        }

        // Carregar a logo
        const logo = await Jimp.read(logoPath);

        // Redimensionar a logo para 30% do tamanho do QR Code
        const logoSize = qrWidth * 0.3;
        logo.resize(logoSize, logoSize);

        // Centralizar a logo no QR Code
        const x = (qrWidth - logoSize) / 2;
        const y = (qrWidth - logoSize) / 2;
        qrImage.composite(logo, x, y, {
            mode: Jimp.BLEND_SOURCE_OVER,
            opacitySource: 1,
            opacityDest: 1
        });

        // Salvar a imagem final
        await qrImage.writeAsync(outputFile);
        console.log(`QR Code gerado: ${outputFile}`);
    } catch (error) {
        console.error('Erro ao gerar QR Code:', error);
    }
}

// Exemplo de uso
const texto = 'https://portifoliotemporario.vercel.app';
const arquivoSaida = 'qrcode_com_logo.png';
const caminhoLogo = 'logo.png'; // Substitua pelo caminho da sua logo

generateQRCodeWithLogo(texto, arquivoSaida, caminhoLogo);
