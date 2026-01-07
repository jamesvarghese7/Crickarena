<template>
  <div class="sponsor-profile">
    <!-- Profile Header -->
    <div class="profile-header">
      <div class="logo-section">
        <div class="logo-container" @click="triggerLogoUpload">
          <img v-if="profile.logoUrl" :src="getLogoUrl(profile.logoUrl)" :alt="profile.companyName" />
          <div v-else class="logo-placeholder">
            {{ profile.companyName?.charAt(0) || 'S' }}
          </div>
          <div class="logo-overlay">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            <span>Change Logo</span>
          </div>
          <input ref="logoInput" type="file" accept="image/*" @change="handleLogoUpload" hidden />
        </div>
        <div class="company-info">
          <h1>{{ profile.companyName }}</h1>
          <span :class="['status-badge', profile.status]">{{ profile.status }}</span>
        </div>
      </div>
      <button v-if="!isEditing" class="edit-btn" @click="startEditing">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
        </svg>
        Edit Profile
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <span>Loading profile...</span>
    </div>

    <!-- Profile Content -->
    <div v-else class="profile-content">
      <!-- View Mode -->
      <template v-if="!isEditing">
        <div class="profile-grid">
          <!-- Company Information -->
          <div class="info-card">
            <h3>Company Information</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Industry</span>
                <span class="info-value">{{ formatIndustry(profile.industry) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Website</span>
                <a v-if="profile.website" :href="profile.website" target="_blank" class="info-link">
                  {{ profile.website }}
                </a>
                <span v-else class="info-value muted">Not provided</span>
              </div>
              <div class="info-item full-width" v-if="profile.description">
                <span class="info-label">Description</span>
                <span class="info-value">{{ profile.description }}</span>
              </div>
            </div>
          </div>

          <!-- Contact Information -->
          <div class="info-card">
            <h3>Contact Information</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Contact Person</span>
                <span class="info-value">{{ profile.contactPerson }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Email</span>
                <span class="info-value">{{ profile.contactEmail }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Phone</span>
                <span class="info-value">{{ profile.contactPhone || 'Not provided' }}</span>
              </div>
              <div class="info-item full-width" v-if="profile.address">
                <span class="info-label">Address</span>
                <span class="info-value">
                  {{ [profile.address.street, profile.address.city, profile.address.district].filter(Boolean).join(', ') }}
                </span>
              </div>
            </div>
          </div>

          <!-- Sponsorship Preferences -->
          <div class="info-card">
            <h3>Sponsorship Preferences</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Budget Range</span>
                <span class="info-value">
                  ₹{{ formatAmount(profile.budget?.min) }} - ₹{{ formatAmount(profile.budget?.max) }}
                </span>
              </div>
              <div class="info-item full-width" v-if="profile.preferredTypes?.length">
                <span class="info-label">Preferred Types</span>
                <div class="chips">
                  <span v-for="type in profile.preferredTypes" :key="type" class="chip">
                    {{ formatType(type) }}
                  </span>
                </div>
              </div>
              <div class="info-item full-width" v-if="profile.preferredDistricts?.length">
                <span class="info-label">Preferred Districts</span>
                <div class="chips">
                  <span v-for="district in profile.preferredDistricts" :key="district" class="chip">
                    {{ district }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Statistics -->
          <div class="info-card">
            <h3>Statistics</h3>
            <div class="stats-grid">
              <div class="stat-item">
                <span class="stat-value">{{ profile.analytics?.totalDeals || 0 }}</span>
                <span class="stat-label">Total Deals</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ profile.analytics?.activeDeals || 0 }}</span>
                <span class="stat-label">Active</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">₹{{ formatAmount(profile.analytics?.totalSpent || 0) }}</span>
                <span class="stat-label">Total Spent</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ formatNumber(profile.analytics?.totalImpressions || 0) }}</span>
                <span class="stat-label">Impressions</span>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- Edit Mode -->
      <template v-else>
        <form @submit.prevent="saveProfile" class="edit-form">
          <div class="form-grid">
            <!-- Company Information -->
            <div class="form-section">
              <h3>Company Information</h3>
              <div class="form-row">
                <div class="form-group">
                  <label>Company Name *</label>
                  <input v-model="editForm.companyName" type="text" required class="form-input" />
                </div>
                <div class="form-group">
                  <label>Industry *</label>
                  <select v-model="editForm.industry" class="form-input" required>
                    <option value="">Select industry</option>
                    <option v-for="ind in industries" :key="ind.value" :value="ind.value">
                      {{ ind.label }}
                    </option>
                  </select>
                </div>
              </div>
              <div class="form-group">
                <label>Website</label>
                <input v-model="editForm.website" type="url" placeholder="https://" class="form-input" />
              </div>
              <div class="form-group">
                <label>Description</label>
                <textarea v-model="editForm.description" rows="3" class="form-input"></textarea>
              </div>
            </div>

            <!-- Contact Information -->
            <div class="form-section">
              <h3>Contact Information</h3>
              <div class="form-row">
                <div class="form-group">
                  <label>Contact Person *</label>
                  <input v-model="editForm.contactPerson" type="text" required class="form-input" />
                </div>
                <div class="form-group">
                  <label>Contact Email *</label>
                  <input v-model="editForm.contactEmail" type="email" required class="form-input" />
                </div>
              </div>
              <div class="form-group">
                <label>Contact Phone</label>
                <input v-model="editForm.contactPhone" type="tel" class="form-input" />
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>City</label>
                  <input v-model="editForm.address.city" type="text" class="form-input" />
                </div>
                <div class="form-group">
                  <label>District</label>
                  <select v-model="editForm.address.district" class="form-input">
                    <option value="">Select district</option>
                    <option v-for="d in keralaDistricts" :key="d" :value="d">{{ d }}</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Preferences -->
            <div class="form-section">
              <h3>Sponsorship Preferences</h3>
              <div class="form-row">
                <div class="form-group">
                  <label>Minimum Budget (₹)</label>
                  <input v-model.number="editForm.budget.min" type="number" min="0" class="form-input" />
                </div>
                <div class="form-group">
                  <label>Maximum Budget (₹)</label>
                  <input v-model.number="editForm.budget.max" type="number" min="0" class="form-input" />
                </div>
              </div>
              <div class="form-group">
                <label>Preferred Sponsorship Types</label>
                <div class="checkbox-grid">
                  <label v-for="type in sponsorshipTypes" :key="type.value" class="checkbox-item">
                    <input type="checkbox" :value="type.value" v-model="editForm.preferredTypes" />
                    <span>{{ type.label }}</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="secondary-btn" @click="cancelEditing">Cancel</button>
            <button type="submit" class="primary-btn" :disabled="saving">
              {{ saving ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </form>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useAuthStore } from '../store/auth';

const auth = useAuthStore();
const loading = ref(true);
const isEditing = ref(false);
const saving = ref(false);
const logoInput = ref(null);

const profile = ref({});
const editForm = reactive({
  companyName: '',
  industry: '',
  website: '',
  description: '',
  contactPerson: '',
  contactEmail: '',
  contactPhone: '',
  address: { street: '', city: '', district: '' },
  budget: { min: 10000, max: 500000 },
  preferredTypes: [],
  preferredDistricts: []
});

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const industries = [
  { value: 'sports', label: 'Sports & Fitness' },
  { value: 'finance', label: 'Banking & Finance' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'technology', label: 'Technology' },
  { value: 'fmcg', label: 'FMCG' },
  { value: 'automobile', label: 'Automobile' },
  { value: 'media', label: 'Media & Entertainment' },
  { value: 'education', label: 'Education' },
  { value: 'real-estate', label: 'Real Estate' },
  { value: 'hospitality', label: 'Hospitality' },
  { value: 'retail', label: 'Retail' },
  { value: 'other', label: 'Other' }
];

const sponsorshipTypes = [
  { value: 'tournament-title', label: 'Tournament Title' },
  { value: 'tournament-main', label: 'Tournament Main' },
  { value: 'tournament-associate', label: 'Tournament Associate' },
  { value: 'club-jersey', label: 'Club Jersey' },
  { value: 'club-equipment', label: 'Club Equipment' },
  { value: 'club-training-partner', label: 'Training Partner' },
  { value: 'club-official-partner', label: 'Official Partner' }
];

const keralaDistricts = [
  'Thiruvananthapuram', 'Kollam', 'Pathanamthitta', 'Alappuzha', 
  'Kottayam', 'Idukki', 'Ernakulam', 'Thrissur', 'Palakkad', 
  'Malappuram', 'Kozhikode', 'Wayanad', 'Kannur', 'Kasaragod'
];

function getLogoUrl(url) {
  if (url?.startsWith('http')) return url;
  return `${API_URL}${url}`;
}

function formatIndustry(industry) {
  const ind = industries.find(i => i.value === industry);
  return ind?.label || industry || 'Not specified';
}

function formatType(type) {
  const t = sponsorshipTypes.find(s => s.value === type);
  return t?.label || type;
}

function formatAmount(value) {
  if (!value) return '0';
  if (value >= 100000) return (value / 100000).toFixed(1) + 'L';
  if (value >= 1000) return (value / 1000).toFixed(0) + 'K';
  return value.toLocaleString();
}

function formatNumber(value) {
  if (!value) return '0';
  if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
  if (value >= 1000) return (value / 1000).toFixed(1) + 'K';
  return value.toLocaleString();
}

async function fetchProfile() {
  loading.value = true;
  try {
    const response = await fetch(`${API_URL}/api/sponsors/me?firebaseUid=${auth.user?.uid}`);
    if (response.ok) {
      const data = await response.json();
      profile.value = data.sponsor || {};
    }
  } catch (error) {
    console.error('Failed to fetch profile:', error);
  } finally {
    loading.value = false;
  }
}

function startEditing() {
  // Populate form with current profile
  editForm.companyName = profile.value.companyName || '';
  editForm.industry = profile.value.industry || '';
  editForm.website = profile.value.website || '';
  editForm.description = profile.value.description || '';
  editForm.contactPerson = profile.value.contactPerson || '';
  editForm.contactEmail = profile.value.contactEmail || '';
  editForm.contactPhone = profile.value.contactPhone || '';
  editForm.address = { ...profile.value.address } || { street: '', city: '', district: '' };
  editForm.budget = { ...profile.value.budget } || { min: 10000, max: 500000 };
  editForm.preferredTypes = [...(profile.value.preferredTypes || [])];
  editForm.preferredDistricts = [...(profile.value.preferredDistricts || [])];
  isEditing.value = true;
}

function cancelEditing() {
  isEditing.value = false;
}

async function saveProfile() {
  saving.value = true;
  try {
    const response = await fetch(`${API_URL}/api/sponsors/me`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firebaseUid: auth.user?.uid,
        ...editForm
      })
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to update profile');
    }

    await fetchProfile();
    isEditing.value = false;
    alert('Profile updated successfully!');
  } catch (error) {
    alert(error.message || 'Failed to update profile');
  } finally {
    saving.value = false;
  }
}

