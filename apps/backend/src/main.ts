import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigModule, ConfigService} from '@nestjs/config';
import { Config } from './modules/configuration/parse-config';
import { INestApplication } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  /**
   * @description Express is exposing the ip on the request object
   */
  // @ts-expect-error
  app.set('trust proxy', true)

  const configService = app.get(ConfigService);

  await app.listen(configService.get<Config['port']>('port'));
}
bootstrap();
