import { TimeCampAPI } from '../src/TimeCampAPI'

// Mock global fetch
const mockFetch = jest.fn()
global.fetch = mockFetch

describe('Tasks API', () => {
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

  it('tasks.add requires name parameter', async () => {
    await expect(api.tasks.add({ name: '' })).rejects.toThrow('Task name is required')
  })

  it('tasks.add posts to tasks endpoint with required name', async () => {
    const mockApiResponse = {
      '81272870': {
        task_id: '81272870',
        parent_id: '0',
        name: 'API TEST',
        external_task_id: null,
        external_parent_id: null,
        level: '1',
        add_date: '2026-01-08 13:51:21',
        archived: '0',
        color: '#34C664',
        tags: '',
        budgeted: '0',
        checked_date: null,
        root_group_id: '123',
        assigned_to: null,
        assigned_by: '640',
        due_date: null,
        note: null,
        context: null,
        folder: null,
        repeat: null,
        billable: '1',
        budget_unit: 'hours',
        public_hash: null,
        modify_time: null,
        task_key: null,
        keywords: ''
      }
    }
    mockFetch.mockResolvedValueOnce(createMockResponse(mockApiResponse))

    const res = await api.tasks.add({ name: 'Development Task' })

    // Response should have numbers instead of strings
    expect(res['81272870'].task_id).toBe(81272870)
    expect(res['81272870'].parent_id).toBe(0)
    expect(res['81272870'].level).toBe(1)
    expect(res['81272870'].archived).toBe(0)
    expect(res['81272870'].billable).toBe(1)
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/tasks'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ name: 'Development Task' })
      })
    )
  })

  it('tasks.add posts with all optional parameters', async () => {
    const mockApiResponse = {
      '81272870': {
        task_id: '81272870',
        parent_id: '123',
        name: 'Development Task',
        external_task_id: 'xero_g8g89s78ds8',
        external_parent_id: 'xero_2b5b26tb295bb9',
        level: '2',
        add_date: '2026-01-08 13:51:21',
        archived: '0',
        color: '#34C664',
        tags: 'IT, R&D',
        budgeted: '1000',
        checked_date: null,
        root_group_id: '123',
        assigned_to: null,
        assigned_by: '640',
        due_date: null,
        note: 'Development task note',
        context: null,
        folder: null,
        repeat: null,
        billable: '0',
        budget_unit: 'hours',
        public_hash: null,
        modify_time: null,
        task_key: null,
        keywords: 'IT, R&D'
      }
    }
    mockFetch.mockResolvedValueOnce(createMockResponse(mockApiResponse))

    const res = await api.tasks.add({
      name: 'Development Task',
      parent_id: 123,
      external_task_id: 'xero_g8g89s78ds8',
      external_parent_id: 'xero_2b5b26tb295bb9',
      budgeted: 1000,
      note: 'Development task note',
      archived: 0,
      billable: 0,
      budget_unit: 'hours',
      user_ids: '22,521,2,25',
      role: 5325,
      keywords: 'IT, R&D'
    })

    // Response should have numbers instead of strings
    expect(res['81272870'].task_id).toBe(81272870)
    expect(res['81272870'].parent_id).toBe(123)
    expect(res['81272870'].budgeted).toBe(1000)
    expect(res['81272870'].billable).toBe(0)
    
    // Verify the body contains all parameters
    const callArgs = mockFetch.mock.calls[0]
    const body = JSON.parse(callArgs[1].body)
    expect(body).toEqual({
      name: 'Development Task',
      parent_id: '123', // API expects string
      external_task_id: 'xero_g8g89s78ds8',
      external_parent_id: 'xero_2b5b26tb295bb9',
      budgeted: 1000,
      note: 'Development task note',
      archived: 0,
      billable: 0,
      budget_unit: 'hours',
      user_ids: '22,521,2,25',
      role: 5325,
      keywords: 'IT, R&D'
    })
  })

  it('tasks.getFavorites calls v3 favourites endpoint', async () => {
    const mockResponse = {
      data: {
        favourites: [],
        suggested: []
      },
      message: 'ok',
      meta: {
        favourites: { limit: 10 }
      }
    }
    mockFetch.mockResolvedValueOnce(createMockResponse(mockResponse))

    const res = await api.tasks.getFavorites()

    expect(res).toEqual(mockResponse)
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/v3/taskPicker/favourites'),
      expect.objectContaining({ method: 'GET' })
    )
  })

  it('tasks.addFavorite posts to add endpoint', async () => {
    const mockResponse = { message: 'ok' }
    mockFetch.mockResolvedValueOnce(createMockResponse(mockResponse))

    const res = await api.tasks.addFavorite(77390460)

    expect(res).toEqual(mockResponse)
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/v3/taskPicker/favourites/add/77390460'),
      expect.objectContaining({ method: 'POST' })
    )
  })

  it('tasks.removeFavorite deletes from delete endpoint', async () => {
    const mockResponse = { message: 'ok' }
    mockFetch.mockResolvedValueOnce(createMockResponse(mockResponse))

    const res = await api.tasks.removeFavorite(77189336)

    expect(res).toEqual(mockResponse)
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/v3/taskPicker/favourites/delete/77189336'),
      expect.objectContaining({ method: 'DELETE' })
    )
  })

  it('tasks.update requires task_id parameter', async () => {
    await expect(api.tasks.update({ task_id: 0 } as any)).rejects.toThrow('Task ID is required')
  })

  it('tasks.update puts to tasks endpoint', async () => {
    const mockApiResponse = {
      '81272870': {
        task_id: '81272870',
        parent_id: '0',
        name: 'Updated Task Name',
        external_task_id: null,
        external_parent_id: null,
        level: '1',
        add_date: '2026-01-08 13:51:21',
        archived: '0',
        color: '#34C664',
        tags: '',
        budgeted: '0',
        checked_date: null,
        root_group_id: '123',
        assigned_to: null,
        assigned_by: '640',
        due_date: null,
        note: null,
        context: null,
        folder: null,
        repeat: null,
        billable: '1',
        budget_unit: 'hours',
        public_hash: null,
        modify_time: null,
        task_key: null,
        keywords: ''
      }
    }
    mockFetch.mockResolvedValueOnce(createMockResponse(mockApiResponse))

    const res = await api.tasks.update({ task_id: 81272870, name: 'Updated Task Name' })

    expect(res['81272870'].name).toBe('Updated Task Name')
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/tasks'),
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify({ task_id: '81272870', name: 'Updated Task Name' })
      })
    )
  })

  it('tasks.update supports user assignment parameters', async () => {
    const mockApiResponse = {
      '81272870': {
        task_id: '81272870',
        parent_id: '0',
        name: 'Task with Users',
        external_task_id: null,
        external_parent_id: null,
        level: '1',
        add_date: '2026-01-08 13:51:21',
        archived: '0',
        color: '#34C664',
        tags: '',
        budgeted: '0',
        checked_date: null,
        root_group_id: '123',
        assigned_to: null,
        assigned_by: '640',
        due_date: null,
        note: null,
        context: null,
        folder: null,
        repeat: null,
        billable: '1',
        budget_unit: 'hours',
        public_hash: null,
        modify_time: null,
        task_key: null,
        keywords: ''
      }
    }
    mockFetch.mockResolvedValueOnce(createMockResponse(mockApiResponse))

    await api.tasks.update({
      task_id: 81272870,
      user_ids: '22,521,2,25',
      role: 5325
    })

    const callArgs = mockFetch.mock.calls[0]
    const body = JSON.parse(callArgs[1].body)
    expect(body.user_ids).toBe('22,521,2,25')
    expect(body.role).toBe(5325)
  })

  it('tasks.update handles null task in response gracefully', async () => {
    const mockApiResponse = {
      '81272870': null
    }
    mockFetch.mockResolvedValueOnce(createMockResponse(mockApiResponse))

    // This should not throw
    const res = await api.tasks.update({ task_id: 81272870, name: 'Updated Task Name' })
    
    // Verify result is empty or handles it
    expect(res['81272870']).toBeUndefined()
  })
})
