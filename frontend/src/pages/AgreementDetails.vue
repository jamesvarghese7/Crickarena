<template>
  <div class="agreement-details">
    <div class="page-header">
      <button class="back-btn" @click="$router.back()">← Back</button>
      <div class="header-content">
        <h1>Agreement Details</h1>
        <span v-if="agreement" :class="['status-badge', agreement.status]">
          {{ formatStatus(agreement.status) }}
        </span>
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading agreement...</p>
    </div>

    <div v-else-if="!agreement" class="error-state">
      <p>Agreement not found</p>
      <button @click="$router.back()">Go Back</button>
    </div>

    <div v-else class="agreement-content">
      <!-- Agreement Header Card -->
      <div class="header-card">
        <div class="agreement-number">{{ agreement.agreementNumber }}</div>
        <div class="parties-row">
          <div class="party-info">
            <div class="party-logo sponsor-logo">{{ agreement.sponsor?.sponsorRef?.companyName?.charAt(0) }}</div>
            <div>
              <span class="party-label">Sponsor</span>
              <span class="party-name">{{ agreement.sponsor?.sponsorRef?.companyName }}</span>
            </div>
          </div>
          <div class="connection-line">
            <span v-if="agreement.status === 'active'" class="connection-active">✓</span>
            <span v-else class="connection-pending">···</span>
          </div>
          <div class="party-info">
            <div class="party-logo club-logo">{{ agreement.club?.clubRef?.name?.charAt(0) }}</div>
            <div>
              <span class="party-label">Club</span>
              <span class="party-name">{{ agreement.club?.clubRef?.name }}</span>
            </div>
          </div>
        </div>
        <div class="quick-stats">
          <div class="stat">
            <span class="stat-label">Amount</span>
            <span class="stat-value">₹{{ formatAmount(agreement.financialTerms?.totalAmount) }}</span>
          </div>
          <div class="stat">
            <span class="stat-label">Duration</span>
            <span class="stat-value">{{ formatDate(agreement.startDate) }} - {{ formatDate(agreement.endDate) }}</span>
          </div>
          <div class="stat">
            <span class="stat-label">Progress</span>
            <span class="stat-value">{{ deliverablesProgress.completed }}/{{ deliverablesProgress.total }} deliverables</span>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="action-buttons" v-if="canSign || canDownload">
        <button v-if="canSign" class="sign-btn" @click="goToSign">
          ✍️ Sign Agreement
        </button>
        <button class="download-btn" @click="downloadPdf">
          📄 Download PDF
        </button>
      </div>

      <!-- Tabs -->
      <div class="tabs">
        <button :class="['tab', { active: activeTab === 'overview' }]" @click="activeTab = 'overview'">
          Overview
        </button>
        <button :class="['tab', { active: activeTab === 'deliverables' }]" @click="activeTab = 'deliverables'">
          Deliverables
          <span class="tab-badge" v-if="pendingDeliverables > 0">{{ pendingDeliverables }}</span>
        </button>
        <button :class="['tab', { active: activeTab === 'payments' }]" @click="activeTab = 'payments'">
          Payments
        </button>
        <button :class="['tab', { active: activeTab === 'history' }]" @click="activeTab = 'history'">
          Activity
        </button>
      </div>

      <!-- Overview Tab -->
      <div v-if="activeTab === 'overview'" class="tab-content">
        <div class="section-grid">
          <!-- Signatures -->
          <div class="section-card">
            <h3>Signatures</h3>
            <div class="signature-status">
              <div class="sig-row">
                <span class="sig-party">Sponsor</span>
                <span v-if="agreement.sponsor?.signedAt" class="sig-signed">
                  ✓ Signed by {{ agreement.sponsor.signatory?.name }} on {{ formatDate(agreement.sponsor.signedAt) }}
                </span>
                <span v-else class="sig-pending">Pending</span>
              </div>
              <div class="sig-row">
                <span class="sig-party">Club</span>
                <span v-if="agreement.club?.signedAt" class="sig-signed">
                  ✓ Signed by {{ agreement.club.signatory?.name }} on {{ formatDate(agreement.club.signedAt) }}
                </span>
                <span v-else class="sig-pending">Pending</span>
              </div>
            </div>
          </div>

          <!-- Terms -->
          <div class="section-card">
            <h3>Terms</h3>
            <div class="terms-list">
              <div class="term-item">
                <span class="term-label">Exclusivity</span>
                <span class="term-value">{{ formatExclusivity(agreement.terms?.exclusivity) }}</span>
              </div>
              <div class="term-item">
                <span class="term-label">Notice Period</span>
                <span class="term-value">{{ agreement.terms?.termination?.noticePeriodDays || 30 }} days</span>
              </div>
              <div class="term-item" v-if="agreement.terms?.nonCompete?.enabled">
                <span class="term-label">Non-Compete</span>
                <span class="term-value">{{ agreement.terms.nonCompete.description || 'Yes' }}</span>
              </div>
              <div class="term-item">
                <span class="term-label">Auto-Renewal</span>
                <span class="term-value">{{ agreement.terms?.renewal?.autoRenew ? 'Yes' : 'No' }}</span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="agreement.terms?.additionalTerms" class="additional-terms-card">
          <h3>Additional Terms</h3>
          <p>{{ agreement.terms.additionalTerms }}</p>
        </div>
      </div>

      <!-- Deliverables Tab -->
      <div v-if="activeTab === 'deliverables'" class="tab-content">
        <div class="deliverables-header">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: deliverablesProgress.percentage + '%' }"></div>
          </div>
          <span class="progress-text">{{ deliverablesProgress.percentage }}% Complete</span>
        </div>

        <div v-if="!agreement.deliverables?.length" class="empty-state">
          <p>No deliverables defined</p>
        </div>

        <div v-else class="deliverables-list">
          <div 
            v-for="(del, idx) in agreement.deliverables" 
            :key="idx" 
            :class="['deliverable-card', del.status]"
          >
            <div class="del-header">
              <span :class="['del-status', del.status]">
                {{ formatDeliverableStatus(del.status) }}
              </span>
              <span v-if="del.dueDate" class="del-due">Due: {{ formatDate(del.dueDate) }}</span>
            </div>
            <h4>{{ del.title }}</h4>
            <p v-if="del.description">{{ del.description }}</p>

            <!-- Evidence -->
            <div v-if="del.evidence?.length" class="evidence-list">
              <span class="evidence-label">Evidence:</span>
              <a 
                v-for="(ev, evIdx) in del.evidence" 
                :key="evIdx" 
                :href="ev.url" 
                target="_blank" 
                class="evidence-link"
              >
                {{ ev.type === 'image' ? '🖼️' : ev.type === 'link' ? '🔗' : '📄' }}
                {{ ev.description || `Evidence ${evIdx + 1}` }}
              </a>
            </div>

            <!-- Actions -->
            <div class="del-actions" v-if="canManageDeliverables">
              <button 
                v-if="del.status === 'pending' || del.status === 'in-progress'"
                class="action-btn complete" 
                @click="updateDeliverable(idx, 'completed')"
              >
                Mark Complete
              </button>
              <button 
                v-if="del.status === 'completed' && userRole === 'sponsor'"
                class="action-btn verify" 
                @click="updateDeliverable(idx, 'verified')"
              >
                Verify
              </button>
              <button 
                v-if="userRole === 'club' && (del.status === 'pending' || del.status === 'in-progress')"
                class="action-btn evidence" 
                @click="showEvidenceModal(idx)"
              >
                Add Evidence
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Payments Tab -->
      <div v-if="activeTab === 'payments'" class="tab-content">
        <!-- Payment Summary -->
        <div class="payment-summary">
          <div class="payment-stat">
            <span class="payment-label">Total</span>
            <span class="payment-value">₹{{ formatAmount(agreement.financialTerms?.totalAmount) }}</span>
          </div>
          <div class="payment-stat">
            <span class="payment-label">Completed</span>
            <span class="payment-value paid">₹{{ formatAmount(paymentSummary.totalCompleted) }}</span>
          </div>
          <div class="payment-stat">
            <span class="payment-label">Pending</span>
            <span class="payment-value pending">₹{{ formatAmount(paymentSummary.totalPending) }}</span>
          </div>
          <div class="payment-stat">
            <span class="payment-label">Remaining</span>
            <span class="payment-value">₹{{ formatAmount(paymentSummary.remaining) }}</span>
          </div>
        </div>

        <!-- Payment Schedule -->
        <div class="payments-section">
          <h3>Payment Schedule</h3>
          <div v-if="!agreement.financialTerms?.paymentSchedule?.length" class="empty-state">
            <p>No payment schedule defined</p>
          </div>

          <div v-else class="payments-list">
            <div 
              v-for="(p, idx) in agreement.financialTerms.paymentSchedule" 
              :key="idx" 
              :class="['payment-card', p.status]"
            >
              <div class="payment-header">
                <span class="payment-milestone">{{ p.milestone }}</span>
                <span :class="['payment-status-badge', p.status]">
                  {{ p.status === 'paid' ? '✓ Paid' : p.status === 'pending' ? '⏳ Pending' : p.status }}
                </span>
              </div>
              <div class="payment-details">
                <span class="payment-amount">₹{{ formatAmount(p.amount) }}</span>
                <span class="payment-due">{{ p.dueDate ? `Due: ${formatDate(p.dueDate)}` : 'No due date' }}</span>
              </div>
              
              <!-- Actions based on role and status -->
              <div class="payment-actions" v-if="agreement.status === 'active'">
                <!-- Club can request funds (only if milestone pending and no active transaction) -->
                <button 
                  v-if="userRole === 'club' && p.status !== 'paid' && !getMilestoneTransaction(idx)"
                  class="request-btn"
                  @click="requestFund(idx, p)"
                >
                  💰 Request Fund
                </button>
                
                <!-- Show transaction status if exists -->
                <div v-if="getMilestoneTransaction(idx)" class="tx-status">
                  <span :class="['tx-badge', getMilestoneTransaction(idx).status]">
                    {{ formatTxStatus(getMilestoneTransaction(idx).status) }}
                  </span>
                  
                  <!-- Sponsor can approve/reject pending requests -->
                  <template v-if="userRole === 'sponsor' && getMilestoneTransaction(idx).status === 'pending'">
                    <button class="approve-btn" @click="processRequest(getMilestoneTransaction(idx)._id, 'approve')">
                      ✓ Approve
                    </button>
                    <button class="reject-btn" @click="processRequest(getMilestoneTransaction(idx)._id, 'reject')">
                      ✗ Reject
                    </button>
                  </template>
                  
                  <!-- Sponsor can pay via Razorpay -->
                  <button 
                    v-if="userRole === 'sponsor' && getMilestoneTransaction(idx).status === 'approved'"
                    class="pay-now-btn"
                    @click="payWithRazorpay(getMilestoneTransaction(idx))"
                  >
                    💳 Pay Now
                  </button>
                  
                  <!-- View Receipt for completed transactions -->
                  <button 
                    v-if="getMilestoneTransaction(idx).status === 'completed'"
                    class="view-receipt-btn"
                    @click="viewReceipt(getMilestoneTransaction(idx))"
                  >
                    📄 View Receipt
                  </button>
                </div>
              </div>
              
              <!-- Show message if agreement not yet active -->
              <div v-else class="waiting-message">
                <span v-if="agreement.status === 'pending-sponsor'">⏳ Waiting for sponsor signature to request funds</span>
                <span v-else-if="agreement.status === 'pending-club'">⏳ Waiting for club signature to request funds</span>
                <span v-else>⏳ Agreement must be active to request funds</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Transaction History -->
        <div class="payments-section" v-if="transactions.length > 0">
          <h3>Transaction History</h3>
          <div class="transactions-list">
            <div v-for="tx in transactions" :key="tx._id" class="transaction-item">
              <div class="tx-header">
                <span class="tx-type">{{ tx.type === 'fund-request' ? '📤 Fund Request' : '💳 Payment' }}</span>
                <span :class="['tx-status-badge', tx.status]">{{ formatTxStatus(tx.status) }}</span>
              </div>
              <div class="tx-details">
                <span class="tx-amount">₹{{ formatAmount(tx.amount) }}</span>
                <span class="tx-milestone">{{ tx.milestoneName }}</span>
              </div>
              <div class="tx-meta">
                <span>{{ tx.requestedBy?.name }} • {{ formatDateTime(tx.createdAt) }}</span>
              </div>
              
              <!-- Receipts -->
              <div v-if="tx.receipts?.length" class="tx-receipts">
                <span class="receipts-label">Receipts:</span>
                <a v-for="(r, rIdx) in tx.receipts" :key="rIdx" :href="r.url" target="_blank" class="receipt-link">
                  📄 {{ r.fileName || `Receipt ${rIdx + 1}` }}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- History Tab -->
      <div v-if="activeTab === 'history'" class="tab-content">
        <div v-if="!agreement.history?.length" class="empty-state">
          <p>No activity recorded</p>
        </div>

        <div v-else class="history-timeline">
          <div v-for="(h, idx) in agreement.history" :key="idx" class="history-item">
            <div class="history-dot"></div>
            <div class="history-content">
              <span class="history-action">{{ formatAction(h.action) }}</span>
              <span class="history-details" v-if="h.details">{{ h.details }}</span>
              <span class="history-meta">
                {{ h.performedBy?.name || 'System' }} • {{ formatDateTime(h.timestamp) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Evidence Modal -->
    <div v-if="evidenceModalIdx !== null" class="modal-overlay" @click="closeEvidenceModal">
      <div class="modal-content" @click.stop>
        <h3>Add Evidence</h3>
        <div class="form-group">
          <label>Type</label>
          <select v-model="evidenceForm.type">
            <option value="link">Link</option>
            <option value="image">Image URL</option>
            <option value="document">Document URL</option>
          </select>
        </div>
        <div class="form-group">
          <label>URL</label>
          <input type="url" v-model="evidenceForm.url" placeholder="https://..." />
        </div>
        <div class="form-group">
          <label>Description</label>
          <input type="text" v-model="evidenceForm.description" placeholder="Brief description..." />
        </div>
        <div class="modal-actions">
          <button class="cancel-btn" @click="closeEvidenceModal">Cancel</button>
          <button class="submit-btn" @click="submitEvidence" :disabled="!evidenceForm.url">Add Evidence</button>
        </div>
      </div>
    </div>

    <!-- Complete Payment Modal -->
    <div v-if="completeModal.show" class="modal-overlay" @click="completeModal.show = false">
      <div class="modal-content" @click.stop>
        <h3>💳 Complete Payment</h3>
        <p>Confirm payment of <strong>₹{{ formatAmount(completeModal.transaction?.amount) }}</strong></p>
        <div class="form-group">
          <label>Payment Method</label>
          <select v-model="completeModal.paymentMethod">
            <option value="bank-transfer">Bank Transfer</option>
            <option value="upi">UPI</option>
            <option value="cheque">Cheque</option>
            <option value="cash">Cash</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div class="form-group">
          <label>Reference Number (Optional)</label>
          <input type="text" v-model="completeModal.reference" placeholder="Transaction ID, UTR, etc." />
        </div>
        <div class="form-group">
          <label>Notes (Optional)</label>
          <input type="text" v-model="completeModal.notes" placeholder="Any additional notes..." />
        </div>
        <div class="modal-actions">
          <button class="cancel-btn" @click="completeModal.show = false">Cancel</button>
          <button class="submit-btn" @click="completePayment">Confirm Payment</button>
        </div>
      </div>
    </div>

    <!-- Receipt Upload Modal -->
    <div v-if="receiptModal.show" class="modal-overlay" @click="receiptModal.show = false">
      <div class="modal-content" @click.stop>
        <h3>📎 Upload Receipt</h3>
        <div class="form-group">
          <label>Receipt URL</label>
          <input type="url" v-model="receiptModal.url" placeholder="https://..." />
        </div>
        <div class="form-group">
          <label>File Name</label>
          <input type="text" v-model="receiptModal.fileName" placeholder="receipt.pdf" />
        </div>
        <div class="form-group">
          <label>Description (Optional)</label>
          <input type="text" v-model="receiptModal.description" placeholder="Payment receipt for..." />
        </div>
        <div class="modal-actions">
          <button class="cancel-btn" @click="receiptModal.show = false">Cancel</button>
          <button class="submit-btn" @click="uploadReceipt" :disabled="!receiptModal.url">Upload</button>
        </div>
      </div>
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
const agreement = ref(null);
const activeTab = ref('overview');
const userRole = ref(null);

// Evidence modal
const evidenceModalIdx = ref(null);
const evidenceForm = ref({ type: 'link', url: '', description: '' });

// Payment tracking
const transactions = ref([]);
const paymentSummary = ref({ totalCompleted: 0, totalPending: 0, remaining: 0, agreementTotal: 0 });
const completeModal = ref({ show: false, transaction: null, paymentMethod: 'bank-transfer', reference: '', notes: '' });
const receiptModal = ref({ show: false, transaction: null, url: '', fileName: '', description: '' });

const deliverablesProgress = computed(() => {
  const deliverables = agreement.value?.deliverables || [];
  const total = deliverables.length;
  if (total === 0) return { total: 0, completed: 0, percentage: 100 };
  const completed = deliverables.filter(d => d.status === 'completed' || d.status === 'verified').length;
  return { total, completed, percentage: Math.round((completed / total) * 100) };
});

const pendingDeliverables = computed(() => {
  return (agreement.value?.deliverables || []).filter(d => d.status === 'pending').length;
});

const paidAmount = computed(() => {
  return (agreement.value?.financialTerms?.paymentSchedule || [])
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);
});

const pendingAmount = computed(() => {
  return (agreement.value?.financialTerms?.totalAmount || 0) - paidAmount.value;
});

const canSign = computed(() => {
  if (!agreement.value) return false;
  if (userRole.value === 'sponsor' && agreement.value.status === 'pending-sponsor') return true;
  if (userRole.value === 'club' && agreement.value.status === 'pending-club') return true;
  return false;
});

const canDownload = computed(() => {
  return agreement.value?.status === 'active' || agreement.value?.sponsor?.signedAt || agreement.value?.club?.signedAt;
});

const canManageDeliverables = computed(() => {
  return agreement.value?.status === 'active' && (userRole.value === 'club' || userRole.value === 'sponsor');
});

const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const formatDateTime = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleString('en-IN', { 
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' 
  });
};

