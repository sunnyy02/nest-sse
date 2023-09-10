import { CacheModule, Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { EventEmitter } from 'stream';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserSessionCache } from './user-session-cache';

@Module({
  imports: [CacheModule.register({isGlobal: true}), EventEmitterModule.forRoot()],
  controllers: [AppController],
  providers: [AppService, UserSessionCache],
})
export class AppModule {}
