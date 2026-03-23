const auth = require('./middleware/auth');
const admin = require('./middleware/admin');
const jwt = require('jsonwebtoken');
const config = require('./config/config');

// Mock req, res, next
const mockRes = () => {
  const res = {};
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (data) => { res.body = data; return res; };
  return res;
};

// Test Auth Middleware
const testAuth = () => {
  console.log('Testing Auth Middleware...');
  let nextCalled = false;
  const next = () => { nextCalled = true; console.log('Auth: Next called'); };

  // Case 1: No token
  let req = { header: () => null };
  let res = mockRes();
  auth(req, res, next);
  if (res.statusCode === 401) console.log('Pass: No token handled');
  else console.error('Fail: No token handled', res.statusCode);

  // Case 2: Valid token
  const token = jwt.sign({ id: 1, role: 'user' }, config.JWT_SECRET);
  req = { header: (name) => name === 'Authorization' ? `Bearer ${token}` : null };
  res = mockRes();
  nextCalled = false;
  auth(req, res, next);
  if (req.user && req.user.id === 1 && nextCalled) console.log('Pass: Valid token handled');
  else console.error('Fail: Valid token handled');
};

// Test Admin Middleware
const testAdmin = () => {
  console.log('\nTesting Admin Middleware...');
  let nextCalled = false;
  const next = () => { nextCalled = true; console.log('Admin: Next called'); };

  // Case 1: User role
  let req = { user: { role: 'user' } };
  let res = mockRes();
  admin(req, res, next);
  if (res.statusCode === 403) console.log('Pass: User denied admin access');
  else console.error('Fail: User denied admin access', res.statusCode);

  // Case 2: Admin role
  req = { user: { role: 'admin' } };
  res = mockRes();
  nextCalled = false;
  admin(req, res, next);
  if (nextCalled) console.log('Pass: Admin role allowed');
  else console.error('Fail: Admin role allowed');
};

testAuth();
testAdmin();
