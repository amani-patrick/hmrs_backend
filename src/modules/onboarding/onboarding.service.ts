import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { OnboardingProcess, OnboardingStatus, OnboardingStage } from './entities/onboarding-process.entity';
import { OffboardingProcess, OffboardingStatus } from './entities/offboarding-process.entity';
import { CreateOnboardingDto } from './dto/create-onboarding.dto';
import { CreateOffboardingDto } from './dto/create-offboarding.dto';
import { UpdateChecklistItemDto } from './dto/update-checklist.dto';

@Injectable()
export class OnboardingService {
  constructor(
    @Inject('ONBOARDING_REPOSITORY')
    private readonly onboardingRepository: Repository<OnboardingProcess>,
    @Inject('OFFBOARDING_REPOSITORY')
    private readonly offboardingRepository: Repository<OffboardingProcess>,
  ) {}

  // ==================== ONBOARDING ====================

  async createOnboarding(tenantId: string, dto: CreateOnboardingDto): Promise<OnboardingProcess> {
    // Generate default checklist
    const defaultChecklist = this.generateDefaultOnboardingChecklist();

    // Prepare equipment list
    const equipmentAssigned = dto.equipmentAssigned?.map(item => ({
      ...item,
      assignedDate: new Date(),
      status: 'pending' as const,
    })) || [];

    // Prepare documents list
    const documentsRequired = dto.documentsRequired?.map(docName => ({
      documentName: docName,
      received: false,
    })) || this.getDefaultDocuments();

    const onboarding = this.onboardingRepository.create({
      ...dto,
      tenantId,
      status: OnboardingStatus.NOT_STARTED,
      currentStage: OnboardingStage.PRE_BOARDING,
      completionPercentage: 0,
      checklist: defaultChecklist,
      equipmentAssigned,
      documentsRequired,
    });

    return this.onboardingRepository.save(onboarding);
  }

  async getAllOnboardings(
    tenantId: string,
    filters?: { status?: OnboardingStatus; stage?: OnboardingStage },
  ): Promise<OnboardingProcess[]> {
    const where: any = { tenantId };
    if (filters?.status) where.status = filters.status;
    if (filters?.stage) where.currentStage = filters.stage;

    return this.onboardingRepository.find({
      where,
      order: { startDate: 'DESC' },
    });
  }

  async getOnboardingById(tenantId: string, id: string): Promise<OnboardingProcess> {
    const onboarding = await this.onboardingRepository.findOne({
      where: { id, tenantId },
    });

    if (!onboarding) {
      throw new NotFoundException(`Onboarding process with ID ${id} not found`);
    }

    return onboarding;
  }

  async updateChecklistItem(
    tenantId: string,
    id: string,
    dto: UpdateChecklistItemDto,
    userId: string,
  ): Promise<OnboardingProcess> {
    const onboarding = await this.getOnboardingById(tenantId, id);

    let itemFound = false;
    onboarding.checklist = onboarding.checklist.map(category => ({
      ...category,
      items: category.items.map(item => {
        if (item.id === dto.itemId) {
          itemFound = true;
          return {
            ...item,
            completed: dto.completed,
            completedBy: dto.completed ? userId : undefined,
            completedAt: dto.completed ? new Date() : undefined,
          };
        }
        return item;
      }),
    }));

    if (!itemFound) {
      throw new NotFoundException('Checklist item not found');
    }

    // Recalculate completion percentage
    onboarding.completionPercentage = this.calculateCompletionPercentage(onboarding);

    // Auto-update status
    if (onboarding.completionPercentage === 100) {
      onboarding.status = OnboardingStatus.COMPLETED;
      onboarding.currentStage = OnboardingStage.COMPLETED;
      onboarding.completedDate = new Date();
    } else if (onboarding.status === OnboardingStatus.NOT_STARTED) {
      onboarding.status = OnboardingStatus.IN_PROGRESS;
    }

    return this.onboardingRepository.save(onboarding);
  }

  async updateOnboardingStage(
    tenantId: string,
    id: string,
    stage: OnboardingStage,
  ): Promise<OnboardingProcess> {
    const onboarding = await this.getOnboardingById(tenantId, id);
    onboarding.currentStage = stage;
    return this.onboardingRepository.save(onboarding);
  }

