import { http, HttpResponse } from 'msw';
import type { User } from '../lib/types';

export const restHandlers = [
  http.get('/api/v1/user', () => {
    return HttpResponse.json<User>({
      username: 'testuser',
      accounts: [],
      numOfAccounts: 0,
    });
  }),

  http.post('/api/v1/user/register', async ({ request }) => {
    const body = await request.json() as { username: string, password: string };
    expect(body.username).toBe('testuser');
    
  }),

  http.post('/api/v1/user/login', async ({ request }) => {
    const body = await request.json() as { username: string, password: string };
    expect(body.username).toBe('testuser');
    expect(body.password).toBe('testpassword');
  }),

  http.put('/api/v1/user/change-password', async ({ request }) => {
    const body = await request.json() as { currentPassword: string, newPassword: string };
    expect(body.currentPassword).toBe('oldpassword');
    expect(body.newPassword).toBe('newpassword');
    return HttpResponse.json({ message: 'Success' });
  }),

  http.put('/api/v1/user/change-username', async ({ request }) => {
    const body = await request.json() as { currentPassword: string, newUsername: string };
    expect(body.currentPassword).toBe('testpassword');
    expect(body.newUsername).toBe('newusername');
    return HttpResponse.json({ message: 'Success' });
  })
]