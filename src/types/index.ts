// ============================================================
// AlignIQ Type Definitions
// ============================================================

// --- Enums ---

export type UserRole = 'EMPLOYEE' | 'MANAGER' | 'ADMIN';

export type ThrustArea = 'Sales' | 'Operations' | 'HR' | 'Marketing' | 'IT' | 'Other';

export type UoMType = 'MIN' | 'MAX' | 'TIMELINE' | 'ZERO';

export type GoalStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'LOCKED' | 'REJECTED';

export type CheckInStatus = 'NOT_STARTED' | 'ON_TRACK' | 'COMPLETED';

export type Quarter = 'Q1' | 'Q2' | 'Q3' | 'Q4';

export type CyclePhase = 'PHASE1' | 'Q1' | 'Q2' | 'Q3' | 'Q4';

export type NotificationChannel = 'in-app' | 'email' | 'teams';

export type EscalationTrigger =
  | 'goal-not-submitted'
  | 'goal-not-approved'
  | 'checkin-not-completed';

export type EscalationStatus = 'pending' | 'escalated' | 'resolved';

// --- Models ---

export interface AzureAdUser {
  azureAdId: string;
  jobTitle: string;
  officeLocation: string;
  azureGroups: string[]; // e.g. ['AlignIQ-Managers', 'IT-Department']
  managerAzureId: string | null;
  accountEnabled: boolean;
  lastSyncedAt: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  department: ThrustArea;
  managerId: string | null;
  avatar?: string;
  createdAt: string;
  // Azure AD fields (populated on SSO sync)
  azureAdId?: string;
  jobTitle?: string;
  officeLocation?: string;
  azureGroups?: string[];
}

export interface Goal {
  id: string;
  employeeId: string;
  title: string;
  description: string;
  thrustArea: ThrustArea;
  uomType: UoMType;
  targetValue: number;
  weightage: number;
  status: GoalStatus;
  rejectionReason?: string;
  lockedAt?: string;
  lockedBy?: string;
  sharedFromId?: string; // If this goal was shared from another
  createdAt: string;
  updatedAt: string;
}

export interface CheckIn {
  id: string;
  goalId: string;
  quarter: Quarter;
  achievement: number;
  status: CheckInStatus;
  progressScore: number;
  submittedBy: string;
  submittedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CheckInComment {
  id: string;
  checkInId: string;
  managerId: string;
  comment: string;
  createdAt: string;
}

export interface SharedGoal {
  id: string;
  originalGoalId: string;
  sharedToUserId: string;
  canEditWeightage: boolean;
  canEditTarget: boolean;
  linkedGoalId: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  goalId: string;
  changedBy: string;
  changeType: string;
  oldValue: string;
  newValue: string;
  reason?: string;
  timestamp: string;
}

export interface Cycle {
  id: string;
  cycleYear: number;
  phase: CyclePhase;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  channel: NotificationChannel;
  read: boolean;
  link?: string;
  deepLink?: string;
  // Teams-specific
  teamsCardPayload?: TeamsCardPayload;
  // Email-specific
  emailSubject?: string;
  emailBody?: string;
  createdAt: string;
}

// --- Teams Adaptive Card ---

export interface TeamsCardAction {
  type: 'openUrl' | 'Action.Submit';
  title: string;
  url?: string;
}

export interface TeamsCardPayload {
  title: string;
  subtitle?: string;
  body: string;
  facts?: { label: string; value: string }[];
  actions?: TeamsCardAction[];
  accentColor?: string;
}

// --- Escalation ---

export interface EscalationRule {
  id: string;
  name: string;
  triggerType: EscalationTrigger;
  thresholdDays: number;       // N days after the trigger condition starts
  escalationDays: number;      // additional N days before escalating to skip-level/HR
  targetRoles: string[];       // ['employee', 'manager', 'hr']
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface EscalationEvent {
  id: string;
  ruleId: string;
  ruleName: string;
  userId: string;              // The person who needs to act
  managerId?: string;          // Manager notified
  skipLevelId?: string;        // Skip-level/HR notified
  triggerType: EscalationTrigger;
  daysPastDue: number;
  status: EscalationStatus;
  notifiedAt: string;
  escalatedAt?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  resolutionNote?: string;
  relatedGoalId?: string;
  createdAt: string;
}

// --- Analytics / QoQ ---

export interface QoQDataPoint {
  quarter: Quarter;
  individual: number;   // avg score for selected employee
  team: number;         // avg score for their team
  organization: number; // org-wide avg
}

export interface HeatmapCell {
  department: ThrustArea;
  quarter: Quarter;
  completionRate: number; // 0-100
  goalCount: number;
}

// --- Form / Input Types ---

export interface GoalFormData {
  title: string;
  description: string;
  thrustArea: ThrustArea;
  uomType: UoMType;
  targetValue: number;
  weightage: number;
}

export interface CheckInFormData {
  goalId: string;
  quarter: Quarter;
  achievement: number;
  status: CheckInStatus;
}

export interface EscalationRuleFormData {
  name: string;
  triggerType: EscalationTrigger;
  thresholdDays: number;
  escalationDays: number;
  targetRoles: string[];
  isActive: boolean;
}

// --- Dashboard Types ---

export interface DashboardStats {
  totalGoals: number;
  approvedGoals: number;
  pendingGoals: number;
  rejectedGoals: number;
  draftGoals: number;
  totalWeightage: number;
  avgProgress: number;
}

export interface CompletionMetrics {
  totalEmployees: number;
  goalsCreated: number;
  goalsApproved: number;
  checkInsSubmitted: number;
  checkInsReviewed: number;
  overdue: { userId: string; name: string; email: string }[];
  byManager: { managerId: string; name: string; approved: number; teamSize: number; completion: number }[];
  byDepartment: { department: string; total: number; approved: number; pending: number; completion: number }[];
}

// --- UoM Display Helpers ---

export const UOM_LABELS: Record<UoMType, { label: string; description: string; example: string }> = {
  MIN: {
    label: 'MIN (Higher is Better)',
    description: 'Achievement ÷ Target',
    example: 'Sales Revenue. Target: $100K, Achievement: $120K → 120%',
  },
  MAX: {
    label: 'MAX (Lower is Better)',
    description: 'Target ÷ Achievement',
    example: 'TAT/Cost. Target: 5 days, Achievement: 3 days → 167%',
  },
  TIMELINE: {
    label: 'TIMELINE (Date-Based)',
    description: 'Deadline vs Actual Completion',
    example: 'Project completion. Deadline: Dec 31, Actual: Dec 20 → On time',
  },
  ZERO: {
    label: 'ZERO (Zero = Success)',
    description: 'If 0 → 100%, else 0%',
    example: 'Safety incidents. If 0 incidents → 100%, else → 0%',
  },
};

export const THRUST_AREAS: ThrustArea[] = ['Sales', 'Operations', 'HR', 'Marketing', 'IT', 'Other'];

export const STATUS_COLORS: Record<GoalStatus, string> = {
  DRAFT: 'var(--status-draft)',
  SUBMITTED: 'var(--status-submitted)',
  APPROVED: 'var(--status-approved)',
  LOCKED: 'var(--status-locked)',
  REJECTED: 'var(--status-rejected)',
};

export const ESCALATION_TRIGGER_LABELS: Record<EscalationTrigger, string> = {
  'goal-not-submitted': 'Employee has not submitted goals within N days of cycle open',
  'goal-not-approved': 'Manager has not approved goals within N days of submission',
  'checkin-not-completed': 'Quarterly check-in not completed within the active window',
};
