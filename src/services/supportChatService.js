import { apiClient } from '../lib/apiClient';

export const supportChatService = {
  async getMessages() {
    const res = await apiClient.get('/portal/customer/support-chat');
    return res.data;
  },

  async sendMessage(body) {
    const res = await apiClient.post('/portal/customer/support-chat', { body });
    return res.data;
  },

  async listThreads() {
    const res = await apiClient.get('/portal/communication/support-chats');
    return res.data;
  },

  async getThread(customerId) {
    const res = await apiClient.get(`/portal/communication/support-chats/${customerId}`);
    return res.data;
  },

  async reply(customerId, body) {
    const res = await apiClient.post(`/portal/communication/support-chats/${customerId}`, { body });
    return res.data;
  },
};
