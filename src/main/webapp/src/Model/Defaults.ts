import { DistanceMatrix, Range, Settings } from "../api";
import { CommitteeSet } from "./CommitteeSet";
import { SettingsState } from "./SettingsState";
import { Solution } from "./Solution";

export const DEFAULT_SETTINGS = {
  nbProParticipants: 2,
  nbNonProParticipants: 1,
  nbExternalParticipants: 0,
  numberOfAssignments: { value: [1, 5] } as Range,
} as Settings;

export const DEFAULT_SETTINGS_STATE = {
  nbProParticipants: [2, 2],
  numberOfAssignmentsForAProfessional: [0, 5],
  nbNonProParticipants: [1, 1],
  numberOfAssignmentsForANonProfessional: [0, 5],
  nbExternalParticipants: [0, 0],
  numberOfAssignmentsForAnExternal: [0, 5],
  nbRotationsToReinspect: 3,
  nbInspectorsFollowingUp: 0,
  travellingDistanceRange: [0, 100],
  committeeMeetingSize: [0, 10],
  useAvailability: true,
  shuffleParticipants: false,
} as SettingsState;

export const UNDEFINED_SOLUTION = new Solution(
  [],
  new CommitteeSet(),
  "NOT_STARTED",
  "",
  ""
);

export const NO_DISTANCES = {
  locations: [],
  distances: [],
} as DistanceMatrix;
