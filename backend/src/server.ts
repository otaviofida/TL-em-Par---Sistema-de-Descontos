import { app } from './app.js';
import { env } from './config/env.js';
import cron from 'node-cron';
import { MarketingService } from './modules/marketing/services/marketing.service.js';

const marketingService = new MarketingService();

app.listen(env.PORT, () => {
  console.log(`[TL EM PAR] Server running on port ${env.PORT}`);
  console.log(`[TL EM PAR] Environment: ${env.NODE_ENV}`);

  // Cron: a cada minuto verifica pushes agendados
  cron.schedule('* * * * *', async () => {
    try {
      await marketingService.processScheduled();
    } catch (err) {
      console.error('[CRON] Erro ao processar pushes agendados:', err);
    }
  });

  console.log('[TL EM PAR] Marketing push scheduler started');
});
