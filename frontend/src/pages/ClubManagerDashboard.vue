<template>
  <div class="min-h-screen bg-gradient-to-b from-blue-50 to-white">
    <div class="max-w-6xl mx-auto px-4 py-8">
      <!-- Header -->
      <div class="mb-8">
        <div class="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold mb-4">
          <span class="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
          Club Manager Portal
        </div>
        <h1 class="text-4xl font-bold text-gray-900 mb-2">Club Management Dashboard</h1>
        <p class="text-xl text-gray-600">Manage your cricket club and connect with Kerala's cricket community</p>
      </div>

      <!-- Club Status Card -->
      <div v-if="clubData" class="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden mb-8">
        <div class="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-2xl font-bold text-white">{{ clubData.clubName }}</h2>
              <p class="text-blue-100">{{ clubData.city }}, {{ clubData.district }}</p>
            </div>
            <div class="text-right">
              <span 
                :class="[
                  'px-4 py-2 rounded-full text-sm font-semibold',
                  clubData.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  clubData.status === 'approved' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                ]"
              >
                {{ clubData.status.toUpperCase() }}
              </span>
            </div>
          </div>
        </div>

        <div class="p-8">
          <!-- Status Messages -->
          <div v-if="clubData.status === 'pending'" class="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-6">
            <div class="flex items-start gap-4">
              <div class="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 6v6l4 2"/>
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-yellow-800 mb-2">Registration Under Review</h3>
                <p class="text-yellow-700">
                  Your club registration is currently being reviewed by our admin team. You will receive an email notification once the review is complete. This process typically takes 2-3 business days.
                </p>
              </div>
            </div>
          </div>

          <div v-else-if="clubData.status === 'approved'" class="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
            <div class="flex items-start gap-4">
              <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4"/>
                  <circle cx="12" cy="12" r="10"/>
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-green-800 mb-2">Club Approved! 🎉</h3>
                <p class="text-green-700">
                  Congratulations! Your club has been approved and is now part of the CrickArena community. You can now access all club management features and participate in tournaments.
                </p>
              </div>
            </div>
          </div>

          <div v-else-if="clubData.status === 'rejected'" class="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
            <div class="flex items-start gap-4">
              <div class="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="15" y1="9" x2="9" y2="15"/>
                  <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-red-800 mb-2">Registration Rejected</h3>
                <p class="text-red-700 mb-3">
                  Unfortunately, your club registration was not approved. 
                  <span v-if="clubData.rejectionReason">Reason: {{ clubData.rejectionReason }}</span>
                </p>
                <button 
                  @click="$router.push('/club-registration')"
                  class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                  Submit New Registration
                </button>
              </div>
            </div>
          </div>

          <!-- Edit Approved Club Details -->
          <div v-if="clubData.status === 'approved'" class="mb-8">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-gray-900">Club Details</h3>
              <button v-if="!isEditing" @click="startEdit" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold">Edit Club Details</button>
              <div v-else class="flex gap-2">
                <button @click="saveEdit" class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold">Save Changes</button>
                <button @click="cancelEdit" class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50">Cancel</button>
              </div>
            </div>

            <div v-if="isEditing" class="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-6">
              <p class="text-sm text-gray-600 mb-4">Editing an approved club will send the details for re-approval.</p>

              <!-- Logo Upload -->
              <div class="mb-4">
                <label class="block text-sm font-semibold text-gray-700 mb-2">Club Logo</label>
                <div class="flex items-center gap-4">
                  <div class="w-16 h-16 rounded-full bg-white border border-gray-200 flex items-center justify-center overflow-hidden">
                    <img v-if="editable.logoPreview || editable.logoUrl" :src="editable.logoPreview || editable.logoUrl" alt="Logo preview" class="w-full h-full object-cover" />
                    <span v-else class="text-gray-400 text-xs">No logo</span>
                  </div>
                  <input type="file" accept="image/*" @change="onEditLogoSelected" />
                </div>
              </div>

              <div class="grid md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-1">Club Name</label>
                  <input v-model="editable.clubName" type="text" class="w-full border border-gray-300 rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-1">District</label>
                  <input v-model="editable.district" type="text" class="w-full border border-gray-300 rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-1">City/Town</label>
                  <input v-model="editable.city" type="text" class="w-full border border-gray-300 rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-1">Founded Year</label>
                  <input v-model.number="editable.foundedYear" type="number" min="1900" :max="new Date().getFullYear()" class="w-full border border-gray-300 rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-1">Contact Phone</label>
                  <input v-model="editable.phone" type="tel" class="w-full border border-gray-300 rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                  <input v-model="editable.email" type="email" class="w-full border border-gray-300 rounded-lg px-3 py-2" />
                </div>
                <div class="md:col-span-2">
                  <label class="block text-sm font-semibold text-gray-700 mb-1">Club Description</label>
                  <textarea v-model="editable.description" rows="3" class="w-full border border-gray-300 rounded-lg px-3 py-2"></textarea>
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-1">Ground/Venue Name</label>
                  <input v-model="editable.groundName" type="text" class="w-full border border-gray-300 rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-1">Estimated Members</label>
                  <input v-model.number="editable.memberCount" type="number" min="1" class="w-full border border-gray-300 rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-1">Website/Social</label>
                  <input v-model="editable.website" type="url" class="w-full border border-gray-300 rounded-lg px-3 py-2" />
                </div>
                <div class="md:col-span-2">
                  <label class="block text-sm font-semibold text-gray-700 mb-1">Achievements/Notes</label>
                  <textarea v-model="editable.achievements" rows="2" class="w-full border border-gray-300 rounded-lg px-3 py-2"></textarea>
                </div>
              </div>
            </div>
          </div>

          <!-- Club Information -->
          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <div class="text-sm font-semibold text-gray-700 mb-1">Manager</div>
              <div class="text-gray-900">{{ clubData.managerName }}</div>
            </div>
            <div>
              <div class="text-sm font-semibold text-gray-700 mb-1">Contact</div>
              <div class="text-gray-900">{{ clubData.phone }}</div>
            </div>
            <div>
              <div class="text-sm font-semibold text-gray-700 mb-1">Email</div>
              <div class="text-gray-900">{{ clubData.email }}</div>
            </div>
            <div v-if="clubData.foundedYear">
              <div class="text-sm font-semibold text-gray-700 mb-1">Founded</div>
              <div class="text-gray-900">{{ clubData.foundedYear }}</div>
            </div>
            <div v-if="clubData.memberCount">
              <div class="text-sm font-semibold text-gray-700 mb-1">Members</div>
              <div class="text-gray-900">{{ clubData.memberCount }}</div>
            </div>
            <div v-if="clubData.groundName">
              <div class="text-sm font-semibold text-gray-700 mb-1">Ground</div>
              <div class="text-gray-900">{{ clubData.groundName }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- No Club Registered -->
      <div v-else class="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden mb-8">
        <div class="p-12 text-center">
          <div class="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg class="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M17 20h5v-2a4 4 0 0 0-3-3.87"/>
              <path d="M9 20H4v-2a4 4 0 0 1 3-3.87"/>
              <circle cx="7" cy="7" r="4"/>
              <circle cx="17" cy="7" r="4"/>
            </svg>
          </div>
          <h3 class="text-2xl font-bold text-gray-900 mb-4">No Club Registered</h3>
          <p class="text-gray-600 mb-8 max-w-md mx-auto">
            You haven't registered a cricket club yet. Register your club to join Kerala's premier cricket community and access all management features.
          </p>
          <RouterLink 
            to="/club-registration"
            class="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M12 4v16m8-8H4"/>
            </svg>
            Register Your Club
          </RouterLink>
        </div>
      </div>

      <!-- Management Features (Only for Approved Clubs) -->
      <div v-if="clubData && clubData.status === 'approved'" class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Player Management -->
        <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 cursor-pointer">
          <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M17 20h5v-2a4 4 0 0 0-3-3.87"/>
              <path d="M9 20H4v-2a4 4 0 0 1 3-3.87"/>
              <circle cx="7" cy="7" r="4"/>
              <circle cx="17" cy="7" r="4"/>
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">Player Management</h3>
          <p class="text-gray-600 mb-4">Manage your club members, track player statistics, and organize team rosters.</p>
          <div class="text-blue-600 font-semibold text-sm">Coming Soon</div>
        </div>

        <!-- Tournament Registration -->
        <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 cursor-pointer">
          <div class="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
            <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <path d="M16 2v4M8 2v4M3 10h18"/>
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">Tournament Registration</h3>
          <p class="text-gray-600 mb-4">Register your club for upcoming tournaments and competitions across Kerala.</p>
          <div class="text-blue-600 font-semibold text-sm">Coming Soon</div>
        </div>

        <!-- Match Scheduling -->
        <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 cursor-pointer">
          <div class="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
            <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6v6l4 2"/>
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">Match Scheduling</h3>
          <p class="text-gray-600 mb-4">Schedule practice matches, friendly games, and coordinate with other clubs.</p>
          <div class="text-blue-600 font-semibold text-sm">Coming Soon</div>
        </div>

        <!-- Club Statistics -->
        <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 cursor-pointer">
          <div class="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4">
            <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">Club Statistics</h3>
          <p class="text-gray-600 mb-4">View detailed statistics, performance metrics, and club achievements.</p>
          <div class="text-blue-600 font-semibold text-sm">Coming Soon</div>
        </div>

        <!-- Ground Booking -->
        <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 cursor-pointer">
          <div class="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mb-4">
            <svg class="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              <circle cx="12" cy="8" r="3"/>
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">Ground Booking</h3>
          <p class="text-gray-600 mb-4">Book cricket grounds and facilities for practice sessions and matches.</p>
          <div class="text-blue-600 font-semibold text-sm">Coming Soon</div>
        </div>

        <!-- Communication Hub -->
        <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 cursor-pointer">
          <div class="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
            <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">Communication Hub</h3>
          <p class="text-gray-600 mb-4">Connect with other clubs, send announcements, and manage club communications.</p>
          <div class="text-blue-600 font-semibold text-sm">Coming Soon</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../store/auth';
import axios from 'axios';

const auth = useAuthStore();
const clubData = ref(null);

async function loadClubData() {
  try {
    const API = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';
    const response = await axios.get(`${API}/clubs/my-club`);
    clubData.value = response.data.club;
  } catch (error) {
    console.error('Error loading club data:', error);
    // For demo purposes, load mock data if user email matches
    if (auth.user?.email === 'rajesh@kochicricket.com') {
      clubData.value = {
        id: 1,
        clubName: 'Kochi Cricket Club',
        district: 'Ernakulam',
        city: 'Kochi',
        foundedYear: 2015,
        managerName: 'Rajesh Kumar',
        phone: '+91 9876543210',
        email: 'rajesh@kochicricket.com',
        description: 'A passionate cricket club dedicated to promoting grassroots cricket in Kochi.',
        groundName: 'Kochi Cricket Stadium',
        memberCount: 45,
        website: 'https://kochicricket.com',
        status: 'approved',
        submittedAt: '2024-01-15T10:30:00Z'
      };
    }
  }
}

// Inline edit state
const isEditing = ref(false);
const editable = ref({});

function startEdit(){
  editable.value = { ...clubData.value, logoPreview: '' };
  isEditing.value = true;
}
function cancelEdit(){
  isEditing.value = false;
  editable.value = {};
}

async function onEditLogoSelected(event){
  const file = event.target.files?.[0];
  if (!file) return;
  if (file.size > 1.5 * 1024 * 1024) { alert('Logo too large. Use < 1.5MB'); return; }
  editable.value.logoPreview = URL.createObjectURL(file);
  // Minimal: convert to data URL. Replace with real upload later.
  const reader = new FileReader();
  const dataUrl = await new Promise((resolve, reject) => {
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
  editable.value.logoUrl = String(dataUrl);
}

async function saveEdit(){
  try {
    const API = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';

    const payload = {
      clubName: editable.value.clubName,
      district: editable.value.district,
      city: editable.value.city,
      foundedYear: editable.value.foundedYear,
      phone: editable.value.phone,
      email: editable.value.email,
      description: editable.value.description,
      groundName: editable.value.groundName,
      memberCount: editable.value.memberCount,
      website: editable.value.website,
      achievements: editable.value.achievements,
      logoUrl: editable.value.logoUrl,
    };

    await axios.put(`${API}/clubs/my-club`, payload);
    alert('Club updated. It will be re-reviewed by admin.');
    isEditing.value = false;
    await loadClubData();
  } catch (e) {
    console.error('Failed to update club', e);
    alert(e.response?.data?.message || 'Failed to update club.');
  }
}

onMounted(() => {
  loadClubData();
});
</script>