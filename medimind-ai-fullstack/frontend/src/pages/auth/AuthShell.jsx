import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import logo from "../../assets/logo.png";
import LanguageSelector from "../../components/LanguageSelector";

export default function AuthShell({ children, mediaType = "image", mediaSrc, mediaList = [], shellClassName = "" }) {
  const media = mediaList[0] || mediaSrc;
  const isVideo = mediaType === "video" || /\.(mp4|webm|mov)$/i.test(media || "");
  const reducedMotion = useReducedMotion();
  return <main className={`min-h-screen bg-paper text-ink dark:bg-void dark:text-white ${shellClassName}`} data-view-transition="auth-shell"><div className="min-h-screen grid lg:grid-cols-[minmax(360px,0.9fr)_minmax(480px,1.1fr)]">
    <aside className="hidden lg:flex min-h-screen flex-col justify-between bg-ink px-10 py-10 text-white xl:px-14">
      <Link to="/welcome" className="flex w-fit items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-azure-400"><img src={logo} alt="MediMind AI" className="h-10 w-10" /><span className="font-display-modern text-xl font-bold tracking-tight">MediMind AI</span></Link>
      <div className="space-y-8"><div><p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-azure-400">Clinical intelligence</p><h1 className="max-w-lg font-display text-4xl font-bold leading-tight xl:text-5xl">Better context for every care decision.</h1><p className="auth-aside-copy">One calm, connected layer for the moments that matter in care.</p></div>{media && <motion.div initial={reducedMotion ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65 }} className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">{isVideo ? <video src={media} autoPlay muted loop playsInline preload="metadata" className="aspect-[16/10] w-full object-cover" aria-label="MediMind AI product preview" /> : <img src={media} alt="MediMind AI product preview" className="aspect-[16/10] w-full object-cover" />}</motion.div>}</div>
      <div className="flex items-center gap-2 border-t border-white/10 pt-5 text-xs text-slate-300"><ShieldCheck size={15} className="text-emerald-400" aria-hidden="true" />Encrypted session. Your health information stays private.</div>
    </aside>
    <section className="relative flex min-h-screen items-start justify-center px-4 py-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] sm:px-8 sm:py-10 lg:items-center lg:px-12"><div className="absolute right-4 top-4 z-10 rounded-lg border border-slate-200 bg-white/90 px-2 py-2 text-sm text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"><LanguageSelector /></div><div className="w-full max-w-xl"><Link to="/welcome" className="mb-10 flex w-fit items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-azure-600 lg:hidden"><img src={logo} alt="MediMind AI" className="h-8 w-8" /><span className="font-display-modern text-lg font-bold dark:text-white">MediMind AI</span></Link>{children}</div></section>
  </div></main>;
}