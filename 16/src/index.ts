enum NotificationEmergencyLevel {
  URGENCY,
  SEVERE,
  NORMAL,
  TRIVIAL,
}

class AlertRule {
  getMaxTps(): number {
    return 10;
  }

  getMaxErrorCount(): number {
    return 15;
  }

  getMaxTimeoutTps(): number {
    return 10;
  }
}

class Notification {
  notify(level: NotificationEmergencyLevel, message: string): void {
    if (level == NotificationEmergencyLevel.SEVERE) {
      this.phoneCall(message);
    }
    if (level == NotificationEmergencyLevel.URGENCY) {
      this.wechat(message);
    }
    if (level == NotificationEmergencyLevel.NORMAL) {
      this.imessage(message);
    }
    if (level == NotificationEmergencyLevel.TRIVIAL) {
      this.email(message);
    }
  }
  email(message: string): void {
    console.log("邮件信息");
  }
  imessage(message: string): void {
    console.log("短信信息");
  }
  wechat(message: string): void {
    console.log("微信信息");
  }
  phoneCall(message: string): void {}
}
class ApiStatInfo {
  private requestCount: number = 10;
  private errorCount: number = 5;
  timeoutCount: number = 6;

  private durationOfSeconds: number = 2;

  getRequestCount(): number {
    return this.requestCount;
  }
  getErrorCount(): number {
    return this.errorCount;
  }
  getTimeCount(): number {
    return this.timeoutCount;
  }
  getDurationOfSeconds(): number {
    return this.durationOfSeconds;
  }
}
abstract class AlertHander {
  constructor(
    protected rule: AlertRule,
    protected notification: Notification
  ) {}
  abstract check(apiStatInfo: ApiStatInfo): void;
}

class TpsHander extends AlertHander {
  constructor(rule: AlertRule, notification: Notification) {
    super(rule, notification);
  }

  check(apiStatInfo: ApiStatInfo) {
    const tps =
      apiStatInfo.getRequestCount() / apiStatInfo.getDurationOfSeconds();
    if (tps > this.rule.getMaxTps()) {
      this.notification.notify(NotificationEmergencyLevel.URGENCY, "...");
    }
  }
}

class ErrorHander extends AlertHander {
  constructor(rule: AlertRule, notification: Notification) {
    super(rule, notification);
  }

  check(apiStatInfo: ApiStatInfo) {
    const errors = apiStatInfo.getErrorCount();
    if (errors > this.rule.getMaxTps()) {
      this.notification.notify(NotificationEmergencyLevel.SEVERE, "...");
    }
  }
}

class TimeoutHander extends AlertHander {
  constructor(rule: AlertRule, notification: Notification) {
    super(rule, notification);
  }

  check(apiStatInfo: ApiStatInfo) {
    const timeouts =
      apiStatInfo.getTimeCount() / apiStatInfo.getDurationOfSeconds();
    if (timeouts > this.rule.getMaxTps()) {
      this.notification.notify(NotificationEmergencyLevel.URGENCY, "...");
    }
  }
}

class Alert {
  handlers: AlertHander[] = [];
  constructor() {}
  addHandler(handler: AlertHander): void {
    this.handlers.push(handler);
  }
  public check(apiStatInfo: ApiStatInfo) {
    for (let handler of this.handlers) {
      handler.check(apiStatInfo);
    }
  }
}

class ApiContext {
  private alert!: Alert;
  constructor() {
    this.initialzeBeans();
  }

  initialzeBeans() {
    this.alert = new Alert();
    const alertRule = new AlertRule();
    const notification = new Notification();
    this.alert.addHandler(new TpsHander(alertRule, notification));
    this.alert.addHandler(new ErrorHander(alertRule, notification));
    this.alert.addHandler(new TimeoutHander(alertRule, notification));
  }

  getAlert(): Alert {
    return this.alert;
  }
}

export default {};
