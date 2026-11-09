import React from 'react';

export interface AvatarBuilderConfig {
  skinTone: 'fair' | 'light' | 'medium' | 'olive' | 'tan' | 'deep';
  faceShape: 'oval' | 'round' | 'square' | 'heart';
  hairStyle: 'short' | 'curly' | 'fade' | 'wavy' | 'bob' | 'bun' | 'afro' | 'bald';
  hairColor: 'black' | 'darkBrown' | 'chestnut' | 'blonde' | 'auburn' | 'gray' | 'sage';
  eyeStyle: 'friendly' | 'almond' | 'happy' | 'focused' | 'wink';
  eyebrowStyle: 'natural' | 'soft' | 'expressive' | 'bold';
  mouthStyle: 'smile' | 'grin' | 'calm' | 'confident' | 'openSmile';
  clothingStyle: 'crewneck' | 'hoodie' | 'collar' | 'tshirt' | 'turtleneck';
  clothingColor: 'sage' | 'sienna' | 'slate' | 'forest' | 'cream' | 'terracotta' | 'navy';
  accessory: 'none' | 'roundGlasses' | 'squareGlasses' | 'sunglasses' | 'beanie' | 'headphones';
  bgColor: 'warmBeige' | 'softSage' | 'softSienna' | 'sunsetAmber' | 'cleanSlate' | 'terracottaSoft';
  bgPattern: 'solid' | 'radial' | 'dots' | 'rings';
}

export const SKIN_TONES = {
  fair: { base: '#FDE2D2', shadow: '#F0C4B0' },
  light: { base: '#F7D0B6', shadow: '#E2B395' },
  medium: { base: '#E8B896', shadow: '#CF9D78' },
  olive: { base: '#D8A47E', shadow: '#BC8762' },
  tan: { base: '#B87B54', shadow: '#9A5F3B' },
  deep: { base: '#7D4A2D', shadow: '#60351D' },
};

export const HAIR_COLORS = {
  black: { main: '#242424', highlight: '#3C3C3C' },
  darkBrown: { main: '#3E2723', highlight: '#5D4037' },
  chestnut: { main: '#6D4C41', highlight: '#8D6E63' },
  blonde: { main: '#E2B462', highlight: '#F4CB7C' },
  auburn: { main: '#A0402C', highlight: '#BD533D' },
  gray: { main: '#78909C', highlight: '#90A4AE' },
  sage: { main: '#718368', highlight: '#8A9C81' },
};

export const CLOTHING_COLORS = {
  sage: { main: '#718368', shadow: '#5F7157', accent: '#EAF0E5' },
  sienna: { main: '#B88762', shadow: '#9E6E4B', accent: '#F4E9DE' },
  slate: { main: '#403B34', shadow: '#2E2B26', accent: '#F0EBE2' },
  forest: { main: '#557B5C', shadow: '#44654A', accent: '#E8F0E9' },
  cream: { main: '#E7E0D5', shadow: '#D9D0C3', accent: '#718368' },
  terracotta: { main: '#B95F60', shadow: '#A14F50', accent: '#F9ECEC' },
  navy: { main: '#2C3E50', shadow: '#1F2C39', accent: '#BDC3C7' },
};

export const BG_COLORS = {
  warmBeige: '#F7F4EE',
  softSage: '#EAF0E5',
  softSienna: '#F4E9DE',
  sunsetAmber: '#FBF5E6',
  cleanSlate: '#EDF2F7',
  terracottaSoft: '#F9ECEC',
};

export const DEFAULT_AVATAR_CONFIG: AvatarBuilderConfig = {
  skinTone: 'light',
  faceShape: 'oval',
  hairStyle: 'short',
  hairColor: 'chestnut',
  eyeStyle: 'friendly',
  eyebrowStyle: 'natural',
  mouthStyle: 'smile',
  clothingStyle: 'crewneck',
  clothingColor: 'sage',
  accessory: 'none',
  bgColor: 'warmBeige',
  bgPattern: 'radial',
};

export interface AvatarPreset {
  id: string;
  name: string;
  tagline: string;
  config: AvatarBuilderConfig;
}

