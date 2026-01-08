<template>
  <div class="agreement-sign">
    <div class="page-header">
      <button class="back-btn" @click="$router.back()">← Back</button>
      <h1>Sign Sponsorship Agreement</h1>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading agreement...</p>
    </div>

    <div v-else-if="!agreement" class="error-state">
      <p>Agreement not found</p>
      <button @click="$router.back()">Go Back</button>
    </div>

    <div v-else-if="alreadySigned" class="already-signed">
      <div class="signed-icon">✅</div>
      <h2>You have already signed this agreement</h2>
      <p>Waiting for the other party to sign...</p>
      <router-link :to="{ name: 'agreement-details', params: { id: agreement._id } }" class="view-btn">
        View Agreement Details
      </router-link>
    </div>

    <div v-else-if="!canSign" class="cannot-sign">
      <div class="wait-icon">⏳</div>
      <h2>Waiting for Other Party</h2>
      <p>This agreement is pending signature from {{ agreement.status === 'pending-sponsor' ? 'sponsor' : 'club' }}.</p>
    </div>

    <div v-else class="sign-container">
      <!-- Agreement Preview -->
      <section class="agreement-preview">
        <div class="preview-header">
          <h2>Sponsorship Agreement</h2>
          <span class="agreement-number">{{ agreement.agreementNumber }}</span>
        </div>

        <!-- Parties -->
        <div class="parties">
          <div class="party">
            <h3>Sponsor</h3>
            <p class="party-name">{{ agreement.sponsor?.sponsorRef?.companyName }}</p>
            <p class="party-contact">{{ agreement.sponsor?.signatory?.name }}</p>
          </div>
          <div class="party-divider">↔</div>
          <div class="party">
            <h3>Club</h3>
            <p class="party-name">{{ agreement.club?.clubRef?.name }}</p>
            <p class="party-contact">{{ agreement.club?.signatory?.name }}</p>
          </div>
        </div>

        <!-- Key Terms -->
        <div class="terms-grid">
          <div class="term-card">
            <span class="term-label">Contract Period</span>
            <span class="term-value">{{ formatDate(agreement.startDate) }} - {{ formatDate(agreement.endDate) }}</span>
          </div>
          <div class="term-card">
            <span class="term-label">Total Amount</span>
            <span class="term-value amount">₹{{ formatAmount(agreement.financialTerms?.totalAmount) }}</span>
          </div>
          <div class="term-card">
            <span class="term-label">Exclusivity</span>
            <span class="term-value">{{ formatExclusivity(agreement.terms?.exclusivity) }}</span>
          </div>
          <div class="term-card">
            <span class="term-label">Notice Period</span>
            <span class="term-value">{{ agreement.terms?.termination?.noticePeriodDays || 30 }} days</span>
          </div>
        </div>

        <!-- Deliverables -->
        <div class="section" v-if="agreement.deliverables?.length">
          <h3>Deliverables</h3>
          <ul class="deliverables-list">
            <li v-for="(del, idx) in agreement.deliverables" :key="idx">
              <strong>{{ del.title }}</strong>
              <span v-if="del.description"> - {{ del.description }}</span>
              <span v-if="del.dueDate" class="due-date">Due: {{ formatDate(del.dueDate) }}</span>
            </li>
          </ul>
        </div>

        <!-- Payment Schedule -->
        <div class="section" v-if="agreement.financialTerms?.paymentSchedule?.length">
          <h3>Payment Schedule</h3>
          <table class="payment-table">
            <thead>
              <tr>
                <th>Milestone</th>
                <th>Amount</th>
                <th>Due Date</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(p, idx) in agreement.financialTerms.paymentSchedule" :key="idx">
                <td>{{ p.milestone }}</td>
                <td>₹{{ formatAmount(p.amount) }}</td>
                <td>{{ p.dueDate ? formatDate(p.dueDate) : 'TBD' }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Additional Terms -->
        <div class="section" v-if="agreement.terms?.additionalTerms">
          <h3>Additional Terms</h3>
          <p class="additional-terms">{{ agreement.terms.additionalTerms }}</p>
        </div>
      </section>

      <!-- Signature Section -->
      <section class="signature-section">
        <h2>Digital Signature</h2>
        
        <div class="form-group">
          <label>Your Name *</label>
          <input type="text" v-model="signatureData.name" required placeholder="Enter your full name" />
        </div>

        <div class="form-group">
          <label>Designation *</label>
          <input type="text" v-model="signatureData.designation" required placeholder="e.g., Director, Manager" />
        </div>

        <div class="confirmation">
          <label class="confirm-checkbox">
            <input type="checkbox" v-model="confirmed" />
            <span>I have read and agree to all terms and conditions in this agreement. I understand this constitutes a legally binding commitment.</span>
          </label>
        </div>

        <button 
          class="sign-btn" 
          @click="signAgreement" 
          :disabled="!canSubmit || signing"
        >
          {{ signing ? 'Signing...' : 'Sign Agreement' }}
        </button>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../store/auth';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const API = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';

const loading = ref(true);
const signing = ref(false);
const agreement = ref(null);
const confirmed = ref(false);
const userRole = ref(null); // 'sponsor' or 'club'

const signatureData = ref({
  name: '',
  designation: ''
});

const alreadySigned = computed(() => {
  if (!agreement.value) return false;
  if (userRole.value === 'sponsor') {
    return !!agreement.value.sponsor?.signedAt;
  }
  if (userRole.value === 'club') {
    return !!agreement.value.club?.signedAt;
  }
  return false;
});

const canSign = computed(() => {
  if (!agreement.value) return false;
  if (userRole.value === 'sponsor') {
    return agreement.value.status === 'pending-sponsor';
  }
  if (userRole.value === 'club') {
    return agreement.value.status === 'pending-club';
  }
  return false;
});

const canSubmit = computed(() => {
  return confirmed.value && signatureData.value.name.trim() && signatureData.value.designation.trim();
});

const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  });
};

