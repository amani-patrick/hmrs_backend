import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { Repository, Between, In, MoreThan, LessThan } from 'typeorm';
import { PerformanceReview, ReviewStatus, ReviewType } from './entities/performance-review.entity';
import { Goal, GoalStatus } from './entities/goal.entity';
import { Feedback, FeedbackStatus } from './entities/feedback.entity';
import { KPI, KpiStatus } from './entities/kpi.entity';
import { KPIRecord } from './entities/kpi-record.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { CreateKpiDto } from './dto/create-kpi.dto';
import { RecordKpiDto } from './dto/record-kpi.dto';

@Injectable()
export class PerformanceService {
  constructor(
    @Inject('PERFORMANCE_REVIEW_REPOSITORY')
    private readonly reviewRepository: Repository<PerformanceReview>,
    @Inject('GOAL_REPOSITORY')
    private readonly goalRepository: Repository<Goal>,
    @Inject('FEEDBACK_REPOSITORY')
    private readonly feedbackRepository: Repository<Feedback>,
    @Inject('KPI_REPOSITORY')
    private readonly kpiRepository: Repository<KPI>,
    @Inject('KPI_RECORD_REPOSITORY')
    private readonly kpiRecordRepository: Repository<KPIRecord>,
  ) {}

  // ==================== PERFORMANCE REVIEWS ====================

  async createReview(tenantId: string, userId: string, dto: CreateReviewDto): Promise<PerformanceReview> {
    const review = this.reviewRepository.create({
      ...dto,
      tenantId,
      createdBy: userId,
      status: ReviewStatus.DRAFT,
    });

    return this.reviewRepository.save(review);
  }

  async getAllReviews(tenantId: string, filters?: {
    employeeId?: string;
    reviewerId?: string;
    status?: ReviewStatus;
    reviewType?: ReviewType;
    startDate?: string;
    endDate?: string;
  }): Promise<PerformanceReview[]> {
    const where: any = { tenantId };

    if (filters?.employeeId) where.employeeId = filters.employeeId;
    if (filters?.reviewerId) where.reviewerId = filters.reviewerId;
    if (filters?.status) where.status = filters.status;
    if (filters?.reviewType) where.reviewType = filters.reviewType;

    if (filters?.startDate && filters?.endDate) {
      where.reviewPeriodStart = Between(new Date(filters.startDate), new Date(filters.endDate));
    }

    return this.reviewRepository.find({
      where,
      relations: ['employee', 'reviewer'],
      order: { createdAt: 'DESC' },
    });
  }

  async getReviewById(tenantId: string, id: string): Promise<PerformanceReview> {
    const review = await this.reviewRepository.findOne({
      where: { id, tenantId },
      relations: ['employee', 'reviewer'],
    });

    if (!review) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }

