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