export const AVATAR_PRESETS: AvatarPreset[] = [
  {
    id: 'preset-serene',
    name: 'Serene Creator',
    tagline: 'Calm, thoughtful, and composed',
    config: {
      skinTone: 'light',
      faceShape: 'oval',
      hairStyle: 'wavy',
      hairColor: 'chestnut',
      eyeStyle: 'friendly',
      eyebrowStyle: 'natural',
      mouthStyle: 'smile',
      clothingStyle: 'crewneck',
      clothingColor: 'sage',
      accessory: 'roundGlasses',
      bgColor: 'warmBeige',
      bgPattern: 'radial',
    },
  },
  {
    id: 'preset-strategist',
    name: 'Deep Strategist',
    tagline: 'Focused planning & clear vision',
    config: {
      skinTone: 'olive',
      faceShape: 'square',
      hairStyle: 'fade',
      hairColor: 'black',
      eyeStyle: 'focused',
      eyebrowStyle: 'bold',
      mouthStyle: 'confident',
      clothingStyle: 'collar',
      clothingColor: 'slate',
      accessory: 'squareGlasses',
      bgColor: 'cleanSlate',
      bgPattern: 'solid',
    },
  },
  {
    id: 'preset-flow',
    name: 'Flow State',
    tagline: 'Locked into deep productive rhythm',
    config: {
      skinTone: 'medium',
      faceShape: 'round',
      hairStyle: 'curly',
      hairColor: 'darkBrown',
      eyeStyle: 'friendly',
      eyebrowStyle: 'soft',
      mouthStyle: 'smile',
      clothingStyle: 'hoodie',
      clothingColor: 'forest',
      accessory: 'headphones',
      bgColor: 'softSage',
      bgPattern: 'rings',
    },
  },
  {
    id: 'preset-scholar',
    name: 'Mindful Scholar',
    tagline: 'Lifelong learner & intentional thinker',
    config: {
      skinTone: 'tan',
      faceShape: 'heart',
      hairStyle: 'bob',
      hairColor: 'black',
      eyeStyle: 'almond',
      eyebrowStyle: 'expressive',
      mouthStyle: 'grin',
      clothingStyle: 'turtleneck',
      clothingColor: 'terracotta',
      accessory: 'roundGlasses',
      bgColor: 'softSienna',
      bgPattern: 'dots',
    },
  },
  {
    id: 'preset-morning',
    name: 'Morning Radiance',
    tagline: 'Bright energy & early morning focus',
    config: {
      skinTone: 'fair',
      faceShape: 'oval',
      hairStyle: 'bun',
      hairColor: 'auburn',
      eyeStyle: 'happy',
      eyebrowStyle: 'natural',
      mouthStyle: 'openSmile',
      clothingStyle: 'crewneck',
      clothingColor: 'cream',
      accessory: 'none',
      bgColor: 'sunsetAmber',
      bgPattern: 'radial',
    },
  },
  {
    id: 'preset-modern',
    name: 'Modern Executive',
    tagline: 'Sleek execution & disciplined habits',
    config: {
      skinTone: 'deep',
      faceShape: 'square',
      hairStyle: 'afro',
      hairColor: 'black',
      eyeStyle: 'friendly',
      eyebrowStyle: 'bold',
      mouthStyle: 'smile',
      clothingStyle: 'collar',
      clothingColor: 'navy',
      accessory: 'squareGlasses',
      bgColor: 'softSage',
      bgPattern: 'solid',
    },
  },
  {
    id: 'preset-zen',
    name: 'Zen Minimalist',
    tagline: 'Zero clutter, pure clarity',
    config: {
      skinTone: 'light',
      faceShape: 'round',
      hairStyle: 'short',
      hairColor: 'blonde',
      eyeStyle: 'wink',
      eyebrowStyle: 'expressive',
      mouthStyle: 'grin',
      clothingStyle: 'tshirt',
      clothingColor: 'sage',
      accessory: 'beanie',
      bgColor: 'warmBeige',
      bgPattern: 'dots',
    },
  },
  {
    id: 'preset-lead',
    name: 'Architect of Ideas',
    tagline: 'Building durable momentum daily',
    config: {
      skinTone: 'medium',
      faceShape: 'oval',
      hairStyle: 'fade',
      hairColor: 'gray',
      eyeStyle: 'focused',
      eyebrowStyle: 'natural',
      mouthStyle: 'confident',
      clothingStyle: 'collar',
      clothingColor: 'slate',
      accessory: 'sunglasses',
      bgColor: 'cleanSlate',
      bgPattern: 'radial',
    },
  },
];

/**
 * Returns a randomized, harmonious avatar configuration
 */
