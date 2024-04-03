/** @type {import('ts-jest').JestConfigWithTsJest} */

module.exports = {
  moduleNameMapper: {
    "@types": [
      "<rootDir>/types.ts"
    ],
    "@lib/(.*)": [
      "<rootDir>/lib/$1.ts"
    ]
  },
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleDirectories: ["node_modules", "<rootDir>"]
};