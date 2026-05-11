<template>
  <div>
    <h2 class="mb-4">Validator Dashboard</h2>

    <!-- Filter Bar -->
    <div class="card shadow-sm mb-4">
      <div class="card-body d-flex align-items-center gap-3">
        <span class="fw-semibold">Filter by status:</span>
        <div class="btn-group">
          <button
            v-for="s in statusOptions"
            :key="s"
            class="btn btn-sm"
            :class="activeFilter === s ? 'btn-dark' : 'btn-outline-secondary'"
            @click="setFilter(s)"
          >{{ s }}</button>
        </div>
        <span class="ms-auto text-muted small">{{ requests.length }} result(s)</span>
      </div>
    </div>

    <!-- Requests Table -->
    <div class="card shadow-sm">
      <div class="card-body p-0">
        <div v-if="loading" class="p-4 text-center text-muted">Loading…</div>
        <div v-else-if="requests.length === 0" class="p-4 text-center text-muted">No requests found.</div>
        <table v-else class="table table-hover mb-0 align-middle">
          <thead class="table-light">
            <tr>
              <th>Employee</th>
              <th>Start</th>
              <th>End</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Submitted</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="req in requests" :key="req.id">
              <td class="fw-semibold">{{ req.user.name }}</td>
              <td>{{ formatDate(req.startDate) }}</td>
              <td>{{ formatDate(req.endDate) }}</td>
              <td>{{ req.reason || '—' }}</td>
              <td>
                <span :class="statusBadge(req.status)" class="badge">{{ req.status }}</span>
              </td>
              <td>{{ formatDate(req.createdAt) }}</td>
              <td>
                <div v-if="req.status === 'Pending'" class="d-flex gap-2 align-items-center">
                  <button class="btn btn-sm btn-success" @click="approve(req.id)">Approve</button>
                  <button class="btn btn-sm btn-danger" @click="openReject(req.id)">Reject</button>
                </div>
                <span v-else class="text-muted small">{{ req.comments || '—' }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Reject Modal -->
    <div v-if="rejectModal.open" class="modal d-block" tabindex="-1" style="background:rgba(0,0,0,.4)">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Reject Request</h5>
            <button class="btn-close" @click="closeReject" />
          </div>
          <div class="modal-body">
            <label class="form-label fw-semibold">Comment <span class="text-danger">*</span></label>
            <textarea
              class="form-control"
              rows="3"
              v-model="rejectModal.comment"
              placeholder="Provide a reason for rejection…"
            />
            <div v-if="rejectModal.error" class="alert alert-danger mt-2 py-2 mb-0">{{ rejectModal.error }}</div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="closeReject">Cancel</button>
            <button class="btn btn-danger" @click="confirmReject" :disabled="rejectModal.submitting">
              {{ rejectModal.submitting ? 'Rejecting…' : 'Confirm Reject' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getAllRequests, updateRequest, type VacationRequest } from '../api/requests';

const statusOptions = ['All', 'Pending', 'Approved', 'Rejected'] as const;
type Filter = (typeof statusOptions)[number];

const activeFilter = ref<Filter>('All');
const requests = ref<VacationRequest[]>([]);
const loading = ref(false);

const rejectModal = ref({ open: false, requestId: null as number | null, comment: '', error: '', submitting: false });

onMounted(() => loadRequests());

async function loadRequests() {
  loading.value = true;
  const status = activeFilter.value === 'All' ? undefined : activeFilter.value;
  const { data } = await getAllRequests(status);
  requests.value = data;
  loading.value = false;
}

function setFilter(s: Filter) {
  activeFilter.value = s;
  loadRequests();
}

async function approve(id: number) {
  await updateRequest(id, { status: 'Approved' });
  await loadRequests();
}

function openReject(id: number) {
  rejectModal.value = { open: true, requestId: id, comment: '', error: '', submitting: false };
}

function closeReject() {
  rejectModal.value.open = false;
}

async function confirmReject() {
  if (!rejectModal.value.comment.trim()) {
    rejectModal.value.error = 'A comment is required to reject a request.';
    return;
  }
  rejectModal.value.submitting = true;
  try {
    await updateRequest(rejectModal.value.requestId!, {
      status: 'Rejected',
      comments: rejectModal.value.comment,
    });
    closeReject();
    await loadRequests();
  } catch (e: unknown) {
    const err = e as { response?: { data?: { error?: string } } };
    rejectModal.value.error = err.response?.data?.error || 'Failed to reject request.';
  } finally {
    rejectModal.value.submitting = false;
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
