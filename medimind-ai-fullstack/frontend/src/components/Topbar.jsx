import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, useScroll, useSpring } from "framer-motion";
import { Menu, Bell, Search, Sun, Moon, ChevronRight, Command } from "lucide-react";
import { roleTheme } from "../lib/nav";
import { useTheme } from "../lib/ThemeContext";
import CommandPalette from "./CommandPalette";
import NotificationDropdown from "./NotificationDropdown";
import { IconButton } from "./premium/Controls";
import { useI18n } from "../lib/I18nContext";
import LanguageSelector from "./LanguageSelector";

function useBreadcrumbs(items = []) {
  const location = useLocation();
  const active = items.find((item) =>
    item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)
  );
  return [
    { label: "Home", to: items.find((i) => i.end)?.to || "/" },
    active && active.label !== "Dashboard" ? { label: active.label, to: active.to } : null,
  ].filter(Boolean);
}

export default function Topbar({ role, items = [], onMenu, menuOpen = false, title, user }) {
  const theme = roleTheme[role];
  const { t } = useI18n();
  const { dark, toggleDark } = useTheme();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);
  const bellRef = useRef(null);
  const crumbs = useBreadcrumbs(items);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 28, restDelta: 0.001 });

  useEffect(() => {
    const onKeyDown = (e) => {
      const isK = e.key === "k" || e.key === "K";
      if ((e.metaKey || e.ctrlKey) && isK) {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setAvatarLoadFailed(false);
  }, [user?.avatarUrl]);

  return (
    <>
      <motion.div className="scroll-progress" style={{ scaleX }} />
      <header
        className={[
          "mm-topbar sticky top-0 z-30 px-4 lg:px-8 py-3 flex items-center gap-3 transition-shadow duration-300",
          scrolled ? "shadow-[0_8px_30px_-20px_rgba(15,23,42,0.35)]" : "",
        ].join(" ")}
      >
        <button type="button" onClick={onMenu} className="lg:hidden mm-icon-btn" aria-label={menuOpen ? t("Close navigation menu") : t("Open navigation menu")} aria-expanded={menuOpen} aria-controls="dashboard-navigation">
          <Menu size={18} />
        </button>

        <nav aria-label="Breadcrumb" className="hidden md:flex items-center gap-1.5 text-xs text-slate-400 min-w-0">
          {crumbs.map((c, i) => (
            <span key={c.to} className="inline-flex items-center gap-1.5 min-w-0">
              {i > 0 && <ChevronRight size={12} className="opacity-50 shrink-0" />}
              {i === crumbs.length - 1 ? (
                <span className="font-semibold text-ink truncate">{t(c.label)}</span>
              ) : (
                <Link to={c.to} className="hover:text-ink truncate">
                  {t(c.label)}
                </Link>
              )}
            </span>
          ))}
        </nav>

        <button
          onClick={() => setPaletteOpen(true)}
          className="hidden lg:flex mm-search text-left ml-2"
        >
          <Search size={14} />
          <span className="flex-1">{t("Search patients, reports, appointments…")}</span>
          <kbd className="text-[10px] font-mono text-slate-400 border border-slate-300/60 dark:border-slate-600 rounded px-1.5 py-0.5 inline-flex items-center gap-0.5">
            <Command size={9} />K
          </kbd>
        </button>

        <div className="flex-1 lg:hidden font-display font-semibold text-ink tracking-tight truncate">{title}</div>

        <div className="flex items-center gap-1.5 ml-auto">
          <button
            onClick={() => setPaletteOpen(true)}
            className="lg:hidden mm-icon-btn"
            aria-label="Search"
          >
            <Search size={15} />
          </button>
          <LanguageSelector className="inline-flex max-w-[6.5rem] gap-1 rounded-lg px-1 py-1 text-[11px] text-slate-600 dark:text-slate-300 sm:max-w-none sm:px-2 sm:text-xs" />
          <IconButton icon={dark ? Sun : Moon} label="Toggle theme" onClick={toggleDark} />
          <div className="relative">
            <button
              ref={bellRef}
              onClick={() => setNotifOpen((o) => !o)}
              className="mm-icon-btn relative"
              aria-label={t("Notifications")}
            >
              <Bell size={15} />
            </button>
            <NotificationDropdown open={notifOpen} onClose={() => setNotifOpen(false)} role={role} anchorRef={bellRef} />
          </div>
          <span className="mm-status-chip hidden sm:inline-flex">
            <i /> {t("Systems live")}
          </span>
          {user && (
            <div
              className="hidden sm:grid relative place-items-center h-9 w-9 overflow-hidden rounded-xl text-white text-xs font-bold ml-1"
              style={{ background: `linear-gradient(145deg, ${theme.accent}, ${theme.accentDeep})` }}
              title={user.name}
            >
              {user.avatarUrl && !avatarLoadFailed ? (
                <img
                  src={user.avatarUrl}
                  alt={`${user.name} profile`}
                  className="absolute inset-0 h-full w-full object-cover"
                  onError={() => setAvatarLoadFailed(true)}
                />
              ) : (
                user.name?.split(" ").map((n) => n[0]).slice(0, 2).join("")
              )}
            </div>
          )}
        </div>

        <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} role={role} items={items} />
      </header>
    </>
  );
}
