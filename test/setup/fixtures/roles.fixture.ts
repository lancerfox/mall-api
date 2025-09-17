import { Types } from 'mongoose';

/**
 * 测试角色数据夹具
 */
export const testRoles = {
  adminRole: {
    _id: new Types.ObjectId(),
    name: '超级管理员',
    code: 'super_admin',
    type: 'SUPER_ADMIN',
    description: '系统超级管理员',
    permissions: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  userRole: {
    _id: new Types.ObjectId(),
    name: '普通用户',
    code: 'user',
    type: 'USER',
    description: '普通用户角色',
    permissions: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  testRole: {
    _id: new Types.ObjectId(),
    name: '测试角色',
    code: 'test_role',
    type: 'CUSTOM',
    description: '测试专用角色',
    permissions: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
};

/**
 * 插入角色夹具数据
 */
export const createRoleFixtures = async (roleModel: any) => {
  await roleModel.insertMany(Object.values(testRoles));
};

/**
 * 创建测试角色
 */
export const createTestRole = (overrides: Partial<any> = {}) => {
  return {
    _id: new Types.ObjectId(),
    name: '测试角色' + Date.now(),
    code: 'test_role_' + Date.now(),
    type: 'CUSTOM',
    description: '动态创建的测试角色',
    permissions: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
};
