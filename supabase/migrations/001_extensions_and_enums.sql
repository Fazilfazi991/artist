-- Extensions and enums for the marketplace backend foundation.
create extension if not exists pgcrypto with schema public;
create extension if not exists citext with schema public;

create type public.user_role as enum ('buyer', 'seller', 'admin');
create type public.seller_status as enum ('draft', 'submitted', 'under_review', 'approved', 'rejected', 'suspended');
create type public.product_type as enum ('ready_to_ship', 'customized', 'bespoke');
create type public.product_status as enum ('draft', 'pending_review', 'active', 'hidden', 'rejected', 'archived');
create type public.standard_order_status as enum ('pending_payment', 'paid', 'seller_confirmed', 'in_production', 'ready_to_ship', 'dispatched', 'delivered', 'completed', 'cancelled', 'refund_requested', 'refunded');
create type public.bespoke_order_status as enum ('request_submitted', 'seller_reviewing', 'quote_sent', 'quote_approved', 'deposit_paid', 'in_progress', 'final_payment_pending', 'fully_paid', 'ready_for_delivery', 'completed', 'cancelled');
create type public.payout_status as enum ('pending', 'eligible', 'processing', 'paid', 'held', 'cancelled');
create type public.ticket_status as enum ('open', 'in_progress', 'resolved', 'closed');

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
