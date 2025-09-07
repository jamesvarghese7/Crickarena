<template>
  <div class="min-h-screen bg-gradient-to-br from-red-50 to-rose-100 p-4 md:p-8">
    <div class="max-w-6xl mx-auto">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl md:text-3xl font-bold text-red-700">Tournament Management</h1>
        <button @click="openCreate = true"
                class="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700">
          <span>Create Tournament</span>
        </button>
      </div>

      <!-- Filters -->
      <div class="mb-4 flex flex-wrap items-center gap-2">
        <button v-for="f in filters" :key="f.key" @click="activeFilter = f.key; fetchTournaments()"
                class="px-3 py-1.5 rounded border text-sm"
                :class="activeFilter === f.key ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-700 hover:bg-gray-50'">
          {{ f.label }}
        </button>
      </div>

      <!-- List -->
      <div v-if="loading" class="text-gray-500">Loading tournaments...</div>
      <div v-else class="grid md:grid-cols-2 gap-4">
        <div v-for="t in tournaments" :key="t._id" class="bg-white rounded-lg shadow border p-4">
          <div class="flex items-start justify-between">
            <div>
              <div class="text-lg font-semibold text-gray-800">{{ t.name }}</div>
              <div class="text-xs text-gray-500">{{ t.format }} • {{ fmtDate(t.startDate) }} - {{ fmtDate(t.endDate) }}</div>
              <div class="mt-1"><span class="inline-flex items-center px-2 py-0.5 rounded text-xs"
                                      :class="statusClass(t.status)">{{ t.status }}</span></div>
            </div>
            <div class="flex items-center gap-2">
              <button @click="onEdit(t)" class="px-2 py-1 text-sm rounded border hover:bg-gray-50">Edit</button>
              <button @click="onCancel(t)" class="px-2 py-1 text-sm rounded border text-red-600 hover:bg-red-50">Cancel</button>
              <button @click="viewRegistrations(t)" class="px-2 py-1 text-sm rounded border hover:bg-gray-50">Registrations</button>
            </div>
          </div>
          <div class="mt-2 text-sm text-gray-700 line-clamp-2" v-if="t.description">{{ t.description }}</div>
          <div class="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-600">
            <div>District: <span class="font-medium">{{ t.district || '-' }}</span></div>
            <div>Max Teams: <span class="font-medium">{{ t.maxTeams }}</span></div>
            <div>Reg. Deadline: <span class="font-medium">{{ t.registrationDeadline ? fmtDate(t.registrationDeadline) : '-' }}</span></div>
          </div>
        </div>
      </div>

      <!-- Create/Edit Dialog -->
      <div v-if="openCreate || editing" class="fixed inset-0 bg-black/30 flex items-center justify-center p-4">
        <div class="bg-white w-full max-w-2xl rounded-lg shadow-lg">
          <div class="px-4 py-3 border-b flex items-center justify-between">
            <h2 class="font-semibold text-gray-800">{{ editing ? 'Edit Tournament' : 'Create Tournament' }}</h2>
            <button class="text-gray-500" @click="closeDialog">✕</button>
          </div>
          <form class="p-4 space-y-4" @submit.prevent="saveTournament">
            <div class="grid md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium">Tournament Name</label>
                <input v-model="form.name" type="text" required class="mt-1 w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label class="block text-sm font-medium">Tournament Type</label>
                <select v-model="form.format" class="mt-1 w-full border rounded px-3 py-2">
                  <option value="knockout">Knockout</option>
                  <option value="league">League</option>
                  <option value="league+playoff">League+Playoff</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium">District</label>
                <select v-model="form.district" class="mt-1 w-full border rounded px-3 py-2">
                  <option v-for="d in districts" :key="d" :value="d">{{ d }}</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium">Max Teams Allowed</label>
                <input v-model.number="form.maxTeams" type="number" min="2" class="mt-1 w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label class="block text-sm font-medium">Start Date</label>
                <input v-model="form.startDate" type="date" required class="mt-1 w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label class="block text-sm font-medium">End Date</label>
                <input v-model="form.endDate" type="date" required class="mt-1 w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label class="block text-sm font-medium">Registration Deadline</label>
                <input v-model="form.registrationDeadline" type="date" class="mt-1 w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label class="block text-sm font-medium">Grounds/Venues (comma separated)</label>
                <input v-model="venuesText" type="text" placeholder="Ground A, Ground B" class="mt-1 w-full border rounded px-3 py-2" />
              </div>
              <div class="md:col-span-2">
                <label class="block text-sm font-medium">Description/Rules</label>
                <textarea v-model="form.description" rows="3" class="mt-1 w-full border rounded px-3 py-2"></textarea>
              </div>
              <div class="md:col-span-2">
                <label class="block text-sm font-medium">Upload Banner/Logo (URL for now)</label>
                <input v-model="form.bannerUrl" type="url" placeholder="https://..." class="mt-1 w-full border rounded px-3 py-2" />
              </div>
            </div>
            <div v-if="errorMsg" class="text-sm text-red-600">{{ errorMsg }}</div>
            <div class="flex items-center justify-end gap-2 pt-2">
              <button type="button" @click="closeDialog" class="px-4 py-2 rounded border">Cancel</button>
              <button type="submit" class="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700">Save</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Registrations Drawer -->
      <div v-if="showRegs" class="fixed inset-0 bg-black/30 flex items-center justify-center p-4">
        <div class="bg-white w-full max-w-2xl rounded-lg shadow-lg">
          <div class="px-4 py-3 border-b flex items-center justify-between">
            <h2 class="font-semibold">Registrations - {{ current?.name }}</h2>
            <button class="text-gray-500" @click="showRegs = false">✕</button>
          </div>
          <div class="p-4">
            <div v-if="regsLoading" class="text-gray-500">Loading...</div>
            <div v-else-if="registrations.length === 0" class="text-sm text-gray-600">No registrations yet.</div>
            <ul v-else class="space-y-2">
              <li v-for="r in registrations" :key="r._id" class="flex items-center justify-between border rounded p-2">
                <div>
                  <div class="font-medium">{{ r.club?.clubName || 'Club' }}</div>
                  <div class="text-xs text-gray-500">{{ r.club?.district }}</div>
                </div>
                <div class="flex items-center gap-2">
                  <span class="px-2 py-0.5 text-xs rounded border" :class="statusClass(r.status)">{{ r.status }}</span>
                  <button @click="updateReg(r, 'approve')" class="px-2 py-1 text-xs rounded border bg-green-50 text-green-700">Approve</button>
                  <button @click="updateReg(r, 'reject')" class="px-2 py-1 text-xs rounded border bg-red-50 text-red-700">Reject</button>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import api from '../utils/api';

