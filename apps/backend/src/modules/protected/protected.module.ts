import { Module } from '@nestjs/common'
import { SessionModule } from '../session/session.module'
import { ProtectedService } from './protected.service'
import { ProtectedController } from './protected.controller'

@Module({
  imports: [SessionModule],
  providers: [ProtectedService],
  controllers: [ProtectedController],
})
export class ProtectedModule { }
