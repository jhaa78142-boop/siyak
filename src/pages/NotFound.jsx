import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import SEO from "../components/SEO";
import { WebPageLd } from "../components/JsonLd";
import { absoluteUrl } from "../lib/site";

export default function NotFound() {
  return (
    <section className="bg-ink text-paper min-h-[70vh] flex items-center justify-center text-center px-6">
      <SEO
        title="Page Not Found"
        description="The page you are looking for couldn't be found. Return to the Siyak Steel International homepage." 
        noIndex
      />
      <WebPageLd
        url={absoluteUrl("/404")}
        title="Page Not Found"
        description="The page you are looking for couldn't be found. Return to the Siyak Steel International homepage."
      />
      <div>
        <div
          className="font-display text-8xl text-stroke"
          style={{ "--stroke-color": "#14b8ad" }}
        >
          404
        </div>
        <h1 className="font-display uppercase text-2xl mt-4">Page not found</h1>
        <p className="mt-3 text-steel max-w-sm mx-auto">
          The page you're looking for doesn't exist or may have moved.
        </p>
        <Link
          to="/"
          className="mt-8 inline-flex items-center gap-2 bg-teal hover:bg-teal-light text-ink font-display uppercase text-sm tracking-wide px-6 py-3.5 rounded-sm clip-corner transition-colors"
        >
          <ArrowLeft size={16} /> Back to Home
        </Link>
      </div>
    </section>
  );
}
