// 状态模式

enum State {
  SMALL = 0,
  SUPER,
  CAPE,
  FIRE,
}

enum TransitonEvent {
  GOT_MUSHROOM = 0,
  GOT_CAPE,
  GOT_FIRE,
  MET_MONSTER,
}

interface IMario {
  getName(): State;
  obtainMushRoom(): void;
  obtainCape(): void;
  obtainFireFlower(): void;
  meetMonster(): void;
}

interface transitionMap {
  [key: string]: State;
}

class SmallMario implements IMario {
  constructor(private stateMachine: MarioStateMachine) {}
  getName(): State {
    return State.SMALL;
  }
  obtainMushRoom() {
    this.stateMachine.setCurrentState(new SuperMario(this.stateMachine));
    this.stateMachine.setScore(this.stateMachine.getScore() + 100);
  }
  obtainCape() {
    this.stateMachine.setCurrentState(new CapeMario(this.stateMachine));
    this.stateMachine.setScore(this.stateMachine.getScore() + 200);
  }
  obtainFireFlower() {
    this.stateMachine.setCurrentState(new FireMario(this.stateMachine));
    this.stateMachine.setScore(this.stateMachine.getScore() + 300);
  }
  meetMonster() {}
}

class SuperMario implements IMario {
  constructor(private stateMachine: MarioStateMachine) {}
  getName(): State {
    return State.SUPER;
  }
  obtainMushRoom() {}
  obtainCape() {
    this.stateMachine.setCurrentState(new CapeMario(this.stateMachine));
    this.stateMachine.setScore(this.stateMachine.getScore() + 200);
  }
  obtainFireFlower() {
    this.stateMachine.setCurrentState(new FireMario(this.stateMachine));
    this.stateMachine.setScore(this.stateMachine.getScore() + 300);
  }
  meetMonster() {
    this.stateMachine.setCurrentState(new SmallMario(this.stateMachine));
    this.stateMachine.setScore(this.stateMachine.getScore() - 100);
  }
}

class CapeMario implements IMario {
  constructor(private stateMachine: MarioStateMachine) {}
  getName(): State {
    return State.CAPE;
  }
  obtainMushRoom() {}
  obtainCape() {}
  obtainFireFlower() {}
  meetMonster() {
    this.stateMachine.setCurrentState(new SmallMario(this.stateMachine));
    this.stateMachine.setScore(this.stateMachine.getScore() - 200);
  }
}

class FireMario implements IMario {
  constructor(private stateMachine: MarioStateMachine) {}
  getName(): State {
    return State.FIRE;
  }
  obtainMushRoom() {}
  obtainCape() {}
  obtainFireFlower() {}
  meetMonster() {
    this.stateMachine.setCurrentState(new SmallMario(this.stateMachine));
    this.stateMachine.setScore(this.stateMachine.getScore() - 300);
  }
}

class MarioStateMachine {
  private score: number = 0;
  private currentState!: IMario;
  constructor() {
    this.currentState = new SmallMario(this);
  }
  getScore(): number {
    return this.score;
  }

  getCurrentState(): State {
    return this.currentState.getName();
  }

  setCurrentState(state: IMario) {
    this.currentState = state;
  }

  setScore(score: number) {
    this.score = score;
  }

  obtainMushRoom() {
    this.currentState.obtainMushRoom();
  }
  obtainCape() {
    this.currentState.obtainCape();
  }
  obtainFireFlower() {
    this.currentState.obtainFireFlower();
  }
  meetMonster() {
    this.currentState.meetMonster();
  }
}

export default {};
