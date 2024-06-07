import { NestFactory } from '@nestjs/core'
import { ConfigService } from '@nestjs/config'
import * as cookieParser from 'cookie-parser'
import type { Config } from './modules/configuration/parse-config'
import { AppModule } from './app.module'

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

  await app.listen(configService.get<Config['port']>('port')!)
}
bootstrap()
