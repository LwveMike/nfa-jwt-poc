import type { CanActivate, ExecutionContext } from '@nestjs/common'
import { Injectable, Logger } from '@nestjs/common'
import type { Observable } from 'rxjs'
import { z } from 'zod'
import { SessionService } from '../session/session.service'
import { JwtService } from '../jwt/jwt.service'

@Injectable()
export class AuthenticationGuard implements CanActivate {
  readonly #logger = new Logger(AuthenticationGuard.name)
  constructor(
    private readonly sessionService: SessionService,
  ) { }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest()

    const result = z.string().safeParse(request.cookies?.[JwtService.ACCESS_TOKEN_NAME])

    if (result.success === false) {
      this.#logger.error('No token found in request')
      return false
    }

    const { data: token } = result

    return this.sessionService.tieSession(token)
  }
}
