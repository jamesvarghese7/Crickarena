<template>
  <div class="agreement-create">
    <div class="page-header">
      <button class="back-btn" @click="$router.back()">← Back</button>
      <h1>Create Sponsorship Agreement</h1>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading deal details...</p>
    </div>

    <div v-else-if="!deal" class="error-state">
      <p>Deal not found</p>
      <button @click="$router.back()">Go Back</button>
    </div>

    <form v-else @submit.prevent="submitAgreement" class="agreement-form">
      <!-- Deal Summary -->
      <section class="form-section">
        <h2>Deal Summary</h2>
        <div class="deal-summary">
          <div class="summary-row">
            <span class="label">Sponsor:</span>
            <span class="value">{{ deal.sponsor?.companyName }}</span>
          </div>
          <div class="summary-row">
            <span class="label">Opportunity:</span>
            <span class="value">{{ deal.opportunity?.title }}</span>
          </div>
          <div class="summary-row">
            <span class="label">Agreed Amount:</span>
            <span class="value amount">₹{{ formatAmount(deal.agreedAmount || deal.proposedAmount) }}</span>
          </div>
        </div>
      </section>

      <!-- Contract Period -->
      <section class="form-section">
        <h2>Contract Period</h2>
        <div class="date-inputs">
          <div class="form-group">
            <label>Start Date *</label>
            <input type="date" v-model="formData.startDate" required />
          </div>
          <div class="form-group">
            <label>End Date *</label>
            <input type="date" v-model="formData.endDate" required />
          </div>
        </div>
      </section>

      <!-- Deliverables -->
      <section class="form-section">
        <h2>Deliverables</h2>
        <p class="section-desc">Define the obligations the club will fulfill for the sponsor.</p>
        
        <div v-for="(del, idx) in formData.deliverables" :key="idx" class="deliverable-item">
          <div class="deliverable-header">
            <span class="del-number">#{{ idx + 1 }}</span>
            <button type="button" class="remove-btn" @click="removeDeliverable(idx)">×</button>
          </div>
          <div class="form-group">
            <label>Title *</label>
            <input type="text" v-model="del.title" required placeholder="e.g., Logo on jersey" />
          </div>
          <div class="form-group">
            <label>Description</label>
            <textarea v-model="del.description" placeholder="Detailed description..."></textarea>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Due Date</label>
              <input type="date" v-model="del.dueDate" />
            </div>
          </div>
        </div>

        <button type="button" class="add-btn" @click="addDeliverable">
          + Add Deliverable
        </button>
      </section>

      <!-- Payment Schedule -->
      <section class="form-section">
        <h2>Payment Schedule</h2>
        
        <div v-for="(payment, idx) in formData.paymentSchedule" :key="idx" class="payment-item">
          <div class="payment-header">
            <span class="payment-number">#{{ idx + 1 }}</span>
            <button type="button" class="remove-btn" @click="removePayment(idx)" v-if="formData.paymentSchedule.length > 1">×</button>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Milestone *</label>
              <input type="text" v-model="payment.milestone" required placeholder="e.g., On Signing" />
            </div>
            <div class="form-group">
              <label>Amount (₹) *</label>
              <input type="number" v-model.number="payment.amount" required min="0" />
            </div>
            <div class="form-group">
              <label>Due Date</label>
              <input type="date" v-model="payment.dueDate" />
            </div>
          </div>
        </div>

        <button type="button" class="add-btn" @click="addPayment">
          + Add Payment Milestone
        </button>

        <div class="payment-total">
          <span>Total:</span>
          <span class="total-amount">₹{{ formatAmount(paymentTotal) }}</span>
          <span v-if="paymentTotal !== (deal.agreedAmount || deal.proposedAmount)" class="mismatch-warning">
            ⚠️ Does not match agreed amount
          </span>
        </div>
      </section>

      <!-- Terms -->
      <section class="form-section">
        <h2>Terms & Conditions</h2>
        
        <div class="form-group">
          <label class="checkbox-label">
            <input type="checkbox" v-model="formData.terms.nonCompete.enabled" />
            Non-Compete Clause
          </label>
          <input 
            v-if="formData.terms.nonCompete.enabled" 
            type="text" 
            v-model="formData.terms.nonCompete.description" 
            placeholder="Non-compete details..."
            class="nested-input"
          />
        </div>

        <div class="form-group">
          <label>Exclusivity</label>
          <select v-model="formData.terms.exclusivity">
            <option value="non-exclusive">Non-Exclusive</option>
            <option value="exclusive">Exclusive</option>
            <option value="category-exclusive">Category Exclusive</option>
          </select>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Notice Period (Days)</label>
            <input type="number" v-model.number="formData.terms.termination.noticePeriodDays" min="0" />
          </div>
          <div class="form-group">
            <label>Termination Penalty (%)</label>
            <input type="number" v-model.number="formData.terms.termination.penaltyPercentage" min="0" max="100" />
          </div>
        </div>

        <div class="form-group">
          <label class="checkbox-label">
            <input type="checkbox" v-model="formData.terms.renewal.autoRenew" />
            Auto-Renewal
          </label>
        </div>

        <div class="form-group">
          <label>Additional Terms</label>
          <textarea v-model="formData.terms.additionalTerms" placeholder="Any additional terms or conditions..."></textarea>
        </div>
      </section>

      <!-- Submit -->
      <div class="form-actions">
        <button type="button" class="cancel-btn" @click="$router.back()">Cancel</button>
        <button type="submit" class="submit-btn" :disabled="submitting">
          {{ submitting ? 'Creating...' : 'Create & Send to Sponsor' }}
        </button>
      </div>
    </form>
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
const submitting = ref(false);
const deal = ref(null);

