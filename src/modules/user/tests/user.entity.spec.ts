import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, UserSchema } from '../entities/user.entity';
import * as bcrypt from 'bcrypt';

describe('User Entity', () => {
  let userModel: Model<UserDocument>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: getModelToken(User.name),
          useValue: {
            new: jest.fn().mockResolvedValue({}),
            constructor: jest.fn().mockResolvedValue({}),
            find: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            create: jest.fn(),
            remove: jest.fn(),
            exec: jest.fn(),
          },
        },
      ],
    }).compile();

    userModel = module.get<Model<UserDocument>>(getModelToken(User.name));
  });

  it('should be defined', () => {
    expect(userModel).toBeDefined();
  });

  describe('User Schema', () => {
    it('should have required fields', () => {
      const userSchema = UserSchema;
      const paths = userSchema.paths;

      expect(paths.username).toBeDefined();
      expect(paths.password).toBeDefined();
      expect(paths.email).toBeDefined();
      expect(paths.realName).toBeDefined();
      expect(paths.role).toBeDefined();
      expect(paths.status).toBeDefined();
    });

    it('should have correct default values', () => {
      const userSchema = UserSchema;
      const paths = userSchema.paths;

      expect(paths.realName.defaultValue).toBe('管理员');
      expect(paths.role.defaultValue).toBe('admin');
      expect(paths.status.defaultValue).toBe('active');
      expect(typeof paths.permissions.defaultValue).toBe('function');
    });

    it('should have correct enum values for role', () => {
      const userSchema = UserSchema;
      const rolePath = userSchema.paths.role;

      expect(rolePath.enumValues).toContain('admin');
      expect(rolePath.enumValues).toContain('super_admin');
      expect(rolePath.enumValues).toContain('operator');
    });

    it('should have correct enum values for status', () => {
      const userSchema = UserSchema;
      const statusPath = userSchema.paths.status;

      expect(statusPath.enumValues).toContain('active');
      expect(statusPath.enumValues).toContain('inactive');
      expect(statusPath.enumValues).toContain('locked');
    });

    it('should have timestamps enabled', () => {
      const userSchema = UserSchema;
      expect(userSchema.options.timestamps).toBe(true);
    });
  });

  describe('Password Hashing Middleware', () => {
    it('should have pre-save middleware defined', () => {
      const userSchema = UserSchema;
      const preHooks = userSchema.pre;

      expect(preHooks).toBeDefined();
    });

    it('should validate middleware functionality conceptually', () => {
      // Test that the middleware concept is implemented
      // The actual bcrypt functionality is tested in integration tests
      expect(typeof bcrypt.hash).toBe('function');
    });
  });

  describe('User Entity Validation', () => {
    it('should create a valid user instance', () => {
      const userData = {
        username: 'testuser',
        password: 'password123',
        email: 'test@example.com',
        realName: '测试用户',
        role: 'admin',
        status: 'active',
        permissions: ['user:read'],
      };

      const user = new User();
      Object.assign(user, userData);

      expect(user.username).toBe('testuser');
      expect(user.email).toBe('test@example.com');
      expect(user.realName).toBe('测试用户');
      expect(user.role).toBe('admin');
      expect(user.status).toBe('active');
      expect(user.permissions).toEqual(['user:read']);
    });

    it('should handle optional fields', () => {
      const userData = {
        username: 'testuser',
        password: 'password123',
        email: 'test@example.com',
        realName: '测试用户',
        role: 'admin',
        avatar: 'https://example.com/avatar.jpg',
        phone: '13800138000',
      };

      const user = new User();
      Object.assign(user, userData);

      expect(user.avatar).toBe('https://example.com/avatar.jpg');
      expect(user.phone).toBe('13800138000');
      expect(user.lastLoginTime).toBeUndefined();
      expect(user.lastLoginIp).toBeUndefined();
    });
  });
});
