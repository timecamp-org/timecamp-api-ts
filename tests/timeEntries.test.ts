import { TimeCampAPI } from '../src/TimeCampAPI';

// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('Time Entries API', () => {
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

  it('timeEntries.create supports tags parameter', async () => {
    const mockResponse = {
      entry_id: '123456',
    };
    mockFetch.mockResolvedValueOnce(createMockResponse(mockResponse));

    await api.timeEntries.create({
      date: '2024-01-09',
      duration: 3600,
      start_time: '09:00',
      end_time: '10:00',
      description: 'Test entry',
      tags: [{ tagId: 1 }, { tagId: 4 }],
    });

    const callArgs = mockFetch.mock.calls[0];
    const body = JSON.parse(callArgs[1].body);
    expect(body.tags).toEqual([{ tagId: 1 }, { tagId: 4 }]);
  });

  it('timeEntries.getTags fetches tags for entry', async () => {
    const mockResponse = {
      '101434259': [
        {
          tagListName: 'Not important tags',
          tagListId: '8',
          tagId: '13',
          name: '111',
          mandatory: '0',
        },
      ],
    };
    mockFetch.mockResolvedValueOnce(createMockResponse(mockResponse));

    const result = await api.timeEntries.getTags(101434259);

    expect(result).toEqual(mockResponse);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/entries/101434259/tags'),
      expect.objectContaining({ method: 'GET' })
    );
  });

  it('timeEntries.addTags adds tags to entry', async () => {
    const mockResponse = ['13'];
    mockFetch.mockResolvedValueOnce(createMockResponse(mockResponse));

    const result = await api.timeEntries.addTags(101434259, [13, 14]);

    expect(result).toEqual(mockResponse);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/entries/101434259/tags'),
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify({ tags: '13,14' }),
      })
    );
  });

  it('timeEntries.removeTags removes tags from entry', async () => {
    const mockResponse = ['15'];
    mockFetch.mockResolvedValueOnce(createMockResponse(mockResponse));

    const result = await api.timeEntries.removeTags(101434259, [15]);

    expect(result).toEqual(mockResponse);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/entries/101434259/tags'),
      expect.objectContaining({
        method: 'DELETE',
        body: JSON.stringify({ tags: '15' }),
      })
    );
  });
});
