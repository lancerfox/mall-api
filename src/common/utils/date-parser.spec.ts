import { parseDateString, transformDateString } from './date-parser';

describe('date-parser', () => {
  describe('parseDateString', () => {
    it('should parse date only format correctly', () => {
      const result = parseDateString('2025-10-01');
      expect(result).toBeInstanceOf(Date);
      expect(result?.getFullYear()).toBe(2025);
      expect(result?.getMonth()).toBe(9); // 月份从0开始计数
      expect(result?.getDate()).toBe(1);
      expect(result?.getHours()).toBe(0);
      expect(result?.getMinutes()).toBe(0);
      expect(result?.getSeconds()).toBe(0);
    });

    it('should parse datetime format correctly', () => {
      const result = parseDateString('2025-10-01 12:30:45');
      expect(result).toBeInstanceOf(Date);
      expect(result?.getFullYear()).toBe(2025);
      expect(result?.getMonth()).toBe(9);
      expect(result?.getDate()).toBe(1);
      expect(result?.getHours()).toBe(12);
      expect(result?.getMinutes()).toBe(30);
      expect(result?.getSeconds()).toBe(45);
    });

    it('should return null for invalid date format', () => {
      const result = parseDateString('invalid-date');
      expect(result).toBeNull();
    });

    it('should return null for empty string', () => {
      const result = parseDateString('');
      expect(result).toBeNull();
    });

    it('should return null for null input', () => {
      const result = parseDateString(null as unknown as string);
      expect(result).toBeNull();
    });
  });

  describe('transformDateString', () => {
    it('should transform valid date string', () => {
      const result = transformDateString({ value: '2025-10-01' });
      expect(result).toBeInstanceOf(Date);
      expect(result?.getFullYear()).toBe(2025);
    });

    it('should return null for non-string value', () => {
      const result = transformDateString({ value: 123 });
      expect(result).toBeNull();
    });

    it('should return null for invalid date string', () => {
      const result = transformDateString({ value: 'invalid-date' });
      expect(result).toBeNull();
    });
  });
});
