import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar, { useSidebarCollapsed } from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { AuroraBackground } from "../components/premium/Effects";
import { useIsLowEnd } from "../components/premium/hooks";
import { pageReveal } from "../components/premium/motion";
import { useState } from "react";

export default function DashboardLayout({ role, items, user }) {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useSidebarCollapsed();
  const lowEnd = useIsLowEnd();
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  return (
    <div
      className={`mm-console h-screen flex overflow-hidden relative ${lowEnd ? "perf-lite" : ""}`}
      data-role={role}
    >
      {/* Static ambient backdrop: an animating full-screen blur layer behind
          every glass panel forces a full re-blur each frame. Freezing it keeps
          the same gradient look at a fraction of the GPU cost. */}
      <AuroraBackground className="fixed inset-0 z-0 opacity-90" animated={false} />
      <Sidebar
        role={role}
        items={items}
        user={user}
        open={open}
        onClose={() => setOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((c) => !c)}
      />
      <div className="flex-1 min-w-0 flex flex-col relative z-[1] overflow-y-auto overflow-x-hidden">
        <Topbar
          role={role}
          items={items}
          user={user}
          menuOpen={open}
          onMenu={() => setOpen((isOpen) => !isOpen)}
          title="MediMind AI"
        />
        <main className="flex-1 px-4 lg:px-8 pt-4 pb-8 max-w-[1440px] w-full mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={pageReveal.initial}
              animate={pageReveal.animate}
              exit={pageReveal.exit}
              transition={pageReveal.transition}
              className="w-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
