import { convertMDXToPortableText } from './lib/mdx-to-portable-text.js'

const mdxWithFootnotes = `
Here is some text with a footnote[^1] and another one[^2].

[^1]: This is the first footnote.
[^2]: This is the second footnote with **bold** text.
`

const result = convertMDXToPortableText(mdxWithFootnotes)
console.log(JSON.stringify(result, null, 2))