const formatAmount = (amount) => {
  if (!amount) return '0';
  return new Intl.NumberFormat('en-IN').format(amount);
};

const formatExclusivity = (ex) => {
  const map = {
    'exclusive': 'Exclusive',
    'non-exclusive': 'Non-Exclusive',
    'category-exclusive': 'Category Exclusive'
  };
  return map[ex] || ex || 'Non-Exclusive';
};

const fetchAgreement = async () => {
  try {
    const res = await fetch(`${API}/agreements/${route.params.agreementId}?firebaseUid=${auth.user?.uid}`);
    if (!res.ok) throw new Error('Failed to fetch agreement');
    agreement.value = await res.json();
    
    // Determine user role from auth store's userProfile
    const role = auth.userProfile?.role;
    console.log('[AgreementSign] User role from auth store:', role);
    console.log('[AgreementSign] Agreement status:', agreement.value.status);
    
    if (role === 'sponsor') {
      userRole.value = 'sponsor';
      signatureData.value.name = agreement.value.sponsor?.signatory?.name || auth.userProfile?.name || '';
      signatureData.value.designation = agreement.value.sponsor?.signatory?.designation || 'Authorized Representative';
    } else if (role === 'clubManager') {
      userRole.value = 'club';
      signatureData.value.name = agreement.value.club?.signatory?.name || auth.userProfile?.name || '';
      signatureData.value.designation = agreement.value.club?.signatory?.designation || 'Club Manager';
    }
    
    console.log('[AgreementSign] Set userRole to:', userRole.value);
    console.log('[AgreementSign] canSign expected:', 
      userRole.value === 'sponsor' ? agreement.value.status === 'pending-sponsor' : 
      userRole.value === 'club' ? agreement.value.status === 'pending-club' : false
    );
  } catch (error) {
    console.error('Error fetching agreement:', error);
  } finally {
    loading.value = false;
  }
};

const signAgreement = async () => {
  if (!canSubmit.value) return;
  
  signing.value = true;
  try {
    const res = await fetch(`${API}/agreements/${agreement.value._id}/sign`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firebaseUid: auth.user?.uid,
        signature: `Digitally signed by ${signatureData.value.name}`,
        signatoryName: signatureData.value.name,
        signatoryDesignation: signatureData.value.designation
      })
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to sign agreement');
    }

    alert('Agreement signed successfully!');
    router.push({ name: 'agreement-details', params: { id: agreement.value._id } });
  } catch (error) {
    console.error('Error signing agreement:', error);
    alert(error.message || 'Failed to sign agreement');
  } finally {
    signing.value = false;
  }
};

