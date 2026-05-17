process.env['DATABASE_URL'] = 'postgresql://test:test@localhost:5432/dogapp_test';
process.env['JWT_SECRET'] = 'test-secret-for-e2e-tests-minimum-32ch';
process.env['JWT_EXPIRY'] = '15m';
process.env['NODE_ENV'] = 'test';
