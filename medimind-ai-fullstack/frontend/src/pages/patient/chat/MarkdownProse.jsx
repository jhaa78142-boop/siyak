import { memo, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { sanitizePartial } from "./utils";

const remarkPlugins = [remarkGfm];

const components = {
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ),
  table: ({ children }) => (
    <div className="mm-md-table-wrap">
      <table>{children}</table>
    </div>
  ),
};

function MarkdownProse({ text, streaming = false }) {
  const cleaned = useMemo(() => sanitizePartial(text), [text]);

  if (!cleaned) {
    return streaming ? <span className="mm-caret" aria-hidden /> : null;
  }

  return (
    <div className={`mm-prose mm-md ${streaming ? "mm-md--streaming" : ""}`}>
      <ReactMarkdown remarkPlugins={remarkPlugins} components={components}>
        {cleaned}
      </ReactMarkdown>
      {streaming ? <span className="mm-caret" aria-hidden /> : null}
    </div>
  );
}

export default memo(MarkdownProse);
