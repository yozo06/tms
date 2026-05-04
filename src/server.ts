import app from './app'
import { config } from './core/config'

app.listen(config.server.port, () =>
  console.log(`TMS API running on http://localhost:${config.server.port}`),
)
