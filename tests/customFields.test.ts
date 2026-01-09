import { TimeCampAPI } from '../src/TimeCampAPI'

// Mock global fetch
const mockFetch = jest.fn()
global.fetch = mockFetch

describe('Custom Fields API', () => {
  let api: TimeCampAPI

  beforeEach(() => {
    mockFetch.mockClear()
    api = new TimeCampAPI('test-key')
  })

  const createMockResponse = (data: any, status = 200) => ({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
  })

  it('customFields.getAll calls v3 template list', async () => {
    mockFetch.mockResolvedValueOnce(createMockResponse({ data: [] }))
    
    const res = await api.customFields.getAll()
    
    expect(res).toEqual({ data: [] })
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/v3/custom-fields/template/list'),
      expect.objectContaining({ method: 'GET' })
    )
  })

  it('users.getAll hits users endpoint', async () => {
    mockFetch.mockResolvedValueOnce(createMockResponse({ u1: { id: 1 } }))
    
    const res = await api.users.getAll()
    
    expect(res).toEqual({ u1: { id: 1 } })
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/users'),
      expect.objectContaining({ method: 'GET' })
    )
  })

  it('users.byId(id).setCustomField posts assign', async () => {
    mockFetch.mockResolvedValueOnce(createMockResponse({ data: { id: 10 } }))
    
    const res = await api.users.byId(5).setCustomField(15, 'Hello')
    
    expect(res).toEqual({ data: { id: 10 } })
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/v3/custom-fields/15/assign/5'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ value: 'Hello' })
      })
    )
  })

  it('tasks.byId(id).getCustomField gets value', async () => {
    mockFetch.mockResolvedValueOnce(createMockResponse({ data: { id: 22 } }))
    
    const res = await api.tasks.byId(111).getCustomField(33)
    
    expect(res).toEqual({ data: { id: 22 } })
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/v3/custom-fields/33/value/111'),
      expect.objectContaining({ method: 'GET' })
    )
  })

  it('timeEntries.byId(id).deleteCustomField deletes unassign', async () => {
    mockFetch.mockResolvedValueOnce(createMockResponse({ data: 'ok' }))
    
    const res = await api.timeEntries.byId(42).deleteCustomField(7)
    
    expect(res).toEqual({ data: 'ok' })
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/v3/custom-fields/7/unassign/42'),
      expect.objectContaining({ method: 'DELETE' })
    )
  })

  it('users.byId(id).getAllCustomFields lists values for resource', async () => {
    mockFetch.mockResolvedValueOnce(createMockResponse({ data: [] }))
    
    const res = await api.users.byId(9).getAllCustomFields()
    
    expect(res).toEqual({ data: [] })
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/v3/custom-fields/values/resource/9/type/user'),
      expect.objectContaining({ method: 'GET' })
    )
  })

  it('users.getAllWithCustomFields returns users enriched with CF values', async () => {
    mockFetch
      .mockResolvedValueOnce(createMockResponse({ u1: { id: 1, name: 'A' }, u2: { id: 2, name: 'B' } }))
      .mockResolvedValueOnce(createMockResponse({ data: [{ templateId: 66, value: 'X' }] }))
      .mockResolvedValueOnce(createMockResponse({ data: [{ templateId: 77, value: 'Y' }] }))

    const res = await api.users.getAllWithCustomFields()
    
    expect(res).toEqual([
      { id: 1, name: 'A', customFields: [{ templateId: 66, value: 'X' }] },
      { id: 2, name: 'B', customFields: [{ templateId: 77, value: 'Y' }] }
    ])
    expect(mockFetch).toHaveBeenNthCalledWith(1, expect.stringContaining('/users'), expect.any(Object))
    expect(mockFetch).toHaveBeenNthCalledWith(2, expect.stringContaining('/v3/custom-fields/values/resource/1/type/user'), expect.any(Object))
    expect(mockFetch).toHaveBeenNthCalledWith(3, expect.stringContaining('/v3/custom-fields/values/resource/2/type/user'), expect.any(Object))
  })

  it('customFields.add creates a template', async () => {
    mockFetch.mockResolvedValueOnce(createMockResponse({ data: { id: 15, name: 'CF', resourceType: 'user' } }))
    
    const res = await api.customFields.add({ name: 'CF', resourceType: 'user', fieldType: 'string', required: true, defaultValue: '' })
    
    expect(res).toEqual({ data: { id: 15, name: 'CF', resourceType: 'user' } })
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/v3/custom-fields/template/create'),
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"name":"CF"')
      })
    )
  })

  it('customFields.delete removes a template', async () => {
    mockFetch.mockResolvedValueOnce(createMockResponse({ data: 'ok' }))
    
    const res = await api.customFields.delete(99)
    
    expect(res).toEqual({ data: 'ok' })
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/v3/custom-fields/template/99/remove'),
      expect.objectContaining({ method: 'DELETE' })
    )
  })

  it('customFields.update modifies a template', async () => {
    mockFetch.mockResolvedValueOnce(createMockResponse({ data: { id: 77, name: 'Updated' } }))
    
    const res = await api.customFields.update(77, { name: 'Updated', defaultValue: '' })
    
    expect(res).toEqual({ data: { id: 77, name: 'Updated' } })
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/v3/custom-fields/template/77/modify'),
      expect.objectContaining({
        method: 'PUT',
        body: expect.stringContaining('"name":"Updated"')
      })
    )
  })
})
