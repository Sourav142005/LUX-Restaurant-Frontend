import React from "react";

/**
 * Safely parse inline markdown (bold, italic, code) into React elements
 * without using innerHTML or unsafe string injection.
 */
function parseInline(text) {
  if (!text) return "";

  const parts = [];
  // Matches **bold**, *italic*, and `code`
  const regex = /(\*\*[^*]+?\*\*|\*[^*]+?\*|`[^`]+?`)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith("**") && token.endsWith("**")) {
      const content = token.slice(2, -2);
      parts.push(
        <strong key={`b-${match.index}`} className="font-bold text-[#0B0B0B]">
          {content}
        </strong>
      );
    } else if (token.startsWith("*") && token.endsWith("*")) {
      const content = token.slice(1, -1);
      parts.push(
        <em key={`i-${match.index}`} className="italic text-[#4A4036]">
          {content}
        </em>
      );
    } else if (token.startsWith("`") && token.endsWith("`")) {
      const content = token.slice(1, -1);
      parts.push(
        <code
          key={`c-${match.index}`}
          className="rounded bg-[#F4EFE6] px-1 py-0.5 text-xs font-mono text-[#8B6B38]"
        >
          {content}
        </code>
      );
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}

/**
 * Clean, safe Markdown block renderer for Luci chat replies.
 * Handles headings, bullet lists, paragraphs, bold text, and currency cleanly.
 */
export default function FormattedMessage({ text }) {
  if (!text) return null;

  const rawLines = text.split(/\r?\n/);
  const blocks = [];
  let currentList = null;

  for (let i = 0; i < rawLines.length; i++) {
    const rawLine = rawLines[i];
    const trimmed = rawLine.trim();

    if (!trimmed) {
      if (currentList) {
        blocks.push({ type: "list", items: currentList });
        currentList = null;
      }
      continue;
    }

    // List item detection: bullet (•, -, *), or numbered (1., 2.)
    // Does not match bold markers '**Item**' as a list
    const listMatch = trimmed.match(/^([•\-]|\*(?!\*)|(?:\d+\.))\s+(.+)$/);
    if (listMatch) {
      if (!currentList) currentList = [];
      currentList.push(listMatch[2]);
      continue;
    }

    if (currentList) {
      blocks.push({ type: "list", items: currentList });
      currentList = null;
    }

    // Header detection: #, ##, ###
    const headerMatch = trimmed.match(/^(#{1,3})\s+(.+)$/);
    if (headerMatch) {
      blocks.push({
        type: "header",
        level: headerMatch[1].length,
        content: headerMatch[2]
      });
      continue;
    }

    // Standard paragraph line
    blocks.push({
      type: "p",
      content: trimmed
    });
  }

  if (currentList) {
    blocks.push({ type: "list", items: currentList });
  }

  return (
    <div className="space-y-2 text-xs sm:text-sm text-[#2B1F14] leading-relaxed">
      {blocks.map((b, idx) => {
        if (b.type === "header") {
          return (
            <h4
              key={`h-${idx}`}
              className="font-extrabold text-[#0B0B0B] text-xs sm:text-sm pt-1 tracking-wide"
            >
              {parseInline(b.content)}
            </h4>
          );
        }
        if (b.type === "list") {
          return (
            <ul key={`ul-${idx}`} className="space-y-1.5 my-1.5 pl-0.5">
              {b.items.map((item, itemIdx) => (
                <li
                  key={`li-${itemIdx}`}
                  className="flex items-start gap-2 text-xs sm:text-sm leading-normal"
                >
                  <span className="text-[#D4AF7C] mt-1 shrink-0 font-bold select-none">•</span>
                  <span className="flex-1">{parseInline(item)}</span>
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={`p-${idx}`} className="leading-relaxed">
            {parseInline(b.content)}
          </p>
        );
      })}
    </div>
  );
}

