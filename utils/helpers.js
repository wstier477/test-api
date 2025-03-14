/**
 * 辅助函数
 * 提供通用的辅助功能
 */

/**
 * 格式化响应数据
 * @param {number} code - 状态码
 * @param {string} message - 响应消息
 * @param {*} [data=null] - 响应数据
 * @returns {Object} 格式化后的响应对象
 */
const formatResponse = (code, message, data = null) => {
  return {
    code,
    message,
    data
  };
};

/**
 * 获取分页参数
 * @param {Object} req - 请求对象
 * @param {number} defaultLimit - 默认每页数量
 * @returns {Object} 分页参数对象
 */
const getPagination = (req, defaultLimit = 10) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || defaultLimit;
  const offset = (page - 1) * limit;
  
  return {
    page,
    limit,
    offset
  };
};

/**
 * 格式化分页数据
 * @param {Object} data - 查询结果数据
 * @param {number} page - 当前页码
 * @param {number} limit - 每页数量
 * @returns {Object} 格式化后的分页数据
 */
const formatPagination = (data, page, limit) => {
  return {
    totalItems: data.count,
    items: data.rows,
    currentPage: page,
    totalPages: Math.ceil(data.count / limit)
  };
};

/**
 * 处理排序参数
 * @param {Object} req - 请求对象
 * @param {Array} defaultOrder - 默认排序
 * @returns {Array} - 排序参数
 */
const getOrder = (req, defaultOrder = [['createdAt', 'DESC']]) => {
  const { sort, order } = req.query;
  if (sort && order) {
    return [[sort, order.toUpperCase()]];
  }
  return defaultOrder;
};

/**
 * 过滤对象中的空值
 * @param {Object} obj - 输入对象
 * @returns {Object} - 过滤后的对象
 */
const filterEmptyValues = (obj) => {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      acc[key] = value;
    }
    return acc;
  }, {});
};

module.exports = {
  formatResponse,
  getPagination,
  formatPagination,
  getOrder,
  filterEmptyValues
}; 