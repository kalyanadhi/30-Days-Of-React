import { Injectable, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { EmployeesService } from '../../employees/employees.service';
import { UsersService } from '../../users/users.service';
import { EvaluationsService } from '../../evaluations/evaluations.service';
import { GoalsService } from '../../goals/goals.service';
import { AchievementsService } from '../../achievements/achievements.service';
import { DevelopmentPlansService } from '../../development-plans/development-plans.service';
import { OneOnOnesService } from '../../one-on-ones/one-on-ones.service';
import { LearningService } from '../../learning/learning.service';
import { PromotionReadinessService } from '../../promotion-readiness/promotion-readiness.service';
import { TalentMatrixService } from '../../talent-matrix/talent-matrix.service';
import { RiskService } from '../../risk/risk.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { Employee } from '../../employees/entities/employee.entity';
import { CreateEmployeeDto } from '../../employees/dto/create-employee.dto';
import {
  AchievementCategory,
  EvaluationStatus,
  GoalPriority,
  GoalStatus,
  LearningCompletionStatus,
  NotificationType,
  Quarter,
  RiskLevel,
  Role,
} from '../../common/enums';

type ReportKey =
  | 'priya'
  | 'arjun'
  | 'sneha'
  | 'karthik'
  | 'divya'
  | 'vikram'
  | 'ananya'
  | 'rohan';
type EmployeeKey = 'director' | 'manager' | ReportKey;
type EmployeeMap = Record<EmployeeKey, Employee>;
type ReportSeed = Omit<CreateEmployeeDto, 'managerId'>;

const DEMO_PASSWORD = 'Password@123';

interface EvaluationSeed {
  year: number;
  quarter: Quarter;
  deliveryScore: number;
  technicalScore: number;
  qualityScore: number;
  collaborationScore: number;
  learningScore: number;
  status: EvaluationStatus;
  managerFeedback?: string;
  employeeComments?: string;
  calibrationNotes?: string;
}

interface GoalSeed {
  title: string;
  description?: string;
  dueDate: string;
  priority: GoalPriority;
  weight: number;
  status: GoalStatus;
  progressPercentage: number;
  completionDate?: string;
}

interface AchievementSeed {
  title: string;
  description?: string;
  date: string;
  impact?: string;
  category: AchievementCategory;
}

interface DevelopmentPlanSeed {
  title: string;
  description?: string;
  targetSkills?: string;
  startDate: string;
  targetDate: string;
  status: GoalStatus;
  notes?: string;
}

interface OneOnOneSeed {
  meetingDate: string;
  discussionNotes?: string;
  concerns?: string;
  careerDiscussion?: string;
  actionItems?: string[];
  followUpDate?: string;
}

interface LearningSeed {
  trainingName: string;
  certificationName?: string;
  learningHours: number;
  completionStatus: LearningCompletionStatus;
  skillArea: string;
  completionDate?: string;
  expiryDate?: string;
}

interface PromotionReadinessSeed {
  technicalCapability: number;
  leadership: number;
  ownership: number;
  delivery: number;
  influence: number;
  communication: number;
  assessmentDate: string;
  notes?: string;
}

interface TalentMatrixSeed {
  potentialScore: number;
  performanceScore: number;
  quarter: Quarter;
  year: number;
  notes?: string;
}

interface RiskSeed {
  attritionRisk: RiskLevel;
  burnoutRisk: RiskLevel;
  skillGapRisk: RiskLevel;
  performanceRisk: RiskLevel;
  assessmentDate: string;
  notes?: string;
}

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    private readonly employeesService: EmployeesService,
    private readonly usersService: UsersService,
    private readonly evaluationsService: EvaluationsService,
    private readonly goalsService: GoalsService,
    private readonly achievementsService: AchievementsService,
    private readonly developmentPlansService: DevelopmentPlansService,
    private readonly oneOnOnesService: OneOnOnesService,
    private readonly learningService: LearningService,
    private readonly promotionReadinessService: PromotionReadinessService,
    private readonly talentMatrixService: TalentMatrixService,
    private readonly riskService: RiskService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async run(): Promise<void> {
    const existingUsers = await this.usersService.count();
    if (existingUsers > 0) {
      this.logger.log('Database already contains data - skipping seed.');
      return;
    }

    this.logger.log('Seeding database with demo data...');

    const employees = await this.seedEmployees();
    await this.seedUsers(employees);
    await this.seedEvaluations(employees);
    await this.seedGoals(employees);
    await this.seedAchievements(employees);
    await this.seedDevelopmentPlans(employees);
    await this.seedOneOnOnes(employees);
    await this.seedLearning(employees);
    await this.seedPromotionReadiness(employees);
    await this.seedTalentMatrix(employees);
    await this.seedRisk(employees);
    await this.seedNotifications(employees);

    this.logger.log('Seed completed successfully.');
  }

  private async seedEmployees(): Promise<EmployeeMap> {
    const director = await this.employeesService.create({
      employeeCode: 'EMP-1000',
      fullName: 'Anita Sharma',
      email: 'anita.sharma@nimbustech.io',
      designation: 'Director of Engineering',
      gradeBand: 'D1',
      department: 'Engineering',
      project: 'Platform Strategy',
      joiningDate: '2016-04-01',
      totalExperienceYears: 18,
      currentRoleSince: '2022-01-01',
      workLocation: 'Bengaluru, India',
      currentRole: 'Director of Engineering',
      targetRole: 'VP of Engineering',
      careerAspirations:
        'Lead engineering organization strategy across multiple business units and shape long-term technical vision.',
      promotionTargetDate: '2027-04-01',
    });

    const manager = await this.employeesService.create({
      employeeCode: 'EMP-1001',
      fullName: 'Rahul Mehta',
      email: 'rahul.mehta@nimbustech.io',
      designation: 'Engineering Manager',
      gradeBand: 'M1',
      department: 'Platform Engineering',
      project: 'Phoenix Platform',
      managerId: director.id,
      joiningDate: '2018-06-15',
      totalExperienceYears: 12,
      currentRoleSince: '2023-01-01',
      workLocation: 'Bengaluru, India',
      currentRole: 'Engineering Manager',
      targetRole: 'Senior Engineering Manager',
      careerAspirations:
        'Grow into a senior engineering manager role overseeing multiple squads across the platform organization.',
      promotionTargetDate: '2026-10-01',
    });

    const reportDefs: Record<ReportKey, ReportSeed> = {
      priya: {
        employeeCode: 'EMP-1002',
        fullName: 'Priya Nair',
        email: 'priya.nair@nimbustech.io',
        designation: 'Senior Software Engineer',
        gradeBand: 'SDE3',
        department: 'Platform Engineering',
        project: 'Phoenix Platform',
        joiningDate: '2019-02-01',
        totalExperienceYears: 8.5,
        currentRoleSince: '2023-04-01',
        workLocation: 'Bengaluru, India',
        currentRole: 'Senior Software Engineer',
        targetRole: 'Staff Software Engineer',
        careerAspirations:
          'Move into a Staff Software Engineer role driving platform-wide architecture decisions and mentoring senior engineers.',
        promotionTargetDate: '2026-10-01',
      },
      arjun: {
        employeeCode: 'EMP-1003',
        fullName: 'Arjun Verma',
        email: 'arjun.verma@nimbustech.io',
        designation: 'Software Engineer II',
        gradeBand: 'SDE2',
        department: 'Platform Engineering',
        project: 'Phoenix Platform',
        joiningDate: '2021-07-12',
        totalExperienceYears: 4.5,
        currentRoleSince: '2023-07-12',
        workLocation: 'Bengaluru, India',
        currentRole: 'Software Engineer II',
        targetRole: 'Senior Software Engineer',
        careerAspirations:
          'Deepen expertise in distributed systems and own a major feature workstream end to end.',
        promotionTargetDate: '2027-01-01',
      },
      sneha: {
        employeeCode: 'EMP-1004',
        fullName: 'Sneha Iyer',
        email: 'sneha.iyer@nimbustech.io',
        designation: 'Senior Software Engineer',
        gradeBand: 'SDE3',
        department: 'Data Engineering',
        project: 'Data Pipeline Modernization',
        joiningDate: '2018-11-05',
        totalExperienceYears: 9,
        currentRoleSince: '2022-11-05',
        workLocation: 'Hyderabad, India',
        currentRole: 'Senior Software Engineer',
        targetRole: 'Engineering Manager',
        careerAspirations:
          'Transition into engineering management while continuing to mentor junior engineers on the data platform team.',
        promotionTargetDate: '2027-04-01',
      },
      karthik: {
        employeeCode: 'EMP-1005',
        fullName: 'Karthik Raman',
        email: 'karthik.raman@nimbustech.io',
        designation: 'Software Engineer',
        gradeBand: 'SDE2',
        department: 'Mobile Engineering',
        project: 'Mobile Experience Revamp',
        joiningDate: '2022-01-10',
        totalExperienceYears: 3,
        currentRoleSince: '2022-01-10',
        workLocation: 'Chennai, India',
        currentRole: 'Software Engineer',
        targetRole: 'Senior Software Engineer',
        careerAspirations:
          'Strengthen mobile architecture skills and take ownership of a major mobile feature area.',
        promotionTargetDate: '2027-07-01',
      },
      divya: {
        employeeCode: 'EMP-1006',
        fullName: 'Divya Menon',
        email: 'divya.menon@nimbustech.io',
        designation: 'Lead Software Engineer',
        gradeBand: 'SDE4',
        department: 'Platform Engineering',
        project: 'Phoenix Platform',
        joiningDate: '2017-03-20',
        totalExperienceYears: 10.5,
        currentRoleSince: '2022-03-20',
        workLocation: 'Bengaluru, India',
        currentRole: 'Lead Software Engineer',
        targetRole: 'Engineering Manager',
        careerAspirations:
          'Move into an Engineering Manager role leading the Phoenix Platform squad.',
        promotionTargetDate: '2026-10-01',
      },
      vikram: {
        employeeCode: 'EMP-1007',
        fullName: 'Vikram Singh',
        email: 'vikram.singh@nimbustech.io',
        designation: 'Software Engineer II',
        gradeBand: 'SDE2',
        department: 'Data Engineering',
        project: 'Data Pipeline Modernization',
        joiningDate: '2020-09-01',
        totalExperienceYears: 5.5,
        currentRoleSince: '2020-09-01',
        workLocation: 'Pune, India (Remote)',
        currentRole: 'Software Engineer II',
        targetRole: 'Senior Software Engineer',
        careerAspirations:
          'Rebuild technical momentum, close outstanding delivery gaps, and regain stakeholder confidence.',
        promotionTargetDate: null,
      },
      ananya: {
        employeeCode: 'EMP-1008',
        fullName: 'Ananya Gupta',
        email: 'ananya.gupta@nimbustech.io',
        designation: 'Software Engineer I',
        gradeBand: 'SDE1',
        department: 'Mobile Engineering',
        project: 'Mobile Experience Revamp',
        joiningDate: '2023-08-21',
        totalExperienceYears: 1.5,
        currentRoleSince: '2023-08-21',
        workLocation: 'Chennai, India',
        currentRole: 'Software Engineer I',
        targetRole: 'Software Engineer II',
        careerAspirations:
          'Build strong backend fundamentals and independently own small to medium features.',
        promotionTargetDate: '2026-12-01',
      },
      rohan: {
        employeeCode: 'EMP-1009',
        fullName: 'Rohan Desai',
        email: 'rohan.desai@nimbustech.io',
        designation: 'Senior Software Engineer',
        gradeBand: 'SDE3',
        department: 'Data Engineering',
        project: 'Data Pipeline Modernization',
        joiningDate: '2019-05-14',
        totalExperienceYears: 8,
        currentRoleSince: '2023-05-14',
        workLocation: 'Bengaluru, India',
        currentRole: 'Senior Software Engineer',
        targetRole: 'Staff Software Engineer',
        careerAspirations:
          'Deepen expertise in data infrastructure and take ownership of cross-team data initiatives.',
        promotionTargetDate: '2026-12-01',
      },
    };

    const reports = {} as Record<ReportKey, Employee>;
    for (const key of Object.keys(reportDefs) as ReportKey[]) {
      reports[key] = await this.employeesService.create({
        ...reportDefs[key],
        managerId: manager.id,
      });
    }

    return { director, manager, ...reports };
  }

  private async seedUsers(employees: EmployeeMap): Promise<void> {
    const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

    const userDefs: Array<{ employee: Employee; role: Role }> = [
      { employee: employees.director, role: Role.DIRECTOR },
      { employee: employees.manager, role: Role.ENGINEERING_MANAGER },
      { employee: employees.priya, role: Role.EMPLOYEE },
      { employee: employees.arjun, role: Role.EMPLOYEE },
      { employee: employees.sneha, role: Role.EMPLOYEE },
      { employee: employees.karthik, role: Role.EMPLOYEE },
      { employee: employees.divya, role: Role.EMPLOYEE },
      { employee: employees.vikram, role: Role.EMPLOYEE },
      { employee: employees.ananya, role: Role.EMPLOYEE },
      { employee: employees.rohan, role: Role.EMPLOYEE },
    ];

    for (const def of userDefs) {
      await this.usersService.create({
        email: def.employee.email,
        passwordHash,
        role: def.role,
        employeeId: def.employee.id,
      });
    }
  }

  private async seedEvaluations(employees: EmployeeMap): Promise<void> {
    const evaluationData: Record<ReportKey, EvaluationSeed[]> = {
      priya: [
        {
          year: 2025,
          quarter: Quarter.Q3,
          deliveryScore: 4.5,
          technicalScore: 4.6,
          qualityScore: 4.4,
          collaborationScore: 4.5,
          learningScore: 4.3,
          status: EvaluationStatus.FINALIZED,
        },
        {
          year: 2025,
          quarter: Quarter.Q4,
          deliveryScore: 4.6,
          technicalScore: 4.7,
          qualityScore: 4.5,
          collaborationScore: 4.6,
          learningScore: 4.4,
          status: EvaluationStatus.FINALIZED,
        },
        {
          year: 2026,
          quarter: Quarter.Q1,
          deliveryScore: 4.7,
          technicalScore: 4.8,
          qualityScore: 4.6,
          collaborationScore: 4.7,
          learningScore: 4.5,
          status: EvaluationStatus.FINALIZED,
          managerFeedback:
            'Priya continues to operate at a staff-level bar - led the billing service migration flawlessly and is a go-to mentor for the team. Strongly recommend prioritizing her promotion case this cycle.',
          employeeComments:
            'Excited about the migration outcomes and looking forward to taking on more architecture ownership.',
          calibrationNotes:
            'Calibrated as a top performer across the org; promotion packet in progress.',
        },
        {
          year: 2026,
          quarter: Quarter.Q2,
          deliveryScore: 4.8,
          technicalScore: 4.8,
          qualityScore: 4.7,
          collaborationScore: 4.8,
          learningScore: 4.6,
          status: EvaluationStatus.SUBMITTED,
          employeeComments:
            'Continuing to drive the platform architecture roadmap and mentoring two junior engineers.',
        },
      ],
      arjun: [
        {
          year: 2025,
          quarter: Quarter.Q3,
          deliveryScore: 3.4,
          technicalScore: 3.6,
          qualityScore: 3.5,
          collaborationScore: 3.6,
          learningScore: 3.3,
          status: EvaluationStatus.FINALIZED,
        },
        {
          year: 2025,
          quarter: Quarter.Q4,
          deliveryScore: 3.6,
          technicalScore: 3.7,
          qualityScore: 3.6,
          collaborationScore: 3.7,
          learningScore: 3.5,
          status: EvaluationStatus.FINALIZED,
        },
        {
          year: 2026,
          quarter: Quarter.Q1,
          deliveryScore: 3.7,
          technicalScore: 3.8,
          qualityScore: 3.7,
          collaborationScore: 3.8,
          learningScore: 3.6,
          status: EvaluationStatus.FINALIZED,
          managerFeedback:
            'Arjun is steadily growing into the senior engineer role - API latency work this quarter was solid. Needs to build more confidence presenting technical proposals to stakeholders.',
          employeeComments:
            'Focused on the API latency project and want to start owning design reviews next quarter.',
        },
      ],
      sneha: [
        {
          year: 2025,
          quarter: Quarter.Q3,
          deliveryScore: 4.0,
          technicalScore: 4.2,
          qualityScore: 4.1,
          collaborationScore: 4.3,
          learningScore: 4.0,
          status: EvaluationStatus.FINALIZED,
        },
        {
          year: 2025,
          quarter: Quarter.Q4,
          deliveryScore: 4.1,
          technicalScore: 4.3,
          qualityScore: 4.2,
          collaborationScore: 4.3,
          learningScore: 4.1,
          status: EvaluationStatus.FINALIZED,
        },
        {
          year: 2026,
          quarter: Quarter.Q1,
          deliveryScore: 4.2,
          technicalScore: 4.4,
          qualityScore: 4.3,
          collaborationScore: 4.4,
          learningScore: 4.2,
          status: EvaluationStatus.FINALIZED,
          managerFeedback:
            'Sneha delivered the real-time analytics pipeline ahead of schedule and has been an excellent mentor to new hires. Ready to start taking on people-management responsibilities.',
          employeeComments:
            'Enjoyed mentoring the new hires and would like to formally shadow management responsibilities.',
        },
      ],
      karthik: [
        {
          year: 2025,
          quarter: Quarter.Q3,
          deliveryScore: 2.6,
          technicalScore: 2.8,
          qualityScore: 2.7,
          collaborationScore: 2.9,
          learningScore: 2.6,
          status: EvaluationStatus.FINALIZED,
        },
        {
          year: 2025,
          quarter: Quarter.Q4,
          deliveryScore: 3.0,
          technicalScore: 3.1,
          qualityScore: 3.0,
          collaborationScore: 3.2,
          learningScore: 3.0,
          status: EvaluationStatus.FINALIZED,
        },
        {
          year: 2026,
          quarter: Quarter.Q1,
          deliveryScore: 3.3,
          technicalScore: 3.4,
          qualityScore: 3.3,
          collaborationScore: 3.5,
          learningScore: 3.2,
          status: EvaluationStatus.FINALIZED,
          managerFeedback:
            'Karthik has shown consistent improvement quarter over quarter, particularly in code quality and collaboration. Continue focus on proactive communication around blockers.',
          employeeComments:
            'Working on the crash-rate initiative and feel more confident with the mobile architecture now.',
        },
      ],
      divya: [
        {
          year: 2025,
          quarter: Quarter.Q3,
          deliveryScore: 4.7,
          technicalScore: 4.8,
          qualityScore: 4.6,
          collaborationScore: 4.7,
          learningScore: 4.5,
          status: EvaluationStatus.FINALIZED,
        },
        {
          year: 2025,
          quarter: Quarter.Q4,
          deliveryScore: 4.8,
          technicalScore: 4.9,
          qualityScore: 4.7,
          collaborationScore: 4.8,
          learningScore: 4.6,
          status: EvaluationStatus.FINALIZED,
        },
        {
          year: 2026,
          quarter: Quarter.Q1,
          deliveryScore: 4.9,
          technicalScore: 4.9,
          qualityScore: 4.8,
          collaborationScore: 4.9,
          learningScore: 4.7,
          status: EvaluationStatus.FINALIZED,
          managerFeedback:
            "Divya's architecture roadmap has been adopted org-wide and she is effectively operating as a shadow EM for the squad. This is an outstanding quarter and she is ready for the EM track.",
          employeeComments:
            'Ready to take the next step into management - appreciate the opportunities to lead planning this quarter.',
          calibrationNotes:
            'Top-rated across the org; recommend fast-tracking EM promotion conversation with Anita.',
        },
        {
          year: 2026,
          quarter: Quarter.Q2,
          deliveryScore: 4.9,
          technicalScore: 5.0,
          qualityScore: 4.8,
          collaborationScore: 4.9,
          learningScore: 4.8,
          status: EvaluationStatus.SUBMITTED,
          employeeComments:
            'Leading the cross-team API standardization initiative and continuing to shadow management duties.',
        },
      ],
      vikram: [
        {
          year: 2025,
          quarter: Quarter.Q3,
          deliveryScore: 3.2,
          technicalScore: 3.0,
          qualityScore: 3.1,
          collaborationScore: 2.9,
          learningScore: 3.0,
          status: EvaluationStatus.FINALIZED,
        },
        {
          year: 2025,
          quarter: Quarter.Q4,
          deliveryScore: 2.8,
          technicalScore: 2.7,
          qualityScore: 2.8,
          collaborationScore: 2.6,
          learningScore: 2.7,
          status: EvaluationStatus.FINALIZED,
        },
        {
          year: 2026,
          quarter: Quarter.Q1,
          deliveryScore: 2.4,
          technicalScore: 2.3,
          qualityScore: 2.5,
          collaborationScore: 2.2,
          learningScore: 2.4,
          status: EvaluationStatus.FINALIZED,
          managerFeedback:
            "Vikram's delivery and quality scores have declined for two consecutive quarters. We've agreed a focused improvement plan with weekly check-ins to address missed deadlines and code quality issues.",
          employeeComments:
            'Acknowledge the slip in delivery - dealing with some personal challenges but committed to turning this around.',
          calibrationNotes:
            'Flagged for a performance improvement plan; manager and HR partner to follow up.',
        },
      ],
      ananya: [
        {
          year: 2025,
          quarter: Quarter.Q3,
          deliveryScore: 2.8,
          technicalScore: 2.9,
          qualityScore: 3.0,
          collaborationScore: 3.2,
          learningScore: 3.4,
          status: EvaluationStatus.FINALIZED,
        },
        {
          year: 2025,
          quarter: Quarter.Q4,
          deliveryScore: 3.1,
          technicalScore: 3.2,
          qualityScore: 3.3,
          collaborationScore: 3.4,
          learningScore: 3.6,
          status: EvaluationStatus.FINALIZED,
        },
        {
          year: 2026,
          quarter: Quarter.Q1,
          deliveryScore: 3.4,
          technicalScore: 3.5,
          qualityScore: 3.5,
          collaborationScore: 3.6,
          learningScore: 3.8,
          status: EvaluationStatus.FINALIZED,
          managerFeedback:
            'Ananya is ramping up well for someone less than two years into their career - shipped her first independent feature this quarter. Keep building consistency on estimation and testing.',
          employeeComments:
            'Proud of shipping the notification preferences feature on my own and want to keep improving testing habits.',
        },
      ],
      rohan: [
        {
          year: 2025,
          quarter: Quarter.Q3,
          deliveryScore: 4.2,
          technicalScore: 4.3,
          qualityScore: 4.1,
          collaborationScore: 4.2,
          learningScore: 4.0,
          status: EvaluationStatus.FINALIZED,
        },
        {
          year: 2025,
          quarter: Quarter.Q4,
          deliveryScore: 4.3,
          technicalScore: 4.4,
          qualityScore: 4.2,
          collaborationScore: 4.3,
          learningScore: 4.1,
          status: EvaluationStatus.FINALIZED,
        },
        {
          year: 2026,
          quarter: Quarter.Q1,
          deliveryScore: 4.4,
          technicalScore: 4.5,
          qualityScore: 4.3,
          collaborationScore: 4.4,
          learningScore: 4.2,
          status: EvaluationStatus.FINALIZED,
          managerFeedback:
            "Rohan's query optimization work saved significant infrastructure cost and he continues to be a strong technical anchor for the data team. Near-ready for staff promotion - building the case for next cycle.",
          employeeComments:
            'Glad the optimization work paid off - keen to take on more cross-team data governance initiatives.',
        },
      ],
    };

    for (const key of Object.keys(evaluationData) as ReportKey[]) {
      const employee = employees[key];
      for (const evaluation of evaluationData[key]) {
        await this.evaluationsService.create({
          employeeId: employee.id,
          ...evaluation,
        });
      }
    }
  }

  private async createGoal(employeeId: string, def: GoalSeed): Promise<void> {
    const goal = await this.goalsService.create({
      employeeId,
      title: def.title,
      description: def.description,
      dueDate: def.dueDate,
      priority: def.priority,
      weight: def.weight,
      status: def.status,
    });

    await this.goalsService.update(goal.id, {
      progressPercentage: def.progressPercentage,
      completionDate: def.completionDate,
    });
  }

  private async seedGoals(employees: EmployeeMap): Promise<void> {
    const goalsData: Record<ReportKey, GoalSeed[]> = {
      priya: [
        {
          title: 'Lead migration of billing service to microservices',
          description:
            'Decompose the monolithic billing service into independently deployable microservices.',
          dueDate: '2026-03-31',
          priority: GoalPriority.HIGH,
          weight: 40,
          status: GoalStatus.COMPLETED,
          progressPercentage: 100,
          completionDate: '2026-03-28',
        },
        {
          title: 'Mentor two junior engineers on system design',
          description:
            'Run bi-weekly system design sessions and review their design docs.',
          dueDate: '2026-09-30',
          priority: GoalPriority.MEDIUM,
          weight: 30,
          status: GoalStatus.IN_PROGRESS,
          progressPercentage: 60,
        },
      ],
      arjun: [
        {
          title: 'Improve API response times by 20%',
          description:
            'Profile and optimize the top 10 slowest endpoints in the Phoenix API.',
          dueDate: '2026-06-30',
          priority: GoalPriority.HIGH,
          weight: 35,
          status: GoalStatus.IN_PROGRESS,
          progressPercentage: 55,
        },
        {
          title: 'Complete AWS Solutions Architect Associate certification',
          dueDate: '2026-08-31',
          priority: GoalPriority.LOW,
          weight: 15,
          status: GoalStatus.NOT_STARTED,
          progressPercentage: 0,
        },
      ],
      sneha: [
        {
          title: 'Design data pipeline for real-time analytics',
          description:
            'Build a streaming pipeline to power the real-time analytics dashboard.',
          dueDate: '2026-05-31',
          priority: GoalPriority.HIGH,
          weight: 40,
          status: GoalStatus.COMPLETED,
          progressPercentage: 100,
          completionDate: '2026-05-20',
        },
        {
          title: 'Establish on-call rotation runbook',
          description:
            'Document playbooks for the top 5 production incidents and onboard the team.',
          dueDate: '2026-07-31',
          priority: GoalPriority.MEDIUM,
          weight: 25,
          status: GoalStatus.IN_PROGRESS,
          progressPercentage: 70,
        },
      ],
      karthik: [
        {
          title: 'Reduce mobile app crash rate below 1%',
          description:
            'Triage and fix the top crash sources reported in the last two releases.',
          dueDate: '2026-06-30',
          priority: GoalPriority.HIGH,
          weight: 35,
          status: GoalStatus.AT_RISK,
          progressPercentage: 40,
        },
        {
          title: 'Complete React Native advanced patterns training',
          dueDate: '2026-09-30',
          priority: GoalPriority.MEDIUM,
          weight: 20,
          status: GoalStatus.IN_PROGRESS,
          progressPercentage: 30,
        },
      ],
      divya: [
        {
          title: 'Define platform architecture roadmap for 2026',
          description:
            'Produce an architecture roadmap covering scalability, reliability, and developer experience.',
          dueDate: '2026-04-30',
          priority: GoalPriority.HIGH,
          weight: 40,
          status: GoalStatus.COMPLETED,
          progressPercentage: 100,
          completionDate: '2026-04-25',
        },
        {
          title: 'Lead cross-team API standardization initiative',
          description:
            'Define and roll out shared API design guidelines across three squads.',
          dueDate: '2026-08-31',
          priority: GoalPriority.HIGH,
          weight: 35,
          status: GoalStatus.IN_PROGRESS,
          progressPercentage: 65,
        },
      ],
      vikram: [
        {
          title: 'Resolve outstanding data pipeline tech debt',
          description:
            'Pay down the backlog of flagged tech-debt tickets on the ingestion pipeline.',
          dueDate: '2026-05-31',
          priority: GoalPriority.HIGH,
          weight: 40,
          status: GoalStatus.AT_RISK,
          progressPercentage: 25,
        },
        {
          title: 'Improve unit test coverage to 80%',
          dueDate: '2026-07-31',
          priority: GoalPriority.MEDIUM,
          weight: 30,
          status: GoalStatus.NOT_STARTED,
          progressPercentage: 0,
        },
      ],
      ananya: [
        {
          title: 'Ship onboarding flow redesign',
          description:
            'Implement the redesigned onboarding flow based on the UX team handoff.',
          dueDate: '2026-06-30',
          priority: GoalPriority.MEDIUM,
          weight: 30,
          status: GoalStatus.IN_PROGRESS,
          progressPercentage: 50,
        },
        {
          title: 'Complete backend fundamentals bootcamp',
          dueDate: '2026-08-31',
          priority: GoalPriority.LOW,
          weight: 20,
          status: GoalStatus.IN_PROGRESS,
          progressPercentage: 75,
        },
      ],
      rohan: [
        {
          title: 'Optimize data warehouse query performance by 30%',
          description:
            'Rewrite the slowest nightly batch queries and add appropriate indexes.',
          dueDate: '2026-05-31',
          priority: GoalPriority.HIGH,
          weight: 40,
          status: GoalStatus.COMPLETED,
          progressPercentage: 100,
          completionDate: '2026-05-15',
        },
        {
          title: 'Drive adoption of new data governance framework',
          description:
            'Roll out data classification and access policies across the data engineering team.',
          dueDate: '2026-09-30',
          priority: GoalPriority.HIGH,
          weight: 35,
          status: GoalStatus.IN_PROGRESS,
          progressPercentage: 45,
        },
      ],
    };

    for (const key of Object.keys(goalsData) as ReportKey[]) {
      const employee = employees[key];
      for (const goal of goalsData[key]) {
        await this.createGoal(employee.id, goal);
      }
    }
  }

  private async seedAchievements(employees: EmployeeMap): Promise<void> {
    const achievementsData: Record<ReportKey, AchievementSeed[]> = {
      priya: [
        {
          title: 'Led billing service migration with zero downtime',
          description:
            'Migrated the monolithic billing service to microservices without any production incidents.',
          date: '2026-03-28',
          impact:
            'Reduced billing latency by 35% and improved system reliability.',
          category: AchievementCategory.DELIVERY,
        },
        {
          title: 'Recognized by client for exceptional incident response',
          date: '2025-11-12',
          impact: 'Client praised the team in a formal escalation review.',
          category: AchievementCategory.CUSTOMER_APPRECIATION,
        },
      ],
      arjun: [
        {
          title: 'Automated deployment pipeline reducing release time by 40%',
          description:
            'Introduced automated canary deployments for the Phoenix API.',
          date: '2025-10-05',
          impact: 'Cut average release time from 50 minutes to 30 minutes.',
          category: AchievementCategory.PROCESS_IMPROVEMENT,
        },
      ],
      sneha: [
        {
          title: 'Delivered real-time analytics pipeline ahead of schedule',
          date: '2026-05-20',
          impact:
            'Enabled near real-time dashboards for the operations team two weeks early.',
          category: AchievementCategory.DELIVERY,
        },
        {
          title: 'Mentored three new hires during onboarding',
          date: '2025-09-15',
          impact:
            'All three new hires ramped up to full productivity within one month.',
          category: AchievementCategory.LEADERSHIP,
        },
      ],
      karthik: [
        {
          title: 'Fixed critical crash affecting 15% of mobile users',
          date: '2026-02-10',
          impact: 'Resolved a top-priority crash within 24 hours of detection.',
          category: AchievementCategory.TECHNICAL,
        },
      ],
      divya: [
        {
          title: 'Defined 2026 platform architecture roadmap adopted org-wide',
          date: '2026-04-25',
          impact: 'Set technical direction for four engineering teams.',
          category: AchievementCategory.LEADERSHIP,
        },
        {
          title: 'Built caching layer reducing infrastructure costs by 18%',
          date: '2025-12-01',
          impact:
            'Lowered monthly cloud spend for the Phoenix Platform by approximately $6,000.',
          category: AchievementCategory.INNOVATION,
        },
      ],
      vikram: [
        {
          title: 'Completed migration of legacy reporting jobs',
          date: '2025-08-20',
          impact:
            'Decommissioned the last set of legacy nightly reporting jobs.',
          category: AchievementCategory.DELIVERY,
        },
      ],
      ananya: [
        {
          title: 'Shipped first independent feature - notification preferences',
          date: '2026-01-15',
          impact: 'Delivered the feature with no post-release defects.',
          category: AchievementCategory.DELIVERY,
        },
      ],
      rohan: [
        {
          title:
            'Optimized data warehouse queries cutting nightly batch runtime by 30%',
          date: '2026-05-15',
          impact: 'Saved approximately $4,000 per month in compute costs.',
          category: AchievementCategory.TECHNICAL,
        },
        {
          title: 'Received customer appreciation for data quality dashboard',
          date: '2025-10-30',
          impact:
            'Customer cited the dashboard as a key factor in renewing their contract.',
          category: AchievementCategory.CUSTOMER_APPRECIATION,
        },
      ],
    };

    for (const key of Object.keys(achievementsData) as ReportKey[]) {
      const employee = employees[key];
      for (const achievement of achievementsData[key]) {
        await this.achievementsService.create({
          employeeId: employee.id,
          ...achievement,
        });
      }
    }
  }

  private async seedDevelopmentPlans(employees: EmployeeMap): Promise<void> {
    const developmentPlansData: Record<ReportKey, DevelopmentPlanSeed> = {
      priya: {
        title: 'Staff Engineer Readiness Plan',
        description:
          'Structured plan to prepare Priya for a Staff Software Engineer promotion.',
        targetSkills:
          'System design, technical leadership, cross-team influence',
        startDate: '2026-01-01',
        targetDate: '2026-12-31',
        status: GoalStatus.IN_PROGRESS,
        notes: 'Focus on architecture reviews and mentoring junior engineers.',
      },
      arjun: {
        title: 'Distributed Systems Deep-Dive',
        targetSkills: 'Distributed systems, Kafka, scalability patterns',
        startDate: '2026-02-01',
        targetDate: '2026-11-30',
        status: GoalStatus.IN_PROGRESS,
        notes:
          'Pairing with Priya on the billing service migration for hands-on exposure.',
      },
      sneha: {
        title: 'People Management Track',
        targetSkills: '1:1 coaching, performance management, delegation',
        startDate: '2025-10-01',
        targetDate: '2026-09-30',
        status: GoalStatus.IN_PROGRESS,
        notes: 'Shadowing Rahul on 1:1s and quarterly planning sessions.',
      },
      karthik: {
        title: 'Mobile Architecture Fundamentals',
        targetSkills: 'iOS/Android architecture, performance profiling',
        startDate: '2026-01-15',
        targetDate: '2026-10-31',
        status: GoalStatus.IN_PROGRESS,
      },
      divya: {
        title: 'Engineering Manager Transition Plan',
        targetSkills: 'People management, hiring, stakeholder communication',
        startDate: '2025-11-01',
        targetDate: '2026-10-31',
        status: GoalStatus.IN_PROGRESS,
        notes: 'Co-leading squad planning with Rahul as a shadow manager.',
      },
      vikram: {
        title: 'Performance Improvement Plan',
        targetSkills: 'Code quality, ownership, communication',
        startDate: '2026-04-01',
        targetDate: '2026-07-31',
        status: GoalStatus.IN_PROGRESS,
        notes:
          'Weekly check-ins with manager to track progress on outstanding tech-debt items.',
      },
      ananya: {
        title: 'Backend Fundamentals Bootcamp',
        targetSkills: 'Node.js, SQL, API design',
        startDate: '2025-09-01',
        targetDate: '2026-08-31',
        status: GoalStatus.IN_PROGRESS,
      },
      rohan: {
        title: 'Staff Engineer Readiness Plan',
        targetSkills: 'Data infrastructure, cross-team leadership',
        startDate: '2026-01-01',
        targetDate: '2026-12-31',
        status: GoalStatus.NOT_STARTED,
      },
    };

    for (const key of Object.keys(developmentPlansData) as ReportKey[]) {
      const employee = employees[key];
      await this.developmentPlansService.create({
        employeeId: employee.id,
        ...developmentPlansData[key],
      });
    }
  }

  private async seedOneOnOnes(employees: EmployeeMap): Promise<void> {
    const oneOnOnesData: Record<ReportKey, OneOnOneSeed[]> = {
      priya: [
        {
          meetingDate: '2026-04-14',
          discussionNotes:
            'Reviewed billing migration progress and discussed rollout sequencing.',
          careerDiscussion:
            'Discussed staff engineer promotion timeline and what evidence to capture this quarter.',
          actionItems: [
            'Draft promotion packet outline',
            'Schedule architecture review with Divya',
          ],
          followUpDate: '2026-05-12',
        },
        {
          meetingDate: '2026-06-02',
          discussionNotes:
            'Migration completed successfully; discussed next focus area on mentoring.',
          careerDiscussion:
            'Finalized promotion packet for upcoming calibration cycle.',
          actionItems: ['Submit promotion packet to calibration committee'],
          followUpDate: '2026-07-07',
        },
      ],
      arjun: [
        {
          meetingDate: '2026-04-16',
          discussionNotes:
            'Discussed API latency project plan and identified the top endpoints to target.',
          careerDiscussion:
            'Talked through path to senior engineer and skills to develop.',
          actionItems: ['Share latency benchmarking results by end of month'],
          followUpDate: '2026-05-14',
        },
        {
          meetingDate: '2026-06-04',
          discussionNotes:
            'Latency improvements on track; discussed taking ownership of a design review.',
          actionItems: ['Lead next sprint design review session'],
          followUpDate: '2026-07-02',
        },
      ],
      sneha: [
        {
          meetingDate: '2026-04-10',
          discussionNotes:
            'Reviewed analytics pipeline design and onboarding plan for new hires.',
          careerDiscussion:
            'Discussed interest in transitioning to people management.',
          actionItems: ['Shadow Rahul during next round of 1:1s'],
          followUpDate: '2026-05-08',
        },
        {
          meetingDate: '2026-05-29',
          discussionNotes:
            'Analytics pipeline shipped ahead of schedule; discussed on-call runbook progress.',
          careerDiscussion:
            'Agreed on a plan to co-lead a small group as a step toward management.',
          actionItems: ['Identify two engineers for Sneha to begin coaching'],
          followUpDate: '2026-06-26',
        },
      ],
      karthik: [
        {
          meetingDate: '2026-04-17',
          discussionNotes:
            'Discussed crash-rate triage plan and prioritized top three crash sources.',
          concerns:
            'Karthik mentioned feeling overwhelmed by the volume of crash reports.',
          actionItems: ['Pair with Priya on crash triage for one sprint'],
          followUpDate: '2026-05-15',
        },
        {
          meetingDate: '2026-06-05',
          discussionNotes:
            'Crash rate trending down; reviewed React Native training progress.',
          careerDiscussion:
            'Discussed growth path toward senior engineer over the next 12-18 months.',
          actionItems: [
            'Complete module 3 of React Native training by end of June',
          ],
          followUpDate: '2026-07-03',
        },
      ],
      divya: [
        {
          meetingDate: '2026-04-09',
          discussionNotes:
            'Reviewed architecture roadmap feedback from other squads.',
          careerDiscussion:
            'Discussed EM transition plan and shadowing opportunities for next quarter.',
          actionItems: ['Co-facilitate next squad planning session with Rahul'],
          followUpDate: '2026-05-07',
        },
        {
          meetingDate: '2026-05-28',
          discussionNotes:
            'Roadmap formally adopted org-wide; discussed API standardization rollout plan.',
          careerDiscussion:
            'Agreed to start the EM promotion conversation with Anita this quarter.',
          actionItems: ['Schedule meeting with Anita to discuss EM track'],
          followUpDate: '2026-06-25',
        },
      ],
      vikram: [
        {
          meetingDate: '2026-04-08',
          discussionNotes:
            'Discussed missed deadlines on the tech-debt cleanup workstream.',
          concerns:
            'Delivery has slipped for two consecutive quarters; agreed on a focused improvement plan with weekly check-ins.',
          actionItems: [
            'Vikram to provide daily status updates on tech-debt tickets',
          ],
          followUpDate: '2026-04-22',
        },
        {
          meetingDate: '2026-05-06',
          discussionNotes:
            'Some progress on tech-debt tickets but still behind plan.',
          concerns:
            'Continued concerns about pace of delivery and code review turnaround time.',
          actionItems: [
            'HR partner to join next check-in',
            'Re-baseline tech-debt plan with realistic milestones',
          ],
          followUpDate: '2026-05-20',
        },
      ],
      ananya: [
        {
          meetingDate: '2026-04-13',
          discussionNotes:
            'Discussed onboarding flow redesign requirements and UX handoff.',
          careerDiscussion:
            'Talked about building confidence with independent feature ownership.',
          actionItems: [
            'Pair with Karthik on the onboarding flow UI components',
          ],
          followUpDate: '2026-05-11',
        },
        {
          meetingDate: '2026-06-01',
          discussionNotes:
            'Onboarding flow halfway done; reviewed backend fundamentals bootcamp progress.',
          careerDiscussion:
            'Discussed expectations for promotion to SDE2 over the next review cycles.',
          actionItems: ['Complete SQL fundamentals module by end of June'],
          followUpDate: '2026-06-29',
        },
      ],
      rohan: [
        {
          meetingDate: '2026-04-15',
          discussionNotes:
            'Reviewed query optimization plan for nightly batch jobs.',
          careerDiscussion:
            'Discussed staff engineer readiness and cross-team governance opportunities.',
          actionItems: [
            'Present optimization results to the data engineering org',
          ],
          followUpDate: '2026-05-13',
        },
        {
          meetingDate: '2026-06-03',
          discussionNotes:
            'Optimization work completed with strong cost savings; discussed governance framework rollout.',
          careerDiscussion:
            'Agreed to start drafting staff promotion case for the next cycle.',
          actionItems: ['Draft staff promotion case outline'],
          followUpDate: '2026-07-01',
        },
      ],
    };

    for (const key of Object.keys(oneOnOnesData) as ReportKey[]) {
      const employee = employees[key];
      for (const oneOnOne of oneOnOnesData[key]) {
        await this.oneOnOnesService.create({
          employeeId: employee.id,
          ...oneOnOne,
        });
      }
    }
  }

  private async seedLearning(employees: EmployeeMap): Promise<void> {
    const learningData: Record<ReportKey, LearningSeed[]> = {
      priya: [
        {
          trainingName: 'AWS Certified Solutions Architect - Professional',
          certificationName: 'AWS Certified Solutions Architect - Professional',
          learningHours: 60,
          completionStatus: LearningCompletionStatus.COMPLETED,
          skillArea: 'Cloud Architecture',
          completionDate: '2025-09-15',
          expiryDate: '2028-09-15',
        },
        {
          trainingName: 'Advanced System Design Workshop',
          learningHours: 16,
          completionStatus: LearningCompletionStatus.COMPLETED,
          skillArea: 'System Design',
          completionDate: '2026-02-10',
        },
      ],
      arjun: [
        {
          trainingName: 'Kubernetes for Developers',
          learningHours: 20,
          completionStatus: LearningCompletionStatus.IN_PROGRESS,
          skillArea: 'Cloud Infrastructure',
        },
      ],
      sneha: [
        {
          trainingName: 'Data Engineering on Google Cloud',
          certificationName: 'Google Cloud Professional Data Engineer',
          learningHours: 40,
          completionStatus: LearningCompletionStatus.COMPLETED,
          skillArea: 'Data Engineering',
          completionDate: '2025-12-01',
          expiryDate: '2027-12-01',
        },
        {
          trainingName: 'Leadership Foundations for Engineers',
          learningHours: 12,
          completionStatus: LearningCompletionStatus.IN_PROGRESS,
          skillArea: 'Leadership',
        },
      ],
      karthik: [
        {
          trainingName: 'React Native Advanced Patterns',
          learningHours: 18,
          completionStatus: LearningCompletionStatus.IN_PROGRESS,
          skillArea: 'Mobile Development',
        },
      ],
      divya: [
        {
          trainingName: 'Certified Scrum Master',
          certificationName: 'Certified Scrum Master (CSM)',
          learningHours: 16,
          completionStatus: LearningCompletionStatus.COMPLETED,
          skillArea: 'Agile Leadership',
          completionDate: '2025-06-20',
          expiryDate: '2027-06-20',
        },
        {
          trainingName: 'Engineering Management Bootcamp',
          learningHours: 30,
          completionStatus: LearningCompletionStatus.IN_PROGRESS,
          skillArea: 'People Management',
        },
      ],
      vikram: [
        {
          trainingName: 'Effective Code Reviews',
          learningHours: 8,
          completionStatus: LearningCompletionStatus.NOT_STARTED,
          skillArea: 'Code Quality',
        },
      ],
      ananya: [
        {
          trainingName: 'Node.js Backend Fundamentals',
          certificationName: 'Node.js Backend Fundamentals',
          learningHours: 25,
          completionStatus: LearningCompletionStatus.COMPLETED,
          skillArea: 'Backend Development',
          completionDate: '2026-01-20',
        },
        {
          trainingName: 'SQL for Engineers',
          learningHours: 10,
          completionStatus: LearningCompletionStatus.IN_PROGRESS,
          skillArea: 'Databases',
        },
      ],
      rohan: [
        {
          trainingName: 'Databricks Certified Data Engineer Associate',
          certificationName: 'Databricks Certified Data Engineer Associate',
          learningHours: 35,
          completionStatus: LearningCompletionStatus.COMPLETED,
          skillArea: 'Data Engineering',
          completionDate: '2025-08-10',
          expiryDate: '2026-08-10',
        },
        {
          trainingName: 'Data Governance Essentials',
          learningHours: 12,
          completionStatus: LearningCompletionStatus.IN_PROGRESS,
          skillArea: 'Data Governance',
        },
      ],
    };

    for (const key of Object.keys(learningData) as ReportKey[]) {
      const employee = employees[key];
      for (const activity of learningData[key]) {
        await this.learningService.create({
          employeeId: employee.id,
          ...activity,
        });
      }
    }
  }

  private async seedPromotionReadiness(employees: EmployeeMap): Promise<void> {
    const promotionData: Record<ReportKey, PromotionReadinessSeed> = {
      priya: {
        technicalCapability: 90,
        leadership: 85,
        ownership: 90,
        delivery: 92,
        influence: 85,
        communication: 88,
        assessmentDate: '2026-05-15',
        notes:
          'Consistently delivers at staff level; ready for promotion pending headcount approval.',
      },
      arjun: {
        technicalCapability: 65,
        leadership: 55,
        ownership: 62,
        delivery: 68,
        influence: 50,
        communication: 60,
        assessmentDate: '2026-05-15',
        notes:
          'Solid technical growth; needs more exposure to design reviews and stakeholder communication.',
      },
      sneha: {
        technicalCapability: 85,
        leadership: 80,
        ownership: 82,
        delivery: 84,
        influence: 78,
        communication: 80,
        assessmentDate: '2026-05-15',
        notes:
          'Strong candidate for the engineering management track; building people-leadership experience.',
      },
      karthik: {
        technicalCapability: 55,
        leadership: 45,
        ownership: 50,
        delivery: 58,
        influence: 42,
        communication: 50,
        assessmentDate: '2026-05-15',
        notes:
          'Showing steady improvement; continue building technical depth and ownership.',
      },
      divya: {
        technicalCapability: 92,
        leadership: 90,
        ownership: 94,
        delivery: 95,
        influence: 88,
        communication: 90,
        assessmentDate: '2026-05-15',
        notes:
          'Strong candidate for the EM track; recommend fast-tracking promotion review.',
      },
      vikram: {
        technicalCapability: 40,
        leadership: 30,
        ownership: 35,
        delivery: 38,
        influence: 28,
        communication: 35,
        assessmentDate: '2026-05-15',
        notes:
          'Needs significant improvement across all readiness dimensions before considering a promotion path.',
      },
      ananya: {
        technicalCapability: 48,
        leadership: 38,
        ownership: 45,
        delivery: 50,
        influence: 35,
        communication: 45,
        assessmentDate: '2026-05-15',
        notes:
          'Early career; focus on building technical fundamentals and consistency.',
      },
      rohan: {
        technicalCapability: 86,
        leadership: 75,
        ownership: 84,
        delivery: 85,
        influence: 76,
        communication: 78,
        assessmentDate: '2026-05-15',
        notes:
          'Near-ready for staff promotion; building cross-team influence track record.',
      },
    };

    for (const key of Object.keys(promotionData) as ReportKey[]) {
      const employee = employees[key];
      await this.promotionReadinessService.create({
        employeeId: employee.id,
        ...promotionData[key],
      });
    }
  }

  private async seedTalentMatrix(employees: EmployeeMap): Promise<void> {
    const talentMatrixData: Record<ReportKey, TalentMatrixSeed> = {
      priya: {
        potentialScore: 60,
        performanceScore: 90,
        quarter: Quarter.Q2,
        year: 2026,
        notes:
          'High performer with strong technical execution; growing influence beyond immediate team.',
      },
      arjun: {
        potentialScore: 55,
        performanceScore: 55,
        quarter: Quarter.Q2,
        year: 2026,
      },
      sneha: {
        potentialScore: 58,
        performanceScore: 80,
        quarter: Quarter.Q2,
        year: 2026,
      },
      karthik: {
        potentialScore: 48,
        performanceScore: 45,
        quarter: Quarter.Q2,
        year: 2026,
      },
      divya: {
        potentialScore: 88,
        performanceScore: 92,
        quarter: Quarter.Q2,
        year: 2026,
        notes:
          'Top talent; strong candidate for future leadership roles across the org.',
      },
      vikram: {
        potentialScore: 35,
        performanceScore: 28,
        quarter: Quarter.Q2,
        year: 2026,
        notes: 'On a performance improvement plan; reassess next quarter.',
      },
      ananya: {
        potentialScore: 72,
        performanceScore: 48,
        quarter: Quarter.Q2,
        year: 2026,
        notes:
          'Early career engineer with strong upside; performance expected to grow with experience.',
      },
      rohan: {
        potentialScore: 55,
        performanceScore: 78,
        quarter: Quarter.Q2,
        year: 2026,
      },
    };

    for (const key of Object.keys(talentMatrixData) as ReportKey[]) {
      const employee = employees[key];
      await this.talentMatrixService.upsertForEmployee({
        employeeId: employee.id,
        ...talentMatrixData[key],
      });
    }
  }

  private async seedRisk(employees: EmployeeMap): Promise<void> {
    const riskData: Record<ReportKey, RiskSeed> = {
      priya: {
        attritionRisk: RiskLevel.LOW,
        burnoutRisk: RiskLevel.LOW,
        skillGapRisk: RiskLevel.LOW,
        performanceRisk: RiskLevel.LOW,
        assessmentDate: '2026-06-01',
        notes: 'High performer, well engaged.',
      },
      arjun: {
        attritionRisk: RiskLevel.LOW,
        burnoutRisk: RiskLevel.LOW,
        skillGapRisk: RiskLevel.MEDIUM,
        performanceRisk: RiskLevel.LOW,
        assessmentDate: '2026-06-01',
      },
      sneha: {
        attritionRisk: RiskLevel.LOW,
        burnoutRisk: RiskLevel.MEDIUM,
        skillGapRisk: RiskLevel.LOW,
        performanceRisk: RiskLevel.LOW,
        assessmentDate: '2026-06-01',
        notes:
          'Carrying a heavy mentoring load alongside delivery work - monitor workload.',
      },
      karthik: {
        attritionRisk: RiskLevel.MEDIUM,
        burnoutRisk: RiskLevel.MEDIUM,
        skillGapRisk: RiskLevel.MEDIUM,
        performanceRisk: RiskLevel.MEDIUM,
        assessmentDate: '2026-06-01',
        notes:
          'Needs continued support to close skill gaps and build confidence.',
      },
      divya: {
        attritionRisk: RiskLevel.MEDIUM,
        burnoutRisk: RiskLevel.MEDIUM,
        skillGapRisk: RiskLevel.LOW,
        performanceRisk: RiskLevel.LOW,
        assessmentDate: '2026-06-01',
        notes:
          'Monitor closely - strong external market demand for her skill set; promotion timeline is a retention factor.',
      },
      vikram: {
        attritionRisk: RiskLevel.HIGH,
        burnoutRisk: RiskLevel.HIGH,
        skillGapRisk: RiskLevel.MEDIUM,
        performanceRisk: RiskLevel.HIGH,
        assessmentDate: '2026-06-01',
        notes:
          'At risk of attrition; performance has declined over the last two quarters. Improvement plan and HR support in place.',
      },
      ananya: {
        attritionRisk: RiskLevel.LOW,
        burnoutRisk: RiskLevel.LOW,
        skillGapRisk: RiskLevel.MEDIUM,
        performanceRisk: RiskLevel.LOW,
        assessmentDate: '2026-06-01',
        notes:
          'Early career; skill gaps expected to close with planned training.',
      },
      rohan: {
        attritionRisk: RiskLevel.LOW,
        burnoutRisk: RiskLevel.LOW,
        skillGapRisk: RiskLevel.LOW,
        performanceRisk: RiskLevel.LOW,
        assessmentDate: '2026-06-01',
      },
    };

    for (const key of Object.keys(riskData) as ReportKey[]) {
      const employee = employees[key];
      await this.riskService.create({
        employeeId: employee.id,
        ...riskData[key],
      });
    }
  }

  private async seedNotifications(employees: EmployeeMap): Promise<void> {
    const manager = await this.usersService.findByEmail(
      employees.manager.email,
    );
    if (!manager) {
      return;
    }

    const notificationDefs: Array<{
      type: NotificationType;
      message: string;
      relatedEntityId?: string;
      dueDate?: string;
    }> = [
      {
        type: NotificationType.PENDING_REVIEW,
        message: `Quarterly review for ${employees.karthik.fullName} (Q2 2026) is pending.`,
        relatedEntityId: employees.karthik.id,
        dueDate: '2026-06-30',
      },
      {
        type: NotificationType.GOAL_DEADLINE,
        message: `Goal "Reduce mobile app crash rate below 1%" for ${employees.karthik.fullName} is at risk and due soon.`,
        relatedEntityId: employees.karthik.id,
        dueDate: '2026-06-30',
      },
      {
        type: NotificationType.PROMOTION_REVIEW,
        message: `${employees.divya.fullName} is promotion-ready - schedule a calibration review.`,
        relatedEntityId: employees.divya.id,
      },
      {
        type: NotificationType.PROMOTION_REVIEW,
        message: `${employees.priya.fullName} is promotion-ready - schedule a calibration review.`,
        relatedEntityId: employees.priya.id,
      },
      {
        type: NotificationType.MISSING_ONE_ON_ONE,
        message: `No 1:1 logged with ${employees.vikram.fullName} in the last 30 days.`,
        relatedEntityId: employees.vikram.id,
      },
      {
        type: NotificationType.CERTIFICATION_EXPIRY,
        message: `${employees.rohan.fullName}'s Databricks Certified Data Engineer Associate certification expires on 2026-08-10.`,
        relatedEntityId: employees.rohan.id,
        dueDate: '2026-08-10',
      },
    ];

    for (const notification of notificationDefs) {
      await this.notificationsService.create({
        userId: manager.id,
        ...notification,
      });
    }
  }
}
