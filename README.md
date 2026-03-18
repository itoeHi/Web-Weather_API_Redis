# Weather API with Flask & Redis

一个基于Flask框架和Redis缓存的天气API服务，提供城市天气查询功能，支持缓存机制和速率限制。

## 项目介绍

本项目是一个RESTful天气API服务，主要功能包括：
- 通过Visual Crossing API获取实时天气数据
- 使用Redis实现数据缓存，提高响应速度
- 集成Flask-Limiter进行API速率限制
- 支持测试环境配置

## 项目构成
```plaintext
Project/ 
Flask&Redis/
├── 📄 app.py                    # 主应用文件 (核心业务逻辑)
├── 📄 README.md                 # 项目文档
├── 📁 myvenv/                   # Python虚拟环境 (依赖包目录)
├── 📁 Test/                     # 测试目录
│   └── 📄 test_weather_app.py   # 单元测试文件
├── 📁 Docs/                     # 文档目录
│   └── 📄 requirements.txt      # 项目依赖列表
├── 📁 templates/                # HTML模板目录 (根据README描述)
│   └── 📄 index.html            # 主页模板
└── 📁 static/                   # 静态文件目录
    └── 📄 scripts.js            # 前端脚本文件
    └── 📄 styles.css            # 前端样式表文件
```


### 核心功能

- **天气查询API**: `GET /weather?city={city_name}`
- **缓存机制**: 使用Redis缓存天气数据，默认过期时间12小时
- **速率限制**: 默认每分钟5次请求（测试环境禁用）
- **错误处理**: 完善的错误处理和异常捕获

## 快速开始

### 环境要求

- Python 3.8+
- Redis服务器
- Visual Crossing API密钥

### 安装依赖

```bash
pip install -r requirements.txt
```

### 配置环境变量

创建 `.env` 文件并配置以下变量：

```env
# Redis配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0
REDIS_PASSWORD=your_redis_password

# Visual Crossing API配置
VISUAL_CROSSING_API_KEY=your_api_key
VISUAL_CROSSING_BASE_URL=https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/

# 应用配置
RATELIMIT_DEFAULT=5 per minute
CACHE_EXPIRE_SECONDS=43200
TESTING=False
```

### 启动应用

```bash
python app.py
```

应用将在 `http://localhost:5000` 启动。

### 运行测试

```bash
python -m Test.test_weather_app.py
```

## API使用说明

### 查询天气

**请求示例:**
```bash
GET /weather?city=beijing
```

**成功响应:**
```json
{
    "source": "api",
    "data": {
        "address": "Beijing,China",
        "days": [
            {
                "datetime": "2024-01-01",
                "tempmax": 5,
                "tempmin": -5,
                "temp": 0,
                "conditions": "Partially cloudy"
            }
        ]
    }
}
```

**错误响应:**
```json
{
    "error": "Invalid city name"
}
```

## 项目特性

### 🚀 高性能
- Redis缓存机制，减少API调用次数
- 异步请求处理，提高并发能力

### 🔒 安全性
- API速率限制，防止滥用
- 环境变量管理，保护敏感信息

### 🧪 可测试性
- 支持测试环境配置
- 完整的单元测试覆盖

### 📊 监控
- 详细的日志记录
- 缓存命中率统计

## 技术栈

- **后端框架**: Flask
- **缓存**: Redis
- **API服务**: Visual Crossing Weather API
- **速率限制**: Flask-Limiter
- **环境管理**: python-dotenv

## 项目贡献

欢迎提交Issue和Pull Request来改进这个项目！

**主要贡献者:**
- iteoHi (daiyilin1425251132@qq.com)

## 许可证

本项目基于MIT许可证开源 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 相关资源

- [Visual Crossing Weather API文档](https://www.visualcrossing.com/weather-api)
- [Flask官方文档](https://flask.palletsprojects.com/)
- [Redis官方文档](https://redis.io/documentation)
- [Roadmap](https://roadmap.sh/projects/weather-api-wrapper-service)