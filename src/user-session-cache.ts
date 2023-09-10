import { Inject, Injectable } from '@nestjs/common';
import * as moment from 'moment';
import { Cache } from 'cache-manager';
import { UserSession } from './user-session';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class UserSessionCache {
  sessions = null;
  key = 'userKey';
  DATE_TIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss';
  expired_time = 60 * 60 * 1000 ;

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {
    this.sessions = [];
  }

  async addOrUpdate(userName: string) {
    let allUserSessions = (await this.cacheManager.get(
      this.key,
    )) as UserSession[];
    let existingSession = allUserSessions?.find((x) => x.userName === userName);

    if (existingSession) {
      existingSession.lastConnectedTime = moment(new Date()).format(
        this.DATE_TIME_FORMAT,
      );
      await this.cacheManager.set(
        this.key,
        allUserSessions,
        this.expired_time ,
      );
    } else {
        this.addNewUserSession(userName, allUserSessions);
    }

  }

  private async addNewUserSession(userName: string, allUserSessions: UserSession[]){
    const allSessions = [...allUserSessions??[], new UserSession(userName)];
    console.log('add sessions', allSessions);
     await this.cacheManager.set(
        this.key,
        allSessions,
        this.expired_time ,
      );
  }

  async get(userName: string) {
    const results = await this.cacheManager.get(this.key);
    return results? (results as UserSession[]).find((x) => x.userName === userName): null;
  }

  async getAllActive() {
    const results =  (await this.cacheManager.get(
        this.key,
      )) as UserSession[];
      console.log('get all active:', results);
    return results?.filter(x => x.IsConnected());
  }

  async remove(userName: string) {
    const results = await this.cacheManager.get(this.key);
    if (results) {
      const updatedSessions = (results as UserSession[]).filter((x) => x.userName !== userName);
      await this.cacheManager.set(this.key, updatedSessions, 
        this.expired_time
      );
    }
  }
}

