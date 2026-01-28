<template>
  <div class="max-w-4xl mx-auto px-4 py-8">
    <div class="bg-white rounded-2xl shadow-lg p-8">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Coach Registration</h1>
        <p class="text-gray-600 mt-2">Complete your coaching profile to start applying to coach clubs</p>
      </div>

      <form @submit.prevent="submitRegistration" class="space-y-8">
        <!-- Basic Information -->
        <div class="bg-gray-50 rounded-xl p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
          <div class="grid md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
              <input
                v-model="form.fullName"
                type="text"
                required
                class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter your full name"
              />
              <p v-if="registeredName && form.fullName !== registeredName" class="text-xs text-gray-500 mt-1">
                Account name: <button type="button" @click="form.fullName = registeredName" class="text-green-600 hover:underline">{{ registeredName }}</button> (click to use)
              </p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Date of Birth *</label>
              <input
                v-model="form.dateOfBirth"
                type="date"
                required
                :max="maxDate"
                :min="minDate"
                :class="[
                  'w-full border rounded-lg px-4 py-2 focus:ring-2 focus:border-transparent',
                  dobError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'
                ]"
              />
              <p v-if="dobError" class="text-red-500 text-xs mt-1">{{ dobError }}</p>
              <p v-else class="text-gray-500 text-xs mt-1">Age must be between 24 and 70 years</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Gender *</label>
              <select
                v-model="form.gender"
                required
                class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
              <input
                v-model="form.phone"
                type="tel"
                required
                :class="[
                  'w-full border rounded-lg px-4 py-2 focus:ring-2 focus:border-transparent',
                  phoneError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'
                ]"
                placeholder="+91 9876543210"
                @input="validatePhone"
              />
              <p v-if="phoneError" class="text-red-500 text-xs mt-1">{{ phoneError }}</p>
              <p v-else class="text-gray-500 text-xs mt-1">Enter a valid 10-digit Indian mobile number</p>
            </div>
          </div>
        </div>

        <!-- Address Information -->
        <div class="bg-gray-50 rounded-xl p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Address Information</h2>
          <div class="grid md:grid-cols-2 gap-6">
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">Street Address (Optional)</label>
              <input
                v-model="form.address.street"
                type="text"
                class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter your street address"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">City *</label>
              <input
                v-model="form.address.city"
                type="text"
                required
                class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter your city"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">District *</label>
              <select
                v-model="form.address.district"
                required
                class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Select District</option>
                <option v-for="district in keralaDistricts" :key="district" :value="district">{{ district }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">State *</label>
              <input
                v-model="form.address.state"
                type="text"
                required
                value="Kerala"
                readonly
                class="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 text-gray-600"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Pincode *</label>
              <input
                v-model="form.address.pincode"
                type="text"
                required
                pattern="^\d{6}$"
                class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter 6-digit pincode"
              />
            </div>
          </div>
        </div>

        <!-- Cricket Coaching Information -->
        <div class="bg-gray-50 rounded-xl p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Cricket Coaching Information</h2>
          <div class="grid md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Coaching Experience *</label>
              <select
                v-model="form.coachingExperience"
                required
                class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Select Coaching Experience</option>
                <option value="beginner">Beginner (0-1 years)</option>
                <option value="1-2 years">1-2 years</option>
                <option value="3-5 years">3-5 years</option>
                <option value="5-10 years">5-10 years</option>
                <option value="10+ years">10+ years</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Coaching Specializations *</label>
              <div class="grid grid-cols-2 gap-2 mt-2">
                <label v-for="spec in specializations" :key="spec.value" class="flex items-center">
                  <input
                    v-model="form.specializations"
                    :value="spec.value"
                    type="checkbox"
                    class="mr-2 text-green-600 focus:ring-green-500"
                  />
                  <span class="text-sm">{{ spec.label }}</span>
                </label>
              </div>
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">Coaching Philosophy</label>
              <textarea
                v-model="form.coachingPhilosophy"
                rows="3"
                maxlength="1000"
                class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Describe your coaching philosophy and approach to developing players..."
              ></textarea>
              <p class="text-xs text-gray-500 mt-1">{{ form.coachingPhilosophy.length }}/1000 characters</p>
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">Coaching Methodology</label>
              <textarea
                v-model="form.methodology"
                rows="3"
                maxlength="1000"
                class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Describe your training methods, techniques, and approach to coaching..."
              ></textarea>
              <p class="text-xs text-gray-500 mt-1">{{ form.methodology.length }}/1000 characters</p>
            </div>
          </div>
        </div>

        <!-- Coaching History -->
        <div class="bg-gray-50 rounded-xl p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-semibold text-gray-900">Coaching History</h2>
            <button
              type="button"
              @click="addCoachingEntry"
              class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-sm"
            >
              Add Entry
            </button>
          </div>
          
          <div v-if="form.coachingHistory.length === 0" class="text-gray-500 text-center py-4">
            No coaching history added yet. Click "Add Entry" to add your coaching experience.
          </div>
          
          <div v-for="(entry, index) in form.coachingHistory" :key="index" class="bg-white rounded-lg p-4 mb-4 border">
            <div class="flex items-center justify-between mb-3">
              <h3 class="font-medium text-gray-900">Coaching Entry {{ index + 1 }}</h3>
              <button
                type="button"
                @click="removeCoachingEntry(index)"
                class="text-red-600 hover:text-red-800 text-sm"
              >
                Remove
              </button>
            </div>
            <div class="grid md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Team/Club Name *</label>
                <input
                  v-model="entry.teamName"
                  type="text"
                  required
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Team or club name"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Position *</label>
                <input
                  v-model="entry.position"
                  type="text"
                  required
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., Head Coach, Assistant Coach, Bowling Coach"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Years Coached *</label>
                <input
                  v-model="entry.yearsCoached"
                  type="text"
                  required
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., 2018-2020"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Players Coached</label>
                <input
                  v-model.number="entry.playersCoached"
                  type="number"
                  min="0"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Number of players coached"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Achievements</label>
                <input
                  v-model="entry.achievements"
                  type="text"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Notable achievements or tournaments won"
                />
              </div>
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  v-model="entry.description"
                  rows="2"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Brief description of your coaching experience"
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        <!-- Certifications -->
        <div class="bg-gray-50 rounded-xl p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-semibold text-gray-900">Coaching Certifications</h2>
            <button
              type="button"
              @click="addCertification"
              class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-sm"
            >
              Add Certification
            </button>
          </div>
          
          <div v-if="form.certifications.length === 0" class="text-gray-500 text-center py-4">
            No certifications added yet. Click "Add Certification" to add your coaching certifications.
          </div>
          
          <div v-for="(cert, index) in form.certifications" :key="index" class="bg-white rounded-lg p-4 mb-4 border">
            <div class="flex items-center justify-between mb-3">
              <h3 class="font-medium text-gray-900">Certification {{ index + 1 }}</h3>
              <button
                type="button"
                @click="removeCertification(index)"
                class="text-red-600 hover:text-red-800 text-sm"
              >
                Remove
              </button>
            </div>
            <div class="grid md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Certification Name *</label>
                <input
                  v-model="cert.name"
                  type="text"
                  required
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., BCCI Level 1 Coach"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Issuing Body *</label>
                <input
                  v-model="cert.issuingBody"
                  type="text"
                  required
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., BCCI, NIS, etc."
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Level *</label>
                <input
                  v-model="cert.level"
                  type="text"
                  required
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., Level 1, Level 2, etc."
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Year Obtained *</label>
                <input
                  v-model.number="cert.yearObtained"
                  type="number"
                  required
                  min="1990"
                  :max="new Date().getFullYear()"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                <input
                  v-model="cert.expiryDate"
                  type="date"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Certificate Number</label>
                <input
                  v-model="cert.certificateNumber"
                  type="text"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Certificate number (if available)"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Profile Photo (Optional) -->
        <div class="bg-gray-50 rounded-xl p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Profile Photo</h2>
          <div class="flex items-center gap-4">
            <input ref="photoInput" type="file" accept="image/*" @change="onPhotoSelected" />
            <span class="text-sm text-gray-500">PNG/JPG up to 2MB</span>
          </div>
          <div v-if="photoPreview" class="mt-4">
            <img :src="photoPreview" alt="Preview" class="w-24 h-24 rounded-full object-cover border" />
          </div>
        </div>

        <!-- Verification Documents -->
        <div class="bg-amber-50 rounded-xl p-6 border border-amber-200">
          <div class="flex items-start gap-3 mb-4">
            <div class="flex-shrink-0">
              <svg class="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
              </svg>
            </div>
            <div>
              <h2 class="text-xl font-semibold text-gray-900">Verification Documents</h2>
              <p class="text-sm text-amber-700 mt-1">Upload documents for admin verification. Your profile will be reviewed by administrators before you can apply to clubs.</p>
            </div>
          </div>
          
          <!-- Document Upload Area -->
          <div class="bg-white rounded-lg p-4 border border-amber-100">
            <div class="grid md:grid-cols-3 gap-4 mb-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Document Type *</label>
                <select
                  v-model="newDocument.type"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Select Type</option>
                  <option value="certificate">Coaching Certificate</option>
                  <option value="reference">Reference Letter</option>
                  <option value="portfolio">Portfolio / Resume</option>
                  <option value="photo">ID Proof</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Document Name *</label>
                <input
                  v-model="newDocument.name"
                  type="text"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., BCCI Level 1 Certificate"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Upload File *</label>
                <input
                  ref="docInput"
                  type="file"
                  accept="image/*,application/pdf"
                  @change="onDocumentSelected"
                  class="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                />
              </div>
            </div>
            <div class="flex justify-end">
              <button
                type="button"
                @click="addDocument"
                :disabled="!newDocument.type || !newDocument.name || !selectedDocFile"
                class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Document
              </button>
            </div>
          </div>

          <!-- Uploaded Documents List -->
          <div v-if="documents.length > 0" class="mt-4 space-y-2">
            <h3 class="text-sm font-medium text-gray-700">Documents to Upload ({{ documents.length }})</h3>
            <div v-for="(doc, index) in documents" :key="index" class="flex items-center justify-between bg-white rounded-lg p-3 border">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-900">{{ doc.name }}</p>
                  <p class="text-xs text-gray-500">{{ doc.type }} • {{ formatFileSize(doc.file.size) }}</p>
                </div>
              </div>
              <button type="button" @click="removeDocument(index)" class="text-red-500 hover:text-red-700">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </button>
            </div>
          </div>

          <div v-else class="mt-4 text-center py-6 border-2 border-dashed border-amber-200 rounded-lg">
            <svg class="w-10 h-10 text-amber-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
            </svg>
            <p class="text-sm text-amber-600">No documents added yet</p>
            <p class="text-xs text-amber-500">Add certificates, ID proof, or reference letters for faster verification</p>
          </div>
        </div>

        <!-- Submit Button -->
        <div class="flex justify-center">
          <button
            type="submit"
            :disabled="loading"
            class="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="loading">Creating Profile...</span>
            <span v-else>Create Coach Profile</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../store/auth';
import axios from 'axios';

const router = useRouter();
const auth = useAuthStore();
const loading = ref(false);

// Get the user's registered name from their account (will be populated from backend)
const registeredName = ref(auth.user?.displayName || '');

const API = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';

const keralaDistricts = [
  'Alappuzha', 'Ernakulam', 'Idukki', 'Kannur', 'Kasaragod', 'Kollam',
  'Kottayam', 'Kozhikode', 'Malappuram', 'Palakkad', 'Pathanamthitta',
  'Thiruvananthapuram', 'Thrissur', 'Wayanad'
];

const specializations = [
  { value: 'batting', label: 'Batting' },
  { value: 'bowling', label: 'Bowling' },
  { value: 'fielding', label: 'Fielding' },
  { value: 'wicket-keeping', label: 'Wicket-keeping' },
  { value: 'fitness', label: 'Fitness' },
  { value: 'mental-coaching', label: 'Mental Coaching' },
  { value: 'strategy', label: 'Strategy' },
  { value: 'youth-development', label: 'Youth Development' }
];

const form = ref({
  fullName: auth.user?.displayName || '',
  dateOfBirth: '',
  gender: '',
  phone: '',
  email: auth.user?.email || '',
  address: {
    street: '',
    city: '',
    district: '',
    state: 'Kerala',
    pincode: ''
  },
  coachingExperience: '',
  specializations: [],
  coachingPhilosophy: '',
  methodology: '',
  coachingHistory: [],
  certifications: []
});

// Calculate min and max dates (18-70 years old for coaches)
const today = new Date();
const maxDate = computed(() => {
  const date = new Date(today);
  date.setFullYear(date.getFullYear() - 24);
  return date.toISOString().split('T')[0];
});

const minDate = computed(() => {
  const date = new Date(today);
  date.setFullYear(date.getFullYear() - 70);
  return date.toISOString().split('T')[0];
});

// Validation computed properties
const dobError = computed(() => {
  if (!form.value.dateOfBirth) return '';
  const dob = new Date(form.value.dateOfBirth);
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const monthDiff = now.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) {
    age--;
  }
  if (age < 24) return 'You must be at least 24 years old to register as a coach';
  if (age > 70) return 'Age must be 70 years or less';
  return '';
});

