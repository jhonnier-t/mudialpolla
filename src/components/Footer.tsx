export function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 py-6">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-1 px-4 text-center text-xs text-slate-400">
        <span>⚽ Polla Mundialista 2026</span>
        <span>
          Desarrollado por{" "}
          <a
            href="mailto:jhonnier98t@gmail.com"
            className="font-medium text-slate-500 transition-colors hover:text-emerald-700"
          >
            Jhonnier Tangarife
          </a>
        </span>
      </div>
    </footer>
  );
}
