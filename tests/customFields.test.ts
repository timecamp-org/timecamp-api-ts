import axios from 'axios'
import { TimeCampAPI } from '../src/TimeCampAPI'

jest.mock('axios')

describe('Custom Fields API', () => {
  let api: TimeCampAPI
  beforeEach(() => {
    const fakeInstance = {
      defaults: {
        baseURL: 'https://app.timecamp.com/third_party/api',
        headers: {}
      },
      interceptors: { request: { use: jest.fn() } },
    } as any
    ;(axios.create as unknown as jest.Mock).mockReturnValue(fakeInstance)
    ;(axios as unknown as jest.Mock).mockClear()
    api = new TimeCampAPI('test-key')
  })

  it('customFields.getAll calls v3 template list', async () => {
    ;(axios as unknown as jest.Mock).mockResolvedValueOnce({ data: { data: [] } })
    const res = await api.customFields.getAll()
    expect(res).toEqual({ data: [] })
    expect(axios).toHaveBeenCalledWith(expect.objectContaining({
      method: 'GET',
      url: expect.stringContaining('/v3/custom-fields/template/list')
    }))
  })

  it('users.getAll hits users endpoint', async () => {
    ;(axios as unknown as jest.Mock).mockResolvedValueOnce({ data: { u1: { id: 1 } } })
    const res = await api.users.getAll()
    expect(res).toEqual({ u1: { id: 1 } })
    expect(axios).toHaveBeenCalledWith(expect.objectContaining({
      method: 'GET',
      url: expect.stringContaining('/users')
    }))
  })

  it('users.byId(id).setCustomField posts assign', async () => {
    ;(axios as unknown as jest.Mock).mockResolvedValueOnce({ data: { data: { id: 10 } } })
    const res = await api.users.byId(5).setCustomField(15, 'Hello')
    expect(res).toEqual({ data: { id: 10 } })
    expect(axios).toHaveBeenCalledWith(expect.objectContaining({
      method: 'POST',
      url: expect.stringContaining('/v3/custom-fields/15/assign/5'),
      data: { value: 'Hello' }
    }))
  })

  it('tasks.byId(id).getCustomField gets value', async () => {
    ;(axios as unknown as jest.Mock).mockResolvedValueOnce({ data: { data: { id: 22 } } })
    const res = await api.tasks.byId(111).getCustomField(33)
    expect(res).toEqual({ data: { id: 22 } })
    expect(axios).toHaveBeenCalledWith(expect.objectContaining({
      method: 'GET',
      url: expect.stringContaining('/v3/custom-fields/33/value/111')
    }))
  })

  it('timeEntries.byId(id).deleteCustomField deletes unassign', async () => {
    ;(axios as unknown as jest.Mock).mockResolvedValueOnce({ data: { data: 'ok' } })
    const res = await api.timeEntries.byId(42).deleteCustomField(7)
    expect(res).toEqual({ data: 'ok' })
    expect(axios).toHaveBeenCalledWith(expect.objectContaining({
      method: 'DELETE',
      url: expect.stringContaining('/v3/custom-fields/7/unassign/42')
    }))
  })

  it('users.byId(id).getAllCustomFields lists values for resource', async () => {
    ;(axios as unknown as jest.Mock).mockResolvedValueOnce({ data: { data: [] } })
    const res = await api.users.byId(9).getAllCustomFields()
    expect(res).toEqual({ data: [] })
    expect(axios).toHaveBeenCalledWith(expect.objectContaining({
      method: 'GET',
      url: expect.stringContaining('/v3/custom-fields/values/resource/9/type/user')
    }))
  })

  it('users.getAllWithCustomFields returns users enriched with CF values', async () => {
    ;(axios as unknown as jest.Mock)
      .mockResolvedValueOnce({ data: { u1: { id: 1, name: 'A' }, u2: { id: 2, name: 'B' } } })
      .mockResolvedValueOnce({ data: { data: [{ templateId: 66, value: 'X' }] } })
      .mockResolvedValueOnce({ data: { data: [{ templateId: 77, value: 'Y' }] } })

    const res = await api.users.getAllWithCustomFields()
    expect(res).toEqual([
      { id: 1, name: 'A', customFields: [{ templateId: 66, value: 'X' }] },
      { id: 2, name: 'B', customFields: [{ templateId: 77, value: 'Y' }] }
    ])
    expect(axios).toHaveBeenNthCalledWith(1, expect.objectContaining({ url: expect.stringContaining('/users') }))
    expect(axios).toHaveBeenNthCalledWith(2, expect.objectContaining({ url: expect.stringContaining('/v3/custom-fields/values/resource/1/type/user') }))
    expect(axios).toHaveBeenNthCalledWith(3, expect.objectContaining({ url: expect.stringContaining('/v3/custom-fields/values/resource/2/type/user') }))
  })

  it('customFields.add creates a template', async () => {
    ;(axios as unknown as jest.Mock).mockResolvedValueOnce({ data: { data: { id: 15, name: 'CF', resourceType: 'user' } } })
    const res = await api.customFields.add({ name: 'CF', resourceType: 'user', fieldType: 'string', required: true, defaultValue: '' })
    expect(res).toEqual({ data: { id: 15, name: 'CF', resourceType: 'user' } })
    expect(axios).toHaveBeenCalledWith(expect.objectContaining({
      method: 'POST',
      url: expect.stringContaining('/v3/custom-fields/template/create'),
      data: expect.objectContaining({ name: 'CF', resourceType: 'user', fieldType: 'string' })
    }))
  })

  it('customFields.delete removes a template', async () => {
    ;(axios as unknown as jest.Mock).mockResolvedValueOnce({ data: { data: 'ok' } })
    const res = await api.customFields.delete(99)
    expect(res).toEqual({ data: 'ok' })
    expect(axios).toHaveBeenCalledWith(expect.objectContaining({
      method: 'DELETE',
      url: expect.stringContaining('/v3/custom-fields/template/99/remove')
    }))
  })

  it('customFields.update modifies a template', async () => {
    ;(axios as unknown as jest.Mock).mockResolvedValueOnce({ data: { data: { id: 77, name: 'Updated' } } })
    const res = await api.customFields.update(77, { name: 'Updated', defaultValue: '' })
    expect(res).toEqual({ data: { id: 77, name: 'Updated' } })
    expect(axios).toHaveBeenCalledWith(expect.objectContaining({
      method: 'PUT',
      url: expect.stringContaining('/v3/custom-fields/template/77/modify'),
      data: expect.objectContaining({ name: 'Updated' })
    }))
  })
})