const phoneError = ref('');
const validatePhone = () => {
  const phone = form.value.phone?.replace(/[\s-]/g, '') || '';
  const phonePattern = /^(\+91)?[6-9]\d{9}$/;
  if (!phone) {
    phoneError.value = '';
  } else if (!phonePattern.test(phone)) {
    phoneError.value = 'Enter a valid Indian mobile number starting with 6-9';
  } else {
    phoneError.value = '';
  }
};

const hasValidationErrors = computed(() => {
  return !!dobError.value || !!phoneError.value;
});

const addCoachingEntry = () => {
  form.value.coachingHistory.push({
    teamName: '',
    position: '',
    yearsCoached: '',
    playersCoached: 0,
    achievements: '',
    description: ''
  });
};

const removeCoachingEntry = (index) => {
  form.value.coachingHistory.splice(index, 1);
};

const addCertification = () => {
  form.value.certifications.push({
    name: '',
    issuingBody: '',
    level: '',
    yearObtained: new Date().getFullYear(),
    expiryDate: '',
    certificateNumber: ''
  });
};

const removeCertification = (index) => {
  form.value.certifications.splice(index, 1);
};

const photoInput = ref(null);
const photoPreview = ref('');
let selectedPhotoFile = null;

// Document upload state
const docInput = ref(null);
const documents = ref([]);
let selectedDocFile = null;
const newDocument = ref({ type: '', name: '' });

