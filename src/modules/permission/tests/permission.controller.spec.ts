import { Test, TestingModule } from '@nestjs/testing';
import { PermissionController } from '../controllers/permission.controller';
import { PermissionService } from '../services/permission.service';
import { CreatePermissionDto } from '../dto/create-permission.dto';
import { UpdatePermissionDto } from '../dto/update-permission.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';

describe('PermissionController', () => {
  let controller: PermissionController;
  let service: PermissionService;

  const mockPermissionService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findByModule: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PermissionController],
      providers: [
        {
          provide: PermissionService,
          useValue: mockPermissionService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<PermissionController>(PermissionController);
    service = module.get<PermissionService>(PermissionService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new permission', async () => {
      const createDto: CreatePermissionDto = {
        name: 'test',
        key: 'test:create',
        module: 'test',
      };
      const result = { id: '1', ...createDto };
      mockPermissionService.create.mockResolvedValue(result);

      expect(await controller.create(createDto)).toBe(result);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of permissions', async () => {
      const result = [
        { id: '1', name: 'test', key: 'test:read', module: 'test' },
      ];
      mockPermissionService.findAll.mockResolvedValue(result);

      expect(await controller.findAll()).toBe(result);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single permission', async () => {
      const id = '1';
      const result = { id, name: 'test', key: 'test:read', module: 'test' };
      mockPermissionService.findById.mockResolvedValue(result);

      expect(await controller.findOne(id)).toBe(result);
      expect(service.findById).toHaveBeenCalledWith(id);
    });
  });

  describe('update', () => {
    it('should update a permission', async () => {
      const updateDto: UpdatePermissionDto = { id: '1', name: 'updated' };
      const { id, ...data } = updateDto;
      const result = { id, ...data };
      mockPermissionService.update.mockResolvedValue(result);

      expect(await controller.update(updateDto)).toBe(result);
      expect(service.update).toHaveBeenCalledWith(id, data);
    });
  });

  describe('remove', () => {
    it('should remove a permission', async () => {
      const id = '1';
      const result = { id, name: 'test', key: 'test:delete', module: 'test' };
      mockPermissionService.remove.mockResolvedValue(result);

      expect(await controller.remove(id)).toBe(result);
      expect(service.remove).toHaveBeenCalledWith(id);
    });
  });

  describe('findByModule', () => {
    it('should return permissions for a module', async () => {
      const moduleName = 'test';
      const result = [
        { id: '1', name: 'test', key: 'test:read', module: 'test' },
      ];
      mockPermissionService.findByModule.mockResolvedValue(result);

      expect(await controller.findByModule(moduleName)).toBe(result);
      expect(service.findByModule).toHaveBeenCalledWith(moduleName);
    });
  });
});
