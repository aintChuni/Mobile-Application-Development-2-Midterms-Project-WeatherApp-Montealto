import { Component, OnInit } from '@angular/core';
import { GeolocationService } from 'services/geolocation.service';
import { WeatherService } from 'services/weather.service';
import { Preferences } from '@capacitor/preferences';
import { Router } from '@angular/router';
import { IonicModule, AlertController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface ForecastItem {
  dt_txt: string;
  main: { temp: number };
  weather: { description: string }[];
}

@Component({
  selector: 'app-tab1',
  templateUrl: './tab1.page.html',
  styleUrls: ['./tab1.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule]
})
export class Tab1Page implements OnInit {
  weatherData: any;
  forecastData: { list: ForecastItem[] } = { list: [] };
  hourlyForecast: ForecastItem[] = [];
  fiveDayForecast: ForecastItem[] = [];
  loading = true;
  unit: string = 'metric';
  manualCity: string = '';
  currentLocation: string = 'Current Location';
  cachedDataUsed = false;

  constructor(
    private geolocationService: GeolocationService,
    private weatherService: WeatherService,
    private router: Router,
    private alertController: AlertController
  ) {}

  async ngOnInit() {
    await this.loadUserPreferences();
    await this.getWeatherAndForecast();

    window.addEventListener('unitChanged', async () => {
      await this.loadUserPreferences();
      await this.getWeatherAndForecast();
    });

    window.addEventListener('darkModeChanged', () => {
      this.applyDarkMode();
    });

    this.applyDarkMode();
  }

  async applyDarkMode() {
    const darkMode = await Preferences.get({ key: 'darkMode' });
    document.body.classList.toggle('dark', darkMode.value === 'true');
  }

  async loadUserPreferences() {
    const unitPref = await Preferences.get({ key: 'unit' });
    this.unit = unitPref.value === 'imperial' ? 'imperial' : 'metric';

    this.getWeatherAndForecast();
  }

  async getWeatherAndForecast() {
    this.loading = true;
    this.cachedDataUsed = false;
  
    if (this.manualCity.trim()) {
      await this.getWeatherByCity();
      this.loading = false;
      return;
    }
  
    const location = await this.geolocationService.getCurrentLocation();
    if (location) {
      this.currentLocation = 'Current Location';
  
      const weatherResult = await this.weatherService.getWeather(location.lat, location.lon, this.unit);
      this.weatherData = weatherResult.data;
      this.cachedDataUsed = weatherResult.cached;
  
      const forecastResult = await this.weatherService.getForecast(location.lat, location.lon, this.unit);
      this.forecastData = { list: forecastResult.data.list || [] };
  
      this.processForecastData();
    }
  
    this.loading = false;
  }  

  async getWeatherByCity() {
    if (!this.manualCity.trim()) {
      await this.showAlert("Invalid Input", "Please enter a valid city name.");
      return;
    }
  
    this.loading = true;
    this.cachedDataUsed = false;
  
    if (!navigator.onLine) {
      await this.showAlert("No Internet", "You're offline. Please check your connection.");
      this.loading = false;
      return;
    }
  
    try {
      console.log(`Fetching weather for city: ${this.manualCity}`);
  
      const weatherResult = await this.weatherService.getWeatherByCity(this.manualCity, this.unit);
      this.weatherData = weatherResult.data;
      this.cachedDataUsed = weatherResult.cached;
  
      const forecastResult = await this.weatherService.getForecastByCity(this.manualCity, this.unit);
      this.forecastData = { list: forecastResult.data.list || [] };
  
      this.processForecastData();
      this.currentLocation = this.manualCity;
  
    } catch (error: any) {
      console.error("Error fetching city weather:", error);
  
      this.weatherData = null;
  
      if (error.message === "City Not Found") {
        await this.showAlert("City Not Found", "Please enter a valid city name.");
      } else {
        await this.showAlert("Error", "An unexpected error occurred. Please try again.");
      }
    }
  
    this.loading = false;
  }
  
  async useCurrentLocation() {
    this.manualCity = '';
    await this.getWeatherAndForecast();
  }

  processForecastData() {
    if (!this.forecastData || !this.forecastData.list) return;

    const now = new Date();

    this.hourlyForecast = this.forecastData.list.filter(forecast => {
      const forecastDate = new Date(forecast.dt_txt);
      const diffHours = (forecastDate.getTime() - now.getTime()) / (1000 * 60 * 60);
      return diffHours >= 0 && diffHours <= 24;
    });

    const dailyForecastMap = new Map();
    this.forecastData.list.forEach(forecast => {
      const date = forecast.dt_txt.split(' ')[0];
      if (!dailyForecastMap.has(date)) {
        dailyForecastMap.set(date, forecast);
      }
    });

    this.fiveDayForecast = Array.from(dailyForecastMap.values()).slice(0, 5);
  }

  async showAlert(header: string, message: string) {
    console.log('Showing alert:', header, message);
  
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
  
    await alert.present();
  }
  
  goToSettings() {
    this.router.navigate(['/tab2']);
  }
}