const formatAmount = (amount) => {
  if (!amount) return '0';
  return new Intl.NumberFormat('en-IN').format(amount);
};

const formatStatus = (status) => {
  const map = {
    'draft': 'Draft',
    'pending-sponsor': 'Awaiting Sponsor',
    'pending-club': 'Awaiting Club',
    'active': 'Active',
    'completed': 'Completed',
    'terminated': 'Terminated'
  };
  return map[status] || status;
};

const formatExclusivity = (ex) => {
  const map = { 'exclusive': 'Exclusive', 'non-exclusive': 'Non-Exclusive', 'category-exclusive': 'Category Exclusive' };
  return map[ex] || ex || 'Non-Exclusive';
};

const formatDeliverableStatus = (status) => {
  const map = { 'pending': 'Pending', 'in-progress': 'In Progress', 'completed': 'Completed', 'verified': 'Verified ✓' };
  return map[status] || status;
};

const formatAction = (action) => {
  const map = {
    'created': 'Agreement Created',
    'sent-to-sponsor': 'Sent to Sponsor',
    'sponsor-signed': 'Sponsor Signed',
    'sent-to-club': 'Sent to Club',
    'club-signed': 'Club Signed',
    'activated': 'Agreement Activated',
    'deliverable-updated': 'Deliverable Updated',
    'terminated': 'Agreement Terminated'
  };
  return map[action] || action;
};

