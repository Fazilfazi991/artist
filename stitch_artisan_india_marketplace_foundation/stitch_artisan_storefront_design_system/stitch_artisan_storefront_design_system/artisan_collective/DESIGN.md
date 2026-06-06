---
name: Artisan Collective
colors:
  surface: '#fbf9f4'
  surface-dim: '#dbdad5'
  surface-bright: '#fbf9f4'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3ee'
  surface-container: '#f0eee9'
  surface-container-high: '#eae8e3'
  surface-container-highest: '#e4e2dd'
  on-surface: '#1b1c19'
  on-surface-variant: '#51443e'
  inverse-surface: '#30312e'
  inverse-on-surface: '#f2f1ec'
  outline: '#83746d'
  outline-variant: '#d5c3ba'
  surface-tint: '#80543c'
  primary: '#71472f'
  on-primary: '#ffffff'
  primary-container: '#8c5e45'
  on-primary-container: '#ffe4d7'
  inverse-primary: '#f4ba9c'
  secondary: '#56624d'
  on-secondary: '#ffffff'
  secondary-container: '#d7e4c9'
  on-secondary-container: '#5a6651'
  tertiary: '#78422d'
  on-tertiary: '#ffffff'
  tertiary-container: '#955943'
  on-tertiary-container: '#ffe3d9'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbca'
  primary-fixed-dim: '#f4ba9c'
  on-primary-fixed: '#311302'
  on-primary-fixed-variant: '#653d26'
  secondary-fixed: '#dae7cc'
  secondary-fixed-dim: '#becbb0'
  on-secondary-fixed: '#141e0e'
  on-secondary-fixed-variant: '#3f4a36'
  tertiary-fixed: '#ffdbce'
  tertiary-fixed-dim: '#ffb59a'
  on-tertiary-fixed: '#360f01'
  on-tertiary-fixed-variant: '#6c3924'
  background: '#fbf9f4'
  on-background: '#1b1c19'
  surface-variant: '#e4e2dd'
typography:
  display-lg:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: '600'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 36px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-lg:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '500'
    lineHeight: '1.3'
  headline-md:
    fontFamily: Playfair Display
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-caps:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.1em
  script-accent:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '400'
    lineHeight: '1'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  section-desktop: 120px
  section-mobile: 64px
  gutter: 24px
  margin-desktop: 48px
  margin-mobile: 16px
---

## Brand & Style

The design system bridges the gap between high-end artisan craftsmanship and modern e-commerce utility. It is built to evoke **tactile warmth, authenticity, and heritage**, while maintaining the rigorous precision of a professional SaaS platform for the seller-facing Design Studio.

The brand personality is **Cultivated & Rooted**. It speaks to users who value the story behind an object as much as the object itself. 

The aesthetic is a hybrid of **Minimalism** and **Tactile Modernism**. It prioritizes generous whitespace and high-quality typography to let the products breathe, while using organic textures, fine lines, and soft shadows to simulate a physical boutique experience. The "Design Studio" (SaaS) component shifts toward a **Corporate Modern** style—clean, efficient, and reliable—ensuring sellers can focus on business growth without visual distraction.

## Colors

The color strategy uses a **Theme-Switching Architecture**. While the core design system provides a shared neutral foundation (`#F9F7F2`), each storefront template injects its own personality through a specific accent and background pairing.

- **Primary Neutral**: A soft "Gallery White" or "Cream" rather than pure hex white, providing a warmer, more natural surface for photography.
- **Sellers' Studio**: Employs a professional palette of Slate and Cobalt to differentiate the "Work" environment from the "Shop" environment.
- **Semantic Colors**: Use standard Success (Sage), Warning (Amber), and Error (Terracotta) tones, adjusted to fit the earthy saturation of the brand.

## Typography

The system utilizes a high-contrast pairing of **Playfair Display** (Serif) and **Hanken Grotesk** (Sans).

- **Playfair Display** is reserved for storytelling, hero headers, and price points to convey luxury and craftsmanship.
- **Hanken Grotesk** handles the heavy lifting for functional text, UI labels, and descriptions, ensuring clarity and modern SaaS efficiency.
- **Special Case**: For the *Heartfelt Studio* and *Visual Portfolio* templates, use "Plus Jakarta Sans" in italics or script-like variants for personal notes and handwritten accents.
- **Micro-copy**: All labels (`label-caps`) should use increased letter-spacing for a "Boutique Label" effect.

## Layout & Spacing

This design system follows a **Fluid Grid with Intentional Voids**. To mimic an physical gallery, whitespace is treated as a design element rather than "empty space."

- **Grid Model**: A standard 12-column grid for desktop. For the *Clean Product Grid*, elements should strictly snap to these columns. For *Warm Editorial*, utilize offset layouts where images span 5 or 7 columns to create an asymmetrical, organic flow.
- **Vertical Rhythm**: Large vertical gaps (120px+) between homepage sections encourage "slow scrolling" and story absorption.
- **Mobile Reflow**: Shift to a 4-column grid. Margins shrink significantly to maximize product photography scale.

## Elevation & Depth

Hierarchy is achieved through **Tonal Layering** and **Minimal Shadows** rather than heavy skeuomorphism.

- **Base Elevation**: The background is always the lowest layer. Cards and containers use a "Flat-on-Surface" approach, defined by 1px borders in a slightly darker neutral tone rather than shadows.
- **Active Elevation**: Buttons and hovering product cards use a "Low-Contrast Shadow"—highly diffused (20px-30px blur), low opacity (5-8%), and tinted with the primary accent color to avoid a "dirty" grey look.
- **Glassmorphism**: Reserved for navigation bars and sticky headers. Use a `backdrop-blur` of 12px with a 90% opacity background fill to maintain legibility while hinting at the content below.

## Shapes

The shape language varies by storefront template, but the underlying system defaults to **Soft (1)** for a refined, modern feel.

- **Global Default**: 0.25rem (4px) corner radius for functional UI like input fields and small buttons.
- **Thematic Overrides**:
    - *Warm Editorial & Clay/Craft*: Use "Organic" shapes—custom SVG masks for images that feature slight wobbles or hand-drawn edges.
    - *Heartfelt Studio*: Use "Rounded (2)" (0.5rem) or "Pill" for a softer, more approachable personality.
    - *Atelier Lumière*: Use "Sharp (0)" for images and containers to emphasize a high-fashion, architectural structure.

## Components

### Buttons
- **Primary**: Solid fill (Theme Accent), white text, `label-caps` typography. High padding (16px 32px).
- **Secondary/Ghost**: 1px border matching the text color. No fill.
- **SaaS (Design Studio)**: Tighter padding, standard sentence case weight, rounded-md (6px).

### Cards
- **Product Card**: No border. Image occupies 100% width. Typography is center-aligned below. Use a subtle "flash" overlay on hover to show secondary product views.
- **Editorial Card**: Includes a category label in `label-caps` above the headline.

### Input Fields
- **Search/Forms**: Underline-only style for storefronts (minimalist). Full-box with light-grey borders for the Design Studio (functional).

### Storefront Specials
- **Botanical Accents**: Line-drawing decorative elements positioned as absolute-floating assets behind text blocks.
- **Brush Strokes**: Used as dividers or "underlines" for section titles in the Visual Portfolio template.
- **Gift Tags**: Small, pill-shaped chips with a "hole" icon for Personalized Gifts.