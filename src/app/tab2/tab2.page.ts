import { Component } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tab2',
  templateUrl: './tab2.page.html',
  styleUrls: ['./tab2.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule]
})
export class Tab2Page {
  darkMode = false;
  notificationsEnabled = false;
  unit = 'metric';

  constructor(private router: Router) {}

  async ionViewWillEnter() {
    const darkMode = await Preferences.get({ key: 'darkMode' });
    this.darkMode = darkMode.value === 'true';
  
    const notifications = await Preferences.get({ key: 'notifications' });
    this.notificationsEnabled = notifications.value === 'true' ? true : false;
  
    const unitPref = await Preferences.get({ key: 'unit' });
    this.unit = unitPref.value || 'metric';
  
    console.log("Loaded preferences:", {
      darkMode: this.darkMode,
      notificationsEnabled: this.notificationsEnabled,
      unit: this.unit
    });
  }

  async toggleDarkMode() {
    this.darkMode = !this.darkMode;
    document.body.classList.toggle('dark', this.darkMode);
    await Preferences.set({ key: 'darkMode', value: this.darkMode.toString() });

    window.dispatchEvent(new Event('darkModeChanged'));
  }

  async toggleNotifications() {
    this.notificationsEnabled = !this.notificationsEnabled;
    await Preferences.set({ key: 'notifications', value: this.notificationsEnabled.toString() });
  
    const storedValue = await Preferences.get({ key: 'notifications' });
    console.log("Notifications saved:", storedValue.value);
  }

  async setUnit(unit: string) {
    this.unit = unit;
    await Preferences.set({ key: 'unit', value: unit });

    window.dispatchEvent(new Event('unitChanged'));
  }

  goToHome() {
    this.router.navigate(['/tab1']);
  }
}
