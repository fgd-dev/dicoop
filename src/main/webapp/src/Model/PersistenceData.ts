import { DistanceMatrix, Person, Settings } from "../api";
import { CommitteeSet } from "./CommitteeSet";
import { DEFAULT_SETTINGS } from "./Defaults";

export class PersistenceData {
  // Defaults values
  public settings: Settings = DEFAULT_SETTINGS;
  public participants: Array<Person> = [];
  public history: Array<CommitteeSet> = [];
  public distanceMatrix: DistanceMatrix = {};
}
