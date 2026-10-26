import { User, AuthSession, UserRole } from '../types';
import { storageService } from './storage.service';

/**
 * AEGIS Authentication Service (Frontend Demo Architecture)
 * 
 * IMPORTANT: This is a simulated client-side authentication provider designed for
 * demonstration and evaluation purposes. In a production environment, authentication
 * tokens, passwords, and authorization boundaries must be validated and signed by a
 * secure backend API server.
 */

class AuthService {
  private currentSession: AuthSession | null = null;
  private listeners: ((user: User | null) => void)[] = [];

  constructor() {
    this.currentSession = storageService.getSession();
  }

  public subscribe(callback: (user: User | null) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  private notify(): void {
    const user = this.getCurrentUser();
    this.listeners.forEach((cb) => cb(user));
  }

  public getCurrentUser(): User | null {
    if (!this.currentSession) {
      this.currentSession = storageService.getSession();
    }
    return this.currentSession?.user || null;
  }

  public isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  public hasRole(role: UserRole): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  public isAdmin(): boolean {
    return this.hasRole('admin');
  }

  public isLearner(): boolean {
    return this.hasRole('learner');
  }

  public async login(email: string, password: string): Promise<{ success: boolean; message?: string; user?: User }> {
    // Artificial slight delay for realistic UI loading feedback
    await new Promise((res) => setTimeout(res, 250));

    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    // Validate demo credentials
    if (cleanEmail === 'learner@demo.test') {
      if (cleanPass !== 'Learner123!') {
        return { success: false, message: 'Invalid password. Expected: Learner123!' };
      }
      return this.setSessionByUserId('user-demo-learner');
    }

    if (cleanEmail === 'admin@demo.test') {
      if (cleanPass !== 'Admin123!') {
        return { success: false, message: 'Invalid password. Expected: Admin123!' };
      }
      return this.setSessionByUserId('user-demo-admin');
    }

    // Check if user exists in registered mock roster
    const allUsers = storageService.getUsers();
    const found = allUsers.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!found) {
      return {
        success: false,
        message: 'No account found with this email. Try learner@demo.test or admin@demo.test',
      };
    }

    return this.setSessionByUserId(found.id);
  }

  public async demoLogin(role: UserRole): Promise<{ success: boolean; user?: User }> {
    const targetId = role === 'admin' ? 'user-demo-admin' : 'user-demo-learner';
    return this.setSessionByUserId(targetId);
  }

  private setSessionByUserId(userId: string): { success: boolean; user: User } {
    const allUsers = storageService.getUsers();
    const user = allUsers.find((u) => u.id === userId) || allUsers[0];

    const session: AuthSession = {
      user,
      token: `simulated_jwt_${user.id}_${Date.now()}`,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    };

    this.currentSession = session;
    storageService.saveSession(session);
    this.notify();
    return { success: true, user };
  }

  public logout(): void {
    this.currentSession = null;
    storageService.saveSession(null);
    this.notify();
  }
}

export const authService = new AuthService();
