import { BuildingScenario, Room } from '../types';
import { storageService } from './storage.service';

class ScenarioService {
  public getScenarios(): BuildingScenario[] {
    return storageService.getScenarios();
  }

  public getScenarioById(id: string): BuildingScenario | null {
    const list = storageService.getScenarios();
    return list.find((s) => s.id === id) || null;
  }

  public saveScenario(updated: BuildingScenario): BuildingScenario {
    const list = storageService.getScenarios();
    const idx = list.findIndex((s) => s.id === updated.id);
    if (idx >= 0) {
      list[idx] = updated;
    } else {
      list.push(updated);
    }
    storageService.saveScenarios(list);
    return updated;
  }

  public updateRoom(scenarioId: string, updatedRoom: Room): BuildingScenario | null {
    const scenario = this.getScenarioById(scenarioId);
    if (!scenario) return null;

    const idx = scenario.rooms.findIndex((r) => r.id === updatedRoom.id);
    if (idx >= 0) {
      scenario.rooms[idx] = updatedRoom;
      return this.saveScenario(scenario);
    }
    return null;
  }

  public addRoom(scenarioId: string, newRoom: Room): BuildingScenario | null {
    const scenario = this.getScenarioById(scenarioId);
    if (!scenario) return null;

    scenario.rooms.push(newRoom);
    return this.saveScenario(scenario);
  }

  public deleteRoom(scenarioId: string, roomId: string): BuildingScenario | null {
    const scenario = this.getScenarioById(scenarioId);
    if (!scenario) return null;

    scenario.rooms = scenario.rooms.filter((r) => r.id !== roomId);
    return this.saveScenario(scenario);
  }
}

export const scenarioService = new ScenarioService();
