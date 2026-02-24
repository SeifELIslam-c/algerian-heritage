export type Language = 'ar' | 'en' | 'fr';

export interface Product {
  id: number;
  name: {
    ar: string;
    en: string;
    fr: string;
  };
  description: {
    ar: string;
    en: string;
    fr: string;
  };
  modelPath: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
}

export const products: Product[] = [
  {
    id: 1,
    name: {
      ar: "الجبة القسنطينية الأصيلة",
      en: "Authentic Constantinois Djebba",
      fr: "Djebba Constantinoise Authentique"
    },
    description: {
      ar: "تحفة فنية من التراث الجزائري، مطرزة بخيوط الذهب الخالص على قماش المخمل الفاخر. تعكس أناقة المرأة الجزائرية عبر العصور.",
      en: "A masterpiece of Algerian heritage, embroidered with pure gold threads on luxurious velvet fabric. Reflecting the elegance of Algerian women through the ages.",
      fr: "Un chef-d'œuvre du patrimoine algérien, brodé de fils d'or pur sur un tissu de velours luxueux. Reflétant l'élégance de la femme algérienne à travers les âges."
    },
    modelPath: "/models/model1.glb", // Place model1.glb in public/models/
    backgroundColor: "#D4AF37", // Gold/Yellow
    textColor: "#1a1a1a",
    accentColor: "#ffffff"
  },
  {
    id: 2,
    name: {
      ar: "القفطان الملكي الأسود",
      en: "Royal Black Caftan",
      fr: "Caftan Royal Noir"
    },
    description: {
      ar: "رمز الفخامة والرقي، يتميز بتصميمه العصري مع لمسة تقليدية عريقة. القفطان الجزائري هو عنوان التميز في المناسبات الكبرى.",
      en: "A symbol of luxury and sophistication, featuring a modern design with a deep traditional touch. The Algerian Caftan is the mark of distinction for grand occasions.",
      fr: "Symbole de luxe et de sophistication, doté d'un design moderne avec une touche traditionnelle profonde. Le Caftan algérien est la marque de distinction pour les grandes occasions."
    },
    modelPath: "/models/model2.glb", // Place model2.glb in public/models/
    backgroundColor: "#1a1a1a", // Black
    textColor: "#D4AF37",
    accentColor: "#D4AF37"
  }
];