import { Module } from '@nestjs/common'
import { DrizzleModule } from '../drizzle/drizzle.module'
import { SessionModule } from '../session/session.module'
import { JwtModule } from '../jwt/jwt.module'
import { AuthenticationService } from './authentication.service'
import { AuthenticationController } from './authentication.controller'

@Module({
  imports: [DrizzleModule, SessionModule, JwtModule],
  controllers: [AuthenticationController],
  providers: [AuthenticationService],
})
export class AuthenticationModule {}
