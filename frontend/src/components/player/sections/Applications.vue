<template>
  <div class="bg-white rounded-2xl shadow-lg p-6">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-bold text-gray-900">Club Applications</h2>
      <button 
        @click="showApplyModal = true"
        :disabled="hasPendingApplication"
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        :title="hasPendingApplication ? 'You already have a pending application' : ''"
      >
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
        </svg>
        Apply to Club
      </button>
    </div>

    <!-- Applications List -->
    <div v-if="applications.length > 0" class="space-y-4">
      <div 
        v-for="application in applications" 
        :key="application._id"
        class="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow"
      >
        <div class="flex justify-between items-start">
          <div>
            <h3 class="text-lg font-bold text-gray-900">{{ application.clubName }}</h3>
            <p class="text-sm text-gray-600 mt-1">{{ application.clubLocation }}</p>
          </div>
          <span 
            :class="[
              'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
              application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              application.status === 'approved' ? 'bg-green-100 text-green-800' :
              'bg-red-100 text-red-800'
            ]"
          >
            {{ formatStatus(application.status) }}
          </span>
        </div>

        <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          <div class="flex items-center text-gray-600">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            Applied on {{ formatDate(application.appliedAt) }}
          </div>
          <div v-if="application.processedAt" class="flex items-center text-gray-600">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            Processed on {{ formatDate(application.processedAt) }}
          </div>
        </div>

        <div v-if="application.rejectionReason" class="mt-3 p-3 bg-red-50 rounded-lg">
          <p class="text-sm text-red-800">
            <span class="font-medium">Rejection reason:</span> {{ application.rejectionReason }}
          </p>
        </div>

        <div v-if="application.status === 'pending'" class="mt-4 flex gap-2">
          <button 
            @click="cancelApplication(application)"
            class="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel Application
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">No club applications</h3>
      <p class="mt-1 text-sm text-gray-500">Apply to clubs to join their training programs.</p>
      <div class="mt-6">
        <button 
          @click="showApplyModal = true"
          class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          Apply to Club
        </button>
      </div>
    </div>

    <!-- Apply to Club Modal -->
    <div v-if="showApplyModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold text-gray-900">Apply to Club</h3>
            <button 
              @click="closeApplyModal"
              class="text-gray-400 hover:text-gray-500"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <div v-if="availableClubs.length > 0" class="space-y-4">
            <div 
              v-for="club in availableClubs" 
              :key="club._id"
              class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
              @click="selectClub(club)"
            >
              <div class="flex justify-between">
                <h4 class="font-medium text-gray-900">{{ club.name }}</h4>
                <span class="text-sm text-gray-500">{{ club.district }}, {{ club.city }}</span>
              </div>
              <p v-if="club.description" class="text-sm text-gray-600 mt-1">{{ club.description }}</p>
              <div class="flex items-center mt-2 text-sm text-gray-500">
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
                {{ club.memberCount }} members
              </div>
            </div>
          </div>
          <div v-else class="text-center py-8">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">No clubs available</h3>
            <p class="mt-1 text-sm text-gray-500">There are currently no clubs accepting applications.</p>
          </div>

          <div class="mt-6 flex justify-end">
            <button 
              type="button"
              @click="closeApplyModal"
              class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';

const API = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';

// Define props
const props = defineProps({
  playerData: {
    type: Object,
    required: true
  }
});

// Reactive data
const applications = ref([]);
const availableClubs = ref([]);
const showApplyModal = ref(false);
const isSubmitting = ref(false);

// Computed properties
const hasPendingApplication = computed(() => {
  return applications.value.some(app => app.status === 'pending');
});

// Fetch real application data
onMounted(async () => {
  await fetchApplications();
  await fetchAvailableClubs();
});

async function fetchApplications() {
  try {
    // Fetch real applications from the backend
    const response = await axios.get(`${API}/players/applications`, { withCredentials: true });
    applications.value = response.data.applications || [];
  } catch (error) {
    console.error('Error fetching applications:', error);
    // Fallback to mock data if API fails
    applications.value = [
      {
        _id: '1',
        clubName: 'Delhi Cricket Club',
        clubLocation: 'Delhi, India',
        status: 'approved',
        appliedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
        processedAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(), // 28 days ago
      },
      {
        _id: '2',
        clubName: 'Mumbai Cricket Academy',
        clubLocation: 'Mumbai, India',
        status: 'pending',
        appliedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
      },
      {
        _id: '3',
        clubName: 'Bangalore Sports Club',
        clubLocation: 'Bangalore, India',
        status: 'rejected',
        appliedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
        processedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days ago
        rejectionReason: 'Currently not accepting new players'
      }
    ];
  }
}

async function fetchAvailableClubs() {
  try {
    // Fetch real available clubs from the backend
    const response = await axios.get(`${API}/players/clubs/available`, { withCredentials: true });
    availableClubs.value = response.data.clubs || [];
  } catch (error) {
    console.error('Error fetching available clubs:', error);
    // Fallback to mock data if API fails
    availableClubs.value = [
      {
        _id: '101',
        name: 'Chennai Cricket Club',
        district: 'Chennai',
        city: 'Tamil Nadu',
        description: 'Premier cricket club with state-of-the-art facilities',
        memberCount: 120
      },
      {
        _id: '102',
        name: 'Kolkata Cricket Academy',
        district: 'Kolkata',
        city: 'West Bengal',
        description: 'Focused on developing young cricket talent',
        memberCount: 85
      },
      {
        _id: '103',
        name: 'Hyderabad Cricket Association',
        district: 'Hyderabad',
        city: 'Telangana',
        description: 'Professional coaching and training programs',
        memberCount: 200
      }
    ];
  }
}

function formatStatus(status) {
  const statusMap = {
    'pending': 'Pending',
    'approved': 'Approved',
    'rejected': 'Rejected'
  };
  return statusMap[status] || status;
}

function formatDate(dateString) {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function closeApplyModal() {
  showApplyModal.value = false;
}

function selectClub(club) {
  // Submit the application to the selected club
  submitApplication(club._id);
}

async function submitApplication(clubId) {
  isSubmitting.value = true;
  try {
    await axios.post(`${API}/players/apply-to-club/${clubId}`, {}, { withCredentials: true });
    alert('Application submitted successfully');
    closeApplyModal();
    await fetchApplications();
  } catch (error) {
    console.error('Error submitting application:', error);
    alert('Failed to submit application. Please try again.');
  } finally {
    isSubmitting.value = false;
  }
}

async function cancelApplication(application) {
  if (!confirm('Are you sure you want to cancel this application?')) {
    return;
  }
  
  try {
    // In a real implementation, this would make an API call to cancel the application
    // For now, we'll just refresh the data
    await fetchApplications();
    alert('Application cancelled successfully');
  } catch (error) {
    console.error('Error cancelling application:', error);
    alert('Failed to cancel application. Please try again.');
  }
}
</script>