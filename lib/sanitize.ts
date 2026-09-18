import sanitizeHtml from 'sanitize-html'

const DESCRIPTION_ALLOWED_TAGS = [
  'a',
  'abbr',
  'b',
  'blockquote',
  'br',
  'caption',
  'code',
  'col',
  'colgroup',
  'dd',
  'del',
  'dl',
  'dt',
  'em',
  'figcaption',
  'figure',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'hr',
  'i',
  'ins',
  'li',
  'mark',
  'ol',
  'p',
  'pre',
  'q',
  's',
  'small',
  'span',
  'strike',
  'strong',
  'sub',
  'sup',
  'table',
  'tbody',
  'td',
  'tfoot',
  'th',
  'thead',
  'tr',
  'u',
  'ul',
]

const DESCRIPTION_ALLOWED_ATTRIBUTES: Record<string, sanitizeHtml.AllowedAttribute[]> = {
  a: ['href', 'title', 'target', 'rel'],
  abbr: ['title'],
  col: ['span'],
  colgroup: ['span'],
  td: ['colspan', 'rowspan'],
  th: ['colspan', 'rowspan'],
}

const DESCRIPTION_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: DESCRIPTION_ALLOWED_TAGS,
  allowedAttributes: DESCRIPTION_ALLOWED_ATTRIBUTES,
  allowedSchemes: ['http', 'https', 'mailto'],
  allowProtocolRelative: false,
  disallowedTagsMode: 'discard',
  transformTags: {
    a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer', target: '_blank' }),
  },
}

const PLAIN_TEXT_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [],
  allowedAttributes: {},
  allowedSchemes: [],
}

const REAL_TAG_PATTERN = /<[a-zA-Z!/]/
const DOUBLE_ESCAPED_TAG_PATTERN = /&(?:lt|#x3[cC]|#60);/

const ENTITY_REPLACEMENTS: Record<string, string> = {
  lt: '<',
  gt: '>',
  quot: '"',
  amp: '&',
  apos: "'",
  '#x27': "'",
  '#39': "'",
  '#x3C': '<',
  '#x3c': '<',
  '#60': '<',
  '#62': '>',
  '#38': '&',
}

function decodeEntitiesOnce(text: string): string {
  return text.replace(/&([a-zA-Z]+|#x[0-9a-fA-F]+|#[0-9]+);/g, (match, name: string) => {
    return ENTITY_REPLACEMENTS[name] ?? match
  })
}

export function normalizeDoubleEscapedHtml(html: string): string {
  if (REAL_TAG_PATTERN.test(html) || !DOUBLE_ESCAPED_TAG_PATTERN.test(html)) {
    return html
  }
  return decodeEntitiesOnce(html)
}

export function sanitizeJobDescription(html: string): string {
  return sanitizeHtml(normalizeDoubleEscapedHtml(html), DESCRIPTION_OPTIONS)
}

export function htmlToPlainText(html: string): string {
  const text = sanitizeHtml(normalizeDoubleEscapedHtml(html), PLAIN_TEXT_OPTIONS)
  return text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim()
}

export function buildMetaDescription(plainText: string, maxLength = 160): string {
  if (plainText.length <= maxLength) return plainText
  return `${plainText.slice(0, maxLength - 1).trimEnd()}…`
}
