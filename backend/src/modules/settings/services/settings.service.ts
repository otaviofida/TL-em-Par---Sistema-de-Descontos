import { SettingsRepository } from '../repositories/settings.repository.js';

const ALLOWED_KEYS = ['registrationEnabled', 'whatsappGroupUrl', 'monthlyEconomyValue'] as const;
type SettingKey = (typeof ALLOWED_KEYS)[number];

export class SettingsService {
  constructor(private repo = new SettingsRepository()) {}

  async getPublicSettings() {
    const [registrationEnabled, whatsappGroupUrl, monthlyEconomyValue] = await Promise.all([
      this.repo.getValue('registrationEnabled'),
      this.repo.getValue('whatsappGroupUrl'),
      this.repo.getValue('monthlyEconomyValue'),
    ]);
    return {
      registrationEnabled: registrationEnabled !== 'false',
      whatsappGroupUrl: whatsappGroupUrl ?? null,
      monthlyEconomyValue: monthlyEconomyValue ?? null,
    };
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
