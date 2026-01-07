<template>
  <div class="split-screen-container">
    <!-- Left Panel - Branding -->
    <div class="left-panel">
      <div class="branding-content">
        <div class="logo-section">
          <div class="logo-icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
            </svg>
          </div>
          <h1 class="brand-name">CrickArena</h1>
        </div>
        <p class="tagline">Become a Sponsor</p>
        <p class="subtitle">Connect with cricket tournaments and clubs</p>
        
        <!-- Sponsor Benefits -->
        <div class="features-list">
          <div class="feature-item">
            <svg class="feature-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
            <span>Access marketplace of opportunities</span>
          </div>
          <div class="feature-item">
            <svg class="feature-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
            <span>Brand visibility on tournaments</span>
          </div>
          <div class="feature-item">
            <svg class="feature-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
            <span>Track ROI & analytics</span>
          </div>
          <div class="feature-item">
            <svg class="feature-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
            <span>Simple digital contracts</span>
          </div>
        </div>
        
        <!-- Sponsor Tiers -->
        <div class="tiers-preview">
          <div class="tier-badge title">Title Sponsor</div>
          <div class="tier-badge main">Main Sponsor</div>
          <div class="tier-badge associate">Associate</div>
        </div>
      </div>
    </div>

    <!-- Right Panel - Registration Form -->
    <div class="right-panel">
      <div class="form-content">
        <div class="form-header">
          <h2 class="form-title">Sponsor Registration</h2>
          <p class="form-subtitle">Complete your company profile</p>
        </div>

        <form @submit.prevent="onSubmit" class="register-form">
          <!-- Step Indicator -->
          <div class="step-indicator">
            <div :class="['step', { active: currentStep >= 1, completed: currentStep > 1 }]">
              <span class="step-num">1</span>
              <span class="step-label">Company</span>
            </div>
            <div class="step-line" :class="{ active: currentStep >= 2 }"></div>
            <div :class="['step', { active: currentStep >= 2, completed: currentStep > 2 }]">
              <span class="step-num">2</span>
              <span class="step-label">Contact</span>
            </div>
            <div class="step-line" :class="{ active: currentStep >= 3 }"></div>
            <div :class="['step', { active: currentStep >= 3 }]">
              <span class="step-num">3</span>
              <span class="step-label">Preferences</span>
            </div>
          </div>

          <!-- Step 1: Company Info -->
          <div v-if="currentStep === 1" class="step-content">
            <div class="form-group">
              <label class="form-label">Company Name *</label>
              <input 
                v-model.trim="form.companyName"
                type="text"
                required
                placeholder="Your company name"
                class="form-input"
                :class="{ 'input-error': errors.companyName }"
              />
              <p v-if="errors.companyName" class="error-text">{{ errors.companyName }}</p>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Industry *</label>
                <select v-model="form.industry" class="form-input">
                  <option value="">Select industry</option>
                  <option v-for="ind in industries" :key="ind.value" :value="ind.value">
                    {{ ind.label }}
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Website</label>
                <input 
                  v-model.trim="form.website"
                  type="url"
                  placeholder="https://yourcompany.com"
                  class="form-input"
                />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Company Description</label>
              <textarea 
                v-model.trim="form.description"
                placeholder="Brief description of your company"
                class="form-input textarea"
                rows="3"
              ></textarea>
            </div>

            <div class="form-group">
              <label class="form-label">Company Logo</label>
              <div class="logo-upload" @click="triggerLogoUpload">
                <input 
                  ref="logoInput"
                  type="file"
                  accept="image/*"
                  @change="handleLogoUpload"
                  hidden
                />
                <div v-if="logoPreview" class="logo-preview">
                  <img :src="logoPreview" alt="Logo preview" />
                  <button type="button" class="remove-logo" @click.stop="removeLogo">×</button>
                </div>
                <div v-else class="upload-placeholder">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                  <span>Click to upload logo</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 2: Contact Info -->
          <div v-if="currentStep === 2" class="step-content">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Contact Person *</label>
                <input 
                  v-model.trim="form.contactPerson"
                  type="text"
                  required
                  placeholder="Full name"
                  class="form-input"
                />
              </div>
              <div class="form-group">
                <label class="form-label">Designation</label>
                <input 
                  v-model.trim="form.designation"
                  type="text"
                  placeholder="e.g., Marketing Manager"
                  class="form-input"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Contact Email *</label>
                <input 
                  v-model.trim="form.contactEmail"
                  type="email"
                  required
                  placeholder="contact@company.com"
                  class="form-input"
                  :class="{ 'input-error': errors.contactEmail }"
                />
                <p v-if="errors.contactEmail" class="error-text">{{ errors.contactEmail }}</p>
              </div>
              <div class="form-group">
                <label class="form-label">Contact Phone</label>
                <input 
                  v-model.trim="form.contactPhone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  class="form-input"
                />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Address</label>
              <input 
                v-model.trim="form.address.street"
                type="text"
                placeholder="Street address"
                class="form-input"
              />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">City</label>
                <input 
                  v-model.trim="form.address.city"
                  type="text"
                  placeholder="City"
                  class="form-input"
                />
              </div>
              <div class="form-group">
                <label class="form-label">District</label>
                <select v-model="form.address.district" class="form-input">
                  <option value="">Select district</option>
                  <option v-for="district in keralaDistricts" :key="district" :value="district">
                    {{ district }}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <!-- Step 3: Preferences -->
          <div v-if="currentStep === 3" class="step-content">
            <div class="form-group">
              <label class="form-label">Budget Range (₹)</label>
              <div class="budget-range">
                <div class="budget-input">
                  <span class="currency">₹</span>
                  <input 
                    v-model.number="form.budget.min"
                    type="number"
                    min="0"
                    placeholder="Min"
                    class="form-input"
                  />
                </div>
                <span class="range-separator">to</span>
                <div class="budget-input">
                  <span class="currency">₹</span>
                  <input 
                    v-model.number="form.budget.max"
                    type="number"
                    min="0"
                    placeholder="Max"
                    class="form-input"
                  />
                </div>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Preferred Sponsorship Types</label>
              <div class="checkbox-grid">
                <label v-for="type in sponsorshipTypes" :key="type.value" class="checkbox-item">
                  <input 
                    type="checkbox"
                    :value="type.value"
                    v-model="form.preferredTypes"
                  />
                  <span class="checkbox-label">{{ type.label }}</span>
                </label>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Preferred Districts</label>
              <div class="district-chips">
                <button 
                  v-for="district in keralaDistricts" 
                  :key="district"
                  type="button"
                  :class="['district-chip', { selected: form.preferredDistricts.includes(district) }]"
                  @click="toggleDistrict(district)"
                >
                  {{ district }}
                </button>
              </div>
            </div>
          </div>

          <!-- Navigation Buttons -->
          <div class="form-navigation">
            <button 
              v-if="currentStep > 1"
              type="button"
              class="secondary-button"
              @click="prevStep"
            >
              Previous
            </button>
            <div class="nav-spacer"></div>
            <button 
              v-if="currentStep < 3"
              type="button"
              class="primary-button"
              @click="nextStep"
              :disabled="!canProceed"
            >
              Continue
            </button>
            <button 
              v-else
              type="submit"
              class="primary-button"
              :disabled="isLoading || !isFormValid"
            >
              <svg v-if="isLoading" class="spinner" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>{{ isLoading ? 'Submitting...' : 'Submit Registration' }}</span>
            </button>
          </div>

          <p class="terms-text">
            By registering, you agree to our
            <RouterLink to="/terms" class="link">Terms of Service</RouterLink>
            and
            <RouterLink to="/privacy" class="link">Privacy Policy</RouterLink>
          </p>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../store/auth';

