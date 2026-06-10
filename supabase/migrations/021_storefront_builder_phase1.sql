alter table public.storefront_settings
  add column if not exists secondary_color text,
  add column if not exists background_color text,
  add column if not exists text_color text,
  add column if not exists button_style text not null default 'rounded',
  add column if not exists font_pairing text not null default 'friendly',
  add column if not exists published_at timestamptz,
  add column if not exists draft_updated_at timestamptz;

alter table public.storefront_settings
  drop constraint if exists storefront_secondary_color_format,
  add constraint storefront_secondary_color_format check (secondary_color is null or secondary_color ~ '^#[0-9A-Fa-f]{6}$');

alter table public.storefront_settings
  drop constraint if exists storefront_background_color_format,
  add constraint storefront_background_color_format check (background_color is null or background_color ~ '^#[0-9A-Fa-f]{6}$');

alter table public.storefront_settings
  drop constraint if exists storefront_text_color_format,
  add constraint storefront_text_color_format check (text_color is null or text_color ~ '^#[0-9A-Fa-f]{6}$');

alter table public.storefront_settings
  drop constraint if exists storefront_button_style_allowed,
  add constraint storefront_button_style_allowed check (button_style in ('rounded', 'pill', 'soft-square'));

alter table public.storefront_settings
  drop constraint if exists storefront_font_pairing_allowed,
  add constraint storefront_font_pairing_allowed check (font_pairing in ('friendly', 'editorial', 'minimal'));

update public.storefront_settings
set
  secondary_color = coalesce(secondary_color, '#F38FA4'),
  background_color = coalesce(background_color, '#FFFFFF'),
  text_color = coalesce(text_color, '#241124'),
  button_style = coalesce(button_style, 'rounded'),
  font_pairing = coalesce(font_pairing, 'friendly'),
  draft_updated_at = coalesce(draft_updated_at, updated_at, now()),
  published_at = case when is_published and published_at is null then coalesce(updated_at, now()) else published_at end;
