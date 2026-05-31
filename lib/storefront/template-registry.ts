import type { StorefrontTemplateKey } from './storefront-types';

export const STOREFRONT_TEMPLATES: Array<{ key: StorefrontTemplateKey; name: string; description: string; suitableFor: string[] }> = [
  { key: 'warm-editorial', name: 'Warm Editorial', description: 'Story-led, warm, artisanal storefront for pottery, decor, textiles, and painted crafts.', suitableFor: ['Pottery','Decor','Textiles','Painted crafts'] },
  { key: 'clean-grid', name: 'Clean Grid', description: 'Minimal, product-first storefront for jewellery, candles, accessories, and ready-to-ship catalogues.', suitableFor: ['Jewellery','Candles','Accessories','Ready-to-ship'] },
  { key: 'personalized-gifts', name: 'Personalized Gifts', description: 'Occasion and customization focused storefront for scrapbooks, hampers, name boards, and wedding gifts.', suitableFor: ['Scrapbooks','Hampers','Name boards','Wedding gifts'] },
  { key: 'visual-portfolio', name: 'Visual Portfolio', description: 'Image-heavy creative storefront for illustrators, painters, macrame artists, and decor creators.', suitableFor: ['Illustrators','Painters','Macrame','Decor'] },
  { key: 'boutique-brand', name: 'Boutique Brand', description: 'Elegant mini-brand storefront for premium gifting and curated lifestyle products.', suitableFor: ['Premium gifting','Lifestyle','Curated products'] }
];

export function getTemplateMeta(key?: string | null) {
  return STOREFRONT_TEMPLATES.find((template) => template.key === key) || STOREFRONT_TEMPLATES[0];
}