const router = useRouter();
const auth = useAuthStore();

const currentStep = ref(1);
const isLoading = ref(false);
const logoPreview = ref(null);
const logoData = ref(null);
const logoInput = ref(null);

const errors = reactive({
  companyName: '',
  contactEmail: ''
});

const form = reactive({
  companyName: '',
  industry: '',
  website: '',
  description: '',
  contactPerson: '',
  designation: '',
  contactEmail: '',
  contactPhone: '',
  address: {
    street: '',
    city: '',
    district: '',
    state: 'Kerala',
    pincode: ''
  },
  budget: {
    min: 10000,
    max: 500000
  },
  preferredTypes: [],
  preferredDistricts: []
});

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
  { value: 'tournament-title', label: 'Tournament Title Sponsor' },
  { value: 'tournament-main', label: 'Tournament Main Sponsor' },
  { value: 'tournament-associate', label: 'Tournament Associate' },
  { value: 'club-jersey', label: 'Club Jersey Sponsor' },
  { value: 'club-equipment', label: 'Club Equipment Sponsor' },
  { value: 'club-training-partner', label: 'Training Partner' },
  { value: 'club-official-partner', label: 'Official Partner' }
];

const keralaDistricts = [
  'Thiruvananthapuram', 'Kollam', 'Pathanamthitta', 'Alappuzha', 
  'Kottayam', 'Idukki', 'Ernakulam', 'Thrissur', 'Palakkad', 
  'Malappuram', 'Kozhikode', 'Wayanad', 'Kannur', 'Kasaragod'
];

