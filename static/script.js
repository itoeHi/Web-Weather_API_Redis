document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('weather-form');
    const cityInput = document.getElementById('city-input');
    const loading = document.getElementById('loading');
    const weatherResult = document.getElementById('weather-result');
    const errorMessage = document.getElementById('error-message');
    const cacheStatus = document.getElementById('cache-status');
    const currentWeather = document.getElementById('current-weather');
    const dailyWeather = document.getElementById('daily-weather');
    const hourlyWeather = document.getElementById('hourly-weather');

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const city = cityInput.value.trim();
        if (!city) return;

        hideAllSections();
        loading.classList.remove('hidden');

        try {
            const response = await fetch(`/weather?city=${encodeURIComponent(city)}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || '获取天气数据失败');
            }

            displayWeatherData(data);
        } catch (error) {
            showError(error.message);
        } finally {
            loading.classList.add('hidden');
        }
    });

    function hideAllSections() {
        weatherResult.classList.add('hidden');
        errorMessage.classList.add('hidden');
    }

    function displayWeatherData(data) {
        cacheStatus.textContent = `数据来源: ${data.source === 'cache' ? 'Redis缓存' : 'API实时获取'}`;
        cacheStatus.className = `cache-status ${data.source}`;
        
        displayCurrentWeather(data.data);
        displayDailyWeather(data.data);
        displayHourlyWeather(data.data);
        
        weatherResult.classList.remove('hidden');
    }

    function displayCurrentWeather(weatherData) {
        const current = weatherData.currentConditions;
        
        currentWeather.innerHTML = `
            <div class="temp">${current.temp}°C</div>
            <div class="conditions">${current.conditions}</div>
            <div class="location">${weatherData.address}</div>
            <div class="weather-details">
                <div class="weather-detail">
                    <div>体感温度</div>
                    <div class="value">${current.feelslike}°C</div>
                </div>
                <div class="weather-detail">
                    <div>湿度</div>
                    <div class="value">${current.humidity}%</div>
                </div>
                <div class="weather-detail">
                    <div>风速</div>
                    <div class="value">${current.windspeed} km/h</div>
                </div>
                <div class="weather-detail">
                    <div>气压</div>
                    <div class="value">${current.pressure} hPa</div>
                </div>
                <div class="weather-detail">
                    <div>能见度</div>
                    <div class="value">${current.visibility} km</div>
                </div>
                <div class="weather-detail">
                    <div>紫外线指数</div>
                    <div class="value">${current.uvindex}</div>
                </div>
            </div>
        `;
    }

    function displayDailyWeather(weatherData) {
        if (!weatherData.days || weatherData.days.length === 0) return;
        
        const today = weatherData.days[0];
        dailyWeather.innerHTML = `
            <h3>今日天气详情</h3>
            <div class="weather-cards">
                <div class="weather-card">
                    <h4>最高温度</h4>
                    <div class="value">${today.feelslikemax || today.temp}°C</div>
                </div>
                <div class="weather-card">
                    <h4>最低温度</h4>
                    <div class="value">${today.feelslikemin || today.temp}°C</div>
                </div>
                <div class="weather-card">
                    <h4>云量</h4>
                    <div class="value">${today.cloudcover}%</div>
                </div>
                <div class="weather-card">
                    <h4>降水概率</h4>
                    <div class="value">${today.precipprob}%</div>
                </div>
            </div>
        `;
    }

    function displayHourlyWeather(weatherData) {
        if (!weatherData.days || !weatherData.days[0].hours) return;
        
        const hours = weatherData.days[0].hours.slice(0, 12);
        const hourlyHTML = hours.map(hour => `
            <div class="weather-card">
                <h4>${hour.datetime}</h4>
                <div class="value">${hour.temp}°C</div>
                <div>${hour.conditions}</div>
                <small>湿度: ${hour.humidity}% | 风速: ${hour.windspeed} km/h</small>
            </div>
        `).join('');
        
        hourlyWeather.innerHTML = `
            <h3>未来12小时预报</h3>
            <div class="weather-cards">${hourlyHTML}</div>
        `;
    }

    function showError(message) {
        errorMessage.innerHTML = `
            <h3>错误</h3>
            <p>${message}</p>
        `;
        errorMessage.classList.remove('hidden');
    }
});