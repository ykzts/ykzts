import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import PortableTextBlock from '../portable-text'
import type { PortableTextValue } from '@/lib/portable-text'

describe('PortableText footnote rendering', () => {
  it('should render footnote references with superscript links', async () => {
    const value: PortableTextValue = [
      {
        _key: 'block1',
        _type: 'block',
        style: 'normal',
        children: [
          {
            _key: 'span1',
            _type: 'span',
            text: 'Text with footnote',
            marks: []
          },
          {
            _key: 'span2',
            _type: 'span',
            text: '[1]',
            marks: ['footnote1']
          }
        ],
        markDefs: [
          {
            _key: 'footnote1',
            _type: 'footnoteReference',
            identifier: '1'
          }
        ]
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
        identifier: '1',
        children: [
          {
            _key: 'block1',
            _type: 'block',
            style: 'normal',
            children: [
              {
                _key: 'span1',
                _type: 'span',
                text: 'This is the footnote text.'
              }
            ]
          }
        ]
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
