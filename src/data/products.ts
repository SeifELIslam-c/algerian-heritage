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
  price: number;
  sizes: string[];
  images: string[];
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
    modelPath: "/models/model1.glb",
    backgroundColor: "#D4AF37", // Gold/Yellow
    textColor: "#1a1a1a",
    accentColor: "#ffffff",
    price: 45000,
    sizes: ["S", "M", "L", "XL", "XXL"],
    images: [
      "https://picsum.photos/seed/djebba1/800/1200",
      "https://picsum.photos/seed/djebba2/800/1200",
      "https://picsum.photos/seed/djebba3/800/1200"
    ]
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
    modelPath: "/models/model2.glb",
    backgroundColor: "#1a1a1a", // Black
    textColor: "#D4AF37",
    accentColor: "#D4AF37",
    price: 55000,
    sizes: ["M", "L", "XL"],
    images: [
      "https://picsum.photos/seed/caftan1/800/1200",
      "https://picsum.photos/seed/caftan2/800/1200",
      "https://picsum.photos/seed/caftan3/800/1200"
    ]
  },
  {
    id: 3,
    name: {
      ar: "كراكو العاصمة",
      en: "Algiers Karakou",
      fr: "Karakou Algérois"
    },
    description: {
      ar: "لباس العروس العاصمية بامتياز، يتكون من سترة مخملية مطرزة وسروال الشلقة التقليدي. يجمع بين الأصالة والمعاصرة.",
      en: "The quintessential attire for the Algiers bride, consisting of an embroidered velvet jacket and traditional Chelqa trousers. Combining authenticity with modernity.",
      fr: "La tenue par excellence de la mariée algéroise, composée d'une veste en velours brodée et d'un pantalon Chelqa traditionnel. Alliant authenticité et modernité."
    },
    modelPath: "/models/model3.glb",
    backgroundColor: "#800020", // Burgundy
    textColor: "#ffffff",
    accentColor: "#D4AF37",
    price: 60000,
    sizes: ["S", "M", "L", "XL"],
    images: [
      "https://picsum.photos/seed/karakou1/800/1200",
      "https://picsum.photos/seed/karakou2/800/1200",
      "https://picsum.photos/seed/karakou3/800/1200"
    ]
  },
  {
    id: 4,
    name: {
      ar: "البلوزة الوهرانية",
      en: "Oran Blouza",
      fr: "Blouza Oranaise"
    },
    description: {
      ar: "أيقونة الغرب الجزائري، تتميز بألوانها الزاهية وتطريزها الدقيق والمرصع بالأحجار الكريمة. تعبر عن الفرح والأنوثة.",
      en: "The icon of Western Algeria, distinguished by its bright colors and delicate embroidery studded with gemstones. Expressing joy and femininity.",
      fr: "L'icône de l'ouest algérien, distinguée par ses couleurs vives et sa broderie délicate parsemée de pierres précieuses. Exprimant la joie et la féminité."
    },
    modelPath: "/models/model4.glb",
    backgroundColor: "#0047AB", // Cobalt Blue
    textColor: "#ffffff",
    accentColor: "#C0C0C0",
    price: 35000,
    sizes: ["M", "L", "XL", "XXL"],
    images: [
      "https://picsum.photos/seed/blouza1/800/1200",
      "https://picsum.photos/seed/blouza2/800/1200",
      "https://picsum.photos/seed/blouza3/800/1200"
    ]
  },
  {
    id: 5,
    name: {
      ar: "الجبة القبائلية",
      en: "Kabyle Dress",
      fr: "Robe Kabyle"
    },
    description: {
      ar: "بألوانها المستوحاة من الطبيعة وتصاميمها الهندسية الفريدة، تروي الجبة القبائلية قصص الجبال والحرية.",
      en: "With its nature-inspired colors and unique geometric designs, the Kabyle dress tells stories of mountains and freedom.",
      fr: "Avec ses couleurs inspirées de la nature et ses motifs géométriques uniques, la robe kabyle raconte des histoires de montagnes et de liberté."
    },
    modelPath: "/models/model5.glb",
    backgroundColor: "#047857", // Emerald Green (Cool & Elegant)
    textColor: "#ffffff",
    accentColor: "#FF4500",
    price: 25000,
    sizes: ["XS", "S", "M", "L", "XL"],
    images: [
      "https://picsum.photos/seed/kabyle1/800/1200",
      "https://picsum.photos/seed/kabyle2/800/1200",
      "https://picsum.photos/seed/kabyle3/800/1200"
    ]
  },
  {
    id: 6,
    name: {
      ar: "الملحفة الشاوية",
      en: "Chaoui Melhfa",
      fr: "Melhfa Chaouia"
    },
    description: {
      ar: "رمز الأناقة في منطقة الأوراس، تتميز بطياتها الانسيابية وألوانها الداكنة المزينة بالحلي الفضية التقليدية.",
      en: "A symbol of elegance in the Aures region, characterized by its flowing pleats and dark colors adorned with traditional silver jewelry.",
      fr: "Symbole d'élégance dans la région des Aurès, caractérisé par ses plis fluides et ses couleurs sombres ornées de bijoux traditionnels en argent."
    },
    modelPath: "/models/model6.glb",
    backgroundColor: "#2F4F4F", // Dark Slate Gray (Cool, elegant)
    textColor: "#ffffff",
    accentColor: "#C0C0C0", // Silver
    price: 30000,
    sizes: ["S", "M", "L", "XL", "XXL"],
    images: [
      "https://picsum.photos/seed/chaoui1/800/1200",
      "https://picsum.photos/seed/chaoui2/800/1200",
      "https://picsum.photos/seed/chaoui3/800/1200"
    ]
  }
];
