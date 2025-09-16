import {
  Injectable,
  HttpException,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Role, RoleDocument } from '../entities/role.entity';
import { RoleType } from '../../../common/enums/role-type.enum';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { PermissionService } from '../../permission/services/permission.service';
import { Permission } from '../../permission/entities/permission.entity';
import { RoleListResponseDto } from '../dto/role-list-response.dto';
import { ERROR_CODES } from '../../../common/constants/error-codes';

@Injectable()
export class RoleService {
  constructor(
    @InjectModel(Role.name)
    private roleModel: Model<RoleDocument>,
    private permissionService: PermissionService,
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    const existingRole = await this.roleModel.findOne({
      name: createRoleDto.name,
    });

    if (existingRole) {
      throw new HttpException(
        '角色名称已存在',
        ERROR_CODES.ROLE_ALREADY_EXISTS,
      );
    }

    // 验证角色类型是否合法
    const validRoleTypes = Object.values(RoleType) as RoleType[];
    if (!validRoleTypes.includes(createRoleDto.type)) {
      throw new HttpException('无效的角色类型', ERROR_CODES.INVALID_ROLE_TYPE);
    }

    // 验证权限是否存在
    if (createRoleDto.permissions && createRoleDto.permissions.length > 0) {
      const permissions = await this.permissionService.findByIds(
        createRoleDto.permissions,
      );
      const permissionIds = createRoleDto.permissions as string[];
      if (permissions.length !== permissionIds.length) {
        throw new HttpException(
          '部分权限不存在',
          ERROR_CODES.PERMISSION_NOT_FOUND,
        );
      }
    }

    const role = new this.roleModel(createRoleDto);
    return role.save();
  }

  async findAll(): Promise<RoleListResponseDto[]> {
    return this.roleModel
      .find()
      .select('-permissions')
      .exec() as unknown as RoleListResponseDto[];
  }

  async findOne(id: string): Promise<Role> {
    const role = await this.roleModel
      .findById(id)
      .populate('permissions')
      .exec();
    if (!role) {
      throw new HttpException('角色不存在', ERROR_CODES.ROLE_NOT_FOUND);
    }
    return role;
  }

  async findById(id: string): Promise<Role> {
    return this.findOne(id);
  }

  async findByName(name: string): Promise<Role | null> {
    return this.roleModel.findOne({ name }).populate('permissions').exec();
  }

  async findByType(type: RoleType): Promise<Role | null> {
    return this.roleModel.findOne({ type }).populate('permissions').exec();
  }

  async findByIds(ids: string[]): Promise<Role[]> {
    return this.roleModel
      .find({ _id: { $in: ids } })
      .populate('permissions')
      .exec();
  }

  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const existingRole = await this.roleModel.findById(id);
    if (!existingRole) {
      throw new HttpException('角色不存在', ERROR_CODES.ROLE_NOT_FOUND);
    }

    // 系统角色不允许修改某些字段
    if (existingRole.isSystem && updateRoleDto.isSystem === false) {
      throw new HttpException(
        '不能修改系统角色的系统标识',
        ERROR_CODES.SYSTEM_ROLE_IMMUTABLE,
      );
    }

    // 角色类型不允许修改
    if (updateRoleDto.type && updateRoleDto.type !== existingRole.type) {
      throw new HttpException(
        '角色类型不允许修改',
        ERROR_CODES.ROLE_TYPE_IMMUTABLE,
      );
    }

    if (updateRoleDto.name) {
      const duplicateRole = await this.roleModel.findOne({
        name: updateRoleDto.name,
        _id: { $ne: id },
      });

      if (duplicateRole) {
        throw new HttpException(
          '角色名称已存在',
          ERROR_CODES.ROLE_ALREADY_EXISTS,
        );
      }
    }

    // 验证权限是否存在
    if (updateRoleDto.permissions && updateRoleDto.permissions.length > 0) {
      const permissions = await this.permissionService.findByIds(
        updateRoleDto.permissions,
      );
      const permissionIds = updateRoleDto.permissions as string[];
      if (permissions.length !== permissionIds.length) {
        throw new HttpException(
          '部分权限不存在',
          ERROR_CODES.PERMISSION_NOT_FOUND,
        );
      }
    }

    const role = await this.roleModel
      .findByIdAndUpdate(id, updateRoleDto, { new: true })
      .populate('permissions')
      .exec();

