import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { NotificationService } from './notification.service';


@Module({
    providers: [NotificationService, ConfigService],
})
export class NotificationModule { }
