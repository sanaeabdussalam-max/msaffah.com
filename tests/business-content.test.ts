import assert from 'node:assert/strict';
import { assertPublishableMedia } from '../lib/business-owner-permissions';
import { storageAdapter } from '../lib/storage/storage-adapter';

async function main() {
  assert.doesNotThrow(() => assertPublishableMedia({ permissionConfirmed: true, contentType: 'image/jpeg', fileSize: 1024 }));
  assert.throws(() => assertPublishableMedia({ permissionConfirmed: false, contentType: 'image/jpeg', fileSize: 1024 }), /MEDIA_PERMISSION_REQUIRED/);
  assert.throws(() => assertPublishableMedia({ permissionConfirmed: true, contentType: 'application/pdf', fileSize: 1024 }), /MEDIA_TYPE_NOT_ALLOWED/);
  const intent = await storageAdapter.createUploadIntent({ businessId: 'business-1', fileName: 'project.jpg', contentType: 'image/jpeg', fileSize: 1024, usageType: 'PROJECT' });
  assert.equal(intent.provider, 'PENDING_PROVIDER');
  assert.match(intent.storageKey, /^business\/business-1\//);
  console.log('business content permissions and storage adapter tests passed');
}
void main();
