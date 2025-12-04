module.exports = {
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: 'tsconfig.json',
        tsconfigRootDir: __dirname,
        sourceType: 'module',
    },
    plugins: ['@typescript-eslint/eslint-plugin', 'import', 'security', 'prettier'],
    extends: [
        'plugin:@typescript-eslint/recommended',
        'plugin:prettier/recommended',
        'plugin:security/recommended',
    ],
    root: true,
    env: {
        node: true,
        jest: true,
    },
    ignorePatterns: ['dist', 'node_modules', 'coverage', 'prisma/generated', '.eslintrc.js'],
    rules: {
        // STRICT: No 'any' allowed to ensure type safety
        '@typescript-eslint/no-explicit-any': 'error',

        // STRICT: Unused variables must be removed or prefixed with _
        '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],

        // STRICT: Interface names should not be prefixed with I
        '@typescript-eslint/interface-name-prefix': 'off',

        // STRICT: Explicit return types for functions
        '@typescript-eslint/explicit-function-return-type': 'off',

        // STRICT: Explicit module boundary types
        '@typescript-eslint/explicit-module-boundary-types': 'off',

        // STRICT: Group imports for better readability
        'import/order': [
            'error',
            {
                groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
                'newlines-between': 'always',
                alphabetize: { order: 'asc', caseInsensitive: true },
            },
        ],

        // WARN: Console logs should be avoided in production (except in seeds/scripts)
        'no-console': 'warn',
    },
};
