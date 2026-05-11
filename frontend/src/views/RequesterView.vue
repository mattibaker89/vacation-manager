<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="mb-0">My Vacation Requests</h2>
      <div class="d-flex align-items-center gap-2">
        <label class="form-label mb-0 fw-semibold">I am:</label>
        <select class="form-select form-select-sm w-auto" v-model="selectedUserId" @change="loadRequests">
          <option v-for="u in requesters" :key="u.id" :value="u.id">{{ u.name }}</option>
        </select>
      </div>
    </div>

    <!-- Request Form -->
    <div class="card shadow-sm mb-4">
      <div class="card-header bg-primary text-white fw-semibold">Submit a New Request</div>
      <div class="card-body">
        <form @submit.prevent="submitRequest">
          <div class="row g-3">
            <div class="col-md-4">
              <label class="form-label">Start Date <span class="text-danger">*</span></label>
              <input type="date" class="form-control" v-model="form.startDate" required />
            </div>
            <div class="col-md-4">
              <label class="form-label">End Date <span class="text-danger">*</span></label>
              <input type="date" class="form-control" v-model="form.endDate" required />
            </div>
            <div class="col-md-4">
              <label class="form-label">Reason (optional)</label>
              <input type="text" class="form-control" v-model="form.reason" placeholder="e.g. Family trip" />
            </div>
          </div>
          <div v-if="formError" class="alert alert-danger mt-3 mb-0 py-2">{{ formError }}</div>
          <div class="mt-3">
            <button type="submit" class="btn btn-primary" :disabled="submitting">
              {{ submitting ? 'Submitting…' : 'Submit Request' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Requests List -->
    <div class="card shadow-sm">
      <div class="card-header fw-semibold">My Requests</div>
      <div class="card-body p-0">
        <div v-if="loading" class="p-4 text-center text-muted">Loading…</div>
        <div v-else-if="requests.length === 0" class="p-4 text-center text-muted">No requests yet.</div>
        <table v-else class="table table-hover mb-0">
          <thead class="table-light">
            <tr>
              <th>Start</th>
              <th>End</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Comments</th>
              <th>Submitted</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="req in requests" :key="req.id">
              <td>{{ formatDate(req.startDate) }}</td>
              <td>{{ formatDate(req.endDate) }}</td>
              <td>{{ req.reason || '—' }}</td>
              <td>
                <span :class="statusBadge(req.status)" class="badge">{{ req.status }}</span>
              </td>
              <td>{{ req.comments || '—' }}</td>
              <td>{{ formatDate(req.createdAt) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getUsers, getMyRequests, submitRequest as apiSubmit, type VacationRequest, type User } from '../api/requests';

const requesters = ref<User[]>([]);
const selectedUserId = ref<number | null>(null);
const requests = ref<VacationRequest[]>([]);
const loading = ref(false);
const submitting = ref(false);
const formError = ref('');

const form = ref({ startDate: '', endDate: '', reason: '' });

onMounted(async () => {
  const { data } = await getUsers();
  requesters.value = data.filter((u) => u.role === 'Requester');
  if (requesters.value.length) {
    selectedUserId.value = requesters.value[0].id;
    await loadRequests();
  }
});

async function loadRequests() {
  if (!selectedUserId.value) return;
  loading.value = true;
  const { data } = await getMyRequests(selectedUserId.value);
  requests.value = data;
  loading.value = false;
}

async function submitRequest() {
  formError.value = '';
  if (!form.value.startDate || !form.value.endDate) {
    formError.value = 'Start date and end date are required.';
    return;
  }
  if (new Date(form.value.endDate) < new Date(form.value.startDate)) {
    formError.value = 'End date must be on or after start date.';
    return;
  }
  submitting.value = true;
  try {
    await apiSubmit({
      userId: selectedUserId.value!,
      startDate: form.value.startDate,
      endDate: form.value.endDate,
      reason: form.value.reason || undefined,
    });
    form.value = { startDate: '', endDate: '', reason: '' };
    await loadRequests();
  } catch (e: unknown) {
    const err = e as { response?: { data?: { error?: string } } };
    formError.value = err.response?.data?.error || 'Failed to submit request.';
  } finally {
    submitting.value = false;
  }
}

function statusBadge(status: string) {
  return {
    'bg-warning text-dark': status === 'Pending',
    'bg-success': status === 'Approved',
    'bg-danger': status === 'Rejected',
  };
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString();
}
</script>
