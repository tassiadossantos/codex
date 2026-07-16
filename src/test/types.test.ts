import { describe, it, expect } from 'vitest'
import type { LeadPayload, Lead, ProblemDetail, FormStatus } from '../lib/types'

describe('types', () => {
  describe('LeadPayload', () => {
    it('should have correct shape', () => {
      const payload: LeadPayload = {
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        company: 'Stark Industries',
        budget: '100k-300k',
        message: 'Need a new system',
      }

      expect(payload).toHaveProperty('name')
      expect(payload).toHaveProperty('email')
      expect(payload).toHaveProperty('company')
      expect(payload).toHaveProperty('budget')
      expect(payload).toHaveProperty('message')
    })

    it('should accept empty company', () => {
      const payload: LeadPayload = {
        name: 'John Doe',
        email: 'john@example.com',
        company: '',
        budget: '5k-30k',
        message: 'Test message',
      }

      expect(payload.company).toBe('')
    })
  })

  describe('Lead', () => {
    it('should extend LeadPayload with id, status, and created_at', () => {
      const lead: Lead = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        company: 'Stark Industries',
        budget: '100k-300k',
        message: 'Need a new system',
        status: 'new',
        created_at: '2026-07-16T20:00:00Z',
      }

      expect(lead).toHaveProperty('id')
      expect(lead).toHaveProperty('status')
      expect(lead).toHaveProperty('created_at')
      expect(lead.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
      )
    })

    it('should accept valid status values', () => {
      const statuses: Lead['status'][] = ['new', 'contacted', 'converted']

      statuses.forEach((status) => {
        const lead: Lead = {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'Test',
          email: 'test@example.com',
          company: '',
          budget: '5k-30k',
          message: 'Test',
          status,
          created_at: new Date().toISOString(),
        }

        expect(lead.status).toBe(status)
      })
    })
  })

  describe('ProblemDetail', () => {
    it('should have correct shape', () => {
      const error: ProblemDetail = {
        type: 'https://httpstatuses.com/500',
        title: 'Internal Server Error',
        status: 500,
        detail: 'An unexpected error occurred',
      }

      expect(error).toHaveProperty('type')
      expect(error).toHaveProperty('title')
      expect(error).toHaveProperty('status')
      expect(error).toHaveProperty('detail')
      expect(typeof error.status).toBe('number')
    })
  })

  describe('FormStatus', () => {
    it('should accept all valid statuses', () => {
      const validStatuses: FormStatus[] = ['idle', 'loading', 'success', 'error']

      validStatuses.forEach((status) => {
        const currentStatus: FormStatus = status
        expect(['idle', 'loading', 'success', 'error']).toContain(currentStatus)
      })
    })
  })
})
