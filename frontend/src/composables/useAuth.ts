import { ref, computed } from 'vue';
import type { User } from '../types';

const TOKEN_KEY = 'vm_token';
const USER_KEY = 'vm_user';

function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

const token = ref<string | null>(readStorage(TOKEN_KEY));
const currentUser = ref<User | null>(JSON.parse(readStorage(USER_KEY) || 'null'));

export function useAuth() {
  const isAuthenticated = computed(() => !!token.value);
  const isValidator = computed(() => currentUser.value?.role === 'Validator');

  function setSession(newToken: string, user: User) {
    token.value = newToken;
    currentUser.value = user;
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  function clearSession() {
    token.value = null;
    currentUser.value = null;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  function getToken() {
    return token.value;
  }

  return { token, currentUser, isAuthenticated, isValidator, setSession, clearSession, getToken };
}
