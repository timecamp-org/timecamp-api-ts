import { TimeCampAPI } from '../src/TimeCampAPI'

// Mock global fetch
const mockFetch = jest.fn()
global.fetch = mockFetch

describe('Users API', () => {
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
    
    // Mock the invite call, users.getAll call, and display name update call
    mockFetch
      .mockResolvedValueOnce(createMockResponse(mockInviteResponse))
      .mockResolvedValueOnce(createMockResponse(mockUsersResponse))
      .mockResolvedValueOnce(createMockResponse({ success: true }))

    const res = await api.users.invite({
      email: 'test@example.com',
      name: 'Test User',
      group_id: 123
    })

    expect(res.statuses['test@example.com'].status).toBe('Invite')
    expect(res.user_id).toBe('123')
    
    // Verify invite call
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/group/123/user'),
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"email":["test@example.com"]')
      })
    )
    
    // Verify users.getAll call
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/users'),
      expect.objectContaining({ method: 'GET' })
    )
    
    // Verify display name update call
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/user'),
      expect.objectContaining({
        method: 'POST',
        body: 'display_name=Test+User&user_id=123',
        headers: expect.objectContaining({
          'Content-Type': 'application/x-www-form-urlencoded'
        })
      })
    )
  })

  it('users.invite without name does not update display name', async () => {
    const mockInviteResponse = { 
      statuses: { 
        'test@example.com': { 
          status: 'Invite' 
        } 
      } 
    }
    
    mockFetch.mockResolvedValueOnce(createMockResponse(mockInviteResponse))

    const res = await api.users.invite({
      email: 'test@example.com',
      group_id: 123
    })

    expect(res.statuses['test@example.com'].status).toBe('Invite')
    expect(res.user_id).toBeUndefined()
    
    // Should only make the invite call, not the users.getAll or update calls
    expect(mockFetch).toHaveBeenCalledTimes(1)
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/group/123/user'),
      expect.objectContaining({ method: 'POST' })
    )
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

    // Mock user.get, invite, users.getAll, and display name update
    mockFetch
      .mockResolvedValueOnce(createMockResponse(mockUserData))
      .mockResolvedValueOnce(createMockResponse(mockInviteResponse))
      .mockResolvedValueOnce(createMockResponse(mockUsersResponse))
      .mockResolvedValueOnce(createMockResponse({ success: true }))

    const res = await api.users.invite({
      email: 'newuser@example.com',
      name: 'New User'
    })

    expect(res.statuses['newuser@example.com'].status).toBe('Invite')
    expect(res.user_id).toBe('888')
    
    // Verify user.get was called (first call)
    expect(mockFetch).toHaveBeenNthCalledWith(1,
      expect.stringContaining('/me'),
      expect.any(Object)
    )
    
    // Verify invite used root_group_id from user.get
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/group/456/user'),
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"email":["newuser@example.com"]')
      })
    )
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
    
    const create429Response = () => ({
      ok: false,
      status: 429,
      json: () => Promise.resolve({ message: 'You cannot process multiple request at once. Try again later.' }),
    })

    // Mock: first two calls fail with 429, third succeeds
    mockFetch
      .mockResolvedValueOnce(create429Response())
      .mockResolvedValueOnce(create429Response())
      .mockResolvedValueOnce(createMockResponse(mockInviteResponse))

    const invitePromise = api.users.invite({
      email: 'newuser@example.com',
      group_id: 123
    })

    // Fast-forward through the retry delays
    await jest.advanceTimersByTimeAsync(10000)

    const res = await invitePromise

    expect(res).toEqual(mockInviteResponse)
    expect(res.statuses['newuser@example.com'].status).toBe('Invite')
    expect(mockFetch).toHaveBeenCalledTimes(3) // 2 failures + 1 success

    jest.useRealTimers()
  })

  it('users.invite throws error after max retries on 429', async () => {
    jest.useFakeTimers()
    
    const create429Response = () => ({
      ok: false,
      status: 429,
      json: () => Promise.resolve({ message: 'You cannot process multiple request at once. Try again later.' }),
    })

    // Mock: all calls fail with 429 (4 attempts total: initial + 3 retries)
    mockFetch.mockResolvedValue(create429Response())

    // Start the invite process
    const invitePromise = api.users.invite({
      email: 'newuser@example.com',
      group_id: 123
    }).catch(err => err)

    // Fast-forward through all retry delays (3 retries * 5 seconds each = 15 seconds)
    await jest.advanceTimersByTimeAsync(15000)

    const result = await invitePromise
    
    expect(result).toBeInstanceOf(Error)
    expect(result.message).toContain('TimeCamp API error: 429')
    expect(mockFetch).toHaveBeenCalledTimes(4) // initial + 3 retries

    jest.useRealTimers()
  })
})
