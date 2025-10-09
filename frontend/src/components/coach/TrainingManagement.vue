<template>
  <div class="bg-white rounded-2xl shadow-lg p-6">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-bold text-gray-900">Training Management</h2>
      <button
        @click="showCreateModal = true"
        class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-sm flex items-center gap-2"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Create Training
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
      <p class="text-gray-600 mt-4">Loading training sessions...</p>
    </div>

    <!-- No Trainings -->
    <div v-else-if="trainings.length === 0" class="text-center py-8">
      <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <p class="text-gray-500">No training sessions scheduled</p>
      <p class="text-sm text-gray-400 mt-1">Create your first training session to get started</p>
    </div>

    <!-- Trainings List -->
    <div v-else class="space-y-4">
      <div
        v-for="training in trainings"
        :key="training._id"
        class="border border-gray-200 rounded-xl p-4 hover:shadow-md transition"
      >
        <div class="flex items-center justify-between mb-3">
          <div>
            <h3 class="font-semibold text-gray-900">{{ training.title }}</h3>
            <p class="text-sm text-gray-600">{{ training.description }}</p>
          </div>
          <div class="flex gap-2">
            <button
              @click="editTraining(training)"
              class="text-blue-600 hover:text-blue-800 text-sm"
            >
              Edit
            </button>
            <button
              @click="deleteTraining(training._id)"
              class="text-red-600 hover:text-red-800 text-sm"
            >
              Delete
            </button>
          </div>
        </div>

        <div class="grid md:grid-cols-3 gap-4 text-sm mb-3">
          <div>
            <p class="text-gray-500">Date</p>
            <p class="font-medium">{{ formatDate(training.date) }}</p>
          </div>
          <div>
            <p class="text-gray-500">Time</p>
            <p class="font-medium">{{ training.startTime }} - {{ training.endTime }}</p>
          </div>
          <div>
            <p class="text-gray-500">Venue</p>
            <p class="font-medium">{{ training.location }}</p>
          </div>
        </div>

        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-500 text-sm">Focus Area</p>
            <p class="font-medium">{{ training.focusArea }}</p>
          </div>
          <div class="flex items-center gap-2">
            <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
              {{ training.attendees || 0 }} attendees
            </span>
            <span 
              v-if="training.status === 'completed'"
              class="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs"
            >
              Completed
            </span>
            <span 
              v-else-if="training.status === 'cancelled'"
              class="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs"
            >
              Cancelled
            </span>
            <span 
              v-else
              class="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs"
            >
              Scheduled
            </span>
          </div>
        </div>

        <div v-if="training.notes" class="mt-3 p-3 bg-gray-50 rounded-lg text-sm">
          <p class="text-gray-600">{{ training.notes }}</p>
        </div>
      </div>
    </div>

    <!-- Create/Edit Training Modal -->
    <div v-if="showCreateModal || showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h3 class="text-xl font-bold text-gray-900">
              {{ showEditModal ? 'Edit Training Session' : 'Create Training Session' }}
            </h3>
            <button
              @click="closeModal"
              class="text-gray-400 hover:text-gray-600 transition"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form @submit.prevent="saveTraining" class="p-6 space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Title *</label>
            <input
              v-model="trainingForm.title"
              type="text"
              required
              class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="e.g., Batting Techniques Workshop"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Description *</label>
            <textarea
              v-model="trainingForm.description"
              rows="3"
              required
              class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Describe the training session..."
            ></textarea>
          </div>

          <div class="grid md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Date *</label>
              <input
                v-model="trainingForm.date"
                type="date"
                required
                class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Venue *</label>
              <input
                v-model="trainingForm.location"
                type="text"
                required
                class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Training ground name"
              />
            </div>
          </div>

          <div class="grid md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Start Time *</label>
              <input
                v-model="trainingForm.startTime"
                type="time"
                required
                class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">End Time *</label>
              <input
                v-model="trainingForm.endTime"
                type="time"
                required
                class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Focus Area *</label>
            <select
              v-model="trainingForm.focusArea"
              required
              class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Select Focus Area</option>
              <option value="batting">Batting</option>
              <option value="bowling">Bowling</option>
              <option value="fielding">Fielding</option>
              <option value="wicket-keeping">Wicket Keeping</option>
              <option value="fitness">Fitness</option>
              <option value="strategy">Strategy</option>
              <option value="mental-coaching">Mental Coaching</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Notes</label>
            <textarea
              v-model="trainingForm.notes"
              rows="2"
              class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Additional notes or instructions..."
            ></textarea>
          </div>

          <div class="flex justify-end gap-4">
            <button
              type="button"
              @click="closeModal"
              class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="saving"
              class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="saving">Saving...</span>
              <span v-else>{{ showEditModal ? 'Update Training' : 'Create Training' }}</span>
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
const saving = ref(false);
const trainings = ref([]);
const showCreateModal = ref(false);
const showEditModal = ref(false);
const editingTrainingId = ref(null);

const trainingForm = ref({
  title: '',
  description: '',
  date: '',
  startTime: '',
  endTime: '',
  location: '',
  focusArea: '',
  notes: ''
});

const loadTrainings = async () => {
  loading.value = true;
  try {
    // Since we don't have a specific program ID, we'll fetch all sessions
    // In a real implementation, this would be replaced with the actual endpoint
    const response = await axios.get(`${API}/coaches/sessions/mock-program-id`, {
      headers: { Authorization: `Bearer ${auth.token}` }
    });
    trainings.value = response.data.sessions || [];
  } catch (error) {
    console.error('Error loading trainings:', error);
    trainings.value = [];
  } finally {
    loading.value = false;
  }
};

const saveTraining = async () => {
  saving.value = true;
  try {
    if (showEditModal.value) {
      // Update existing training
      await axios.put(`${API}/coaches/sessions/${editingTrainingId.value}`, trainingForm.value, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      alert('Training session updated successfully');
    } else {
      // Create new training
      await axios.post(`${API}/coaches/sessions`, trainingForm.value, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      alert('Training session created successfully');
    }

    closeModal();
    await loadTrainings();
  } catch (error) {
    console.error('Error saving training:', error);
    alert('Failed to save training session');
  } finally {
    saving.value = false;
  }
};

const editTraining = (training) => {
  trainingForm.value = { ...training };
  editingTrainingId.value = training._id;
  showEditModal.value = true;
};

const deleteTraining = async (trainingId) => {
  if (!confirm('Are you sure you want to delete this training session?')) return;

  try {
    await axios.delete(`${API}/coaches/sessions/${trainingId}`, {
      headers: { Authorization: `Bearer ${auth.token}` }
    });
    alert('Training session deleted successfully');
    await loadTrainings();
  } catch (error) {
    console.error('Error deleting training:', error);
    alert('Failed to delete training session');
  }
};

const closeModal = () => {
  showCreateModal.value = false;
  showEditModal.value = false;
  editingTrainingId.value = null;
  trainingForm.value = {
    title: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    focusArea: '',
    notes: ''
  };
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

onMounted(() => {
  loadTrainings();
});
</script>

<style scoped>
/* Custom styles */
</style>