const fetchAgreement = async () => {
  try {
    const res = await fetch(`${API}/agreements/${route.params.id}?firebaseUid=${auth.user?.uid}`);
    if (!res.ok) throw new Error('Failed to fetch');
    agreement.value = await res.json();

    // Determine user role from auth store (not API call)
    const role = auth.userProfile?.role;
    console.log('[AgreementDetails] User role from auth store:', role);
    console.log('[AgreementDetails] Agreement status:', agreement.value?.status);
    
    if (role === 'sponsor') {
      userRole.value = 'sponsor';
    } else if (role === 'clubManager') {
      userRole.value = 'club';
    } else {
      userRole.value = null;
    }
    console.log('[AgreementDetails] Set userRole to:', userRole.value);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    loading.value = false;
  }
};

const goToSign = () => {
  router.push({ name: 'agreement-sign', params: { agreementId: agreement.value._id } });
};

const downloadPdf = async () => {
  window.open(`${API}/agreements/${agreement.value._id}/pdf?firebaseUid=${auth.user?.uid}`, '_blank');
};

const updateDeliverable = async (idx, status) => {
  try {
    const res = await fetch(`${API}/agreements/${agreement.value._id}/deliverables/${idx}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firebaseUid: auth.user?.uid, status })
    });
    if (!res.ok) throw new Error('Failed to update');
    await fetchAgreement();
  } catch (error) {
    alert('Failed to update deliverable');
  }
};

const showEvidenceModal = (idx) => {
  evidenceModalIdx.value = idx;
  evidenceForm.value = { type: 'link', url: '', description: '' };
};

const closeEvidenceModal = () => {
  evidenceModalIdx.value = null;
};

const submitEvidence = async () => {
  try {
    const res = await fetch(`${API}/agreements/${agreement.value._id}/deliverables/${evidenceModalIdx.value}/evidence`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firebaseUid: auth.user?.uid,
        evidenceType: evidenceForm.value.type,
        url: evidenceForm.value.url,
        description: evidenceForm.value.description
      })
    });
    if (!res.ok) throw new Error('Failed to add evidence');
    closeEvidenceModal();
    await fetchAgreement();
  } catch (error) {
    alert('Failed to add evidence');
  }
};

// Payment Functions
const fetchPayments = async () => {
  try {
    const res = await fetch(`${API}/agreements/${agreement.value._id}/payments?firebaseUid=${auth.user?.uid}`);
    if (res.ok) {
      const data = await res.json();
      transactions.value = data.transactions || [];
      
      // Calculate summary - always use agreement total for remaining calculation
      const agreementTotal = agreement.value?.financialTerms?.totalAmount || 0;
      const totalCompleted = data.summary?.totalCompleted || 0;
      const totalPending = data.summary?.totalPending || 0;
      
      paymentSummary.value = {
        totalCompleted,
        totalPending,
        remaining: agreementTotal - totalCompleted,
        agreementTotal
      };
    } else {
      // No transactions yet - set defaults based on agreement
      const agreementTotal = agreement.value?.financialTerms?.totalAmount || 0;
      paymentSummary.value = {
        totalCompleted: 0,
        totalPending: 0,
        remaining: agreementTotal,
        agreementTotal
      };
    }
  } catch (error) {
    console.error('Failed to fetch payments:', error);
    // Set defaults on error
    const agreementTotal = agreement.value?.financialTerms?.totalAmount || 0;
    paymentSummary.value = {
      totalCompleted: 0,
      totalPending: 0,
      remaining: agreementTotal,
      agreementTotal
    };
  }
};

const getMilestoneTransaction = (milestoneIndex) => {
  return transactions.value.find(tx => tx.milestoneIndex === milestoneIndex);
};

const formatTxStatus = (status) => {
  const map = {
    'pending': '⏳ Pending Approval',
    'approved': '✓ Approved',
    'rejected': '✗ Rejected',
    'processing': '⏳ Processing',
    'completed': '✓ Completed',
    'cancelled': '✗ Cancelled'
  };
  return map[status] || status;
};

const requestFund = async (milestoneIndex, milestone) => {
  if (!confirm(`Request fund release of ₹${milestone.amount.toLocaleString()} for "${milestone.milestone}"?`)) return;
  
  try {
    const res = await fetch(`${API}/agreements/${agreement.value._id}/payments/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firebaseUid: auth.user?.uid,
        milestoneIndex,
        amount: milestone.amount,
        notes: `Fund request for ${milestone.milestone}`
      })
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error);
    }
    
    alert('Fund request submitted successfully!');
    await fetchPayments();
  } catch (error) {
    alert(error.message || 'Failed to submit fund request');
  }
};

