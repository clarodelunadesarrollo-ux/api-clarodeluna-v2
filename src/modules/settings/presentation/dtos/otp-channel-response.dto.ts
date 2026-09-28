export interface OtpChannelResponseProps {
  localNotificationEnabled: boolean;
}

export class OtpChannelResponseDto {
  readonly localNotificationEnabled: boolean;

  constructor(props: OtpChannelResponseProps) {
    this.localNotificationEnabled = props.localNotificationEnabled;
  }
}
