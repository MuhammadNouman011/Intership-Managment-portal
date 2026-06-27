export const DECISION_ACTIONS = ['approve', 'reject', 'hold', 'return'] as const
export type DecisionAction = (typeof DECISION_ACTIONS)[number]

/** Maps a decision action to the resulting request status. */
export const ACTION_TO_STATUS: Record<DecisionAction, string> = {
  approve: 'approved',
  reject: 'rejected',
  hold: 'hold',
  return: 'returned',
}

/** Reject and return must carry a reason the student will see. */
export function decisionRequiresReason(action: DecisionAction): boolean {
  return action === 'reject' || action === 'return'
}

export function isDecisionAction(value: string): value is DecisionAction {
  return (DECISION_ACTIONS as readonly string[]).includes(value)
}
