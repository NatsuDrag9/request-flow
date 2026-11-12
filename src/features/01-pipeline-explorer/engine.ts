import { getScenario, getAllScenarios, SCENARIOS, type ScenarioDefinition } from "./scenarios";
import type {
  EngineStatus,
  Direction,
  EngineState,
  PipelineEngineOptions,
  EngineEvent,
  EventListener,
} from "./types";

export { getScenario, getAllScenarios, SCENARIOS, type ScenarioDefinition };
export type {
  EngineStatus,
  Direction,
  EngineState,
  PipelineEngineOptions,
  EngineEvent,
  EventListener,
};

export class PipelineEngine {
  private scenario: ScenarioDefinition;
  private status: EngineStatus = "READY";
  private currentNode = 0;
  private direction: Direction = "DOWNSTREAM";
  private listeners: Map<EngineEvent, Set<EventListener>> = new Map();
  private timer: NodeJS.Timeout | null = null;
  private stayDurationMs = 2000; // Dedicated 2.0s stay time at each station node
  private transitionDurationMs = 1000; // Dedicated 1.0s transit time between nodes
  private isTransiting = false;
  private transitionTarget: number | null = null;

  constructor(options: PipelineEngineOptions = {}) {
    const id = options.scenarioId || "201-created";
    this.scenario = getScenario(id);
    if (options.stayDurationMs) {
      this.stayDurationMs = options.stayDurationMs;
    }
    if (options.transitionDurationMs) {
      this.transitionDurationMs = options.transitionDurationMs;
    }
  }

  public getState(): EngineState {
    return {
      status: this.status,
      currentNode: this.currentNode,
      direction: this.direction,
      scenarioId: this.scenario.id,
      haltNode: this.scenario.haltNode,
      isCompleted: this.status === "HALTED_SUCCESS" || this.status === "HALTED_ERROR",
      isTransiting: this.isTransiting,
      transitionTarget: this.transitionTarget
    };
  }

  public getScenario(): ScenarioDefinition {
    return this.scenario;
  }

  public setScenario(scenarioId: string): void {
    this.scenario = getScenario(scenarioId);
    this.reset();
  }

  public setPacing(stayDurationMs: number, transitionDurationMs: number): void {
    this.stayDurationMs = stayDurationMs;
    this.transitionDurationMs = transitionDurationMs;
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

  public start(delayOrOptions?: number | { stayDurationMs?: number; transitionDurationMs?: number }): void {
    if (this.status === "HALTED_SUCCESS" || this.status === "HALTED_ERROR") {
      this.reset();
    }

    if (typeof delayOrOptions === "number") {
      this.stayDurationMs = Math.round(delayOrOptions * 0.65);
      this.transitionDurationMs = Math.round(delayOrOptions * 0.35);
    } else if (delayOrOptions && typeof delayOrOptions === "object") {
      if (delayOrOptions.stayDurationMs) this.stayDurationMs = delayOrOptions.stayDurationMs;
      if (delayOrOptions.transitionDurationMs) this.transitionDurationMs = delayOrOptions.transitionDurationMs;
    }

    this.stopTimer();
    this.status = "IN_FLIGHT";
    this.isTransiting = false;
    this.transitionTarget = null;
    this.emit("stateChange", this.getState());

    this.scheduleNextCycle();
  }

  private scheduleNextCycle(): void {
    if (this.status !== "IN_FLIGHT") return;

    // Phase 1: Stay at current node for stayDurationMs so user can inspect and read telemetry
    this.timer = setTimeout(() => {
      if (this.status !== "IN_FLIGHT") return;

      const next = this.calculateNextNode();
      if (next.isComplete) {
        this.stopTimer();
        this.status = this.scenario.resultStatus;
        this.isTransiting = false;
        this.transitionTarget = null;
        this.emit("stateChange", this.getState());
        this.emit("complete", this.getState());
        return;
      }

      // Phase 2: Enter transit phase between current node and target node
      this.isTransiting = true;
      this.transitionTarget = next.targetNode;
      this.emit("stateChange", this.getState());

      // After transitionDurationMs, packet arrives at target node
      this.timer = setTimeout(() => {
        if (this.status !== "IN_FLIGHT") return;

        this.currentNode = next.targetNode;
        this.direction = next.direction;
        this.isTransiting = false;
        this.transitionTarget = null;
        this.emit("stateChange", this.getState());
        this.emit("nodeActivate", this.currentNode, this.direction);

        // Schedule next stay cycle at the newly arrived station
        this.scheduleNextCycle();
      }, this.transitionDurationMs);

    }, this.stayDurationMs);
  }

  private calculateNextNode(): { targetNode: number; direction: Direction; isComplete: boolean } {
    if (this.direction === "DOWNSTREAM") {
      if (this.currentNode < this.scenario.haltNode) {
        return { targetNode: this.currentNode + 1, direction: "DOWNSTREAM", isComplete: false };
      } else {
        // Reached halt node: turn around upstream
        return { targetNode: this.currentNode - 1, direction: "UPSTREAM", isComplete: false };
      }
    } else {
      // UPSTREAM traversal
      if (this.currentNode > 0) {
        return { targetNode: this.currentNode - 1, direction: "UPSTREAM", isComplete: false };
      } else {
        return { targetNode: 0, direction: "UPSTREAM", isComplete: true };
      }
    }
  }

  public pause(): void {
    this.stopTimer();
    if (this.status === "IN_FLIGHT") {
      this.status = "STEPPING";
      this.isTransiting = false;
      this.transitionTarget = null;
      this.emit("stateChange", this.getState());
    }
  }

  public reset(): void {
    this.stopTimer();
    this.status = "READY";
    this.currentNode = 0;
    this.direction = "DOWNSTREAM";
    this.isTransiting = false;
    this.transitionTarget = null;
    this.emit("stateChange", this.getState());
  }

  public stepForward(): void {
    this.stopTimer();
    this.isTransiting = false;
    this.transitionTarget = null;
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
    this.isTransiting = false;
    this.transitionTarget = null;

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
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}
