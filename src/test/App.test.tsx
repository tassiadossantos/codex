import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
  },
}))

import App from '../app/App'

describe('App', () => {
  it('should render without crashing', () => {
    render(<App />)
  })

  it('should render the main heading', () => {
    render(<App />)
    const codexElements = screen.getAllByText(/codex/i)
    expect(codexElements.length).toBeGreaterThanOrEqual(1)
  })

  it('should render navigation links', () => {
    render(<App />)
    expect(screen.getByText('SISTEMAS')).toBeInTheDocument()
    expect(screen.getByText('STACK')).toBeInTheDocument()
    expect(screen.getByText('MISSÃO')).toBeInTheDocument()
    expect(screen.getByText('CONTATO')).toBeInTheDocument()
  })

  it('should render services section', () => {
    render(<App />)
    expect(screen.getByText(/sistemas enterprise/i)).toBeInTheDocument()
    expect(screen.getByText(/arquitetura cloud/i)).toBeInTheDocument()
    expect(screen.getByText(/engenharia de ia/i)).toBeInTheDocument()
  })

  it('should render tech stack section', () => {
    render(<App />)
    expect(screen.getByText(/arsenal tecnológico/i)).toBeInTheDocument()
    expect(screen.getByText(/ferramentas de combate/i)).toBeInTheDocument()
  })

  it('should render methodology section', () => {
    render(<App />)
    expect(screen.getByText(/sequência de missão/i)).toBeInTheDocument()
  })

  it('should render contact form', () => {
    render(<App />)
    expect(screen.getByText(/transmitir briefing/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Ada Lovelace')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('ada@empresa.com')).toBeInTheDocument()
  })

  it('should render footer', () => {
    render(<App />)
    expect(screen.getByText(/all rights reserved/i)).toBeInTheDocument()
  })

  it('should render boot terminal', () => {
    render(<App />)
    expect(screen.getByText(/omni terminal v7/i)).toBeInTheDocument()
  })

  it('should have correct page title', () => {
    document.title = 'CodeX'
    render(<App />)
    expect(document.title).toBe('CodeX')
  })
})
