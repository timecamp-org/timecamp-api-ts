import { TimeCampAPI } from '../src/TimeCampAPI';

// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('Billing Rates API', () => {
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

  describe('Task Rates', () => {
    it('billingRates.getTaskRates fetches rates for task', async () => {
      const mockResponse = {
        '75091248': [
          {
            rateId: 145996,
            rateTypeId: 12,
            value: '21.00',
            refType: 'task',
            addDate: '2000-01-01',
            refId: '75091248',
          },
        ],
      };
      mockFetch.mockResolvedValueOnce(createMockResponse(mockResponse));

      const result = await api.billingRates.getTaskRates(75091248);

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/task/75091248/rate'),
        expect.objectContaining({ method: 'GET' })
      );
    });

    it('billingRates.setTaskRate creates/updates task rate', async () => {
      const mockResponse = {
        rateId: 145999,
        rateTypeId: 23,
        value: 333,
        refType: 'task',
        addDate: '2021-09-09',
        refId: '75091248',
      };
      mockFetch.mockResolvedValueOnce(createMockResponse(mockResponse, 201));

      const result = await api.billingRates.setTaskRate(75091248, {
        rateTypeId: 23,
        value: 333,
        addDate: '2021-09-09',
      });

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/task/75091248/rate'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ rateTypeId: 23, value: 333, addDate: '2021-09-09' }),
        })
      );
    });
  });

  describe('User Rates', () => {
    it('billingRates.getUserRates fetches rates for user', async () => {
      const mockResponse = {
        '1787724': [
          {
            rateId: 146002,
            rateTypeId: 12,
            value: '22.00',
            refType: 'user',
            addDate: '2000-01-01',
            refId: '1787724',
          },
        ],
      };
      mockFetch.mockResolvedValueOnce(createMockResponse(mockResponse));

      const result = await api.billingRates.getUserRates(1787724);

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/user/1787724/rate'),
        expect.objectContaining({ method: 'GET' })
      );
    });

    it('billingRates.setUserRate creates/updates user rate', async () => {
      const mockResponse = {
        rateId: 146003,
        rateTypeId: 23,
        value: 3,
        refType: 'user',
        addDate: '2021-05-27',
        refId: '1787724',
      };
      mockFetch.mockResolvedValueOnce(createMockResponse(mockResponse, 201));

      const result = await api.billingRates.setUserRate(1787724, {
        rateTypeId: 23,
        value: 3,
      });

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/user/1787724/rate'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ rateTypeId: 23, value: 3 }),
        })
      );
    });
  });

  describe('Task-User Rates', () => {
    it('billingRates.getTaskUserRates fetches rates for task-user', async () => {
      const mockResponse = {
        '75091248': [
          {
            rateId: 145996,
            rateTypeId: 12,
            value: '21.00',
            refType: 'task_user',
            addDate: '2000-01-01',
            refId: '75091248',
          },
        ],
      };
      mockFetch.mockResolvedValueOnce(createMockResponse(mockResponse));

      const result = await api.billingRates.getTaskUserRates(75091248, 12343);

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/task/75091248/user/12343/rate'),
        expect.objectContaining({ method: 'GET' })
      );
    });

    it('billingRates.setTaskUserRate creates/updates task-user rate', async () => {
      const mockResponse = {
        rateId: 145999,
        rateTypeId: 23,
        value: 333,
        refType: 'task_user',
        addDate: '2021-09-09',
        refId: '75091248',
      };
      mockFetch.mockResolvedValueOnce(createMockResponse(mockResponse, 201));

      const result = await api.billingRates.setTaskUserRate(75091248, 12343, {
        rateTypeId: 23,
        value: 333,
      });

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/task/75091248/user/12343/rate'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ rateTypeId: 23, value: 333 }),
        })
      );
    });
  });

  describe('Group Rates', () => {
    it('billingRates.getGroupRates fetches rates for group', async () => {
      const mockResponse = {
        '75091248': [
          {
            rateId: 145996,
            rateTypeId: 12,
            value: '21.00',
            refType: 'group',
            addDate: '2000-01-01',
            refId: '75091248',
          },
        ],
      };
      mockFetch.mockResolvedValueOnce(createMockResponse(mockResponse));

      const result = await api.billingRates.getGroupRates(75091248);

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/group/75091248/rate'),
        expect.objectContaining({ method: 'GET' })
      );
    });

    it('billingRates.setGroupRate creates/updates group rate', async () => {
      const mockResponse = {
        rateId: 145999,
        rateTypeId: 23,
        value: 333,
        refType: 'group',
        addDate: '2021-09-09',
        refId: '75091248',
      };
      mockFetch.mockResolvedValueOnce(createMockResponse(mockResponse, 201));

      const result = await api.billingRates.setGroupRate(75091248, {
        rateTypeId: 23,
        value: 333,
      });

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/group/75091248/rate'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ rateTypeId: 23, value: 333 }),
        })
      );
    });
  });
});
