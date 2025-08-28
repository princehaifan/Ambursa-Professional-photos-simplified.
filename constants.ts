import type { EditState, Filter, PresetCollection } from './types';

export const INITIAL_EDIT_STATE: EditState = {
  exposure: 100, // brightness
  contrast: 100,
  highlights: 0, // Not a direct CSS filter, will simulate with brightness/contrast logic
  shadows: 0, // Not a direct CSS filter, will simulate
  saturation: 100,
  temperature: 0, // sepia/hue-rotate
  vignette: 0, // radial-gradient overlay
  grain: 0, // opacity on a grain overlay
  sharpness: 0,
};

export const FILTERS: Filter[] = [
  { name: 'None', edits: INITIAL_EDIT_STATE },
  { name: 'Vivid', edits: { contrast: 120, saturation: 125 } },
  { name: 'Cool', edits: { temperature: -15, saturation: 110 } },
  { name: 'Warm', edits: { temperature: 20, saturation: 110 } },
  { name: 'Noir', edits: { saturation: 0, contrast: 130 } },
  { name: 'Golden', edits: { temperature: 30, saturation: 120, contrast: 110 } },
  { name: 'Muted', edits: { saturation: 70, contrast: 90 } },
];

export const PRO_PRESET_COLLECTIONS: PresetCollection[] = [
  {
    collectionName: "Film Emulation",
    description: "Styles ranging from vintage film stocks to modern analog interpretations. Perfect for nostalgic photography, portraits and creative storytelling.",
    presets: [
      { name: "Kodachrome 64", prompt: "Emulate the look of Kodachrome 64 film, with rich, saturated colors, high contrast, and sharp details. Render reds and blues vibrantly." },
      { name: "Fuji Pro 400H", prompt: "Recreate the look of Fujifilm Pro 400H film, known for its beautiful, soft skin tones, muted greens, and a slightly cool, airy feel." },
      { name: "Ilford HP5 B&W", prompt: "Apply a classic black and white look emulating Ilford HP5 film, with strong contrast, noticeable grain, and deep blacks. Perfect for dramatic portraits." },
      { name: "Vintage Agfa", prompt: "Give the image a nostalgic, vintage look inspired by Agfa film, with warm, slightly reddish tones, soft contrast, and a gentle fade in the shadows." }
    ]
  },
  {
    collectionName: "Travel Collection",
    description: "From vibrant landscapes to cultural documentation. Each preset captures the essence of your journey with stunning visual impact.",
    presets: [
      { name: "Tropical Punch", prompt: "Enhance tropical scenes by making the ocean a vibrant turquoise, the foliage a lush green, and boosting overall saturation for a sunny, punchy look." },
      { name: "Desert Mirage", prompt: "Apply a warm, golden look suitable for desert landscapes. Enhance orange and yellow tones, add a slight haze, and increase contrast in the sand dunes." },
      { name: "Urban Explorer", prompt: "Create a gritty, urban look with desaturated colors except for pops of red and yellow. Increase sharpness and add a slight dark vignette." },
      { name: "Mountain Mood", prompt: "Give mountain landscapes a moody, dramatic feel with cool, blueish shadows, enhanced cloud detail, and high clarity." }
    ]
  },
  {
    collectionName: "Dark Aesthetic",
    description: "From moody shadows to dramatic contrast. Perfect for artistic photography, portraits and creative projects.",
    presets: [
      { name: "Matte Black", prompt: "Create a dark, moody aesthetic with deep, crushed blacks that have a matte finish. Desaturate colors significantly and keep highlights dim." },
      { name: "Neon Noir", prompt: "Apply a dark, cyberpunk noir look. Plunge the image into shadow, but make any light sources (especially neon lights) glow with intense, vibrant color." },
      { name: "Gothic Film", prompt: "Emulate the look of a gothic film, with very low exposure, cool, desaturated tones, high contrast, and a strong, dark vignette." },
      { name: "Faded Shadow", prompt: "Create a moody, artistic look with faded, washed-out shadows, low saturation, and a soft, slightly blurry feel." }
    ]
  },
  {
    collectionName: "Product Collection",
    description: "From minimalist and sterile to vibrant and commercial. Each preset delivers clean, professional results that make products pop.",
    presets: [
      { name: "Clean & Crisp", prompt: "Create a clean, sterile look for product photography. Make the background pure white, increase brightness and sharpness on the product, and ensure colors are accurate and clean." },
      { name: "Vibrant Commercial", prompt: "Give the product shot a vibrant, commercial look. Boost saturation and contrast to make the product pop, and add a subtle, clean glow." },
      { name: "Luxe Gold", prompt: "Apply a luxurious look with warm, golden tones and soft highlights. Perfect for jewelry, cosmetics, or other high-end products." },
      { name: "Minimalist", prompt: "Create a minimalist aesthetic with muted colors, soft, even lighting, and low contrast. The focus should be entirely on the product's form." }
    ]
  },
  {
    collectionName: "Monochrome",
    description: "From classic black and white to artistic grayscale interpretations. Delivers timeless monochromatic excellence.",
    presets: [
      { name: "High Contrast B&W", prompt: "Convert to a dramatic, high-contrast black and white. Make whites bright and blacks deep, emphasizing textures and shapes." },
      { name: "Soft Sepia", prompt: "Apply a gentle, warm sepia tone for a vintage, nostalgic black and white photo." },
      { name: "Matte Grayscale", prompt: "Create a modern, matte grayscale look with faded blacks and a soft, low-contrast feel." },
      { name: "Silver Gelatin", prompt: "Emulate a classic silver gelatin print, with rich tonal range, sharp details, and a subtle, cool silver tone in the mid-greys." }
    ]
  },
   {
    collectionName: "Automotive",
    description: "From sleek and metallic to dynamic and energetic. These presets enhance vehicle details and create compelling automotive imagery.",
    presets: [
      { name: "Showroom Shine", prompt: "Give the car a showroom shine with high-contrast reflections, deep, clean blacks, and enhanced metallic paint details. Make it look sleek and polished." },
      { name: "Motion Blur", prompt: "Add a sense of speed by applying a realistic motion blur to the background and wheels, keeping the car body sharp and in focus." },
      { name: "Aggressive Grade", prompt: "Apply an aggressive color grade with high contrast, desaturated tones, and a gritty texture to give the car a powerful, menacing look." },
    ]
  }
];