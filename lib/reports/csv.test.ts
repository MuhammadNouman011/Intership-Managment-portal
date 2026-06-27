import { describe, it, expect } from 'vitest'
import { csvCell, toCsv } from './csv'

describe('csvCell', () => {
  it('passes simple values through', () => {
    expect(csvCell('hello')).toBe('hello')
    expect(csvCell(5)).toBe('5')
    expect(csvCell(null)).toBe('')
  })
  it('quotes and escapes special characters', () => {
    expect(csvCell('a,b')).toBe('"a,b"')
    expect(csvCell('she said "hi"')).toBe('"she said ""hi"""')
    expect(csvCell('line1\nline2')).toBe('"line1\nline2"')
  })
})

describe('toCsv', () => {
  it('joins header + rows with CRLF', () => {
    expect(toCsv(['A', 'B'], [['1', '2'], ['x,y', '3']])).toBe('A,B\r\n1,2\r\n"x,y",3')
  })
})
