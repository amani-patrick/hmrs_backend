import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PositionService } from './position.service';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';
import { PositionResponseDto } from './dto/position-response.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/roles.enum';

@ApiTags('positions')
@Controller('positions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.HR)
export class PositionController {
  constructor(private readonly positionService: PositionService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new position' })
  @ApiResponse({ status: 201, description: 'The position has been successfully created.', type: PositionResponseDto })
  create(@Body() createPositionDto: CreatePositionDto): Promise<PositionResponseDto> {
    return this.positionService.create(createPositionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all positions' })
  @ApiResponse({ status: 200, description: 'Return all positions.', type: [PositionResponseDto] })
  findAll(): Promise<PositionResponseDto[]> {
    return this.positionService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a position by ID' })
  @ApiResponse({ status: 200, description: 'Return the position.', type: PositionResponseDto })
  @ApiResponse({ status: 404, description: 'Position not found.' })
  findOne(@Param('id') id: string): Promise<PositionResponseDto> {
    return this.positionService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a position' })
  @ApiResponse({ status: 200, description: 'The position has been successfully updated.', type: PositionResponseDto })
  @ApiResponse({ status: 404, description: 'Position not found.' })
  update(
    @Param('id') id: string,
    @Body() updatePositionDto: UpdatePositionDto,
  ): Promise<PositionResponseDto> {
    return this.positionService.update(id, updatePositionDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a position' })
  @ApiResponse({ status: 200, description: 'The position has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Position not found.' })
  remove(@Param('id') id: string): Promise<void> {
    return this.positionService.remove(id);
  }
}
