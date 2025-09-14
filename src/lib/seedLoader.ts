import { 
  useComplianceStore,
  usePaymentCycleStore,
  useLeadStore,
  useCaseStore,
  useClientDocumentStore,
  useMessageStore,
  useAppointmentStore,
  useJobStore,
  useApplicantStore,
  useInterviewStore,
  useOnboardingStore
} from './stores';

// Import seed data
import complianceData from '@/mocks/seed/compliance.json';
import paymentCyclesData from '@/mocks/seed/payment-cycles.json';
import leadsData from '@/mocks/seed/leads.json';
import casesData from '@/mocks/seed/cases.json';
import documentsData from '@/mocks/seed/documents.json';
import messagesData from '@/mocks/seed/messages.json';
import appointmentsData from '@/mocks/seed/appointments.json';
import jobsData from '@/mocks/seed/jobs.json';
import applicantsData from '@/mocks/seed/applicants.json';
import interviewsData from '@/mocks/seed/interviews.json';
import onboardingData from '@/mocks/seed/onboarding.json';

let isInitialized = false;

export const initializeSeedData = () => {
  if (isInitialized) return;

  console.log('Initializing seed data...');

  // Initialize compliance documents
  const complianceStore = useComplianceStore.getState();
  (complianceData as any[]).forEach(doc => {
    complianceStore.documents.push(doc as any);
  });

  // Initialize payment cycles
  const paymentCycleStore = usePaymentCycleStore.getState();
  (paymentCyclesData as any[]).forEach(cycle => {
    paymentCycleStore.cycles.push(cycle as any);
  });

  // Initialize leads
  const leadStore = useLeadStore.getState();
  (leadsData as any[]).forEach(lead => {
    leadStore.leads.push(lead as any);
  });

  // Initialize cases
  const caseStore = useCaseStore.getState();
  (casesData as any[]).forEach(caseItem => {
    caseStore.cases.push(caseItem as any);
  });

  // Initialize client documents
  const clientDocumentStore = useClientDocumentStore.getState();
  (documentsData as any[]).forEach(doc => {
    clientDocumentStore.documents.push(doc as any);
  });

  // Initialize message threads
  const messageStore = useMessageStore.getState();
  (messagesData as any[]).forEach(thread => {
    messageStore.threads.push(thread as any);
  });

  // Initialize appointments
  const appointmentStore = useAppointmentStore.getState();
  (appointmentsData as any[]).forEach(appointment => {
    appointmentStore.appointments.push(appointment as any);
  });

  // Initialize HR data
  const jobStore = useJobStore.getState();
  (jobsData as any[]).forEach(job => {
    jobStore.jobs.push(job as any);
  });

  const applicantStore = useApplicantStore.getState();
  (applicantsData as any[]).forEach(applicant => {
    applicantStore.applicants.push(applicant as any);
  });

  const interviewStore = useInterviewStore.getState();
  (interviewsData as any[]).forEach(interview => {
    interviewStore.interviews.push(interview as any);
  });

  const onboardingStore = useOnboardingStore.getState();
  (onboardingData as any[]).forEach(record => {
    onboardingStore.onboarding.push(record as any);
  });

  isInitialized = true;
  console.log('Seed data initialized successfully');
};

// Initialize data on app startup
if (typeof window !== 'undefined') {
  // Only run in browser environment
  setTimeout(() => {
    initializeSeedData();
  }, 100);
}