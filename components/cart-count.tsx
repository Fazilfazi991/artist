'use client';

import { useEffect, useState } from 'react';

export function CartCountBadge() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let active = true;
    fetch('/api/cart/count', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => { if (active) setCount(Number(data.count || 0)); })
      .catch(() => {});
    return () => { active = false; };
  }, []);
  if (!count) return null;
  return <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-rust px-1 text-[11px] font-black text-white">{count}</span>;
}
