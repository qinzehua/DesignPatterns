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

class Alert {
  constructor(private rule: AlertRule, private notification: Notification) {}
  public check(
    requestCount: number,
    errorCount: number,
    timeoutCount: number,
    durationOfSeconds: number
  ) {
    const tps = requestCount / durationOfSeconds;
    if (tps > this.rule.getMaxTps()) {
      this.notification.notify(NotificationEmergencyLevel.URGENCY, "...");
    }
    if (errorCount > this.rule.getMaxErrorCount()) {
      this.notification.notify(NotificationEmergencyLevel.SEVERE, "...");
    }
    const timeoutTps = timeoutCount / durationOfSeconds;
    if (timeoutTps > this.rule.getMaxTimeoutTps()) {
      this.notification.notify(NotificationEmergencyLevel.URGENCY, "...");
    }
  }
}
export default {};
