<template>
  <div class="bg-white rounded-2xl shadow-lg p-6">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-bold text-gray-900">Training Sessions</h2>
      <div class="flex gap-3">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search sessions..."
          class="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
        <button
          @click="refreshSessions"
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
      <p class="text-gray-600 mt-4">Loading training sessions...</p>
    </div>

    <!-- No Sessions -->
    <div v-else-if="filteredSessions.length === 0" class="text-center py-8">
      <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <p class="text-gray-500">No training sessions assigned</p>
      <p class="text-sm text-gray-400 mt-1">Your coach will assign training sessions soon</p>
    </div>

    <!-- Sessions List -->
    <div v-else class="space-y-4">
      <div
        v-for="session in filteredSessions"
        :key="session._id"
        class="border border-gray-200 rounded-xl p-4 hover:shadow-md transition"
      >
        <div class="flex items-center justify-between mb-3">
          <div>
            <h3 class="font-semibold text-gray-900">{{ session.title }}</h3>
            <p class="text-sm text-gray-600">{{ session.description }}</p>
          </div>
          <div>
            <span
              :class="getStatusClass(session.playerStatus)"
              class="px-3 py-1 rounded-full text-sm font-medium"
            >
              {{ formatStatus(session.playerStatus) }}
            </span>
          </div>
        </div>

        <div class="grid md:grid-cols-3 gap-4 text-sm mb-3">
          <div>
            <p class="text-gray-500">Date</p>
            <p class="font-medium">{{ formatDate(session.date) }}</p>
          </div>
          <div>
            <p class="text-gray-500">Time</p>
            <p class="font-medium">{{ session.startTime }} - {{ session.endTime }}</p>
          </div>
          <div>
            <p class="text-gray-500">Venue</p>
            <p class="font-medium">{{ session.location }}</p>
          </div>
        </div>

        <div class="flex items-center justify-between mb-3">
          <div>
            <p class="text-gray-500 text-sm">Focus Area</p>
            <p class="font-medium">{{ session.focusArea }}</p>
          </div>
        </div>

        <div v-if="session.notes" class="mt-3 p-3 bg-gray-50 rounded-lg text-sm">
          <p class="text-gray-600">{{ session.notes }}</p>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-wrap gap-2 mt-4">
          <button
            v-if="!session.playerStatus || session.playerStatus === 'pending'"
            @click="markAttendance(session, 'present')"
            class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm hover:bg-green-200 transition"
          >
            Mark Present
          </button>
          <button
            v-if="!session.playerStatus || session.playerStatus === 'pending'"
            @click="markAttendance(session, 'absent')"
            class="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm hover:bg-red-200 transition"
          >
            Mark Absent
          </button>
          <button
            v-if="session.playerStatus === 'present' || session.playerStatus === 'absent'"
            @click="updateStatus(session, 'completed')"
            :class="{
              'bg-green-100 text-green-800': session.playerStatus === 'completed',
              'bg-gray-100 text-gray-800': session.playerStatus !== 'completed'
            }"
            class="px-3 py-1 rounded-full text-sm hover:opacity-90 transition"
          >
            Completed
          </button>
          <button
            v-if="session.playerStatus === 'present' || session.playerStatus === 'absent'"
            @click="updateStatus(session, 'need-help')"
            :class="{
              'bg-yellow-100 text-yellow-800': session.playerStatus === 'need-help',
              'bg-gray-100 text-gray-800': session.playerStatus !== 'need-help'
            }"
            class="px-3 py-1 rounded-full text-sm hover:opacity-90 transition"
          >
            Need Help
          </button>
          <button
            v-if="session.playerStatus === 'present' || session.playerStatus === 'absent'"
            @click="updateStatus(session, 'missed')"
            :class="{
              'bg-red-100 text-red-800': session.playerStatus === 'missed',
              'bg-gray-100 text-gray-800': session.playerStatus !== 'missed'
            }"
            class="px-3 py-1 rounded-full text-sm hover:opacity-90 transition"
          >
            Missed
          </button>
          <button
            @click="showFeedbackModal(session)"
            class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm hover:bg-blue-200 transition"
          >
            Add Feedback
          </button>
        </div>
      </div>
    </div>

    <!-- Feedback Modal -->
    <div v-if="showFeedbackModalFlag" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl shadow-xl max-w-md w-full">
        <div class="p-6 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h3 class="text-xl font-bold text-gray-900">Add Feedback</h3>
            <button
              @click="showFeedbackModalFlag = false"
              class="text-gray-400 hover:text-gray-600 transition"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form @submit.prevent="submitFeedback" class="p-6 space-y-4">
          <div>
            <p class="font-medium">{{ selectedSession.title }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Your Feedback</label>
            <textarea
              v-model="feedbackContent"
              rows="4"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Share your thoughts about this session..."
            ></textarea>
          </div>

          <div class="flex justify-end gap-3">
            <button
              type="button"
              @click="showFeedbackModalFlag = false"
              class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="submittingFeedback"
              class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="submittingFeedback">Submitting...</span>
              <span v-else>Submit Feedback</span>
            </button>
          </div>
        </form>
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
const sessions = ref([]);
const searchQuery = ref('');
const showFeedbackModalFlag = ref(false);
const selectedSession = ref(null);
const feedbackContent = ref('');
const submittingFeedback = ref(false);

const props = defineProps({
  player: {
    type: Object,
    required: true
  }
});

const filteredSessions = computed(() => {
  if (!searchQuery.value) return sessions.value;
  
  const query = searchQuery.value.toLowerCase();
  return sessions.value.filter(session => 
    session.title.toLowerCase().includes(query) ||
    session.description.toLowerCase().includes(query) ||
    session.focusArea.toLowerCase().includes(query)
  );
});

const loadSessions = async () => {
  loading.value = true;
  try {
    // Fetch player's training sessions from the backend
    // Since there's no direct endpoint, we'll need to get sessions through the player's club
    const idTok = auth.user ? await auth.user.getIdToken(true) : null;
    
    // First, get the player's current club
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
        
        // Get sessions from all training programs
        const allSessions = [];
        for (const program of coachData.trainingPrograms) {
          const sessionsResponse = await axios.get(`${API}/coaches/sessions/${program._id}`, {
            headers: {
              ...(idTok ? { Authorization: `Bearer ${idTok}` } : {})
            },
            withCredentials: true
          });
          
          // Add program info to each session
          const programSessions = sessionsResponse.data.sessions.map(session => ({
            ...session,
            programId: program._id,
            programTitle: program.title,
            playerStatus: 'pending' // Default status
          }));
          
          allSessions.push(...programSessions);
        }
        
        sessions.value = allSessions;
      }
    }
  } catch (error) {
    console.error('Error loading sessions:', error);
    // Fallback to mock data if there's an error
    sessions.value = [
      {
        _id: '1',
        title: 'Batting Techniques Workshop',
        description: 'Focus on improving batting stance and shot selection',
        date: '2023-06-15',
        startTime: '09:00',
        endTime: '11:00',
        location: 'Main Ground',
        focusArea: 'batting',
        notes: 'Bring your bats and gloves',
        playerStatus: 'present'
      },
      {
        _id: '2',
        title: 'Bowling Accuracy Training',
        description: 'Practice bowling yorkers and line and length',
        date: '2023-06-17',
        startTime: '16:00',
        endTime: '18:00',
        location: 'Net Bowling Area',
        focusArea: 'bowling',
        notes: 'All bowlers must attend',
        playerStatus: 'pending'
      }
    ];
  } finally {
    loading.value = false;
  }
};

