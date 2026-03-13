const API = {

  // Gibt userID aus Cookie zurück (oder null)
  getCurrentUser() {
    const match = document.cookie.match(/(?:^|;\s*)userID=([^;]+)/);
    return match ? match[1] : null;
  },

  // Gibt username aus Cookie zurück (oder null)
  getCurrentUsername() {
    const match = document.cookie.match(/(?:^|;\s*)username=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : null;
  },

  // Login
  async login(username, password) {
    const res = await fetch('/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`
    });
    return res.json();
  },

  // Logout — löscht Cookies und leitet zur Login-Seite
  logout() {
    document.cookie = 'userID=; Max-Age=0; path=/';
    document.cookie = 'username=; Max-Age=0; path=/';
    window.location.href = '/login.html';
  },

  // Projekte des eingeloggten Users laden
  async getProjects() {
    const userID = this.getCurrentUser();
    if (!userID) return [];
    const res = await fetch(`/projects?userID=${userID}`);
    return res.json();
  },

  // Neues Projekt erstellen
  async createProject(name, type) {
    const userID = this.getCurrentUser();
    if (!userID) return { error: 'Not logged in' };
    const res = await fetch('/createProject', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `userID=${encodeURIComponent(userID)}&name=${encodeURIComponent(name)}&type=${encodeURIComponent(type)}`
    });
    return res.json();
  },

  // Graph in DB speichern — projectID als Query-Param, JSON direkt als Body
  async saveProject(projectID, graphJson) {
    const body = typeof graphJson === 'string' ? graphJson : JSON.stringify(graphJson);
    const res = await fetch(`/saveProject?projectID=${projectID}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body
    });
    return res.json();
  },

  // Graph aus DB laden — gibt geparsten Graph zurück (oder null)
  async loadProject(projectID) {
    const res = await fetch(`/loadProject?projectID=${projectID}`);
    const text = await res.text();
    if (!text || text === '{}') return null;
    try {
      return JSON.parse(text);
    } catch(e) {
      console.warn('loadProject: could not parse response', e);
      return null;
    }
  },

  // Projekt löschen
  async deleteProject(projectID) {
    await fetch('/deleteProject', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `projectID=${encodeURIComponent(projectID)}`
    });
  }

};