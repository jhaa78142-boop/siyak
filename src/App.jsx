import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { Suspense, lazy, useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import Navbar from "./components/Navbar";
import TopBar from "./components/TopBar";
import Footer from "./components/Footer";
import WhatsAppFloat from "./components/WhatsAppFloat";
import ScrollToTopOnRoute from "./components/ScrollToTopOnRoute";
import PageLoader from "./components/PageLoader";
import PageTransition from "./components/PageTransition";
import PageSkeleton from "./components/PageSkeleton";
import QuoteDrawer from "./components/QuoteDrawer";
import CookieConsent from "./components/CookieConsent";
import { trackPageView } from "./lib/tracking";

const Home = lazy(() => import("./pages/Home"));
const About = lazy(() => import("./pages/About"));
const Products = lazy(() => import("./pages/Products"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const MaterialTypeDetail = lazy(() => import("./pages/MaterialTypeDetail"));
const MaterialVariantDetail = lazy(() => import("./pages/MaterialVariantDetail"));
const NickelAlloyCatalogue = lazy(() => import("./pages/NickelAlloyCatalogue"));
const Quality = lazy(() => import("./pages/Quality"));
const Contact = lazy(() => import("./pages/Contact"));
const HSCodes = lazy(() => import("./pages/HSCodes"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const NotFound = lazy(() => import("./pages/NotFound"));

function AnimatedRoutes() {
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={
          <Suspense fallback={<PageSkeleton />}>
            <PageTransition><Home /></PageTransition>
          </Suspense>
        } />
        <Route path="/about" element={
          <Suspense fallback={<PageSkeleton />}>
            <PageTransition><About /></PageTransition>
          </Suspense>
        } />
        <Route path="/products" element={
          <Suspense fallback={<PageSkeleton />}>
            <PageTransition><Products /></PageTransition>
          </Suspense>
        } />
        <Route path="/nickel-alloy-catalogue" element={
          <Suspense fallback={<PageSkeleton />}>
            <PageTransition><NickelAlloyCatalogue /></PageTransition>
          </Suspense>
        } />
        <Route path="/products/:slug" element={
          <Suspense fallback={<PageSkeleton />}>
            <PageTransition><ProductDetail /></PageTransition>
          </Suspense>
        } />
        <Route path="/products/:slug/:typeSlug" element={
          <Suspense fallback={<PageSkeleton />}>
            <PageTransition><MaterialTypeDetail /></PageTransition>
          </Suspense>
        } />
        <Route path="/products/:slug/:typeSlug/:variantSlug" element={
          <Suspense fallback={<PageSkeleton />}>
            <PageTransition><MaterialVariantDetail /></PageTransition>
          </Suspense>
        } />
        <Route path="/industries" element={<Navigate to="/#industries" replace />} />
        <Route path="/quality" element={
          <Suspense fallback={<PageSkeleton />}>
            <PageTransition><Quality /></PageTransition>
          </Suspense>
        } />
        <Route path="/contact" element={
          <Suspense fallback={<PageSkeleton />}>
            <PageTransition><Contact /></PageTransition>
          </Suspense>
        } />
        <Route path="/hs-codes" element={
          <Suspense fallback={<PageSkeleton />}>
            <PageTransition><HSCodes /></PageTransition>
          </Suspense>
        } />
        <Route path="/privacy-policy" element={
          <Suspense fallback={<PageSkeleton />}>
            <PageTransition><PrivacyPolicy /></PageTransition>
          </Suspense>
        } />
        <Route path="/terms-of-service" element={
          <Suspense fallback={<PageSkeleton />}>
            <PageTransition><TermsOfService /></PageTransition>
          </Suspense>
        } />
        <Route path="*" element={
          <Suspense fallback={<PageSkeleton />}>
            <PageTransition><NotFound /></PageTransition>
          </Suspense>
        } />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [cookieSettingsOpen, setCookieSettingsOpen] = useState(false);
  const [consentPending, setConsentPending] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage?.getItem("siyak_analytics_consent");
    setConsentPending(!saved);
  }, []);

  const cookieBannerVisible = cookieSettingsOpen || consentPending;

  const closeCookieBanner = () => {
    setCookieSettingsOpen(false);
    setConsentPending(false);
  };

  return (
    <>
      <PageLoader />
      <ScrollToTopOnRoute />
      <TopBar />
      <Navbar onOpenQuote={() => setQuoteOpen(true)} />
      <main className="flex-1">
        <AnimatedRoutes />
      </main>
      <Footer onOpenCookieSettings={() => setCookieSettingsOpen(true)} />
      <WhatsAppFloat hideForCookieBanner={cookieBannerVisible} />
      <QuoteDrawer open={quoteOpen} onClose={() => setQuoteOpen(false)} />
      <CookieConsent
        open={cookieSettingsOpen}
        onClose={closeCookieBanner}
      />
    </>
  );
}
