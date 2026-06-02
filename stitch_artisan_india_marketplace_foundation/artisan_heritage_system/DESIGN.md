---
name: Artisan Heritage System
colors:
  surface: '#fcf9f8'
  surface-dim: '#dcd9d9'
  surface-bright: '#fcf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f0eded'
  surface-container-high: '#eae7e7'
  surface-container-highest: '#e5e2e1'
  on-surface: '#1c1b1b'
  on-surface-variant: '#56423c'
  inverse-surface: '#313030'
  inverse-on-surface: '#f3f0ef'
  outline: '#8a726b'
  outline-variant: '#ddc0b8'
  surface-tint: '#a04021'
  primary: '#9c3c1e'
  on-primary: '#ffffff'
  primary-container: '#bc5434'
  on-primary-container: '#fffaf9'
  inverse-primary: '#ffb59f'
  secondary: '#50644b'
  on-secondary: '#ffffff'
  secondary-container: '#d3e9ca'
  on-secondary-container: '#566a51'
  tertiary: '#844f00'
  on-tertiary: '#ffffff'
  tertiary-container: '#a4660d'
  on-tertiary-container: '#fffbfa'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbd1'
  primary-fixed-dim: '#ffb59f'
  on-primary-fixed: '#3a0a00'
  on-primary-fixed-variant: '#81290c'
  secondary-fixed: '#d3e9ca'
  secondary-fixed-dim: '#b7cdaf'
  on-secondary-fixed: '#0f1f0c'
  on-secondary-fixed-variant: '#394c35'
  tertiary-fixed: '#ffddbb'
  tertiary-fixed-dim: '#ffb868'
  on-tertiary-fixed: '#2b1700'
  on-tertiary-fixed-variant: '#673d00'
  background: '#fcf9f8'
  on-background: '#1c1b1b'
  surface-variant: '#e5e2e1'
typography:
  headline-xl:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Playfair Display
    fontSize: 36px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Playfair Display
    fontSize: 28px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-sm:
    fontFamily: Playfair Display
    fontSize: 22px
    fontWeight: '500'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1'
  headline-xl-mobile:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 28px
    fontWeight: '600'
    lineHeight: '1.2'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 64px
  container-max: 1280px
---

## Brand & Style

The design system is anchored in the concept of "Modern Heritage." It celebrates the tactile beauty of Indian craftsmanship through a lens of contemporary editorial design. The aesthetic is premium and intentional, avoiding the cluttered noise of traditional e-commerce in favor of a sophisticated, gallery-like experience.

The target audience consists of discerning collectors and conscious consumers who value the story behind the product. The UI should evoke a sense of warmth, trust, and timelessness. By utilizing generous whitespace and a "less but better" approach to interface elements, the design system allows the vibrant textures and colors of the artisanal products to remain the primary focus. 

The style is **Modern Editorial**, characterized by high-contrast typography, a restrained earthy palette, and subtle tactile details that mimic the quality of high-end print media.

## Colors

The palette is inspired by natural pigments and raw materials found in Indian craft.

- **Primary (Terracotta):** Used for key calls to action and brand highlights. It provides warmth and a connection to the earth without being overly aggressive.
- **Secondary (Muted Olive):** Used for success states, category markers, or subtle background variations to provide a natural balance to the terracotta.
- **Tertiary (Saffron):** A soft, muted gold used sparingly for accents, badges, or special "artisan choice" indicators.
- **Neutral (Deep Charcoal):** Used for primary text and iconography. It is a "warm black" that provides high legibility without the harshness of pure hex #000.
- **Background (Cream/Off-White):** A sophisticated alternative to pure white or generic beige. It provides a luminous, paper-like quality to the interface.

**Avoid:** Do not use pure grey tones or vibrant neons. Ensure all color combinations pass WCAG AA accessibility standards for text-on-background contrast.

## Typography

This design system uses a dual-typeface strategy to bridge the gap between heritage and utility.

1. **Headlines (Playfair Display):** Reserved for marketing, product names, and editorial storytelling. Use the high-contrast weights to create a sense of luxury.
2. **UI & Body (Plus Jakarta Sans):** Used for all functional elements, descriptions, and metadata. It provides a modern, approachable feel with high legibility even at smaller sizes.

**Guidelines:**
- Maintain generous line-heights (1.6) for body text to ensure a relaxed reading experience.
- Use uppercase labels with slight letter spacing for categories and small headers to add an architectural feel to the layout.
- Never use a font size smaller than 12px.

## Layout & Spacing

The layout philosophy follows a **Fixed-Fluid Hybrid** model. Content is contained within a maximum width of 1280px for desktop to ensure readability, while the background and secondary decorative elements may bleed to the edges.

- **Grid:** A 12-column grid is used for desktop (64px margins), a 6-column grid for tablet, and a 2-column grid for mobile (16px margins).
- **Rhythm:** An 8px base unit drives all spacing. For editorial sections, utilize "Negative Space as a Feature"—do not be afraid of large padding blocks (80px+) between major sections to allow the design to breathe.
- **Padding:** Components like cards and modals should use generous internal padding (min 24px) to maintain the premium feel.

## Elevation & Depth

To maintain a tactile, "handmade" feel, this design system avoids heavy shadows and deep 3D effects.

- **Tactile Surfaces:** Depth is primarily communicated through subtle tonal changes and refined 1px borders (#E5E2DA).
- **Shadows:** When necessary (e.g., for elevated cards or dropdowns), use "Ambient Glows"—very low-opacity (4-6%), highly diffused shadows with a slight warm tint from the primary or neutral color.
- **Layers:** Use the Cream background as the base. Higher-level containers (like a shopping bag preview) use a pure white background with a 1px border to stand out.

## Shapes

The shape language is organic yet disciplined. 

- **Corners:** Moderate rounded corners (8px for standard components, 16px for larger cards) soften the UI, making it feel more approachable and less "industrial."
- **Buttons:** Use standard rounded corners rather than full pills to maintain a sophisticated architectural look.
- **Media:** Product imagery should follow the same corner radius as cards to create a cohesive container system.

## Components

### Buttons
- **Primary:** Terracotta background, Cream text. No shadow, 1px inset border for depth.
- **Secondary:** Muted Olive background, Cream text.
- **Outline:** 1px Neutral (#1A1A1A) border, transparent background, Neutral text. Used for less prominent actions.

### Cards
Cards are the heart of the marketplace. They should feature:
- 1px border (#E5E2DA).
- Minimum 24px internal padding.
- Product titles in Playfair Display (Medium weight).
- Price and artisan location in Plus Jakarta Sans.

### Input Fields
- Clean, 1px border on the bottom or all sides.
- Label text sits above the field in `label-lg` style.
- Focus state: Border color transitions to Terracotta.

### Chips & Badges
- Used for categories or tags (e.g., "Hand-loomed", "Organic Dye").
- Use the Secondary (Olive) or Tertiary (Saffron) colors with high transparency (10%) and dark text for a sophisticated look.

### Navigation
- Top navigation should be minimal.
- Use the neutral text color for links with a 2px Terracotta underline on hover.