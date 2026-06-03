const fs = require('fs');
const path = require('path');

(async () => {
  const JimpModule = await import('jimp');
  const pngToIcoModule = await import('png-to-ico');
  const Jimp = JimpModule.Jimp || JimpModule.default || JimpModule;
  const pngToIco = pngToIcoModule.default || pngToIcoModule;

  const root = path.resolve(__dirname, '..');
  const src = path.join(root, 'public', 'logo.jpg');
  if (!fs.existsSync(src)) {
    console.error('Source logo not found:', src);
    process.exit(1);
  }

  const out64 = path.join(root, 'public', 'logo-64.png');
  const out192 = path.join(root, 'public', 'logo-192.png');
  const out16 = path.join(root, 'public', 'logo-16.png');
  const out32 = path.join(root, 'public', 'logo-32.png');
  const out48 = path.join(root, 'public', 'logo-48.png');

  const image = await Jimp.read(src);
  console.log('Image loaded, resizing...');
  const img64 = image.clone();
  img64.resize({ w: 64, h: 64 });
  const getBuffer = (img, mime) =>
    new Promise((res, rej) =>
      img.getBuffer(mime, (err, buf) => {
        console.log('getBuffer callback for', mime, 'err=', !!err);
        return err ? rej(err) : res(buf);
      })
    );
  const buf64 = await getBuffer(img64, 'image/png');
  fs.writeFileSync(out64, buf64);
  console.log('Wrote', out64);

  const img192 = image.clone();
  img192.resize({ w: 192, h: 192 });
  const buf192 = await getBuffer(img192, 'image/png');
  fs.writeFileSync(out192, buf192);
  console.log('Wrote', out192);

  const img16 = image.clone();
  img16.resize({ w: 16, h: 16 });
  const buf16 = await getBuffer(img16, 'image/png');
  fs.writeFileSync(out16, buf16);
  console.log('Wrote', out16);

  const img32 = image.clone();
  img32.resize({ w: 32, h: 32 });
  const buf32 = await getBuffer(img32, 'image/png');
  fs.writeFileSync(out32, buf32);
  console.log('Wrote', out32);

  const img48 = image.clone();
  img48.resize({ w: 48, h: 48 });
  const buf48 = await getBuffer(img48, 'image/png');
  fs.writeFileSync(out48, buf48);
  console.log('Wrote', out48);

  console.log('Generating favicon.ico from PNGs...');
  const icoBuffer = await pngToIco([out16, out32, out48, out64]);
  const icoPath = path.join(root, 'public', 'favicon.ico');
  fs.writeFileSync(icoPath, icoBuffer);
  console.log('Generated icons:', out16, out32, out48, out64, out192, icoPath);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
