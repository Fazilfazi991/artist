export type StorefrontTemplateKey = 'warm-editorial' | 'clean-grid' | 'personalized-gifts' | 'visual-portfolio' | 'boutique-brand';

export type StorefrontContext = {
  seller: any;
  settings: any;
  products: any[];
  collections: any[];
  socialLinks: any[];
  sections: any[];
  preview?: boolean;
};