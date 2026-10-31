import type { CodeBlock, SectionContext } from './usePromptBuilder'

export interface PageMeta {
  title?: string
  stack?: string
  frameworkVersion?: string
  prerequisites?: string[]
  lastVerified?: string
}

export interface SectionExtras { expectedResult?: string, verification?: string, references?: string[] }

/** Reads one section's context from the DOM. Called only when the reader clicks Question/Report. */
export function readSectionContext(from: Element, page: PageMeta, extras: SectionExtras = {}): SectionContext {
  const root = from.closest<HTMLElement>('[data-guide-section-id]')
  if (!root) throw new Error('No [data-guide-section-id] ancestor')
  const body = root.querySelector<HTMLElement>('[data-guide-section-body]') ?? root
  const codeBlocks: CodeBlock[] = [...body.querySelectorAll('pre')].map((pre) => {
    const lang = pre.getAttribute('data-language') ?? pre.closest('[data-language]')?.getAttribute('data-language') ?? pre.className.match(/language-(\w+)/)?.[1] ?? 'text'
    return { language: lang, code: (pre.querySelector('code') ?? pre).textContent ?? '' }
  })
  const clone = body.cloneNode(true) as HTMLElement
  clone.querySelectorAll('pre, button, [data-guide-ignore]').forEach(el => el.remove())
  const prose = [...clone.querySelectorAll('p, li, h3, h4, td, th, blockquote')]
    .map(el => el.textContent?.replace(/\s+/g, ' ').trim()).filter(Boolean).join('\n')
  return {
    guideTitle: page.title ?? document.title,
    sectionId: root.dataset.guideSectionId!,
    sectionTitle: root.dataset.guideSectionTitle ?? root.querySelector('h2, h3')?.textContent?.trim() ?? '',
    sectionType: root.dataset.guideSectionType ?? 'explanation',
    filePath: root.dataset.filePath || undefined,
    stack: page.stack,
    frameworkVersion: page.frameworkVersion,
    prerequisites: page.prerequisites,
    lastVerified: page.lastVerified,
    expectedResult: extras.expectedResult,
    verification: extras.verification,
    references: extras.references,
    quotedContent: prose,
    codeBlocks,
  }
}
