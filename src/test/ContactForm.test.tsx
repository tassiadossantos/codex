import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const mockInsert = vi.fn()
const mockFrom = vi.fn(() => ({ insert: mockInsert }))

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: (...args: any[]) => mockFrom(...args),
  },
}))

import { ContactForm } from '../app/App'

describe('ContactForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockInsert.mockResolvedValue({ data: null, error: null })
  })

  it('should render the form with all fields', () => {
    render(<ContactForm />)

    expect(screen.getByPlaceholderText('Ada Lovelace')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('ada@empresa.com')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Stark Industries')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('// Contexto, escala e urgência...')).toBeInTheDocument()
    expect(screen.getByText(/enviar briefing/i)).toBeInTheDocument()
  })

  it('should render budget selector', () => {
    render(<ContactForm />)

    expect(screen.getByText(/selecione uma faixa/i)).toBeInTheDocument()
  })

  it('should update form fields on input', async () => {
    const user = userEvent.setup()
    render(<ContactForm />)

    const nameInput = screen.getByPlaceholderText('Ada Lovelace')
    await user.type(nameInput, 'Ada Lovelace')

    expect(nameInput).toHaveValue('Ada Lovelace')
  })

  it('should update email field', async () => {
    const user = userEvent.setup()
    render(<ContactForm />)

    const emailInput = screen.getByPlaceholderText('ada@empresa.com')
    await user.type(emailInput, 'ada@example.com')

    expect(emailInput).toHaveValue('ada@example.com')
  })

  it('should update company field', async () => {
    const user = userEvent.setup()
    render(<ContactForm />)

    const companyInput = screen.getByPlaceholderText('Stark Industries')
    await user.type(companyInput, 'Stark Industries')

    expect(companyInput).toHaveValue('Stark Industries')
  })

  it('should update message field', async () => {
    const user = userEvent.setup()
    render(<ContactForm />)

    const messageInput = screen.getByPlaceholderText('// Contexto, escala e urgência...')
    await user.type(messageInput, 'Need a new system')

    expect(messageInput).toHaveValue('Need a new system')
  })

  it('should open budget dropdown on click', async () => {
    const user = userEvent.setup()
    render(<ContactForm />)

    const budgetTrigger = screen.getByText(/selecione uma faixa/i)
    await user.click(budgetTrigger)

    expect(screen.getByText('R$ 5k – R$ 30k')).toBeInTheDocument()
    expect(screen.getByText('R$ 30k – R$ 100k')).toBeInTheDocument()
    expect(screen.getByText('R$ 100k – R$ 300k')).toBeInTheDocument()
    expect(screen.getByText('R$ 300k – R$ 1M')).toBeInTheDocument()
    expect(screen.getByText('R$ 1M+')).toBeInTheDocument()
  })

  it('should select a budget option', async () => {
    const user = userEvent.setup()
    render(<ContactForm />)

    await user.click(screen.getByText(/selecione uma faixa/i))
    await user.click(screen.getByText('R$ 100k – R$ 300k'))

    expect(screen.getByText('R$ 100k – R$ 300k')).toBeInTheDocument()
  })

  it('should submit form successfully', async () => {
    const user = userEvent.setup()
    render(<ContactForm />)

    await user.type(screen.getByPlaceholderText('Ada Lovelace'), 'Ada Lovelace')
    await user.type(screen.getByPlaceholderText('ada@empresa.com'), 'ada@example.com')
    await user.type(screen.getByPlaceholderText('Stark Industries'), 'Stark Industries')

    await user.click(screen.getByText(/selecione uma faixa/i))
    await user.click(screen.getByText('R$ 100k – R$ 300k'))

    await user.type(screen.getByPlaceholderText('// Contexto, escala e urgência...'), 'Need a new system')

    await user.click(screen.getByText(/enviar briefing/i))

    await waitFor(() => {
      expect(mockFrom).toHaveBeenCalledWith('leads')
      expect(mockInsert).toHaveBeenCalledWith([
        {
          name: 'Ada Lovelace',
          email: 'ada@example.com',
          company: 'Stark Industries',
          budget: '100k-300k',
          message: 'Need a new system',
        },
      ])
    })
  })

  it('should show success message after submission', async () => {
    const user = userEvent.setup()
    render(<ContactForm />)

    await user.type(screen.getByPlaceholderText('Ada Lovelace'), 'Ada Lovelace')
    await user.type(screen.getByPlaceholderText('ada@empresa.com'), 'ada@example.com')
    await user.type(screen.getByPlaceholderText('Stark Industries'), 'Stark Industries')

    await user.click(screen.getByText(/selecione uma faixa/i))
    await user.click(screen.getByText('R$ 100k – R$ 300k'))

    await user.type(screen.getByPlaceholderText('// Contexto, escala e urgência...'), 'Need a new system')

    await user.click(screen.getByText(/enviar briefing/i))

    await waitFor(() => {
      expect(screen.getByText(/transmissão recebida/i)).toBeInTheDocument()
      expect(screen.getByText(/retornaremos em 24h úteis/i)).toBeInTheDocument()
    })
  })

  it('should show error message on submission failure', async () => {
    mockInsert.mockResolvedValue({
      data: null,
      error: { message: 'Relation not found' },
    })

    const user = userEvent.setup()
    render(<ContactForm />)

    await user.type(screen.getByPlaceholderText('Ada Lovelace'), 'Ada Lovelace')
    await user.type(screen.getByPlaceholderText('ada@empresa.com'), 'ada@example.com')
    await user.type(screen.getByPlaceholderText('Stark Industries'), 'Stark Industries')

    await user.click(screen.getByText(/selecione uma faixa/i))
    await user.click(screen.getByText('R$ 100k – R$ 300k'))

    await user.type(screen.getByPlaceholderText('// Contexto, escala e urgência...'), 'Need a new system')

    await user.click(screen.getByText(/enviar briefing/i))

    await waitFor(() => {
      expect(screen.getByText(/erro ao enviar/i)).toBeInTheDocument()
    })
  })

  it('should show connection error on network failure', async () => {
    mockInsert.mockRejectedValue(new Error('Network error'))

    const user = userEvent.setup()
    render(<ContactForm />)

    await user.type(screen.getByPlaceholderText('Ada Lovelace'), 'Ada Lovelace')
    await user.type(screen.getByPlaceholderText('ada@empresa.com'), 'ada@example.com')
    await user.type(screen.getByPlaceholderText('Stark Industries'), 'Stark Industries')

    await user.click(screen.getByText(/selecione uma faixa/i))
    await user.click(screen.getByText('R$ 100k – R$ 300k'))

    await user.type(screen.getByPlaceholderText('// Contexto, escala e urgência...'), 'Need a new system')

    await user.click(screen.getByText(/enviar briefing/i))

    await waitFor(() => {
      expect(screen.getByText(/serviço indisponível/i)).toBeInTheDocument()
    })
  })

  it('should disable submit button while loading', async () => {
    mockInsert.mockImplementation(() => new Promise(() => {}))

    const user = userEvent.setup()
    render(<ContactForm />)

    await user.type(screen.getByPlaceholderText('Ada Lovelace'), 'Ada Lovelace')
    await user.type(screen.getByPlaceholderText('ada@empresa.com'), 'ada@example.com')
    await user.type(screen.getByPlaceholderText('Stark Industries'), 'Stark Industries')

    await user.click(screen.getByText(/selecione uma faixa/i))
    await user.click(screen.getByText('R$ 100k – R$ 300k'))

    await user.type(screen.getByPlaceholderText('// Contexto, escala e urgência...'), 'Need a new system')

    await user.click(screen.getByText(/enviar briefing/i))

    await waitFor(() => {
      expect(screen.getByText(/transmitindo/i)).toBeInTheDocument()
    })
  })

  it('should clear form after successful submission', async () => {
    const user = userEvent.setup()
    render(<ContactForm />)

    await user.type(screen.getByPlaceholderText('Ada Lovelace'), 'Ada Lovelace')
    await user.type(screen.getByPlaceholderText('ada@empresa.com'), 'ada@example.com')
    await user.type(screen.getByPlaceholderText('Stark Industries'), 'Stark Industries')

    await user.click(screen.getByText(/selecione uma faixa/i))
    await user.click(screen.getByText('R$ 100k – R$ 300k'))

    await user.type(screen.getByPlaceholderText('// Contexto, escala e urgência...'), 'Need a new system')

    await user.click(screen.getByText(/enviar briefing/i))

    await waitFor(() => {
      expect(screen.getByText(/transmissão recebida/i)).toBeInTheDocument()
    })
  })
})
