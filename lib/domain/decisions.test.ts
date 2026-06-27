import { describe, it, expect } from 'vitest'
import {
  decisionRequiresReason,
  isDecisionAction,
  ACTION_TO_STATUS,
} from './decisions'

describe('decisionRequiresReason', () => {
  it('requires a reason for reject and return', () => {
    expect(decisionRequiresReason('reject')).toBe(true)
    expect(decisionRequiresReason('return')).toBe(true)
  })
  it('does not require a reason for approve or hold', () => {
    expect(decisionRequiresReason('approve')).toBe(false)
    expect(decisionRequiresReason('hold')).toBe(false)
  })
})

describe('isDecisionAction', () => {
  it('recognizes valid actions', () => {
    expect(isDecisionAction('approve')).toBe(true)
    expect(isDecisionAction('delete')).toBe(false)
  })
})

describe('ACTION_TO_STATUS', () => {
  it('maps actions to statuses', () => {
    expect(ACTION_TO_STATUS.approve).toBe('approved')
    expect(ACTION_TO_STATUS.return).toBe('returned')
  })
})
