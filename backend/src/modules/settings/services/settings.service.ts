import { SettingsRepository } from '../repositories/settings.repository.js';

const ALLOWED_KEYS = ['registrationEnabled'] as const;
type SettingKey = (typeof ALLOWED_KEYS)[number];

export class SettingsService {
  constructor(private repo = new SettingsRepository()) {}

  async getPublicSettings() {
    const registrationEnabled = await this.repo.getValue('registrationEnabled');
    return { registrationEnabled: registrationEnabled !== 'false' };
  }

  async getAllSettings() {
    const settings = await this.repo.getAll();
    return Object.fromEntries(settings.map((s) => [s.key, s.value]));
  }

  async updateSettings(data: Partial<Record<SettingKey, string>>) {
    const updates = Object.entries(data).filter(([key]) =>
      ALLOWED_KEYS.includes(key as SettingKey)
    );
    await Promise.all(updates.map(([key, value]) => this.repo.setValue(key, value as string)));
    return this.getAllSettings();
  }
}
