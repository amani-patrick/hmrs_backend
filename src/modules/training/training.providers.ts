import { DataSource } from 'typeorm';
import { TrainingProgram } from './entities/training-program.entity';
import { Course } from './entities/course.entity';
import { CourseModule } from './entities/course-module.entity';
import { Enrollment } from './entities/enrollment.entity';
import { Assessment } from './entities/assessment.entity';
import { AssessmentResult } from './entities/assessment-result.entity';
import { Certificate } from './entities/certificate.entity';
import { LearningPath } from './entities/learning-path.entity';
import { Skill } from './entities/skill.entity';
import { UserSkill } from './entities/user-skill.entity';

export const trainingProviders = [
  {
    provide: 'TRAINING_PROGRAM_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(TrainingProgram),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'COURSE_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Course),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'COURSE_MODULE_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(CourseModule),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'ENROLLMENT_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Enrollment),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'ASSESSMENT_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Assessment),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'ASSESSMENT_RESULT_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(AssessmentResult),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'CERTIFICATE_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Certificate),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'LEARNING_PATH_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(LearningPath),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'SKILL_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Skill),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'USER_SKILL_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(UserSkill),
    inject: ['DATA_SOURCE'],
  },
];
