import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
import path from 'path';

async function generateCTAImage() {
  const zai = await ZAI.create();

  const prompt = `Energetic fitness and wellness scene showing an athletic person stretching triumphantly with arms raised, 
  celebrating health and vitality. Bright golden hour sunlight streaming through, 
  vibrant teal and orange color palette suggesting energy and optimism.
  Modern gym or physiotherapy clinic environment in soft bokeh background.
  Dynamic athletic pose conveying strength, recovery, and achievement.
  High energy, motivational composition. Professional sports photography style.
  Perfect for healthcare call-to-action banner. Ultra high quality.`;

  console.log('Generating energetic CTA background image...');
  
  const response = await zai.images.generations.create({
    prompt: prompt,
    size: '1440x720' // Wide banner format
  });

  const imageBase64 = response.data[0].base64;
  
  // Save image
  const outputPath = path.join(process.cwd(), 'public/images/cta-energetic.jpg');
  const buffer = Buffer.from(imageBase64, 'base64');
  fs.writeFileSync(outputPath, buffer);
  
  console.log(`✓ Energetic CTA image saved to: ${outputPath}`);
}

generateCTAImage().catch(console.error);
