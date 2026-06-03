"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, X } from "lucide-react";

export function DateRangeFilter({ from, to }: { from: string; to: string }) {
  const router = useRouter();
  const [fromVal, setFromVal] = useState(from);
  const [toVal, setToVal] = useState(to);

  const apply = () => {
    const params = new URLSearchParams();
    if (fromVal) params.set("from", fromVal);
    if (toVal) params.set("to", toVal);
    router.push(`/admin/afspraken?${params.toString()}`);
  };

  const reset = () => {
    setFromVal("");
    setToVal("");
    router.push("/admin/afspraken");
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") apply();
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <input
        type="date"
        value={fromVal}
        onChange={e => setFromVal(e.target.value)}
        onKeyDown={handleKey}
        className="text-sm bg-white/90 text-charcoal rounded-lg px-3 py-2 border border-stone/30 focus:outline-none focus:ring-1 focus:ring-eritrea-blue"
      />
      <span className="text-white/50 text-sm">t/m</span>
      <input
        type="date"
        value={toVal}
        onChange={e => setToVal(e.target.value)}
        onKeyDown={handleKey}
        className="text-sm bg-white/90 text-charcoal rounded-lg px-3 py-2 border border-stone/30 focus:outline-none focus:ring-1 focus:ring-eritrea-blue"
      />
      <button
        onClick={apply}
        className="flex items-center gap-1.5 text-sm font-semibold text-white bg-eritrea-blue px-3 py-2 rounded-lg hover:bg-eritrea-blue/90 transition-colors"
      >
        <Search size={13} /> Filter
      </button>
      {(from || to) && (
        <button
          onClick={reset}
          className="flex items-center gap-1 text-sm text-white/60 hover:text-white transition-colors"
        >
          <X size={13} /> Reset
        </button>
      )}
    </div>
  );
}