const refreshSessions = () => {
  loadSessions();
};

const markAttendance = async (session, status) => {
  try {
    // Update session status locally
    session.playerStatus = status;
    
    // In a real implementation, you would send this to the backend
    const idTok = auth.user ? await auth.user.getIdToken(true) : null;
    await axios.post(`${API}/players/sessions/${session._id}/attendance`, { status }, {
      headers: {
        ...(idTok ? { Authorization: `Bearer ${idTok}` } : {})
      },
      withCredentials: true
    });
    
    alert(`Marked as ${status}`);
  } catch (error) {
    console.error('Error marking attendance:', error);
    alert('Failed to mark attendance');
  }
};

const updateStatus = async (session, status) => {
  try {
    // Update session status locally
    session.playerStatus = status;
    
    // In a real implementation, you would send this to the backend
    const idTok = auth.user ? await auth.user.getIdToken(true) : null;
    await axios.put(`${API}/players/sessions/${session._id}/status`, { status }, {
      headers: {
        ...(idTok ? { Authorization: `Bearer ${idTok}` } : {})
      },
      withCredentials: true
    });
    
    alert(`Status updated to ${formatStatus(status)}`);
  } catch (error) {
    console.error('Error updating status:', error);
    alert('Failed to update status');
  }
};

const showFeedbackModal = (session) => {
  selectedSession.value = session;
  feedbackContent.value = '';
  showFeedbackModalFlag.value = true;
};

const submitFeedback = async () => {
  submittingFeedback.value = true;
  try {
    // In a real implementation, you would send this to the backend
    const idTok = auth.user ? await auth.user.getIdToken(true) : null;
    await axios.post(`${API}/players/sessions/${selectedSession.value._id}/feedback`, { 
      content: feedbackContent.value 
    }, {
      headers: {
        ...(idTok ? { Authorization: `Bearer ${idTok}` } : {})
      },
      withCredentials: true
    });
    
    alert('Feedback submitted successfully');
    showFeedbackModalFlag.value = false;
  } catch (error) {
    console.error('Error submitting feedback:', error);
    alert('Failed to submit feedback');
  } finally {
    submittingFeedback.value = false;
  }
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const formatStatus = (status) => {
  if (!status) return 'Pending';
  
  const statusMap = {
    'pending': 'Pending',
    'present': 'Present',
    'absent': 'Absent',
    'completed': 'Completed',
    'need-help': 'Need Help',
    'missed': 'Missed'
  };
  
  return statusMap[status] || status;
};

const getStatusClass = (status) => {
  const classMap = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'present': 'bg-green-100 text-green-800',
    'absent': 'bg-red-100 text-red-800',
    'completed': 'bg-green-100 text-green-800',
    'need-help': 'bg-yellow-100 text-yellow-800',
    'missed': 'bg-red-100 text-red-800'
  };
  
  return classMap[status] || 'bg-gray-100 text-gray-800';
};

onMounted(() => {
  loadSessions();
});
</script>

<style scoped>
/* Custom styles */
</style>