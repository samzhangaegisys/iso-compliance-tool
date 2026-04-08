"use client";

export default function FloatingCards() {
  const cards = [
    {
      delay: "0s",
      position: "top-4 -left-4 lg:-left-16",
      content: (
        <div className="flex items-center gap-2.5">
          <div className="size-7 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
            <span className="text-emerald-400 text-xs font-bold">✓</span>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-white leading-tight">ISO 27001 Audit Complete</p>
            <p className="text-[10px] text-emerald-400">Certified · Just now</p>
          </div>
        </div>
      ),
    },
    {
      delay: "0.5s",
      position: "top-1/3 -right-4 lg:-right-12",
      content: (
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[11px] font-semibold text-white">Gap Analysis</p>
            <span className="text-[10px] font-bold text-blue-400">94%</span>
          </div>
          <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden w-32">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
              style={{ width: "94%" }}
            />
          </div>
          <p className="text-[10px] text-slate-400 mt-1">6 controls remaining</p>
        </div>
      ),
    },
    {
      delay: "1s",
      position: "bottom-1/3 -left-4 lg:-left-12",
      content: (
        <div className="flex items-center gap-2.5">
          <div className="flex -space-x-1.5">
            {["JD", "SM", "AL"].map((init) => (
              <div
                key={init}
                className="size-5 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 border border-slate-800 flex items-center justify-center text-[8px] font-bold text-white"
              >
                {init[0]}
              </div>
            ))}
          </div>
          <div>
            <p className="text-[11px] font-semibold text-white">3 new tasks assigned</p>
            <p className="text-[10px] text-slate-400">To you and 2 others</p>
          </div>
        </div>
      ),
    },
    {
      delay: "1.5s",
      position: "bottom-8 -right-4 lg:-right-8",
      content: (
        <div className="flex items-center gap-2.5">
          <div className="size-7 rounded-lg bg-blue-500/20 border border-blue-500/40 flex items-center justify-center shrink-0">
            <span className="text-blue-400 text-xs">📎</span>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-white">Evidence uploaded</p>
            <p className="text-[10px] text-slate-400">by Sarah M. · 2 min ago</p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <>
      {cards.map((card, i) => (
        <div
          key={i}
          className={`absolute z-10 ${card.position}`}
          style={{
            animation: `float 4s ease-in-out infinite`,
            animationDelay: card.delay,
          }}
        >
          <div className="bg-slate-900/90 backdrop-blur-sm border border-slate-700/60 rounded-xl px-3.5 py-2.5 shadow-xl shadow-black/40 min-w-[160px]">
            {card.content}
          </div>
        </div>
      ))}
    </>
  );
}