const processRequest = async (transactionId, action) => {
  const reason = action === 'reject' ? prompt('Please provide a reason for rejection:') : null;
  if (action === 'reject' && !reason) return;
  
  try {
    const res = await fetch(`${API}/agreements/${agreement.value._id}/payments/${transactionId}/process`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firebaseUid: auth.user?.uid,
        action,
        notes: action === 'approve' ? 'Request approved' : null,
        rejectionReason: reason
      })
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error);
    }
    
    alert(`Fund request ${action === 'approve' ? 'approved' : 'rejected'} successfully!`);
    await fetchPayments();
    await fetchAgreement();
  } catch (error) {
    alert(error.message || 'Failed to process request');
  }
};

const showCompleteModal = (transaction) => {
  completeModal.value = {
    show: true,
    transaction,
    paymentMethod: 'bank-transfer',
    reference: '',
    notes: ''
  };
};

const completePayment = async () => {
  try {
    const res = await fetch(`${API}/agreements/${agreement.value._id}/payments/${completeModal.value.transaction._id}/complete`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firebaseUid: auth.user?.uid,
        paymentMethod: completeModal.value.paymentMethod,
        transactionReference: completeModal.value.reference,
        notes: completeModal.value.notes
      })
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error);
    }
    
    alert('Payment marked as completed!');
    completeModal.value.show = false;
    await fetchPayments();
    await fetchAgreement();
  } catch (error) {
    alert(error.message || 'Failed to complete payment');
  }
};

