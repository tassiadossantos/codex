import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn().mockResolvedValue({ data: null, error: null }),
      select: vi.fn().mockResolvedValue({ data: [], error: null }),
      update: vi.fn().mockResolvedValue({ data: null, error: null }),
      delete: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
  },
}))

import { supabase } from '../lib/supabase'

describe('Supabase client', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should be defined', () => {
    expect(supabase).toBeDefined()
  })

  it('should have from method', () => {
    expect(typeof supabase.from).toBe('function')
  })

  describe('leads table operations', () => {
    it('should insert a lead', async () => {
      const mockInsert = vi.fn().mockResolvedValue({ data: null, error: null })
      vi.mocked(supabase.from).mockReturnValue({ insert: mockInsert } as any)

      const result = await supabase
        .from('leads')
        .insert([{ name: 'Test', email: 'test@example.com', budget: '5k-30k', message: 'Test' }])

      expect(supabase.from).toHaveBeenCalledWith('leads')
      expect(mockInsert).toHaveBeenCalled()
      expect(result.error).toBeNull()
    })

    it('should handle insert errors', async () => {
      const mockInsert = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Relation not found' },
      })
      vi.mocked(supabase.from).mockReturnValue({ insert: mockInsert } as any)

      const result = await supabase
        .from('leads')
        .insert([{ name: 'Test', email: 'test@example.com', budget: '5k-30k', message: 'Test' }])

      expect(result.error).toBeTruthy()
      expect(result.error?.message).toBe('Relation not found')
    })

    it('should select leads', async () => {
      const mockSelect = vi.fn().mockResolvedValue({
        data: [
          {
            id: '123',
            name: 'Ada Lovelace',
            email: 'ada@example.com',
            budget: '100k-300k',
            message: 'Need a system',
            status: 'new',
            created_at: new Date().toISOString(),
          },
        ],
        error: null,
      })
      vi.mocked(supabase.from).mockReturnValue({ select: mockSelect } as any)

      const result = await supabase.from('leads').select('*')

      expect(result.data).toHaveLength(1)
      expect(result.data?.[0].name).toBe('Ada Lovelace')
    })

    it('should update lead status', async () => {
      const mockUpdate = vi.fn().mockResolvedValue({ data: null, error: null })
      const mockEq = vi.fn().mockResolvedValue({ data: null, error: null })
      vi.mocked(supabase.from).mockReturnValue({
        update: mockUpdate.mockReturnValue({ eq: mockEq }),
      } as any)

      const result = await supabase
        .from('leads')
        .update({ status: 'contacted' })
        .eq('id', '123')

      expect(supabase.from).toHaveBeenCalledWith('leads')
    })

    it('should delete a lead', async () => {
      const mockDelete = vi.fn().mockResolvedValue({ data: null, error: null })
      const mockEq = vi.fn().mockResolvedValue({ data: null, error: null })
      vi.mocked(supabase.from).mockReturnValue({
        delete: mockDelete.mockReturnValue({ eq: mockEq }),
      } as any)

      const result = await supabase
        .from('leads')
        .delete()
        .eq('id', '123')

      expect(supabase.from).toHaveBeenCalledWith('leads')
    })
  })
})
