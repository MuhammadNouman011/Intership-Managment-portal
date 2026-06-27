import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { StatusPill } from './StatusPill'

describe('StatusPill', () => {
  it('renders a human label for approved', () => {
    render(<StatusPill status="approved" />)
    expect(screen.getByText('Approved')).toBeInTheDocument()
  })

  it('renders the full label for returned', () => {
    render(<StatusPill status="returned" />)
    expect(screen.getByText('Returned for Correction')).toBeInTheDocument()
  })

  it('renders pending', () => {
    render(<StatusPill status="pending" />)
    expect(screen.getByText('Pending')).toBeInTheDocument()
  })
})
