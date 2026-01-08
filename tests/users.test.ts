import axios from 'axios'
import { TimeCampAPI } from '../src/TimeCampAPI'

jest.mock('axios')

describe('Users API', () => {
  let api: TimeCampAPI

  beforeEach(() => {
    const fakeInstance = {
      defaults: {
        baseURL: 'https://app.timecamp.com/third_party/api',
        headers: {}
      },
      interceptors: { request: { use: jest.fn() } },
      get: jest.fn()
    } as any
    ;(axios.create as unknown as jest.Mock).mockReturnValue(fakeInstance)
    ;(axios as unknown as jest.Mock).mockClear()
    
    // Mock axios.isAxiosError to recognize our mock errors
    ;(axios.isAxiosError as unknown as jest.Mock) = jest.fn((error: any) => {
      return error && error.isAxiosError === true
    })
    
    api = new TimeCampAPI('test-key')
  })

  it('users.invite sends POST request with email to group endpoint', async () => {
    const mockInviteResponse = { 
      statuses: { 
        'test@example.com': { 
          status: 'Invite' 
        } 
      } 
    }
    const mockUsersResponse = {
      '123': {
        user_id: '123',
        email: 'test@example.com',
        display_name: 'Old Name'
      }
    }
    
    // Mock the invite call
    ;(axios as unknown as jest.Mock).mockResolvedValueOnce({ data: mockInviteResponse })
    // Mock the users.getAll call
    ;(axios as unknown as jest.Mock).mockResolvedValueOnce({ data: mockUsersResponse })
    // Mock the display name update call
    ;(axios as unknown as jest.Mock).mockResolvedValueOnce({ data: { success: true } })

    const res = await api.users.invite({
      email: 'test@example.com',
      name: 'Test User',
      group_id: 123
    })

    expect(res.statuses['test@example.com'].status).toBe('Invite')
    expect(res.user_id).toBe('123')
    
    // Verify invite call
    expect(axios).toHaveBeenCalledWith(expect.objectContaining({
      method: 'POST',
      url: expect.stringContaining('/group/123/user'),
      data: expect.objectContaining({
        email: ['test@example.com'],
        tt_global_admin: '0',
        tt_can_create_level_1_tasks: '0',
        can_view_rates: '0',
        add_to_all_projects: '0',
        send_email: '0',
        force_change_pass: '0'
      })
    }))
    
    // Verify users.getAll call
    expect(axios).toHaveBeenCalledWith(expect.objectContaining({
      method: 'GET',
      url: expect.stringContaining('/users')
    }))
    
    // Verify display name update call
    expect(axios).toHaveBeenCalledWith(expect.objectContaining({
      method: 'POST',
      url: expect.stringContaining('/user'),
      data: 'display_name=Test+User&user_id=123',
      headers: expect.objectContaining({
        'Content-Type': 'application/x-www-form-urlencoded'
      })
    }))
  })

  it('users.invite without name does not update display name', async () => {
    const mockInviteResponse = { 
      statuses: { 
        'test@example.com': { 
          status: 'Invite' 
        } 
      } 
    }
    
    ;(axios as unknown as jest.Mock).mockResolvedValueOnce({ data: mockInviteResponse })

    const res = await api.users.invite({
      email: 'test@example.com',
      group_id: 123
    })

    expect(res.statuses['test@example.com'].status).toBe('Invite')
    expect(res.user_id).toBeUndefined()
    
    // Should only make the invite call, not the users.getAll or update calls
    expect(axios).toHaveBeenCalledTimes(1)
    expect(axios).toHaveBeenCalledWith(expect.objectContaining({
      method: 'POST',
      url: expect.stringContaining('/group/123/user')
    }))
  })

  it('users.invite fetches root_group_id from user.get when group_id not provided', async () => {
    const mockUserData = {
      user_id: '999',
      email: 'current@example.com',
      display_name: 'Current User',
      register_time: '2024-01-01',
      synch_time: '2024-01-01',
      root_group_id: '456'
    }
    const mockInviteResponse = { 
      statuses: { 
        'newuser@example.com': { 
          status: 'Invite' 
        } 
      } 
    }
    const mockUsersResponse = {
      '888': {
        user_id: '888',
        email: 'newuser@example.com',
        display_name: 'Old Name'
      }
    }

    // Mock the user.get() call
    const fakeInstance = (api as any).client
    fakeInstance.get = jest.fn().mockResolvedValueOnce({ data: mockUserData })

    // Mock the invite POST call
    ;(axios as unknown as jest.Mock).mockResolvedValueOnce({ data: mockInviteResponse })
    // Mock the users.getAll call
    ;(axios as unknown as jest.Mock).mockResolvedValueOnce({ data: mockUsersResponse })
    // Mock the display name update call
    ;(axios as unknown as jest.Mock).mockResolvedValueOnce({ data: { success: true } })

    const res = await api.users.invite({
      email: 'newuser@example.com',
      name: 'New User'
    })

    expect(res.statuses['newuser@example.com'].status).toBe('Invite')
    expect(res.user_id).toBe('888')
    expect(fakeInstance.get).toHaveBeenCalledWith('/me')
    expect(axios).toHaveBeenCalledWith(expect.objectContaining({
      method: 'POST',
      url: expect.stringContaining('/group/456/user'),
      data: expect.objectContaining({
        email: ['newuser@example.com']
      })
    }))
  })

  it('users.invite retries on 429 error and eventually succeeds', async () => {
    jest.useFakeTimers()
    
    const mockInviteResponse = { 
      statuses: { 
        'newuser@example.com': { 
          status: 'Invite' 
        } 
      } 
    }
    
    // Create a proper Axios error with isAxiosError property
    const mock429Error = Object.assign(new Error('Request failed'), {
      response: { 
        status: 429, 
        data: { message: 'You cannot process multiple request at once. Try again later.' }
      },
      isAxiosError: true,
      toJSON: () => ({})
    })

    // Mock: first two calls fail with 429, third succeeds (no name provided, so no extra calls)
    ;(axios as unknown as jest.Mock)
      .mockRejectedValueOnce(mock429Error)
      .mockRejectedValueOnce(mock429Error)
      .mockResolvedValueOnce({ data: mockInviteResponse })

    const invitePromise = api.users.invite({
      email: 'newuser@example.com',
      group_id: 123
    })

    // Fast-forward through the retry delays
    await jest.advanceTimersByTimeAsync(10000)

    const res = await invitePromise

    expect(res).toEqual(mockInviteResponse)
    expect(res.statuses['newuser@example.com'].status).toBe('Invite')
    expect(axios).toHaveBeenCalledTimes(3) // 2 failures + 1 success

    jest.useRealTimers()
  })

  it('users.invite throws error after max retries on 429', async () => {
    jest.useFakeTimers()
    
    // Create a proper Axios error with isAxiosError property
    const mock429Error = Object.assign(new Error('Request failed'), {
      response: { 
        status: 429, 
        data: { message: 'You cannot process multiple request at once. Try again later.' }
      },
      isAxiosError: true,
      toJSON: () => ({})
    })

    // Mock: all calls fail with 429 (4 attempts total: initial + 3 retries)
    ;(axios as unknown as jest.Mock)
      .mockRejectedValue(mock429Error)

    // Start the invite process (no name to avoid extra calls)
    const invitePromise = api.users.invite({
      email: 'newuser@example.com',
      group_id: 123
    }).catch(err => err) // Catch the error to prevent unhandled rejection

    // Fast-forward through all retry delays (3 retries * 5 seconds each = 15 seconds)
    await jest.advanceTimersByTimeAsync(15000)

    const result = await invitePromise
    
    expect(result).toBeInstanceOf(Error)
    expect(result.message).toContain('TimeCamp API error: 429')
    expect(axios).toHaveBeenCalledTimes(4) // initial + 3 retries

    jest.useRealTimers()
  })
})
