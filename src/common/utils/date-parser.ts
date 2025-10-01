/**
 * 解析日期字符串，支持两种格式：
 * 1. 仅日期格式：2025-10-01
 * 2. 包含时间格式：2025-10-01 00:00:00
 *
 * @param dateString 日期字符串
 * @returns Date对象或null（如果解析失败）
 */
export function parseDateString(dateString: string): Date | null {
  if (!dateString) {
    return null;
  }

  // 检查是否为仅日期格式 (YYYY-MM-DD)
  const dateOnlyRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (dateOnlyRegex.test(dateString)) {
    // 对于仅日期格式，添加时间部分为 00:00:00
    dateString += ' 00:00:00';
  }

  // 检查是否为包含时间的格式 (YYYY-MM-DD HH:mm:ss)
  const dateTimeRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
  if (dateTimeRegex.test(dateString)) {
    const date = new Date(dateString);
    // 检查日期是否有效
    if (!isNaN(date.getTime())) {
      return date;
    }
  }

  // 如果都不匹配，返回null
  return null;
}

/**
 * 转换日期字符串的辅助函数，用于class-transformer
 *
 * @param options 转换选项
 * @returns Date对象或null
 */
export function transformDateString(options: { value: unknown }): Date | null {
  const { value } = options;

  if (typeof value !== 'string') {
    return null;
  }

  return parseDateString(value);
}
