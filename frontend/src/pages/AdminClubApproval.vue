<template>
  <div class="max-w-6xl mx-auto px-4 py-8">
    <button @click="goBack" class="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800">
      <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6" stroke-linecap="round" stroke-linejoin="round"/></svg>
      Back to Admin
    </button>

    <div v-if="loading" class="py-24 text-center text-gray-500">Loading registration…</div>
    <div v-else-if="error" class="py-24 text-center text-red-600">{{ error }}</div>
    <div v-else-if="!club" class="py-24 text-center text-gray-500">Club not found.</div>

    <div v-else class="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <!-- Header / Banner -->
      <div class="relative h-40 bg-gradient-to-r from-red-600 to-rose-600">
        <img :src="resolvedLogoUrl" alt="logo" class="absolute -bottom-8 left-6 w-20 h-20 rounded-full border-4 border-white object-cover" @error="e => (e.target.style.display='none')" />
      </div>

      <div class="pt-12 px-6 pb-6">
        <!-- Title and status -->
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 class="text-3xl font-extrabold text-gray-900">{{ club.clubName || club.name }}</h1>
            <div class="text-gray-600">{{ club.city }}<span v-if="club.city && club.district">, </span>{{ club.district }}</div>
          </div>
          <div class="flex items-center gap-3">
            <span :class="statusChipClass" class="px-3 py-1 rounded-full text-xs font-semibold">{{ club.status?.toUpperCase() }}</span>
            <div class="text-sm text-gray-500">
              <div>Submitted</div>
              <div class="font-semibold">{{ formatDate(club.submittedAt) }}</div>
            </div>
          </div>
        </div>

        <!-- Details grid -->
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div>
            <div class="text-sm font-semibold text-gray-700 mb-1">Manager</div>
            <div class="text-gray-900">{{ club.managerName }}</div>
          </div>
          <div v-if="club.foundedYear">
            <div class="text-sm font-semibold text-gray-700 mb-1">Founded</div>
            <div class="text-gray-900">{{ club.foundedYear }}</div>
          </div>
          <div v-if="club.memberCount">
            <div class="text-sm font-semibold text-gray-700 mb-1">Members</div>
            <div class="text-gray-900">{{ club.memberCount }}</div>
          </div>
          <div v-if="club.groundName">
            <div class="text-sm font-semibold text-gray-700 mb-1">Ground</div>
            <div class="text-gray-900">{{ club.groundName }}</div>
          </div>
          <div>
            <div class="text-sm font-semibold text-gray-700 mb-1">Email</div>
            <div class="text-gray-900">{{ club.email || '—' }}</div>
          </div>
          <div>
            <div class="text-sm font-semibold text-gray-700 mb-1">Phone</div>
            <div class="text-gray-900">{{ club.phone || '—' }}</div>
          </div>
          <div v-if="club.website">
            <div class="text-sm font-semibold text-gray-700 mb-1">Website</div>
            <a :href="club.website" target="_blank" class="text-blue-600 hover:underline break-all">{{ club.website }}</a>
          </div>
        </div>

        <!-- Edit Reason (if provided) -->
        <div v-if="club.editReason" class="mb-6">
          <div class="text-sm font-semibold text-gray-700 mb-2">Reason for edit</div>
          <div class="text-gray-900 bg-yellow-50 border border-yellow-200 rounded-xl p-4 whitespace-pre-line">{{ club.editReason }}</div>
        </div>

        <!-- Description -->
        <div v-if="club.description" class="mb-6">
          <div class="text-sm font-semibold text-gray-700 mb-2">Description</div>
          <div class="text-gray-900 bg-gray-50 rounded-xl p-4 whitespace-pre-line">{{ club.description }}</div>
        </div>

        <!-- Achievements -->
        <div v-if="club.achievements" class="mb-6">
          <div class="text-sm font-semibold text-gray-700 mb-2">Achievements</div>
          <div class="text-gray-900 bg-gray-50 rounded-xl p-4 whitespace-pre-line">{{ club.achievements }}</div>
        </div>

        <!-- Proof document -->
        <div class="mb-8">
          <div class="text-sm font-semibold text-gray-700 mb-2">Submitted Proof</div>
          <div class="flex items-center gap-3">
            <a v-if="proofUrl" :href="proofUrl" target="_blank" class="inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 5v14m7-7H5"/></svg>
              View Proof
            </a>
            <span v-else class="text-gray-500 text-sm">No proof uploaded</span>
          </div>
        </div>

        <!-- Decision Actions -->
        <div class="flex flex-col md:flex-row gap-4 pt-6 border-t">
          <button
            v-if="club.status === 'pending'"
            @click="approveClub"
            :disabled="processing"
            class="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="processing">Processing…</span>
            <span v-else class="flex items-center justify-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4"/></svg>
              Approve
            </span>
          </button>
          <button
            v-if="club.status === 'pending'"
            @click="rejectClub"
            :disabled="processing"
            class="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="processing">Processing…</span>
            <span v-else class="flex items-center justify-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
              Reject
            </span>
          </button>

          <div v-else class="flex-1 text-center py-3 px-6 rounded-xl font-semibold"
               :class="club.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
            {{ club.status === 'approved' ? '✅ Approved' : '❌ Rejected' }}
            <span v-if="club.processedAt" class="block text-sm mt-1 opacity-75">on {{ formatDate(club.processedAt) }}</span>
            <span v-if="club.status === 'rejected' && club.rejectionReason" class="block text-xs mt-1 opacity-75">Reason: {{ club.rejectionReason }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const router = useRouter();
const API = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';

const loading = ref(true);
const error = ref('');
const processing = ref(false);
const club = ref(null);

const resolvedLogoUrl = computed(() => {
  if (!club.value) return '';
  const id = club.value.id;
  return club.value.logoUrl || (id ? `${API}/clubs/${id}/logo` : '');
});

const proofUrl = computed(() => {
  if (!club.value) return '';
  const id = club.value.id;
  return club.value.proofUrl || (id ? `${API}/clubs/${id}/proof` : '');
});

const statusChipClass = computed(() => {
  const s = club.value?.status;
  if (s === 'approved') return 'bg-green-100 text-green-800';
  if (s === 'rejected') return 'bg-red-100 text-red-800';
  return 'bg-yellow-100 text-yellow-800';
});

function formatDate(dateString) {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
}

async function loadClub() {
  loading.value = true;
  error.value = '';
  try {
    // Use admin list API and pick the target club by id
    const { data } = await axios.get(`${API}/admin/clubs`);
    const list = data?.clubs || [];
    const found = list.find(c => String(c.id) === String(route.params.id));
    club.value = found || null;
    if (!found) error.value = 'Club not found';
  } catch (e) {
    console.error('Error loading club details:', e);
    error.value = e?.response?.data?.message || e.message || 'Failed to load club details';
  } finally {
    loading.value = false;
  }
}

async function approveClub() {
  if (!club.value) return;
  processing.value = true;
  try {
    await axios.put(`${API}/admin/clubs/${club.value.id}/approve`);
    club.value.status = 'approved';
    club.value.processedAt = new Date().toISOString();
    alert('Club approved successfully');
  } catch (e) {
    console.error('Approve failed:', e);
    alert(e?.response?.data?.message || 'Failed to approve club');
  } finally {
    processing.value = false;
  }
}

async function rejectClub() {
  if (!club.value) return;
  const reason = prompt('Please provide a reason for rejection (optional):');
  processing.value = true;
  try {
    await axios.put(`${API}/admin/clubs/${club.value.id}/reject`, { reason });
    club.value.status = 'rejected';
    club.value.rejectionReason = reason || 'No reason provided';
    club.value.processedAt = new Date().toISOString();
    alert('Club rejected');
  } catch (e) {
    console.error('Reject failed:', e);
    alert(e?.response?.data?.message || 'Failed to reject club');
  } finally {
    processing.value = false;
  }
}

function goBack() {
  if (window.history.length > 1) router.back();
  else router.push({ name: 'admin' });
}

onMounted(loadClub);
</script>