const showReceiptModal = (transaction) => {
  receiptModal.value = {
    show: true,
    transaction,
    url: '',
    fileName: '',
    description: ''
  };
};

const uploadReceipt = async () => {
  try {
    const res = await fetch(`${API}/agreements/${agreement.value._id}/payments/${receiptModal.value.transaction._id}/receipt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firebaseUid: auth.user?.uid,
        url: receiptModal.value.url,
        fileName: receiptModal.value.fileName,
        description: receiptModal.value.description
      })
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error);
    }
    
    alert('Receipt uploaded successfully!');
    receiptModal.value.show = false;
    await fetchPayments();
  } catch (error) {
    alert(error.message || 'Failed to upload receipt');
  }
};

// Razorpay Payment
const payWithRazorpay = async (transaction) => {
  try {
    // Create Razorpay order
    const orderRes = await fetch(`${API}/agreements/${agreement.value._id}/payments/${transaction._id}/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firebaseUid: auth.user?.uid })
    });
    
    if (!orderRes.ok) {
      const error = await orderRes.json();
      throw new Error(error.error);
    }
    
    const orderData = await orderRes.json();
    
    // Load Razorpay script if not loaded
    if (!window.Razorpay) {
      await loadRazorpayScript();
    }
    
    // Open Razorpay checkout
    const options = {
      key: orderData.key,
      amount: orderData.amount,
      currency: orderData.currency,
      name: 'CrickArena',
      description: `Payment for ${transaction.milestoneName}`,
      order_id: orderData.orderId,
      handler: async function (response) {
        // Verify payment
        try {
          const verifyRes = await fetch(`${API}/agreements/${agreement.value._id}/payments/${transaction._id}/verify-payment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              firebaseUid: auth.user?.uid,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            })
          });
          
          if (!verifyRes.ok) {
            const error = await verifyRes.json();
            throw new Error(error.error);
          }
          
          const result = await verifyRes.json();
          alert(`Payment successful! Receipt: ${result.receiptNumber}`);
          await fetchPayments();
          await fetchAgreement();
        } catch (verifyError) {
          alert('Payment verification failed: ' + verifyError.message);
        }
      },
      prefill: {
        name: auth.userProfile?.name || '',
        email: auth.userProfile?.email || ''
      },
      theme: {
        color: '#10B981'
      }
    };
    
    const rzp = new window.Razorpay(options);
    rzp.open();
  } catch (error) {
    alert(error.message || 'Failed to initiate payment');
  }
};

const loadRazorpayScript = () => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });
};

const viewReceipt = (transaction) => {
  window.open(`${API}/agreements/${agreement.value._id}/payments/${transaction._id}/receipt?firebaseUid=${auth.user?.uid}`, '_blank');
};

onMounted(async () => {
  await fetchAgreement();
  if (agreement.value) {
    await fetchPayments();
  }
});
</script>

<style scoped>
.agreement-details {
  max-width: 1000px;
  margin: 0 auto;
  padding: 24px;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.back-btn {
  background: none;
  border: none;
  color: #6B7280;
  cursor: pointer;
  font-size: 16px;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

h1 {
  margin: 0;
  font-size: 24px;
  color: #111827;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
}

.status-badge.active { background: #D1FAE5; color: #065F46; }
.status-badge.pending-sponsor, .status-badge.pending-club { background: #FEF3C7; color: #92400E; }
.status-badge.completed { background: #E0E7FF; color: #3730A3; }
.status-badge.terminated { background: #FEE2E2; color: #991B1B; }

.loading-state, .error-state {
  text-align: center;
  padding: 60px;
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

@keyframes spin { to { transform: rotate(360deg); } }

.header-card {
  background: linear-gradient(135deg, #10B981, #059669);
  border-radius: 12px;
  padding: 24px;
  color: white;
  margin-bottom: 24px;
}

.agreement-number {
  font-size: 14px;
  opacity: 0.8;
  margin-bottom: 16px;
}

.parties-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  margin-bottom: 24px;
}

.party-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.party-logo {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: bold;
}

.sponsor-logo { background: rgba(255,255,255,0.2); }
.club-logo { background: rgba(255,255,255,0.2); }

.party-label {
  display: block;
  font-size: 12px;
  opacity: 0.8;
}

.party-name {
  display: block;
  font-weight: 600;
  font-size: 16px;
}

.connection-line {
  font-size: 24px;
}

.connection-active { color: #FCD34D; }
.connection-pending { opacity: 0.5; }

.quick-stats {
  display: flex;
  justify-content: space-around;
  background: rgba(255,255,255,0.1);
  border-radius: 8px;
  padding: 16px;
}

.stat { text-align: center; }
.stat-label { display: block; font-size: 12px; opacity: 0.8; }
.stat-value { font-weight: 600; }

.action-buttons {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.sign-btn, .download-btn {
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  border: none;
}

.sign-btn { background: #10B981; color: white; }
.download-btn { background: #F3F4F6; color: #374151; }

.tabs {
  display: flex;
  gap: 4px;
  background: #F3F4F6;
  padding: 4px;
  border-radius: 8px;
  margin-bottom: 24px;
}

.tab {
  flex: 1;
  padding: 10px 16px;
  background: none;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  color: #6B7280;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.tab.active { background: white; color: #111827; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
.tab-badge { background: #EF4444; color: white; padding: 2px 8px; border-radius: 10px; font-size: 12px; }

.tab-content { background: white; border-radius: 12px; border: 1px solid #E5E7EB; padding: 24px; }

.section-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; }

.section-card h3 { margin: 0 0 16px; color: #111827; font-size: 16px; }

.signature-status { display: flex; flex-direction: column; gap: 12px; }
.sig-row { display: flex; justify-content: space-between; align-items: center; padding: 12px; background: #F9FAFB; border-radius: 8px; }
.sig-party { font-weight: 500; }
.sig-signed { color: #10B981; font-size: 13px; }
.sig-pending { color: #F59E0B; background: #FEF3C7; padding: 4px 12px; border-radius: 12px; font-size: 13px; }

.terms-list { display: flex; flex-direction: column; gap: 12px; }
.term-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #F3F4F6; }
.term-label { color: #6B7280; }
.term-value { font-weight: 500; }

.deliverables-header { margin-bottom: 24px; }
.progress-bar { height: 8px; background: #E5E7EB; border-radius: 4px; overflow: hidden; }
.progress-fill { height: 100%; background: #10B981; transition: width 0.3s; }
.progress-text { display: block; text-align: right; margin-top: 8px; font-size: 14px; color: #6B7280; }

.deliverables-list { display: flex; flex-direction: column; gap: 16px; }

.deliverable-card { background: #F9FAFB; border-radius: 8px; padding: 16px; border-left: 4px solid #E5E7EB; }
.deliverable-card.completed { border-left-color: #10B981; }
.deliverable-card.verified { border-left-color: #3B82F6; background: #EFF6FF; }

.del-header { display: flex; justify-content: space-between; margin-bottom: 8px; }
.del-status { font-size: 12px; padding: 4px 8px; border-radius: 4px; }
.del-status.pending { background: #FEF3C7; color: #92400E; }
.del-status.completed { background: #D1FAE5; color: #065F46; }
.del-status.verified { background: #DBEAFE; color: #1E40AF; }
.del-due { font-size: 13px; color: #6B7280; }

.deliverable-card h4 { margin: 0 0 4px; }
.deliverable-card p { color: #6B7280; margin: 0 0 12px; font-size: 14px; }

.evidence-list { margin-bottom: 12px; }
.evidence-label { font-size: 13px; color: #6B7280; margin-right: 8px; }
.evidence-link { font-size: 13px; margin-right: 12px; color: #3B82F6; text-decoration: none; }

.del-actions { display: flex; gap: 8px; }
.action-btn { padding: 8px 16px; border-radius: 6px; font-size: 13px; cursor: pointer; border: none; }
.action-btn.complete { background: #D1FAE5; color: #065F46; }
.action-btn.verify { background: #DBEAFE; color: #1E40AF; }
.action-btn.evidence { background: #F3F4F6; color: #374151; }

.payment-summary { display: flex; justify-content: space-around; background: #F9FAFB; padding: 20px; border-radius: 8px; margin-bottom: 24px; }
.payment-stat { text-align: center; }
.payment-label { display: block; color: #6B7280; font-size: 13px; }
.payment-value { font-size: 20px; font-weight: 600; }
.payment-value.paid { color: #10B981; }
.payment-value.pending { color: #F59E0B; }

.payments-list { display: flex; flex-direction: column; gap: 12px; }
.payment-card { background: #F9FAFB; border-radius: 8px; padding: 16px; }
.payment-header { display: flex; justify-content: space-between; margin-bottom: 8px; }
.payment-milestone { font-weight: 500; }
.payment-status { font-size: 12px; padding: 4px 8px; border-radius: 4px; }
.payment-status.pending { background: #FEF3C7; color: #92400E; }
.payment-status.paid { background: #D1FAE5; color: #065F46; }
.payment-details { display: flex; justify-content: space-between; }
.payment-amount { font-weight: 600; color: #10B981; }
.payment-due { color: #6B7280; font-size: 13px; }

.history-timeline { position: relative; padding-left: 24px; }
.history-item { position: relative; padding-bottom: 24px; }
.history-item::before { content: ''; position: absolute; left: -20px; top: 8px; bottom: 0; width: 2px; background: #E5E7EB; }
.history-item:last-child::before { display: none; }
.history-dot { position: absolute; left: -24px; top: 4px; width: 10px; height: 10px; background: #10B981; border-radius: 50%; }
.history-action { display: block; font-weight: 500; color: #111827; }
.history-details { display: block; color: #6B7280; font-size: 14px; }
.history-meta { display: block; color: #9CA3AF; font-size: 12px; margin-top: 4px; }

.empty-state { text-align: center; padding: 40px; color: #6B7280; }

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal-content { background: white; border-radius: 12px; padding: 24px; width: 100%; max-width: 400px; }
.modal-content h3 { margin: 0 0 16px; }
.form-group { margin-bottom: 16px; }
.form-group label { display: block; font-weight: 500; margin-bottom: 6px; color: #374151; }
.form-group input, .form-group select { width: 100%; padding: 10px; border: 1px solid #D1D5DB; border-radius: 6px; }
.modal-actions { display: flex; gap: 12px; justify-content: flex-end; }
.cancel-btn { padding: 10px 20px; background: #F3F4F6; border: none; border-radius: 6px; cursor: pointer; }
.submit-btn { padding: 10px 20px; background: #10B981; color: white; border: none; border-radius: 6px; cursor: pointer; }
.submit-btn:disabled { background: #9CA3AF; }

/* Payment Action Buttons */
.payments-section { margin-top: 24px; }
.payments-section h3 { margin: 0 0 16px; font-size: 16px; color: #111827; }

.payment-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; padding-top: 12px; border-top: 1px solid #E5E7EB; }

.request-btn { padding: 8px 16px; background: #3B82F6; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; }
.approve-btn { padding: 6px 12px; background: #10B981; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; }
.reject-btn { padding: 6px 12px; background: #EF4444; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; }
.complete-btn { padding: 8px 16px; background: #8B5CF6; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; }
.receipt-btn { padding: 6px 12px; background: #F3F4F6; color: #374151; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; }

.tx-status { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
.tx-badge { font-size: 12px; padding: 4px 8px; border-radius: 4px; }
.tx-badge.pending { background: #FEF3C7; color: #92400E; }
.tx-badge.approved { background: #DBEAFE; color: #1E40AF; }
.tx-badge.completed { background: #D1FAE5; color: #065F46; }
.tx-badge.rejected { background: #FEE2E2; color: #991B1B; }

.payment-status-badge { font-size: 13px; padding: 4px 10px; border-radius: 12px; }
.payment-status-badge.pending { background: #FEF3C7; color: #92400E; }
.payment-status-badge.paid { background: #D1FAE5; color: #065F46; }

/* Transaction History */
.transactions-list { display: flex; flex-direction: column; gap: 12px; }
.transaction-item { background: #F9FAFB; border-radius: 8px; padding: 16px; border-left: 4px solid #E5E7EB; }
.transaction-item:has(.tx-status-badge.completed) { border-left-color: #10B981; }
.transaction-item:has(.tx-status-badge.pending) { border-left-color: #F59E0B; }

.tx-header { display: flex; justify-content: space-between; margin-bottom: 8px; }
.tx-type { font-weight: 500; }
.tx-status-badge { font-size: 12px; padding: 4px 8px; border-radius: 4px; }
.tx-status-badge.pending { background: #FEF3C7; color: #92400E; }
.tx-status-badge.approved { background: #DBEAFE; color: #1E40AF; }
.tx-status-badge.completed { background: #D1FAE5; color: #065F46; }
.tx-status-badge.rejected { background: #FEE2E2; color: #991B1B; }

.tx-details { display: flex; justify-content: space-between; margin-bottom: 8px; }
.tx-amount { font-size: 18px; font-weight: 600; color: #10B981; }
.tx-milestone { color: #6B7280; }
.tx-meta { font-size: 12px; color: #9CA3AF; }

.tx-receipts { margin-top: 12px; padding-top: 12px; border-top: 1px dashed #E5E7EB; }
.receipts-label { font-size: 13px; color: #6B7280; margin-right: 8px; }
.receipt-link { font-size: 13px; color: #3B82F6; text-decoration: none; margin-right: 12px; }
.receipt-link:hover { text-decoration: underline; }

/* Waiting Message */
.waiting-message { margin-top: 12px; padding: 12px; background: #FEF3C7; border-radius: 8px; color: #92400E; font-size: 13px; }

/* Razorpay Pay Now Button */
.pay-now-btn { 
  padding: 8px 16px; 
  background: linear-gradient(135deg, #10B981, #059669); 
  color: white; 
  border: none; 
  border-radius: 6px; 
  cursor: pointer; 
  font-size: 13px; 
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3);
}
.pay-now-btn:hover { background: linear-gradient(135deg, #059669, #047857); }

/* View Receipt Button */
.view-receipt-btn { 
  padding: 6px 12px; 
  background: #EFF6FF; 
  color: #1E40AF; 
  border: 1px solid #DBEAFE; 
  border-radius: 6px; 
  cursor: pointer; 
  font-size: 13px; 
}
.view-receipt-btn:hover { background: #DBEAFE; }
</style>
