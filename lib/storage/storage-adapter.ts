export interface UploadIntentInput { businessId: string; fileName: string; contentType: string; fileSize: number; usageType: string; }
export interface UploadIntent { provider: string; storageKey: string; uploadUrl: string | null; }

export interface StorageAdapter {
  createUploadIntent(input: UploadIntentInput): Promise<UploadIntent>;
  finalizeUpload(input: UploadIntent & { publicUrl?: string }): Promise<{ provider: string; storageKey: string; publicUrl: string | null }>;
  deleteObject(storageKey: string): Promise<void>;
}

export const storageAdapter: StorageAdapter = {
  async createUploadIntent(input) {
    return { provider: 'PENDING_PROVIDER', storageKey: `business/${input.businessId}/${Date.now()}-${input.fileName}`, uploadUrl: null };
  },
  async finalizeUpload(input) { return { provider: input.provider, storageKey: input.storageKey, publicUrl: input.publicUrl || null }; },
  async deleteObject() { return undefined; },
};
