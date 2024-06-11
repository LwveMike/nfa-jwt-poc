import { NestFactory } from '@nestjs/core'
import { ConfigService } from '@nestjs/config'
import * as cookieParser from 'cookie-parser'
import type { Config } from './modules/configuration/parse-config'
import { AppModule } from './app.module'
import { AuthenticationGuard } from './modules/authentication/authentication.guard'
import { SessionService } from './modules/session/session.service'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.setGlobalPrefix('/api')
  /**
   * @description Express is exposing the ip on the request object
   */
  // @ts-expect-error
  app.set('trust proxy', true)

  app.use(cookieParser())

  const configService = app.get(ConfigService)
  const sessionService = app.get(SessionService)

  app.useGlobalGuards(new AuthenticationGuard(sessionService));
  await app.listen(configService.get<Config['port']>('port')!)
}
bootstrap()
