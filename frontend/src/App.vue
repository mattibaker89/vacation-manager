<template>
  <div v-if="isLoginPage" id="login-layout">
    <RouterView />
  </div>

  <div v-else id="wrapper">
    <nav class="navbar-static-side">
      <span class="sidebar-brand">
        <i class="fa-solid fa-umbrella-beach"></i> Vacation Manager
      </span>
      <ul class="sidebar-nav">
        <li>
          <RouterLink to="/requester">
            <i class="fa-solid fa-paper-plane"></i> My Requests
          </RouterLink>
        </li>
        <template v-if="isValidator">
          <li>
            <RouterLink to="/validator">
              <i class="fa-solid fa-chart-line"></i> Dashboard
            </RouterLink>
          </li>
          <li>
            <RouterLink to="/validator/requests">
              <i class="fa-solid fa-list-check"></i> All Requests
            </RouterLink>
          </li>
          <li>
            <RouterLink to="/users">
              <i class="fa-solid fa-users"></i> Users
            </RouterLink>
          </li>
        </template>
      </ul>

      <div class="sidebar-footer">
        <div class="sidebar-user">
          <i class="fa-solid fa-circle-user me-1"></i>
          <span>{{ currentUser?.name }}</span>
          <span class="sidebar-role ms-1">({{ currentUser?.role }})</span>
        </div>
        <button class="btn btn-sidebar-logout" @click="logout">
          <i class="fa-solid fa-right-from-bracket me-1"></i> Logout
        </button>
      </div>
    </nav>

    <div id="page-wrapper">
      <div class="top-navigation">
        <span class="app-title">Vacation Management System</span>
      </div>
      <div class="wrapper-content">
        <RouterView />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuth } from './composables/useAuth';

const route = useRoute();
const router = useRouter();
const { currentUser, isValidator, clearSession } = useAuth();

const isLoginPage = computed(() => route.path === '/login');

function logout() {
  clearSession();
  router.push('/login');
}
</script>

<style scoped>
.sidebar-footer {
  padding: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin-top: auto;
}

.sidebar-user {
  font-size: 0.85rem;
  color: #a7b1c2;
  margin-bottom: 0.5rem;
}

.sidebar-role {
  font-size: 0.75rem;
  opacity: 0.75;
}

.btn-sidebar-logout {
  width: 100%;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #a7b1c2;
  font-size: 0.85rem;
  padding: 0.4rem 0.75rem;
  border-radius: 4px;
  text-align: left;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-sidebar-logout:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}
</style>