export function getRandomAvatarConfig(): AvatarBuilderConfig {
  const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

  const skinTones: AvatarBuilderConfig['skinTone'][] = ['fair', 'light', 'medium', 'olive', 'tan', 'deep'];
  const faceShapes: AvatarBuilderConfig['faceShape'][] = ['oval', 'round', 'square', 'heart'];
  const hairStyles: AvatarBuilderConfig['hairStyle'][] = ['short', 'curly', 'fade', 'wavy', 'bob', 'bun', 'afro', 'bald'];
  const hairColors: AvatarBuilderConfig['hairColor'][] = ['black', 'darkBrown', 'chestnut', 'blonde', 'auburn', 'gray', 'sage'];
  const eyeStyles: AvatarBuilderConfig['eyeStyle'][] = ['friendly', 'almond', 'happy', 'focused', 'wink'];
  const eyebrowStyles: AvatarBuilderConfig['eyebrowStyle'][] = ['natural', 'soft', 'expressive', 'bold'];
  const mouthStyles: AvatarBuilderConfig['mouthStyle'][] = ['smile', 'grin', 'calm', 'confident', 'openSmile'];
  const clothingStyles: AvatarBuilderConfig['clothingStyle'][] = ['crewneck', 'hoodie', 'collar', 'tshirt', 'turtleneck'];
  const clothingColors: AvatarBuilderConfig['clothingColor'][] = ['sage', 'sienna', 'slate', 'forest', 'cream', 'terracotta', 'navy'];
  const accessories: AvatarBuilderConfig['accessory'][] = ['none', 'roundGlasses', 'squareGlasses', 'sunglasses', 'beanie', 'headphones'];
  const bgColors: AvatarBuilderConfig['bgColor'][] = ['warmBeige', 'softSage', 'softSienna', 'sunsetAmber', 'cleanSlate', 'terracottaSoft'];
  const bgPatterns: AvatarBuilderConfig['bgPattern'][] = ['solid', 'radial', 'dots', 'rings'];

  return {
    skinTone: pick(skinTones),
    faceShape: pick(faceShapes),
    hairStyle: pick(hairStyles),
    hairColor: pick(hairColors),
    eyeStyle: pick(eyeStyles),
    eyebrowStyle: pick(eyebrowStyles),
    mouthStyle: pick(mouthStyles),
    clothingStyle: pick(clothingStyles),
    clothingColor: pick(clothingColors),
    accessory: pick(accessories),
    bgColor: pick(bgColors),
    bgPattern: pick(bgPatterns),
  };
}

/**
 * Generates pure SVG string for the given avatar configuration.
 * ViewBox 0 0 200 200 with clean layered paths.
 */