  async markDocumentReceived(
    tenantId: string,
    id: string,
    documentName: string,
  ): Promise<OnboardingProcess> {
    const onboarding = await this.getOnboardingById(tenantId, id);

    onboarding.documentsRequired = onboarding.documentsRequired.map(doc => {
      if (doc.documentName === documentName) {
        return {
          ...doc,
          received: true,
          receivedDate: new Date(),
        };
      }
      return doc;
    });

    return this.onboardingRepository.save(onboarding);
  }

  async updateEquipmentStatus(
    tenantId: string,
    id: string,
    itemName: string,
    status: 'pending' | 'delivered' | 'returned',
  ): Promise<OnboardingProcess> {
    const onboarding = await this.getOnboardingById(tenantId, id);

    onboarding.equipmentAssigned = onboarding.equipmentAssigned.map(item => {
      if (item.itemName === itemName) {
        return { ...item, status };
      }
      return item;
    });

    return this.onboardingRepository.save(onboarding);
  }

  // ==================== OFFBOARDING ====================

  async createOffboarding(tenantId: string, initiatedBy: string, dto: CreateOffboardingDto): Promise<OffboardingProcess> {
    // Get employee info (would normally fetch from user service)
    const employeeName = 'Employee Name'; // Placeholder
    const position = 'Position'; // Placeholder
    const department = 'Department'; // Placeholder

    const defaultChecklist = this.generateDefaultOffboardingChecklist();
    const accessRevocations = this.getDefaultAccessRevocations();
    const equipmentToReturn = this.getDefaultEquipment();

    const offboarding = this.offboardingRepository.create({
      ...dto,
      tenantId,
      employeeName,
      position,
      department,
      initiatedBy,
      status: OffboardingStatus.INITIATED,
      completionPercentage: 0,
      checklist: defaultChecklist,
      accessRevocations,
      equipmentToReturn,
    });

    return this.offboardingRepository.save(offboarding);
  }

  async getAllOffboardings(
    tenantId: string,
    filters?: { status?: OffboardingStatus },
  ): Promise<OffboardingProcess[]> {
    const where: any = { tenantId };
    if (filters?.status) where.status = filters.status;

    return this.offboardingRepository.find({
      where,
      order: { lastWorkingDay: 'DESC' },
    });
  }

  async getOffboardingById(tenantId: string, id: string): Promise<OffboardingProcess> {
    const offboarding = await this.offboardingRepository.findOne({
      where: { id, tenantId },
    });

    if (!offboarding) {
      throw new NotFoundException(`Offboarding process with ID ${id} not found`);
    }

    return offboarding;
  }

  async updateOffboardingChecklistItem(
    tenantId: string,
    id: string,
    dto: UpdateChecklistItemDto,
    userId: string,
  ): Promise<OffboardingProcess> {
    const offboarding = await this.getOffboardingById(tenantId, id);

    let itemFound = false;
    offboarding.checklist = offboarding.checklist.map(category => ({
      ...category,
      items: category.items.map(item => {
        if (item.id === dto.itemId) {
          itemFound = true;
          return {
            ...item,
            completed: dto.completed,
            completedBy: dto.completed ? userId : undefined,
            completedAt: dto.completed ? new Date() : undefined,
          };
        }
        return item;
      }),
    }));

    if (!itemFound) {
      throw new NotFoundException('Checklist item not found');
    }

    offboarding.completionPercentage = this.calculateOffboardingCompletion(offboarding);

    if (offboarding.completionPercentage === 100) {
      offboarding.status = OffboardingStatus.COMPLETED;
      offboarding.completedDate = new Date();
    } else if (offboarding.status === OffboardingStatus.INITIATED) {
      offboarding.status = OffboardingStatus.IN_PROGRESS;
    }

    return this.offboardingRepository.save(offboarding);
  }

  async completeExitInterview(
    tenantId: string,
    id: string,
    notes: string,
    rating: number,
    wouldRehire: boolean,
  ): Promise<OffboardingProcess> {
    const offboarding = await this.getOffboardingById(tenantId, id);

    offboarding.exitInterviewCompleted = true;
    offboarding.exitInterviewDate = new Date();
    offboarding.exitInterviewNotes = notes;
    offboarding.exitInterviewRating = rating;
    offboarding.wouldRehire = wouldRehire;

    return this.offboardingRepository.save(offboarding);
  }

