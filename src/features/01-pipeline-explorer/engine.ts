import { getScenario, getAllScenarios, SCENARIOS, type ScenarioDefinition } from "./scenarios";

export { getScenario, getAllScenarios, SCENARIOS, type ScenarioDefinition };

export type EngineStatus = "READY" | "IN_FLIGHT" | "STEPPING" | "HALTED_SUCCESS" | "HALTED_ERROR";
export type Direction = "DOWNSTREAM" | "UPSTREAM";

export interface EngineState {
  status: EngineStatus;
  currentNode: number;
  direction: Direction;
  scenarioId: string;
  haltNode: number;
  isCompleted: boolean;
}

export type EngineEvent = "stateChange" | "nodeActivate" | "complete";
export type EventListener = (...args: unknown[]) => void;

export class PipelineEngine {
  private scenario: ScenarioDefinition;
  private status: EngineStatus = "READY";
  private currentNode = 0;
  private direction: Direction = "DOWNSTREAM";
  private listeners: Map<EngineEvent, Set<EventListener>> = new Map();
  private timer: NodeJS.Timeout | null = null;
  private hopDelayMs = 600;

  constructor(options: { scenarioId?: string; hopDelayMs?: number } = {}) {
    const id = options.scenarioId || "201-created";
    this.scenario = getScenario(id);
    if (options.hopDelayMs) {
      this.hopDelayMs = options.hopDelayMs;
    }
  }

  public getState(): EngineState {
    return {
      status: this.status,
      currentNode: this.currentNode,
      direction: this.direction,
      scenarioId: this.scenario.id,
      haltNode: this.scenario.haltNode,
      isCompleted: this.status === "HALTED_SUCCESS" || this.status === "HALTED_ERROR"
    };
  }

  public getScenario(): ScenarioDefinition {
    return this.scenario;
  }

  public setScenario(scenarioId: string): void {
    this.scenario = getScenario(scenarioId);
    this.reset();
  }

  public on(event: EngineEvent, listener: EventListener): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);
  }

  public off(event: EngineEvent, listener: EventListener): void {
    const set = this.listeners.get(event);
    if (set) {
      set.delete(listener);
    }
  }

  private emit(event: EngineEvent, ...args: unknown[]): void {
    const set = this.listeners.get(event);
    if (set) {
      for (const fn of set) {
        fn(...args);
      }
    }
  }

  public start(delayMs?: number): void {
    if (this.status === "HALTED_SUCCESS" || this.status === "HALTED_ERROR") {
      this.reset();
    }

    if (delayMs) {
      this.hopDelayMs = delayMs;
    }

    this.stopTimer();
    this.status = "IN_FLIGHT";
    this.emit("stateChange", this.getState());

    this.timer = setInterval(() => {
      this.stepForwardInternal(true);
    }, this.hopDelayMs);
  }

  public pause(): void {
    this.stopTimer();
    if (this.status === "IN_FLIGHT") {
      this.status = "STEPPING";
      this.emit("stateChange", this.getState());
    }
  }

  public reset(): void {
    this.stopTimer();
    this.status = "READY";
    this.currentNode = 0;
    this.direction = "DOWNSTREAM";
    this.emit("stateChange", this.getState());
  }

  public stepForward(): void {
    this.stopTimer();
    this.stepForwardInternal(false);
  }

  private stepForwardInternal(isAuto: boolean): void {
    if (this.status === "HALTED_SUCCESS" || this.status === "HALTED_ERROR") {
      this.stopTimer();
      return;
    }

    if (!isAuto) {
      this.status = "STEPPING";
    }

    if (this.direction === "DOWNSTREAM") {
      if (this.currentNode < this.scenario.haltNode) {
        this.currentNode += 1;
      } else {
        // Reached halt node: turn around upstream
        this.direction = "UPSTREAM";
        this.currentNode -= 1;
      }
    } else {
      // UPSTREAM traversal
      if (this.currentNode > 0) {
        this.currentNode -= 1;
      }
      
      if (this.currentNode === 0) {
        // Completed roundtrip
        this.stopTimer();
        this.status = this.scenario.resultStatus;
        this.emit("stateChange", this.getState());
        this.emit("complete", this.getState());
        return;
      }
    }

    this.emit("stateChange", this.getState());
    this.emit("nodeActivate", this.currentNode, this.direction);
  }

  public stepBackward(): void {
    this.stopTimer();
    if (this.status === "READY") {
      return;
    }

    this.status = "STEPPING";

    if (this.direction === "DOWNSTREAM") {
      if (this.currentNode > 0) {
        this.currentNode -= 1;
        if (this.currentNode === 0) {
          this.status = "READY";
        }
      }
    } else {
      // UPSTREAM traversal moving backward towards halt node
      if (this.currentNode < this.scenario.haltNode) {
        this.currentNode += 1;
        if (this.currentNode === this.scenario.haltNode) {
          this.direction = "DOWNSTREAM";
        }
      }
    }

    this.emit("stateChange", this.getState());
    this.emit("nodeActivate", this.currentNode, this.direction);
  }

  private stopTimer(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}
