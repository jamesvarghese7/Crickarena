<template>
  <div class="bg-white rounded-2xl shadow-lg p-6">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-bold text-gray-900">Reports & Analytics</h2>
      <div class="flex gap-3">
        <select
          v-model="selectedPeriod"
          class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="last-week">Last Week</option>
          <option value="last-month">Last Month</option>
          <option value="last-3-months">Last 3 Months</option>
          <option value="last-6-months">Last 6 Months</option>
          <option value="all-time">All Time</option>
        </select>
        <select
          v-model="chartType"
          class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="attendance">Attendance Trend</option>
          <option value="performance">Performance Improvement</option>
          <option value="training">Training Participation</option>
        </select>
        <button
          @click="refreshData"
          class="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition"
        >
          <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Key Metrics -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <div class="bg-blue-50 rounded-xl p-4">
        <p class="text-sm text-blue-800">Attendance Rate</p>
        <p class="text-2xl font-bold text-blue-900">{{ keyMetrics.attendanceRate }}%</p>
        <p class="text-xs text-blue-700 mt-1" :class="keyMetrics.attendanceTrend >= 0 ? 'text-green-600' : 'text-red-600'">
          {{ keyMetrics.attendanceTrend >= 0 ? '+' : '' }}{{ keyMetrics.attendanceTrend }}% from last period
        </p>
      </div>
      <div class="bg-green-50 rounded-xl p-4">
        <p class="text-sm text-green-800">Performance Score</p>
        <p class="text-2xl font-bold text-green-900">{{ keyMetrics.performanceScore }}/10</p>
        <p class="text-xs text-green-700 mt-1" :class="keyMetrics.performanceTrend >= 0 ? 'text-green-600' : 'text-red-600'">
          {{ keyMetrics.performanceTrend >= 0 ? '+' : '' }}{{ keyMetrics.performanceTrend }} from last period
        </p>
      </div>
      <div class="bg-purple-50 rounded-xl p-4">
        <p class="text-sm text-purple-800">Training Sessions</p>
        <p class="text-2xl font-bold text-purple-900">{{ keyMetrics.trainingSessions }}</p>
        <p class="text-xs text-purple-700 mt-1" :class="keyMetrics.trainingTrend >= 0 ? 'text-green-600' : 'text-red-600'">
          {{ keyMetrics.trainingTrend >= 0 ? '+' : '' }}{{ keyMetrics.trainingTrend }} from last period
        </p>
      </div>
      <div class="bg-yellow-50 rounded-xl p-4">
        <p class="text-sm text-yellow-800">Improvement Rate</p>
        <p class="text-2xl font-bold text-yellow-900">{{ keyMetrics.improvementRate }}%</p>
        <p class="text-xs text-yellow-700 mt-1" :class="keyMetrics.improvementTrend >= 0 ? 'text-green-600' : 'text-red-600'">
          {{ keyMetrics.improvementTrend >= 0 ? '+' : '' }}{{ keyMetrics.improvementTrend }}% from last period
        </p>
      </div>
    </div>

    <!-- Chart Container -->
    <div class="border border-gray-200 rounded-xl p-4 mb-8">
      <h3 class="font-semibold text-gray-900 mb-4">{{ chartTitle }}</h3>
      <div class="h-80 flex items-end justify-between gap-2 pt-4">
        <div
          v-for="(dataPoint, index) in chartData"
          :key="index"
          class="flex-1 flex flex-col items-center"
        >
          <div class="text-xs text-gray-500 mb-1">{{ dataPoint.label }}</div>
          <div
            class="w-full rounded-t"
            :class="{
              'bg-gradient-to-t from-blue-500 to-blue-300': chartType === 'attendance',
              'bg-gradient-to-t from-green-500 to-green-300': chartType === 'performance',
              'bg-gradient-to-t from-purple-500 to-purple-300': chartType === 'training'
            }"
            :style="{ height: dataPoint.value + '%' }"
          ></div>
          <div class="text-xs text-gray-600 mt-1">{{ dataPoint.value }}</div>
        </div>
      </div>
    </div>

    <!-- Detailed Reports -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Attendance Trend Report -->
      <div class="border border-gray-200 rounded-xl p-4">
        <h3 class="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Attendance Trend
        </h3>
        <div class="space-y-3">
          <div
            v-for="(month, index) in attendanceTrend"
            :key="index"
            class="flex items-center justify-between py-2 border-b border-gray-100"
          >
            <span class="text-sm text-gray-600">{{ month.name }}</span>
            <div class="flex items-center gap-3">
              <div class="w-24 bg-gray-200 rounded-full h-2">
                <div 
                  class="bg-blue-600 h-2 rounded-full" 
                  :style="{ width: month.percentage + '%' }"
                ></div>
              </div>
              <span class="text-sm font-medium text-gray-900">{{ month.percentage }}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Performance Improvement Report -->
      <div class="border border-gray-200 rounded-xl p-4">
        <h3 class="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Performance Improvement
        </h3>
        <div class="space-y-3">
          <div
            v-for="(skill, index) in performanceImprovement"
            :key="index"
            class="flex items-center justify-between py-2 border-b border-gray-100"
          >
            <span class="text-sm text-gray-600">{{ skill.name }}</span>
            <div class="flex items-center gap-3">
              <div class="w-24 bg-gray-200 rounded-full h-2">
                <div 
                  class="bg-green-600 h-2 rounded-full" 
                  :style="{ width: skill.improvement + '%' }"
                ></div>
              </div>
              <span class="text-sm font-medium text-gray-900">{{ skill.improvement }}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Training Participation Report -->
      <div class="border border-gray-200 rounded-xl p-4">
        <h3 class="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Training Participation
        </h3>
        <div class="space-y-3">
          <div
            v-for="(type, index) in trainingParticipation"
            :key="index"
            class="flex items-center justify-between py-2 border-b border-gray-100"
          >
            <span class="text-sm text-gray-600">{{ type.name }}</span>
            <div class="flex items-center gap-3">
              <div class="w-24 bg-gray-200 rounded-full h-2">
                <div 
                  class="bg-purple-600 h-2 rounded-full" 
                  :style="{ width: type.participation + '%' }"
                ></div>
              </div>
              <span class="text-sm font-medium text-gray-900">{{ type.participation }}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Overall Progress Report -->
      <div class="border border-gray-200 rounded-xl p-4">
        <h3 class="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Overall Progress
        </h3>
        <div class="flex flex-col items-center justify-center py-4">
          <div class="relative w-48 h-48">
            <svg class="w-full h-full" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#e5e7eb"
                stroke-width="8"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#f59e0b"
                stroke-width="8"
                stroke-dasharray="283"
                :stroke-dashoffset="283 - (283 * keyMetrics.overallProgress) / 100"
                transform="rotate(-90 50 50)"
                class="transition-all duration-1000 ease-in-out"
              />
            </svg>
            <div class="absolute inset-0 flex flex-col items-center justify-center">
              <span class="text-2xl font-bold text-gray-900">{{ keyMetrics.overallProgress }}%</span>
              <span class="text-sm text-gray-600">Progress</span>
            </div>
          </div>
          <p class="text-center text-sm text-gray-600 mt-4">
            You're {{ keyMetrics.progressStatus }} compared to last period
          </p>
        </div>
      </div>
    </div>

    <!-- Export Options -->
    <div class="mt-8 pt-6 border-t border-gray-200 flex justify-end">
      <div class="flex gap-3">
        <button
          @click="exportReport('pdf')"
          class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
          </svg>
          Export PDF
        </button>
        <button
          @click="exportReport('csv')"
          class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
          </svg>
          Export CSV
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