const openCreate = ref(false);
const editing = ref(false);
const activeFilter = ref('');
const tournaments = ref([]);
const loading = ref(false);

const current = ref(null);
const showRegs = ref(false);
const registrations = ref([]);
const regsLoading = ref(false);

const errorMsg = ref('');

const filters = [
  { key: '', label: 'All' },
  { key: 'open', label: 'Open' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'ongoing', label: 'Ongoing' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

const districts = [
  'Thiruvananthapuram','Kollam','Pathanamthitta','Alappuzha','Kottayam','Idukki','Ernakulam','Thrissur','Palakkad','Malappuram','Kozhikode','Wayanad','Kannur','Kasaragod'
];

const form = reactive({
  name: '', format: 'league', district: districts[0], maxTeams: 16,
  startDate: '', endDate: '', registrationDeadline: '', description: '', bannerUrl: '', venues: []
});
const venuesText = ref('');

function fmtDate(d){
  return new Date(d).toLocaleDateString();
}
function statusClass(status){
  return status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-200' :
         status === 'open' ? 'bg-rose-50 text-rose-700 border-rose-200' :
         status === 'ongoing' ? 'bg-orange-50 text-orange-700 border-orange-200' :
         status === 'completed' ? 'bg-green-50 text-green-700 border-green-200' :
         'bg-gray-50 text-gray-700 border-gray-200';
}

async function fetchTournaments(){
  loading.value = true; errorMsg.value = '';
  try{
    const { data } = await api.get('/admin/tournaments', { params: { status: activeFilter.value || undefined } });
    tournaments.value = data;
  } catch (e) {
    errorMsg.value = e?.response?.data?.message || e.message || 'Failed to load tournaments';
  } finally { loading.value = false; }
}

function closeDialog(){
  openCreate.value = false; editing.value = false; current.value = null; errorMsg.value = '';
  Object.assign(form, { name: '', format: 'league', district: districts[0], maxTeams: 16,
    startDate: '', endDate: '', registrationDeadline: '', description: '', bannerUrl: '', venues: [] });
  venuesText.value = '';
}

function onEdit(t){
  editing.value = true; openCreate.value = true; current.value = t; errorMsg.value = '';
  Object.assign(form, {
    name: t.name, format: t.format, district: t.district, maxTeams: t.maxTeams,
    startDate: t.startDate?.slice(0,10), endDate: t.endDate?.slice(0,10),
    registrationDeadline: t.registrationDeadline ? t.registrationDeadline.slice(0,10) : '',
    description: t.description, bannerUrl: t.bannerUrl || '', venues: t.venues || []
  });
  venuesText.value = (t.venues || []).join(', ');
}

function isValidDateStr(v){ return /^\d{4}-\d{2}-\d{2}$/.test(v); }

async function saveTournament(){
  errorMsg.value = '';
  // Basic validation matching backend required fields
  if (!form.name?.trim()) { errorMsg.value = 'Name is required'; return; }
  if (!isValidDateStr(form.startDate) || !isValidDateStr(form.endDate)) { errorMsg.value = 'Start and End dates are required (YYYY-MM-DD)'; return; }
  if (new Date(form.endDate) < new Date(form.startDate)) { errorMsg.value = 'End date cannot be before start date'; return; }

  const payload = { ...form, venues: venuesText.value.split(',').map(s=>s.trim()).filter(Boolean) };
  try {
    if (editing.value && current.value){
      await api.put(`/admin/tournaments/${current.value._id}`, payload);
    } else {
      await api.post('/admin/tournaments', payload);
    }
    closeDialog();
    await fetchTournaments();
  } catch (e) {
    errorMsg.value = e?.response?.data?.message || e.message || 'Failed to save tournament';
  }
}

async function onCancel(t){
  if (!confirm('Cancel this tournament?')) return;
  await api.put(`/admin/tournaments/${t._id}/cancel`);
  await fetchTournaments();
}

async function viewRegistrations(t){
  current.value = t; showRegs.value = true; regsLoading.value = true;
  try{
    const { data } = await api.get(`/admin/tournaments/${t._id}/registrations`);
    registrations.value = data;
  } finally { regsLoading.value = false; }
}

async function updateReg(r, action){
  await api.put(`/admin/tournaments/${current.value._id}/registrations/${r._id}/${action}`);
  await viewRegistrations(current.value);
}

onMounted(fetchTournaments);
</script>

<style scoped>
.line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
</style>