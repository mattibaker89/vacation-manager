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

function writeStorage(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // ignore quota / private-mode failures; in-memory state remains valid
  }
}

function removeStorage(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

function readUser(): User | null {
  const raw = readStorage(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    removeStorage(USER_KEY);
    return null;
  }
}

const token = ref<string | null>(readStorage(TOKEN_KEY));
const currentUser = ref<User | null>(readUser());

export function useAuth() {
  const isAuthenticated = computed(() => !!token.value);
  const isValidator = computed(() => currentUser.value?.role === 'Validator');

  function setSession(newToken: string, user: User) {
    token.value = newToken;
    currentUser.value = user;
    writeStorage(TOKEN_KEY, newToken);
    writeStorage(USER_KEY, JSON.stringify(user));
  }

  function clearSession() {
    token.value = null;
    currentUser.value = null;
    removeStorage(TOKEN_KEY);
    removeStorage(USER_KEY);
  }

  function getToken() {
    return token.value;
  }

  return { token, currentUser, isAuthenticated, isValidator, setSession, clearSession, getToken };
}
