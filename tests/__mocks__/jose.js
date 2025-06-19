// Mock implementation for jose library
const mockSignJWT = jest.fn().mockImplementation(() => ({
  setProtectedHeader: jest.fn().mockReturnThis(),
  setIssuedAt: jest.fn().mockReturnThis(),
  setExpirationTime: jest.fn().mockReturnThis(),
  sign: jest.fn().mockResolvedValue("mock-jwt-token"),
}));

const mockJwtVerify = jest.fn().mockResolvedValue({
  payload: {
    userId: "test-user-id",
    email: "test@example.com",
    permissions: ["apartments:read"],
    sessionId: "test-session-id",
    fingerprint: "test-fingerprint",
  },
});

module.exports = {
  SignJWT: mockSignJWT,
  jwtVerify: mockJwtVerify,
};
