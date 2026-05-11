<template>
  <div>
    <div class="page-heading">
      <h2><i class="fa-solid fa-users me-2"></i>Users</h2>
    </div>

    <div class="ibox">
      <div class="ibox-title">
        <h5><i class="fa-solid fa-address-book me-1"></i> All Users</h5>
      </div>
      <div class="ibox-content no-padding">
        <div v-if="loading" class="p-4 text-center text-muted">Loading…</div>
        <div v-else class="table-responsive">
          <table class="table table-hover mb-0">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in users" :key="user.id">
                <td class="text-muted" style="width: 48px">{{ user.id }}</td>
                <td class="fw-semibold">{{ user.name }}</td>
                <td>
                  <span
                    class="label"
                    :class="user.role === 'Validator' ? 'label-primary' : 'label-default'"
                  >
                    {{ user.role }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-if="!loading" class="table-footer">
          <strong>{{ users.length }}</strong> {{ users.length === 1 ? 'user' : 'users' }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getUsers, type User } from '../api/requests';

const users = ref<User[]>([]);
const loading = ref(false);

onMounted(async () => {
  loading.value = true;
  const { data } = await getUsers();
  users.value = data;
  loading.value = false;
});
</script>
