import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../services/user.service';
import { UserController } from '../controllers/user.controller';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserWithIdDto } from '../dto/update-user-with-id.dto';
import { QueryUserDto } from '../dto/query-user.dto';
import { UserIdBodyDto } from '../dto/user-id-body.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import { UserListResponseDto } from '../dto/user-list-response.dto';
import { BusinessException } from '../../../common/exceptions/business.exception';
import { ERROR_CODES } from '../../../common/constants/error-codes';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            findAll: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return a list of users', async () => {
      const query: QueryUserDto = { page: 1, pageSize: 10 };
      const expectedResult: UserListResponseDto = {
        list: [],
        total: 0,
        page: 1,
        pageSize: 10,
        totalPages: 0,
      };

      jest.spyOn(userService, 'findAll').mockResolvedValue(expectedResult);

      const result = await controller.findAll(query);
      expect(result).toEqual(expectedResult);
      expect(userService.findAll).toHaveBeenCalledWith(query);
    });
  });

  describe('create', () => {
    it('should create and return a new user', async () => {
      const createUserDto: CreateUserDto = {
        username: 'testuser',
        password: 'password123',
      };

      const expectedResult: UserResponseDto = {
        id: '123',
        username: 'testuser',
        roles: [],
        status: 'active',
        avatar: undefined,
        permissions: [],
        lastLoginTime: undefined,
        lastLoginIp: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
        isSuperAdmin: false,
      };

      jest.spyOn(userService, 'create').mockResolvedValue(expectedResult);

      const result = await controller.create(createUserDto);
      expect(result).toEqual(expectedResult);
      expect(userService.create).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('update', () => {
    it('should update and return the updated user', async () => {
      const updateUserWithIdDto: UpdateUserWithIdDto = {
        id: '123',
        username: 'updateduser',
      };

      const expectedResult: UserResponseDto = {
        id: '123',
        username: 'updateduser',
        roles: [],
        status: 'active',
        avatar: undefined,
        permissions: [],
        lastLoginTime: undefined,
        lastLoginIp: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
        isSuperAdmin: false,
      };

      jest.spyOn(userService, 'update').mockResolvedValue(expectedResult);

      const result = await controller.update(updateUserWithIdDto, '456');
      expect(result).toEqual(expectedResult);
      expect(userService.update).toHaveBeenCalledWith('123', {
        username: 'updateduser',
      });
    });

    it('should not update roles and status if current user is updating themselves', async () => {
      const updateUserWithIdDto: UpdateUserWithIdDto = {
        id: '123',
        username: 'updateduser',
        roles: ['role1'],
        status: 'inactive',
      };

      const expectedResult: UserResponseDto = {
        id: '123',
        username: 'updateduser',
        roles: [],
        status: 'active',
        avatar: undefined,
        permissions: [],
        lastLoginTime: undefined,
        lastLoginIp: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
        isSuperAdmin: false,
      };

      jest.spyOn(userService, 'update').mockResolvedValue(expectedResult);

      // 当前用户ID是'123'，与要更新的用户ID相同
      const result = await controller.update(updateUserWithIdDto, '123');
      expect(result).toEqual(expectedResult);
      // 验证传给update方法的参数不包含roles和status
      expect(userService.update).toHaveBeenCalledWith('123', {
        username: 'updateduser',
      });
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      const userIdDto: UserIdBodyDto = { id: '123' };

      const removeSpy = jest.spyOn(userService, 'remove').mockResolvedValue();

      await controller.remove(userIdDto, '456');
      expect(removeSpy).toHaveBeenCalledWith('123');
    });

    it('should throw an error if trying to delete oneself', async () => {
      const userIdDto: UserIdBodyDto = { id: '123' };

      await expect(controller.remove(userIdDto, '123')).rejects.toThrow(
        new BusinessException(ERROR_CODES.USER_ID_UNDEFINED),
      );
    });
  });
});
