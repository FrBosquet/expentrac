/** @type {import('ts-jest').JestConfigWithTsJest} */

module.exports = {
  testPathIgnorePatterns: ['/node_modules/', '/tests/browser/'],
  moduleNameMapper: {
    '^server-only$': '<rootDir>/tests/server-only.cjs',
    "@types": ["<rootDir>/types.ts"],
    "^@lib/(.*)$": "<rootDir>/lib/$1",
  },
  preset: "ts-jest",
  testEnvironment: "node",
  moduleDirectories: ["node_modules", "<rootDir>"],
};
