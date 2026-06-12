import 'dotenv/config';
import { loadConfig } from './config.js';
import { buildApp } from './app.js';
import { runMigrations } from './db/migrate.js';

const config = loadConfig();
const app = await buildApp(config);

try {
  const applied = await runMigrations(app.pg);
  if (applied.length > 0) {
    app.log.info(`Migraciones aplicadas: ${applied.join(', ')}`);
  }
  await app.listen({ port: config.port, host: config.host });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
