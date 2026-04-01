export const Constants = {
  SETTINGS: "Settings",
  PARTICIPANTS: "Participants",
  SOLUTION: "Solution",
  HISTORY: "HistoryData",
  DISTANCES: "Distances",

  SETTING_NUMBER_OF_PRO: "Number of pro participants",
  SETTING_NUMBER_OF_ASSIGNMENTS_FOR_A_PRO:
    "Number of assignments per pro participant",
  SETTING_NUMBER_OF_NON_PRO: "Number of non pro participants",
  SETTING_NUMBER_OF_ASSIGNMENTS_FOR_A_NON_PRO:
    "Number of assignments per non pro participant",
  SETTING_NUMBER_OF_EXTERNAL: "Number of external participants",
  SETTING_NUMBER_OF_ASSIGNMENTS_FOR_AN_EXTERNAL:
    "Number of assignments per external participant",
  SETTING_NUMBER_OF_ROTATIONS_TO_REINSPECT:
    "Number of rotations to re-inspect a participant",
  SETTING_NUMBER_OF_INSPECTORS_FOLLOWING_UP:
    "Number of inspectors following up",
  SETTING_TRAVELLING_DISTANCE_RANGE: "Travelling distance range",
  SETTING_COMMITTEE_MEETING_SIZE: "Committee meeting size",
  SETTING_USE_AVAILABILITY: "Use availability",
  SETTINGS_SHUFFLE_PARTICIPANTS: "Shuffle participants",

  PARTICIPANT_NAME: "Name",
  PARTICIPANT_TYPE: "Type",
  PARTICIPANT_LOCATION: "Location",
  PARTICIPANT_SKILLS: "Skills",
  PARTICIPANT_AVAILABILITY: "Availability",
  PARTICIPANT_REQUIRED_SKILLS: "Required skills",
  PARTICIPANT_NEEDS_EVALUATION: "Needs evaluation",
  PARTICIPANT_VETOES: "Vetoes",
  PARTICIPANT_MAX_NUMBER_OF_INSPECTIONS: "Max number of inspections",

  SOLUTION_EVALUATED_PERSON: "Evaluated Person",
  SOLUTION_TIMESLOT: "Timeslot",
  SOLUTION_ASSIGNMENTS: "Assignments",
};

const sheetsNames = [
  Constants.SETTINGS,
  Constants.PARTICIPANTS,
  Constants.SOLUTION,
  Constants.HISTORY,
  Constants.DISTANCES,
];

export const solutionHeaders = [
  Constants.SOLUTION_EVALUATED_PERSON,
  Constants.SOLUTION_TIMESLOT,
  Constants.SOLUTION_ASSIGNMENTS,
];

export const participantsColumns = [
  Constants.PARTICIPANT_NAME,
  Constants.PARTICIPANT_TYPE,
  Constants.PARTICIPANT_LOCATION,
  Constants.PARTICIPANT_SKILLS,
  Constants.PARTICIPANT_AVAILABILITY,
  Constants.PARTICIPANT_REQUIRED_SKILLS,
  Constants.PARTICIPANT_NEEDS_EVALUATION,
  Constants.PARTICIPANT_VETOES,
  Constants.PARTICIPANT_MAX_NUMBER_OF_INSPECTIONS,
];

export interface ValidationResult {
  hasError(): boolean;
  getMessage(): string;
}

class SheetsValidationError implements ValidationResult {
  private hasMissingSheets: boolean = false;
  constructor(public missingSheets: Array<string>) {
    if (missingSheets.length) {
      this.hasMissingSheets = true;
    }
  }

  hasError(): boolean {
    return this.hasMissingSheets;
  }

  getMessage(): string {
    const missing = this.missingSheets.join(", ");
    return `Missing sheets: ${missing}`;
  }
}

export abstract class Validators {
  public static validateSheetsNames(
    names: Array<string>
  ): SheetsValidationError {
    const missingSheets = new Array<string>();
    sheetsNames.forEach((n) => {
      if (!names.includes(n)) {
        missingSheets.push(n);
      }
    });
    return new SheetsValidationError(missingSheets);
  }
}
