import os
import json
import redis
import requests
from dotenv import load_dotenv
from flask import Flask, request, jsonify, render_template
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

load_dotenv()

# Redis 客户端配置
redis_password = os.getenv('REDIS_PASSWORD')
redis_client = redis.Redis(
    host = os.getenv('REDIS_HOST', 'localhost'),
    port = int(os.getenv('REDIS_PORT', 6379)),
    db = int(os.getenv('REDIS_DB', 0)),
    password = redis_password,    
    decode_responses=True  # 自动将返回的字节解码为字符串
)


app = Flask(__name__)
# 配置测试环境
app.config['TESTING'] = os.getenv('TESTING', 'False').lower() == 'true'
limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits = [os.getenv('RATELIMIT_DEFAULT', '5 per minute')],
    # 添加测试环境判断，在测试环境下不启用速率限制
    enabled=not app.config.get('TESTING', False)
)

# 添加主页路由
@app.route('/')
def index():
    """主页面"""
    return render_template('index.html')


# 使用 request 调用 Visual Crossing API
def fetch_weather_from_api(city):
    '''调用 Visual Crossing API 获取天气数据'''
    api_key = os.getenv('VISUAL_CROSSING_API_KEY')
    base_url = os.getenv('VISUAL_CROSSING_BASE_URL')

    # Visual Crossing API 的查询格式为：
    # {base_url}/{location}?key={api_key}&unitGroup=metric
    # 只获取当前天气，所以只需 location
    url = f"{base_url}{city}?key={api_key}&unitGroup=metric"

    try:
        response = requests.get(url, timeout=5)
        if response.status_code == 400:
            # 若请求城市不存在或请求错误， Visual Crossing API 会返回 400 错误
            return {'error': 'Invalid city name'}
        response.raise_for_status()
        return response.json()
    except requests.exceptions.Timeout:
        print("API request timed out")
        return None
    except requests.exceptions.RequestException as e:
        print(f"API request failed: {e}")
        return None




@app.route('/weather', methods=['GET'])
@limiter.limit(os.getenv('RATELIMIT_DEFAULT', '5 per minute') if not app.config.get('TESTING', False) else None)
def get_weather():
    city = request.args.get('city')
    if not city:
        return jsonify({'error': 'Missing city parameter'}), 400
    
    cache_key = f"weather:{city.strip().lower()}"

    # 1. 检查缓存
    try:
        if redis_client:
            cache_data = redis_client.get(cache_key)
            # 如果缓存存在且数据有效，直接返回缓存数据
            if cache_data:
                try:
                    # 尝试解析JSON数据
                    cached_weather = json.loads(cache_data)
                    return jsonify({
                        'source': 'cache',
                        'data': cached_weather
                    }), 200
                except json.JSONDecodeError:
                    # 如果JSON解析失败，记录警告并继续
                    print(f"警告: 缓存数据格式错误, 城市：{city}")
    except redis.ConnectionError:
        # Redis连接失败时，跳过缓存检查，继续调用API
        print("警告: Redis连接失败, 跳过缓存检查")
    
    # 2. 调用 API
    weather_data = fetch_weather_from_api(city)
    if weather_data is None:
        return jsonify({'error': 'Weather service is currently unavailable'}), 503
    if isinstance(weather_data, dict) and weather_data.get('error'):
        return jsonify({'error': weather_data['error']}), 400
    
    # 3. 存入缓存
    try:
        if redis_client:
            expire = int(os.getenv('CACHE_EXPIRE_SECONDS', 43200))
            redis_client.setex(cache_key, expire, json.dumps(weather_data))
    except redis.ConnectionError:
        # Redis连接失败时，跳过缓存设置
        print("警告: Redis连接失败,跳过缓存设置")

    # 4. 返回
    return jsonify({
        'source': 'api',
        'data': weather_data
    }), 200

if __name__ == '__main__':
    app.run(debug=True)