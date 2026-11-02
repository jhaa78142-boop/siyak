import { cloneElement, isValidElement } from "react";
import { useI18n } from "../lib/I18nContext";

function translateTitle(node, t) {
  if (typeof node === "string") return t(node);
  if (Array.isArray(node)) return node.map((child) => translateTitle(child, t));
  if (!isValidElement(node)) return node;
  return cloneElement(node, undefined, translateTitle(node.props.children, t));
}

export default function SectionHeader({ eyebrow, title, description, action, actions }) {
  const { t } = useI18n();
  const acts = actions || action;
  return (
    <div className="mm-welcome">
      <div>
        {eyebrow && <p className="mm-eyebrow">{t(eyebrow)}</p>}
        <h1 className="mm-title">{translateTitle(title, t)}</h1>
        {description && <p className="mm-desc">{t(description)}</p>}
      </div>
      {acts && <div className="flex flex-wrap items-center gap-2 shrink-0">{acts}</div>}
    </div>
  );
}
