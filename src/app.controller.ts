import { Controller, Get, Param, Post, Sse } from '@nestjs/common';
import { Observable, fromEvent, map, interval, switchMap } from 'rxjs';
import { AppService } from './app.service';
import { UserSessionCache } from './user-session-cache';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Controller()
export class AppController {
  constructor(private userSessionCache: UserSessionCache, private eventEmitter: EventEmitter2) {}

  @Post('join/:userName')
  async join(@Param('userName') userName: string) {
    await this.userSessionCache.addOrUpdate(userName);
    this.eventEmitter.emit('join', userName);
  }

  @Sse('join')
  boardcastJoin(): Observable<MessageEvent> {
    return fromEvent(this.eventEmitter, 'join').pipe(
      switchMap(async(_data) => {
        const activeUsers = await this.userSessionCache.getAllActive();
        return new MessageEvent('new client join', { data: activeUsers.map(x=> x.userName) });
      }),
    );
  }

  @Sse('waitingroom')
   allPatients(): Observable<MessageEvent<any>> {
    return interval(1000).pipe(switchMap( async () => 
    {
      const activeUsers = await this.userSessionCache.getAllActive();
      return {
        data: activeUsers.map(x=> x.userName)
      } as MessageEvent;
    }));
  }
 }
