import React from 'react'

function parseInlineMarkdown(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[\s\S]*?\*\*|\*[\s\S]*?\*|`[\s\S]*?`)/g)
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={idx} className="font-bold text-white">{part.slice(2, -2)}</strong>
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={idx} className="italic text-slate-200">{part.slice(1, -1)}</em>
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={idx} className="bg-slate-900 border border-slate-800 text-blue-400 px-1.5 py-0.5 rounded text-[11px] font-mono mx-0.5">{part.slice(1, -1)}</code>
    }
    return part
  })
}

export function MarkdownRenderer({ content }: { content: string }) {
  if (!content) return null

  const lines = content.replace(/\r/g, '').split('\n')
  const elements: React.ReactNode[] = []
  
  let currentList: React.ReactNode[] = []
  let listType: 'ul' | 'ol' | null = null
  let inCodeBlock = false
  let codeBlockContent: string[] = []
  let codeBlockLang = ''

  const flushList = (key: number) => {
    if (currentList.length > 0) {
      if (listType === 'ul') {
        elements.push(
          <ul key={`ul-${key}`} className="list-disc pl-5 mb-4 space-y-1 text-slate-350">
            {currentList}
          </ul>
        )
      } else if (listType === 'ol') {
        elements.push(
          <ol key={`ol-${key}`} className="list-decimal pl-5 mb-4 space-y-1 text-slate-350">
            {currentList}
          </ol>
        )
      }
      currentList = []
      listType = null
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Handle code blocks
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        inCodeBlock = false
        elements.push(
          <pre key={`code-${i}`} className="bg-slate-950 border border-slate-850 p-4 rounded-xl overflow-x-auto my-4 font-mono text-[11px] text-slate-300 leading-relaxed">
            {codeBlockLang && (
              <div className="text-[9px] text-slate-500 uppercase tracking-wider mb-2 font-sans border-b border-slate-900 pb-1">
                {codeBlockLang}
              </div>
            )}
            <code>{codeBlockContent.join('\n')}</code>
          </pre>
        )
        codeBlockContent = []
        codeBlockLang = ''
      } else {
        flushList(i)
        inCodeBlock = true
        codeBlockLang = line.trim().slice(3).trim()
      }
      continue
    }

    if (inCodeBlock) {
      codeBlockContent.push(line)
      continue
    }

    // Handle headings
    if (line.startsWith('# ')) {
      flushList(i)
      elements.push(
        <h1 key={`h1-${i}`} className="text-xl font-extrabold text-white mt-5 mb-2.5 tracking-tight">
          {parseInlineMarkdown(line.substring(2))}
        </h1>
      )
      continue
    }
    if (line.startsWith('## ')) {
      flushList(i)
      elements.push(
        <h2 key={`h2-${i}`} className="text-lg font-bold text-white mt-4.5 mb-2 tracking-tight border-b border-slate-850 pb-1">
          {parseInlineMarkdown(line.substring(3))}
        </h2>
      )
      continue
    }
    if (line.startsWith('### ')) {
      flushList(i)
      elements.push(
        <h3 key={`h3-${i}`} className="text-base font-bold text-white mt-4 mb-1.5 tracking-tight">
          {parseInlineMarkdown(line.substring(4))}
        </h3>
      )
      continue
    }
    if (line.startsWith('#### ')) {
      flushList(i)
      elements.push(
        <h4 key={`h4-${i}`} className="text-sm font-semibold text-white mt-3.5 mb-1 tracking-tight">
          {parseInlineMarkdown(line.substring(5))}
        </h4>
      )
      continue
    }

    // Handle horizontal rules
    if (line.trim() === '---' || line.trim() === '***') {
      flushList(i)
      elements.push(<hr key={`hr-${i}`} className="my-5 border-slate-850" />)
      continue
    }

    // Handle list items
    const ulMatch = line.match(/^(\s*)[-*+]\s+(.*)/)
    if (ulMatch) {
      if (listType !== 'ul') {
        flushList(i)
        listType = 'ul'
      }
      currentList.push(
        <li key={`li-${i}`} className="text-xs md:text-sm leading-relaxed">
          {parseInlineMarkdown(ulMatch[2])}
        </li>
      )
      continue
    }

    const olMatch = line.match(/^(\s*)\d+\.\s+(.*)/)
    if (olMatch) {
      if (listType !== 'ol') {
        flushList(i)
        listType = 'ol'
      }
      currentList.push(
        <li key={`li-${i}`} className="text-xs md:text-sm leading-relaxed">
          {parseInlineMarkdown(olMatch[2])}
        </li>
      )
      continue
    }

    // Handle empty lines (paragraph break)
    if (line.trim() === '') {
      flushList(i)
      continue
    }

    // Handle standard paragraph text
    flushList(i)
    elements.push(
      <p key={`p-${i}`} className="mb-2 text-xs md:text-sm leading-relaxed text-slate-350">
        {parseInlineMarkdown(line)}
      </p>
    )
  }

  flushList(lines.length)

  return <div className="space-y-1 text-slate-300">{elements}</div>
}
