import { Module } from '@nestjs/common'
import { JwtModule } from '../jwt/jwt.module'
import { SessionService } from './session.service'
import { SessionMiddleware } from './session.middleware'

@Module({
  imports: [JwtModule],
  providers: [SessionService, SessionMiddleware],
  exports: [SessionService, SessionMiddleware],
})
export class SessionModule { }
