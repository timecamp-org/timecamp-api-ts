import { BaseResource } from './BaseResource';
import {
  TimeCampInvoice,
  TimeCampInvoicesResponse,
  TimeCampCreateInvoiceRequest,
  TimeCampUpdateInvoiceRequest,
} from '../types';

/**
 * Encodes a nested object into application/x-www-form-urlencoded format
 * with bracket notation for arrays and nested objects.
 *
 * Example: entries[0][name] = "foo" becomes "entries%5B0%5D%5Bname%5D=foo"
 */
function encodeFormData(data: Record<string, any>, prefix = ''): string {
  const pairs: string[] = [];

  for (const [key, value] of Object.entries(data)) {
    if (value === undefined || value === null) continue;

    const encodedKey = prefix ? `${prefix}[${key}]` : key;

    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (typeof item === 'object' && item !== null) {
          pairs.push(encodeFormData(item, `${encodedKey}[${index}]`));
        } else {
          pairs.push(`${encodeURIComponent(`${encodedKey}[${index}]`)}=${encodeURIComponent(String(item))}`);
        }
      });
    } else if (typeof value === 'object') {
      pairs.push(encodeFormData(value, encodedKey));
    } else {
      pairs.push(`${encodeURIComponent(encodedKey)}=${encodeURIComponent(String(value))}`);
    }
  }

  return pairs.filter(Boolean).join('&');
}

/**
 * Builds the flat form data object from a create/update invoice request,
 * expanding entries into bracket-notation keys.
 */
function buildInvoiceFormData(request: TimeCampCreateInvoiceRequest | TimeCampUpdateInvoiceRequest): Record<string, string> {
  const flat: Record<string, any> = {};

  // Top-level fields
  flat.invoiceId = request.invoiceId ?? -1;
  if (request.clientId !== undefined) flat.clientId = request.clientId;
  if (request.description !== undefined) flat.description = request.description;
  if (request.issueDate !== undefined) flat.issueDate = request.issueDate;
  if (request.editDate !== undefined) flat.editDate = request.editDate;
  if (request.total !== undefined) flat.total = request.total;
  if (request.status !== undefined) flat.status = request.status;
  if (request.sentDate !== undefined) flat.sentDate = request.sentDate;
  if (request.viewedDate !== undefined) flat.viewedDate = request.viewedDate;
  if (request.addDate !== undefined) flat.addDate = request.addDate;
  if (request.dueDate !== undefined) flat.dueDate = request.dueDate;
  if (request.paidDate !== undefined) flat.paidDate = request.paidDate;
  if (request.noteToClient !== undefined) flat.noteToClient = request.noteToClient;
  if (request.pass !== undefined) flat.pass = request.pass;
  if (request.poNumber !== undefined) flat.poNumber = request.poNumber;
  if (request.externalService !== undefined) flat.externalService = request.externalService;
  if (request.externalId !== undefined) flat.externalId = request.externalId;
  if (request.userId !== undefined) flat.userId = request.userId;
  if (request.currencyId !== undefined) flat.currencyId = request.currencyId;
  if (request.rootGroupId !== undefined) flat.rootGroupId = request.rootGroupId;
  if (request.quote !== undefined) flat.quote = request.quote;
  if (request.publicHash !== undefined) flat.publicHash = request.publicHash;
  if (request.hasExpenses !== undefined) flat.hasExpenses = request.hasExpenses;
  if (request.expensesTotal !== undefined) flat.expensesTotal = request.expensesTotal;
  if (request.textStatus !== undefined) flat.textStatus = request.textStatus;
  if (request.invoiceNumber !== undefined) flat.invoiceNumber = request.invoiceNumber;

  // Entries array
  if (request.entries) {
    flat.entries = request.entries.map((entry) => {
      const e: Record<string, any> = {
        invoiceId: entry.invoiceId,
        invoiceEntryId: entry.invoiceEntryId,
        description: entry.description,
        type: entry.type,
        duration: entry.duration,
        quantity: entry.quantity,
        unitCost: entry.unitCost,
        taxId: entry.taxId,
        name: entry.name,
        subTotal: entry.subTotal,
      };
      if (entry.ttEntriesIds) {
        e.ttEntriesIds = entry.ttEntriesIds;
      }
      return e;
    });
  }

  return flat;
}

export class InvoicesResource extends BaseResource {
  /**
   * Get all invoices for the current organization
   */
  async getAll(): Promise<TimeCampInvoicesResponse> {
    return this.makeRequest<TimeCampInvoicesResponse>('GET', 'invoice');
  }

  /**
   * Create a new invoice from time entries.
   *
   * The API uses PUT with form-urlencoded body and bracket notation for entries.
   * Set invoiceId to -1 (or omit) and invoiceEntryId to -1 for new entries.
   *
   * @example
   * ```typescript
   * const invoice = await api.invoices.create({
   *   clientId: 1412133,
   *   issueDate: '2026-02-10',
   *   addDate: '2026-02-10',
   *   noteToClient: 'From 2026-01-26 to 2026-02-28',
   *   currencyId: 1,
   *   invoiceNumber: '122',
   *   entries: [
   *     {
   *       invoiceId: -1,
   *       invoiceEntryId: -1,
   *       description: '2026-01-26 07:53 ',
   *       type: 0,
   *       duration: 19980,
   *       quantity: 5.55,
   *       unitCost: 109,
   *       taxId: 198,
   *       name: '[ORG] Administration - Ewelina Lagos',
   *       subTotal: 604.95,
   *       ttEntriesIds: [263222996],
   *     },
   *   ],
   * });
   * ```
   */
  async create(request: TimeCampCreateInvoiceRequest): Promise<TimeCampInvoice> {
    const data = buildInvoiceFormData({ ...request, invoiceId: -1 });
    const body = encodeFormData(data);

    return this.makeRequest<TimeCampInvoice>('PUT', 'invoice', {
      rawBody: body,
      contentType: 'application/x-www-form-urlencoded',
    });
  }

  /**
   * Update an existing invoice
   */
  async update(request: TimeCampUpdateInvoiceRequest): Promise<TimeCampInvoice> {
    const data = buildInvoiceFormData(request);
    const body = encodeFormData(data);

    return this.makeRequest<TimeCampInvoice>('POST', 'invoice', {
      rawBody: body,
      contentType: 'application/x-www-form-urlencoded',
    });
  }

  /**
   * Delete an invoice by ID
   */
  async delete(invoiceId: number): Promise<void> {
    return this.makeRequest<void>('DELETE', 'invoice', {
      json: { invoiceId },
    });
  }
}
