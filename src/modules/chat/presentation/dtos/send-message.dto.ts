import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

import { MAX_MESSAGE_BODY_LENGTH } from '../../domain/entities/message.entity';

export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(MAX_MESSAGE_BODY_LENGTH)
  readonly body!: string;
}
