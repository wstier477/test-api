/**
 * 格式化响应数据
 * @param {number} code - 状态码
 * @param {string} message - 响应消息
 * @param {*} data - 响应数据
 * @param {Error} [error] - 错误对象（可选）
 * @returns {Object} 格式化后的响应对象
 */
const formatResponse = (code, message, data = null, error = null) => {
  const response = {
    code,
    message,
    data
  };

  if (error && process.env.NODE_ENV !== 'production') {
    response.error = {
      name: error.name,
      message: error.message,
      stack: error.stack
    };
  }

  return response;
};

module.exports = {
  formatResponse
}; 