  async revokeAccess(
    tenantId: string,
    id: string,
    systemName: string,
    revokedBy: string,
  ): Promise<OffboardingProcess> {
    const offboarding = await this.getOffboardingById(tenantId, id);

    offboarding.accessRevocations = offboarding.accessRevocations.map(access => {
      if (access.systemName === systemName) {
        return {
          ...access,
          revoked: true,
          revokedDate: new Date(),
          revokedBy,
        };
      }
      return access;
    });

    return this.offboardingRepository.save(offboarding);
  }

  async markEquipmentReturned(
    tenantId: string,
    id: string,
    itemName: string,
    condition: string,
  ): Promise<OffboardingProcess> {
    const offboarding = await this.getOffboardingById(tenantId, id);

    offboarding.equipmentToReturn = offboarding.equipmentToReturn.map(item => {
      if (item.itemName === itemName) {
        return {
          ...item,
          returned: true,
          returnedDate: new Date(),
          condition,
        };
      }
      return item;
    });

    return this.offboardingRepository.save(offboarding);
  }

  // ==================== HELPER METHODS ====================

  private generateDefaultOnboardingChecklist() {
    return [
      {
        category: 'Pre-Boarding',
        items: [
          { id: 'pb-1', task: 'Send welcome email', completed: false },
          { id: 'pb-2', task: 'Prepare workspace', completed: false },
          { id: 'pb-3', task: 'Order equipment', completed: false },
          { id: 'pb-4', task: 'Create accounts', completed: false },
        ],
      },
      {
        category: 'Day One',
        items: [
          { id: 'd1-1', task: 'Office tour', completed: false },
          { id: 'd1-2', task: 'Team introduction', completed: false },
          { id: 'd1-3', task: 'HR orientation', completed: false },
          { id: 'd1-4', task: 'System access setup', completed: false },
        ],
      },
      {
        category: 'First Week',
        items: [
          { id: 'fw-1', task: 'Training schedule', completed: false },
          { id: 'fw-2', task: 'Policy review', completed: false },
          { id: 'fw-3', task: 'Benefits enrollment', completed: false },
        ],
      },
    ];
  }

  private generateDefaultOffboardingChecklist() {
    return [
      {
        category: 'Administrative',
        items: [
          { id: 'admin-1', task: 'Final paycheck processed', completed: false },
          { id: 'admin-2', task: 'Benefits termination', completed: false },
          { id: 'admin-3', task: 'Exit interview scheduled', completed: false },
        ],
      },
      {
        category: 'IT & Security',
        items: [
          { id: 'it-1', task: 'Revoke system access', completed: false },
          { id: 'it-2', task: 'Collect equipment', completed: false },
          { id: 'it-3', task: 'Email forwarding setup', completed: false },
        ],
      },
    ];
  }

  private getDefaultDocuments(): any[] {
    return [
      { documentName: 'Employment Contract', received: false },
      { documentName: 'Tax Forms', received: false },
      { documentName: 'Bank Details', received: false },
      { documentName: 'Emergency Contact', received: false },
    ];
  }

  private getDefaultAccessRevocations(): any[] {
    return [
      { systemName: 'Email', revoked: false },
      { systemName: 'HRMS', revoked: false },
      { systemName: 'VPN', revoked: false },
      { systemName: 'Building Access', revoked: false },
    ];
  }

  private getDefaultEquipment(): any[] {
    return [
      { itemName: 'Laptop', returned: false },
      { itemName: 'Monitor', returned: false },
      { itemName: 'Access Card', returned: false },
    ];
  }

  private calculateCompletionPercentage(onboarding: OnboardingProcess): number {
    const totalItems = onboarding.checklist.reduce((sum, cat) => sum + cat.items.length, 0);
    const completedItems = onboarding.checklist.reduce(
      (sum, cat) => sum + cat.items.filter(item => item.completed).length,
      0,
    );

    return totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  }

  private calculateOffboardingCompletion(offboarding: OffboardingProcess): number {
    const totalItems = offboarding.checklist.reduce((sum, cat) => sum + cat.items.length, 0);
    const completedItems = offboarding.checklist.reduce(
      (sum, cat) => sum + cat.items.filter(item => item.completed).length,
      0,
    );

    return totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  }
}