const fetchExistingPhoto = async () => {
  try {
    const idTok = auth.user ? await auth.user.getIdToken(true) : null;
    const response = await axios.get(`${API}/coaches/photo`, {
      headers: {
        ...(idTok ? { Authorization: `Bearer ${idTok}` } : {})
      },
      responseType: 'blob',
      withCredentials: true
    });

    const blob = new Blob([response.data], { type: response.headers['content-type'] });
    photoPreview.value = URL.createObjectURL(blob);
  } catch (error) {
    console.error('Error fetching existing photo:', error);
    photoPreview.value = '';
  }
};

const onPhotoSelected = (e) => {
  const file = e.target.files?.[0];
  if (!file) { selectedPhotoFile = null; photoPreview.value = ''; return; }
  if (file.size > 2 * 1024 * 1024) {
    alert('File size must be less than 2MB');
    e.target.value = '';
    return;
  }
  selectedPhotoFile = file;
  const reader = new FileReader();
  reader.onload = () => { photoPreview.value = reader.result; };
  reader.readAsDataURL(file);
};

// Document upload functions
const onDocumentSelected = (e) => {
  const file = e.target.files?.[0];
  if (!file) { selectedDocFile = null; return; }
  if (file.size > 2 * 1024 * 1024) {
    alert('File size must be less than 2MB');
    e.target.value = '';
    return;
  }
  selectedDocFile = file;
};

