import { TimeCampAPI } from '../src/TimeCampAPI';

// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('Tags API', () => {
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

  describe('Tag Lists', () => {
    it('tags.getTagLists fetches all tag lists', async () => {
      const mockResponse = {
        '3': {
          id: '3',
          name: 'Tags 1',
          archived: '0',
        },
        '4': {
          id: '4',
          name: 'Tags 2',
          archived: '0',
        },
      };
      mockFetch.mockResolvedValueOnce(createMockResponse(mockResponse));

      const result = await api.tags.getTagLists();

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/tag_list'),
        expect.objectContaining({ method: 'GET' })
      );
    });

    it('tags.getTagList fetches specific tag list with tags', async () => {
      const mockResponse = {
        id: '8',
        name: 'My tag list',
        archived: '0',
        tags: {
          '13': {
            id: '13',
            name: 'First tag',
            archived: '0',
            hasGroupRestrictions: '0',
          },
        },
      };
      mockFetch.mockResolvedValueOnce(createMockResponse(mockResponse));

      const result = await api.tags.getTagList(8);

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/tag_list/8'),
        expect.objectContaining({ method: 'GET' })
      );
    });

    it('tags.createTagList creates a new tag list', async () => {
      const mockResponse = 15;
      mockFetch.mockResolvedValueOnce(createMockResponse(mockResponse));

      const result = await api.tags.createTagList({ name: 'New tag list' });

      expect(result).toBe(15);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/tag_list'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ name: 'New tag list' }),
        })
      );
    });

    it('tags.updateTagList updates tag list', async () => {
      const mockResponse = { message: 'OK' };
      mockFetch.mockResolvedValueOnce(createMockResponse(mockResponse));

      const result = await api.tags.updateTagList(5, { name: 'Updated name' });

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/tag_list/5'),
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ name: 'Updated name' }),
        })
      );
    });

    it('tags.getTagListTags fetches tags from tag list', async () => {
      const mockResponse = {
        '13': {
          id: '13',
          name: 'First tag',
          archived: '0',
          hasGroupRestrictions: '0',
        },
      };
      mockFetch.mockResolvedValueOnce(createMockResponse(mockResponse));

      const result = await api.tags.getTagListTags(8);

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/tag_list/8/tags'),
        expect.objectContaining({ method: 'GET' })
      );
    });
  });

  describe('Tags', () => {
    it('tags.createTag creates a new tag', async () => {
      const mockResponse = 16;
      mockFetch.mockResolvedValueOnce(createMockResponse(mockResponse));

      const result = await api.tags.createTag({ list: 52, name: 'Development' });

      expect(result).toBe(16);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/tag'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ list: 52, name: 'Development' }),
        })
      );
    });

    it('tags.getTag fetches tag data', async () => {
      const mockResponse = {
        id: '13',
        name: '111',
        archived: '0',
        tagListId: '8',
        hasGroupRestrictions: '0',
      };
      mockFetch.mockResolvedValueOnce(createMockResponse(mockResponse));

      const result = await api.tags.getTag(13);

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/tag/13'),
        expect.objectContaining({ method: 'GET' })
      );
    });

    it('tags.updateTag updates tag data', async () => {
      const mockResponse = { message: 'OK' };
      mockFetch.mockResolvedValueOnce(createMockResponse(mockResponse));

      const result = await api.tags.updateTag(13, { name: 'Updated tag' });

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/tag/13'),
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ name: 'Updated tag' }),
        })
      );
    });
  });
});
