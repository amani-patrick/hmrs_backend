import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Document } from './entities/document.entity';
import { Policy } from './entities/policy.entity';
import { Contract } from './entities/contract.entity';
import { PolicyAcknowledgment } from './entities/policy-acknowledgment.entity';
import { CreateDocumentDto } from './dto/create-document.dto';
import { CreatePolicyDto } from './dto/create-policy.dto';
import { CreateContractDto } from './dto/create-contract.dto';
import { AcknowledgePolicyDto } from './dto/acknowledge-policy.dto';
import { Role } from '../../common/enums/roles.enum';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
    @InjectRepository(Policy)
    private policyRepository: Repository<Policy>,
    @InjectRepository(Contract)
    private contractRepository: Repository<Contract>,
    @InjectRepository(PolicyAcknowledgment)
    private acknowledgmentRepository: Repository<PolicyAcknowledgment>,
  ) {}

  // Document Methods
  async createDocument(createDocumentDto: CreateDocumentDto, userId: string): Promise<Document> {
    const document = this.documentRepository.create({
      ...createDocumentDto,
      createdById: userId,
    });
    return this.documentRepository.save(document);
  }

  async findDocumentById(id: string): Promise<Document> {
    const document = await this.documentRepository.findOne({ where: { id } });
    if (!document) {
      throw new NotFoundException('Document not found');
    }
    return document;
  }

  async updateDocumentViews(id: string): Promise<void> {
    await this.documentRepository.increment({ id }, 'views', 1);
  }

  async updateDocumentDownloads(id: string): Promise<void> {
    await this.documentRepository.increment({ id }, 'downloads', 1);
  }

  async getDocumentLibraryStats() {
    const [totalDocuments, publishedCount, expiringSoon, totalTemplates] = await Promise.all([
      this.documentRepository.count(),
      this.documentRepository.count({ where: { status: 'Published' } }),
      this.documentRepository.count({
        where: {
          expiresOn: Between(
            new Date(),
            new Date(new Date().setDate(new Date().getDate() + 30)),
          ),
        },
      }),
      this.documentRepository.count({ where: { isTemplate: true } }),
    ]);

    return {
      totalDocuments,
      publishedCount,
      expiringSoon,
      totalTemplates,
    };
  }

  // Policy Methods
  async createPolicy(createPolicyDto: CreatePolicyDto, userId: string): Promise<Policy> {
    const policy = this.policyRepository.create({
      ...createPolicyDto,
      createdById: userId,
    });
    return this.policyRepository.save(policy);
  }

  async getPolicyStats() {
    const [totalPolicies, activePolicies, pendingReview] = await Promise.all([
      this.policyRepository.count(),
      this.policyRepository.count({ where: { status: 'Active' } }),
      this.policyRepository.count({
        where: {
          nextReviewDate: LessThanOrEqual(new Date()),
        },
      }),
    ]);

    // Calculate acknowledgment rate
    const acknowledged = await this.acknowledgmentRepository
      .createQueryBuilder('a')
      .select('COUNT(DISTINCT a.userId)', 'count')
      .where('a.status = :status', { status: 'Acknowledged' })
      .getRawOne();

    const totalUsers = 100; // This should be replaced with actual user count
    const acknowledgmentRate = Math.round((parseInt(acknowledged?.count || '0') / totalUsers) * 100);

    return {
      totalPolicies,
      activePolicies,
      pendingReview,
      acknowledgmentRate,
    };
  }

  async acknowledgePolicy(
    policyId: string,
    userId: string,
    acknowledgePolicyDto: AcknowledgePolicyDto,
  ): Promise<PolicyAcknowledgment> {
    const policy = await this.policyRepository.findOne({ where: { id: policyId } });
    if (!policy) {
      throw new NotFoundException('Policy not found');
    }

    const existingAcknowledgment = await this.acknowledgmentRepository.findOne({
      where: { policyId, userId },
    });

    if (existingAcknowledgment) {
      throw new BadRequestException('Policy already acknowledged');
    }

    const acknowledgment = this.acknowledgmentRepository.create({
      policyId,
      userId,
      acknowledgedAt: new Date(),
      comments: acknowledgePolicyDto.comments,
      status: 'Acknowledged',
      metadata: {
        ipAddress: acknowledgePolicyDto.ipAddress,
        userAgent: acknowledgePolicyDto.userAgent,
      },
    });

    return this.acknowledgmentRepository.save(acknowledgment);
  }

  // Contract Methods
  async createContract(createContractDto: any, userId: string): Promise<Contract> {
    const contract = this.contractRepository.create(createContractDto);
    return await this.contractRepository.save(contract) as any as Contract;
  }

  async getContractStats() {
    const [totalContracts, activeContracts, expiringSoon, totalValue] = await Promise.all([
      this.contractRepository.count(),
      this.contractRepository.count({ where: { status: 'Active' } }),
      this.contractRepository.count({
        where: {
          endDate: Between(
            new Date(),
            new Date(new Date().setMonth(new Date().getMonth() + 1)),
          ),
          status: 'Active',
        },
      }),
      this.contractRepository
        .createQueryBuilder('contract')
        .select('SUM(contract.salary)', 'total')
        .where('contract.status = :status', { status: 'Active' })
        .getRawOne(),
    ]);

    return {
      totalContracts,
      activeContracts,
      expiringSoon,
      totalContractValue: parseFloat(totalValue?.total || '0'),
    };
  }

  // Template Methods
  async getTemplates(category?: string) {
    const where: any = { isTemplate: true };
    if (category) {
      where.templateCategory = category;
    }
    return this.documentRepository.find({ where });
  }

  async createFromTemplate(templateId: string, userId: string, updates: Partial<Document>) {
    const template = await this.documentRepository.findOne({ 
      where: { id: templateId, isTemplate: true } 
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    const { id, ...templateData } = template;
    const newDocument = this.documentRepository.create({
      ...templateData,
      ...updates,
      isTemplate: false,
      createdById: userId,
    });

    return this.documentRepository.save(newDocument);
  }
}
