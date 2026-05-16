<template>
  <div>
    <!-- Page heading -->
    <div class="page-heading">
      <h2><i class="fa-solid fa-paper-plane me-2"></i>My Vacation Requests</h2>
    </div>

    <!-- Submit form -->
    <div class="ibox">
      <div class="ibox-title">
        <h5><i class="fa-solid fa-plus me-1"></i> Submit a New Request</h5>
      </div>
      <div class="ibox-content">
        <form @submit.prevent="submitRequest">
          <div class="row g-3">
            <div class="col-md-4">
              <label class="form-label">Start Date <span class="text-danger">*</span></label>
              <input
                v-model="form.startDate"
                type="date"
                class="form-control"
                :min="today"
                required
                @change="onStartDateChange"
              />
            </div>
            <div v-if="!singleDay" class="col-md-4">
              <label class="form-label">End Date <span class="text-danger">*</span></label>
              <input
                v-model="form.endDate"
                type="date"
                class="form-control"
                :min="minEndDate"
                required
              />
            </div>
            <div :class="singleDay ? 'col-md-8' : 'col-md-4'">
              <label class="form-label">Reason (optional)</label>
              <input
                v-model="form.reason"
                type="text"
                class="form-control"
                placeholder="e.g. Family trip"
              />
            </div>
          </div>
          <div class="form-check mt-3">
            <input
              id="singleDay"
              v-model="singleDay"
              type="checkbox"
              class="form-check-input"
            />
            <label class="form-check-label" for="singleDay">Single day vacation</label>
          </div>
          <div v-if="formError" class="alert alert-danger mt-3 mb-0 py-2">{{ formError }}</div>
          <div class="mt-3">
            <button type="submit" class="btn btn-primary btn-sm px-4" :disabled="submitting">
              <i class="fa-solid fa-paper-plane me-1"></i>
              {{ submitting ? 'Submitting…' : 'Submit Request' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Requests list -->
    <div class="ibox">
      <div class="ibox-title">
        <h5><i class="fa-solid fa-clock-rotate-left me-1"></i> My Requests</h5>
      </div>
      <div class="ibox-content no-padding">
        <div v-if="loading" class="p-4 text-center text-muted">Loading…</div>
        <div v-else-if="requests.length === 0" class="p-4 text-center text-muted">
          No requests yet.
        </div>
        <div v-else class="table-responsive">
          <table class="table table-hover mb-0">
            <thead>
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
                <td data-label="Start">{{ formatDate(req.startDate) }}</td>
                <td data-label="End">{{ formatDate(req.endDate) }}</td>
                <td data-label="Reason">{{ req.reason || '—' }}</td>
                <td data-label="Status">
                  <span :class="statusLabel(req.status)" class="label">{{ req.status }}</span>
                </td>
                <td data-label="Comments">{{ req.comments || '—' }}</td>
                <td data-label="Submitted">{{ formatDate(req.createdAt) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { getMyRequests, submitRequest as apiSubmit, type VacationRequest } from '../api/requests';

const requests = ref<VacationRequest[]>([]);
const loading = ref(false);
const submitting = ref(false);
const formError = ref('');

const form = ref({ startDate: '', endDate: '', reason: '' });
const singleDay = ref(false);

const today = computed(() => new Date().toISOString().split('T')[0]);
const minEndDate = computed(() => form.value.startDate || today.value);

function onStartDateChange() {
  if (form.value.endDate && form.value.endDate < form.value.startDate) {
    form.value.endDate = '';
  }
}

onMounted(loadRequests);

async function loadRequests() {
  loading.value = true;
  const { data } = await getMyRequests();
  requests.value = data;
  loading.value = false;
}

async function submitRequest() {
  formError.value = '';
  if (!form.value.startDate || (!singleDay.value && !form.value.endDate)) {
    formError.value = 'Start date and end date are required.';
    return;
  }
  if (!singleDay.value && new Date(form.value.endDate) < new Date(form.value.startDate)) {
    formError.value = 'End date must be on or after start date.';
    return;
  }
  submitting.value = true;
  try {
    await apiSubmit({
      startDate: form.value.startDate,
      endDate: singleDay.value ? form.value.startDate : form.value.endDate,
      reason: form.value.reason || undefined,
    });
    form.value = { startDate: '', endDate: '', reason: '' };
    singleDay.value = false;
    await loadRequests();
  } catch (e: unknown) {
    const err = e as { response?: { data?: { error?: string } } };
    formError.value = err.response?.data?.error || 'Failed to submit request.';
  } finally {
    submitting.value = false;
  }
}

function statusLabel(status: string) {
  return {
    'label-warning': status === 'Pending',
    'label-success': status === 'Approved',
    'label-danger': status === 'Rejected',
  };
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString();
}
</script>
