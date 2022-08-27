enum State {
  SMALL = 0,
  SUPER,
  FIRE,
  CAPE,
}

class MarioStateMachine {
  private score: number = 0;
  private currentState: State = State.SMALL;
  constructor() {}
  getScore(): number {
    return this.score;
  }
  getCurrentState(): State {
    return this.currentState;
  }

  obtainMushRoom() {
    if (this.currentState === State.SMALL) {
      this.currentState = State.SUPER;
      this.score += 100;
    }
  }
  obtainCape() {
    if (this.currentState == State.SMALL || this.currentState === State.SUPER) {
      this.currentState = State.CAPE;
      this.score += 200;
    }
  }
  obtainFireFlower() {
    if (this.currentState == State.SMALL || this.currentState === State.SUPER) {
      this.currentState = State.FIRE;
      this.score += 300;
    }
  }
  meetMonster() {
    if (this.currentState == State.SUPER) {
      this.currentState = State.SMALL;
      this.score -= 100;
      return;
    }

    if (this.currentState == State.CAPE) {
      this.currentState = State.SMALL;
      this.score -= 200;
      return;
    }

    if (this.currentState == State.FIRE) {
      this.currentState = State.SMALL;
      this.score -= 300;
      return;
    }
  }
}
