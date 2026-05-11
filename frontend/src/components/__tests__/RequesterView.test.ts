import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createRouter, createWebHashHistory } from 'vue-router';
import RequesterView from '../../views/RequesterView.vue';
import * as api from '../../api/requests';

vi.mock('../../api/requests');

const mockUsers = [
  { id: 1, name: 'Alice', role: 'Requester' as const },
  { id: 2, name: 'Carol', role: 'Validator' as const },
];

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
];

const router = createRouter({
  history: createWebHashHistory(),
  routes: [{ path: '/', component: RequesterView }],
});

function mountView() {
  return mount(RequesterView, {
    global: { plugins: [router] },
  });
}

beforeEach(() => {
  vi.mocked(api.getUsers).mockResolvedValue({ data: mockUsers } as never);
  vi.mocked(api.getMyRequests).mockResolvedValue({ data: mockRequests } as never);
});

describe('RequesterView', () => {
  it('renders the submit form', async () => {
    const wrapper = mountView();
    await flushPromises();
    expect(wrapper.find('form').exists()).toBe(true);
    expect(wrapper.find('input[type="date"]').exists()).toBe(true);
  });

  it('displays only Requester users in the dropdown', async () => {
    const wrapper = mountView();
    await flushPromises();
    const options = wrapper.findAll('select option');
    expect(options.length).toBe(1);
    expect(options[0].text()).toBe('Alice');
  });

  it('shows existing requests in the table', async () => {
    const wrapper = mountView();
    await flushPromises();
    expect(wrapper.find('table').exists()).toBe(true);
    expect(wrapper.text()).toContain('Holiday');
    expect(wrapper.text()).toContain('Pending');
  });

  it('shows validation error when endDate is before startDate', async () => {
    const wrapper = mountView();
    await flushPromises();
    await wrapper.find('input[type="date"]').setValue('2026-07-10');
    await wrapper.findAll('input[type="date"]')[1].setValue('2026-07-01');
    await wrapper.find('form').trigger('submit');
    await flushPromises();
    expect(wrapper.text()).toContain('End date must be on or after start date');
  });

  it('calls submitRequest API on valid form submission', async () => {
    vi.mocked(api.submitRequest).mockResolvedValue({ data: mockRequests[0] } as never);
    const wrapper = mountView();
    await flushPromises();
    await wrapper.findAll('input[type="date"]')[0].setValue('2026-07-01');
    await wrapper.findAll('input[type="date"]')[1].setValue('2026-07-10');
    await wrapper.find('form').trigger('submit');
    await flushPromises();
    expect(api.submitRequest).toHaveBeenCalledWith(
      expect.objectContaining({ startDate: '2026-07-01', endDate: '2026-07-10' }),
    );
  });
});
