/**
 * Example demonstrating the Invoices and Clients features:
 * - Client management (CRUD)
 * - Invoice creation from time entries
 */

const { TimeCampAPI } = require('../dist');

// Initialize API client with your API key
const api = new TimeCampAPI('your-api-key-here');

async function demonstrateInvoicesAndClients() {
  try {
    // ========================================
    // 1. CLIENTS MANAGEMENT
    // ========================================
    console.log('\n=== Clients Management ===');

    // List all clients
    const clients = await api.clients.getAll();
    console.log('Clients:', clients);

    // Create a client
    const client = await api.clients.create({
      organizationName: 'Acme Corp',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@acme.com',
    });
    console.log('Created client:', client);

    // Update a client
    const updatedClient = await api.clients.update({
      clientId: client.clientId,
      organizationName: 'Acme Corp Updated',
      address: '123 Main St, New York, NY',
    });
    console.log('Updated client:', updatedClient);

    // Get tasks assigned to a client
    const clientTasks = await api.clients.getTasks(client.clientId);
    console.log('Client tasks:', clientTasks);

    // Remove tasks from a client
    // await api.clients.removeTasks(client.clientId, [101, 102]);

    // Delete a client (will fail if client has invoices)
    // await api.clients.delete(client.clientId);

    // ========================================
    // 2. INVOICES MANAGEMENT
    // ========================================
    console.log('\n=== Invoices Management ===');

    // List all invoices
    const invoices = await api.invoices.getAll();
    console.log('Invoices:', invoices);

    // Create an invoice from time entries
    const invoice = await api.invoices.create({
      clientId: client.clientId,
      issueDate: '2026-02-10',
      addDate: '2026-02-10',
      noteToClient: 'From 2026-01-26 to 2026-02-28',
      currencyId: 1,
      invoiceNumber: '1223',
      entries: [
        {
          invoiceId: -1,
          invoiceEntryId: -1,
          description: '2026-01-26 07:53 ',
          type: 0,
          duration: 19980,
          quantity: 5.55,
          unitCost: 109,
          taxId: 198,
          name: '[ORG] Administration - Ewelina Łagos',
          subTotal: 604.95,
          ttEntriesIds: [263222996],
        },
        {
          invoiceId: -1,
          invoiceEntryId: -1,
          description: '2026-01-27 06:50 ',
          type: 0,
          duration: 1080,
          quantity: 0.3,
          unitCost: 109,
          taxId: 198,
          name: '[ORG] Administration - Ewelina Łagos',
          subTotal: 32.7,
          ttEntriesIds: [263342490],
        },
      ],
    });
    console.log('Created invoice:', invoice);

    // Update an existing invoice
    const updatedInvoice = await api.invoices.update({
      invoiceId: invoice.invoiceId,
      noteToClient: 'Updated note',
      status: 1,
    });
    console.log('Updated invoice:', updatedInvoice);

    // Delete an invoice
    // await api.invoices.delete(invoice.invoiceId);

    console.log('\n=== All demonstrations complete! ===');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Run the demonstration
demonstrateInvoicesAndClients();
