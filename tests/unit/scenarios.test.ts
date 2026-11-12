import { describe, it, expect } from "vitest";
import { SCENARIOS, getScenario, getAllScenarios, type ScenarioDefinition } from "../../src/features/01-pipeline-explorer/scenarios";

describe("Scenarios Specification & Data Contract", () => {
  it("should define exactly 3 core scenarios: 201, 401, and 504", () => {
    const scenarios = getAllScenarios();
    expect(scenarios.length).toBe(3);

    const ids = scenarios.map((s: ScenarioDefinition) => s.id);
    expect(ids).toContain("201-created");
    expect(ids).toContain("401-unauthorized");
    expect(ids).toContain("504-timeout");
  });

  it("should have valid schema properties on 201-created scenario", () => {
    const s = getScenario("201-created");
    expect(s.id).toBe("201-created");
    expect(s.code).toBe("201");
    expect(s.name).toContain("Created");
    expect(s.haltNode).toBe(4); // Halts at Database node
    expect(s.resultStatus).toBe("HALTED_SUCCESS");
    expect(Object.keys(s.stages).length).toBe(5);
  });

  it("should have valid schema properties on 401-unauthorized scenario", () => {
    const s = getScenario("401-unauthorized");
    expect(s.id).toBe("401-unauthorized");
    expect(s.code).toBe("401");
    expect(s.haltNode).toBe(3); // Halts at Backend App (auth middleware rejection)
    expect(s.resultStatus).toBe("HALTED_ERROR");
    expect(s.stages[3].wireData).toBeDefined();
  });

  it("should have valid schema properties on 504-timeout scenario", () => {
    const s = getScenario("504-timeout");
    expect(s.id).toBe("504-timeout");
    expect(s.code).toBe("504");
    expect(s.haltNode).toBe(4); // Halts at Database (query lock/timeout)
    expect(s.resultStatus).toBe("HALTED_ERROR");
  });

  it("should contain non-empty wire data across all stages for every scenario", () => {
    const scenarios = getAllScenarios();
    for (const scenario of scenarios) {
      for (let i = 0; i < 5; i++) {
        const stage = scenario.stages[i];
        expect(stage).toBeDefined();
        expect(stage.nodeId).toBeTypeOf("string");
        expect(stage.title).toBeTypeOf("string");
        expect(stage.description).toBeTypeOf("string");
        expect(stage.wireData).toBeDefined();
      }
    }
  });

  it("should throw an informative error when requesting an unknown scenario id", () => {
    expect(() => getScenario("unknown-scenario")).toThrowError(/Unknown scenario/i);
  });
});
