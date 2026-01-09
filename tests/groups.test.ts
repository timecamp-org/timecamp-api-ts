import { TimeCampAPI } from '../src/TimeCampAPI';

// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('Groups API', () => {
  let api: TimeCampAPI;

  beforeEach(() => {
    mockFetch.mockClear();
    api = new TimeCampAPI('test-key');
  });

  const createMockResponse = (data: any, status = 200) => ({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
  });

  it('groups.getAll fetches all groups', async () => {
    const mockResponse = [
      {
        group_id: '530222',
        name: 'People',
        parent_id: '0',
      },
      {
        group_id: '1764',
        name: '[Inactive]',
        parent_id: '1208',
      },
    ];
    mockFetch.mockResolvedValueOnce(createMockResponse(mockResponse));

    const result = await api.groups.getAll();

    expect(result).toHaveLength(2);
    expect(result[0].group_id).toBe(530222);
    expect(result[0].name).toBe('People');
    expect(result[0].parent_id).toBe(0);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/group'),
      expect.objectContaining({ method: 'GET' })
    );
  });

  it('groups.create requires name parameter', async () => {
    await expect(api.groups.create({ name: '' })).rejects.toThrow('Group name is required');
  });

  it('groups.create creates a new group with parent_id', async () => {
    const mockResponse = {
      group_id: '390673',
      name: 'Name of New Group',
      admin_id: '0',
      parent_id: '390672',
      root_group_id: '390672',
    };
    mockFetch.mockResolvedValueOnce(createMockResponse(mockResponse));

    const result = await api.groups.create({
      name: 'Name of New Group',
      parent_id: 390672,
    });

    expect(result.group_id).toBe(390673);
    expect(result.name).toBe('Name of New Group');
    expect(result.parent_id).toBe(390672);
    expect(result.admin_id).toBe(0);
    expect(result.root_group_id).toBe(390672);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/group'),
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify({ name: 'Name of New Group', parent_id: 390672 }),
      })
    );
  });

  it('groups.create creates a root group without parent_id', async () => {
    const mockResponse = {
      group_id: '390674',
      name: 'Root Group',
      admin_id: '0',
      parent_id: '0',
      root_group_id: '390674',
    };
    mockFetch.mockResolvedValueOnce(createMockResponse(mockResponse));

    const result = await api.groups.create({
      name: 'Root Group',
    });

    expect(result.group_id).toBe(390674);
    expect(result.name).toBe('Root Group');
    expect(result.parent_id).toBe(0);
  });

  it('groups.update requires group_id parameter', async () => {
    await expect(api.groups.update({ group_id: 0 } as any)).rejects.toThrow(
      'Group ID is required'
    );
  });

  it('groups.update updates group name', async () => {
    mockFetch.mockResolvedValueOnce(createMockResponse({}));

    await api.groups.update({
      group_id: 390672,
      name: 'Updated Group Name',
    });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/group'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ group_id: 390672, name: 'Updated Group Name' }),
      })
    );
  });

  it('groups.update updates group parent_id', async () => {
    mockFetch.mockResolvedValueOnce(createMockResponse({}));

    await api.groups.update({
      group_id: 390672,
      parent_id: 123,
    });

    const callArgs = mockFetch.mock.calls[0];
    const body = JSON.parse(callArgs[1].body);
    expect(body.group_id).toBe(390672);
    expect(body.parent_id).toBe('123'); // API expects string
  });

  it('groups.delete deletes a group', async () => {
    mockFetch.mockResolvedValueOnce(createMockResponse({}));

    await api.groups.delete(390673);

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/group'),
      expect.objectContaining({
        method: 'DELETE',
        body: JSON.stringify({ group_id: 390673 }),
      })
    );
  });
});
