export enum Role {
  ENGINEERING_MANAGER = 'ENGINEERING_MANAGER',
  EMPLOYEE = 'EMPLOYEE',
  DIRECTOR = 'DIRECTOR',
}

export enum Quarter {
  Q1 = 'Q1',
  Q2 = 'Q2',
  Q3 = 'Q3',
  Q4 = 'Q4',
}

export enum RatingBand {
  OUTSTANDING = 'Outstanding',
  EXCEEDS_EXPECTATIONS = 'Exceeds Expectations',
  MEETS_EXPECTATIONS = 'Meets Expectations',
  NEEDS_IMPROVEMENT = 'Needs Improvement',
  UNSATISFACTORY = 'Unsatisfactory',
}

export enum EvaluationStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  FINALIZED = 'FINALIZED',
}

export enum GoalPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export enum GoalStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  AT_RISK = 'AT_RISK',
  COMPLETED = 'COMPLETED',
}

export enum AchievementCategory {
  DELIVERY = 'DELIVERY',
  TECHNICAL = 'TECHNICAL',
  LEADERSHIP = 'LEADERSHIP',
  CUSTOMER_APPRECIATION = 'CUSTOMER_APPRECIATION',
  INNOVATION = 'INNOVATION',
  PROCESS_IMPROVEMENT = 'PROCESS_IMPROVEMENT',
}

export enum LearningCompletionStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export enum TalentCategory {
  FUTURE_LEADER = 'FUTURE_LEADER',
  HIGH_PERFORMER = 'HIGH_PERFORMER',
  CORE_CONTRIBUTOR = 'CORE_CONTRIBUTOR',
  EMERGING_TALENT = 'EMERGING_TALENT',
  UNDERPERFORMER = 'UNDERPERFORMER',
}

export enum PromotionReadinessBand {
  NOT_READY = 'Not Ready',
  DEVELOPING = 'Developing',
  NEAR_READY = 'Near Ready',
  PROMOTION_READY = 'Promotion Ready',
}

export enum NotificationType {
  PENDING_REVIEW = 'PENDING_REVIEW',
  GOAL_DEADLINE = 'GOAL_DEADLINE',
  PROMOTION_REVIEW = 'PROMOTION_REVIEW',
  MISSING_ONE_ON_ONE = 'MISSING_ONE_ON_ONE',
  LEARNING_EXPIRY = 'LEARNING_EXPIRY',
  CERTIFICATION_EXPIRY = 'CERTIFICATION_EXPIRY',
}
