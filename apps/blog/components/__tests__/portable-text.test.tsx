import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { PortableTextValue } from '@/lib/portable-text'
import PortableTextBlock from '../portable-text'

describe('PortableText footnote rendering', () => {
  it('should render footnote references with superscript links', async () => {
    const value: PortableTextValue = [
      {
        _key: 'block1',
        _type: 'block',
        children: [
          {
            _key: 'span1',
            _type: 'span',
            marks: [],
            text: 'Text with footnote'
          },
          {
            _key: 'span2',
            _type: 'span',
            marks: ['footnote1'],
            text: '[1]'
          }
        ],
        markDefs: [
          {
            _key: 'footnote1',
            _type: 'footnoteReference',
            identifier: '1'
          }
        ],
        style: 'normal'
      }
    ]

    const { container } = render(<PortableTextBlock value={value} />)

    // Check for superscript element
    const sup = container.querySelector('sup')
    expect(sup).toBeTruthy()

    // Check for link with correct href
    const link = container.querySelector('a[href="#fn-1"]')
    expect(link).toBeTruthy()
    expect(link?.textContent).toBe('[1]')
  })

  it('should render footnote definitions with backref links', async () => {
    const value: PortableTextValue = [
      {
        _key: 'footnote1',
        _type: 'footnote',
        children: [
          {
            _key: 'block1',
            _type: 'block',
            children: [
              {
                _key: 'span1',
                _type: 'span',
                text: 'This is the footnote text.'
              }
            ],
            style: 'normal'
          }
        ],
        identifier: '1'
      }
    ]

    const { container } = render(<PortableTextBlock value={value} />)

    // Check for footnote definition with correct id
    const footnote = container.querySelector('#fn-1')
    expect(footnote).toBeTruthy()

    // Check for backref link
    const backref = container.querySelector('a[href="#fnref-1"]')
    expect(backref).toBeTruthy()
    expect(backref?.textContent).toBe('↩')
  })
})
