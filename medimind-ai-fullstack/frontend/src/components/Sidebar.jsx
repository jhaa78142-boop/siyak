import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { LogOut, X, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import logo from "../assets/logo.png";
import { roleTheme } from "../lib/nav";
import { useAuth } from "../lib/AuthContext";
import { useLocalStorage } from "./premium/hooks";
import { springSnappy, easePremium } from "./premium/motion";
import { useI18n } from "../lib/I18nContext";

export default function Sidebar({ role, items, user, open, onClose, collapsed, onToggleCollapse }) {
  const theme = roleTheme[role];
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const { t } = useI18n();

  const handleSignOut = async () => {
    try {
      await logout();
    } finally {
      navigate("/login", { replace: true });
    }
  };

  const isItemActive = (item) =>
    item.end ? location.pathname === item.to : location.pathname.startsWith(item.to);

  const rail = collapsed;

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-[3px]"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <aside
        id="dashboard-navigation"
        aria-label={`${t(role)} ${t("navigation")}`}
        className={[
          "mm-sidebar fixed lg:relative z-50 top-0 left-0 h-full shrink-0 flex flex-col",
          "transition-[width,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
          rail ? "w-[4.5rem]" : "w-[17.5rem]",
          open ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0",
        ].join(" ")}
      >
        <div className={`flex items-center ${rail ? "justify-center px-2" : "justify-between px-5"} pt-5 pb-4`}>
          <div className={`flex items-center ${rail ? "justify-center" : "gap-2.5"}`}>
            <div className="relative">
              <img src={logo} alt="MediMind AI" className="h-9 w-9" />
              <span
                className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white"
                style={{ background: theme.accent }}
                aria-hidden
              />
            </div>
            {!rail && (
              <div>
                <p className="mm-sidebar-brand font-display font-semibold text-[15px] leading-none text-ink">MediMind</p>
                <p className="text-[11px] text-slate-400 mt-1.5 capitalize tracking-wide">{role} atelier</p>
              </div>
            )}
          </div>
          <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-ink" aria-label={t("Close menu")}>
            <X size={20} />
          </button>
        </div>

        <nav className={`flex-1 overflow-y-auto py-2 space-y-0.5 scrollbar-none ${rail ? "px-2" : "px-3"}`}>
          {items.map((item, index) => {
            const active = isItemActive(item);
            const showGroupHeader = !rail && item.group && item.group !== items[index - 1]?.group;
            return (
              <div key={item.to}>
                {showGroupHeader && (
                  <motion.p
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, ease: easePremium }}
                    className="mm-sidebar-group px-3.5 pt-4 pb-1.5 first:pt-2"
                  >
                    {t(item.group)}
                  </motion.p>
                )}
                <NavLink
                  to={item.to}
                  end={item.end}
                  onClick={onClose}
                  title={rail ? t(item.label) : undefined}
                  className={`mm-nav-item ${active ? "is-active" : ""} ${rail ? "justify-center px-0" : ""}`}
                >
                  {active && (
                    <motion.span
                      layoutId="sidebar-active-pill"
                      className="mm-nav-active"
                      style={{
                        background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentDeep})`,
                        boxShadow: `0 8px 20px -10px ${theme.accent}`,
                      }}
                      transition={springSnappy}
                    />
                  )}
                  {active && !rail && (
                    <motion.span
                      layoutId="sidebar-glow"
                      className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full"
                      style={{ background: "#fff", boxShadow: `0 0 12px ${theme.accent}` }}
                      transition={springSnappy}
                    />
                  )}
                  <item.icon size={16} strokeWidth={2.1} className="relative z-[1] shrink-0" />
                  {!rail && <span className="truncate relative z-[1]">{t(item.label)}</span>}
                </NavLink>
              </div>
            );
          })}
        </nav>

        <div className={`border-t border-slate-100/80 dark:border-slate-800/80 ${rail ? "p-2" : "p-3"}`}>
          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden lg:flex w-full items-center justify-center gap-2 text-[12px] font-medium text-slate-400 hover:text-ink rounded-xl py-2 mb-2 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
            aria-label={rail ? t("Expand sidebar") : t("Collapse sidebar")}
          >
            {rail ? <PanelLeftOpen size={16} /> : <><PanelLeftClose size={15} /> {t("Collapse")}</>}
          </button>

          <div
            className={`rounded-xl flex items-center gap-2.5 mb-2 ${rail ? "p-2 justify-center" : "p-3"}`}
            style={{ background: `${theme.accent}14` }}
          >
            <div className="relative shrink-0">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="h-9 w-9 rounded-xl object-cover border border-white/30" />
              ) : (
                <div
                  className="h-9 w-9 rounded-xl flex items-center justify-center text-white text-sm font-semibold"
                  style={{ background: `linear-gradient(145deg, ${theme.accent}, ${theme.accentDeep})` }}
                >
                  {user.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                </div>
              )}
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-white" title={t("Online")} />
            </div>
            {!rail && (
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-ink truncate">{user.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{user.sub}</p>
              </div>
            )}
          </div>
          <button
            onClick={handleSignOut}
            className={`w-full flex items-center justify-center gap-2 text-[13px] font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl py-2.5 transition-colors ${rail ? "px-0" : ""}`}
            title={t("Sign out")}
          >
            <LogOut size={15} />
            {!rail && t("Sign out")}
          </button>
        </div>
      </aside>
    </>
  );
}

export function useSidebarCollapsed() {
  return useLocalStorage("mm-sidebar-collapsed", false);
}