const addDocument = () => {
  if (!newDocument.value.type || !newDocument.value.name || !selectedDocFile) return;
  documents.value.push({
    type: newDocument.value.type,
    name: newDocument.value.name,
    file: selectedDocFile
  });
  newDocument.value = { type: '', name: '' };
  selectedDocFile = null;
  if (docInput.value) docInput.value.value = '';
};

const removeDocument = (index) => {
  documents.value.splice(index, 1);
};

const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
};

const loadExistingProfile = async () => {
  try {
    const response = await axios.get(`${API}/coaches/profile`, { withCredentials: true });
    const coach = response.data.coach;
    if (coach) {
      // Pre-fill form with existing data
      form.value = {
        fullName: coach.fullName || '',
        dateOfBirth: coach.dateOfBirth ? new Date(coach.dateOfBirth).toISOString().split('T')[0] : '',
        gender: coach.gender || '',
        phone: coach.phone || '',
        email: coach.email || auth.user?.email || '',
        address: {
          street: coach.address?.street || '',
          city: coach.address?.city || '',
          district: coach.address?.district || '',
          state: coach.address?.state || 'Kerala',
          pincode: coach.address?.pincode || ''
        },
        coachingExperience: coach.coachingExperience || '',
        specializations: coach.specializations || [],
        coachingPhilosophy: coach.coachingPhilosophy || '',
        methodology: coach.methodology || '',
        coachingHistory: coach.coachingHistory || [],
        certifications: coach.certifications || []
      };

      // Load profile photo if exists
      if (coach.hasProfilePhoto) {
        await fetchExistingPhoto();
      }
    }
  } catch (e) {
    // If no profile exists, that's fine - form stays empty
    if (e?.response?.status !== 404) {
      console.warn('Error loading existing profile:', e);
    }
  }
};