    return review;
  }

  async updateReview(tenantId: string, id: string, dto: UpdateReviewDto): Promise<PerformanceReview> {
    const review = await this.getReviewById(tenantId, id);

    Object.assign(review, dto);

    // Update timestamps based on status
    if (dto.status === ReviewStatus.SUBMITTED && !review.submittedAt) {
      review.submittedAt = new Date();
    }
    if (dto.status === ReviewStatus.COMPLETED && !review.completedAt) {
      review.completedAt = new Date();
    }

    return this.reviewRepository.save(review);
  }

  async deleteReview(tenantId: string, id: string): Promise<void> {
    const review = await this.getReviewById(tenantId, id);
    
    if (review.status === ReviewStatus.COMPLETED) {
      throw new BadRequestException('Cannot delete completed review');
    }

    await this.reviewRepository.remove(review);
  }

  async acknowledgeReview(tenantId: string, id: string, userId: string): Promise<PerformanceReview> {
    const review = await this.getReviewById(tenantId, id);

    if (review.employeeId !== userId) {
      throw new BadRequestException('Only the employee can acknowledge their review');
    }

    review.isAcknowledged = true;
    review.acknowledgedAt = new Date();

    return this.reviewRepository.save(review);
  }

  async getEmployeeReviews(tenantId: string, employeeId: string): Promise<PerformanceReview[]> {
    return this.getAllReviews(tenantId, { employeeId });
  }

  // ==================== GOALS ====================

  async createGoal(tenantId: string, userId: string, dto: CreateGoalDto): Promise<Goal> {
    const goal = this.goalRepository.create({
      ...dto,
      tenantId,
      createdBy: userId,
      status: GoalStatus.DRAFT,
      progress: 0,
    });

    return this.goalRepository.save(goal);
  }

  async getAllGoals(tenantId: string, filters?: {
    ownerId?: string;
    status?: GoalStatus;
    type?: string;
    dueDateFrom?: string;
    dueDateTo?: string;
  }): Promise<Goal[]> {
    const where: any = { tenantId };

    if (filters?.ownerId) where.ownerId = filters.ownerId;
    if (filters?.status) where.status = filters.status;
    if (filters?.type) where.type = filters.type;

    if (filters?.dueDateFrom && filters?.dueDateTo) {
      where.dueDate = Between(new Date(filters.dueDateFrom), new Date(filters.dueDateTo));
    }

    return this.goalRepository.find({
      where,
      relations: ['owner'],
      order: { dueDate: 'ASC' },
    });
  }

  async getGoalById(tenantId: string, id: string): Promise<Goal> {
    const goal = await this.goalRepository.findOne({
      where: { id, tenantId },
      relations: ['owner'],
    });

    if (!goal) {
      throw new NotFoundException(`Goal with ID ${id} not found`);
    }

    return goal;
  }

  async updateGoal(tenantId: string, id: string, dto: UpdateGoalDto): Promise<Goal> {
    const goal = await this.getGoalById(tenantId, id);

    Object.assign(goal, dto);

    // Auto-complete if progress reaches 100%
    if (dto.progress === 100 && goal.status !== GoalStatus.COMPLETED) {
      goal.status = GoalStatus.COMPLETED;
      goal.completedAt = new Date();
    }

    // Update status based on due date and progress
    if (goal.status === GoalStatus.ACTIVE || goal.status === GoalStatus.ON_TRACK) {
      const now = new Date();
      const dueDate = new Date(goal.dueDate);
      const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (goal.progress < 25 && daysUntilDue < 30) {
        goal.status = GoalStatus.BEHIND;
      } else if (goal.progress < 50 && daysUntilDue < 60) {
        goal.status = GoalStatus.AT_RISK;
      } else if (goal.progress >= 50) {
        goal.status = GoalStatus.ON_TRACK;
      }
    }

    return this.goalRepository.save(goal);
  }

  async deleteGoal(tenantId: string, id: string): Promise<void> {
    const goal = await this.getGoalById(tenantId, id);
    await this.goalRepository.remove(goal);
  }

  async getMyGoals(tenantId: string, ownerId: string): Promise<Goal[]> {
    return this.getAllGoals(tenantId, { ownerId });
  }

  async getGoalStatistics(tenantId: string, ownerId?: string): Promise<{
    total: number;
    active: number;
    completed: number;
    onTrack: number;
    atRisk: number;
    behind: number;
    completionRate: number;
    averageProgress: number;
  }> {
    const where: any = { tenantId };
    if (ownerId) where.ownerId = ownerId;

    const goals = await this.goalRepository.find({ where });

    const total = goals.length;
    const active = goals.filter(g => g.status === GoalStatus.ACTIVE).length;
    const completed = goals.filter(g => g.status === GoalStatus.COMPLETED).length;
    const onTrack = goals.filter(g => g.status === GoalStatus.ON_TRACK).length;
    const atRisk = goals.filter(g => g.status === GoalStatus.AT_RISK).length;
    const behind = goals.filter(g => g.status === GoalStatus.BEHIND).length;

    const completionRate = total > 0 ? (completed / total) * 100 : 0;
    const averageProgress = total > 0
      ? goals.reduce((sum, g) => sum + Number(g.progress), 0) / total
      : 0;

    return {
      total,
      active,
      completed,
      onTrack,
      atRisk,
      behind,
      completionRate: Math.round(completionRate * 100) / 100,
      averageProgress: Math.round(averageProgress * 100) / 100,
    };
  }

  // ==================== FEEDBACK ====================

  async createFeedback(tenantId: string, dto: CreateFeedbackDto): Promise<Feedback> {
    const feedback = this.feedbackRepository.create({
      ...dto,
      tenantId,
      status: FeedbackStatus.DRAFT,
    });

    return this.feedbackRepository.save(feedback);
  }

  async submitFeedback(tenantId: string, id: string): Promise<Feedback> {
    const feedback = await this.feedbackRepository.findOne({
      where: { id, tenantId },
    });

    if (!feedback) {
      throw new NotFoundException(`Feedback with ID ${id} not found`);
    }

    feedback.status = FeedbackStatus.SUBMITTED;
    return this.feedbackRepository.save(feedback);
  }

  async getAllFeedback(tenantId: string, filters?: {
    recipientId?: string;
    giverId?: string;
    status?: FeedbackStatus;
    type?: string;
  }): Promise<Feedback[]> {
    const where: any = { tenantId };

    if (filters?.recipientId) where.recipientId = filters.recipientId;
    if (filters?.giverId) where.giverId = filters.giverId;
    if (filters?.status) where.status = filters.status;
    if (filters?.type) where.type = filters.type;

    return this.feedbackRepository.find({
      where,
      relations: ['recipient', 'giver'],
      order: { createdAt: 'DESC' },
    });
  }

  async getFeedbackById(tenantId: string, id: string): Promise<Feedback> {
    const feedback = await this.feedbackRepository.findOne({
      where: { id, tenantId },
      relations: ['recipient', 'giver'],
    });

    if (!feedback) {
      throw new NotFoundException(`Feedback with ID ${id} not found`);
    }

    return feedback;
  }

  async acknowledgeFeedback(tenantId: string, id: string, userId: string): Promise<Feedback> {
    const feedback = await this.getFeedbackById(tenantId, id);

    if (feedback.recipientId !== userId) {
      throw new BadRequestException('Only the recipient can acknowledge feedback');
    }

    feedback.isAcknowledged = true;
    feedback.acknowledgedAt = new Date();
    feedback.status = FeedbackStatus.ACKNOWLEDGED;

    return this.feedbackRepository.save(feedback);
  }

  async getMyFeedback(tenantId: string, recipientId: string): Promise<Feedback[]> {
    return this.getAllFeedback(tenantId, { recipientId });
  }

  // ==================== KPIs ====================

  async createKPI(tenantId: string, userId: string, dto: CreateKpiDto): Promise<KPI> {
    const kpi = this.kpiRepository.create({
      ...dto,
      tenantId,
      createdBy: userId,
      status: KpiStatus.ACTIVE,
    });

    return this.kpiRepository.save(kpi);
  }

  async getAllKPIs(tenantId: string, filters?: {
    departmentId?: string;
    category?: string;
    status?: KpiStatus;
  }): Promise<KPI[]> {
    const where: any = { tenantId };

    if (filters?.departmentId) where.departmentId = filters.departmentId;
    if (filters?.category) where.category = filters.category;
    if (filters?.status) where.status = filters.status;

    return this.kpiRepository.find({
      where,
      order: { name: 'ASC' },
    });
  }

  async getKPIById(tenantId: string, id: string): Promise<KPI> {
    const kpi = await this.kpiRepository.findOne({
      where: { id, tenantId },
    });

    if (!kpi) {
      throw new NotFoundException(`KPI with ID ${id} not found`);
    }

    return kpi;
  }

  async recordKPI(tenantId: string, userId: string, dto: RecordKpiDto): Promise<KPIRecord> {
    const kpi = await this.getKPIById(tenantId, dto.kpiId);

    const targetValue = dto.targetValue ?? kpi.target;
    const achievementRate = targetValue
      ? (dto.actualValue / targetValue) * 100
      : null;

    const record = this.kpiRecordRepository.create({
      ...dto,
      tenantId,
      targetValue,
      achievementRate,
      recordedBy: userId,
    });

    return this.kpiRecordRepository.save(record);
  }

  async getKPIRecords(tenantId: string, filters?: {
    kpiId?: string;
    employeeId?: string;
    departmentId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<KPIRecord[]> {
    const where: any = { tenantId };

    if (filters?.kpiId) where.kpiId = filters.kpiId;
    if (filters?.employeeId) where.employeeId = filters.employeeId;
    if (filters?.departmentId) where.departmentId = filters.departmentId;

    if (filters?.startDate && filters?.endDate) {
      where.recordDate = Between(new Date(filters.startDate), new Date(filters.endDate));
    }

    return this.kpiRecordRepository.find({
      where,
      relations: ['kpi', 'employee'],
      order: { recordDate: 'DESC' },
    });
  }

  async getKPIAnalytics(tenantId: string, kpiId: string, startDate: string, endDate: string): Promise<{
    kpi: KPI;
    records: KPIRecord[];
    average: number;
    trend: string;
    achievementRate: number;
  }> {
    const kpi = await this.getKPIById(tenantId, kpiId);
    const records = await this.getKPIRecords(tenantId, {
      kpiId,
      startDate,
      endDate,
    });

    const average = records.length > 0
      ? records.reduce((sum, r) => sum + Number(r.actualValue), 0) / records.length
      : 0;

    const achievementRate = kpi.target
      ? (average / kpi.target) * 100
      : 0;

    // Simple trend calculation
    let trend = 'stable';
    if (records.length >= 2) {
      const recent = Number(records[0].actualValue);
      const older = Number(records[records.length - 1].actualValue);
      if (recent > older * 1.1) trend = 'improving';
      if (recent < older * 0.9) trend = 'declining';
    }

    return {
      kpi,
      records,
      average: Math.round(average * 100) / 100,
      trend,
      achievementRate: Math.round(achievementRate * 100) / 100,
    };
  }

  // ==================== ANALYTICS ====================

  async getPerformanceDashboard(tenantId: string): Promise<{
    reviews: { total: number; pending: number; completed: number };
    goals: { total: number; active: number; completed: number; completionRate: number };
    feedback: { total: number; pending: number; acknowledged: number };
    kpis: { total: number; active: number };
  }> {
    const [reviews, goals, feedback, kpis] = await Promise.all([
      this.reviewRepository.find({ where: { tenantId } }),
      this.goalRepository.find({ where: { tenantId } }),
      this.feedbackRepository.find({ where: { tenantId } }),
      this.kpiRepository.find({ where: { tenantId } }),
    ]);

    const reviewStats = {
      total: reviews.length,
      pending: reviews.filter(r => r.status === ReviewStatus.IN_PROGRESS || r.status === ReviewStatus.SUBMITTED).length,
      completed: reviews.filter(r => r.status === ReviewStatus.COMPLETED).length,
    };

    const goalStats = {
      total: goals.length,
      active: goals.filter(g => g.status === GoalStatus.ACTIVE || g.status === GoalStatus.ON_TRACK).length,
      completed: goals.filter(g => g.status === GoalStatus.COMPLETED).length,
      completionRate: goals.length > 0
        ? Math.round((goals.filter(g => g.status === GoalStatus.COMPLETED).length / goals.length) * 100 * 100) / 100
        : 0,
    };

    const feedbackStats = {
      total: feedback.length,
      pending: feedback.filter(f => f.status === FeedbackStatus.SUBMITTED && !f.isAcknowledged).length,
      acknowledged: feedback.filter(f => f.isAcknowledged).length,
    };

    const kpiStats = {
      total: kpis.length,
      active: kpis.filter(k => k.status === KpiStatus.ACTIVE).length,
    };

    return {
      reviews: reviewStats,
      goals: goalStats,
      feedback: feedbackStats,
      kpis: kpiStats,
    };
  }
}
