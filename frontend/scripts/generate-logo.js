const fs = require('fs');
const path = require('path');
const sharp = require('./node_modules/sharp');

async function generateFinalLogo() {
  const logoStaiciPath = path.resolve(__dirname, '../Logo_STAICI.png');
  const arialBase64 = fs.readFileSync('C:/Windows/Fonts/arial.ttf').toString('base64');
  const georgiaBoldBase64 = fs.readFileSync('C:/Windows/Fonts/georgiab.ttf').toString('base64');

  // Emblem at 4x resolution: 136x136
  const emblemSize = 136;
  const resizedEmblemBuf = await sharp(logoStaiciPath)
    .resize(emblemSize, emblemSize, { kernel: 'lanczos3' })
    .png()
    .toBuffer();

  const emblemBase64 = `data:image/png;base64,${resizedEmblemBuf.toString('base64')}`;

  const emblemX = 14;
  const emblemY = 24;
  const textX = 196;
  const canvasWidth = 1200;
  const canvasHeight = 192;

  const topFontSize = 34;
  const mainFontSize = 46;

  const svg = `
  <svg width="${canvasWidth}" height="${canvasHeight}" viewBox="0 0 ${canvasWidth} ${canvasHeight}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <style>
        @font-face {
          font-family: 'BrandSans';
          src: url('data:font/truetype;charset=utf-8;base64,${arialBase64}') format('truetype');
          font-weight: normal;
        }
        @font-face {
          font-family: 'BrandSerifBold';
          src: url('data:font/truetype;charset=utf-8;base64,${georgiaBoldBase64}') format('truetype');
          font-weight: bold;
        }
        .top-subtext {
          font-family: 'BrandSans', 'Segoe UI', Arial, sans-serif;
          font-size: ${topFontSize}px;
          font-weight: 400;
          fill: #4b5563;
          letter-spacing: 0.25px;
        }
        .main-title {
          font-family: 'BrandSerifBold', Georgia, 'Times New Roman', serif;
          font-size: ${mainFontSize}px;
          font-weight: bold;
          fill: #0d3830;
          letter-spacing: -0.2px;
        }
      </style>
    </defs>
    <image href="${emblemBase64}" x="${emblemX}" y="${emblemY}" width="${emblemSize}" height="${emblemSize}" />
    <text x="${textX}" y="73" class="top-subtext">Portal Penerimaan Mahasiswa Baru</text>
    <text x="${textX}" y="142" class="main-title">STAI Cendekia Insani Situbondo</text>
  </svg>
  `;

  // Render to buffer and trim transparent outer padding
  const rendered = sharp(Buffer.from(svg));
  const trimmed = await rendered
    .trim({ threshold: 10 })
    .toBuffer({ resolveWithObject: true });

  console.log('Trimmed dimensions:', trimmed.info.width, trimmed.info.height);

  // Extend with 12px clean padding on all sides for transparent breathing room
  const padY = 12;
  const padX = 12;
  const finalPng = await sharp(trimmed.data)
    .extend({
      top: padY,
      bottom: padY,
      left: padX,
      right: padX,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .png({ quality: 100, compressionLevel: 9 })
    .toBuffer({ resolveWithObject: true });

  console.log('Final dimensions:', finalPng.info.width, finalPng.info.height);

  // 1. Update frontend/public/logo.png
  fs.writeFileSync('public/logo.png', finalPng.data);
  // 2. Update root Logo_STAICI_Horizontal.png
  fs.writeFileSync('../Logo_STAICI_Horizontal.png', finalPng.data);

  // 3. Update public/logo.svg
  const svgOutput = `
  <svg viewBox="0 0 ${finalPng.info.width} ${finalPng.info.height}" width="${finalPng.info.width}" height="${finalPng.info.height}" xmlns="http://www.w3.org/2000/svg">
    <image href="${emblemBase64}" x="${padX}" y="${padY}" width="${emblemSize}" height="${emblemSize}" />
    <text x="${textX - (canvasWidth - trimmed.info.width) + padX + 50}" y="${73 + padY}" font-family="'Segoe UI', Arial, sans-serif" font-size="${topFontSize}" font-weight="400" fill="#4b5563">Portal Penerimaan Mahasiswa Baru</text>
    <text x="${textX - (canvasWidth - trimmed.info.width) + padX + 50}" y="${142 + padY}" font-family="Georgia, 'Times New Roman', serif" font-size="${mainFontSize}" font-weight="bold" fill="#0d3830">STAI Cendekia Insani Situbondo</text>
  </svg>
  `;
  fs.writeFileSync('public/logo.svg', svgOutput.trim());

  console.log('Logos successfully regenerated with updated text!');
}

generateFinalLogo().catch(console.error);