onMounted(fetchAgreement);
</script>

<style scoped>
.agreement-sign {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 32px;
}

.back-btn {
  background: none;
  border: none;
  color: #6B7280;
  cursor: pointer;
  font-size: 16px;
}

.back-btn:hover {
  color: #374151;
}

h1 {
  margin: 0;
  font-size: 24px;
  color: #111827;
}

.loading-state, .error-state, .already-signed, .cannot-sign {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
  border: 1px solid #E5E7EB;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #E5E7EB;
  border-top-color: #10B981;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.signed-icon, .wait-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.already-signed h2, .cannot-sign h2 {
  color: #111827;
  margin: 0 0 8px;
}

.already-signed p, .cannot-sign p {
  color: #6B7280;
}

.view-btn {
  display: inline-block;
  margin-top: 16px;
  padding: 12px 24px;
  background: #10B981;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 500;
}

.sign-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.agreement-preview {
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  padding: 32px;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #10B981;
}

.preview-header h2 {
  margin: 0;
  color: #111827;
}

.agreement-number {
  color: #6B7280;
  font-size: 14px;
}

.parties {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #F9FAFB;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 24px;
}

.party {
  text-align: center;
  flex: 1;
}

.party h3 {
  margin: 0 0 8px;
  color: #10B981;
  font-size: 14px;
  text-transform: uppercase;
}

.party-name {
  font-weight: 600;
  color: #111827;
  margin: 0 0 4px;
}

.party-contact {
  color: #6B7280;
  font-size: 14px;
  margin: 0;
}

.party-divider {
  font-size: 24px;
  color: #D1D5DB;
  padding: 0 20px;
}

.terms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.term-card {
  background: #F9FAFB;
  padding: 16px;
  border-radius: 8px;
}

.term-label {
  display: block;
  color: #6B7280;
  font-size: 13px;
  margin-bottom: 4px;
}

.term-value {
  font-weight: 600;
  color: #111827;
}

.term-value.amount {
  color: #10B981;
  font-size: 18px;
}

.section {
  margin-bottom: 24px;
}

.section h3 {
  color: #111827;
  font-size: 16px;
  margin: 0 0 12px;
}

.deliverables-list {
  padding-left: 20px;
  margin: 0;
}

.deliverables-list li {
  padding: 8px 0;
  color: #374151;
}

.due-date {
  display: block;
  color: #6B7280;
  font-size: 13px;
  margin-top: 4px;
}

.payment-table {
  width: 100%;
  border-collapse: collapse;
}

.payment-table th, .payment-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #E5E7EB;
}

.payment-table th {
  background: #F9FAFB;
  font-weight: 600;
  color: #374151;
}

.additional-terms {
  background: #FEF3C7;
  padding: 16px;
  border-radius: 8px;
  color: #92400E;
  white-space: pre-wrap;
}

.signature-section {
  background: white;
  border: 2px solid #10B981;
  border-radius: 12px;
  padding: 32px;
}

.signature-section h2 {
  margin: 0 0 24px;
  color: #10B981;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-weight: 500;
  color: #374151;
  margin-bottom: 6px;
}

.form-group input {
  width: 100%;
  padding: 12px;
  border: 1px solid #D1D5DB;
  border-radius: 8px;
  font-size: 14px;
}

.form-group input:focus {
  outline: none;
  border-color: #10B981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.confirmation {
  background: #FEF3C7;
  padding: 16px;
  border-radius: 8px;
  margin: 24px 0;
}

.confirm-checkbox {
  display: flex;
  gap: 12px;
  cursor: pointer;
  color: #92400E;
  font-size: 14px;
  line-height: 1.5;
}

.confirm-checkbox input {
  margin-top: 4px;
}

.sign-btn {
  width: 100%;
  padding: 16px;
  background: #10B981;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.sign-btn:hover:not(:disabled) {
  background: #059669;
}

.sign-btn:disabled {
  background: #9CA3AF;
  cursor: not-allowed;
}
</style>
