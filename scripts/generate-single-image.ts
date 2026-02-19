import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
import path from 'path';

const zai = await ZAI.create();

// Ensure output directory exists
const outputDir = path.join(process.cwd(), 'public', 'images');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const prompt = 'Modern physiotherapy clinic interior, clean white walls with blue accents, friendly professional environment, natural lighting, treatment rooms visible, professional photography, high quality';
const filename = 'hero-banner.jpg';
const size = '1344x768';

console.log('Generating hero banner for PhysioConnect...');
console.log(`Prompt: ${prompt}`);
console.log(`Size: ${size}`);
console.log(`Output: ${path.join(outputDir, filename)}`);
console.log('Please wait...\n');

try {
  const response = await zai.images.generations.create({
    prompt: prompt,
    size: size,
  });

  const imageBase64 = response.data[0].base64;
  const buffer = Buffer.from(imageBase64, 'base64');

  const outputPath = path.join(outputDir, filename);
  fs.writeFileSync(outputPath, buffer);

  const fileSizeKB = (buffer.length / 1024).toFixed(2);
  console.log('✓ Image generated successfully!');
  console.log(`✓ File saved: ${outputPath}`);
  console.log(`✓ File size: ${fileSizeKB} KB`);
} catch (error) {
  console.error('✗ Failed to generate image:', error.message);
}
