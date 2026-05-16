<template>
  <div>
    <div class="page-heading">
      <h2><i class="fa-solid fa-users me-2"></i>Users</h2>
    </div>

    <div class="ibox">
      <div class="ibox-title d-flex align-items-center justify-content-between">
        <h5><i class="fa-solid fa-address-book me-1"></i> All Users</h5>
        <button class="btn btn-primary btn-sm px-3" @click="openModal">
          <i class="fa-solid fa-plus me-1"></i> Add User
        </button>
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

    <!-- Add User modal -->
    <div
      v-if="modal.open"
      class="modal d-block"
      tabindex="-1"
      style="background: rgba(0, 0, 0, 0.45)"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content" style="border-radius: 2px">
          <div class="modal-header" style="border-bottom: 1px solid #e7eaec">
            <h5 class="modal-title" style="font-size: 14px; font-weight: 700">
              <i class="fa-solid fa-user-plus me-2 text-primary"></i>Add User
            </h5>
            <button class="btn-close" @click="closeModal" />
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">Name <span class="text-danger">*</span></label>
              <input
                v-model="modal.name"
                type="text"
                class="form-control"
                placeholder="e.g. Jane Doe"
              />
            </div>
            <div class="mb-3">
              <label class="form-label">Role <span class="text-danger">*</span></label>
              <select v-model="modal.role" class="form-select">
                <option value="Requester">Requester</option>
                <option value="Validator">Validator</option>
              </select>
            </div>
            <div>
              <label class="form-label">Password <span class="text-danger">*</span></label>
              <input
                v-model="modal.password"
                type="password"
                class="form-control"
                placeholder="At least 6 characters"
              />
            </div>
            <div v-if="modal.error" class="alert alert-danger mt-3 mb-0 py-2">
              {{ modal.error }}
            </div>
          </div>
          <div class="modal-footer" style="border-top: 1px solid #e7eaec">
            <button class="btn btn-sm btn-secondary" @click="closeModal">Cancel</button>
            <button class="btn btn-sm btn-primary" :disabled="modal.submitting" @click="submit">
              {{ modal.submitting ? 'Adding…' : 'Add User' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getUsers, createUser, type User } from '../api/requests';

const users = ref<User[]>([]);
const loading = ref(false);

const modal = ref({
  open: false,
  name: '',
  role: 'Requester' as 'Requester' | 'Validator',
  password: '',
  error: '',
  submitting: false,
});

onMounted(async () => {
  loading.value = true;
  const { data } = await getUsers();
  users.value = data;
  loading.value = false;
});

function openModal() {
  modal.value = { open: true, name: '', role: 'Requester', password: '', error: '', submitting: false };
}

function closeModal() {
  modal.value.open = false;
}

async function submit() {
  if (!modal.value.name.trim()) {
    modal.value.error = 'Name is required.';
    return;
  }
  if (!modal.value.password || modal.value.password.length < 6) {
    modal.value.error = 'Password must be at least 6 characters.';
    return;
  }
  modal.value.submitting = true;
  modal.value.error = '';
  try {
    const { data } = await createUser({
      name: modal.value.name.trim(),
      role: modal.value.role,
      password: modal.value.password,
    });
    users.value.push(data);
    closeModal();
  } catch (e: unknown) {
    const err = e as { response?: { data?: { error?: string } } };
    modal.value.error = err.response?.data?.error || 'Failed to add user.';
  } finally {
    modal.value.submitting = false;
  }
}
</script>
