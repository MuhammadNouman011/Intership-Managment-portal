import { describe, it, expect } from 'vitest'
import { stripHtml, fill, renderTemplateBody } from './template'

describe('stripHtml', () => {
  it('turns block tags into separate paragraphs', () => {
    expect(stripHtml('<p>One</p><p>Two</p>')).toEqual(['One', 'Two'])
  })
  it('collapses whitespace and strips inline tags', () => {
    expect(stripHtml('<p>Hello   <strong>world</strong></p>')).toEqual(['Hello world'])
  })
})

describe('fill', () => {
  it('replaces known placeholders', () => {
    expect(fill('Hi {{full_name}} ({{serial}})', { full_name: 'Ali', serial: 'X1' })).toBe('Hi Ali (X1)')
  })
  it('blanks unknown placeholders', () => {
    expect(fill('a {{missing}} b', {})).toBe('a  b')
  })
})

describe('renderTemplateBody', () => {
  it('substitutes and drops the heading line', () => {
    const out = renderTemplateBody('<h2>TO WHOM IT MAY CONCERN</h2><p>Hi {{full_name}}</p>', {
      full_name: 'Ali',
    })
    expect(out).toEqual(['Hi Ali'])
  })
})