const loading = ref(false);
const selectedPeriod = ref('last-month');
const chartType = ref('attendance');

// Mock data
const keyMetricsData = ref({
  attendanceRate: 85,
  attendanceTrend: 5,
  performanceScore: 8.2,
  performanceTrend: 0.5,
  trainingSessions: 12,
  trainingTrend: 2,
  improvementRate: 15,
  improvementTrend: 3,
  overallProgress: 78,
  progressStatus: 'making good progress'
});

const attendanceTrendData = ref([
  { name: 'January', percentage: 75 },
  { name: 'February', percentage: 80 },
  { name: 'March', percentage: 82 },
  { name: 'April', percentage: 85 },
  { name: 'May', percentage: 88 },
  { name: 'June', percentage: 85 }
]);

const performanceImprovementData = ref([
  { name: 'Batting', improvement: 25 },
  { name: 'Bowling', improvement: 18 },
  { name: 'Fielding', improvement: 30 },
  { name: 'Fitness', improvement: 22 }
]);

const trainingParticipationData = ref([
  { name: 'Batting Sessions', participation: 90 },
  { name: 'Bowling Sessions', participation: 85 },
  { name: 'Fielding Sessions', participation: 95 },
  { name: 'Fitness Training', participation: 80 }
]);

const chartDataSamples = ref({
  attendance: [
    { label: 'Jan', value: 75 },
    { label: 'Feb', value: 80 },
    { label: 'Mar', value: 82 },
    { label: 'Apr', value: 85 },
    { label: 'May', value: 88 },
    { label: 'Jun', value: 85 }
  ],
  performance: [
    { label: 'Jan', value: 7.2 },
    { label: 'Feb', value: 7.5 },
    { label: 'Mar', value: 7.8 },
    { label: 'Apr', value: 8.0 },
    { label: 'May', value: 8.1 },
    { label: 'Jun', value: 8.2 }
  ],
  training: [
    { label: 'Jan', value: 8 },
    { label: 'Feb', value: 9 },
    { label: 'Mar', value: 10 },
    { label: 'Apr', value: 11 },
    { label: 'May', value: 12 },
    { label: 'Jun', value: 12 }
  ]
});

const keyMetrics = computed(() => keyMetricsData.value);

const attendanceTrend = computed(() => attendanceTrendData.value);

const performanceImprovement = computed(() => performanceImprovementData.value);

const trainingParticipation = computed(() => trainingParticipationData.value);

const chartData = computed(() => {
  return chartDataSamples.value[chartType.value] || chartDataSamples.value.attendance;
});

const chartTitle = computed(() => {
  const titles = {
    attendance: 'Attendance Trend Over Time',
    performance: 'Performance Improvement Over Time',
    training: 'Training Participation Over Time'
  };
  return titles[chartType.value] || titles.attendance;
});

const loadData = async () => {
  loading.value = true;
  try {
    // TODO: Implement actual API calls to fetch analytics data
    // This is a placeholder implementation with mock data
    console.log('Loading analytics data for period:', selectedPeriod.value);
  } catch (error) {
    console.error('Error loading analytics data:', error);
  } finally {
    loading.value = false;
  }
};

const refreshData = () => {
  loadData();
};

const exportReport = (format) => {
  // TODO: Implement actual export functionality
  alert(`Exporting report as ${format.toUpperCase()}`);
};

onMounted(() => {
  loadData();
});
</script>

<style scoped>
/* Custom styles */
</style>