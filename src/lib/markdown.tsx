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
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
        components={{
          // Imágenes insertadas en el cuerpo desde el panel. No pasan por
          // next/image (el Markdown no lleva dimensiones y el optimizador
          // está desactivado igualmente), así que la carga perezosa hay
          // que pedirla a mano; el marco lo pone `.prose-cmc img`.
          img: ({ node: _node, alt, ...props }) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img {...props} alt={alt ?? ""} loading="lazy" decoding="async" />
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
