import { notFound } from 'next/navigation';
import { Badge, SectionHeading } from '@/components/ui';
import { getCustomOrderEntryContext } from '@/lib/services/custom-orders';
import { submitCustomOrderRequestAction } from '@/app/custom-orders/actions';

export const dynamic = 'force-dynamic';

export default async function ArtisanCustomOrderPage({ params, searchParams }: { params: Promise<{ storeSlug: string }>; searchParams: Promise<Record<string,string|undefined>> }) {
  const { storeSlug } = await params;
  const query = await searchParams;
  const context = await getCustomOrderEntryContext(storeSlug, query.product);
  if (!context) notFound();
  const next = `/artisan/${storeSlug}/custom-order${query.product ? `?product=${query.product}` : ''}`;

  return <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
    <SectionHeading eyebrow={context.seller.store_name} title="Build a custom order brief" copy="Share requirements, references, budget, and flexibility. The artisan will review and send a quote before work begins." />
    {query.error ? <p className="mb-4 rounded-lg border border-rust/30 bg-rust/10 p-3 font-bold text-rust">{query.error}</p> : null}
    <div className="grid min-w-0 gap-5 lg:grid-cols-[.78fr_1.22fr]">
      <aside className="grid h-fit min-w-0 gap-4 rounded-xl border border-line bg-white p-4 shadow-soft sm:p-5">
        <img src={context.product?.product_images?.[0]?.image_url || context.seller.cover_image_url || '/artisan-hero.png'} alt="" className="aspect-[4/3] w-full rounded-lg object-cover"/>
        <div className="min-w-0">
          <Badge tone="sage">Quote before production</Badge>
          <h2 className="mt-3 break-words font-black">{context.product?.name || context.seller.store_name}</h2>
          <p className="mt-2 break-words text-sm leading-6 text-muted">{context.product?.short_description || context.seller.short_bio}</p>
        </div>
        <div className="grid gap-3 rounded-lg bg-paper p-4 text-sm leading-6 text-muted">
          <strong className="text-ink">Good briefs include:</strong>
          <span>Reference photos or links, size, quantity, budget, delivery city, deadline, colors, materials, and where you are flexible.</span>
        </div>
      </aside>

      <form action={submitCustomOrderRequestAction} className="grid min-w-0 gap-5 rounded-xl border border-line bg-white p-4 shadow-soft sm:p-5">
        <input type="hidden" name="seller_id" value={context.seller.id}/>
        <input type="hidden" name="product_id" value={context.product?.id || ''}/>
        <input type="hidden" name="next" value={next}/>

        <FormSection title="1. Project Basics">
          <Input name="title" label="Project title" placeholder="Wedding favour hampers for 120 guests"/>
          <div className="grid min-w-0 gap-4 sm:grid-cols-2">
            <Select name="project_category" label="Category" options={['Personalized gifts', 'Home decor', 'Jewellery', 'Candles', 'Scrapbooks', 'Art and prints', 'Bulk gifting', 'Other']} />
            <Input name="occasion" label="Occasion" required={false} placeholder="Wedding, birthday, corporate gifting"/>
          </div>
          <Textarea name="description" label="Requirement description" placeholder="Tell the artisan what you need, design direction, theme, usage, and any important context."/>
        </FormSection>

        <FormSection title="2. Size, Style, And Materials">
          <Input name="dimensions" label="Size or dimensions" required={false} placeholder="Example: 8 inch plate, 12x18 frame, 100 ml candle"/>
          <div className="grid min-w-0 gap-4 sm:grid-cols-2">
            <Textarea name="preferred_materials" label="Preferred materials" required={false} placeholder="Clay, silver, soy wax, handmade paper..."/>
            <Textarea name="preferred_colors" label="Colors or palette" required={false} placeholder="Plum, blush, gold accents, earthy neutrals..."/>
          </div>
        </FormSection>

        <FormSection title="3. Budget, Quantity, And Timing">
          <div className="grid min-w-0 gap-4 sm:grid-cols-2"><Input name="budget_min" label="Minimum budget" type="number" placeholder="5000"/><Input name="budget_max" label="Maximum budget" type="number" placeholder="15000"/></div>
          <div className="grid min-w-0 gap-4 sm:grid-cols-2"><Input name="quantity" label="Quantity" type="number" placeholder="120"/><Input name="deadline" label="Preferred completion date" type="date"/></div>
          <Input name="delivery_location" label="Delivery location" placeholder="Jaipur, Rajasthan"/>
          <div className="grid gap-2 rounded-lg bg-paper p-4 text-sm font-bold text-muted sm:grid-cols-3">
            <label><input name="flex_budget" type="checkbox" className="mr-2 accent-rust"/>Budget flexible</label>
            <label><input name="flex_deadline" type="checkbox" className="mr-2 accent-rust"/>Deadline flexible</label>
            <label><input name="flex_design" type="checkbox" className="mr-2 accent-rust"/>Design flexible</label>
          </div>
        </FormSection>

        <FormSection title="4. References">
          <Textarea name="buyer_notes" label="Buyer notes" required={false} placeholder="Anything else the artisan should know?"/>
          <Textarea name="reference_links" label="Reference links" required={false} placeholder="Paste Instagram, Pinterest, Google Drive, YouTube, or other inspiration links. One per line or comma separated."/>
          <label className="grid min-w-0 gap-2 text-sm font-black"><span>Reference files</span><input name="reference_files" type="file" multiple accept=".jpg,.jpeg,.png,.webp,.pdf,.mp4,.webm,.mov,video/mp4,video/webm,video/quicktime" className="w-full min-w-0 rounded-lg border border-dashed border-line bg-paper px-4 py-3"/><span className="text-xs leading-5 text-muted">Upload images, PDFs, or short reference videos. Max 50 MB per file.</span></label>
        </FormSection>

        <button className="rounded-lg bg-rust px-5 py-3 font-black text-white">Submit Custom Request</button>
      </form>
    </div>
  </main>;
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) { return <section className="grid gap-4 rounded-lg border border-line bg-surface-low p-4"><h2 className="font-black">{title}</h2>{children}</section>; }
function Input({ name, label, placeholder = '', type = 'text', required = true }: { name: string; label: string; placeholder?: string; type?: string; required?: boolean }) { return <label className="grid min-w-0 gap-2 text-sm font-black"><span>{label}</span><input name={name} type={type} required={required} placeholder={placeholder} className="min-h-11 w-full min-w-0 rounded-lg border border-line bg-white px-4 outline-none"/></label>; }
function Textarea({ name, label, placeholder = '', required = true }: { name: string; label: string; placeholder?: string; required?: boolean }) { return <label className="grid min-w-0 gap-2 text-sm font-black"><span>{label}</span><textarea name={name} required={required} placeholder={placeholder} className="min-h-28 w-full min-w-0 rounded-lg border border-line bg-white px-4 py-3 outline-none"/></label>; }
function Select({ name, label, options }: { name: string; label: string; options: string[] }) { return <label className="grid min-w-0 gap-2 text-sm font-black"><span>{label}</span><select name={name} className="min-h-11 w-full rounded-lg border border-line bg-white px-4">{options.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>; }
