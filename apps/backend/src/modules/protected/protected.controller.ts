import { Controller, Get, Logger, Post, Req, UseGuards } from '@nestjs/common'
import { Request as ExpressRequest } from 'express'
import { AuthenticationGuard } from '../authentication/authentication.guard'
import { SessionService } from '../session/session.service'

@Controller()
export class ProtectedController {
  readonly #logger = new Logger(ProtectedController.name)
  constructor(
    private readonly sessionService: SessionService,
  ) { }

  @Get('protected')
  public getProtected(@Req() req: ExpressRequest) {
    this.#logger.log(`${req.method} /protected route`)
    return { success: true }
  }

  @Post('protected')
  public postProtected(@Req() req: ExpressRequest) {
    this.#logger.log(`${req.method} /protected route`)
    return { success: true }
  }

  @Get('books')
  public getBooks(@Req() req: ExpressRequest) {
    this.#logger.log(`${req.method} /books route`)
    return { success: true }
  }

  @Post('books')
  public postBooks(@Req() req: ExpressRequest) {
    this.#logger.log(`${req.method} /books route`)
    return { success: true }
  }

  @Get('books/hello')
  public getBooksHello(@Req() req: ExpressRequest) {
    this.#logger.log(`${req.method} /books/hello route`)
    return { success: true }
  }

  @Post('books/hello')
  public postBooksHello(@Req() req: ExpressRequest) {
    this.#logger.log(`${req.method} /books/hello route`)
    return { success: true }
  }

  @Get('random')
  public getRandom(@Req() req: ExpressRequest) {
    this.#logger.log(`${req.method} /random route`)
    return { success: true }
  }

  @Post('random')
  public postRandom(@Req() req: ExpressRequest) {
    this.#logger.log(`${req.method} /random route`)
    return { success: true }
  }
}
