import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiSecurity, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { TrainingService } from './training.service';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/roles.enum';
import { CreateProgramDto } from './dto/create-program.dto';
import { UpdateProgramDto } from './dto/update-program.dto';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CreateEnrollmentDto, BulkEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { ProgramStatus } from './entities/training-program.entity';
import { CourseStatus } from './entities/course.entity';
import { EnrollmentStatus } from './entities/enrollment.entity';

@ApiTags('Training')
@ApiBearerAuth()
@ApiSecurity('tenant-id')
@Controller('training')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class TrainingController {
  constructor(private readonly trainingService: TrainingService) {}

  // ==================== PROGRAMS ====================

  @Post('programs')
  @Roles(Role.ADMIN, Role.TRAINER, Role.HR)
  @ApiOperation({ summary: 'Create a new training program' })
  @ApiResponse({ status: 201, description: 'Program created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createProgram(@Req() req: any, @Body() dto: CreateProgramDto) {
    const tenantId = req.tenantId;
    const userId = req.user.userId;
    return this.trainingService.createProgram(tenantId, userId, dto);
  }

  @Get('programs')
  @ApiOperation({ summary: 'Get all training programs' })
  @ApiQuery({ name: 'status', enum: ProgramStatus, required: false })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'isActive', type: Boolean, required: false })
  @ApiResponse({ status: 200, description: 'Programs retrieved successfully' })
  async getAllPrograms(
    @Req() req: any,
    @Query('status') status?: ProgramStatus,
    @Query('type') type?: string,
    @Query('search') search?: string,
    @Query('isActive') isActive?: string,
  ) {
    const tenantId = req.tenantId;
    return this.trainingService.getAllPrograms(tenantId, {
      status,
      type,
      search,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
    });
  }

  @Get('programs/:id')
  @ApiOperation({ summary: 'Get program by ID' })
  @ApiResponse({ status: 200, description: 'Program retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Program not found' })
  async getProgramById(@Req() req: any, @Param('id') id: string) {
    return this.trainingService.getProgramById(req.tenantId, id);
  }

  @Put('programs/:id')
  @Roles(Role.ADMIN, Role.TRAINER, Role.HR)
  @ApiOperation({ summary: 'Update program' })
  @ApiResponse({ status: 200, description: 'Program updated successfully' })
  @ApiResponse({ status: 404, description: 'Program not found' })
  async updateProgram(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateProgramDto,
  ) {
    const tenantId = req.tenantId;
    const userId = req.user.userId;
    return this.trainingService.updateProgram(tenantId, id, userId, dto);
  }

  @Delete('programs/:id')
  @Roles(Role.ADMIN, Role.TRAINER)
  @ApiOperation({ summary: 'Delete program' })
  @ApiResponse({ status: 200, description: 'Program deleted successfully' })
  @ApiResponse({ status: 400, description: 'Cannot delete program with active enrollments' })
  async deleteProgram(@Req() req: any, @Param('id') id: string) {
    await this.trainingService.deleteProgram(req.tenantId, id);
    return { message: 'Program deleted successfully' };
  }

  @Post('programs/:id/archive')
  @Roles(Role.ADMIN, Role.TRAINER, Role.HR)
  @ApiOperation({ summary: 'Archive program' })
  @ApiResponse({ status: 200, description: 'Program archived successfully' })
  async archiveProgram(@Req() req: any, @Param('id') id: string) {
    return this.trainingService.archiveProgram(req.tenantId, id);
  }

  @Get('programs/:id/statistics')
  @Roles(Role.ADMIN, Role.TRAINER, Role.HR, Role.MANAGER)
  @ApiOperation({ summary: 'Get program statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getProgramStatistics(@Req() req: any, @Param('id') id: string) {
    return this.trainingService.getProgramStatistics(req.tenantId, id);
  }

  // ==================== COURSES ====================

  @Post('courses')
  @Roles(Role.ADMIN, Role.TRAINER, Role.HR)
  @ApiOperation({ summary: 'Create a new course' })
  @ApiResponse({ status: 201, description: 'Course created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createCourse(@Req() req: any, @Body() dto: CreateCourseDto) {
    const tenantId = req.tenantId;
    const userId = req.user.userId;
    return this.trainingService.createCourse(tenantId, userId, dto);
  }

  @Get('courses')
  @ApiOperation({ summary: 'Get all courses' })
  @ApiQuery({ name: 'status', enum: CourseStatus, required: false })
  @ApiQuery({ name: 'level', required: false })
  @ApiQuery({ name: 'programId', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'isActive', type: Boolean, required: false })
  @ApiQuery({ name: 'isFeatured', type: Boolean, required: false })
  @ApiResponse({ status: 200, description: 'Courses retrieved successfully' })
  async getAllCourses(
    @Req() req: any,
    @Query('status') status?: CourseStatus,
    @Query('level') level?: string,
    @Query('programId') programId?: string,
    @Query('search') search?: string,
    @Query('isActive') isActive?: string,
    @Query('isFeatured') isFeatured?: string,
  ) {
    const tenantId = req.tenantId;
    return this.trainingService.getAllCourses(tenantId, {
      status,
      level,
      programId,
      search,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      isFeatured: isFeatured === 'true' ? true : isFeatured === 'false' ? false : undefined,
    });
  }

  @Get('courses/:id')
  @ApiOperation({ summary: 'Get course by ID' })
  @ApiResponse({ status: 200, description: 'Course retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async getCourseById(@Req() req: any, @Param('id') id: string) {
    return this.trainingService.getCourseById(req.tenantId, id);
  }

  @Put('courses/:id')
  @Roles(Role.ADMIN, Role.TRAINER, Role.HR)
  @ApiOperation({ summary: 'Update course' })
  @ApiResponse({ status: 200, description: 'Course updated successfully' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async updateCourse(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateCourseDto,
  ) {
    const tenantId = req.tenantId;
    const userId = req.user.userId;
    return this.trainingService.updateCourse(tenantId, id, userId, dto);
  }

  @Delete('courses/:id')
  @Roles(Role.ADMIN, Role.TRAINER)
  @ApiOperation({ summary: 'Delete course' })
  @ApiResponse({ status: 200, description: 'Course deleted successfully' })
  @ApiResponse({ status: 400, description: 'Cannot delete course with active enrollments' })
  async deleteCourse(@Req() req: any, @Param('id') id: string) {
    await this.trainingService.deleteCourse(req.tenantId, id);
    return { message: 'Course deleted successfully' };
  }

  @Get('courses/:id/statistics')
  @Roles(Role.ADMIN, Role.TRAINER, Role.HR, Role.MANAGER)
  @ApiOperation({ summary: 'Get course statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getCourseStatistics(@Req() req: any, @Param('id') id: string) {
    return this.trainingService.getCourseStatistics(req.tenantId, id);
  }

  // ==================== ENROLLMENTS ====================

  @Post('enrollments')
  @Roles(Role.ADMIN, Role.TRAINER, Role.HR, Role.MANAGER)
  @ApiOperation({ summary: 'Enroll a learner in a course or program' })
  @ApiResponse({ status: 201, description: 'Enrollment created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'User already enrolled' })
  async createEnrollment(@Req() req: any, @Body() dto: CreateEnrollmentDto) {
    return this.trainingService.createEnrollment(req.tenantId, dto);
  }

  @Post('enrollments/bulk')
  @Roles(Role.ADMIN, Role.TRAINER, Role.HR, Role.MANAGER)
  @ApiOperation({ summary: 'Bulk enroll multiple learners' })
  @ApiResponse({ status: 201, description: 'Learners enrolled successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async bulkEnroll(@Req() req: any, @Body() dto: BulkEnrollmentDto) {
    return this.trainingService.bulkEnroll(req.tenantId, dto);
  }

  @Get('enrollments')
  @Roles(Role.ADMIN, Role.TRAINER, Role.HR, Role.MANAGER)
  @ApiOperation({ summary: 'Get all enrollments' })
  @ApiQuery({ name: 'learnerId', required: false })
  @ApiQuery({ name: 'courseId', required: false })
  @ApiQuery({ name: 'programId', required: false })
  @ApiQuery({ name: 'status', enum: EnrollmentStatus, required: false })
  @ApiResponse({ status: 200, description: 'Enrollments retrieved successfully' })
  async getEnrollments(
    @Req() req: any,
    @Query('learnerId') learnerId?: string,
    @Query('courseId') courseId?: string,
    @Query('programId') programId?: string,
    @Query('status') status?: EnrollmentStatus,
  ) {
    return this.trainingService.getEnrollments(req.tenantId, {
      learnerId,
      courseId,
      programId,
      status,
    });
  }

  @Get('enrollments/my')
  @ApiOperation({ summary: 'Get my enrollments (current user)' })
  @ApiResponse({ status: 200, description: 'My enrollments retrieved successfully' })
  async getMyEnrollments(@Req() req: any) {
    const tenantId = req.tenantId;
    const learnerId = req.user.userId;
    return this.trainingService.getMyEnrollments(tenantId, learnerId);
  }

  @Get('enrollments/:id')
  @ApiOperation({ summary: 'Get enrollment by ID' })
  @ApiResponse({ status: 200, description: 'Enrollment retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Enrollment not found' })
  async getEnrollmentById(@Req() req: any, @Param('id') id: string) {
    return this.trainingService.getEnrollmentById(req.tenantId, id);
  }

  @Put('enrollments/:id')
  @ApiOperation({ summary: 'Update enrollment progress/status' })
  @ApiResponse({ status: 200, description: 'Enrollment updated successfully' })
  @ApiResponse({ status: 404, description: 'Enrollment not found' })
  async updateEnrollment(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateEnrollmentDto,
  ) {
    return this.trainingService.updateEnrollment(req.tenantId, id, dto);
  }

  @Get('learners/:learnerId/progress')
  @Roles(Role.ADMIN, Role.TRAINER, Role.HR, Role.MANAGER)
  @ApiOperation({ summary: 'Get learner progress summary' })
  @ApiResponse({ status: 200, description: 'Learner progress retrieved successfully' })
  async getLearnerProgress(@Req() req: any, @Param('learnerId') learnerId: string) {
    return this.trainingService.getLearnerProgress(req.tenantId, learnerId);
  }

  @Get('learners/my/progress')
  @ApiOperation({ summary: 'Get my learning progress' })
  @ApiResponse({ status: 200, description: 'Progress retrieved successfully' })
  async getMyProgress(@Req() req: any) {
    const tenantId = req.tenantId;
    const learnerId = req.user.userId;
    return this.trainingService.getLearnerProgress(tenantId, learnerId);
  }

  // ==================== ANALYTICS ====================

  @Get('analytics')
  @Roles(Role.ADMIN, Role.TRAINER, Role.HR)
  @ApiOperation({ summary: 'Get training analytics dashboard' })
  @ApiResponse({ status: 200, description: 'Analytics retrieved successfully' })
  async getTrainingAnalytics(@Req() req: any) {
    return this.trainingService.getTrainingAnalytics(req.tenantId);
  }
}
