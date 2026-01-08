import axios from 'axios'
import { TimeCampAPI } from '../src/TimeCampAPI'

jest.mock('axios')

describe('Tasks API', () => {
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
    ;(axios as unknown as jest.Mock).mockResolvedValueOnce({ data: mockApiResponse })

    const res = await api.tasks.add({ name: 'Development Task' })

    // Response should have numbers instead of strings
    expect(res['81272870'].task_id).toBe(81272870)
    expect(res['81272870'].parent_id).toBe(0)
    expect(res['81272870'].level).toBe(1)
    expect(res['81272870'].archived).toBe(0)
    expect(res['81272870'].billable).toBe(1)
    expect(axios).toHaveBeenCalledWith(expect.objectContaining({
      method: 'POST',
      url: expect.stringContaining('/tasks'),
      data: { name: 'Development Task' }
    }))
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
    ;(axios as unknown as jest.Mock).mockResolvedValueOnce({ data: mockApiResponse })

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
    expect(axios).toHaveBeenCalledWith(expect.objectContaining({
      method: 'POST',
      url: expect.stringContaining('/tasks'),
      data: expect.objectContaining({
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
    }))
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
    ;(axios as unknown as jest.Mock).mockResolvedValueOnce({ data: mockResponse })

    const res = await api.tasks.getFavorites()

    expect(res).toEqual(mockResponse)
    expect(axios).toHaveBeenCalledWith(expect.objectContaining({
      method: 'GET',
      url: expect.stringContaining('/v3/taskPicker/favourites')
    }))
  })

  it('tasks.addFavorite posts to add endpoint', async () => {
    const mockResponse = { message: 'ok' }
    ;(axios as unknown as jest.Mock).mockResolvedValueOnce({ data: mockResponse })

    const res = await api.tasks.addFavorite(77390460)

    expect(res).toEqual(mockResponse)
    expect(axios).toHaveBeenCalledWith(expect.objectContaining({
      method: 'POST',
      url: expect.stringContaining('/v3/taskPicker/favourites/add/77390460'),
    }))
  })

  it('tasks.removeFavorite deletes from delete endpoint', async () => {
    const mockResponse = { message: 'ok' }
    ;(axios as unknown as jest.Mock).mockResolvedValueOnce({ data: mockResponse })

    const res = await api.tasks.removeFavorite(77189336)

    expect(res).toEqual(mockResponse)
    expect(axios).toHaveBeenCalledWith(expect.objectContaining({
      method: 'DELETE',
      url: expect.stringContaining('/v3/taskPicker/favourites/delete/77189336'),
    }))
  })
})

