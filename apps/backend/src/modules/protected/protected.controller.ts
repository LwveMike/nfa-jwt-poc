import { Controller, Get, UseGuards } from '@nestjs/common'
import { AuthenticationGuard } from '../authentication/authentication.guard'
import { Request as ExpressRequest } from 'express'
import { Req } from '@nestjs/common';
import { SessionService } from '../session/session.service';

@Controller('protected')
export class ProtectedController {
  constructor(
    private readonly sessionService: SessionService,
  ) { }

  // @UseGuards(AuthenticationGuard)
  @Get()
  public getProtected(@Req() req: ExpressRequest) {
    console.log(this.sessionService.meta.get(req))

    return { success: true }
  }
}
