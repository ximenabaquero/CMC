import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";

/**
 * Render de Markdown SANITIZADO (sin HTML crudo) para artículos del
 * blog, respuestas de FAQs y bloques de contenido institucional.
 */
export function Markdown({ children }: { children: string }) {
  return (
    <div className="prose-cmc">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
