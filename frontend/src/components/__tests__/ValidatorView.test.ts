import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createRouter, createWebHashHistory } from 'vue-router';
import ValidatorView from '../../views/ValidatorView.vue';
import * as api from '../../api/requests';

vi.mock('../../api/requests');
// Chart.js requires a real canvas which jsdom doesn't provide — stub the whole stats component
vi.mock('../../components/ValidatorStats.vue', () => ({ default: { template: '<div />' } }));

const mockRequests = [
  {
    id: 1,
    startDate: '2026-07-01',
    endDate: '2026-07-05',
    reason: 'Holiday',
    status: 'Pending' as const,
    comments: null,
    createdAt: '2026-05-01T00:00:00Z',
    user: { id: 1, name: 'Alice', role: 'Requester' },
  },
  {
    id: 2,
    startDate: '2026-08-01',
    endDate: '2026-08-03',
    reason: null,
    status: 'Approved' as const,
    comments: null,
    createdAt: '2026-05-02T00:00:00Z',
    user: { id: 2, name: 'Bob', role: 'Requester' },
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes: [{ path: '/validator/requests', component: ValidatorView }],
});

function mountView() {
  return mount(ValidatorView, {
    global: { plugins: [router] },
  });
}

beforeEach(() => {
  vi.mocked(api.getAllRequests).mockResolvedValue({ data: mockRequests } as never);
});

describe('ValidatorView', () => {
  it('renders all requests in the table', async () => {
    const wrapper = mountView();
    await flushPromises();
    expect(wrapper.text()).toContain('Alice');
    expect(wrapper.text()).toContain('Bob');
  });

  it('shows Approve and Reject buttons only for Pending requests', async () => {
    const wrapper = mountView();
    await flushPromises();
    const approveButtons = wrapper.findAll('button.btn-action-approve');
    expect(approveButtons.length).toBe(1);
  });

  it('calls getAllRequests with status filter when filter button clicked', async () => {
    const wrapper = mountView();
    await flushPromises();
    const buttons = wrapper.findAll('.filter-group button');
    const pendingBtn = buttons.find((b) => b.text() === 'Pending');
    await pendingBtn!.trigger('click');
    await flushPromises();
    expect(api.getAllRequests).toHaveBeenCalledWith('Pending');
  });

  it('opens reject modal when Reject button clicked', async () => {
    const wrapper = mountView();
    await flushPromises();
    const rejectBtn = wrapper.find('button.btn-action-reject');
    await rejectBtn.trigger('click');
    expect(wrapper.find('.modal').exists()).toBe(true);
  });

  it('shows error in modal when rejecting without a comment', async () => {
    const wrapper = mountView();
    await flushPromises();
    await wrapper.find('button.btn-action-reject').trigger('click');
    await wrapper.find('.modal-footer button.btn-danger').trigger('click');
    await flushPromises();
    expect(wrapper.text()).toContain('comment is required');
  });

  it('calls updateRequest when approving', async () => {
    vi.mocked(api.updateRequest).mockResolvedValue({
      data: { ...mockRequests[0], status: 'Approved' },
    } as never);
    const wrapper = mountView();
    await flushPromises();
    await wrapper.find('button.btn-action-approve').trigger('click');
    await flushPromises();
    expect(api.updateRequest).toHaveBeenCalledWith(1, { status: 'Approved' });
  });
});
