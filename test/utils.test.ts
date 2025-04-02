import path from 'path';
import fs from 'fs';
import * as utils from '../src/utils/utils';
import { Database } from '../src/types';

describe('Utils Functions', () => {
  const testDbPath = path.join(__dirname, 'test-db.json');
  const testData = {
    users: [
      { id: '1', name: 'John', age: 30 },
      { id: '2', name: 'Jane', age: 25 },
    ],
  };

  beforeEach((): void => {
    fs.writeFileSync(testDbPath, JSON.stringify(testData, null, 2));
  });

  afterEach((): void => {
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  // Single comprehensive test for file operations
  test('should handle file operations correctly', (): void => {
    // Test loadJsonFile
    const loaded = utils.loadJsonFile(testDbPath);
    expect(loaded).toEqual(testData);

    // Test saveJsonFile
    const newData = { test: 'data' };
    utils.saveJsonFile(testDbPath, newData);
    const result = JSON.parse(fs.readFileSync(testDbPath, 'utf8'));
    expect(result).toEqual(newData);

    // Test fileExists
    expect(utils.fileExists(testDbPath)).toBe(true);
    expect(utils.fileExists('/non/existent/path.json')).toBe(false);
  });

  // Single comprehensive test for CRUD operations
  test('should handle CRUD operations correctly', (): void => {
    const db: Database = JSON.parse(JSON.stringify(testData));

    // Test getResources
    const resources = utils.getResources(db, 'users');
    expect(resources).toEqual(testData.users);

    // Test getResourceById
    const resource = utils.getResourceById(db, 'users', '1');
    expect(resource).toEqual(testData.users[0]);

    // Test createResource
    const newUser = { name: 'Bob', age: 40 };
    const created = utils.createResource(db, 'users', newUser);
    expect(created.id).toBeTruthy();
    expect(created.name).toBe('Bob');
    expect(db.users.length).toBe(3);

    // Test updateResource
    const updatedUser = { name: 'John Updated', age: 31 };
    const updated = utils.updateResource(db, 'users', '1', updatedUser);
    expect(updated?.name).toBe('John Updated');
    expect(db.users[0].name).toBe('John Updated');

    // Test deleteResource
    const deleted = utils.deleteResource(db, 'users', '1');
    expect(deleted).toBe(true);
    expect(db.users.length).toBe(2);
    expect(db.users[0].id).toBe('2');
  });
});
