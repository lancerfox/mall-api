import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PermissionService } from '../services/permission.service';
import { Permission } from '../entities/permission.entity';
import { Repository } from 'typeorm';
import { BusinessException } from '../../../common/exceptions/business.exception';
import { ERROR_CODES } from '../../../common/constants/error-codes';
import { CreatePermissionDto } from '../dto/create-permission.dto';
import { UpdatePermissionDto } from '../dto/update-permission.dto';
import { PermissionType } from '../../../common/decorators/roles.decorator';

describe('PermissionService', () => {
  let service: PermissionService;
  let repository: Repository<Permission>;

  // Mock data
  const mockPermission = {
    id: '1',
    name: 'user:create',
    description: '创建用户',
    type: PermissionType.API,
    module: 'user',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Permission;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionService,
        {
          provide: getRepositoryToken(Permission),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            findOneBy: jest.fn(),
            findBy: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            preload: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PermissionService>(PermissionService);
    repository = module.get<Repository<Permission>>(
      getRepositoryToken(Permission),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a permission successfully', async () => {
      const createDto: CreatePermissionDto = {
        name: 'user:create',
        description: '创建用户',
        type: PermissionType.API,
        module: 'user',
      };

      (repository.findOneBy as jest.Mock).mockResolvedValue(null);
      (repository.create as jest.Mock).mockReturnValue({
        ...mockPermission,
        ...createDto,
      });
      (repository.save as jest.Mock).mockResolvedValue({
        ...mockPermission,
        ...createDto,
      });

      const result = await service.create(createDto);

      expect(repository.findOneBy).toHaveBeenCalledWith({
        name: createDto.name,
      });
      expect(repository.create).toHaveBeenCalledWith(createDto);
      expect(repository.save).toHaveBeenCalledWith({
        ...mockPermission,
        ...createDto,
      });
      expect(result).toEqual({ ...mockPermission, ...createDto });
    });

    it('should throw PERMISSION_ALREADY_EXISTS error if permission name already exists', async () => {
      const createDto: CreatePermissionDto = {
        name: 'user:create',
        description: '创建用户',
        type: PermissionType.API,
        module: 'user',
      };

      (repository.findOneBy as jest.Mock).mockResolvedValue(mockPermission);

      await expect(service.create(createDto)).rejects.toThrow(
        new BusinessException(ERROR_CODES.PERMISSION_ALREADY_EXISTS),
      );
    });
  });

  describe('findAll', () => {
    it('should return all permissions', async () => {
      const mockPermissions = [mockPermission];
      (repository.find as jest.Mock).mockResolvedValue(mockPermissions);

      const result = await service.findAll();

      expect(repository.find).toHaveBeenCalled();
      expect(result).toEqual(mockPermissions);
    });
  });

  describe('findOne', () => {
    it('should return a permission by id', async () => {
      (repository.findOneBy as jest.Mock).mockResolvedValue(mockPermission);

      const result = await service.findOne('1');

      expect(repository.findOneBy).toHaveBeenCalledWith({ id: '1' });
      expect(result).toEqual(mockPermission);
    });

    it('should throw PERMISSION_NOT_FOUND error if permission does not exist', async () => {
      (repository.findOneBy as jest.Mock).mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(
        new BusinessException(ERROR_CODES.PERMISSION_NOT_FOUND),
      );
    });
  });

  describe('findById', () => {
    it('should return a permission by id', async () => {
      (repository.findOneBy as jest.Mock).mockResolvedValue(mockPermission);

      const result = await service.findById('1');

      expect(repository.findOneBy).toHaveBeenCalledWith({ id: '1' });
      expect(result).toEqual(mockPermission);
    });
  });

  describe('findByName', () => {
    it('should return a permission by name', async () => {
      (repository.findOneBy as jest.Mock).mockResolvedValue(mockPermission);

      const result = await service.findByName('user:create');

      expect(repository.findOneBy).toHaveBeenCalledWith({
        name: 'user:create',
      });
      expect(result).toEqual(mockPermission);
    });

    it('should return null if permission with name does not exist', async () => {
      (repository.findOneBy as jest.Mock).mockResolvedValue(null);

      const result = await service.findByName('nonexistent');

      expect(repository.findOneBy).toHaveBeenCalledWith({
        name: 'nonexistent',
      });
      expect(result).toBeNull();
    });
  });

  describe('findByNames', () => {
    it('should return permissions by names', async () => {
      const mockPermissions = [mockPermission];
      (repository.findBy as jest.Mock).mockResolvedValue(mockPermissions);

      const result = await service.findByNames(['user:create']);

      expect(repository.findBy).toHaveBeenCalledWith({
        name: expect.anything(),
      });
      expect(result).toEqual(mockPermissions);
    });
  });

  describe('findByIds', () => {
    it('should return permissions by ids', async () => {
      const mockPermissions = [mockPermission];
      (repository.findBy as jest.Mock).mockResolvedValue(mockPermissions);

      const result = await service.findByIds(['1']);

      expect(repository.findBy).toHaveBeenCalledWith({ id: expect.anything() });
      expect(result).toEqual(mockPermissions);
    });
  });

  describe('update', () => {
    it('should update a permission successfully', async () => {
      const updateDto: UpdatePermissionDto = {
        description: 'Updated description',
      };

      const updatedPermission = {
        ...mockPermission,
        description: 'Updated description',
      };

      (repository.findOne as jest.Mock).mockResolvedValue(null); // No duplicate name
      (repository.preload as jest.Mock).mockResolvedValue(updatedPermission);
      (repository.save as jest.Mock).mockResolvedValue(updatedPermission);

      const result = await service.update('1', updateDto);

      expect(repository.preload).toHaveBeenCalledWith({
        id: '1',
        ...updateDto,
      });
      expect(repository.save).toHaveBeenCalledWith(updatedPermission);
      expect(result).toEqual(updatedPermission);
    });

    it('should throw PERMISSION_NOT_FOUND error if permission to update does not exist', async () => {
      (repository.preload as jest.Mock).mockResolvedValue(null);

      await expect(
        service.update('nonexistent', {} as UpdatePermissionDto),
      ).rejects.toThrow(
        new BusinessException(ERROR_CODES.PERMISSION_NOT_FOUND),
      );
    });

    it('should throw PERMISSION_ALREADY_EXISTS error if new name already exists', async () => {
      const updateDto: UpdatePermissionDto = {
        name: 'existing-permission',
      };

      const existingPermission = {
        ...mockPermission,
        id: 'other-id',
        name: 'existing-permission',
      };

      (repository.findOne as jest.Mock).mockResolvedValue(existingPermission); // Found duplicate name

      await expect(service.update('1', updateDto)).rejects.toThrow(
        new BusinessException(ERROR_CODES.PERMISSION_ALREADY_EXISTS),
      );
    });
  });

  describe('remove', () => {
    it('should remove a permission successfully', async () => {
      (repository.delete as jest.Mock).mockResolvedValue({ affected: 1 });

      await service.remove('1');

      expect(repository.delete).toHaveBeenCalledWith('1');
    });

    it('should throw PERMISSION_NOT_FOUND error if permission does not exist', async () => {
      (repository.delete as jest.Mock).mockResolvedValue({ affected: 0 });

      await expect(service.remove('nonexistent')).rejects.toThrow(
        new BusinessException(ERROR_CODES.PERMISSION_NOT_FOUND),
      );
    });
  });

  describe('findByModule', () => {
    it('should return permissions by module', async () => {
      const mockPermissions = [mockPermission];
      (repository.findBy as jest.Mock).mockResolvedValue(mockPermissions);

      const result = await service.findByModule('user');

      expect(repository.findBy).toHaveBeenCalledWith({ module: 'user' });
      expect(result).toEqual(mockPermissions);
    });
  });

  describe('findByType', () => {
    it('should return permissions by type', async () => {
      const mockPermissions = [mockPermission];
      (repository.find as jest.Mock).mockResolvedValue(mockPermissions);

      const result = await service.findByType(PermissionType.API);

      expect(repository.find).toHaveBeenCalledWith({
        where: { type: PermissionType.API },
      });
      expect(result).toEqual(mockPermissions);
    });
  });

  describe('updateByName', () => {
    it('should update a permission by name successfully', async () => {
      const updateData = { description: 'Updated description' };
      const updatedPermission = { ...mockPermission, ...updateData };

      (repository.findOneBy as jest.Mock).mockResolvedValue(mockPermission);
      (repository.save as jest.Mock).mockResolvedValue(updatedPermission);

      const result = await service.updateByName('user:create', updateData);

      expect(repository.findOneBy).toHaveBeenCalledWith({
        name: 'user:create',
      });
      expect(repository.save).toHaveBeenCalledWith(updatedPermission);
      expect(result).toEqual(updatedPermission);
    });

    it('should throw PERMISSION_NOT_FOUND error if permission with name does not exist', async () => {
      (repository.findOneBy as jest.Mock).mockResolvedValue(null);

      await expect(
        service.updateByName('nonexistent', { description: 'Updated' }),
      ).rejects.toThrow(
        new BusinessException(ERROR_CODES.PERMISSION_NOT_FOUND),
      );
    });

    it('should throw PERMISSION_ALREADY_EXISTS error if new name already exists', async () => {
      const updateData = { name: 'existing-permission' };
      const otherPermission = {
        ...mockPermission,
        id: 'other',
        name: 'existing-permission',
      };

      (repository.findOneBy as jest.Mock).mockResolvedValue(mockPermission);
      (repository.findOne as jest.Mock).mockResolvedValue(otherPermission); // Found duplicate name

      await expect(
        service.updateByName('user:create', updateData),
      ).rejects.toThrow(
        new BusinessException(ERROR_CODES.PERMISSION_ALREADY_EXISTS),
      );
    });
  });

  describe('removeByName', () => {
    it('should remove a permission by name successfully', async () => {
      (repository.delete as jest.Mock).mockResolvedValue({ affected: 1 });

      await service.removeByName('user:create');

      expect(repository.delete).toHaveBeenCalledWith({ name: 'user:create' });
    });

    it('should throw PERMISSION_NOT_FOUND error if permission with name does not exist', async () => {
      (repository.delete as jest.Mock).mockResolvedValue({ affected: 0 });

      await expect(service.removeByName('nonexistent')).rejects.toThrow(
        new BusinessException(ERROR_CODES.PERMISSION_NOT_FOUND),
      );
    });
  });
});
