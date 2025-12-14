<template>
  <div class="relative min-h-screen">
    <!-- Animated Cricket Background -->
    <AnimatedCricketBackground />
    
    <!-- Content Container -->
    <div class="relative z-10 max-w-5xl mx-auto px-4 py-12">
      <!-- Hero Section -->
      <div class="text-center mb-12 glass-panel-hero rounded-3xl p-12">
        <div class="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-purple-400/30 text-white px-4 py-2 rounded-full text-sm font-semibold mb-6">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
          </svg>
          Legal Information
        </div>
        <h1 class="text-5xl font-black text-white mb-4 neon-gradient">Privacy Policy</h1>
        <p class="text-xl text-gray-300 max-w-2xl mx-auto">Your privacy matters to us</p>
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

      <!-- Privacy Policy Sections -->
      <div class="space-y-6">
        <div v-for="(section, index) in sections" :key="index" :id="`section-${index}`" class="glass-panel rounded-3xl p-8 scroll-mt-8">
          <h2 class="text-2xl font-bold text-white mb-4 flex items-center gap-3">
            <span class="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-gray-900 text-sm font-bold">{{ index + 1 }}</span>
            {{ section.title }}
          </h2>
          <div v-html="section.content" class="text-gray-300 space-y-4 leading-relaxed privacy-content"></div>
        </div>
      </div>

      <!-- Contact Section -->
      <div class="mt-12 glass-panel-strong rounded-3xl p-10 text-center">
        <h2 class="text-3xl font-bold text-white mb-4">Questions About Privacy?</h2>
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
    title: 'Information We Collect',
    content: `
      <p>We collect information that you provide directly to us when using CrickArena:</p>
      <ul class="list-disc pl-6 space-y-2 mt-3">
        <li><strong>Account Information:</strong> Name, email address, password, role (player, club manager, coach, or admin), and profile details.</li>
        <li><strong>Club Information:</strong> Club name, district, city, ground details, contact information, and club logo (if you're a club manager).</li>
        <li><strong>Player Data:</strong> Playing statistics, performance data, club affiliations, and tournament participation.</li>
        <li><strong>Tournament Data:</strong> Tournament registrations, match schedules, scores, and results.</li>
        <li><strong>Communication Data:</strong> Messages, support inquiries, and feedback you send through our platform.</li>
        <li><strong>Payment Information:</strong> When processing tournament fees, we collect payment details through secure third-party payment processors.</li>
        <li><strong>Usage Data:</strong> Information about how you interact with our platform, including pages visited, features used, and time spent.</li>
        <li><strong>Device Information:</strong> IP address, browser type, operating system, and device identifiers for security and analytics.</li>
      </ul>
    `
  },
  {
    title: 'How We Use Your Information',
    content: `
      <p>We use the collected information for the following purposes:</p>
      <ul class="list-disc pl-6 space-y-2 mt-3">
        <li><strong>Platform Operation:</strong> To provide, maintain, and improve CrickArena's features and functionality.</li>
        <li><strong>Account Management:</strong> To create and manage your account, authenticate your identity, and provide role-based access.</li>
        <li><strong>Tournament Services:</strong> To facilitate tournament registrations, generate fixtures, track match results, and manage club participation.</li>
        <li><strong>Communication:</strong> To send you important updates, notifications about tournaments, match schedules, and system announcements.</li>
        <li><strong>Analytics:</strong> To understand user behavior, improve our services, and develop new features.</li>
        <li><strong>Security:</strong> To protect against unauthorized access, fraud, and abuse of our platform.</li>
        <li><strong>Legal Compliance:</strong> To comply with applicable laws, regulations, and legal processes.</li>
      </ul>
    `
  },
  {
    title: 'Data Storage & Security',
    content: `
      <p>We take the security of your data seriously:</p>
      <ul class="list-disc pl-6 space-y-2 mt-3">
        <li><strong>Data Storage:</strong> Your data is stored securely on cloud servers using industry-standard encryption.</li>
        <li><strong>Firebase Authentication:</strong> We use Firebase for secure user authentication with encrypted password storage.</li>
        <li><strong>Database Security:</strong> MongoDB databases are protected with access controls, encryption at rest, and regular backups.</li>
        <li><strong>HTTPS Encryption:</strong> All data transmitted between your device and our servers is encrypted using HTTPS/TLS.</li>
        <li><strong>Access Controls:</strong> Only authorized personnel have access to user data, with strict role-based permissions.</li>
        <li><strong>Regular Audits:</strong> We conduct regular security audits and vulnerability assessments.</li>
      </ul>
      <p class="mt-4">While we implement robust security measures, no system is 100% secure. You are responsible for maintaining the confidentiality of your account credentials.</p>
    `
  },
  {
    title: 'Cookies & Tracking Technologies',
    content: `
      <p>CrickArena uses cookies and similar tracking technologies to enhance your experience:</p>
      <ul class="list-disc pl-6 space-y-2 mt-3">
        <li><strong>Essential Cookies:</strong> Required for authentication, session management, and core platform functionality.</li>
        <li><strong>Analytics Cookies:</strong> Used to understand how users interact with our platform and identify areas for improvement.</li>
        <li><strong>Preference Cookies:</strong> Remember your settings and preferences for a personalized experience.</li>
      </ul>
      <p class="mt-4">You can control cookie preferences through your browser settings, but disabling certain cookies may limit platform functionality.</p>
    `
  },
  {
    title: 'Third-Party Services',
    content: `
      <p>We use trusted third-party services to operate CrickArena:</p>
      <ul class="list-disc pl-6 space-y-2 mt-3">
        <li><strong>Firebase (Google):</strong> For user authentication and real-time database services. See <a href="https://firebase.google.com/support/privacy" target="_blank" rel="noopener" class="text-green-400 underline">Firebase Privacy</a>.</li>
        <li><strong>MongoDB Atlas:</strong> For database hosting and storage services.</li>
        <li><strong>Email Service Providers:</strong> For sending transactional emails and notifications.</li>
        <li><strong>Payment Processors:</strong> For processing tournament entry fees (when applicable).</li>
        <li><strong>Cloud Hosting:</strong> For server infrastructure and content delivery.</li>
      </ul>
      <p class="mt-4">These third parties have their own privacy policies governing the use of your information.</p>
    `
  },
  {
    title: 'Data Sharing & Disclosure',
    content: `
      <p>We do not sell your personal information. We may share data in limited circumstances:</p>
      <ul class="list-disc pl-6 space-y-2 mt-3">
        <li><strong>Public Information:</strong> Club names, tournament details, match results, and player statistics may be publicly visible on the platform.</li>
        <li><strong>Service Providers:</strong> We share data with third-party providers who help us operate the platform (hosting, email, payments).</li>
        <li><strong>Legal Requirements:</strong> We may disclose data if required by law, court order, or government regulations.</li>
        <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets, user data may be transferred to the acquiring entity.</li>
        <li><strong>With Your Consent:</strong> We may share data for other purposes with your explicit consent.</li>
      </ul>
    `
  },
  {
    title: 'Your Rights & Choices',
    content: `
      <p>You have the following rights regarding your personal data:</p>
      <ul class="list-disc pl-6 space-y-2 mt-3">
        <li><strong>Access:</strong> You can request a copy of the personal data we hold about you.</li>
        <li><strong>Correction:</strong> You can update or correct inaccurate information through your profile settings.</li>
        <li><strong>Deletion:</strong> You can request deletion of your account and associated data (subject to legal retention requirements).</li>
        <li><strong>Data Portability:</strong> You can request your data in a machine-readable format.</li>
        <li><strong>Opt-Out:</strong> You can opt-out of non-essential communications through your account settings.</li>
        <li><strong>Object to Processing:</strong> You can object to certain types of data processing.</li>
      </ul>
      <p class="mt-4">To exercise these rights, please contact us at <a href="mailto:crickarena201@gmail.com" class="text-green-400 underline">crickarena201@gmail.com</a>.</p>
    `
  },
  {
    title: "Children's Privacy",
    content: `
      <p>CrickArena is intended for users aged 13 and above. We do not knowingly collect personal information from children under 13.</p>
      <p class="mt-4">If you are a parent or guardian and believe your child under 13 has provided us with personal information, please contact us immediately at <a href="mailto:crickarena201@gmail.com" class="text-green-400 underline">crickarena201@gmail.com</a>. We will delete such information from our systems.</p>
      <p class="mt-4">Users between 13-18 should have parental consent before using the platform, especially for tournament participation.</p>
    `
  },
  {
    title: 'International Users',
    content: `
      <p>CrickArena primarily serves users in Kerala, India. However, we may have users from other locations.</p>
      <p class="mt-4">Your information may be transferred to and processed in countries other than your own. By using CrickArena, you consent to the transfer of your information to India and other countries where our service providers operate.</p>
      <p class="mt-4">We comply with applicable data protection laws and implement appropriate safeguards for international data transfers.</p>
    `
  },
  {
    title: 'Data Retention',
    content: `
      <p>We retain your personal data for as long as necessary to provide our services and comply with legal obligations:</p>
      <ul class="list-disc pl-6 space-y-2 mt-3">
        <li><strong>Active Accounts:</strong> Data is retained while your account is active.</li>
        <li><strong>Deleted Accounts:</strong> After account deletion, we may retain certain data for up to 90 days for recovery purposes.</li>
        <li><strong>Legal Requirements:</strong> We may retain data longer if required by law or for legal proceedings.</li>
        <li><strong>Historical Records:</strong> Tournament results and match statistics may be retained permanently for historical purposes.</li>
      </ul>
    `
  },
  {
    title: 'Changes to This Policy',
    content: `
      <p>We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements.</p>
      <p class="mt-4">When we make material changes, we will:</p>
      <ul class="list-disc pl-6 space-y-2 mt-3">
        <li>Update the "Last Updated" date at the top of this policy</li>
        <li>Notify you via email or through a prominent notice on the platform</li>
        <li>Obtain your consent if required by law</li>
      </ul>
      <p class="mt-4">Your continued use of CrickArena after changes become effective constitutes acceptance of the updated policy.</p>
    `
  },
  {
    title: 'Contact Us',
    content: `
      <p>If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:</p>
      <div class="mt-4 p-6 bg-white/5 rounded-xl border border-green-400/30">
        <p><strong class="text-white">Email:</strong> <a href="mailto:crickarena201@gmail.com" class="text-green-400 underline">crickarena201@gmail.com</a></p>
        <p class="mt-2"><strong class="text-white">Platform:</strong> CrickArena</p>
        <p class="mt-2"><strong class="text-white">Response Time:</strong> We typically respond within 1-2 business days</p>
      </div>
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
.privacy-content :deep(a) {
  color: #10b981;
  text-decoration: underline;
}

.privacy-content :deep(a:hover) {
  color: #00ff88;
}

.privacy-content :deep(strong) {
  color: #fff;
  font-weight: 600;
}

.privacy-content :deep(ul) {
  color: #d1d5db;
}

.scroll-mt-8 {
  scroll-margin-top: 2rem;
}
</style>