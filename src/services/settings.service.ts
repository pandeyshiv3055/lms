import { AppSettings } from '../types';
import { storageService } from './storage.service';
import { defaultSettings } from '../data/seed/settings';

class SettingsService {
  public getSettings(): AppSettings {
    return storageService.getSettings();
  }

  public updateSettings(partial: Partial<AppSettings>): AppSettings {
    const current = this.getSettings();
    const merged: AppSettings = {
      ...current,
      ...partial,
      general: { ...current.general, ...(partial.general || {}) },
      player: { ...current.player, ...(partial.player || {}) },
      assessment: { ...current.assessment, ...(partial.assessment || {}) },
      gamification: { ...current.gamification, ...(partial.gamification || {}) },
    };
    storageService.saveSettings(merged);
    return merged;
  }

  public resetToDefaults(): AppSettings {
    storageService.saveSettings(defaultSettings);
    return defaultSettings;
  }
}

export const settingsService = new SettingsService();