    return role!;
  }

  async remove(id: string): Promise<void> {
    const role = await this.roleModel.findById(id);
    if (!role) {
      throw new HttpException('角色不存在', ERROR_CODES.ROLE_NOT_FOUND);
    }

    if (role.isSystem) {
      throw new HttpException(
        '系统角色不能删除',
        ERROR_CODES.SYSTEM_ROLE_IMMUTABLE,
      );
    }

    await this.roleModel.findByIdAndDelete(id).exec();
  }

  async addPermissions(roleId: string, permissionIds: string[]): Promise<Role> {
    const role = await this.roleModel.findById(roleId);
    if (!role) {
      throw new HttpException('角色不存在', ERROR_CODES.ROLE_NOT_FOUND);
    }

    // 验证权限是否存在
    const permissions = await this.permissionService.findByIds(permissionIds);
    if (permissions.length !== permissionIds.length) {
      throw new HttpException(
        '部分权限不存在',
        ERROR_CODES.PERMISSION_NOT_FOUND,
      );
    }

    // 添加权限（去重）
    const currentPermissionIds = (
      role.permissions as { toString(): string }[]
    ).map((p) => p.toString());
    const newPermissions = [
      ...new Set([...currentPermissionIds, ...permissionIds]),
    ];

    return this.roleModel
      .findByIdAndUpdate(roleId, { permissions: newPermissions }, { new: true })
      .populate('permissions')
      .exec() as Promise<Role>;
  }

  async updatePermissions(
    roleId: string,
    permissionIds: string[],
  ): Promise<Role> {
    const role = await this.roleModel.findById(roleId);
    if (!role) {
      throw new HttpException('角色不存在', ERROR_CODES.ROLE_NOT_FOUND);
    }

    // 验证权限是否存在
    if (permissionIds.length > 0) {
      const permissions = await this.permissionService.findByIds(permissionIds);
      if (permissions.length !== permissionIds.length) {
        throw new HttpException(
          '部分权限不存在',
          ERROR_CODES.PERMISSION_NOT_FOUND,
        );
      }
    }

    // 更新权限（完全替换）
    return this.roleModel
      .findByIdAndUpdate(roleId, { permissions: permissionIds }, { new: true })
      .populate('permissions')
      .exec() as Promise<Role>;
  }

  async findPermissionsByRoleId(
    roleId: string,
    type?: string,
  ): Promise<
    Array<{
      id: string;
      name?: string;
      description?: string;
      code?: string;
      type?: string;
    }>
  > {
    const role = await this.roleModel
      .findById(roleId)
      .populate('permissions')
      .exec();

    if (!role) {
      throw new HttpException('角色不存在', ERROR_CODES.ROLE_NOT_FOUND);
    }

    // 首先过滤出已填充的权限对象（包含type字段）
    const populatedPermissions = role.permissions.filter(
      (permission: Permission | Types.ObjectId | any) => {
        return (
          permission && typeof permission === 'object' && 'type' in permission
        );
      },
    ) as Permission[];

    // 然后根据类型进行过滤（如果指定了类型）
    let filteredPermissions = populatedPermissions;
    if (type) {
      filteredPermissions = populatedPermissions.filter(
        (permission: Permission) => {
          return permission.type === type;
        },
      );
    }

    // 返回权限信息（只返回完整的权限对象）
    return filteredPermissions.map((permission: Permission) => {
      const permissionDoc = permission as Permission & {
        _id?: Types.ObjectId;
        id?: string;
      };
      return {
        id: permissionDoc._id?.toString() || permissionDoc.id || '',
        name: permissionDoc.name,
        description: permissionDoc.description,
        code: permissionDoc.name, // 使用name作为code
        type: permissionDoc.type, // 添加权限类型
      };
    });
  }

  /**
   * 获取所有角色类型枚举值
   * @returns 角色类型列表，包含value和label
   */
  async getRoleTypes(): Promise<Array<{ value: string; label: string }>> {
    const roleTypes = Object.values(RoleType);

    // 映射为前端友好的格式
    const typeLabels: Record<RoleType, string> = {
      [RoleType.SUPER_ADMIN]: '超级管理员',
      [RoleType.ADMIN]: '管理员',
      [RoleType.OPERATOR]: '操作员',
    };

    return roleTypes.map((type) => ({
      value: type,
      label: typeLabels[type] || type,
    }));
  }
}