export function renderAvatarSvg(config: AvatarBuilderConfig): string {
  const skin = SKIN_TONES[config.skinTone] || SKIN_TONES.light;
  const hair = HAIR_COLORS[config.hairColor] || HAIR_COLORS.chestnut;
  const cloth = CLOTHING_COLORS[config.clothingColor] || CLOTHING_COLORS.sage;
  const bg = BG_COLORS[config.bgColor] || BG_COLORS.warmBeige;

  // 1. Background Pattern
  let bgPatternContent = '';
  if (config.bgPattern === 'radial') {
    bgPatternContent = `
      <radialGradient id="av-rad" cx="50%" cy="40%" r="55%">
        <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.45" />
        <stop offset="100%" stop-color="${bg}" stop-opacity="1" />
      </radialGradient>
      <circle cx="100" cy="100" r="100" fill="url(#av-rad)" />
    `;
  } else if (config.bgPattern === 'dots') {
    bgPatternContent = `
      <pattern id="av-dots" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
        <circle cx="8" cy="8" r="1.5" fill="#718368" opacity="0.18" />
      </pattern>
      <circle cx="100" cy="100" r="100" fill="${bg}" />
      <circle cx="100" cy="100" r="100" fill="url(#av-dots)" />
    `;
  } else if (config.bgPattern === 'rings') {
    bgPatternContent = `
      <circle cx="100" cy="100" r="100" fill="${bg}" />
      <circle cx="100" cy="100" r="75" fill="none" stroke="#FFFFFF" stroke-width="2" opacity="0.35" />
      <circle cx="100" cy="100" r="50" fill="none" stroke="#FFFFFF" stroke-width="2" opacity="0.25" />
    `;
  } else {
    bgPatternContent = `<circle cx="100" cy="100" r="100" fill="${bg}" />`;
  }

  // 2. Neck
  const neck = `
    <rect x="88" y="112" width="24" height="34" rx="4" fill="${skin.shadow}" />
    <path d="M88,126 Q100,134 112,126 L112,146 L88,146 Z" fill="${skin.shadow}" opacity="0.4" />
  `;

  // 3. Clothes
  let clothesContent = '';
  if (config.clothingStyle === 'hoodie') {
    clothesContent = `
      <path d="M40,200 C40,152 70,140 100,140 C130,140 160,152 160,200 Z" fill="${cloth.main}" />
      <path d="M80,140 C80,162 120,162 120,140 C110,148 90,148 80,140 Z" fill="${cloth.shadow}" />
      <circle cx="93" cy="162" r="2.5" fill="${cloth.accent}" />
      <circle cx="107" cy="162" r="2.5" fill="${cloth.accent}" />
    `;
  } else if (config.clothingStyle === 'collar') {
    clothesContent = `
      <path d="M40,200 C40,152 70,140 100,140 C130,140 160,152 160,200 Z" fill="${cloth.main}" />
      <path d="M86,140 L100,160 L114,140 L100,144 Z" fill="#FFFFFF" />
      <polygon points="86,140 98,154 94,140" fill="${cloth.shadow}" opacity="0.3" />
      <polygon points="114,140 102,154 106,140" fill="${cloth.shadow}" opacity="0.3" />
    `;
  } else if (config.clothingStyle === 'turtleneck') {
    clothesContent = `
      <path d="M40,200 C40,152 70,140 100,140 C130,140 160,152 160,200 Z" fill="${cloth.main}" />
      <rect x="85" y="122" width="30" height="24" rx="6" fill="${cloth.main}" />
      <line x1="85" y1="134" x2="115" y2="134" stroke="${cloth.shadow}" stroke-width="1.5" />
    `;
  } else if (config.clothingStyle === 'tshirt') {
    clothesContent = `
      <path d="M40,200 C40,152 70,140 100,140 C130,140 160,152 160,200 Z" fill="${cloth.main}" />
      <path d="M84,140 Q100,155 116,140" fill="none" stroke="${skin.shadow}" stroke-width="3" />
    `;
  } else {
    // crewneck
    clothesContent = `
      <path d="M40,200 C40,152 70,140 100,140 C130,140 160,152 160,200 Z" fill="${cloth.main}" />
      <path d="M86,140 Q100,148 114,140" fill="none" stroke="${cloth.shadow}" stroke-width="4" stroke-linecap="round" />
    `;
  }

  // 4. Face Shape & Head
  let facePath = '';
  if (config.faceShape === 'round') {
    facePath = 'M65,96 C65,62 135,62 135,96 C135,134 65,134 65,96 Z';
  } else if (config.faceShape === 'square') {
    facePath = 'M66,94 C66,62 134,62 134,94 C134,126 126,134 100,134 C74,134 66,126 66,94 Z';
  } else if (config.faceShape === 'heart') {
    facePath = 'M64,92 C64,60 136,60 136,92 C136,118 114,136 100,136 C86,136 64,118 64,92 Z';
  } else {
    // oval
    facePath = 'M66,95 C66,60 134,60 134,95 C134,132 66,132 66,95 Z';
  }

  const ears = `
    <circle cx="64" cy="95" r="7" fill="${skin.base}" />
    <circle cx="64" cy="95" r="4" fill="${skin.shadow}" opacity="0.6" />
    <circle cx="136" cy="95" r="7" fill="${skin.base}" />
    <circle cx="136" cy="95" r="4" fill="${skin.shadow}" opacity="0.6" />
  `;

  // 5. Hair Back Layer (for long/wavy/bun styles)
  let hairBack = '';
  if (config.hairStyle === 'wavy') {
    hairBack = `
      <path d="M56,85 C50,110 46,145 65,165 C70,145 74,125 70,100 Z" fill="${hair.main}" />
      <path d="M144,85 C150,110 154,145 135,165 C130,145 126,125 130,100 Z" fill="${hair.main}" />
    `;
  } else if (config.hairStyle === 'bun') {
    hairBack = `
      <circle cx="100" cy="50" r="16" fill="${hair.main}" />
      <circle cx="100" cy="50" r="12" fill="${hair.highlight}" opacity="0.25" />
    `;
  }

  // 6. Eyebrows
  let eyebrows = '';
  if (config.eyebrowStyle === 'soft') {
    eyebrows = `
      <line x1="77" y1="84" x2="91" y2="84" stroke="${hair.main}" stroke-width="2.5" stroke-linecap="round" />
      <line x1="109" y1="84" x2="123" y2="84" stroke="${hair.main}" stroke-width="2.5" stroke-linecap="round" />
    `;
  } else if (config.eyebrowStyle === 'expressive') {
    eyebrows = `
      <path d="M76,85 Q84,80 92,83" fill="none" stroke="${hair.main}" stroke-width="3" stroke-linecap="round" />
      <path d="M108,82 Q116,79 124,84" fill="none" stroke="${hair.main}" stroke-width="3" stroke-linecap="round" />
    `;
  } else if (config.eyebrowStyle === 'bold') {
    eyebrows = `
      <path d="M75,84 Q84,81 92,83" fill="none" stroke="${hair.main}" stroke-width="4.2" stroke-linecap="round" />
      <path d="M108,83 Q116,81 125,84" fill="none" stroke="${hair.main}" stroke-width="4.2" stroke-linecap="round" />
    `;
  } else {
    // natural
    eyebrows = `
      <path d="M76,84 Q84,81 92,84" fill="none" stroke="${hair.main}" stroke-width="2.8" stroke-linecap="round" />
      <path d="M108,84 Q116,81 124,84" fill="none" stroke="${hair.main}" stroke-width="2.8" stroke-linecap="round" />
    `;
  }

  // 7. Eyes
  let eyes = '';
  if (config.eyeStyle === 'almond') {
    eyes = `
      <path d="M76,95 Q84,90 92,95 Q84,99 76,95 Z" fill="#2C2825" />
      <circle cx="85" cy="94" r="1.5" fill="#FFFFFF" />
      <path d="M108,95 Q116,90 124,95 Q116,99 108,95 Z" fill="#2C2825" />
      <circle cx="117" cy="94" r="1.5" fill="#FFFFFF" />
    `;
  } else if (config.eyeStyle === 'happy') {
    eyes = `
      <path d="M77,95 Q84,90 91,95" fill="none" stroke="#2C2825" stroke-width="3" stroke-linecap="round" />
      <path d="M109,95 Q116,90 123,95" fill="none" stroke="#2C2825" stroke-width="3" stroke-linecap="round" />
    `;
  } else if (config.eyeStyle === 'focused') {
    eyes = `
      <path d="M77,94 Q84,91 91,94" fill="none" stroke="#2C2825" stroke-width="3" stroke-linecap="round" />
      <circle cx="84" cy="96" r="3" fill="#2C2825" />
      <circle cx="85" cy="95" r="1" fill="#FFFFFF" />
      <path d="M109,94 Q116,91 123,94" fill="none" stroke="#2C2825" stroke-width="3" stroke-linecap="round" />
      <circle cx="116" cy="96" r="3" fill="#2C2825" />
      <circle cx="117" cy="95" r="1" fill="#FFFFFF" />
    `;
  } else if (config.eyeStyle === 'wink') {
    eyes = `
      <path d="M76,95 Q84,90 92,95" fill="none" stroke="#2C2825" stroke-width="3" stroke-linecap="round" />
      <circle cx="116" cy="94" r="4.2" fill="#2C2825" />
      <circle cx="117.5" cy="92.5" r="1.5" fill="#FFFFFF" />
    `;
  } else {
    // friendly round
    eyes = `
      <circle cx="84" cy="94" r="4.2" fill="#2C2825" />
      <circle cx="85.5" cy="92.5" r="1.5" fill="#FFFFFF" />
      <circle cx="116" cy="94" r="4.2" fill="#2C2825" />
      <circle cx="117.5" cy="92.5" r="1.5" fill="#FFFFFF" />
    `;
  }

  // 8. Nose
  const nose = `
    <path d="M98,103 Q100,107 103,105" fill="none" stroke="${skin.shadow}" stroke-width="2.2" stroke-linecap="round" />
  `;

  // 9. Mouth
  let mouth = '';
  if (config.mouthStyle === 'grin') {
    mouth = `
      <path d="M87,115 Q100,126 113,115 Z" fill="#FFFFFF" stroke="#3A2E2B" stroke-width="1.8" />
      <path d="M87,115 Q100,121 113,115" stroke="#3A2E2B" stroke-width="1.2" fill="none" />
    `;
  } else if (config.mouthStyle === 'calm') {
    mouth = `
      <line x1="91" y1="117" x2="109" y2="117" stroke="#3A2E2B" stroke-width="2.2" stroke-linecap="round" />
    `;
  } else if (config.mouthStyle === 'confident') {
    mouth = `
      <path d="M90,118 Q102,118 112,114" fill="none" stroke="#3A2E2B" stroke-width="2.5" stroke-linecap="round" />
    `;
  } else if (config.mouthStyle === 'openSmile') {
    mouth = `
      <path d="M88,114 Q100,128 112,114 Z" fill="#9E4647" />
      <path d="M88,114 Q100,118 112,114 Z" fill="#FFFFFF" />
    `;
  } else {
    // gentle smile
    mouth = `
      <path d="M89,115 Q100,122 111,115" fill="none" stroke="#3A2E2B" stroke-width="2.4" stroke-linecap="round" />
    `;
  }

  // 10. Hair Front
  let hairFront = '';
  if (config.hairStyle === 'curly') {
    hairFront = `
      <path d="M62,85 C58,60 75,48 100,48 C125,48 142,60 138,85 C132,74 120,68 100,68 C80,68 68,74 62,85 Z" fill="${hair.main}" />
      <circle cx="70" cy="62" r="10" fill="${hair.main}" />
      <circle cx="88" cy="54" r="11" fill="${hair.main}" />
      <circle cx="112" cy="54" r="11" fill="${hair.main}" />
      <circle cx="130" cy="62" r="10" fill="${hair.main}" />
      <circle cx="78" cy="70" r="7" fill="${hair.highlight}" opacity="0.3" />
      <circle cx="122" cy="70" r="7" fill="${hair.highlight}" opacity="0.3" />
    `;
  } else if (config.hairStyle === 'fade') {
    hairFront = `
      <path d="M64,88 L64,74 C64,54 80,48 100,48 C120,48 136,54 136,74 L136,88 C132,82 124,78 100,78 C76,78 68,82 64,88 Z" fill="${hair.main}" />
      <path d="M75,54 Q100,44 125,54" stroke="${hair.highlight}" stroke-width="2.5" fill="none" opacity="0.4" />
    `;
  } else if (config.hairStyle === 'wavy') {
    hairFront = `
      <path d="M62,88 C60,60 76,50 100,50 C124,50 140,60 138,88 C132,75 120,70 100,70 C80,70 68,75 62,88 Z" fill="${hair.main}" />
      <path d="M62,88 Q72,110 66,130" stroke="${hair.main}" stroke-width="5" fill="none" stroke-linecap="round" />
      <path d="M138,88 Q128,110 134,130" stroke="${hair.main}" stroke-width="5" fill="none" stroke-linecap="round" />
    `;
  } else if (config.hairStyle === 'bob') {
    hairFront = `
      <path d="M60,90 C58,58 75,48 100,48 C125,48 142,58 140,90 C140,118 132,125 130,125 C124,115 122,85 100,85 C78,85 76,115 70,125 C68,125 60,118 60,90 Z" fill="${hair.main}" />
      <path d="M80,60 Q100,54 120,60" stroke="${hair.highlight}" stroke-width="2" fill="none" opacity="0.3" />
    `;
  } else if (config.hairStyle === 'bun') {
    hairFront = `
      <path d="M64,90 C62,64 78,56 100,56 C122,56 138,64 136,90 C130,78 118,74 100,74 C82,74 70,78 64,90 Z" fill="${hair.main}" />
    `;
  } else if (config.hairStyle === 'afro') {
    hairFront = `
      <circle cx="100" cy="80" r="46" fill="${hair.main}" />
      <circle cx="100" cy="80" r="42" fill="${hair.highlight}" opacity="0.15" />
    `;
  } else if (config.hairStyle === 'bald') {
    hairFront = `
      <path d="M82,62 Q100,56 118,62" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" opacity="0.35" />
    `;
  } else {
    // short
    hairFront = `
      <path d="M64,88 C62,62 76,50 100,50 C124,50 138,62 136,88 C130,76 118,72 100,72 C82,72 70,76 64,88 Z" fill="${hair.main}" />
      <path d="M78,60 Q100,52 122,60" stroke="${hair.highlight}" stroke-width="2" fill="none" opacity="0.35" />
    `;
  }

  // 11. Accessories
  let accessoriesContent = '';
  if (config.accessory === 'roundGlasses') {
    accessoriesContent = `
      <circle cx="83" cy="94" r="10.5" fill="none" stroke="#2C2825" stroke-width="2" />
      <circle cx="117" cy="94" r="10.5" fill="none" stroke="#2C2825" stroke-width="2" />
      <line x1="93.5" y1="94" x2="106.5" y2="94" stroke="#2C2825" stroke-width="2" />
      <line x1="64" y1="92" x2="72.5" y2="93" stroke="#2C2825" stroke-width="1.8" />
      <line x1="127.5" y1="93" x2="136" y2="92" stroke="#2C2825" stroke-width="1.8" />
    `;
  } else if (config.accessory === 'squareGlasses') {
    accessoriesContent = `
      <rect x="72" y="85" width="22" height="17" rx="3" fill="none" stroke="#403B34" stroke-width="2.2" />
      <rect x="106" y="85" width="22" height="17" rx="3" fill="none" stroke="#403B34" stroke-width="2.2" />
      <line x1="94" y1="92" x2="106" y2="92" stroke="#403B34" stroke-width="2.2" />
      <line x1="64" y1="90" x2="72" y2="90" stroke="#403B34" stroke-width="1.8" />
      <line x1="128" y1="90" x2="136" y2="90" stroke="#403B34" stroke-width="1.8" />
    `;
  } else if (config.accessory === 'sunglasses') {
    accessoriesContent = `
      <path d="M71,86 L94,86 L92,101 C92,104 86,105 73,103 Z" fill="#202224" />
      <path d="M106,86 L129,86 L127,103 C114,105 108,104 108,101 Z" fill="#202224" />
      <line x1="94" y1="88" x2="106" y2="88" stroke="#202224" stroke-width="2.5" />
      <line x1="74" y1="90" x2="88" y2="96" stroke="#FFFFFF" stroke-width="1.2" opacity="0.4" />
      <line x1="109" y1="90" x2="123" y2="96" stroke="#FFFFFF" stroke-width="1.2" opacity="0.4" />
    `;
  } else if (config.accessory === 'beanie') {
    accessoriesContent = `
      <path d="M62,80 C60,45 80,42 100,42 C120,42 140,45 138,80 Z" fill="#557B5C" />
      <rect x="60" y="74" width="80" height="12" rx="4" fill="#44654A" />
      <circle cx="100" cy="38" r="5" fill="#E8F0E9" />
    `;
  } else if (config.accessory === 'headphones') {
    accessoriesContent = `
      <path d="M57,95 C57,55 75,44 100,44 C125,44 143,55 143,95" fill="none" stroke="#2C3E50" stroke-width="5" stroke-linecap="round" />
      <rect x="52" y="85" width="10" height="22" rx="4" fill="#34495E" stroke="#1A252F" stroke-width="1.5" />
      <rect x="138" y="85" width="10" height="22" rx="4" fill="#34495E" stroke="#1A252F" stroke-width="1.5" />
    `;
  }

  // Compose complete SVG
  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
      ${bgPatternContent}
      ${hairBack}
      ${neck}
      ${clothesContent}
      ${ears}
      <path d="${facePath}" fill="${skin.base}" />
      ${eyebrows}
      ${eyes}
      ${nose}
      ${mouth}
      ${hairFront}
      ${accessoriesContent}
    </svg>
  `.trim();
}

/**
 * Converts avatar config directly into an encoded SVG data URI.
 * Works natively in <img src="..." />.
 */
export function avatarConfigToSvgDataUri(config: AvatarBuilderConfig): string {
  const svg = renderAvatarSvg(config);
  // Clean whitespace and encode for data URI
  const cleanSvg = svg.replace(/\s+/g, ' ').trim();
  return `data:image/svg+xml;utf8,${encodeURIComponent(cleanSvg)}`;
}

/**
 * Interactive React component rendering the Vector Avatar
 */
export function AvatarSvg({
  config,
  className = '',
  size = 120,
}: {
  config: AvatarBuilderConfig;
  className?: string;
  size?: number | string;
}) {
  const svgMarkup = renderAvatarSvg(config);

  return React.createElement('div', {
    className: `inline-flex items-center justify-center overflow-hidden rounded-full shrink-0 select-none ${className}`,
    style: { width: size, height: size },
    dangerouslySetInnerHTML: { __html: svgMarkup },
  });
}
