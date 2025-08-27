import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AppModule } from '../src/app.module';
import { User, UserDocument } from '../src/modules/user/entities/user.entity';
import { SecurityService } from '../src/modules/auth/services/security.service';

describe('UserController (e2e)', () => {
  let app: INestApplication<App>;
  let userModel: Model<UserDocument>;
  let securityService: SecurityService;
  let accessToken: string;
  let testUserId: string;

  const adminUser = {
    username: 'admin',
    email: 'admin@example.com',
    password: 'admin123',
    realName: 'Admin User',
    role: 'super_admin',
    status: 'active',
    permissions: ['user:read', 'user:write', 'user:delete'],
  };

  const testUser = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123',
    realName: 'Test User',
    role: 'admin',
    status: 'active',
    permissions: ['user:read'],
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());

    userModel = moduleFixture.get<Model<UserDocument>>(
      getModelToken(User.name),
    );
    securityService = moduleFixture.get<SecurityService>(SecurityService);

    await app.init();

    // Create admin user for authentication
    const hashedPassword = await securityService.hashPassword(
      adminUser.password,
    );
    await userModel.create({
      ...adminUser,
      password: hashedPassword,
    });

    // Login to get access token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        username: adminUser.username,
        password: adminUser.password,
      });

    accessToken = loginResponse.body.access_token;
  });

  afterAll(async () => {
    // Clean up test data
    await userModel.deleteMany({});
    await app.close();
  });

  describe('/users (POST)', () => {
    it('should create a new user', () => {
      return request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(testUser)
        .expect(201)
        .expect((res) => {
          expect(res.body.username).toBe(testUser.username);
          expect(res.body.email).toBe(testUser.email);
          expect(res.body.password).toBeUndefined();
          testUserId = res.body.id;
        });
    });

    it('should reject duplicate username', () => {
      return request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(testUser)
        .expect(400);
    });

    it('should validate required fields', () => {
      return request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          username: 'newuser',
        })
        .expect(400);
    });

    it('should reject request without authentication', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send(testUser)
        .expect(401);
    });
  });

  describe('/users (GET)', () => {
    it('should get paginated users list', () => {
      return request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${accessToken}`)
        .query({ page: 1, limit: 10 })
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toBeDefined();
          expect(res.body.total).toBeDefined();
          expect(res.body.page).toBe(1);
          expect(res.body.limit).toBe(10);
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    it('should filter users by username', () => {
      return request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${accessToken}`)
        .query({ username: 'test' })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.length).toBeGreaterThan(0);
          expect(res.body.data[0].username).toContain('test');
        });
    });

    it('should filter users by role', () => {
      return request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${accessToken}`)
        .query({ role: 'admin' })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.length).toBeGreaterThan(0);
          res.body.data.forEach((user: any) => {
            expect(user.role).toBe('admin');
          });
        });
    });
  });

  describe('/users/:id (GET)', () => {
    it('should get user by id', () => {
      return request(app.getHttpServer())
        .get(`/users/${testUserId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(testUserId);
          expect(res.body.username).toBe(testUser.username);
          expect(res.body.password).toBeUndefined();
        });
    });

    it('should return 404 for non-existent user', () => {
      return request(app.getHttpServer())
        .get('/users/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });

    it('should return 400 for invalid id format', () => {
      return request(app.getHttpServer())
        .get('/users/invalid-id')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(400);
    });
  });

  describe('/users/:id (PUT)', () => {
    it('should update user', () => {
      const updateData = {
        realName: 'Updated Test User',
        email: 'updated@example.com',
      };

      return request(app.getHttpServer())
        .put(`/users/${testUserId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateData)
        .expect(200)
        .expect((res) => {
          expect(res.body.realName).toBe(updateData.realName);
          expect(res.body.email).toBe(updateData.email);
        });
    });

    it('should validate email format', () => {
      return request(app.getHttpServer())
        .put(`/users/${testUserId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          email: 'invalid-email',
        })
        .expect(400);
    });
  });

  describe('/users/:id/status (PUT)', () => {
    it('should update user status', () => {
      return request(app.getHttpServer())
        .put(`/users/${testUserId}/status`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          status: 'inactive',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('inactive');
        });
    });

    it('should validate status value', () => {
      return request(app.getHttpServer())
        .put(`/users/${testUserId}/status`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          status: 'invalid-status',
        })
        .expect(400);
    });
  });

  describe('/users/:id/reset-password (POST)', () => {
    it('should reset user password', () => {
      return request(app.getHttpServer())
        .post(`/users/${testUserId}/reset-password`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          newPassword: 'newpassword123',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.message).toBe('密码重置成功');
        });
    });

    it('should validate password strength', () => {
      return request(app.getHttpServer())
        .post(`/users/${testUserId}/reset-password`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          newPassword: '123',
        })
        .expect(400);
    });
  });

  describe('/users/batch-delete (DELETE)', () => {
    let user1Id: string;
    let user2Id: string;

    beforeAll(async () => {
      // Create test users for batch deletion
      const user1Response = await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          username: 'batchuser1',
          email: 'batch1@example.com',
          password: 'password123',
          realName: 'Batch User 1',
          role: 'admin',
        });
      user1Id = user1Response.body.id;

      const user2Response = await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          username: 'batchuser2',
          email: 'batch2@example.com',
          password: 'password123',
          realName: 'Batch User 2',
          role: 'admin',
        });
      user2Id = user2Response.body.id;
    });

    it('should delete multiple users', () => {
      return request(app.getHttpServer())
        .delete('/users/batch-delete')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          ids: [user1Id, user2Id],
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.deletedCount).toBe(2);
        });
    });
  });

  describe('/users/:id/menus (GET)', () => {
    it('should get user menus', () => {
      return request(app.getHttpServer())
        .get(`/users/${testUserId}/menus`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.menus).toBeDefined();
          expect(res.body.permissions).toBeDefined();
          expect(Array.isArray(res.body.menus)).toBe(true);
          expect(Array.isArray(res.body.permissions)).toBe(true);
        });
    });
  });

  describe('/users/:id (DELETE)', () => {
    it('should delete user', () => {
      return request(app.getHttpServer())
        .delete(`/users/${testUserId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toBe('用户删除成功');
        });
    });

    it('should return 404 for already deleted user', () => {
      return request(app.getHttpServer())
        .delete(`/users/${testUserId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });
});
