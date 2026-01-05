import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"
import rehypeHighlight from "rehype-highlight"
import "highlight.js/styles/github-dark.css"
import "katex/dist/katex.min.css"

interface MarkdownRendererProps {
  content: string
  className?: string
}

export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  return (
    <div className={`prose prose-invert max-w-none 
      prose-pre:bg-[#0f1318] prose-pre:border prose-pre:border-emerald-700/20 
      prose-code:text-emerald-400 prose-code:bg-[#0f1318] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
      prose-p:text-[#d1d1ca] prose-p:leading-relaxed
      prose-headings:text-white prose-headings:font-bold
      prose-ul:text-[#d1d1ca] prose-ol:text-[#d1d1ca]
      prose-li:marker:text-emerald-400
      prose-a:text-emerald-400 prose-a:no-underline hover:prose-a:underline
      prose-blockquote:border-l-emerald-400 prose-blockquote:text-[#d1d1ca]
      prose-strong:text-white prose-strong:font-bold
      prose-table:border-emerald-700/20
      prose-th:bg-[#0f1318] prose-th:text-emerald-400
      prose-td:border-emerald-700/20
      ${className}`}>
      <ReactMarkdown 
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex, rehypeHighlight]}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
