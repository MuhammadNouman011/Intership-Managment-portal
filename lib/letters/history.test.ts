import { describe, it, expect } from 'vitest'
import { buildDownloadRecord } from './history'

describe('buildDownloadRecord', () => {
  it('builds the insert payload', () => {
    expect(buildDownloadRecord('letter-1', 'user-1', '1.2.3.4')).toEqual({
      letter_id: 'letter-1',
      downloaded_by: 'user-1',
      ip: '1.2.3.4',
    })
  })

  it('defaults ip to null', () => {
    expect(buildDownloadRecord('l', 'u').ip).toBeNull()
  })
})
