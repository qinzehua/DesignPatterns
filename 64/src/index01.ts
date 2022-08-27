// 查表法

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

interface transitionMap {
  [key: string]: State;
}

class MarioStateMachine {
  private score: number = 0;
  private currentState: State = State.SMALL;
  private transitionTable!: State[][];
  private scoreTable!: number[][];
  constructor() {
    this.transitionTable = [
      [State.SUPER, State.CAPE, State.FIRE, State.SMALL],
      [State.SUPER, State.CAPE, State.FIRE, State.SMALL],
      [State.CAPE, State.CAPE, State.CAPE, State.SMALL],
      [State.FIRE, State.FIRE, State.FIRE, State.SMALL],
    ];
    this.scoreTable = [
      [100, 200, 300, 0],
      [0, 200, 300, -100],
      [0, 0, 0, -200],
      [0, 0, 0, -300],
    ];
  }
  getScore(): number {
    return this.score;
  }
  getCurrentState(): State {
    return this.currentState;
  }

  obtainMushRoom() {
    this.executeEvent(TransitonEvent.GOT_MUSHROOM);
  }
  obtainCape() {
    this.executeEvent(TransitonEvent.GOT_CAPE);
  }
  obtainFireFlower() {
    this.executeEvent(TransitonEvent.GOT_FIRE);
  }
  meetMonster() {
    this.executeEvent(TransitonEvent.MET_MONSTER);
  }
  executeEvent(event: TransitonEvent) {
    this.currentState = this.transitionTable[this.currentState]![event]!;
    this.score = this.scoreTable[this.currentState]![event]!;
  }
}