onMounted(async () => {
  // Wait for auth initialization
  if (!auth.initialized) {
    try {
      await auth.init?.();
    } catch (e) {
      console.error('Auth init failed:', e);
    }
  }

  // Fetch user's registered name from backend
  try {
    const idTok = auth.user ? await auth.user.getIdToken(true) : null;
    if (idTok) {
      const response = await axios.get(`${API}/auth/profile`, {
        headers: { Authorization: `Bearer ${idTok}` },
        withCredentials: true
      });
      const userName = response.data?.user?.name || auth.user?.displayName || '';
      if (userName) {
        registeredName.value = userName;
        if (!form.value.fullName) {
          form.value.fullName = userName;
        }
      }
    }
  } catch (e) {
    console.warn('Could not fetch user profile for name:', e);
  }

  loadExistingProfile();
});

const submitRegistration = async () => {
  // Validate before submission
  validatePhone();
  if (hasValidationErrors.value) {
    alert('Please fix the validation errors before submitting.');
    return;
  }
  
  loading.value = true;
  try {
    // Ensure backend has a User doc first (if not already created during auth/register step)
    const idTok = auth.user ? await auth.user.getIdToken(true) : null;
    if (idTok) {
      try { await axios.post(`${API}/auth/session/login`, { idToken: idTok }); } catch {}
      let userDocExists = false;
      try {
        const prof = await axios.get(`${API}/auth/profile`, { headers: { Authorization: `Bearer ${idTok}` }, withCredentials: true });
        userDocExists = !!prof?.data?.user?._id;
      } catch (e) {
        userDocExists = false;
      }
      if (!userDocExists) {
        try {
          await axios.post(`${API}/auth/register`, {
            firebaseUid: auth.user.uid,
            name: auth.user.displayName || (auth.user.email?.split('@')[0] || 'Coach'),
            email: auth.user.email,
            role: 'coach'
          }, { headers: { Authorization: `Bearer ${idTok}` }, withCredentials: true });
        } catch (e) {
          // If backend says already registered with different email, surface that
          throw e;
        }
      }
    }
    // Check if coach profile already exists
    let existingProfile = null;
    try {
      const response = await axios.get(`${API}/coaches/profile`, { withCredentials: true });
      existingProfile = response.data.coach;
    } catch (e) {
      // 404 means no profile exists, which is fine
      if (e?.response?.status !== 404) {
        console.warn('Error checking existing profile:', e);
      }
    }

    // Ensure auth header is sent (session cookie may not be present in some environments)
    let idToken = auth.idToken;
    try { if (auth.user) { idToken = await auth.user.getIdToken(true); } } catch {}
    const config = idToken ? { headers: { Authorization: `Bearer ${idToken}` }, withCredentials: true } : { withCredentials: true };

    if (existingProfile) {
      // Update existing profile
      await axios.put(`${API}/coaches/profile`, form.value, config);
    } else {
      // Create new profile
      await axios.post(`${API}/coaches/register`, form.value, config);
    }

    if (selectedPhotoFile) {
      const idTok2 = auth.user ? await auth.user.getIdToken(true) : null;
      const fd = new FormData();
      fd.append('photo', selectedPhotoFile);
      await axios.post(`${API}/coaches/upload-photo`, fd, {
        headers: { ...(idTok2 ? { Authorization: `Bearer ${idTok2}` } : {}), 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      });
    }

    // Upload verification documents
    if (documents.value.length > 0) {
      const idTok3 = auth.user ? await auth.user.getIdToken(true) : null;
      for (const doc of documents.value) {
        const fd = new FormData();
        fd.append('document', doc.file);
        fd.append('type', doc.type);
        fd.append('name', doc.name);
        await axios.post(`${API}/coaches/upload-document`, fd, {
          headers: { ...(idTok3 ? { Authorization: `Bearer ${idTok3}` } : {}), 'Content-Type': 'multipart/form-data' },
          withCredentials: true
        });
      }
    }
    alert('Coach profile created successfully! Your profile is pending admin verification. You can apply to clubs after verification.');
    router.push({ name: 'coach-panel' });
  } catch (error) {
    console.error('Registration error:', error);
    const firstValidation = Array.isArray(error?.response?.data?.errors) && error.response.data.errors.length
      ? (error.response.data.errors[0].msg || error.response.data.errors[0].message || '')
      : '';
    const message = firstValidation || error.response?.data?.message || 'Failed to create coach profile';
    alert(message);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* Custom styles for better form appearance */
input:focus, select:focus, textarea:focus {
  outline: none;
}

.grid {
  gap: 1.5rem;
}

@media (max-width: 768px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
