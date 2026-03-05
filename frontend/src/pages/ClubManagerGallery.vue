<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h2 class="text-2xl font-bold text-slate-900">Club Gallery</h2>
        <p class="text-slate-600 text-sm mt-1">Manage photos for your club's public gallery</p>
      </div>
      <button @click="showUploadModal = true" 
        class="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl text-sm">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
        </svg>
        Upload Photo
      </button>
    </div>

    <!-- Tabs -->
    <div class="flex gap-1 bg-slate-100 rounded-xl p-1">
      <button v-for="tab in tabs" :key="tab.key"
        @click="activeTab = tab.key"
        :class="[
          'flex-1 py-2.5 px-4 rounded-lg font-semibold text-sm transition-all duration-200',
          activeTab === tab.key 
            ? 'bg-white text-blue-600 shadow-sm' 
            : 'text-slate-500 hover:text-slate-700'
        ]">
        {{ tab.label }}
        <span v-if="tab.key === 'pending' && pendingItems.length > 0"
          class="ml-1.5 inline-flex items-center justify-center w-5 h-5 text-xs font-bold bg-red-500 text-white rounded-full">
          {{ pendingItems.length }}
        </span>
      </button>
    </div>

    <!-- Gallery Tab -->
    <div v-if="activeTab === 'gallery'">
      <!-- Category Filter -->
      <div class="flex flex-wrap gap-2 mb-6">
        <button v-for="cat in categories" :key="cat.value"
          @click="filterCategory = cat.value"
          :class="[
            'px-3 py-1.5 rounded-full text-xs font-semibold transition-all border',
            filterCategory === cat.value
              ? 'bg-blue-500 text-white border-blue-500'
              : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
          ]">
          {{ cat.label }}
        </button>
      </div>

      <div v-if="loading" class="text-center py-16">
        <div class="inline-block w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p class="text-slate-500 mt-3">Loading gallery...</p>
      </div>

      <div v-else-if="filteredGalleryItems.length === 0" class="text-center py-16 bg-slate-50 rounded-2xl border border-slate-200">
        <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
          <svg class="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-slate-700 mb-1">No photos yet</h3>
        <p class="text-slate-500 text-sm mb-4">Upload your first photo to start building your gallery</p>
        <button @click="showUploadModal = true" class="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-semibold hover:bg-blue-600 transition-colors">
          Upload Photo
        </button>
      </div>

      <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div v-for="item in filteredGalleryItems" :key="item.id"
          class="group relative bg-white rounded-xl overflow-hidden border border-slate-200 hover:shadow-lg transition-all duration-300">
          <div class="aspect-square overflow-hidden bg-slate-100">
            <img :src="getImageUrl(item.imageUrl)" :alt="item.caption || 'Gallery photo'" 
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              @error="e => e.target.style.display='none'"/>
          </div>
          
          <!-- Overlay Controls -->
          <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div class="absolute bottom-0 left-0 right-0 p-3">
              <p v-if="item.caption" class="text-white text-xs font-medium truncate mb-2">{{ item.caption }}</p>
              <div class="flex items-center gap-1.5">
                <button @click="toggleFeatured(item)" :title="item.isFeatured ? 'Unfeature' : 'Feature'"
                  :class="['p-1.5 rounded-lg transition-colors', item.isFeatured ? 'bg-yellow-500 text-white' : 'bg-white/20 text-white hover:bg-white/30']">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </button>
                <button @click="confirmDelete(item)" class="p-1.5 rounded-lg bg-white/20 text-white hover:bg-red-500 transition-colors">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Featured Badge -->
          <div v-if="item.isFeatured" class="absolute top-2 right-2 px-2 py-1 bg-yellow-500 text-white text-[10px] font-bold rounded-full uppercase tracking-wide shadow">
            ★ Featured
          </div>

          <!-- Category Badge -->
          <div class="absolute top-2 left-2">
            <span class="px-2 py-0.5 bg-black/40 backdrop-blur-sm text-white text-[10px] font-semibold rounded-full capitalize">
              {{ item.category }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Pending Moderation Tab -->
    <div v-if="activeTab === 'pending'">
      <div v-if="loadingPending" class="text-center py-16">
        <div class="inline-block w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p class="text-slate-500 mt-3">Loading pending photos...</p>
      </div>

      <div v-else-if="pendingItems.length === 0" class="text-center py-16 bg-slate-50 rounded-2xl border border-slate-200">
        <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
          <svg class="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-slate-700 mb-1">All caught up!</h3>
        <p class="text-slate-500 text-sm">No photos pending for review</p>
      </div>

      <div v-else class="space-y-4">
        <div v-for="item in pendingItems" :key="item.id"
          class="flex gap-4 bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow">
          <div class="w-28 h-28 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
            <img :src="getImageUrl(item.imageUrl)" :alt="item.caption" class="w-full h-full object-cover"/>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <span class="text-xs font-semibold px-2 py-0.5 rounded-full capitalize"
                :class="item.uploaderRole === 'player' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'">
                {{ item.uploaderRole }}
              </span>
              <span class="text-xs text-slate-400 capitalize">{{ item.category }}</span>
            </div>
            <p class="text-sm font-semibold text-slate-800 mb-0.5">{{ item.uploadedBy }}</p>
            <p v-if="item.caption" class="text-sm text-slate-600 truncate">{{ item.caption }}</p>
            <p class="text-xs text-slate-400 mt-1">{{ formatDate(item.createdAt) }}</p>
          </div>
          <div class="flex flex-col gap-2 flex-shrink-0">
            <button @click="moderateItem(item.id, 'approve')" :disabled="moderating"
              class="px-4 py-2 bg-green-500 text-white text-sm font-semibold rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50">
              Approve
            </button>
            <button @click="moderateItem(item.id, 'reject')" :disabled="moderating"
              class="px-4 py-2 bg-red-500 text-white text-sm font-semibold rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50">
              Reject
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Upload Modal -->
    <Transition name="fade">
      <div v-if="showUploadModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" @click.self="closeUploadModal">
        <div class="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
          <!-- Modal Header -->
          <div class="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-5">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-bold text-white">Upload Photo</h3>
              <button @click="closeUploadModal" class="p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
          </div>
          
          <!-- Modal Body -->
          <div class="p-6 space-y-5">
            <!-- Image Upload Area -->
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-2">Photo</label>
              <div v-if="!uploadPreview"
                class="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all"
                @click="$refs.fileInput.click()"
                @dragover.prevent="dragover = true"
                @dragleave="dragover = false"
                @drop.prevent="handleDrop">
                <svg class="w-10 h-10 mx-auto text-slate-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                <p class="text-sm text-slate-600 font-medium">Click or drag & drop to upload</p>
                <p class="text-xs text-slate-400 mt-1">JPEG, PNG, WebP (max 5MB)</p>
              </div>
              <div v-else class="relative">
                <img :src="uploadPreview" class="w-full h-48 object-cover rounded-xl"/>
                <button @click="clearUpload" class="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>
              <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="handleFileSelect"/>
            </div>

            <!-- Caption -->
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-2">Caption <span class="text-slate-400 font-normal">(optional)</span></label>
              <input v-model="uploadCaption" type="text" maxlength="200" placeholder="Describe this photo..."
                class="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"/>
            </div>

            <!-- Category -->
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-2">Category</label>
              <select v-model="uploadCategory"
                class="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white">
                <option value="team">Team</option>
                <option value="match">Match</option>
                <option value="training">Training</option>
                <option value="trophy">Trophy</option>
                <option value="event">Event</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="px-6 py-4 bg-slate-50 border-t border-slate-200 flex gap-3">
            <button @click="closeUploadModal" class="flex-1 px-4 py-2.5 border border-slate-300 rounded-xl text-slate-700 font-semibold text-sm hover:bg-slate-100 transition-colors">
              Cancel
            </button>
            <button @click="handleUpload" :disabled="!uploadFile || uploading"
              class="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold text-sm hover:from-blue-600 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              <svg v-if="uploading" class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4"/>
              </svg>
              {{ uploading ? 'Uploading...' : 'Upload Photo' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Delete Confirmation Modal -->
    <Transition name="fade">
      <div v-if="deleteTarget" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" @click.self="deleteTarget = null">
        <div class="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center">
          <div class="w-14 h-14 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <svg class="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
          </div>
          <h3 class="text-lg font-bold text-slate-900 mb-2">Delete Photo?</h3>
          <p class="text-sm text-slate-500 mb-6">This action cannot be undone.</p>
          <div class="flex gap-3">
            <button @click="deleteTarget = null" class="flex-1 px-4 py-2.5 border border-slate-300 rounded-xl text-slate-700 font-semibold text-sm hover:bg-slate-100 transition-colors">Cancel</button>
            <button @click="deleteItem" :disabled="deleting" class="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl font-semibold text-sm hover:bg-red-600 transition-colors disabled:opacity-50">
              {{ deleting ? 'Deleting...' : 'Delete' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import api from '../utils/api.js';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';
const API_URL = API_BASE.replace(/\/api\/?$/, '');  // server origin without /api

const activeTab = ref('gallery');
const tabs = [
  { key: 'gallery', label: 'Gallery' },
  { key: 'pending', label: 'Pending Review' }
];

const categories = [
  { value: 'all', label: 'All' },
  { value: 'team', label: 'Team' },
  { value: 'match', label: 'Match' },
  { value: 'training', label: 'Training' },
  { value: 'trophy', label: 'Trophy' },
  { value: 'event', label: 'Event' },
  { value: 'other', label: 'Other' }
];

const loading = ref(false);
const loadingPending = ref(false);
const galleryItems = ref([]);
const pendingItems = ref([]);
const filterCategory = ref('all');
const clubId = ref(null);

// Upload state
const showUploadModal = ref(false);
const uploadFile = ref(null);
const uploadPreview = ref(null);
const uploadCaption = ref('');
const uploadCategory = ref('team');
const uploading = ref(false);
const dragover = ref(false);

// Moderation/delete state
const moderating = ref(false);
const deleteTarget = ref(null);
const deleting = ref(false);

const filteredGalleryItems = computed(() => {
  if (filterCategory.value === 'all') return galleryItems.value;
  return galleryItems.value.filter(i => i.category === filterCategory.value);
});

function getImageUrl(path) {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${API_URL}${path}`;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
}

async function loadClub() {
  try {
    const { data } = await api.get('/clubs/my-club');
    clubId.value = data.club?._id || data.club?.id;
  } catch (e) {
    console.error('Failed to load club:', e);
  }
}

async function loadGallery() {
  if (!clubId.value) return;
  loading.value = true;
  try {
    const { data } = await api.get(`/gallery/club/${clubId.value}?limit=100`);
    galleryItems.value = data.items || [];
  } catch (e) {
    console.error('Failed to load gallery:', e);
  } finally {
    loading.value = false;
  }
}

async function loadPending() {
  if (!clubId.value) return;
  loadingPending.value = true;
  try {
    const { data } = await api.get(`/gallery/club/${clubId.value}/pending`);
    pendingItems.value = data.items || [];
  } catch (e) {
    console.error('Failed to load pending:', e);
  } finally {
    loadingPending.value = false;
  }
}

function handleFileSelect(e) {
  const file = e.target.files?.[0];
  if (file) setUploadFile(file);
}

function handleDrop(e) {
  dragover.value = false;
  const file = e.dataTransfer.files?.[0];
  if (file && file.type.startsWith('image/')) setUploadFile(file);
}

function setUploadFile(file) {
  if (file.size > 5 * 1024 * 1024) {
    alert('File size must be under 5MB');
    return;
  }
  uploadFile.value = file;
  uploadPreview.value = URL.createObjectURL(file);
}

function clearUpload() {
  uploadFile.value = null;
  if (uploadPreview.value) URL.revokeObjectURL(uploadPreview.value);
  uploadPreview.value = null;
}

function closeUploadModal() {
  showUploadModal.value = false;
  clearUpload();
  uploadCaption.value = '';
  uploadCategory.value = 'team';
}

async function handleUpload() {
  if (!uploadFile.value || !clubId.value) return;
  uploading.value = true;
  try {
    const formData = new FormData();
    formData.append('image', uploadFile.value);
    formData.append('clubId', clubId.value);
    formData.append('caption', uploadCaption.value.trim());
    formData.append('category', uploadCategory.value);

    await api.post('/gallery/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    closeUploadModal();
    await loadGallery();
    alert('Photo uploaded successfully!');
  } catch (e) {
    console.error('Upload error:', e);
    alert(e.response?.data?.message || 'Upload failed. Please try again.');
  } finally {
    uploading.value = false;
  }
}

async function toggleFeatured(item) {
  try {
    const { data } = await api.put(`/gallery/${item.id}/feature`);
    item.isFeatured = data.isFeatured;
  } catch (e) {
    console.error('Feature toggle error:', e);
    alert('Failed to update featured status');
  }
}

function confirmDelete(item) {
  deleteTarget.value = item;
}

async function deleteItem() {
  if (!deleteTarget.value) return;
  deleting.value = true;
  try {
    await api.delete(`/gallery/${deleteTarget.value.id}`);
    galleryItems.value = galleryItems.value.filter(i => i.id !== deleteTarget.value.id);
    deleteTarget.value = null;
  } catch (e) {
    console.error('Delete error:', e);
    alert('Failed to delete photo');
  } finally {
    deleting.value = false;
  }
}

async function moderateItem(itemId, action) {
  moderating.value = true;
  try {
    await api.put(`/gallery/${itemId}/moderate`, { action });
    pendingItems.value = pendingItems.value.filter(i => i.id !== itemId);
    if (action === 'approve') await loadGallery();
  } catch (e) {
    console.error('Moderation error:', e);
    alert('Action failed. Please try again.');
  } finally {
    moderating.value = false;
  }
}

watch(activeTab, (tab) => {
  if (tab === 'pending') loadPending();
});

onMounted(async () => {
  await loadClub();
  loadGallery();
  loadPending();
});
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
