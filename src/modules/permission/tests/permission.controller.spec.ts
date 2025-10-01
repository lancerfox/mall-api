import { Test, TestingModule } from '@nestjs/testing';
import { PermissionController } from '../controllers/permission.controller';
import { PermissionService } from '../services/permission.service';
import { CreatePermissionDto } from '../dto/create-permission.dto';
import { UpdatePermissionWithIdDto } from '../dto/update-permission-with-id.dto';
import { Permission } from '../entities/permission.entity';

describe('PermissionController', () => {
  let controller: PermissionController;
  let service: PermissionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PermissionController],
      providers: [
        {
          provide: PermissionService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findByType: jest.fn(),
            remove: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<PermissionController>(PermissionController);
    service = module.get<PermissionService>(PermissionService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call permissionService.create', async () => {
      const createDto: CreatePermissionDto = {
        name: 'user:create',
        description: '创建用户',
        type: 'API',
        module: 'user',
      };
      const mockPermission = { id: '1', ...createDto } as Permission;
      (service.create as jest.Mock).mockResolvedValue(mockPermission);

      const result = await controller.create(createDto);

      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockPermission);
    });
  });

  describe('findAll', () => {
    it('should call permissionService.findAll when no type is provided', async () => {
      const mockPermissions = [
        { id: '1', name: 'user:create' },
      ] as Permission[];
      (service.findAll as jest.Mock).mockResolvedValue(mockPermissions);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockPermissions);
    });

    it('should call permissionService.findByType when type is provided', async () => {
      const mockPermissions = [
        { id: '1', name: 'user:create' },
      ] as Permission[];
      (service.findByType as jest.Mock).mockResolvedValue(mockPermissions);

      const result = await controller.findAll('API');

      expect(service.findByType).toHaveBeenCalledWith('API');
      expect(result).toEqual(mockPermissions);
    });
  });

  describe('remove', () => {
    it('should call permissionService.remove', async () => {
      (service.remove as jest.Mock).mockResolvedValue(undefined);

      await controller.remove('1');

      expect(service.remove).toHaveBeenCalledWith('1');
    });
  });

  describe('update', () => {
    it('should call permissionService.update', async () => {
      const updateDto: UpdatePermissionWithIdDto = {
        id: '1',
        description: 'Updated description',
      };
      const mockPermission = {
        id: '1',
        name: 'user:create',
        description: 'Updated description',
      } as Permission;
      (service.update as jest.Mock).mockResolvedValue(mockPermission);

      const result = await controller.update(updateDto);

      expect(service.update).toHaveBeenCalledWith('1', {
        description: 'Updated description',
      });
      expect(result).toEqual(mockPermission);
    });
  });
});
