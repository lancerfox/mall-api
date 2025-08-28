import { Test, TestingModule } from '@nestjs/testing';
import { PermissionsController } from '../controllers/permissions.controller';
import { PERMISSIONS, ROLES } from '../../../common/decorators/roles.decorator';
import { UserService } from '../services/user.service';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';

describe('PermissionsController', () => {
  let controller: PermissionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PermissionsController],
      providers: [
        { provide: UserService, useValue: { findById: jest.fn() } },
        { provide: RolesGuard, useValue: { canActivate: jest.fn(() => true) } },
        {
          provide: JwtAuthGuard,
          useValue: { canActivate: jest.fn(() => true) },
        },
      ],
    }).compile();

    controller = module.get<PermissionsController>(PermissionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllPermissions', () => {
    it('should return all permissions', () => {
      const result = controller.getAllPermissions();

      expect(result).toHaveProperty('permissions');
      expect(result).toHaveProperty('predefinedPermissions');
      expect(Array.isArray(result.permissions)).toBe(true);
      expect(result.predefinedPermissions).toEqual(PERMISSIONS);

      // 验证权限列表是去重且排序的
      const uniquePermissions = [...new Set(Object.values(PERMISSIONS))].sort();
      expect(result.permissions).toEqual(uniquePermissions);
    });

    it('should return sorted unique permissions', () => {
      const result = controller.getAllPermissions();

      // 检查是否已排序
      const sortedPermissions = [...result.permissions].sort();
      expect(result.permissions).toEqual(sortedPermissions);

      // 检查是否去重
      const uniquePermissions = [...new Set(result.permissions)];
      expect(result.permissions).toEqual(uniquePermissions);
    });
  });
});
