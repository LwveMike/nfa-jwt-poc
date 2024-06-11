import type { CanActivate, ExecutionContext } from '@nestjs/common'
import { Injectable, Logger } from '@nestjs/common'
import type { Observable } from 'rxjs'
import { z } from 'zod'
import { Request as ExpressRequest } from 'express'
import set from 'lodash.set'
import { SessionService } from '../session/session.service'
import { JwtService, ParsedServices } from '../jwt/jwt.service'

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
type Permission = 'read' | 'change' | 'delete'

function findNeededPermission(method: Method): Permission[] {
  if (method === 'GET') {
    return ['read', 'change']
  }

  if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
    return ['change']
  }

  if (method === 'DELETE') {
    return ['delete']
  }

  throw new Error(`Unknown method: ${method}`)
}

@Injectable()
export class AuthenticationGuard implements CanActivate {
  readonly #logger = new Logger(AuthenticationGuard.name)
  constructor(
    private readonly sessionService: SessionService,
  ) { }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<ExpressRequest>()

    // TODO(lwvemike): handle this properly
    if (request.url === '/api/sign-in' || request.url === '/api/sign-up') {
      return true
    }

    const meta = this.sessionService.getMeta(request)

    if (meta === null) {
      this.#logger.warn('No metafound')

      return false
    }

    this.#logger.log(meta.services)

    console.log(request.url)
    const lookupServices = request.url
      .split('/')
      .filter(value => value !== '')

    const permissionNeeded = findNeededPermission(request.method as Method)

    function lookup(paths: string[], services: ParsedServices) {
      let lastPath: null | string = null

      for (let i = 0; i < paths.length; i += 1) {
        const path = paths[i]

        if (path in services) {
          if (paths.length === i + 1) {
            return services[path].permissions
          }

          lastPath = path
          lookup(paths.slice(i + 1), services[path])
          continue
        }

        if (lastPath === null) {
          return null
        }

        return services[lastPath].permissions
      }
    }

    const res = lookup(lookupServices, meta.services as ParsedServices)

    if (!res) {
      this.#logger.warn('No permissions found')

      return false
    }

    return permissionNeeded.some(permission => res.includes(permission))
  }
}
