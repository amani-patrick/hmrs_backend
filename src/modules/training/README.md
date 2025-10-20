# Training Module Documentation

## Overview

The Training Module is a comprehensive Learning Management System (LMS) that supports the entire training lifecycle including programs, courses, enrollments, assessments, certifications, and skill tracking.

## Features

### ✅ **Training Programs**
- Create and manage training programs
- Support for multiple program types:
  - Onboarding
  - Compliance
  - Technical
  - Leadership
  - Soft Skills
  - Certification
  - Custom
- Program status management (Draft, Active, Archived, Completed)
- Track objectives, target audience, prerequisites
- Mandatory and recurring programs
- Certificate templates
- Statistics and analytics

### ✅ **Courses**
- Create and manage courses
- Course levels: Beginner, Intermediate, Advanced, Expert
- Delivery modes: Online, Offline, Hybrid, Self-paced
- Learning objectives and prerequisites
- Course modules and content
- Ratings and reviews
- Featured courses
- Course statistics

### ✅ **Enrollments**
- Single and bulk enrollment
- Track enrollment status: Enrolled, In Progress, Completed, Failed, Dropped, Expired
- Progress tracking (0-100%)
- Due dates and mandatory assignments
- Module-level progress tracking
- Score tracking and attempts
- Time spent analytics

### ✅ **Assessments**
- Multiple assessment types: Quiz, Exam, Assignment, Practical, Survey
- Question types:
  - Multiple Choice
  - True/False
  - Short Answer
  - Essay
  - Fill in the Blank
  - Matching
- Randomized questions
- Passing scores and max attempts
- Timed assessments
- Show results and correct answers options

### ✅ **Certificates**
- Issue certificates on completion
- Certificate numbering system
- Expiry dates and renewal tracking
- Verification codes
- Certificate status: Issued, Revoked, Expired
- Track verification count

### ✅ **Learning Paths**
- Create structured learning journeys
- Multi-step paths with courses, programs, and assessments
- Mandatory and optional steps
- Duration estimation
- Target roles and skills

### ✅ **Skills Management**
- Skill categories:
  - Technical
  - Soft Skills
  - Leadership
  - Communication
  - Domain
  - Tools
  - Languages
- Proficiency levels (1-5): Novice, Beginner, Intermediate, Advanced, Expert
- Skill assessments
- Endorsements
- Related skills tracking

### ✅ **Analytics & Reporting**
- Training dashboard analytics
- Program and course statistics
- Learner progress tracking
- Completion rates
- Top courses by enrollment
- Recent activity feed
- Average scores and ratings

## API Endpoints

### **Programs**

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| POST | `/training/programs` | Create program | Admin, Trainer, HR |
| GET | `/training/programs` | Get all programs | All |
| GET | `/training/programs/:id` | Get program by ID | All |
| PUT | `/training/programs/:id` | Update program | Admin, Trainer, HR |
| DELETE | `/training/programs/:id` | Delete program | Admin, Trainer |
| POST | `/training/programs/:id/archive` | Archive program | Admin, Trainer, HR |
| GET | `/training/programs/:id/statistics` | Get statistics | Admin, Trainer, HR, Manager |

### **Courses**

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| POST | `/training/courses` | Create course | Admin, Trainer, HR |
| GET | `/training/courses` | Get all courses | All |
| GET | `/training/courses/:id` | Get course by ID | All |
| PUT | `/training/courses/:id` | Update course | Admin, Trainer, HR |
| DELETE | `/training/courses/:id` | Delete course | Admin, Trainer |
| GET | `/training/courses/:id/statistics` | Get statistics | Admin, Trainer, HR, Manager |

### **Enrollments**

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| POST | `/training/enrollments` | Enroll learner | Admin, Trainer, HR, Manager |
| POST | `/training/enrollments/bulk` | Bulk enroll | Admin, Trainer, HR, Manager |
| GET | `/training/enrollments` | Get all enrollments | Admin, Trainer, HR, Manager |
| GET | `/training/enrollments/my` | Get my enrollments | All (self) |
| GET | `/training/enrollments/:id` | Get enrollment by ID | All |
| PUT | `/training/enrollments/:id` | Update enrollment | All |
| GET | `/training/learners/:learnerId/progress` | Get learner progress | Admin, Trainer, HR, Manager |
| GET | `/training/learners/my/progress` | Get my progress | All (self) |

