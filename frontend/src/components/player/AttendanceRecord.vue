<template>
  <div class="bg-white rounded-2xl shadow-lg p-6">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-bold text-gray-900">Attendance Record</h2>
      <div class="flex gap-3">
        <select
          v-model="selectedMonth"
          class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option v-for="month in availableMonths" :key="month.value" :value="month.value">
            {{ month.label }}
          </option>
        </select>
        <select
          v-model="sessionType"
          class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="all">All Sessions</option>
          <option value="training">Training Only</option>
          <option value="match">Matches Only</option>
        </select>
        <button
          @click="refreshAttendance"
          class="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition"
        >
          <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Attendance Summary -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div class="bg-blue-50 rounded-xl p-4">
        <p class="text-sm text-blue-800">Total Sessions</p>
        <p class="text-2xl font-bold text-blue-900">{{ attendanceSummary.total }}</p>
      </div>
      <div class="bg-green-50 rounded-xl p-4">
        <p class="text-sm text-green-800">Present</p>
        <p class="text-2xl font-bold text-green-900">{{ attendanceSummary.present }}</p>
      </div>
      <div class="bg-red-50 rounded-xl p-4">
        <p class="text-sm text-red-800">Absent</p>
        <p class="text-2xl font-bold text-red-900">{{ attendanceSummary.absent }}</p>
      </div>
    </div>

    <!-- Attendance Percentage -->
    <div class="mb-6">
      <div class="flex justify-between mb-2">
        <span class="text-sm font-medium text-gray-700">Attendance Rate</span>
        <span class="text-sm font-medium text-gray-700">{{ attendancePercentage }}%</span>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-4">
        <div 
          class="bg-green-600 h-4 rounded-full" 
          :style="{ width: attendancePercentage + '%' }"
        ></div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
      <p class="text-gray-600 mt-4">Loading attendance records...</p>
    </div>

    <!-- No Records -->
    <div v-else-if="filteredAttendance.length === 0" class="text-center py-8">
      <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
      <p class="text-gray-500">No attendance records found</p>
      <p class="text-sm text-gray-400 mt-1">Attendance records will appear here once sessions are completed</p>
    </div>

    <!-- Attendance Records Table -->
    <div v-else class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Session</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="record in filteredAttendance" :key="record.id">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ formatDate(record.date) }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ record.session }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              <span 
                :class="{
                  'bg-blue-100 text-blue-800': record.type === 'training',
                  'bg-green-100 text-green-800': record.type === 'match'
                }"
                class="px-2 py-1 rounded-full text-xs font-medium"
              >
                {{ record.type.charAt(0).toUpperCase() + record.type.slice(1) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
              <span 
                :class="{
                  'bg-green-100 text-green-800': record.status === 'present',
                  'bg-red-100 text-red-800': record.status === 'absent'
                }"
                class="px-2 py-1 rounded-full text-xs font-medium"
              >
                {{ record.status.charAt(0).toUpperCase() + record.status.slice(1) }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Monthly Attendance Chart -->
    <div class="border border-gray-200 rounded-xl p-4 mt-8">
      <h3 class="font-semibold text-gray-900 mb-4">Monthly Attendance Trend</h3>
      <div class="h-48 flex items-end justify-between gap-2 pt-4">
        <div
          v-for="(monthData, index) in monthlyAttendanceData"
          :key="index"
          class="flex-1 flex flex-col items-center"
        >
          <div class="text-xs text-gray-500 mb-1">{{ monthData.month }}</div>
          <div
            class="w-full bg-gradient-to-t from-blue-500 to-blue-300 rounded-t"
            :style="{ height: (monthData.percentage / 100) * 100 + '%' }"
          ></div>
          <div class="text-xs text-gray-600 mt-1">{{ monthData.percentage }}%</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../../store/auth';
import axios from 'axios';

const auth = useAuthStore();
const API = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';

const loading = ref(false);
const attendanceData = ref([]);
const selectedMonth = ref('');
const sessionType = ref('all');

const props = defineProps({
  player: {
    type: Object,
    required: true
  }
});

const availableMonths = computed(() => {
  const months = [
    { value: '2023-06', label: 'June 2023' },
    { value: '2023-05', label: 'May 2023' },
    { value: '2023-04', label: 'April 2023' }
  ];
  
  if (!selectedMonth.value && months.length > 0) {
    selectedMonth.value = months[0].value;
  }
  
  return months;
});

const filteredAttendance = computed(() => {
  let filtered = attendanceData.value;
  
  if (selectedMonth.value) {
    filtered = filtered.filter(record => 
      record.date.startsWith(selectedMonth.value)
    );
  }
  
  if (sessionType.value !== 'all') {
    filtered = filtered.filter(record => 
      record.type === sessionType.value
    );
  }
  
  return filtered;
});

const attendanceSummary = computed(() => {
  const total = filteredAttendance.value.length;
  const present = filteredAttendance.value.filter(record => record.status === 'present').length;
  const absent = total - present;
  
  return { total, present, absent };
});

const attendancePercentage = computed(() => {
  if (attendanceSummary.value.total === 0) return 0;
  return Math.round((attendanceSummary.value.present / attendanceSummary.value.total) * 100);
});

const monthlyAttendanceData = computed(() => {
  // This would be calculated from actual data
  return [
    { month: 'Apr', percentage: 85 },
    { month: 'May', percentage: 92 },
    { month: 'Jun', percentage: 78 }
  ];
});

const loadAttendanceData = async () => {
  loading.value = true;
  try {
    // Fetch player's attendance data from the backend
    const idTok = auth.user ? await auth.user.getIdToken(true) : null;
    
    // Get player's current club
    const playerResponse = await axios.get(`${API}/players/profile`, {
      headers: {
        ...(idTok ? { Authorization: `Bearer ${idTok}` } : {})
      },
      withCredentials: true
    });
    
    const playerData = playerResponse.data.player;
    
    if (playerData.currentClub) {
      // Get the club's coach
      const clubResponse = await axios.get(`${API}/clubs/public/${playerData.currentClub._id}`, {
        headers: {
          ...(idTok ? { Authorization: `Bearer ${idTok}` } : {})
        },
        withCredentials: true
      });
      
      const clubData = clubResponse.data;
      
      if (clubData.coach) {
        // Get the coach's training programs and sessions
        const coachResponse = await axios.get(`${API}/coaches/profile`, {
          headers: {
            ...(idTok ? { Authorization: `Bearer ${idTok}` } : {})
          },
          withCredentials: true
        });
        
        const coachData = coachResponse.data.coach;
        
        // Get attendance data from all training programs
        const allAttendance = [];
        for (const program of coachData.trainingPrograms) {
          // Get sessions for this program
          const sessionsResponse = await axios.get(`${API}/coaches/sessions/${program._id}`, {
            headers: {
              ...(idTok ? { Authorization: `Bearer ${idTok}` } : {})
            },
            withCredentials: true
          });
          
          // Add attendance info for each session
          const programSessions = sessionsResponse.data.sessions.map(session => ({
            id: session._id,
            date: session.date,
            session: session.focusArea,
            type: 'training',
            status: 'present' // Default to present, would be updated with real data
          }));
          
          allAttendance.push(...programSessions);
        }
        
        attendanceData.value = allAttendance;
      }
    }
  } catch (error) {
    console.error('Error loading attendance data:', error);
    // Fallback to mock data if there's an error
    attendanceData.value = [
      { id: 1, date: '2023-06-01', session: 'Morning Practice', type: 'training', status: 'present' },
      { id: 2, date: '2023-06-03', session: 'Batting Workshop', type: 'training', status: 'present' },
      { id: 3, date: '2023-06-05', session: 'Bowling Session', type: 'training', status: 'absent' },
      { id: 4, date: '2023-06-08', session: 'Fitness Training', type: 'training', status: 'present' },
      { id: 5, date: '2023-06-10', session: 'Match Analysis', type: 'training', status: 'present' },
      { id: 6, date: '2023-06-12', session: 'Friendly Match vs Rivals', type: 'match', status: 'present' },
      { id: 7, date: '2023-06-15', session: 'Fielding Drills', type: 'training', status: 'absent' }
    ];
  } finally {
    loading.value = false;
  }
};

const refreshAttendance = () => {
  loadAttendanceData();
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

onMounted(() => {
  loadAttendanceData();
});
</script>

<style scoped>
/* Custom styles */
</style>