/**
 * OpenAI配置文件
 * 用于配置AI助手的API密钥和基础URL
 */

module.exports = {
  // API密钥
  api_key: "sk-c72bcb4af3e74c7880c6e832e251caf8",
  
  // 基础URL
  base_url: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  
  // 模型名称
  model: "deepseek-r1",
  
  // 默认参数
  default_params: {
    temperature: 0.7,
    max_tokens: 1000,
    top_p: 0.95,
    frequency_penalty: 0,
    presence_penalty: 0
  }
};