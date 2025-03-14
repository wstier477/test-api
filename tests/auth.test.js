const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

// 测试数据
const testUser = {
  username: 'testuser4',
  password: 'password123',
  email: 'test4@example.com',
  role: 'student'
};

let token = '';

// 测试注册接口
async function testRegister() {
  try {
    console.log('测试注册接口...');
    const response = await axios.post(`${API_URL}/auth/register`, testUser);
    console.log('注册成功:', response.data);
    return response.data;
  } catch (error) {
    console.error('注册错误:', error.response ? error.response.data : error.message);
    return null;
  }
}

// 测试登录接口
async function testLogin() {
  try {
    console.log('\n测试登录接口...');
    const response = await axios.post(`${API_URL}/auth/login`, {
      username: testUser.username,
      password: testUser.password
    });
    console.log('登录成功:', response.data);
    token = response.data.data.token;
    return response.data;
  } catch (error) {
    console.error('登录错误:', error.response ? error.response.data : error.message);
    return null;
  }
}

// 测试获取用户信息接口
async function testGetProfile() {
  try {
    console.log('\n测试获取用户信息接口...');
    console.log('使用的令牌:', token);
    
    const response = await axios.get(`${API_URL}/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('获取用户信息成功:', response.data);
    return response.data;
  } catch (error) {
    console.error('获取用户信息错误:', error.response ? error.response.data : error.message);
    if (error.response) {
      console.error('错误状态码:', error.response.status);
      console.error('错误头信息:', error.response.headers);
    }
    return null;
  }
}

// 运行所有测试
async function runTests() {
  console.log('开始测试认证接口...\n');
  
  // 测试注册
  await testRegister();
  
  // 测试登录
  await testLogin();
  
  // 测试获取用户信息
  if (token) {
    await testGetProfile();
  }
  
  console.log('\n测试完成！');
}

// 执行测试
runTests(); 