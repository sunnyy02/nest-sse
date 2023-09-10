import { Controller, Get, Param, Post, Sse } from '@nestjs/common';
import { Observable, fromEvent, map, interval } from 'rxjs';
import { AppService } from './app.service';
import { UserSessionCache } from './user-session-cache';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Controller()
export class AppController {
  constructor(private userSessionCache: UserSessionCache, private eventEmitter: EventEmitter2) {}

  @Post('join/:userName')
  join(@Param('userName') userName: string) {
    this.userSessionCache.addOrUpdate(userName);
  }

  @Sse('join')
  boardcastJoin(): Observable<MessageEvent> {
    return fromEvent(this.eventEmitter, 'join').pipe(
      map((data) => {
        return new MessageEvent('new client join', { data: {userName: data} });
      }),
    );
  }


  @Sse('waitingromm/patients')
  async allPatients(): Promise<Observable<MessageEvent<any>>> {
    const activeUsers = await this.userSessionCache.getAllActive();
    return interval(1000).pipe(map(() => ({data: activeUsers.map(x=> x.userName)} as MessageEvent)));

    // return fromEvent(this.eventEmitter, 'join').pipe(
    //   map((data) => {
    //     return new MessageEvent('new client join', { data: {userName: data} });
    //   }),
    // );
  }
}
