import {
  describe,
  it,
  expect,
  jest,
  beforeEach,
  afterEach,
} from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { PermissionService } from '../services/permission.service';
import { Permission } from '../entities/permission.entity';
import { CreatePermissionDto } from '../dto/create-permission.dto';
import { UpdatePermissionDto } from '../dto/update-permission.dto';

describe('PermissionService', () => {
  let service: PermissionService;
  let mockPermissionModel: any;

  const mockPermission = {
    _id: '507f1f77bcf86cd799439011',
    name: 'user:read',
    description: '查看用户',
    module: 'user',
    status: 'active',
    toObject: jest.fn().mockReturnThis(),
    save: jest.fn().mockResolvedValue({
      _id: '507f1f77bcf86cd799439011',
      name: 'user:create',
      description: '创建用户',
    }),
  };

  let mockSave: any;
  beforeEach(async () => {
    mockSave = jest.fn().mockResolvedValue(mockPermission);

    mockPermissionModel = jest.fn().mockImplementation(() => ({
      save: mockSave,
    }));

    mockPermissionModel.findOne = jest.fn();
    mockPermissionModel.find = jest.fn();
    mockPermissionModel.findById = jest.fn();
    mockPermissionModel.findByIdAndUpdate = jest.fn();
    mockPermissionModel.findByIdAndDelete = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionService,
        {
          provide: getModelToken(Permission.name),
          useValue: mockPermissionModel,
        },
      ],
    }).compile();

    service = module.get<PermissionService>(PermissionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a permission successfully', async () => {
      const createPermissionDto: CreatePermissionDto = {
        name: 'user:create',
        description: '创建用户',
        module: 'user',
      };

      mockPermissionModel.findOne.mockResolvedValue(null);

      await service.create(createPermissionDto);

      expect(mockPermissionModel.findOne).toHaveBeenCalledWith({
        name: 'user:create',
      });
      expect(mockPermissionModel).toHaveBeenCalledWith(createPermissionDto);
      expect(mockSave).toHaveBeenCalled();
    });

    it('should throw ConflictException if permission name already exists', async () => {
      const createPermissionDto: CreatePermissionDto = {
        name: 'user:read',
        description: '查看用户',
        module: 'user',
      };

      mockPermissionModel.findOne.mockResolvedValue(mockPermission);

      await expect(service.create(createPermissionDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all permissions', async () => {
      const mockPermissions = [mockPermission];
      mockPermissionModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockPermissions),
      });

      const result = await service.findAll();

      expect(result).toEqual(mockPermissions);
      expect(mockPermissionModel.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a permission by id', async () => {
      mockPermissionModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockPermission),
      });

      const result = await service.findOne('507f1f77bcf86cd799439011');

      expect(result).toEqual(mockPermission);
      expect(mockPermissionModel.findById).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
    });

    it('should throw NotFoundException if permission not found', async () => {
      mockPermissionModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findOne('507f1f77bcf86cd799439011')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a permission successfully', async () => {
      const updatePermissionDto: UpdatePermissionDto = {
        description: '更新后的描述',
      };

      const updatedPermission = { ...mockPermission, ...updatePermissionDto };
      mockPermissionModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedPermission),
      });
      mockPermissionModel.findOne.mockResolvedValue(null);

      const result = await service.update(
        '507f1f77bcf86cd799439011',
        updatePermissionDto,
      );

      expect(result).toEqual(updatedPermission);
      expect(mockPermissionModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        updatePermissionDto,
        { new: true },
      );
    });

    it('should throw NotFoundException if permission not found', async () => {
      const updatePermissionDto: UpdatePermissionDto = {
        description: '更新后的描述',
      };

      mockPermissionModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });
      mockPermissionModel.findOne.mockResolvedValue(null);

      await expect(
        service.update('507f1f77bcf86cd799439011', updatePermissionDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a permission successfully', async () => {
      mockPermissionModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockPermission),
      });

      await service.remove('507f1f77bcf86cd799439011');

      expect(mockPermissionModel.findByIdAndDelete).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
    });

    it('should throw NotFoundException if permission not found', async () => {
      mockPermissionModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.remove('507f1f77bcf86cd799439011')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
