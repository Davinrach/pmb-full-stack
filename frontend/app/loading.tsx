export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-[#0d3830] animate-spin" />
        </div>
        <p className="text-sm font-semibold text-slate-500 animate-pulse">
          Memuat halaman...
        </p>
      </div>
    </div>
  );
}
