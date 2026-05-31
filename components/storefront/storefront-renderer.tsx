import type { StorefrontContext } from '@/lib/storefront/storefront-types';
import { BoutiqueBrandTemplate, CleanGridTemplate, PersonalizedGiftsTemplate, VisualPortfolioTemplate, WarmEditorialTemplate } from './templates/all';

export function StorefrontRenderer({ context }: { context: StorefrontContext }) {
  switch (context.settings.template_key) {
    case 'clean-grid': return <CleanGridTemplate context={context}/>;
    case 'personalized-gifts': return <PersonalizedGiftsTemplate context={context}/>;
    case 'visual-portfolio': return <VisualPortfolioTemplate context={context}/>;
    case 'boutique-brand': return <BoutiqueBrandTemplate context={context}/>;
    default: return <WarmEditorialTemplate context={context}/>;
  }
}