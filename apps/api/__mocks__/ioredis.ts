// Manual mock for ioredis — prevents real Redis connections in tests.
// Status 'ready' lets BullMQ skip the connect-wait cycle.

const mockInstance = {
  status: 'ready',
  options: { host: 'localhost', port: 6379 },
  isCluster: false,
  get: jest.fn().mockResolvedValue(null),
  set: jest.fn().mockResolvedValue('OK'),
  setex: jest.fn().mockResolvedValue('OK'),
  del: jest.fn().mockResolvedValue(1),
  quit: jest.fn().mockResolvedValue('OK'),
  connect: jest.fn().mockResolvedValue(undefined),
  disconnect: jest.fn().mockResolvedValue(undefined),
  on: jest.fn().mockReturnThis(),
  once: jest.fn().mockReturnThis(),
  off: jest.fn().mockReturnThis(),
  removeAllListeners: jest.fn().mockReturnThis(),
  removeListener: jest.fn().mockReturnThis(),
  addListener: jest.fn().mockReturnThis(),
  emit: jest.fn().mockReturnValue(false),
  duplicate: jest.fn(),
  pipeline: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([]) }),
  multi: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([]) }),
  subscribe: jest.fn().mockResolvedValue(0),
  unsubscribe: jest.fn().mockResolvedValue(0),
  psubscribe: jest.fn().mockResolvedValue(0),
  xadd: jest.fn().mockResolvedValue('0-1'),
  xread: jest.fn().mockResolvedValue(null),
  xack: jest.fn().mockResolvedValue(1),
  xlen: jest.fn().mockResolvedValue(0),
};

mockInstance.duplicate.mockReturnValue(mockInstance);

const MockRedis = jest.fn().mockImplementation(() => mockInstance);

module.exports = MockRedis;
module.exports.default = MockRedis;
