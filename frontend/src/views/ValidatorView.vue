<template>
  <div>
    <!-- Page heading -->
    <div class="page-heading">
      <h2><i class="fa-solid fa-list-check me-2"></i>Validator Dashboard</h2>
    </div>

    <!-- Filter + table -->
    <div class="ibox">
      <div class="ibox-title">
        <h5><i class="fa-solid fa-table-list me-1"></i> All Requests</h5>
        <div class="d-flex align-items-center gap-2 filter-group">
          <button
            v-for="s in statusOptions"
            :key="s"
            class="btn btn-sm"
            :class="activeFilter === s ? 'btn-teal' : 'btn-outline-teal'"
            @click="setFilter(s)"
          >{{ s }}</button>
          <span class="text-muted ms-2" style="font-size:11px;">{{ requests.length }} result(s)</span>
        </div>
      </div>
      <div class="ibox-content no-padding">
        <div v-if="loading" class="p-4 text-center text-muted">Loading…</div>
        <div v-else-if="requests.length === 0" class="p-4 text-center text-muted">No requests found.</div>
        <table v-else class="table table-hover mb-0">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Start</th>
              <th>End</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Submitted</th>
              <th>Actions / Comments</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="req in requests" :key="req.id">
              <td class="fw-semibold">{{ req.user.name }}</td>
              <td>{{ formatDate(req.startDate) }}</td>
              <td>{{ formatDate(req.endDate) }}</td>
              <td>{{ req.reason || '—' }}</td>
              <td>
                <span :class="statusLabel(req.status)" class="label">{{ req.status }}</span>
              </td>
              <td>{{ formatDate(req.createdAt) }}</td>
              <td>
                <div v-if="req.status === 'Pending'" class="d-flex gap-2">
                  <button class="btn btn-xs btn-success" @click="approve(req.id)">
                    <i class="fa-solid fa-check me-1"></i>Approve
                  </button>
                  <button class="btn btn-xs btn-danger" @click="openReject(req.id)">
                    <i class="fa-solid fa-xmark me-1"></i>Reject
                  </button>
                </div>
                <span v-else class="text-muted" style="font-size:12px;">{{ req.comments || '—' }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Reject modal -->
    <div v-if="rejectModal.open" class="modal d-block" tabindex="-1" style="background:rgba(0,0,0,.45)">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content" style="border-radius:2px;">
          <div class="modal-header" style="border-bottom:1px solid #e7eaec;">
            <h5 class="modal-title" style="font-size:14px;font-weight:700;">
              <i class="fa-solid fa-xmark me-2 text-danger"></i>Reject Request
            </h5>
            <button class="btn-close" @click="closeReject" />
          </div>
          <div class="modal-body">
            <label class="form-label">Comment <span class="text-danger">*</span></label>
            <textarea
              class="form-control"
              rows="3"
              v-model="rejectModal.comment"
              placeholder="Provide a reason for rejection…"
            />
            <div v-if="rejectModal.error" class="alert alert-danger mt-2 py-2 mb-0">{{ rejectModal.error }}</div>
          </div>
          <div class="modal-footer" style="border-top:1px solid #e7eaec;">
            <button class="btn btn-sm btn-secondary" @click="closeReject">Cancel</button>
            <button class="btn btn-sm btn-danger" @click="confirmReject" :disabled="rejectModal.submitting">
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
