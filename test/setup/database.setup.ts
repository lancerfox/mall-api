// Mock database setup for testing
export const connectTestDB = jest.fn().mockResolvedValue(undefined);
export const clearTestDB = jest.fn().mockResolvedValue(undefined);
export const disconnectTestDB = jest.fn().mockResolvedValue(undefined);
export const getDBConnectionState = jest.fn().mockReturnValue(1);
