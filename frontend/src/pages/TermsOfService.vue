<template>
  <div class="relative min-h-screen">
    <!-- Animated Cricket Background -->
    <AnimatedCricketBackground />
    
    <!-- Content Container -->
    <div class="relative z-10 max-w-5xl mx-auto px-4 py-12">
      <!-- Hero Section -->
      <div class="text-center mb-12 glass-panel-hero rounded-3xl p-12">
        <div class="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-sm border border-orange-400/30 text-white px-4 py-2 rounded-full text-sm font-semibold mb-6">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          Legal Agreement
        </div>
        <h1 class="text-5xl font-black text-white mb-4 neon-gradient">Terms of Service</h1>
        <p class="text-xl text-gray-300 max-w-2xl mx-auto">Please read these terms carefully before using CrickArena</p>
        <p class="text-sm text-gray-400 mt-4">Last Updated: December 14, 2025</p>
      </div>

      <!-- Table of Contents -->
      <div class="glass-panel rounded-3xl p-8 mb-8">
        <h2 class="text-2xl font-bold text-white mb-4">Table of Contents</h2>
        <nav class="grid md:grid-cols-2 gap-3">
          <a v-for="(section, index) in sections" :key="index" 
             :href="`#section-${index}`"
             class="text-green-400 hover:text-green-300 transition-colors text-sm flex items-center gap-2"
             @click.prevent="scrollToSection(index)">
            <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
            {{ index + 1 }}. {{ section.title }}
          </a>
        </nav>
      </div>

      <!-- Terms of Service Sections -->
      <div class="space-y-6">
        <div v-for="(section, index) in sections" :key="index" :id="`section-${index}`" class="glass-panel rounded-3xl p-8 scroll-mt-8">
          <h2 class="text-2xl font-bold text-white mb-4 flex items-center gap-3">
            <span class="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center text-white text-sm font-bold">{{ index + 1 }}</span>
            {{ section.title }}
          </h2>
          <div v-html="section.content" class="text-gray-300 space-y-4 leading-relaxed terms-content"></div>
        </div>
      </div>

      <!-- Contact Section -->
      <div class="mt-12 glass-panel-strong rounded-3xl p-10 text-center">
        <h2 class="text-3xl font-bold text-white mb-4">Questions About These Terms?</h2>
        <p class="text-gray-300 text-lg mb-6">If you have any questions or concerns, please contact us</p>
        <div class="flex flex-wrap justify-center gap-4">
          <RouterLink to="/contact" class="btn-primary px-8 py-4 rounded-2xl font-bold text-lg">
            Contact Us
          </RouterLink>
          <a href="mailto:crickarena201@gmail.com" class="btn-secondary px-8 py-4 rounded-2xl font-bold text-lg">
            Email Support
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router';
import AnimatedCricketBackground from '../components/AnimatedCricketBackground.vue';

