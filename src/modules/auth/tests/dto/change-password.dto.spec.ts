import { validate } from 'class-validator';
import { ChangePasswordDto } from '../../dto/change-password.dto';

describe('ChangePasswordDto', () => {
  it('应该验证有效的密码修改数据', async () => {
    // 安排
    const changePasswordDto = new ChangePasswordDto();
    changePasswordDto.currentPassword = 'oldpassword123';
    changePasswordDto.newPassword = 'newpassword456';
    changePasswordDto.confirmPassword = 'newpassword456';

    // 执行
    const errors = await validate(changePasswordDto);

    // 断言
    expect(errors).toHaveLength(0);
  });

  it('应该在当前密码缺失时抛出验证错误', async () => {
    // 安排
    const changePasswordDto = new ChangePasswordDto();
    changePasswordDto.newPassword = 'newpassword456';
    changePasswordDto.confirmPassword = 'newpassword456';

    // 执行
    const errors = await validate(changePasswordDto);

    // 断言
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('currentPassword');
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });

  it('应该在新密码缺失时抛出验证错误', async () => {
    // 安排
    const changePasswordDto = new ChangePasswordDto();
    changePasswordDto.currentPassword = 'oldpassword123';
    changePasswordDto.confirmPassword = 'newpassword456';

    // 执行
    const errors = await validate(changePasswordDto);

    // 断言
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('newPassword');
    expect(errors[0].constraints).toHaveProperty('isLength');
  });

  it('应该在确认密码缺失时抛出验证错误', async () => {
    // 安排
    const changePasswordDto = new ChangePasswordDto();
    changePasswordDto.currentPassword = 'oldpassword123';
    changePasswordDto.newPassword = 'newpassword456';

    // 执行
    const errors = await validate(changePasswordDto);

    // 断言
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('confirmPassword');
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });

  it('应该在所有字段都缺失时抛出多个验证错误', async () => {
    // 安排
    const changePasswordDto = new ChangePasswordDto();

    // 执行
    const errors = await validate(changePasswordDto);

    // 断言
    expect(errors).toHaveLength(3);
    expect(errors.map(e => e.property)).toContain('currentPassword');
    expect(errors.map(e => e.property)).toContain('newPassword');
    expect(errors.map(e => e.property)).toContain('confirmPassword');
  });

  it('应该处理空字符串值', async () => {
    // 安排
    const changePasswordDto = new ChangePasswordDto();
    changePasswordDto.currentPassword = '';
    changePasswordDto.newPassword = '';
    changePasswordDto.confirmPassword = '';

    // 执行
    const errors = await validate(changePasswordDto);

    // 断言
    expect(errors).toHaveLength(3);
  });

  it('应该处理空格字符串值', async () => {
    // 安排
    const changePasswordDto = new ChangePasswordDto();
    changePasswordDto.currentPassword = '   ';
    changePasswordDto.newPassword = '   ';
    changePasswordDto.confirmPassword = '   ';

    // 执行
    const errors = await validate(changePasswordDto);

    // 断言
    // 空格字符串可能不会触发isNotEmpty验证，但会触发长度验证
    expect(errors.length).toBeGreaterThanOrEqual(1);
  });

  it('应该验证密码长度要求', async () => {
    // 安排 - 使用过短的密码
    const changePasswordDto = new ChangePasswordDto();
    changePasswordDto.currentPassword = 'short';
    changePasswordDto.newPassword = 'short';
    changePasswordDto.confirmPassword = 'short';

    // 执行
    const errors = await validate(changePasswordDto);

    // 断言 - 应该有长度验证错误
    expect(errors.length).toBeGreaterThan(0);
  });
});