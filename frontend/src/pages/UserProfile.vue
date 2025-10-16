<template>
  <div class="max-w-3xl mx-auto p-4">
    <h1 class="text-2xl font-bold mb-6">User Profile</h1>

    <!-- Personal Information -->
    <section class="bg-white rounded-lg border p-4 mb-6">
      <h2 class="text-lg font-semibold mb-4">Personal Information</h2>
      <form @submit.prevent="saveProfile" class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-1">Name</label>
          <input v-model="form.name" type="text" class="w-full border rounded px-3 py-2" required />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Email</label>
          <input :value="email" type="email" class="w-full border rounded px-3 py-2 bg-gray-100" disabled />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Phone</label>
          <input v-model="form.phone" type="text" class="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">District</label>
          <select v-model="form.district" class="w-full border rounded px-3 py-2">
            <option value="">Select district</option>
            <option v-for="d in districts" :key="d" :value="d">{{ d }}</option>
          </select>
        </div>
        <button :disabled="saving" class="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700">
          {{ saving ? 'Saving...' : 'Save Changes' }}
        </button>
      </form>
    </section>

    <!-- Change Password (Firebase) -->
    <section class="bg-white rounded-lg border p-4 mb-6">
      <h2 class="text-lg font-semibold mb-4">Change Password</h2>
      <form @submit.prevent="changePassword" class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-1">Old Password</label>
          <input v-model="pw.old" type="password" class="w-full border rounded px-3 py-2" required />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">New Password</label>
          <input v-model="pw.new1" type="password" class="w-full border rounded px-3 py-2" required />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Confirm New Password</label>
          <input v-model="pw.new2" type="password" class="w-full border rounded px-3 py-2" required />
        </div>
        <button :disabled="changing" class="px-4 py-2 bg-sky-600 text-white rounded hover:bg-sky-700">
          {{ changing ? 'Updating...' : 'Change Password' }}
        </button>
      </form>
      <p class="text-sm text-gray-600 mt-3">
        Forgot your password? <RouterLink to="/forgot-password" class="text-emerald-700 underline">Reset here</RouterLink>
      </p>
    </section>

    <!-- Role & Access -->
    <section class="bg-white rounded-lg border p-4 mb-6">
      <h2 class="text-lg font-semibold mb-4">Role & Access</h2>
      <p class="mb-3">Current role: <span class="font-medium">{{ currentRole }}</span></p>
      <!-- Upgrade option removed for normal users -->
    </section>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted, computed } from 'vue';
import axios from 'axios';
import { useAuthStore } from '../store/auth';
import { auth } from '../firebase/client';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';

const API = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';

const authStore = useAuthStore();
const saving = ref(false);
const changing = ref(false);
const form = reactive({ name: '', phone: '', district: '' });
const email = computed(() => authStore.user?.email || '');
const currentRole = computed(() => authStore.userProfile?.role || 'public');

const districts = [
  'Thiruvananthapuram','Kollam','Pathanamthitta','Alappuzha','Kottayam','Idukki','Ernakulam','Thrissur','Palakkad','Malappuram','Kozhikode','Wayanad','Kannur','Kasaragod'
];

onMounted(() => {
  // Pre-fill from profile store
  const u = authStore.userProfile || {};
  form.name = u.name || authStore.user?.displayName || '';
  form.phone = u.phone || '';
  form.district = u.district || '';
});

async function saveProfile(){
  try {
    saving.value = true;
    await axios.put(`${API}/users/me`, { name: form.name, phone: form.phone, district: form.district });
    // Refresh store profile
    const { data } = await axios.get(`${API}/auth/profile`);
    authStore.userProfile = data.user;
    alert('Profile updated');
  } catch (e) {
    alert(e?.response?.data?.message || 'Failed to update');
  } finally {
    saving.value = false;
  }
}

function validatePassword(p) {
  return /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/.test(p);
}

async function changePassword(){
  try {
    if (pw.new1 !== pw.new2) return alert('Passwords do not match');
    if (pw.new1 === pw.old) return alert('New password must be different from old');
    if (!validatePassword(pw.new1)) return alert('Password must be at least 8 chars with uppercase, number, and special char');

    changing.value = true;
    // Reauthenticate
    const user = auth?.currentUser;
    if (!user?.email) throw new Error('Not authenticated');
    const cred = EmailAuthProvider.credential(user.email, pw.old);
    await reauthenticateWithCredential(user, cred);
    await updatePassword(user, pw.new1);
    alert('Password updated');
  } catch (e) {
    alert(e?.message || 'Failed to change password');
  } finally {
    changing.value = false;
  }
}

const pw = reactive({ old: '', new1: '', new2: '' });
</script>