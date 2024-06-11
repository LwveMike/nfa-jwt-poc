import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { AuthenticationModule } from './modules/authentication/authentication.module'
import { DrizzleModule } from './modules/drizzle/drizzle.module'
import { ConfigurationModule } from './modules/configuration/configuration.module'
import { ProtectedModule } from './modules/protected/protected.module'
import { SessionMiddleware } from './modules/session/session.middleware'
import { JwtModule } from './modules/jwt/jwt.module'
import { SessionModule } from './modules/session/session.module'

@Module({
  imports: [
    ConfigurationModule,
    DrizzleModule,
    JwtModule,
    SessionModule,
    AuthenticationModule,
    ProtectedModule,
  ],
})
export class AppModule {
  static readonly GLOBAL_PREFIX = '/api'
}