const formData = ref({
  startDate: '',
  endDate: '',
  deliverables: [
    { title: '', description: '', dueDate: '' }
  ],
  paymentSchedule: [
    { milestone: 'On Agreement Signing', amount: 0, dueDate: '' }
  ],
  terms: {
    nonCompete: { enabled: false, description: '' },
    exclusivity: 'non-exclusive',
    termination: { noticePeriodDays: 30, penaltyPercentage: 0 },
    renewal: { autoRenew: false },
    additionalTerms: ''
  }
});

const paymentTotal = computed(() => {
  return formData.value.paymentSchedule.reduce((sum, p) => sum + (p.amount || 0), 0);
});

const formatAmount = (amount) => {
  if (!amount) return '0';
  return new Intl.NumberFormat('en-IN').format(amount);
};

const addDeliverable = () => {
  formData.value.deliverables.push({ title: '', description: '', dueDate: '' });
};

const removeDeliverable = (idx) => {
  formData.value.deliverables.splice(idx, 1);
};

const addPayment = () => {
  formData.value.paymentSchedule.push({ milestone: '', amount: 0, dueDate: '' });
};

const removePayment = (idx) => {
  formData.value.paymentSchedule.splice(idx, 1);
};

const fetchDeal = async () => {
  try {
    const dealId = route.params.dealId;
    const res = await fetch(`${API}/sponsorships/deals/${dealId}?firebaseUid=${auth.user?.uid}`);
    if (!res.ok) throw new Error('Failed to fetch deal');
    deal.value = await res.json();
    
    // Pre-fill payment with agreed amount
    formData.value.paymentSchedule[0].amount = deal.value.agreedAmount || deal.value.proposedAmount;
    
    // Set default dates
    const today = new Date();
    const nextMonth = new Date(today);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const endDate = new Date(today);
    endDate.setFullYear(endDate.getFullYear() + 1);
    
    formData.value.startDate = nextMonth.toISOString().split('T')[0];
    formData.value.endDate = endDate.toISOString().split('T')[0];
  } catch (error) {
    console.error('Error fetching deal:', error);
  } finally {
    loading.value = false;
  }
};

const submitAgreement = async () => {
  submitting.value = true;
  try {
    // Filter out empty deliverables
    const deliverables = formData.value.deliverables
      .filter(d => d.title.trim())
      .map(d => ({
        ...d,
        dueDate: d.dueDate || undefined
      }));

    const paymentSchedule = formData.value.paymentSchedule
      .filter(p => p.milestone.trim())
      .map(p => ({
        ...p,
        dueDate: p.dueDate || undefined
      }));

    const res = await fetch(`${API}/agreements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firebaseUid: auth.user?.uid,
        dealId: route.params.dealId,
        startDate: formData.value.startDate,
        endDate: formData.value.endDate,
        deliverables,
        paymentSchedule,
        terms: formData.value.terms
      })
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to create agreement');
    }

    const result = await res.json();
    alert('Agreement created successfully! The sponsor has been notified.');
    router.push({ name: 'agreement-details', params: { id: result.agreement._id } });
  } catch (error) {
    console.error('Error creating agreement:', error);
    alert(error.message || 'Failed to create agreement');
  } finally {
    submitting.value = false;
  }
};

onMounted(fetchDeal);
</script>

<style scoped>
.agreement-create {
  max-width: 800px;
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

.loading-state, .error-state {
  text-align: center;
  padding: 60px 20px;
  color: #6B7280;
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

.form-section {
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
}

.form-section h2 {
  margin: 0 0 16px;
  font-size: 18px;
  color: #111827;
}

.section-desc {
  color: #6B7280;
  font-size: 14px;
  margin: -8px 0 16px;
}

.deal-summary {
  background: #F9FAFB;
  border-radius: 8px;
  padding: 16px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #E5E7EB;
}

.summary-row:last-child {
  border-bottom: none;
}

.summary-row .label {
  color: #6B7280;
}

.summary-row .value {
  font-weight: 600;
  color: #111827;
}

.summary-row .value.amount {
  color: #10B981;
}

.date-inputs, .form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 6px;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #D1D5DB;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #10B981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.form-group textarea {
  min-height: 80px;
  resize: vertical;
}

.checkbox-label {
  display: flex !important;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  width: auto;
}

.nested-input {
  margin-top: 8px;
}

.deliverable-item, .payment-item {
  background: #F9FAFB;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
}

.deliverable-header, .payment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.del-number, .payment-number {
  font-weight: 600;
  color: #10B981;
}

.remove-btn {
  background: #FEE2E2;
  color: #DC2626;
  border: none;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-btn:hover {
  background: #FECACA;
}

.add-btn {
  background: #ECFDF5;
  color: #10B981;
  border: 1px dashed #10B981;
  padding: 12px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  width: 100%;
}

.add-btn:hover {
  background: #D1FAE5;
}

.payment-total {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #E5E7EB;
  font-weight: 600;
}

.total-amount {
  color: #10B981;
  font-size: 18px;
}

.mismatch-warning {
  color: #F59E0B;
  font-size: 13px;
  font-weight: normal;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.cancel-btn {
  padding: 12px 24px;
  background: #F3F4F6;
  color: #374151;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
}

.cancel-btn:hover {
  background: #E5E7EB;
}

.submit-btn {
  padding: 12px 24px;
  background: #10B981;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
}

.submit-btn:hover:not(:disabled) {
  background: #059669;
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
