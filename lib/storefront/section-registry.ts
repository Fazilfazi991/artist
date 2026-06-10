export const STOREFRONT_SECTION_TYPES = [
  {
    key: 'process',
    label: 'Craft Process',
    defaultTitle: 'Our Philosophy',
    defaultSubtitle: 'How each piece is thoughtfully made.',
    layouts: ['steps', 'compact', 'story']
  },
  {
    key: 'collections',
    label: 'Collections',
    defaultTitle: 'Collections',
    defaultSubtitle: 'Curated groups from this storefront.',
    layouts: ['grid', 'circles', 'banners']
  },
  {
    key: 'featured_products',
    label: 'Featured Products',
    defaultTitle: 'Featured Pieces',
    defaultSubtitle: 'Handpicked work ready to explore.',
    layouts: ['grid', 'centered', 'bordered']
  },
  {
    key: 'custom_cta',
    label: 'Custom Order CTA',
    defaultTitle: 'Have something custom in mind?',
    defaultSubtitle: 'Invite buyers to send references, files, videos, and links.',
    layouts: ['band', 'split', 'quiet']
  },
  {
    key: 'story',
    label: 'Maker Story',
    defaultTitle: 'Meet the maker',
    defaultSubtitle: 'A story section that builds buyer trust.',
    layouts: ['quote', 'image-left', 'image-right']
  },
  {
    key: 'newsletter',
    label: 'Newsletter',
    defaultTitle: 'Studio notes',
    defaultSubtitle: 'Invite buyers to follow future launches.',
    layouts: ['footer', 'band', 'minimal']
  }
] as const;

export type StorefrontSectionKey = typeof STOREFRONT_SECTION_TYPES[number]['key'];

export function getSectionMeta(key: string) {
  return STOREFRONT_SECTION_TYPES.find((section) => section.key === key) || STOREFRONT_SECTION_TYPES[0];
}
