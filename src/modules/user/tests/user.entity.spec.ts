import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  afterEach,
  jest,
} from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import {
  getModelToken,
  MongooseModule,
  getConnectionToken,
} from '@nestjs/mongoose';
import { User, UserSchema } from '../entities/user.entity';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, Model } from 'mongoose';

describe('User Entity', () => {
  jest.setTimeout(60000); // Increase timeout to 60 seconds

  let userModel: Model<User>;
  let mongod: MongoMemoryServer;
  let module: TestingModule;
  let connection: Connection;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    module = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(uri),
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
      ],
    }).compile();

    userModel = module.get<Model<User>>(getModelToken(User.name));
    connection = module.get<Connection>(getConnectionToken());
  });

  afterAll(async () => {
    if (connection) {
      await connection.close();
    }
    if (module) {
      await module.close();
    }
    if (mongod) {
      await mongod.stop();
    }
  });

  afterEach(async () => {
    await userModel.deleteMany({});
  });

  describe('User Schema', () => {
    it('should have required fields', () => {
      const userSchema = UserSchema;
      const paths = userSchema.paths;

      expect(paths.username).toBeDefined();
      expect(paths.password).toBeDefined();
      expect(paths.roles).toBeDefined();
      expect(paths.status).toBeDefined();
    });

    it('should have correct default values', () => {
      const userSchema = UserSchema;
      const paths = userSchema.paths;

      expect((paths.status as any).defaultValue).toBe('active');
    });

    it('should have correct enum values for status', () => {
      const userSchema = UserSchema;
      const statusPath = userSchema.paths.status as any;

      expect(statusPath.enumValues).toContain('active');
      expect(statusPath.enumValues).toContain('inactive');
      expect(statusPath.enumValues).toContain('locked');
    });

    it('should create a user instance', () => {
      const userData = {
        username: 'testuser',
        password: 'hashedpassword',
        roles: [],
        status: 'active',
      };

      const user = new userModel(userData);

      expect(user.username).toBe('testuser');
      expect(user.password).toBe('hashedpassword');
      expect(user.roles).toEqual([]);
      expect(user.status).toBe('active');
    });
  });

  describe('User Validation', () => {
    it('should require username', async () => {
      const userData = {
        password: 'hashedpassword',
      };

      const user = new userModel(userData);
      const validationError = user.validateSync();

      expect(validationError).toBeDefined();
      expect(validationError.errors.username).toBeDefined();
    });

    it('should require password', () => {
      const userData = {
        username: 'testuser',
      };

      const user = new userModel(userData);
      const validationError = user.validateSync();

      expect(validationError).toBeDefined();
      expect(validationError.errors.password).toBeDefined();
    });

    it('should accept valid status values', () => {
      const validStatuses = ['active', 'inactive', 'locked'];

      validStatuses.forEach((status) => {
        const userData = {
          username: 'testuser',
          password: 'hashedpassword',
          status,
        };

        const user = new userModel(userData);
        const validationError = user.validateSync();

        expect(validationError?.errors?.status).toBeUndefined();
      });
    });

    it('should reject invalid status values', () => {
      const userData = {
        username: 'testuser',
        password: 'hashedpassword',
        status: 'invalid_status',
      };

      const user = new userModel(userData);
      const validationError = user.validateSync();

      expect(validationError).toBeDefined();
      expect(validationError.errors.status).toBeDefined();
    });
  });
});
