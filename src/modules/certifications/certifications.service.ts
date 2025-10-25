import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Certification } from './entities/certification.entity';
import { CreateCertificationDto } from './dto/create-certification.dto';
import { UpdateCertificationDto } from './dto/update-certification.dto';

@Injectable()
export class CertificationsService {
  constructor(
    @InjectRepository(Certification)
    private certificationRepository: Repository<Certification>,
  ) {}

  async findAll(tenantId: string, status?: string): Promise<Certification[]> {
    const queryBuilder = this.certificationRepository
      .createQueryBuilder('certification')
      .where('certification.tenantId = :tenantId', { tenantId });
    
    // Filter by status if provided
    if (status === 'expiring') {
      queryBuilder.andWhere('certification.expiring > 0');
    } else if (status === 'expired') {
      queryBuilder.andWhere('certification.expired > 0');
    }
    
    return queryBuilder.getMany();
  }

  async findOne(tenantId: string, id: string): Promise<Certification> {
    const certification = await this.certificationRepository.findOne({
      where: { id, tenantId },
    });
    
    if (!certification) {
      throw new NotFoundException(`Certification with ID ${id} not found`);
    }
    
    return certification;
  }

  async create(tenantId: string, createDto: CreateCertificationDto): Promise<Certification> {
    const certification = this.certificationRepository.create({
      ...createDto,
      tenantId,
    });
    
    return this.certificationRepository.save(certification);
  }

  async update(tenantId: string, id: string, updateDto: UpdateCertificationDto): Promise<Certification> {
    const certification = await this.certificationRepository.preload({
      id,
      ...updateDto,
    });
    
    if (!certification || certification.tenantId !== tenantId) {
      throw new NotFoundException(`Certification with ID ${id} not found`);
    }
    
    return this.certificationRepository.save(certification);
  }

  async delete(tenantId: string, id: string): Promise<{ message: string }> {
    const result = await this.certificationRepository.delete({ id, tenantId });
    
    if (result.affected === 0) {
      throw new NotFoundException(`Certification with ID ${id} not found`);
    }
    
    return { message: 'Certification deleted successfully' };
  }
}
