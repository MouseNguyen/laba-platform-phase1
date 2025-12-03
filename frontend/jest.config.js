module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['**/*.pact.spec.ts'],
    transform: {
        '^.+\\.tsx?$': 'ts-jest',
    },
};
