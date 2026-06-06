const countryCodes = [
  ["India", "+91"],
  ["United Arab Emirates", "+971"],
  ["Qatar", "+974"],
  ["Saudi Arabia", "+966"],
  ["Kuwait", "+965"],
  ["Bahrain", "+973"],
  ["Oman", "+968"],
  ["United States", "+1"],
  ["United Kingdom", "+44"]
] as const;

export function PhoneCountryField({ defaultCode = "+91", required = true, label = "Mobile number", codeName = "phoneCountryCode", numberName = "phoneLocal" }: { defaultCode?: string; required?: boolean; label?: string; codeName?: string; numberName?: string }) {
  return <div className="grid gap-2 text-sm font-black">
    <span>{label}</span>
    <div className="grid grid-cols-[132px_1fr] overflow-hidden rounded-lg border border-line bg-white focus-within:border-rust">
      <select name={codeName} defaultValue={defaultCode} className="min-h-12 border-r border-line bg-paper px-3 text-sm outline-none" aria-label="Country code">
        {countryCodes.map(([country, code]) => <option key={`${country}-${code}`} value={code}>{code} {country}</option>)}
      </select>
      <input name={numberName} className="min-h-12 min-w-0 bg-white px-4 outline-none" placeholder="Mobile number" inputMode="tel" required={required} />
    </div>
  </div>;
}
