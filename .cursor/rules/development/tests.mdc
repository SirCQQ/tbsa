---
description: 
globs: 
alwaysApply: false
---
# Service Testing Guidelines

## **Test Structure and Organization**

- **File Naming**: Use `serviceName.service.test.ts` format
- **Location**: Place service tests in `tests/services/` directory
- **Mock Location**: Create mocks in separate files for reusability

## **Required Test Coverage**

### **Multi-Tenancy Testing**
- **✅ DO: Test tenant isolation**
  ```typescript
  it("should deny access to building from different administrator", async () => {
    const context = createMockAdministratorContext();
    const differentAdminId = faker.string.uuid();
    const mockBuilding = createMockBuilding(differentAdminId);
    
    const result = await BuildingService.getBuildingById(mockBuilding.id, context);
    
    expect(result.success).toBe(false);
    expect(result.error).toBe("You don't have permission to access this building");
  });
  ```

- **✅ DO: Test role-based access control**
  ```typescript
  it("should deny access for owners", async () => {
    const context = createMockOwnerContext();
    
    const result = await BuildingService.getBuildings(context);
    
    expect(result.success).toBe(false);
    expect(result.error).toBe("Only administrators can access buildings");
  });
  ```

### **CRUD Operations Testing**
- **Create**: Test successful creation, validation errors, permission checks
- **Read**: Test data retrieval, filtering, tenant isolation, not found cases
- **Update**: Test successful updates, permission checks, validation
- **Delete**: Test successful deletion, cascade rules, permission checks

### **Error Handling Testing**
- **Database Errors**: Mock database failures and verify error responses
- **Validation Errors**: Test invalid input data handling
- **Permission Errors**: Test unauthorized access attempts
- **Not Found Errors**: Test non-existent resource handling

## **Mock Data Factories**

### **✅ DO: Create reusable mock factories**
```typescript
// Mock data factories using faker
const createMockAdministratorContext = (): TenantContext => ({
  userId: faker.string.uuid(),
  role: "ADMINISTRATOR",
  administratorId: faker.string.uuid(),
  email: faker.internet.email(),
});

const createMockBuilding = (administratorId: string) => ({
  id: faker.string.uuid(),
  name: faker.company.name(),
  address: faker.location.streetAddress(),
  city: faker.location.city(),
  administratorId,
  // ... other fields
});
```

### **✅ DO: Use faker for realistic test data**
- Use `faker.string.uuid()` for IDs
- Use `faker.internet.email()` for emails
- Use `faker.company.name()` for building names
- Use `faker.location.*` for addresses

## **Service Mocking Patterns**

### **✅ DO: Mock external dependencies**
```typescript
// Mock Prisma
jest.mock("../../src/lib/prisma", () => ({
  prisma: {
    building: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
```

### **✅ DO: Clear mocks between tests**
```typescript
beforeEach(() => {
  jest.clearAllMocks();
});
```

## **Test Categories**

### **Happy Path Tests**
- Test successful operations with valid data
- Test proper data transformation and filtering
- Test correct tenant context usage

### **Edge Case Tests**
- Test missing optional parameters
- Test boundary conditions
- Test empty result sets

### **Security Tests**
- **Tenant Isolation**: Verify users can only access their own data
- **Role Permissions**: Verify role-based access restrictions
- **Data Leakage**: Ensure no cross-tenant data exposure

### **Error Scenario Tests**
- **Invalid Input**: Test validation error handling
- **Database Failures**: Test resilience to database errors
- **Authentication Failures**: Test unauthorized access handling

## **Assertion Patterns**

### **✅ DO: Use specific assertions**
```typescript
// Good - specific assertions
expect(result.success).toBe(true);
expect(result.data).toEqual(expectedData);
expect(mockPrisma.building.findMany).toHaveBeenCalledWith({
  where: { administratorId: context.administratorId },
  include: expect.any(Object),
});

// Bad - generic assertions
expect(result).toBeTruthy();
expect(mockPrisma.building.findMany).toHaveBeenCalled();
```

### **✅ DO: Test both positive and negative cases**
```typescript
// Test success case
expect(result.success).toBe(true);
expect(result.data).toBeDefined();

// Test failure case
expect(result.success).toBe(false);
expect(result.error).toBe("Expected error message");
```

## **Multi-Tenant Test Scenarios**

### **Administrator Tests**
- Can access their own buildings/apartments/readings
- Cannot access other administrators' data
- Can perform CRUD operations on their resources
- Proper filtering by administratorId

### **Owner Tests**
- Can access their own apartments/readings
- Cannot access other owners' data
- Cannot access buildings directly
- Proper filtering by ownerId

### **Cross-Tenant Security Tests**
- Verify data isolation between different administrators
- Verify data isolation between different owners
- Test that administrators cannot access each other's data
- Test that owners cannot access other owners' data

## **Test File Structure**

```typescript
describe("ServiceName", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("methodName", () => {
    it("should handle successful case", async () => {
      // Arrange
      const context = createMockContext();
      const mockData = createMockData();
      
      // Act
      const result = await Service.method(context);
      
      // Assert
      expect(result.success).toBe(true);
    });

    it("should handle error case", async () => {
      // Test error scenarios
    });

    it("should enforce tenant isolation", async () => {
      // Test multi-tenancy
    });
  });
});
```

## **Performance and Integration**

### **✅ DO: Test database query efficiency**
- Verify correct WHERE clauses for tenant filtering
- Check that queries include proper indexes
- Ensure no N+1 query problems

### **✅ DO: Test service integration**
- Test service method calls with proper parameters
- Verify service responses match expected format
- Test error propagation between service layers

## **Common Anti-Patterns**

### **❌ DON'T: Skip tenant isolation tests**
```typescript
// Bad - no tenant verification
it("should get buildings", async () => {
  const result = await BuildingService.getBuildings(context);
  expect(result.success).toBe(true);
});

// Good - includes tenant isolation
it("should get buildings for authorized administrator only", async () => {
  const context = createMockAdministratorContext();
  mockPrisma.building.findMany.mockResolvedValue(mockBuildings);
  
  const result = await BuildingService.getBuildings(context);
  
  expect(mockPrisma.building.findMany).toHaveBeenCalledWith({
    where: { administratorId: context.administratorId },
    // ...
  });
});
```

### **❌ DON'T: Use hardcoded test data**
```typescript
// Bad - hardcoded data
const testUserId = "123-456-789";

// Good - generated data
const testUserId = faker.string.uuid();
```

### **❌ DON'T: Test implementation details**
```typescript
// Bad - testing internal implementation
expect(service.internalMethod).toHaveBeenCalled();

// Good - testing public behavior
expect(result.success).toBe(true);
expect(result.data).toEqual(expectedData);
```

## **Test Maintenance**

- **Update tests when service logic changes**
- **Add tests for new security requirements**
- **Refactor test utilities when patterns emerge**
- **Keep mock data factories up to date with schema changes**
- **Review test coverage regularly for multi-tenant scenarios**