const sections = [
  {
    title: 'Acceptance of Terms',
    content: `
      <p>Welcome to CrickArena! By accessing or using our platform, you agree to be bound by these Terms of Service ("Terms").</p>
      <p class="mt-4">If you do not agree to these Terms, please do not use CrickArena. Your continued use of the platform signifies your acceptance of these Terms and any future modifications.</p>
      <p class="mt-4">These Terms constitute a legally binding agreement between you and CrickArena. We may update these Terms from time to time, and we will notify you of material changes.</p>
    `
  },
  {
    title: 'User Accounts & Registration',
    content: `
      <p>To access certain features of CrickArena, you must create an account:</p>
      <ul class="list-disc pl-6 space-y-2 mt-3">
        <li><strong>Eligibility:</strong> You must be at least 13 years old to use CrickArena. Users under 18 should have parental consent.</li>
        <li><strong>Accurate Information:</strong> You agree to provide accurate, current, and complete information during registration.</li>
        <li><strong>Account Security:</strong> You are responsible for maintaining the confidentiality of your account credentials.</li>
        <li><strong>Single Account:</strong> Each user may maintain only one account. Multiple accounts may be terminated.</li>
        <li><strong>Account Suspension:</strong> We reserve the right to suspend or terminate accounts that violate these Terms.</li>
      </ul>
      <p class="mt-4">You are solely responsible for all activities that occur under your account.</p>
    `
  },
  {
    title: 'User Roles & Responsibilities',
    content: `
      <p>CrickArena supports four user roles, each with specific responsibilities:</p>
      
      <h3 class="text-lg font-semibold text-white mt-6 mb-2">Players</h3>
      <ul class="list-disc pl-6 space-y-1">
        <li>Create and maintain accurate player profiles</li>
        <li>Join clubs with manager approval</li>
        <li>Participate in tournaments representing their clubs</li>
        <li>Maintain good sportsmanship and conduct</li>
      </ul>
      
      <h3 class="text-lg font-semibold text-white mt-6 mb-2">Club Managers</h3>
      <ul class="list-disc pl-6 space-y-1">
        <li>Register and manage cricket clubs</li>
        <li>Provide accurate club information and documentation</li>
        <li>Manage club rosters and player registrations</li>
        <li>Register clubs for tournaments</li>
        <li>Ensure compliance with tournament rules</li>
      </ul>
      
      <h3 class="text-lg font-semibold text-white mt-6 mb-2">Coaches</h3>
      <ul class="list-disc pl-6 space-y-1">
        <li>Provide accurate coaching credentials</li>
        <li>Manage player training and development</li>
        <li>Track and report player progress</li>
        <li>Maintain professional conduct</li>
      </ul>
      
      <h3 class="text-lg font-semibold text-white mt-6 mb-2">Admins</h3>
      <ul class="list-disc pl-6 space-y-1">
        <li>Approve/reject club registrations</li>
        <li>Create and manage tournaments</li>
        <li>Generate fixtures and schedules</li>
        <li>Maintain platform integrity</li>
      </ul>
    `
  },
  {
    title: 'Club Registration & Management',
    content: `
      <p>Club managers must adhere to the following guidelines:</p>
      <ul class="list-disc pl-6 space-y-2 mt-3">
        <li><strong>Truthful Information:</strong> All club information (name, location, ground details) must be accurate and verifiable.</li>
        <li><strong>Documentation:</strong> Provide valid documentation for club registration as requested by admins.</li>
        <li><strong>Logo Rights:</strong> Ensure you have the right to use any logos or images uploaded.</li>
        <li><strong>Active Management:</strong> Maintain an active presence and respond to player requests in a timely manner.</li>
        <li><strong>Approval Process:</strong> Club registrations are subject to admin approval (typically within 24-48 hours).</li>
        <li><strong>One Club per Manager:</strong> Each manager can manage one primary club unless special permission is granted.</li>
      </ul>
    `
  },
  {
    title: 'Tournament Creation & Participation',
    content: `
      <p><strong>For Tournament Organizers (Admins):</strong></p>
      <ul class="list-disc pl-6 space-y-2 mt-3">
        <li>Provide accurate tournament details (name, dates, format, rules, venues)</li>
        <li>Set clear eligibility criteria and entry fees (if applicable)</li>
        <li>Generate fixtures fairly and transparently</li>
        <li>Update match results accurately and promptly</li>
        <li>Handle disputes fairly and professionally</li>
      </ul>
      
      <p class="mt-6"><strong>For Participants (Clubs):</strong></p>
      <ul class="list-disc pl-6 space-y-2 mt-3">
        <li>Register clubs truthfully and provide required information</li>
        <li>Pay entry fees (if applicable) by the deadline</li>
        <li>Adhere to tournament rules and schedules</li>
        <li>Field eligible players only</li>
        <li>Accept match results and tournament decisions</li>
        <li>Maintain sportsmanship and respect for opponents</li>
      </ul>
    `
  },
  {
    title: 'Payment & Refunds',
    content: `
      <p>Some tournaments may have entry fees. The following applies to payments:</p>
      <ul class="list-disc pl-6 space-y-2 mt-3">
        <li><strong>Payment Processing:</strong> Payments are processed through secure third-party providers.</li>
        <li><strong>Entry Fees:</strong> Tournament entry fees are set by organizers. CrickArena does not control pricing.</li>
        <li><strong>Payment Confirmation:</strong> You must receive payment confirmation before being added to tournament participants.</li>
        <li><strong>Refund Policy:</strong> Refunds are at the discretion of tournament organizers. Generally:
          <ul class="list-disc pl-6 mt-2">
            <li>Refunds may be available if the tournament is canceled</li>
            <li>No refunds after registration deadline passes</li>
            <li>No refunds for voluntary withdrawals after confirmation</li>
          </ul>
        </li>
        <li><strong>Disputes:</strong> Payment disputes should be directed to the tournament organizer first, then CrickArena support.</li>
      </ul>
    `
  },
  {
    title: 'Content & Conduct',
    content: `
      <p>You agree to the following content and conduct standards:</p>
      
      <h3 class="text-lg font-semibold text-white mt-6 mb-2">Prohibited Content</h3>
      <ul class="list-disc pl-6 space-y-1">
        <li>Offensive, abusive, or harassing content</li>
        <li>False, misleading, or fraudulent information</li>
        <li>Content that infringes intellectual property rights</li>
        <li>Spam, advertisements, or unsolicited promotions</li>
        <li>Malicious code, viruses, or harmful software</li>
      </ul>
      
      <h3 class="text-lg font-semibold text-white mt-6 mb-2">Prohibited Conduct</h3>
      <ul class="list-disc pl-6 space-y-1">
        <li>Impersonating others or creating fake profiles</li>
        <li>Manipulating match results or statistics</li>
        <li>Attempting to access unauthorized areas of the platform</li>
        <li>Interfering with platform operations or other users</li>
        <li>Scraping or automated data collection</li>
        <li>Using the platform for illegal activities</li>
      </ul>
      
      <p class="mt-4">Violations may result in content removal, account suspension, or legal action.</p>
    `
  },
  {
    title: 'Intellectual Property Rights',
    content: `
      <p><strong>CrickArena's Rights:</strong></p>
      <p class="mt-2">All platform content, including design, code, logos, and trademarks, are owned by CrickArena and protected by intellectual property laws.</p>
      
      <p class="mt-6"><strong>Your Rights:</strong></p>
      <p class="mt-2">You retain ownership of content you upload (club logos, player photos, etc.). By uploading, you grant CrickArena a license to use, display, and distribute this content as necessary to provide our services.</p>
      
      <p class="mt-6"><strong>Restrictions:</strong></p>
      <ul class="list-disc pl-6 space-y-2 mt-3">
        <li>You may not copy, modify, or create derivative works of platform content</li>
        <li>You may not reverse engineer or decompile the platform</li>
        <li>You may not use CrickArena branding without permission</li>
        <li>You may not commercialize platform content without authorization</li>
      </ul>
    `
  },
  {
    title: 'Disclaimers & Limitations of Liability',
    content: `
      <p><strong>Service "As Is":</strong></p>
      <p class="mt-2">CrickArena is provided "as is" and "as available" without warranties of any kind, express or implied. We do not guarantee uninterrupted, error-free, or secure service.</p>
      
      <p class="mt-6"><strong>No Liability for User Conduct:</strong></p>
      <p class="mt-2">We are not responsible for the conduct of users, including players, clubs, or tournament organizers. You interact with other users at your own risk.</p>
      
      <p class="mt-6"><strong>Limitation of Liability:</strong></p>
      <p class="mt-2">To the maximum extent permitted by law, CrickArena shall not be liable for:</p>
      <ul class="list-disc pl-6 space-y-2 mt-3">
        <li>Indirect, incidental, or consequential damages</li>
        <li>Loss of data or profits</li>
        <li>Injuries sustained during cricket activities organized through the platform</li>
        <li>Disputes between users</li>
        <li>Third-party actions or content</li>
      </ul>
      
      <p class="mt-4">Our total liability shall not exceed the amount paid by you (if any) for using the platform.</p>
    `
  },
  {
    title: 'Indemnification',
    content: `
      <p>You agree to indemnify and hold harmless CrickArena, its affiliates, and personnel from any claims, damages, losses, or expenses (including legal fees) arising from:</p>
      <ul class="list-disc pl-6 space-y-2 mt-3">
        <li>Your use of the platform</li>
        <li>Your violation of these Terms</li>
        <li>Your violation of any third-party rights</li>
        <li>Content you upload or submit</li>
        <li>Any activities related to your account</li>
      </ul>
    `
  },
  {
    title: 'Dispute Resolution',
    content: `
      <p><strong>Informal Resolution:</strong></p>
      <p class="mt-2">Before pursuing formal dispute resolution, please contact us at <a href="mailto:crickarena201@gmail.com" class="text-green-400 underline">crickarena201@gmail.com</a> to attempt an informal resolution.</p>
      
      <p class="mt-6"><strong>Governing Law:</strong></p>
      <p class="mt-2">These Terms shall be governed by and construed in accordance with the laws of India, without regard to conflict of law principles.</p>
      
      <p class="mt-6"><strong>Jurisdiction:</strong></p>
      <p class="mt-2">Any legal disputes arising from these Terms or your use of CrickArena shall be subject to the exclusive jurisdiction of courts in Kerala, India.</p>
      
      <p class="mt-6"><strong>Arbitration:</strong></p>
      <p class="mt-2">For disputes above a certain threshold, parties may agree to binding arbitration as an alternative to litigation.</p>
    `
  },
  {
    title: 'Termination',
    content: `
      <p>Either party may terminate this agreement:</p>
      
      <p class="mt-4"><strong>Your Right to Terminate:</strong></p>
      <p class="mt-2">You may delete your account at any time through your account settings or by contacting support.</p>
      
      <p class="mt-6"><strong>Our Right to Terminate:</strong></p>
      <p class="mt-2">We may suspend or terminate your account if you:</p>
      <ul class="list-disc pl-6 space-y-2 mt-3">
        <li>Violate these Terms</li>
        <li>Engage in fraudulent or illegal activity</li>
        <li>Cause harm to other users or the platform</li>
        <li>Remain inactive for an extended period</li>
      </ul>
      
      <p class="mt-6"><strong>Effect of Termination:</strong></p>
      <ul class="list-disc pl-6 space-y-2 mt-3">
        <li>Your access to the platform will cease</li>
        <li>Your account data may be deleted (subject to legal retention)</li>
        <li>Historical tournament data may be retained</li>
        <li>Provisions regarding liability, indemnification, and intellectual property survive termination</li>
      </ul>
    `
  },
  {
    title: 'Changes to Terms',
    content: `
      <p>We reserve the right to modify these Terms at any time. When we make changes:</p>
      <ul class="list-disc pl-6 space-y-2 mt-3">
        <li>We will update the "Last Updated" date</li>
        <li>We will notify you via email or platform notification</li>
        <li>Material changes will require your acceptance</li>
        <li>Continued use after changes constitutes acceptance</li>
      </ul>
      <p class="mt-4">If you do not agree to the modified Terms, you must stop using CrickArena.</p>
    `
  },
  {
    title: 'Miscellaneous',
    content: `
      <p><strong>Entire Agreement:</strong> These Terms, along with our Privacy Policy, constitute the entire agreement between you and CrickArena.</p>
      
      <p class="mt-4"><strong>Severability:</strong> If any provision is found unenforceable, the remaining provisions remain in effect.</p>
      
      <p class="mt-4"><strong>No Waiver:</strong> Failure to enforce any right does not constitute a waiver of that right.</p>
      
      <p class="mt-4"><strong>Assignment:</strong> You may not assign these Terms. We may assign our rights and obligations without restriction.</p>
      
      <p class="mt-4"><strong>Notices:</strong> Official notices will be sent to your registered email address.</p>
      
      <p class="mt-4"><strong>Force Majeure:</strong> We are not liable for delays or failures due to circumstances beyond our control.</p>
    `
  },
  {
    title: 'Contact Information',
    content: `
      <p>For questions about these Terms of Service, please contact us:</p>
      <div class="mt-4 p-6 bg-white/5 rounded-xl border border-green-400/30">
        <p><strong class="text-white">Email:</strong> <a href="mailto:crickarena201@gmail.com" class="text-green-400 underline">crickarena201@gmail.com</a></p>
        <p class="mt-2"><strong class="text-white">Platform:</strong> CrickArena</p>
        <p class="mt-2"><strong class="text-white">Location:</strong> Kerala, India</p>
        <p class="mt-2"><strong class="text-white">Response Time:</strong> We typically respond within 1-2 business days</p>
      </div>
      
      <p class="mt-6">By using CrickArena, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.</p>
    `
  }
];

function scrollToSection(index) {
  const element = document.getElementById(`section-${index}`);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
</script>

<style scoped>
.terms-content :deep(a) {
  color: #10b981;
  text-decoration: underline;
}

.terms-content :deep(a:hover) {
  color: #00ff88;
}

.terms-content :deep(strong) {
  color: #fff;
  font-weight: 600;
}

.terms-content :deep(h3) {
  color: #fff;
  font-weight: 700;
}

.terms-content :deep(ul) {
  color: #d1d5db;
}

.scroll-mt-8 {
  scroll-margin-top: 2rem;
}
</style>