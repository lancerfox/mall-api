import { Types } from 'mongoose';
import * as bcrypt from 'bcrypt';

/**
 * 测试用户数据夹具
 */
export const testUsers = {
  adminUser: {
    _id: new Types.ObjectId(),
    username: 'admin',
    password: '$2b$10$ExampleHashedPasswordForAdmin123', // bcrypt hash
    roles: [],
    status: 'active',
    avatar: '',
    lastLoginTime: new Date(),
    lastLoginIp: '127.0.0.1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  testUser: {
    _id: new Types.ObjectId(),
    username: 'testuser',
    password: '$2b$10$ExampleHashedPasswordForTestUser123',
    roles: [],
    status: 'active',
    avatar: '',
    lastLoginTime: new Date(),
    lastLoginIp: '127.0.0.1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  disabledUser: {
    _id: new Types.ObjectId(),
    username: 'disabled',
    password: '$2b$10$ExampleHashedPasswordForDisabledUser123',
    roles: [],
    status: 'inactive',
    avatar: '',
    lastLoginTime: new Date(),
    lastLoginIp: '127.0.0.1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  lockedUser: {
    _id: new Types.ObjectId(),
    username: 'locked',
    password: '$2b$10$ExampleHashedPasswordForLockedUser123',
    roles: [],
    status: 'locked',
    avatar: '',
    lastLoginTime: new Date(),
    lastLoginIp: '127.0.0.1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
};

/**
 * 创建测试用户
 */
export const createTestUser = async (overrides: Partial<any> = {}) => {
  const defaultUser = {
    _id: new Types.ObjectId(),
    username: 'testuser' + Date.now(),
    password: await bcrypt.hash('testpassword123', 10),
    roles: [],
    status: 'active',
    avatar: '',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };

  return defaultUser;
};

/**
 * 插入用户夹具数据
 */
export const createUserFixtures = async (userModel: any) => {
  await userModel.insertMany(Object.values(testUsers));
};