const canProceed = computed(() => {
  if (currentStep.value === 1) {
    return form.companyName.trim() !== '' && form.industry !== '';
  }
  if (currentStep.value === 2) {
    return form.contactPerson.trim() !== '' && form.contactEmail.trim() !== '';
  }
  return true;
});

const isFormValid = computed(() => {
  return form.companyName.trim() !== '' && 
         form.industry !== '' && 
         form.contactPerson.trim() !== '' && 
         form.contactEmail.trim() !== '';
});

onMounted(() => {
  // Pre-fill with user data if available
  if (auth.user) {
    form.contactPerson = auth.user.displayName || auth.dbUser?.name || '';
    form.contactEmail = auth.user.email || '';
  }
});

function triggerLogoUpload() {
  logoInput.value?.click();
}

function handleLogoUpload(event) {
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
  reader.onload = (e) => {
    logoPreview.value = e.target.result;
    logoData.value = e.target.result.split(',')[1]; // Base64 data
  };
  reader.readAsDataURL(file);
}

function removeLogo() {
  logoPreview.value = null;
  logoData.value = null;
  if (logoInput.value) {
    logoInput.value.value = '';
  }
}

function toggleDistrict(district) {
  const index = form.preferredDistricts.indexOf(district);
  if (index === -1) {
    form.preferredDistricts.push(district);
  } else {
    form.preferredDistricts.splice(index, 1);
  }
}

function nextStep() {
  if (canProceed.value && currentStep.value < 3) {
    currentStep.value++;
  }
}

function prevStep() {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
}

async function onSubmit() {
  if (!isFormValid.value) return;

  isLoading.value = true;
  try {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
    
    const response = await fetch(`${API_URL}/api/sponsors/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firebaseUid: auth.user?.uid,
        ...form
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Registration failed');
    }

    // Upload logo if provided
    if (logoData.value) {
      await fetch(`${API_URL}/api/sponsors/me/logo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firebaseUid: auth.user?.uid,
          logoData: logoData.value,
          contentType: 'image/png'
        })
      });
    }

    // Refresh user data
    await auth.fetchDbUser();

    alert('Registration submitted successfully! Your application is pending admin verification.');
    router.push({ name: 'sponsor-dashboard' });
  } catch (error) {
    console.error('Registration error:', error);
    alert(error.message || 'Failed to register. Please try again.');
  } finally {
    isLoading.value = false;
  }
}
</script>

<style scoped>
.split-screen-container {
  display: flex;
  min-height: 100vh;
  width: 100vw;
  margin: 0;
  margin-top: -64px;
  padding-top: 64px;
  position: relative;
  left: 50%;
  right: 50%;
  margin-left: -50vw;
  margin-right: -50vw;
}

.left-panel {
  flex: 0 0 30%;
  background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.branding-content {
  max-width: 400px;
  text-align: center;
  color: white;
}

.logo-section {
  margin-bottom: 1.5rem;
}

.logo-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 1rem;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-icon svg {
  width: 36px;
  height: 36px;
  color: white;
}

.brand-name {
  font-size: 2.25rem;
  font-weight: 800;
  margin: 0;
}

.tagline {
  font-size: 1.25rem;
  margin: 0 0 0.5rem;
  opacity: 0.95;
  font-weight: 600;
}

.subtitle {
  font-size: 0.95rem;
  margin: 0 0 1.5rem;
  opacity: 0.8;
}

.features-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  text-align: left;
  margin-bottom: 1.5rem;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.9rem;
  opacity: 0.9;
}

.feature-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.tiers-preview {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  flex-wrap: wrap;
}

.tier-badge {
  padding: 0.375rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
}

.tier-badge.title {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  color: #78350f;
}

