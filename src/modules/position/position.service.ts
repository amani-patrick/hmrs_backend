import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Position } from './entities/position.entity';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';
import { PositionResponseDto } from './dto/position-response.dto';

@Injectable()
export class PositionService {
  constructor(
    @InjectRepository(Position)
    private positionRepository: Repository<Position>,
  ) {}

  async create(createPositionDto: CreatePositionDto): Promise<PositionResponseDto> {
    const position = this.positionRepository.create({
      ...createPositionDto,
      isActive: true,
    });
    const savedPosition = await this.positionRepository.save(position);
    return this.mapToResponseDto(savedPosition);
  }

  async findAll(): Promise<PositionResponseDto[]> {
    const positions = await this.positionRepository.find({
      relations: ['department'],
    });
    return positions.map(position => this.mapToResponseDto(position));
  }

  async findOne(id: string): Promise<PositionResponseDto> {
    const position = await this.positionRepository.findOne({
      where: { id },
      relations: ['department'],
    });
    if (!position) {
      throw new NotFoundException(`Position with ID ${id} not found`);
    }
    return this.mapToResponseDto(position);
  }

  async update(
    id: string,
    updatePositionDto: UpdatePositionDto,
  ): Promise<PositionResponseDto> {
    const position = await this.positionRepository.preload({
      id,
      ...updatePositionDto,
    });
    
    if (!position) {
      throw new NotFoundException(`Position with ID ${id} not found`);
    }

    const updatedPosition = await this.positionRepository.save(position);
    return this.mapToResponseDto(updatedPosition);
  }

  async remove(id: string): Promise<void> {
    const result = await this.positionRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Position with ID ${id} not found`);
    }
  }

  private mapToResponseDto(position: Position): PositionResponseDto {
    const responseDto = new PositionResponseDto();
    Object.assign(responseDto, position);
    return responseDto;
  }
}
