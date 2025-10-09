<template>
  <div class="bg-white rounded-2xl shadow-lg p-6">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-bold text-gray-900">Attendance & Fitness Log</h2>
      <div class="flex gap-3">
        <input
          v-model="selectedDate"
          type="date"
          class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
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

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
      <p class="text-gray-600 mt-4">Loading attendance data...</p>
    </div>

    <!-- Attendance Summary -->
    <div v-else class="space-y-6">
      <div class="grid md:grid-cols-3 gap-4 mb-6">
        <div class="bg-blue-50 rounded-xl p-4">
          <p class="text-sm text-blue-800">Total Players</p>
          <p class="text-2xl font-bold text-blue-900">{{ attendanceData.totalPlayers }}</p>
        </div>
        <div class="bg-green-50 rounded-xl p-4">
          <p class="text-sm text-green-800">Present</p>
          <p class="text-2xl font-bold text-green-900">{{ attendanceData.present }}</p>
        </div>
        <div class="bg-red-50 rounded-xl p-4">
          <p class="text-sm text-red-800">Absent</p>
          <p class="text-2xl font-bold text-red-900">{{ attendanceData.absent }}</p>
        </div>
      </div>

      <!-- Attendance List -->
      <div class="border border-gray-200 rounded-xl p-4">
        <h3 class="font-semibold text-gray-900 mb-4">Attendance for {{ formatDate(selectedDate) }}</h3>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-gray-200">
                <th class="text-left py-3 px-4 font-medium text-gray-700">Player</th>
                <th class="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                <th class="text-left py-3 px-4 font-medium text-gray-700">Time</th>
                <th class="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="record in attendanceData.records"
                :key="record.playerId"
                class="border-b border-gray-100 hover:bg-gray-50"
              >
                <td class="py-3 px-4">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span class="text-green-800 text-sm font-bold">{{ record.playerName.charAt(0) }}</span>
                    </div>
                    <span>{{ record.playerName }}</span>
                  </div>
                </td>
                <td class="py-3 px-4">
                  <span
                    :class="{
                      'bg-green-100 text-green-800': record.status === 'present',
                      'bg-red-100 text-red-800': record.status === 'absent',
                      'bg-yellow-100 text-yellow-800': record.status === 'late'
                    }"
                    class="px-2 py-1 rounded-full text-xs font-medium"
                  >
                    {{ record.status.charAt(0).toUpperCase() + record.status.slice(1) }}
                  </span>
                </td>
                <td class="py-3 px-4 text-gray-600">
                  {{ record.time || 'N/A' }}
                </td>
                <td class="py-3 px-4">
                  <button
                    @click="editAttendance(record)"
                    class="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Fitness Evaluations -->
      <div class="border border-gray-200 rounded-xl p-4">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-gray-900">Fitness Evaluations</h3>
          <button
            @click="showFitnessModal = true"
            class="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition text-sm"
          >
            Add Evaluation
          </button>
        </div>
        <div v-if="fitnessData.length === 0" class="text-center py-4">
          <p class="text-gray-500">No fitness evaluations recorded</p>
        </div>
        <div v-else class="grid md:grid-cols-2 gap-4">
          <div
            v-for="evaluation in fitnessData"
            :key="evaluation.id"
            class="border border-gray-200 rounded-lg p-4"
          >
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span class="text-purple-800 text-sm font-bold">{{ evaluation.playerName.charAt(0) }}</span>
                </div>
                <span class="font-medium">{{ evaluation.playerName }}</span>
              </div>
              <span class="text-xs text-gray-500">{{ formatDate(evaluation.date) }}</span>
            </div>
            <div class="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p class="text-gray-500">Stamina</p>
                <p class="font-medium">{{ evaluation.stamina }}/10</p>
              </div>
              <div>
                <p class="text-gray-500">Agility</p>
                <p class="font-medium">{{ evaluation.agility }}/10</p>
              </div>
              <div>
                <p class="text-gray-500">Strength</p>
                <p class="font-medium">{{ evaluation.strength }}/10</p>
              </div>
              <div>
                <p class="text-gray-500">Injury Status</p>
                <p class="font-medium capitalize">{{ evaluation.injuryStatus }}</p>
              </div>
            </div>
            <p v-if="evaluation.notes" class="mt-2 text-sm text-gray-600">{{ evaluation.notes }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Attendance Modal -->
    <div v-if="showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl shadow-xl max-w-md w-full">
        <div class="p-6 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h3 class="text-xl font-bold text-gray-900">Edit Attendance</h3>
            <button
              @click="showEditModal = false"
              class="text-gray-400 hover:text-gray-600 transition"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form @submit.prevent="updateAttendance" class="p-6 space-y-4">
          <div>
            <p class="font-medium">{{ editingRecord.playerName }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              v-model="editingRecord.status"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="late">Late</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Time</label>
            <input
              v-model="editingRecord.time"
              type="time"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div class="flex justify-end gap-3">
            <button
              type="button"
              @click="showEditModal = false"
              class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="updating"
              class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="updating">Updating...</span>
              <span v-else>Update</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Add Fitness Evaluation Modal -->
    <div v-if="showFitnessModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h3 class="text-xl font-bold text-gray-900">Add Fitness Evaluation</h3>
            <button
              @click="showFitnessModal = false"
              class="text-gray-400 hover:text-gray-600 transition"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form @submit.prevent="addFitnessEvaluation" class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Player *</label>
            <select
              v-model="fitnessForm.playerId"
              required
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Select Player</option>
              <option
                v-for="player in players"
                :key="player._id"
                :value="player._id"
              >
                {{ player.fullName }}
              </option>
            </select>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Stamina (1-10) *</label>
              <input
                v-model.number="fitnessForm.stamina"
                type="number"
                min="1"
                max="10"
                required
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Agility (1-10) *</label>
              <input
                v-model.number="fitnessForm.agility"
                type="number"
                min="1"
                max="10"
                required
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Strength (1-10) *</label>
              <input
                v-model.number="fitnessForm.strength"
                type="number"
                min="1"
                max="10"
                required
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Injury Status *</label>
              <select
                v-model="fitnessForm.injuryStatus"
                required
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="none">None</option>
                <option value="minor">Minor</option>
                <option value="moderate">Moderate</option>
                <option value="severe">Severe</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Notes</label>
            <textarea
              v-model="fitnessForm.notes"
              rows="2"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Additional notes about the player's fitness..."
            ></textarea>
          </div>

          <div class="flex justify-end gap-3">
            <button
              type="button"
              @click="showFitnessModal = false"
              class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="addingFitness"
              class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="addingFitness">Adding...</span>
              <span v-else>Add Evaluation</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../../store/auth';
import axios from 'axios';

const auth = useAuthStore();
const API = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';

const loading = ref(false);
const updating = ref(false);
const addingFitness = ref(false);
const players = ref([]);
const selectedDate = ref(new Date().toISOString().split('T')[0]);
const showEditModal = ref(false);
const showFitnessModal = ref(false);

const attendanceData = ref({
  totalPlayers: 0,
  present: 0,
  absent: 0,
  records: []
});

const fitnessData = ref([]);
const editingRecord = ref({});
const fitnessForm = ref({
  playerId: '',
  stamina: 5,
  agility: 5,
  strength: 5,
  injuryStatus: 'none',
  notes: ''
});

const props = defineProps({
  coachData: {
    type: Object,
    required: true
  }
});

const loadPlayers = async () => {
  if (!props.coachData.currentClub) return;
  
  try {
    // Get players from the club
    const response = await axios.get(`${API}/clubs/public/${props.coachData.currentClub._id}/players`);
    players.value = response.data.players || [];
  } catch (error) {
    console.error('Error loading players:', error);
    players.value = [];
  }
};

const loadAttendanceData = async () => {
  loading.value = true;
  try {
    // In a real implementation, this would fetch actual attendance data from the backend
    // For now, we'll initialize with default values
    attendanceData.value = {
      totalPlayers: players.value.length,
      present: 0,
      absent: 0,
      records: players.value.map(player => ({
        playerId: player._id,
        playerName: player.fullName,
        status: 'absent',
        time: null
      }))
    };
  } catch (error) {
    console.error('Error loading attendance data:', error);
    attendanceData.value = {
      totalPlayers: 0,
      present: 0,
      absent: 0,
      records: []
    };
  } finally {
    loading.value = false;
  }
};

const loadFitnessData = async () => {
  try {
    // In a real implementation, this would fetch actual fitness data from the backend
    // For now, we'll initialize with empty array
    fitnessData.value = [];
  } catch (error) {
    console.error('Error loading fitness data:', error);
    fitnessData.value = [];
  }
};

const refreshData = () => {
  loadAttendanceData();
  loadFitnessData();
};

const editAttendance = (record) => {
  editingRecord.value = { ...record };
  showEditModal.value = true;
};

const updateAttendance = async () => {
  updating.value = true;
  try {
    // In a real implementation, this would update the attendance record
    alert('Attendance updated successfully');
    showEditModal.value = false;
    await loadAttendanceData();
  } catch (error) {
    console.error('Error updating attendance:', error);
    alert('Failed to update attendance');
  } finally {
    updating.value = false;
  }
};

const addFitnessEvaluation = async () => {
  addingFitness.value = true;
  try {
    // In a real implementation, this would add the fitness evaluation
    alert('Fitness evaluation added successfully');
    showFitnessModal.value = false;
    fitnessForm.value = {
      playerId: '',
      stamina: 5,
      agility: 5,
      strength: 5,
      injuryStatus: 'none',
      notes: ''
    };
    await loadFitnessData();
  } catch (error) {
    console.error('Error adding fitness evaluation:', error);
    alert('Failed to add fitness evaluation');
  } finally {
    addingFitness.value = false;
  }
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

onMounted(() => {
  loadPlayers();
  loadAttendanceData();
  loadFitnessData();
});
</script>

<style scoped>
/* Custom styles */
</style>