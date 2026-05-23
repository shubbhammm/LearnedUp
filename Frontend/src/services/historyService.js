class HistoryService {
  constructor() {
    this.baseURL = 'http://localhost:4500/api/history';
  }

  async getHistory() {
    try {
      const response = await fetch(this.baseURL, {
        method: 'GET',
        credentials: 'include' // needed so the JWT cookie goes along
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('getHistory error:', error);
      throw error;
    }
  }

  async saveSession(sessionData) {
    try {
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(sessionData)
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('saveSession error:', error);
      throw error;
    }
  }
}

export default new HistoryService();
