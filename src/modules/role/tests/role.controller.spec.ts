import { Test, TestingModule } from '@nestjs/testing';
import { RoleController } from '../controllers/role.controller';
import { RoleService } from '../services/role.service';
import { CreateRoleDto } from '../dto/create-role.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';

describe('RoleController', () => {
  let controller: RoleController;
  let service: RoleService;

  const mockRoleService = {
    create: jest.fn(),
    findAll: jest.fn(),
    remove: jest.fn(),
    addPermissions: jest.fn(),
    removePermissions: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoleController],
      providers: [
        {
          provide: RoleService,
          useValue: mockRoleService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<RoleController>(RoleController);
    service = module.get<RoleService>(RoleService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new role', async () => {
      const createDto: CreateRoleDto = {
        name: 'admin',
        description: 'Administrator',
      };
      const result = { id: '1', ...createDto };
      mockRoleService.create.mockResolvedValue(result);

      expect(await controller.create(createDto)).toBe(result);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of roles', async () => {
      const result = [{ id: '1', name: 'admin', description: 'Administrator' }];
      mockRoleService.findAll.mockResolvedValue(result);

      expect(await controller.findAll()).toBe(result);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove a role', async () => {
      const id = '1';
      const result = { id, name: 'admin', description: 'Administrator' };
      mockRoleService.remove.mockResolvedValue(result);

      expect(await controller.remove(id)).toBe(result);
      expect(service.remove).toHaveBeenCalledWith(id);
    });
  });

  describe('addPermissions', () => {
    it('should add permissions to a role', async () => {
      const id = '1';
      const permissionIds = ['p1', 'p2'];
      const result = {
        id,
        name: 'admin',
        description: 'Administrator',
        permissions: [],
      };
      mockRoleService.addPermissions.mockResolvedValue(result);

      expect(await controller.addPermissions(id, permissionIds)).toBe(result);
      expect(service.addPermissions).toHaveBeenCalledWith(id, permissionIds);
    });
  });

  describe('removePermissions', () => {
    it('should remove permissions from a role', async () => {
      const id = '1';
      const permissionIds = ['p1'];
      const result = {
        id,
        name: 'admin',
        description: 'Administrator',
        permissions: [],
      };
      mockRoleService.removePermissions.mockResolvedValue(result);

      expect(await controller.removePermissions(id, permissionIds)).toBe(
        result,
      );
      expect(service.removePermissions).toHaveBeenCalledWith(id, permissionIds);
    });
  });
});
