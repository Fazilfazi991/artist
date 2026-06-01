'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Heart } from 'lucide-react';
import { addToCartAction } from '@/app/cart/actions';

export function AddToCartForm({ product, next }: { product: any; next: string }) {
  const [quantity, setQuantity] = useState(1);
  const fields = product.product_customization_fields || [];
  const variants = product.product_variants || [];
  const isBespoke = product.product_type === 'bespoke' || product.type === 'bespoke';
  const quoteHref = product.seller_profiles?.store_slug ? `/artisan/${product.seller_profiles.store_slug}/custom-order${product.slug ? `?product=${product.slug}` : ''}` : `/custom-orders`;
  const maxStock = product.stock_quantity == null ? 99 : Number(product.stock_quantity);
  const timeline = product.product_type === 'ready_to_ship' ? `Dispatches in ${product.dispatch_days || 3} days` : `Production in ${product.production_days || 7} days`;
  const price = product.base_price == null ? 'Quote required' : `Rs. ${Number(product.base_price).toLocaleString('en-IN')}`;
  const variantOptions = useMemo(() => variants.map((variant: any) => `${variant.name}: ${variant.value}${Number(variant.price_adjustment || 0) ? ` (+Rs. ${Number(variant.price_adjustment).toLocaleString('en-IN')})` : ''}`), [variants]);

  if (isBespoke) {
    return <div className="mt-6 rounded-xl border border-line bg-white p-5"><p className="text-sm font-bold text-muted">Bespoke pieces are quoted by the artisan before production.</p><Link href={quoteHref} className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-rust px-5 py-3 font-black text-white">Request Custom Quote</Link></div>;
  }

  return (
    <form action={addToCartAction} encType="multipart/form-data" className="mt-6 grid gap-4 rounded-xl border border-line bg-white p-5">
      <input type="hidden" name="product_id" value={product.id} />
      <input type="hidden" name="next" value={next} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-2xl font-black">{price}</p>
        <p className="text-sm font-bold text-muted">{timeline}</p>
      </div>
      {variants.length ? <label className="grid gap-2 text-sm font-black"><span>Variant</span><select name="variant_id" className="min-h-11 rounded-lg border border-line bg-paper px-4">{variants.map((variant: any, index: number) => <option key={variant.id} value={variant.id}>{variantOptions[index]}</option>)}</select></label> : null}
      {fields.map((field: any) => <CustomizationField key={field.id} field={field} />)}
      <label className="grid gap-2 text-sm font-black"><span>Quantity</span><div className="inline-flex w-fit items-center rounded-lg border border-line bg-white"><button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="grid h-11 w-11 place-items-center" aria-label="Decrease">-</button><input name="quantity" value={quantity} onChange={(event) => setQuantity(Number(event.target.value || 1))} className="h-11 w-14 border-x border-line text-center font-black outline-none" /><button type="button" onClick={() => setQuantity(Math.min(maxStock, quantity + 1))} className="grid h-11 w-11 place-items-center" aria-label="Increase">+</button></div></label>
      {product.product_type === 'ready_to_ship' ? <p className="text-sm font-bold text-muted">{maxStock} in stock</p> : null}
      <div className="flex flex-col gap-3 sm:flex-row">
        <button className="min-h-12 flex-1 rounded-lg bg-rust px-5 py-3 font-black text-white transition hover:bg-rust-hover">Add to Cart</button>
        <button type="submit" name="intent" value="buy_now" className="min-h-12 flex-1 rounded-lg border border-line bg-paper px-5 py-3 font-black">Buy Now</button>
        <button type="button" className="grid min-h-12 w-full place-items-center rounded-lg border border-line bg-white sm:w-12" aria-label="Wishlist"><Heart size={18}/></button>
      </div>
    </form>
  );
}

function CustomizationField({ field }: { field: any }) {
  const name = `custom_${field.id}`;
  const label = `${field.label}${field.is_required ? ' *' : ''}`;
  if (field.field_type === 'textarea') return <label className="grid gap-2 text-sm font-black"><span>{label}</span><textarea name={name} required={field.is_required} maxLength={field.max_length || undefined} placeholder={field.placeholder || ''} className="min-h-28 rounded-lg border border-line bg-paper px-4 py-3 outline-none" /></label>;
  if (field.field_type === 'select') return <label className="grid gap-2 text-sm font-black"><span>{label}</span><select name={name} required={field.is_required} className="min-h-11 rounded-lg border border-line bg-paper px-4">{(field.options || []).map((option: string) => <option key={option} value={option}>{option}</option>)}</select></label>;
  if (field.field_type === 'file') return <label className="grid gap-2 text-sm font-black"><span>{label}</span><input name={name} required={field.is_required} type="file" accept=".jpg,.jpeg,.png,.webp,.pdf" className="rounded-lg border border-dashed border-line bg-paper px-4 py-3" /></label>;
  return <label className="grid gap-2 text-sm font-black"><span>{label}</span><input name={name} required={field.is_required} maxLength={field.max_length || undefined} type={field.field_type === 'number' ? 'number' : field.field_type === 'date' ? 'date' : field.field_type === 'color' ? 'color' : 'text'} placeholder={field.placeholder || ''} className="min-h-11 rounded-lg border border-line bg-paper px-4 outline-none" /></label>;
}
