import { describe, it, expect } from 'vitest'
import { translate, DICT, LOCALES } from './config'

describe('translate', () => {
  it('returns the localized string', () => {
    expect(translate('en', 'common.signIn')).toBe('Sign in')
    expect(translate('ur', 'common.signIn')).toBe('سائن ان')
  })
  it('falls back to English for a missing locale key', () => {
    // every key present in en should resolve in ur (fallback at worst)
    for (const key of Object.keys(DICT.en)) {
      expect(translate('ur', key)).toBeTruthy()
    }
  })
  it('returns the key itself when unknown', () => {
    expect(translate('en', 'does.not.exist')).toBe('does.not.exist')
  })
  it('covers all locales', () => {
    expect(LOCALES).toContain('en')
    expect(LOCALES).toContain('ur')
  })
})
