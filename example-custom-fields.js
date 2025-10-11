require('dotenv').config();
const { TimeCampAPI } = require('./dist');

async function main() {
  const apiKey = process.env.TIMECAMP_API_KEY || 'your-api-key-here';
  if (apiKey === 'your-api-key-here') {
    console.log('Please set TIMECAMP_API_KEY or replace the placeholder API key.');
    return;
  }

  const api = new TimeCampAPI(apiKey, { clientName: 'example-custom-fields' });

  try {
    // 1) List Custom Field templates (v3)
    const templates = await api.customFields.getAll();
    console.log('Custom Field Templates (first 3):', templates.data.slice(0, 3));

    console.log('\nCreating a custom field template...');
    const created = await api.customFields.add({
      name: 'Demo Field',
      resourceType: 'user',
      fieldType: 'string',
      required: false,
      defaultValue: ''
    });
    console.log('Created:', created.data);

    console.log('Updating the custom field template...');
    const updated = await api.customFields.update(created.data.id, { name: 'Demo Field Updated', defaultValue: '' });
    console.log('Updated:', updated.data);

    const usersWithCF = await api.users.getAllWithCustomFields();
    // console.log('Users with custom fields (first 2):');
    console.log('Users with custom fields (first 5):\n' + JSON.stringify(usersWithCF.slice(0, 5), null, 2));
    console.log(usersWithCF.slice(0, 5));

    const sampleUser = usersWithCF[0];
    if (sampleUser) {
      const userId = sampleUser.id;
      console.log(`\nWorking with user ID: ${userId} and name: ${sampleUser.email}`);

      const userValues = await api.users.byId(userId).getAllCustomFields();
      console.log('User CF values:', userValues.data);

      const setRes = await api.users.byId(userId).setCustomField(created.data.id, 'Demo Value');
      console.log('Set CF:', setRes.data);
      const updRes = await api.users.byId(userId).updateCustomField(created.data.id, 'Updated Value');
      console.log('Update CF:', updRes.data);

      const userValues2 = await api.users.byId(userId).getAllCustomFields();
      console.log('User CF values after update:', userValues2.data);

      const delRes = await api.users.byId(userId).deleteCustomField(created.data.id);
      console.log('Delete CF:', delRes.data);
    }

    console.log('Deleting the custom field template...');
    const removed = await api.customFields.delete(created.data.id);
    console.log('Removed:', removed.data);  

    // 4) Task custom fields (replace 123 with a real task id)
    // const taskValues = await api.tasks.getCustomFields(123).getAllCustomFields();
    // console.log('Task CF values:', taskValues.data);
    // if (process.env.ALLOW_CF_MUTATIONS === '1') {
    //   // await api.tasks.getCustomFields(123).setCustomField(66, 'T-Value');
    //   // await api.tasks.getCustomFields(123).updateCustomField(66, 'T-Value-2');
    //   // await api.tasks.getCustomFields(123).deleteCustomField(66);
    // }

    // 5) Time entry custom fields (replace 456 with a real entry id)
    // const entryValues = await api.timeEntries.getCustomFields(456).getAllCustomFields();
    // console.log('Entry CF values:', entryValues.data);
    // if (process.env.ALLOW_CF_MUTATIONS === '1') {
    //   // await api.timeEntries.getCustomFields(456).setCustomField(66, 'E-Value');
    //   // await api.timeEntries.getCustomFields(456).updateCustomField(66, 'E-Value-2');
    //   // await api.timeEntries.getCustomFields(456).deleteCustomField(66);
    // }

  } catch (err) {
    console.error('Error running example:', err && err.message ? err.message : err);
  }
}

main();


