export interface TourMapTextsResponseProps {
  title: string;
  subtitle: string;
  retry: string;
  backTooltip: string;
  refreshTooltip: string;
  close: string;
  emptyTitle: string;
  emptyMessage: string;
  stepLabel: string;
  failureNetwork: string;
  failureSession: string;
  failureServer: string;
}

export class TourMapTextsResponseDto {
  readonly title: string;
  readonly subtitle: string;
  readonly retry: string;
  readonly backTooltip: string;
  readonly refreshTooltip: string;
  readonly close: string;
  readonly emptyTitle: string;
  readonly emptyMessage: string;
  readonly stepLabel: string;
  readonly failureNetwork: string;
  readonly failureSession: string;
  readonly failureServer: string;

  constructor(props: TourMapTextsResponseProps) {
    this.title = props.title;
    this.subtitle = props.subtitle;
    this.retry = props.retry;
    this.backTooltip = props.backTooltip;
    this.refreshTooltip = props.refreshTooltip;
    this.close = props.close;
    this.emptyTitle = props.emptyTitle;
    this.emptyMessage = props.emptyMessage;
    this.stepLabel = props.stepLabel;
    this.failureNetwork = props.failureNetwork;
    this.failureSession = props.failureSession;
    this.failureServer = props.failureServer;
  }
}
