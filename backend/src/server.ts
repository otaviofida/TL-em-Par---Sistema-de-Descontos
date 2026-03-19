import { app } from './app.js';
import { env } from './config/env.js';

app.listen(env.PORT, () => {
  console.log(`[TL EM PAR] Server running on port ${env.PORT}`);
  console.log(`[TL EM PAR] Environment: ${env.NODE_ENV}`);
});