### **Analytics**

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/training/analytics` | Get training dashboard | Admin, Trainer, HR |

## Database Entities

### **TrainingProgram**
- Program metadata and settings
- Status and type tracking
- Enrollment statistics
- Certificate template association

### **Course**
- Course details and content
- Module relationships
- Enrollment and completion tracking
- Ratings and reviews

### **CourseModule**
- Module content and resources
- Order and duration
- Module types (Video, Document, Quiz, etc.)

### **Enrollment**
- Learner-course/program relationship
- Progress and status tracking
- Scores and attempts
- Module-level progress

### **Assessment**
- Assessment configuration
- Questions and correct answers
- Scoring rules
- Time limits

### **AssessmentResult**
- Learner attempts and submissions
- Scores and grading
- Feedback

### **Certificate**
- Certificate issuance and tracking
- Verification system
- Expiry management

### **LearningPath**
- Structured learning journeys
- Step ordering and requirements

### **Skill**
- Skill definitions and categories

### **UserSkill**
- User-skill proficiency mapping
- Assessment scores
- Endorsements

## Usage Examples

### **Create a Training Program**
```typescript
POST /api/v1/training/programs
{
  "title": "Employee Onboarding 2025",
  "description": "Comprehensive onboarding for new employees",
  "type": "onboarding",
  "status": "active",
  "objectives": [
    "Understand company culture",
    "Learn core systems",
    "Complete compliance training"
  ],
  "duration": 40,
  "isMandatory": true,
  "passingScore": 80
}
```

### **Create a Course**
```typescript
POST /api/v1/training/courses
{
  "programId": "program-uuid",
  "title": "Company Policies Overview",
  "description": "Learn about our policies and procedures",
  "level": "beginner",
  "deliveryMode": "online",
  "duration": 2,
  "learningObjectives": [
    "Understand key policies",
    "Apply procedures correctly"
  ],
  "hasCertificate": true
}
```

### **Enroll Learners**
```typescript
POST /api/v1/training/enrollments
{
  "learnerId": "user-uuid",
  "courseId": "course-uuid",
  "dueDate": "2025-03-01",
  "isMandatory": true
}
```

### **Bulk Enroll**
```typescript
POST /api/v1/training/enrollments/bulk
{
  "learnerIds": ["user-1", "user-2", "user-3"],
  "programId": "program-uuid",
  "dueDate": "2025-03-31",
  "isMandatory": true
}
```

### **Update Progress**
```typescript
PUT /api/v1/training/enrollments/:id
{
  "status": "in_progress",
  "progress": 50,
  "timeSpent": 120
}
```

### **Get My Enrollments**
```typescript
GET /api/v1/training/enrollments/my
```

### **Get Training Analytics**
```typescript
GET /api/v1/training/analytics
```

Response:
```json
{
  "totalPrograms": 15,
  "totalCourses": 45,
  "totalEnrollments": 320,
  "activeEnrollments": 180,
  "completionRate": 65.5,
  "certificatesIssued": 210,
  "topCourses": [...],
  "recentActivity": [...]
}
```

## Business Logic

### **Enrollment Validation**
- Prevents duplicate enrollments
- Validates course/program exists
- Updates enrollment counts automatically

### **Completion Tracking**
- Auto-updates completion counts
- Calculates completion rates
- Tracks timestamps (enrolled, started, completed)

### **Deletion Protection**
- Programs/courses with active enrollments cannot be deleted
- Must be archived instead
- Maintains data integrity

### **Progress Calculation**
- Track module-level progress
- Calculate overall progress percentage
- Track time spent per module

### **Statistics**
- Real-time enrollment counts
- Completion rates
- Average scores
- Average ratings
- Learner progress summaries

## Query Filters

### **Programs**
- Filter by: status, type, search, isActive
- Full-text search on title and description

### **Courses**
- Filter by: status, level, programId, search, isActive, isFeatured
- Full-text search on title and description

### **Enrollments**
- Filter by: learnerId, courseId, programId, status
- Get user-specific enrollments

## Integration Points

### **With Users Module**
- Learner relationships
- Instructor assignments
- User skill tracking

### **With Documents Module**
- Course materials
- Resources and attachments
- Certificate storage

### **With Calendar Module**
- Live session scheduling
- Due date reminders
- Training calendar

### **With Notifications Module** (Future)
- Enrollment notifications
- Completion reminders
- Certificate issuance alerts

## Best Practices

1. **Always set passingScore** for courses/programs that require completion
2. **Use bulk enrollment** for efficiency when enrolling multiple learners
3. **Archive instead of delete** to maintain historical data
4. **Track progress regularly** for better analytics
5. **Issue certificates** on successful completion
6. **Use learning paths** for structured training journeys
7. **Tag courses appropriately** for better discoverability
8. **Set due dates** for mandatory training

## Future Enhancements

- [ ] Content versioning
- [ ] Discussion forums
- [ ] Peer reviews
- [ ] Live session integration
- [ ] Advanced analytics (AI predictions)
- [ ] Gamification (badges, points)
- [ ] Social learning features
- [ ] Mobile app support
- [ ] SCORM compliance
- [ ] Integration with external LMS platforms

## Support

For support or questions about the Training Module:
1. Check the API documentation at `/api/docs`
2. Review this README
3. Contact the development team
