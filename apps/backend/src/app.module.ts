import { Module } from '@nestjs/common';
import { AuthenticationModule } from './modules/authentication/authentication.module';
import { DrizzleModule } from './modules/drizzle/drizzle.module';
import { ConfigurationModule } from './modules/configuration/configuration.module';

@Module({
  imports: [
    ConfigurationModule,
    DrizzleModule,
    AuthenticationModule
  ],
})
export class AppModule {}