function triggerLogoUpload() {
  logoInput.value?.click();
}

async function handleLogoUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    alert('Please select an image file');
    return;
  }

  if (file.size > 2 * 1024 * 1024) {
    alert('Image must be less than 2MB');
    return;
  }

  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const response = await fetch(`${API_URL}/api/sponsors/me/logo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firebaseUid: auth.user?.uid,
          logoData: e.target.result.split(',')[1],
          contentType: file.type
        })
      });

      if (!response.ok) throw new Error('Failed to upload logo');

      await fetchProfile();
      alert('Logo updated successfully!');
    } catch (error) {
      alert('Failed to upload logo');
    }
  };
  reader.readAsDataURL(file);
}

onMounted(() => {
  fetchProfile();
});
</script>

<style scoped>
.sponsor-profile {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.profile-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.logo-container {
  width: 80px;
  height: 80px;
  border-radius: 16px;
  overflow: hidden;
  position: relative;
  cursor: pointer;
  background: #F3F4F6;
}

.logo-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.logo-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: 700;
  color: #1e40af;
  background: linear-gradient(135deg, #DBEAFE, #BFDBFE);
}

.logo-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
  color: white;
  gap: 0.25rem;
}

.logo-container:hover .logo-overlay {
  opacity: 1;
}

.logo-overlay svg {
  width: 24px;
  height: 24px;
}

.logo-overlay span {
  font-size: 0.65rem;
}

.company-info h1 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1F2937;
  margin: 0 0 0.25rem;
}

.status-badge {
  font-size: 0.75rem;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  text-transform: capitalize;
}

.status-badge.pending { background: #FEF3C7; color: #92400E; }
.status-badge.verified { background: #D1FAE5; color: #065F46; }
.status-badge.rejected { background: #FEE2E2; color: #991B1B; }
.status-badge.suspended { background: #E5E7EB; color: #6B7280; }

.edit-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  background: #1e40af;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
}

.edit-btn svg {
  width: 18px;
  height: 18px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  background: white;
  border-radius: 12px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #E5E7EB;
  border-top-color: #1e40af;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.profile-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.25rem;
}

.info-card {
  background: white;
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.info-card h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #1F2937;
  margin: 0 0 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #E5E7EB;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-item.full-width {
  grid-column: 1 / -1;
}

.info-label {
  font-size: 0.75rem;
  color: #9CA3AF;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: 0.9rem;
  color: #1F2937;
}

.info-value.muted {
  color: #9CA3AF;
}

.info-link {
  color: #1e40af;
  text-decoration: none;
  font-size: 0.9rem;
}

.info-link:hover {
  text-decoration: underline;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.chip {
  font-size: 0.75rem;
  padding: 0.25rem 0.75rem;
  background: #DBEAFE;
  color: #1e40af;
  border-radius: 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.stat-item {
  text-align: center;
  padding: 0.75rem;
  background: #F9FAFB;
  border-radius: 8px;
}

.stat-value {
  display: block;
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e40af;
}

.stat-label {
  font-size: 0.7rem;
  color: #6B7280;
}

/* Edit Form */
.edit-form {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.form-grid {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-section h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #1F2937;
  margin: 0 0 1rem;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  margin-bottom: 0.75rem;
}

.form-group label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #374151;
}

.form-input {
  padding: 0.625rem 0.75rem;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  font-size: 0.875rem;
  color: #1F2937;
}

.form-input:focus {
  outline: none;
  border-color: #1e40af;
  box-shadow: 0 0 0 3px rgba(30, 64, 175, 0.1);
}

.checkbox-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: #374151;
  cursor: pointer;
}

.checkbox-item input {
  width: 16px;
  height: 16px;
  accent-color: #1e40af;
}

.form-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #E5E7EB;
}

.secondary-btn {
  padding: 0.625rem 1.25rem;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  background: white;
  color: #374151;
  font-size: 0.875rem;
  cursor: pointer;
}

.primary-btn {
  padding: 0.625rem 1.25rem;
  background: #1e40af;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
}

.primary-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 900px) {
  .profile-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .checkbox-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .profile-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .logo-section {
    flex-direction: column;
  }
}
</style>
