import { api } from '@/lib/apiClient';

export async function sendSupportMessage(input: { name: string; subject: string; message: string }): Promise<void> {
  await api.post('/api/support/contact', input);
}
