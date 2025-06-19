// Mock for jose library to prevent ES module issues in tests
export const mockJose = {
  jwtVerify: jest.fn().mockResolvedValue({
    payload: {
      userId: "test-user-id",
      email: "test@example.com",
      permissions: ["buildings:read"],
      administratorId: "test-admin-id",
    },
  }),
  SignJWT: jest.fn().mockImplementation(() => ({
    setProtectedHeader: jest.fn().mockReturnThis(),
    setIssuedAt: jest.fn().mockReturnThis(),
    setExpirationTime: jest.fn().mockReturnThis(),
    sign: jest.fn().mockResolvedValue("mocked-jwt-token"),
  })),
};

// Reset function for cleaning up between tests
export const resetJoseMocks = () => {
  jest.clearAllMocks();
  mockJose.jwtVerify.mockReset();
  mockJose.SignJWT.mockClear();
};
