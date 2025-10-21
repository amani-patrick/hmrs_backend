import { Injectable, Inject, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { Repository, Like, In, Between } from 'typeorm';
import { TrainingProgram, ProgramStatus } from './entities/training-program.entity';
import { Course, CourseStatus } from './entities/course.entity';
import { Enrollment, EnrollmentStatus } from './entities/enrollment.entity';
import { Assessment } from './entities/assessment.entity';
import { AssessmentResult } from './entities/assessment-result.entity';
import { Certificate, CertificateStatus } from './entities/certificate.entity';
import { LearningPath } from './entities/learning-path.entity';
import { Skill } from './entities/skill.entity';
import { UserSkill } from './entities/user-skill.entity';
import { CreateProgramDto } from './dto/create-program.dto';
import { UpdateProgramDto } from './dto/update-program.dto';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CreateEnrollmentDto, BulkEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';

@Injectable()
export class TrainingService {
  constructor(
    @Inject('TRAINING_PROGRAM_REPOSITORY')
    private readonly programRepository: Repository<TrainingProgram>,
    @Inject('COURSE_REPOSITORY')
    private readonly courseRepository: Repository<Course>,
    @Inject('ENROLLMENT_REPOSITORY')
    private readonly enrollmentRepository: Repository<Enrollment>,
    @Inject('ASSESSMENT_REPOSITORY')
    private readonly assessmentRepository: Repository<Assessment>,
    @Inject('ASSESSMENT_RESULT_REPOSITORY')
    private readonly assessmentResultRepository: Repository<AssessmentResult>,
    @Inject('CERTIFICATE_REPOSITORY')
    private readonly certificateRepository: Repository<Certificate>,
    @Inject('LEARNING_PATH_REPOSITORY')
    private readonly learningPathRepository: Repository<LearningPath>,
    @Inject('SKILL_REPOSITORY')
    private readonly skillRepository: Repository<Skill>,
    @Inject('USER_SKILL_REPOSITORY')
    private readonly userSkillRepository: Repository<UserSkill>,
  ) {}

  // ==================== PROGRAMS ====================

  async createProgram(tenantId: string, userId: string, dto: CreateProgramDto): Promise<TrainingProgram> {
    const program = this.programRepository.create({
      ...dto,
      tenantId,
      createdBy: userId,
      totalEnrollments: 0,
      completedEnrollments: 0,
      completionRate: 0,
    });

    return this.programRepository.save(program);
  }

  async getAllPrograms(tenantId: string, filters?: {
    status?: ProgramStatus;
    type?: string;
    search?: string;
    isActive?: boolean;
  }): Promise<TrainingProgram[]> {
    const where: any = { tenantId };

    if (filters?.status) where.status = filters.status;
    if (filters?.type) where.type = filters.type;
    if (filters?.isActive !== undefined) where.isActive = filters.isActive;
    if (filters?.search) {
      return this.programRepository.find({
        where: [
          { tenantId, title: Like(`%${filters.search}%`) },
          { tenantId, description: Like(`%${filters.search}%`) },
        ],
        order: { createdAt: 'DESC' },
      });
    }

    return this.programRepository.find({
      where,
      relations: ['courses'],
      order: { createdAt: 'DESC' },
    });
  }

  async getProgramById(tenantId: string, id: string): Promise<TrainingProgram> {
    const program = await this.programRepository.findOne({
      where: { id, tenantId },
      relations: ['courses'],
    });

    if (!program) {
      throw new NotFoundException(`Program with ID ${id} not found`);
    }

    return program;
  }

  async updateProgram(tenantId: string, id: string, userId: string, dto: UpdateProgramDto): Promise<TrainingProgram> {
    const program = await this.getProgramById(tenantId, id);

    Object.assign(program, dto);
    program.updatedBy = userId;

    return this.programRepository.save(program);
  }

  async deleteProgram(tenantId: string, id: string): Promise<void> {
    const program = await this.getProgramById(tenantId, id);
    
    // Check if there are active enrollments
    const activeEnrollments = await this.enrollmentRepository.count({
      where: { 
        tenantId, 
        programId: id,
        status: In([EnrollmentStatus.ENROLLED, EnrollmentStatus.IN_PROGRESS])
      },
    });

    if (activeEnrollments > 0) {
      throw new BadRequestException('Cannot delete program with active enrollments. Archive it instead.');
    }

    await this.programRepository.remove(program);
  }

  async archiveProgram(tenantId: string, id: string): Promise<TrainingProgram> {
    const program = await this.getProgramById(tenantId, id);
    program.status = ProgramStatus.ARCHIVED;
    program.isActive = false;
    return this.programRepository.save(program);
  }

  async getProgramStatistics(tenantId: string, id: string): Promise<{
    totalEnrollments: number;
    activeEnrollments: number;
    completedEnrollments: number;
    completionRate: number;
    averageProgress: number;
    averageScore: number;
  }> {
    const enrollments = await this.enrollmentRepository.find({
      where: { tenantId, programId: id },
    });

    const totalEnrollments = enrollments.length;
    const activeEnrollments = enrollments.filter(e => 
      [EnrollmentStatus.ENROLLED, EnrollmentStatus.IN_PROGRESS].includes(e.status)
    ).length;
    const completedEnrollments = enrollments.filter(e => 
      e.status === EnrollmentStatus.COMPLETED
    ).length;

    const completionRate = totalEnrollments > 0 
      ? (completedEnrollments / totalEnrollments) * 100 
      : 0;

    const averageProgress = totalEnrollments > 0
      ? enrollments.reduce((sum, e) => sum + Number(e.progress), 0) / totalEnrollments
      : 0;

    const scoresWithValue = enrollments.filter(e => e.score !== null);
    const averageScore = scoresWithValue.length > 0
      ? scoresWithValue.reduce((sum, e) => sum + Number(e.score), 0) / scoresWithValue.length
      : 0;

    return {
      totalEnrollments,
      activeEnrollments,
      completedEnrollments,
      completionRate: Math.round(completionRate * 100) / 100,
      averageProgress: Math.round(averageProgress * 100) / 100,
      averageScore: Math.round(averageScore * 100) / 100,
    };
  }

  // ==================== COURSES ====================

  async createCourse(tenantId: string, userId: string, dto: CreateCourseDto): Promise<Course> {
    // Validate program if provided
    if (dto.programId) {
      await this.getProgramById(tenantId, dto.programId);
    }

    const course = this.courseRepository.create({
      ...dto,
      tenantId,
      createdBy: userId,
      enrollmentCount: 0,
      completionCount: 0,
      averageRating: 0,
      totalRatings: 0,
    });

    return this.courseRepository.save(course);
  }

  async getAllCourses(tenantId: string, filters?: {
    status?: CourseStatus;
    level?: string;
    programId?: string;
    search?: string;
    isActive?: boolean;
    isFeatured?: boolean;
  }): Promise<Course[]> {
    const where: any = { tenantId };

    if (filters?.status) where.status = filters.status;
    if (filters?.level) where.level = filters.level;
    if (filters?.programId) where.programId = filters.programId;
    if (filters?.isActive !== undefined) where.isActive = filters.isActive;
    if (filters?.isFeatured !== undefined) where.isFeatured = filters.isFeatured;

    if (filters?.search) {
      return this.courseRepository.find({
        where: [
          { tenantId, title: Like(`%${filters.search}%`) },
          { tenantId, description: Like(`%${filters.search}%`) },
        ],
        relations: ['program', 'modules'],
        order: { createdAt: 'DESC' },
      });
    }

    return this.courseRepository.find({
      where,
      relations: ['program', 'modules'],
      order: { createdAt: 'DESC' },
    });
  }

  async getCourseById(tenantId: string, id: string): Promise<Course> {
    const course = await this.courseRepository.findOne({
      where: { id, tenantId },
      relations: ['program', 'modules'],
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    return course;
  }

  async updateCourse(tenantId: string, id: string, userId: string, dto: UpdateCourseDto): Promise<Course> {
    const course = await this.getCourseById(tenantId, id);

    Object.assign(course, dto);
    course.updatedBy = userId;

    return this.courseRepository.save(course);
  }

  async deleteCourse(tenantId: string, id: string): Promise<void> {
    const course = await this.getCourseById(tenantId, id);
    
    // Check for active enrollments
    const activeEnrollments = await this.enrollmentRepository.count({
      where: { 
        tenantId, 
        courseId: id,
        status: In([EnrollmentStatus.ENROLLED, EnrollmentStatus.IN_PROGRESS])
      },
    });

    if (activeEnrollments > 0) {
      throw new BadRequestException('Cannot delete course with active enrollments. Archive it instead.');
    }

    await this.courseRepository.remove(course);
  }

  async getCourseStatistics(tenantId: string, id: string): Promise<{
    enrollmentCount: number;
    activeEnrollments: number;
    completionCount: number;
    completionRate: number;
    averageProgress: number;
    averageScore: number;
    averageRating: number;
  }> {
    const course = await this.getCourseById(tenantId, id);
    
    const enrollments = await this.enrollmentRepository.find({
      where: { tenantId, courseId: id },
    });

    const activeEnrollments = enrollments.filter(e => 
      [EnrollmentStatus.ENROLLED, EnrollmentStatus.IN_PROGRESS].includes(e.status)
    ).length;

    const completionRate = course.enrollmentCount > 0 
      ? (course.completionCount / course.enrollmentCount) * 100 
      : 0;

    const averageProgress = enrollments.length > 0
      ? enrollments.reduce((sum, e) => sum + Number(e.progress), 0) / enrollments.length
      : 0;

    const scoresWithValue = enrollments.filter(e => e.score !== null);
    const averageScore = scoresWithValue.length > 0
      ? scoresWithValue.reduce((sum, e) => sum + Number(e.score), 0) / scoresWithValue.length
      : 0;

    return {
      enrollmentCount: course.enrollmentCount,
      activeEnrollments,
      completionCount: course.completionCount,
      completionRate: Math.round(completionRate * 100) / 100,
      averageProgress: Math.round(averageProgress * 100) / 100,
      averageScore: Math.round(averageScore * 100) / 100,
      averageRating: Number(course.averageRating),
    };
  }

  // ==================== ENROLLMENTS ====================

  async createEnrollment(tenantId: string, dto: CreateEnrollmentDto): Promise<Enrollment> {
    if (!dto.courseId && !dto.programId) {
      throw new BadRequestException('Either courseId or programId must be provided');
    }

    // Check for duplicate enrollment
    const existing = await this.enrollmentRepository.findOne({
      where: {
        tenantId,
        learnerId: dto.learnerId,
        ...(dto.courseId ? { courseId: dto.courseId } : { programId: dto.programId }),
      },
    });

    if (existing) {
      throw new ConflictException('User is already enrolled in this course/program');
    }

    const enrollment = this.enrollmentRepository.create({
      ...dto,
      tenantId,
      enrolledDate: new Date(),
      status: EnrollmentStatus.ENROLLED,
      progress: 0,
      attempt: 1,
    });

    const saved = await this.enrollmentRepository.save(enrollment);

    // Update enrollment counts
    if (dto.courseId) {
      await this.courseRepository.increment({ id: dto.courseId }, 'enrollmentCount', 1);
    }
    if (dto.programId) {
      await this.programRepository.increment({ id: dto.programId }, 'totalEnrollments', 1);
    }

    return saved;
  }

  async bulkEnroll(tenantId: string, dto: BulkEnrollmentDto): Promise<Enrollment[]> {
    const enrollments: Enrollment[] = [];

    for (const learnerId of dto.learnerIds) {
      try {
        const enrollment = await this.createEnrollment(tenantId, {
          learnerId,
          courseId: dto.courseId,
          programId: dto.programId,
          dueDate: dto.dueDate,
          isMandatory: dto.isMandatory,
        });
        enrollments.push(enrollment);
      } catch (error) {
        // Skip duplicates, continue with others
        if (!(error instanceof ConflictException)) {
          throw error;
        }
      }
    }

    return enrollments;
  }

  async getEnrollments(tenantId: string, filters?: {
    learnerId?: string;
    courseId?: string;
    programId?: string;
    status?: EnrollmentStatus;
  }): Promise<Enrollment[]> {
    const where: any = { tenantId };

    if (filters?.learnerId) where.learnerId = filters.learnerId;
    if (filters?.courseId) where.courseId = filters.courseId;
    if (filters?.programId) where.programId = filters.programId;
    if (filters?.status) where.status = filters.status;

    return this.enrollmentRepository.find({
      where,
      relations: ['learner', 'course', 'program'],
      order: { enrolledDate: 'DESC' },
    });
  }

  async getEnrollmentById(tenantId: string, id: string): Promise<Enrollment> {
    const enrollment = await this.enrollmentRepository.findOne({
      where: { id, tenantId },
      relations: ['learner', 'course', 'program'],
    });

    if (!enrollment) {
      throw new NotFoundException(`Enrollment with ID ${id} not found`);
    }

    return enrollment;
  }

  async updateEnrollment(tenantId: string, id: string, dto: UpdateEnrollmentDto): Promise<Enrollment> {
    const enrollment = await this.getEnrollmentById(tenantId, id);

    const oldStatus = enrollment.status;
    Object.assign(enrollment, dto);

    // Update timestamps based on status changes
    if (dto.status) {
      if (dto.status === EnrollmentStatus.IN_PROGRESS && !enrollment.startedDate) {
        enrollment.startedDate = new Date();
      }
      if (dto.status === EnrollmentStatus.COMPLETED && !enrollment.completedDate) {
        enrollment.completedDate = new Date();
        
        // Update completion counts
        if (enrollment.courseId) {
          await this.courseRepository.increment({ id: enrollment.courseId }, 'completionCount', 1);
        }
        if (enrollment.programId) {
          await this.programRepository.increment({ id: enrollment.programId }, 'completedEnrollments', 1);
        }
      }
    }

    return this.enrollmentRepository.save(enrollment);
  }

  async getMyEnrollments(tenantId: string, learnerId: string): Promise<Enrollment[]> {
    return this.getEnrollments(tenantId, { learnerId });
  }

  async getLearnerProgress(tenantId: string, learnerId: string): Promise<{
    totalEnrollments: number;
    inProgress: number;
    completed: number;
    completionRate: number;
    averageScore: number;
    certificatesEarned: number;
  }> {
    const enrollments = await this.getEnrollments(tenantId, { learnerId });
    const certificates = await this.certificateRepository.count({
      where: { tenantId, learnerId, status: CertificateStatus.ISSUED },
    });

    const totalEnrollments = enrollments.length;
    const inProgress = enrollments.filter(e => e.status === EnrollmentStatus.IN_PROGRESS).length;
    const completed = enrollments.filter(e => e.status === EnrollmentStatus.COMPLETED).length;
    const completionRate = totalEnrollments > 0 ? (completed / totalEnrollments) * 100 : 0;

    const scoresWithValue = enrollments.filter(e => e.score !== null);
    const averageScore = scoresWithValue.length > 0
      ? scoresWithValue.reduce((sum, e) => sum + Number(e.score), 0) / scoresWithValue.length
      : 0;

    return {
      totalEnrollments,
      inProgress,
      completed,
      completionRate: Math.round(completionRate * 100) / 100,
      averageScore: Math.round(averageScore * 100) / 100,
      certificatesEarned: certificates,
    };
  }

  // ==================== ANALYTICS ====================

  async getTrainingAnalytics(tenantId: string): Promise<{
    totalPrograms: number;
    totalCourses: number;
    totalEnrollments: number;
    activeEnrollments: number;
    completionRate: number;
    certificatesIssued: number;
    topCourses: Array<{ courseId: string; title: string; enrollments: number }>;
    recentActivity: Array<{ type: string; description: string; timestamp: Date }>;
  }> {
    const [programs, courses, enrollments, certificates] = await Promise.all([
      this.programRepository.count({ where: { tenantId, isActive: true } }),
      this.courseRepository.count({ where: { tenantId, isActive: true } }),
      this.enrollmentRepository.find({ where: { tenantId } }),
      this.certificateRepository.count({ where: { tenantId, status: CertificateStatus.ISSUED } }),
    ]);

    const activeEnrollments = enrollments.filter(e => 
      [EnrollmentStatus.ENROLLED, EnrollmentStatus.IN_PROGRESS].includes(e.status)
    ).length;

    const completed = enrollments.filter(e => e.status === EnrollmentStatus.COMPLETED).length;
    const completionRate = enrollments.length > 0 ? (completed / enrollments.length) * 100 : 0;

    // Get top 5 courses by enrollment
    const courseEnrollments = await this.courseRepository.find({
      where: { tenantId, isActive: true },
      order: { enrollmentCount: 'DESC' },
      take: 5,
    });

    const topCourses = courseEnrollments.map(c => ({
      courseId: c.id,
      title: c.title,
      enrollments: c.enrollmentCount,
    }));

    // Recent activity (last 10 enrollments and completions)
    const recentEnrollments = await this.enrollmentRepository.find({
      where: { tenantId },
      relations: ['learner', 'course'],
      order: { createdAt: 'DESC' },
      take: 10,
    });

    const recentActivity = recentEnrollments.map(e => ({
      type: e.status === EnrollmentStatus.COMPLETED ? 'completion' : 'enrollment',
      description: `${e.learner?.firstName || 'User'} ${e.status === EnrollmentStatus.COMPLETED ? 'completed' : 'enrolled in'} ${e.course?.title || 'course'}`,
      timestamp: (e.status === EnrollmentStatus.COMPLETED ? e.completedDate : e.enrolledDate) || e.createdAt,
    }));

    return {
      totalPrograms: programs,
      totalCourses: courses,
      totalEnrollments: enrollments.length,
      activeEnrollments,
      completionRate: Math.round(completionRate * 100) / 100,
      certificatesIssued: certificates,
      topCourses,
      recentActivity,
    };
  }
}
