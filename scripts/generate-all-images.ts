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
    console.log(`[${new Date().toLocaleTimeString()}] Generating: ${filename}...`);
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

// Valid sizes: 1024x1024, 768x1344, 864x1152, 1344x768, 1152x864, 720x1440
// Size must be multiple of 32 and between 512-2880px

const images = [
  // Hero Banner
  {
    prompt: 'Modern physiotherapy clinic interior, clean white walls with blue accents, friendly professional environment, natural lighting, treatment rooms visible, professional photography, high quality',
    filename: 'hero-banner.jpg',
    size: '1344x768'
  },

  // Service Images (square 1024x1024)
  {
    prompt: 'Professional physiotherapist helping patient with shoulder exercises, modern clinic setting, therapeutic environment, warm lighting, caring interaction, medical equipment, high quality photography',
    filename: 'service-orthopedic.jpg',
    size: '1024x1024'
  },
  {
    prompt: 'Neurological rehabilitation session, patient doing balance exercises with therapist support, modern rehabilitation center, safe environment, professional medical equipment, high quality',
    filename: 'service-neurological.jpg',
    size: '1024x1024'
  },
  {
    prompt: 'Sports injury rehabilitation, athlete working with physiotherapist on knee exercises, modern sports medicine facility, motivational atmosphere, professional equipment, dynamic lighting, high quality',
    filename: 'service-sports.jpg',
    size: '1024x1024'
  },
  {
    prompt: 'Pediatric physiotherapy session, friendly therapist helping child with fun exercises, colorful and welcoming clinic room, child-friendly environment, toys and equipment, warm atmosphere, high quality',
    filename: 'service-pediatric.jpg',
    size: '1024x1024'
  },
  {
    prompt: 'Cardiopulmonary rehabilitation, patient doing breathing exercises with therapist monitoring, modern cardiac rehabilitation center, medical equipment, clean professional environment, high quality',
    filename: 'service-cardiopulmonary.jpg',
    size: '1024x1024'
  },
  {
    prompt: 'Geriatric physiotherapy, elderly patient doing gentle exercises with caring therapist, accessible clinic environment, warm and supportive atmosphere, safety equipment, natural lighting, high quality',
    filename: 'service-geriatric.jpg',
    size: '1024x1024'
  },

  // About Page Images (landscape 1344x768)
  {
    prompt: 'Team of diverse physiotherapy professionals in modern clinic, group photo showing collaboration, friendly atmosphere, medical scrubs, clinic background, professional photography, high quality',
    filename: 'about-team.jpg',
    size: '1344x768'
  },
  {
    prompt: 'Modern physiotherapy clinic reception area, welcoming entrance, comfortable waiting area, professional decor, blue and white color scheme, natural light, high quality photography',
    filename: 'about-clinic.jpg',
    size: '1344x768'
  },

  // Blog Post Images (landscape 1344x768)
  {
    prompt: 'Illustration of common sports injuries, anatomy focus showing knee shoulder and ankle, educational medical illustration style, clean white background, professional medical art, high quality',
    filename: 'blog-sports-injuries.jpg',
    size: '1344x768'
  },
  {
    prompt: 'Person stretching and doing flexibility exercises, wellness lifestyle concept, bright natural lighting, outdoor setting or bright gym, inspiring atmosphere, high quality photography',
    filename: 'blog-wellness.jpg',
    size: '1344x768'
  },
  {
    prompt: 'Recovery journey concept, person taking first steps after injury, supportive environment, hopeful atmosphere, rehabilitation setting, warm lighting, high quality photography',
    filename: 'blog-recovery.jpg',
    size: '1344x768'
  },
  {
    prompt: 'Physiotherapy treatment session, hands-on therapy, therapeutic touch, professional environment, patient comfort, soft lighting, high quality photography',
    filename: 'blog-treatment.jpg',
    size: '1344x768'
  },

  // Service Detail Page Image (landscape 1344x768)
  {
    prompt: 'Close-up of physiotherapist hands doing manual therapy on patient shoulder, therapeutic technique, professional setting, focus on healing touch, warm lighting, high quality',
    filename: 'detail-manual-therapy.jpg',
    size: '1344x768'
  },

  // Additional Marketing Images
  {
    prompt: 'Happy patient completing physiotherapy program, celebrating recovery with therapist, joyful moment, clinic environment, achievement celebration, high quality photography',
    filename: 'success-story.jpg',
    size: '1024x1024'
  },
  {
    prompt: 'Modern physiotherapy clinic exterior, contemporary architecture, welcoming entrance, professional medical building, landscaping, blue and white branding, high quality photography',
    filename: 'clinic-exterior.jpg',
    size: '1344x768'
  },
];

console.log('========================================');
console.log('PhysioConnect Image Generation');
console.log('========================================');
console.log(`Output directory: ${outputDir}`);
console.log(`Total images: ${images.length}`);
console.log('========================================\n');

let successCount = 0;
for (let i = 0; i < images.length; i++) {
  const image = images[i];
  const result = await generateImage(image.prompt, image.filename, image.size);
  if (result.success) successCount++;

  // Small delay between generations
  if (i < images.length - 1) {
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

console.log('\n========================================');
console.log('Generation Complete!');
console.log(`✓ Success: ${successCount}/${images.length} images`);
console.log(`📁 Location: ${outputDir}`);
console.log('========================================');
