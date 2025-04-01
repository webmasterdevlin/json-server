import path from "path";
import fs from "fs";
import * as utils from "../src/utils/utils";
import { Database } from "../src/types";

describe("Utils Functions", () => {
  const testDbPath = path.join(__dirname, "test-db.json");
  const testData = {
    users: [
      { id: "1", name: "John", age: 30 },
      { id: "2", name: "Jane", age: 25 },
    ],
    posts: [
      { id: "1", title: "Post 1", userId: "1" },
      { id: "2", title: "Post 2", userId: "2" },
    ],
  };

  beforeEach(() => {
    // Create a test database file
    fs.writeFileSync(testDbPath, JSON.stringify(testData, null, 2));
  });

  afterEach(() => {
    // Clean up test database file
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  describe("fileExists", () => {
    it("should return true if file exists", () => {
      expect(utils.fileExists(testDbPath)).toBe(true);
    });

    it("should return false if file does not exist", () => {
      expect(utils.fileExists("/not/existing/path.json")).toBe(false);
    });
  });

  describe("loadJsonFile", () => {
    it("should load and parse JSON file correctly", () => {
      const result = utils.loadJsonFile(testDbPath);
      expect(result).toEqual(testData);
    });

    it("should return empty object if file does not exist", () => {
      const result = utils.loadJsonFile("/not/existing/path.json");
      expect(result).toEqual({});
    });
  });

  describe("saveJsonFile", () => {
    it("should save data to JSON file correctly", () => {
      const newData = { test: "data" };
      utils.saveJsonFile(testDbPath, newData);

      const result = JSON.parse(fs.readFileSync(testDbPath, "utf8"));
      expect(result).toEqual(newData);
    });
  });

  describe("generateId", () => {
    it("should generate a unique ID", () => {
      const id1 = utils.generateId();
      const id2 = utils.generateId();

      expect(id1).toBeTruthy();
      expect(id2).toBeTruthy();
      expect(id1).not.toEqual(id2);
    });
  });

  describe("cloneObject", () => {
    it("should create a deep copy of an object", () => {
      const original = { a: 1, b: { c: 2 } };
      const clone = utils.cloneObject(original);

      expect(clone).toEqual(original);
      expect(clone).not.toBe(original);
      expect(clone.b).not.toBe(original.b);
    });
  });

  describe("Resource operations", () => {
    let db: Database;

    beforeEach(() => {
      db = JSON.parse(JSON.stringify(testData));
    });

    describe("getResources", () => {
      it("should return resources for existing collection", () => {
        const resources = utils.getResources(db, "users");
        expect(resources).toEqual(testData.users);
      });

      it("should return empty array for non-existing collection", () => {
        const resources = utils.getResources(db, "nonexistent");
        expect(resources).toEqual([]);
      });
    });

    describe("getResourceById", () => {
      it("should return resource by ID for existing item", () => {
        const resource = utils.getResourceById(db, "users", "1");
        expect(resource).toEqual(testData.users[0]);
      });

      it("should return undefined for non-existing item", () => {
        const resource = utils.getResourceById(db, "users", "999");
        expect(resource).toBeUndefined();
      });

      it("should return undefined for non-existing collection", () => {
        const resource = utils.getResourceById(db, "nonexistent", "1");
        expect(resource).toBeUndefined();
      });
    });

    describe("createResource", () => {
      it("should create resource and return it", () => {
        const newUser = { name: "Bob", age: 40 };
        const result = utils.createResource(db, "users", newUser);

        expect(result.id).toBeTruthy();
        expect(result.name).toBe("Bob");
        expect(result.age).toBe(40);
        expect(db.users.length).toBe(3);
        expect(db.users[2]).toEqual(result);
      });

      it("should create collection if it does not exist", () => {
        const newItem = { name: "Test" };
        const result = utils.createResource(db, "newCollection", newItem);

        expect(result.id).toBeTruthy();
        expect(db.newCollection).toBeDefined();
        expect(db.newCollection.length).toBe(1);
        expect(db.newCollection[0]).toEqual(result);
      });
    });

    describe("updateResource", () => {
      it("should update resource and return it", () => {
        const updatedUser = { name: "John Updated", age: 31 };
        const result = utils.updateResource(db, "users", "1", updatedUser);

        expect(result).toBeDefined();
        expect(result?.id).toBe("1");
        expect(result?.name).toBe("John Updated");
        expect(result?.age).toBe(31);
        expect(db.users[0]).toEqual(result);
      });

      it("should return undefined for non-existing resource", () => {
        const result = utils.updateResource(db, "users", "999", {
          name: "Test",
        });
        expect(result).toBeUndefined();
      });

      it("should return undefined for non-existing collection", () => {
        const result = utils.updateResource(db, "nonexistent", "1", {
          name: "Test",
        });
        expect(result).toBeUndefined();
      });
    });

    describe("deleteResource", () => {
      it("should delete resource and return true", () => {
        const result = utils.deleteResource(db, "users", "1");

        expect(result).toBe(true);
        expect(db.users.length).toBe(1);
        expect(db.users[0].id).toBe("2");
      });

      it("should return false for non-existing resource", () => {
        const result = utils.deleteResource(db, "users", "999");
        expect(result).toBe(false);
        expect(db.users.length).toBe(2);
      });

      it("should return false for non-existing collection", () => {
        const result = utils.deleteResource(db, "nonexistent", "1");
        expect(result).toBe(false);
      });
    });
  });

  describe("parseRoutesFile", () => {
    const routesJsonPath = path.join(__dirname, "test-routes.json");
    const routesJsPath = path.join(__dirname, "test-routes.js");
    const routesConfig = {
      "/api/*": { GET: "/api/$1" },
      "/custom": { GET: "Custom response" },
    };

    beforeEach(() => {
      // Create test routes files
      fs.writeFileSync(routesJsonPath, JSON.stringify(routesConfig, null, 2));
      fs.writeFileSync(
        routesJsPath,
        `module.exports = ${JSON.stringify(routesConfig)}`
      );
    });

    afterEach(() => {
      // Clean up test routes files
      if (fs.existsSync(routesJsonPath)) fs.unlinkSync(routesJsonPath);
      if (fs.existsSync(routesJsPath)) fs.unlinkSync(routesJsPath);
    });

    it("should parse JSON routes file correctly", () => {
      const result = utils.parseRoutesFile(routesJsonPath);
      expect(result).toEqual(routesConfig);
    });

    it("should return empty object for non-existing file", () => {
      const result = utils.parseRoutesFile("/not/existing/routes.json");
      expect(result).toEqual({});
    });
  });
});
