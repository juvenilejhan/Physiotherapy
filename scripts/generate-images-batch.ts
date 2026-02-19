import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
import path from 'path';

const zai = await ZAI.create();

// Ensure output directory exists
const outputDir = path.join(process.cwd(), 'public', 'images');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function generateImage(prompt, filename, size = '1024x1024') {
  try {
    console.log(`\n[${new Date().toLocaleTimeString()}] Generating: ${filename}...`);
    const startTime = Date.now();

    const response = await zai.images.generations.create({
      prompt: prompt,
      size: size,
    });

    const imageBase64 = response.data[0].base64;
    const buffer = Buffer.from(imageBase64, 'base64');

    const outputPath = path.join(outputDir, filename);
    fs.writeFileSync(outputPath, buffer);

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    const fileSize = (buffer.length / 1024).toFixed(2);

    console.log(`✓ Saved: ${filename} (${fileSize} KB, ${duration}s)`);
    return { success: true, path: outputPath };
  } catch (error) {
    console.error(`✗ Failed to generate ${filename}:`, error.message);
    return { success: false, error: error.message };
  }
}

// Start with critical images - Hero banner first
const criticalImages = [
  {
    prompt: 'Modern physiotherapy clinic interior, clean white walls with blue accents, friendly professional environment, natural lighting, treatment rooms visible in background, professional photography, high quality',
    filename: 'hero-banner.jpg',
    size: '1440x720'
  },
  {
    prompt: 'Professional physiotherapist helping patient with shoulder exercises, modern clinic setting, therapeutic environment, warm lighting, caring interaction, medical equipment, high quality photography',
    filename: 'service-orthopedic.jpg',
    size: '1024x1024'
  },
  {
    prompt: 'Sports injury rehabilitation, athlete working with physiotherapist on knee exercises, modern sports medicine facility, motivational atmosphere, professional equipment, dynamic lighting, high quality',
    filename: 'service-sports.jpg',
    size: '1024x1024'
  },
];

console.log('========================================');
console.log('PhysioConnect Image Generation');
console.log('========================================');
console.log(`Output directory: ${outputDir}`);
console.log(`Images to generate: ${criticalImages.length}`);
console.log('========================================');

let successCount = 0;
for (let i = 0; i < criticalImages.length; i++) {
  const image = criticalImages[i];
  const result = await generateImage(image.prompt, image.filename, image.size);
  if (result.success) successCount++;

  // Small delay between generations
  if (i < criticalImages.length - 1) {
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

console.log('\n========================================');
console.log('Generation Complete!');
console.log(`✓ Success: ${successCount}/${criticalImages.length} images`);
console.log(`📁 Location: ${outputDir}`);
console.log('========================================');
