import { z } from 'zod'
import { BadRequestException, Body, Controller, Get, HttpCode, HttpStatus, Post, Req, Res } from '@nestjs/common'
import type { Request as ExpressRequest, Response as ExpressResponse } from 'express'
import { JwtService } from '../jwt/jwt.service'
import { AuthenticationService } from './authentication.service'

@Controller()
export class AuthenticationController {
  constructor(
    private readonly authenticationService: AuthenticationService,
  ) { }

  /**
   * @description I refused to use class-validator for dto validation, if you want you can use them
   */
  @Post('/sign-up')
  @HttpCode(HttpStatus.OK)
  async signUp(@Body() body: unknown) {
    const schema = z.object({
      username: z.string().min(3).max(64),
      password: z.string().min(8).max(64),
    })

    const result = schema.safeParse(body)

    if (result.success === false) {
      throw new BadRequestException(result.error.issues)
    }

    const { username, password } = result.data

    return await this.authenticationService.signUp(username, password)
  }

  @Post('/sign-in')
  @HttpCode(HttpStatus.OK)
  async signIn(@Body() body: unknown, @Req() req: ExpressRequest, @Res({ passthrough: true }) res: ExpressResponse) {
    const schema = z.object({
      username: z.string().min(3).max(64),
      password: z.string().min(8).max(64),
    })

    const result = schema.safeParse(body)

    if (result.success === false) {
      throw new BadRequestException(result.error.issues)
    }

    const { username, password } = result.data

    return await this.authenticationService.signIn(username, password, req, res)
  }
}
