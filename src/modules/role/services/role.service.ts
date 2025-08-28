import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role, RoleDocument } from '../entities/role.entity';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { PermissionService } from '../../permission/services/permission.service';

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
      throw new ConflictException('角色名称已存在');
    }

    // 验证权限是否存在
    if (createRoleDto.permissions && createRoleDto.permissions.length > 0) {
      const permissions = await this.permissionService.findByNames(
        createRoleDto.permissions,
      );
      if (permissions.length !== createRoleDto.permissions.length) {
        throw new BadRequestException('部分权限不存在');
      }
    }

    const role = new this.roleModel(createRoleDto);
    return role.save();
  }

  async findAll(): Promise<Role[]> {
    return this.roleModel.find().populate('permissions').exec();
  }

  async findOne(id: string): Promise<Role> {
    const role = await this.roleModel
      .findById(id)
      .populate('permissions')
      .exec();
    if (!role) {
      throw new NotFoundException('角色不存在');
    }
    return role;
  }

  async findById(id: string): Promise<Role> {
    return this.findOne(id);
  }

  async findByName(name: string): Promise<Role | null> {
    return this.roleModel.findOne({ name }).populate('permissions').exec();
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
      throw new NotFoundException('角色不存在');
    }

    // 系统角色不允许修改某些字段
    if (existingRole.isSystem && updateRoleDto.isSystem === false) {
      throw new BadRequestException('不能修改系统角色的系统标识');
    }

    if (updateRoleDto.name) {
      const duplicateRole = await this.roleModel.findOne({
        name: updateRoleDto.name,
        _id: { $ne: id },
      });

      if (duplicateRole) {
        throw new ConflictException('角色名称已存在');
      }
    }

    // 验证权限是否存在
    if (updateRoleDto.permissions && updateRoleDto.permissions.length > 0) {
      const permissions = await this.permissionService.findByNames(
        updateRoleDto.permissions,
      );
      if (permissions.length !== updateRoleDto.permissions.length) {
        throw new BadRequestException('部分权限不存在');
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
      throw new NotFoundException('角色不存在');
    }

    if (role.isSystem) {
      throw new BadRequestException('系统角色不能删除');
    }

    await this.roleModel.findByIdAndDelete(id).exec();
  }

  async addPermissions(roleId: string, permissionIds: string[]): Promise<Role> {
    const role = await this.roleModel.findById(roleId);
    if (!role) {
      throw new NotFoundException('角色不存在');
    }

    // 验证权限是否存在
    const permissions = await this.permissionService.findByNames(permissionIds);
    if (permissions.length !== permissionIds.length) {
      throw new BadRequestException('部分权限不存在');
    }

    // 添加权限（去重）
    const currentPermissionIds = (role.permissions as any[]).map((p) =>
      p.toString(),
    );
    const newPermissions = [
      ...new Set([...currentPermissionIds, ...permissionIds]),
    ];

    return this.roleModel
      .findByIdAndUpdate(roleId, { permissions: newPermissions }, { new: true })
      .populate('permissions')
      .exec() as Promise<Role>;
  }

  async removePermissions(
    roleId: string,
    permissionIds: string[],
  ): Promise<Role> {
    const role = await this.roleModel.findById(roleId);
    if (!role) {
      throw new NotFoundException('角色不存在');
    }

    // 移除权限
    const currentPermissionIds = (role.permissions as any[]).map((p) =>
      p.toString(),
    );
    const newPermissions = currentPermissionIds.filter(
      (p) => !permissionIds.includes(p),
    );

    return this.roleModel
      .findByIdAndUpdate(roleId, { permissions: newPermissions }, { new: true })
      .populate('permissions')
      .exec() as Promise<Role>;
  }
}
