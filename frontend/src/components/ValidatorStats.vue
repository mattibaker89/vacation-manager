<template>
  <!-- Stat cards -->
  <div class="row g-3 mb-1">
    <div v-for="card in statCards" :key="card.label" class="col-6 col-lg-3">
      <div class="ibox mb-0">
        <div class="ibox-content d-flex align-items-center gap-3">
          <i :class="card.icon" style="font-size: 2rem" :style="{ color: card.color }"></i>
          <div>
            <div class="fw-bold" style="font-size: 1.8rem; line-height: 1; color: #333">
              {{ card.value }}
            </div>
            <div style="font-size: 0.75rem; color: #999; margin-top: 3px">{{ card.label }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Charts row 1: bar + doughnut -->
  <div class="row g-3">
    <div class="col-md-8">
      <div class="ibox">
        <div class="ibox-title">
          <h5><i class="fa-solid fa-chart-column me-1"></i> Requests Submitted by Month</h5>
        </div>
        <div class="ibox-content">
          <div style="position: relative; height: 220px">
            <Bar :data="requestsByMonthData" :options="barOptions" />
          </div>
        </div>
      </div>
    </div>
    <div class="col-md-4">
      <div class="ibox">
        <div class="ibox-title">
          <h5><i class="fa-solid fa-chart-pie me-1"></i> Status Breakdown</h5>
        </div>
        <div class="ibox-content d-flex justify-content-center align-items-center">
          <div style="position: relative; height: 220px; width: 220px">
            <Doughnut :data="statusData" :options="doughnutOptions" />
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Charts row 2: line -->
  <div class="row g-3">
    <div class="col-12">
      <div class="ibox">
        <div class="ibox-title">
          <h5><i class="fa-solid fa-chart-line me-1"></i> Approved Vacations by Month</h5>
        </div>
        <div class="ibox-content">
          <div style="position: relative; height: 180px">
            <Line :data="approvedByMonthData" :options="lineOptions" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Bar, Doughnut, Line } from 'vue-chartjs';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { getAllRequests, type VacationRequest } from '../api/requests';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

const requests = ref<VacationRequest[]>([]);

onMounted(async () => {
  const { data } = await getAllRequests();
  requests.value = data;
});

// Returns labels for the last 6 calendar months, oldest first
function last6Months(): string[] {
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - (5 - i));
    return d.toLocaleString('default', { month: 'short', year: '2-digit' });
  });
}

function toMonthKey(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleString('default', { month: 'short', year: '2-digit' });
}

// ── Stat cards ──────────────────────────────────────────────────
const statCards = computed(() => {
  const all = requests.value;
  return [
    {
      label: 'Total Requests',
      value: all.length,
      icon: 'fa-solid fa-inbox',
      color: '#1ab394',
    },
    {
      label: 'Pending',
      value: all.filter((r) => r.status === 'Pending').length,
      icon: 'fa-solid fa-clock',
      color: '#f8ac59',
    },
    {
      label: 'Approved',
      value: all.filter((r) => r.status === 'Approved').length,
      icon: 'fa-solid fa-circle-check',
      color: '#1c84c6',
    },
    {
      label: 'Rejected',
      value: all.filter((r) => r.status === 'Rejected').length,
      icon: 'fa-solid fa-circle-xmark',
      color: '#ed5565',
    },
  ];
});

// ── Requests submitted per month (bar) ──────────────────────────
const requestsByMonthData = computed(() => {
  const months = last6Months();
  const counts = Object.fromEntries(months.map((m) => [m, 0]));
  requests.value.forEach((r) => {
    const k = toMonthKey(r.createdAt);
    if (k in counts) counts[k]++;
  });
  return {
    labels: months,
    datasets: [
      {
        label: 'Requests',
        data: months.map((m) => counts[m]),
        backgroundColor: '#1ab394',
        borderRadius: 4,
      },
    ],
  };
});

// ── Status distribution (doughnut) ─────────────────────────────
const statusData = computed(() => {
  const all = requests.value;
  return {
    labels: ['Pending', 'Approved', 'Rejected'],
    datasets: [
      {
        data: [
          all.filter((r) => r.status === 'Pending').length,
          all.filter((r) => r.status === 'Approved').length,
          all.filter((r) => r.status === 'Rejected').length,
        ],
        backgroundColor: ['#f8ac59', '#1c84c6', '#ed5565'],
        borderWidth: 0,
        hoverOffset: 6,
      },
    ],
  };
});

// ── Approved vacations starting per month (line) ────────────────
const approvedByMonthData = computed(() => {
  const months = last6Months();
  const counts = Object.fromEntries(months.map((m) => [m, 0]));
  requests.value
    .filter((r) => r.status === 'Approved')
    .forEach((r) => {
      const k = toMonthKey(r.startDate);
      if (k in counts) counts[k]++;
    });
  return {
    labels: months,
    datasets: [
      {
        label: 'Approved vacations',
        data: months.map((m) => counts[m]),
        borderColor: '#1c84c6',
        backgroundColor: 'rgba(28, 132, 198, 0.08)',
        tension: 0.35,
        fill: true,
        pointRadius: 4,
        pointBackgroundColor: '#1c84c6',
      },
    ],
  };
});

// ── Shared chart options ─────────────────────────────────────────
const baseScales = {
  y: {
    beginAtZero: true,
    ticks: { precision: 0, color: '#999', font: { size: 11 } },
    grid: { color: 'rgba(0,0,0,0.05)' },
  },
  x: {
    ticks: { color: '#999', font: { size: 11 } },
    grid: { display: false },
  },
};

const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: baseScales,
};

const lineOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: baseScales,
};

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: { boxWidth: 12, padding: 14, font: { size: 11 }, color: '#676a6c' },
    },
  },
};
</script>
