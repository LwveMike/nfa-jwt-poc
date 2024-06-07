import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { JwtService } from './jwt.service'

@Module({
  providers: [JwtService],
  exports: [JwtService],
})
export class JwtModule { }