.tier-badge.main {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.tier-badge.associate {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
}

.right-panel {
  flex: 0 0 70%;
  background: white;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 2rem;
  overflow-y: auto;
}

.form-content {
  width: 100%;
  max-width: 640px;
  padding: 1rem 2rem;
}

.form-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.form-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1F2937;
  margin: 0 0 0.25rem;
}

.form-subtitle {
  font-size: 0.875rem;
  color: #6B7280;
  margin: 0;
}

.step-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.step-num {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #E5E7EB;
  color: #9CA3AF;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  transition: all 0.3s;
}

.step.active .step-num {
  background: #1e40af;
  color: white;
}

.step.completed .step-num {
  background: #10B981;
  color: white;
}

.step-label {
  font-size: 0.7rem;
  color: #9CA3AF;
  font-weight: 500;
}

.step.active .step-label {
  color: #1e40af;
}

.step-line {
  width: 60px;
  height: 2px;
  background: #E5E7EB;
  margin: 0 0.5rem;
  margin-bottom: 1rem;
  transition: background 0.3s;
}

.step-line.active {
  background: #1e40af;
}

.step-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.form-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #374151;
}

.form-input {
  width: 100%;
  padding: 0.625rem 0.75rem;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  font-size: 0.875rem;
  color: #1F2937;
  transition: all 0.2s;
  outline: none;
}

.form-input::placeholder {
  color: #9CA3AF;
}

.form-input:focus {
  border-color: #1e40af;
  box-shadow: 0 0 0 3px rgba(30, 64, 175, 0.1);
}

.form-input.input-error {
  border-color: #EF4444;
}

.form-input.textarea {
  resize: vertical;
  min-height: 80px;
}

.logo-upload {
  border: 2px dashed #E5E7EB;
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}

.logo-upload:hover {
  border-color: #1e40af;
  background: rgba(30, 64, 175, 0.02);
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: #9CA3AF;
}

.upload-placeholder svg {
  width: 40px;
  height: 40px;
}

.upload-placeholder span {
  font-size: 0.875rem;
}

.logo-preview {
  position: relative;
  display: inline-block;
}

.logo-preview img {
  max-width: 120px;
  max-height: 80px;
  border-radius: 8px;
}

.remove-logo {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #EF4444;
  color: white;
  border: none;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.budget-range {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.budget-input {
  flex: 1;
  position: relative;
}

.budget-input .currency {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6B7280;
  font-size: 0.875rem;
}

.budget-input .form-input {
  padding-left: 1.75rem;
}

.range-separator {
  color: #9CA3AF;
  font-size: 0.875rem;
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
  cursor: pointer;
}

.checkbox-item input {
  width: 16px;
  height: 16px;
  accent-color: #1e40af;
}

.checkbox-label {
  font-size: 0.8rem;
  color: #374151;
}

.district-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.district-chip {
  padding: 0.375rem 0.75rem;
  border: 1px solid #E5E7EB;
  border-radius: 20px;
  background: white;
  color: #6B7280;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}

.district-chip:hover {
  border-color: #1e40af;
  color: #1e40af;
}

.district-chip.selected {
  background: #1e40af;
  color: white;
  border-color: #1e40af;
}

.form-navigation {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
}

.nav-spacer {
  flex: 1;
}

.primary-button {
  padding: 0.75rem 1.5rem;
  background: #1e40af;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.primary-button:hover:not(:disabled) {
  background: #1e3a8a;
}

.primary-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.secondary-button {
  padding: 0.75rem 1.5rem;
  background: white;
  color: #374151;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.secondary-button:hover {
  background: #F9FAFB;
  border-color: #D1D5DB;
}

.error-text {
  font-size: 0.75rem;
  color: #EF4444;
  margin: 0;
}

.spinner {
  width: 18px;
  height: 18px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.terms-text {
  text-align: center;
  font-size: 0.75rem;
  color: #6B7280;
  margin-top: 1rem;
}

.link {
  color: #1e40af;
  text-decoration: none;
}

.link:hover {
  text-decoration: underline;
}

@media (max-width: 900px) {
  .split-screen-container {
    flex-direction: column;
  }
  
  .left-panel {
    flex: none;
    padding: 2rem 1rem;
  }
  
  .right-panel {
    flex: 1;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .checkbox-grid {
    grid-template-columns: 1fr;
  }
}
</style>
