<template>
  <div>
    <!-- Modern Header with Gradient -->
    <div class="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl shadow-xl overflow-hidden mb-6">
      <div class="absolute inset-0 bg-black opacity-10"></div>
      <div class="relative px-6 py-8">
        <div class="flex items-center justify-between">
          <div>
            <div class="inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold mb-3">
              <div class="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              Club Management Portal
            </div>
            <h1 class="text-3xl font-bold text-white mb-2">Club Registration Center</h1>
            <p class="text-blue-100">Review, approve, and manage cricket club applications</p>
          </div>
          <div class="text-right hidden md:block">
            <div class="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30">
              <div class="text-blue-100 text-xs uppercase tracking-wider">Total Applications</div>
              <div class="text-2xl font-bold text-white">{{ clubRequests.length }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Enhanced Stats Cards - Reduced size -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-white rounded-xl p-4 shadow border border-gray-100">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Pending</div>
            <div class="text-2xl font-bold text-gray-900">{{ pendingCount }}</div>
          </div>
          <div class="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6v6l4 2"/>
            </svg>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-xl p-4 shadow border border-gray-100">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Approved</div>
            <div class="text-2xl font-bold text-gray-900">{{ approvedCount }}</div>
          </div>
          <div class="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M9 12l2 2 4-4"/>
              <circle cx="12" cy="12" r="10"/>
            </svg>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-xl p-4 shadow border border-gray-100">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Rejected</div>
            <div class="text-2xl font-bold text-gray-900">{{ rejectedCount }}</div>
          </div>
          <div class="w-10 h-10 bg-gradient-to-br from-red-400 to-red-600 rounded-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-xl p-4 shadow border border-gray-100">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Clubs</div>
            <div class="text-2xl font-bold text-gray-900">{{ totalClubs }}</div>
          </div>
          <div class="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M17 20h5v-2a4 4 0 0 0-3-3.87"/>
              <path d="M9 20H4v-2a4 4 0 0 1 3-3.87"/>
              <circle cx="7" cy="7" r="4"/>
              <circle cx="17" cy="7" r="4"/>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Enhanced Filter Tabs -->
    <div class="mb-6">
      <div class="bg-white rounded-xl p-2 shadow border border-gray-100">
        <div class="flex flex-wrap gap-1">
          <button 
            v-for="status in ['all', 'pending', 'approved', 'rejected']" 
            :key="status"
            @click="activeFilter = status"
            :class="[
              'px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2',
              activeFilter === status 
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow' 
                : 'text-gray-600 hover:bg-gray-50'
            ]"
          >
            <span v-if="status === 'all'">📋</span>
            <span v-else-if="status === 'pending'">🟡</span>
            <span v-else-if="status === 'approved'">🟢</span>
            <span v-else-if="status === 'rejected'">🔴</span>
            {{ status.charAt(0).toUpperCase() + status.slice(1) }}
            <span v-if="status !== 'all'" class="px-1.5 py-0.5 rounded-full text-xs"
                  :class="activeFilter === status ? 'bg-white/20' : 'bg-gray-100'">
              {{ getCountByStatus(status) }}
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- Modern Club Applications Grid -->
    <div class="space-y-6">
      <div 
        v-for="club in filteredClubs" 
        :key="club.id"
        class="bg-white rounded-2xl shadow border border-gray-100 overflow-hidden"
      >
        <!-- Card Header -->
        <div class="relative bg-gray-50 px-6 py-4 border-b border-gray-100">
          <div class="absolute top-3 right-3">
            <span 
              :class="[
                'px-3 py-1 rounded-full text-xs font-medium border',
                club.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                club.status === 'approved' ? 'bg-green-50 text-green-700 border-green-200' :
                'bg-red-50 text-red-700 border-red-200'
              ]"
            >
              <span v-if="club.status === 'pending'">🟡</span>
              <span v-if="club.status === 'approved'">🟢</span>
              <span v-if="club.status === 'rejected'">🔴</span>
              {{ club.status.toUpperCase() }}
            </span>
          </div>
          
          <div class="flex items-start gap-4 mb-3">
            <!-- Club Logo -->
            <div class="w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center flex-shrink-0 border-2 border-white shadow">
              <img v-if="club.logoBase64" :src="club.logoBase64" alt="Club Logo" 
                   class="w-full h-full object-cover" 
                   @error="handleImageError">
              <span v-else class="text-blue-600 font-bold">
                {{ club.clubName.charAt(0).toUpperCase() }}
              </span>
            </div>
            
            <div class="flex-1">
              <h3 class="text-xl font-bold text-gray-900 mb-1">{{ club.clubName }}</h3>
              <div class="flex items-center gap-2 text-gray-600 text-sm mb-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <circle cx="12" cy="8" r="3"/>
                </svg>
                <span>{{ club.city }}, {{ club.district }}</span>
              </div>
              <div class="text-xs text-gray-500">
                Submitted on {{ formatDate(club.submittedAt) }}
              </div>
            </div>
          </div>
        </div>
        
        <div class="p-6">
          <!-- Contact Information Row -->
          <div class="grid grid-cols-2 gap-4 mb-4 p-3 bg-gray-50 rounded-xl">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
              </div>
              <div>
                <div class="text-xs font-medium text-gray-900">{{ club.email }}</div>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                </svg>
              </div>
              <div>
                <div class="text-xs font-medium text-gray-900">{{ club.phone }}</div>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div v-if="club.status === 'pending'" class="flex gap-3 pt-4 border-t border-gray-100">
            <button 
              @click="approveClub(club.id)"
              :disabled="processingClub === club.id"
              class="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-2.5 px-4 rounded-xl font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              <span v-if="processingClub === club.id" class="flex items-center justify-center gap-2">
                <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Processing...
              </span>
              <span v-else class="flex items-center justify-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4"/>
                </svg>
                Approve
              </span>
            </button>
            <button 
              @click="rejectClub(club.id)"
              :disabled="processingClub === club.id"
              class="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-2.5 px-4 rounded-xl font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              <span v-if="processingClub === club.id" class="flex items-center justify-center gap-2">
                <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Processing...
              </span>
              <span v-else class="flex items-center justify-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path d="M6 18L18 6M6 6l12 12"/>
                </svg>
                Reject
              </span>
            </button>
          </div>

          <!-- Status Message for Processed Clubs -->
          <div v-else class="pt-4 border-t border-gray-100">
            <div 
              :class="[{
                'bg-green-50 text-green-800 border-green-200': club.status === 'approved',
                'bg-red-50 text-red-800 border-red-200': club.status === 'rejected'
              }, 'text-center py-3 px-4 rounded-xl font-medium text-sm border']"
            >
              {{ club.status === 'approved' ? '✅ Application Approved' : '❌ Application Rejected' }}
              <span v-if="club.processedAt" class="block text-xs mt-1 opacity-75">
                Decision made on {{ formatDate(club.processedAt) }}
              </span>
              <span v-if="club.status === 'rejected' && club.rejectionReason" class="block text-xs mt-1 opacity-75">
                Reason: {{ club.rejectionReason }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Enhanced Empty State -->
      <div v-if="filteredClubs.length === 0" class="text-center py-12">
        <div class="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
          </svg>
        </div>
        <h3 class="text-lg font-bold text-gray-900 mb-2">No Club Applications Found</h3>
        <p class="text-gray-600 text-sm max-w-md mx-auto">
          {{ activeFilter === 'all' ? 'No club registration applications have been submitted yet.' : `No ${activeFilter} club applications at this time.` }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Enhanced visual effects */
.group:hover .group-hover\:scale-105 {
  transform: scale(1.05);
}

/* Backdrop blur for modern glass effect */
.backdrop-blur-sm {
  backdrop-filter: blur(4px);
}

/* Enhanced shadows */
.shadow-2xl {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

/* Smooth animations */
.transition-all {
  transition: all 0.3s ease;
}

/* Custom scrollbar for better UX */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Gradient text for status indicators */
.bg-gradient-to-r {
  background-size: 200% 200%;
  animation: gradient-shift 3s ease infinite;
}

@keyframes gradient-shift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* Enhanced button hover effects */
button:hover {
  transform: translateY(-1px);
}

/* Card hover effects */
.group:hover {
  transform: translateY(-4px);
}
</style>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';

const clubRequests = ref([]);
const activeFilter = ref('all');
const processingClub = ref(null);

// Stats from backend
const stats = ref({ pending: 0, approved: 0, rejected: 0, total: 0 });

// Computed properties for stats
const pendingCount = computed(() => stats.value.pending);
const approvedCount = computed(() => stats.value.approved);
const rejectedCount = computed(() => stats.value.rejected);
const totalClubs = computed(() => stats.value.approved);

// Filtered clubs based on active filter
const filteredClubs = computed(() => {
  if (activeFilter.value === 'all') return clubRequests.value;
  return clubRequests.value.filter(club => club.status === activeFilter.value);
});

function getCountByStatus(status) {
  return clubRequests.value.filter(club => club.status === status).length;
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

async function loadClubRequests() {
  try {
    const API = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';
    const [clubsRes, statsRes] = await Promise.all([
      axios.get(`${API}/admin/clubs`),
      axios.get(`${API}/admin/stats`)
    ]);
    clubRequests.value = clubsRes.data.clubs || [];
    stats.value = statsRes.data.stats || stats.value;
    
    // Debug logging for logo data
    if (clubRequests.value.length > 0) {
      console.log('Sample club data:', clubRequests.value[0]);
      console.log('Logo Base64 for first club:', clubRequests.value[0]?.logoBase64 ? 'Data found' : 'No logo data');
      console.log('Logo URL for first club:', clubRequests.value[0]?.logoUrl);
      
      // Count clubs with logos
      const clubsWithLogos = clubRequests.value.filter(club => club.logoBase64).length;
      console.log(`Clubs with logos: ${clubsWithLogos} out of ${clubRequests.value.length}`);
    }
  } catch (error) {
    console.error('Error loading admin data:', error);
    const msg = error?.response?.data?.message || error.message || 'Failed to load admin data';
    alert(msg);
    clubRequests.value = [];
    // keep existing stats values
  }
}

async function approveClub(clubId) {
  processingClub.value = clubId;
  try {
    const API = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';
    await axios.put(`${API}/admin/clubs/${clubId}/approve`);
    
    // Update local state
    const club = clubRequests.value.find(c => c.id === clubId);
    if (club) {
      club.status = 'approved';
      club.processedAt = new Date().toISOString();
    }
    
    alert('Club application approved successfully! The club manager will be notified.');
    await loadClubRequests(); // Refresh data
  } catch (error) {
    console.error('Error approving club:', error);
    alert('Failed to approve club. Please try again.');
  } finally {
    processingClub.value = null;
  }
}

async function rejectClub(clubId) {
  const reason = prompt('Please provide a reason for rejection (optional):');
  if (reason === null) return; // User cancelled
  
  processingClub.value = clubId;
  try {
    const API = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';
    await axios.put(`${API}/admin/clubs/${clubId}/reject`, { reason });
    
    // Update local state
    const club = clubRequests.value.find(c => c.id === clubId);
    if (club) {
      club.status = 'rejected';
      club.processedAt = new Date().toISOString();
      club.rejectionReason = reason || 'No reason provided';
    }
    
    alert('Club application rejected successfully!');
    await loadClubRequests(); // Refresh data
  } catch (error) {
    console.error('Error rejecting club:', error);
    alert('Failed to reject club. Please try again.');
  } finally {
    processingClub.value = null;
  }
}



// Helper function to get proper logo URL
function getLogoUrl(club) {
  if (!club.logoUrl) return null;
  
  const API = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';
  
  // If logoUrl is already a full URL, use it as is
  if (club.logoUrl.startsWith('http')) {
    return club.logoUrl;
  }
  
  // If logoUrl starts with /api, prepend the base URL
  if (club.logoUrl.startsWith('/api')) {
    return `${API.replace('/api', '')}${club.logoUrl}`;
  }
  
  // Otherwise construct the URL
  return `${API}/clubs/${club.id}/logo`;
}

// Handle image loading errors
function handleImageError(event) {
  event.target.style.display = 'none';
  console.log('Failed to load club logo image');
}

onMounted(() => {
  loadClubRequests();
});
</script>