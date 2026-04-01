import { DistanceMatrix, Person, Settings } from "../api";
import { CommitteeSet } from "../Model/CommitteeSet";
import { PersistenceData } from "../Model/PersistenceData";
import { Solution } from "../Model/Solution";
import { SolvedCommittee } from "../Model/SolvedCommittee";
import { read, utils, writeFile } from "xlsx";
import { parseExcelData } from "./ExcelDataParser";
import {
  Constants,
  participantsColumns,
  solutionHeaders,
  ValidationResult,
  Validators,
} from "./ExcelValidation";

export function excelImport(
  file: any,
  callback: (data: PersistenceData) => void,
  error: (validationResult: ValidationResult) => void
) {
  const reader = new FileReader();

  reader.onload = (e) => {
    const ab = e?.target?.result;
    const workbook = read(ab, { type: "binary" });
    const sheetsValidationError = Validators.validateSheetsNames(
      workbook.SheetNames
    );
    if (sheetsValidationError.hasError()) {
      error(sheetsValidationError);
    }
    try {
      callback(parseExcelData(workbook));
    } catch (parseError: any) {
      console.log(parseError);
      error({ hasError: () => true, getMessage: () => parseError.message });
    }
  };

  reader.readAsBinaryString(file);
}

export function excelExport(
  settings: Settings,
  participants: Array<Person>,
  history: Array<CommitteeSet>,
  distanceMatrix: DistanceMatrix,
  committeeSolution: Solution
) {
  // Settings sheet
  const settingsData = [
    [
      Constants.SETTING_NUMBER_OF_PRO,
      settings.nbProParticipants?.value?.[0],
      settings.nbProParticipants?.value?.[1],
    ],
    [
      Constants.SETTING_NUMBER_OF_ASSIGNMENTS_FOR_A_PRO,
      settings.numberOfAssignmentsForAProfessional?.value?.[0],
      settings.numberOfAssignmentsForAProfessional?.value?.[1],
    ],
    [
      Constants.SETTING_NUMBER_OF_NON_PRO,
      settings.nbNonProParticipants?.value?.[0],
      settings.nbNonProParticipants?.value?.[1],
    ],
    [
      Constants.SETTING_NUMBER_OF_ASSIGNMENTS_FOR_A_NON_PRO,
      settings.numberOfAssignmentsForANonProfessional?.value?.[0],
      settings.numberOfAssignmentsForANonProfessional?.value?.[1],
    ],
    [
      Constants.SETTING_NUMBER_OF_EXTERNAL,
      settings.nbExternalParticipants?.value?.[0],
      settings.nbExternalParticipants?.value?.[1],
    ],
    [
      Constants.SETTING_NUMBER_OF_ASSIGNMENTS_FOR_AN_EXTERNAL,
      settings.numberOfAssignmentsForAnExternal?.value?.[0],
      settings.numberOfAssignmentsForAnExternal?.value?.[1],
    ],
    [
      Constants.SETTING_NUMBER_OF_ROTATIONS_TO_REINSPECT,
      settings.nbRotationsToReinspect,
    ],
    [
      Constants.SETTING_NUMBER_OF_INSPECTORS_FOLLOWING_UP,
      settings.nbInspectorsFollowingUp,
    ],
    [
      Constants.SETTING_TRAVELLING_DISTANCE_RANGE,
      settings.travellingDistanceRange?.value?.[0],
      settings.travellingDistanceRange?.value?.[1],
    ],
    [
      Constants.SETTING_COMMITTEE_MEETING_SIZE,
      settings.committeeMeetingSize?.value?.[0],
      settings.committeeMeetingSize?.value?.[1],
    ],
    [
      Constants.SETTING_USE_AVAILABILITY,
      settings.useAvailability ? "true" : "false",
    ],
    [
      Constants.SETTINGS_SHUFFLE_PARTICIPANTS,
      settings.shuffleParticipants ? "true" : "false",
    ],
  ];
  const settingsWorksheet = utils.aoa_to_sheet(settingsData);

  const sanitizeString = (s?: string) => s ?? "";

  const sanitizeNamedArray = (a?: Array<any>): string =>
    a === undefined ? "" : a.map((i: any) => i.name).join(",");

  // Participants sheet
  const participantsData = [participantsColumns];
  participants.forEach((p: Person) =>
    participantsData.push([
      sanitizeString(p.name),
      sanitizeString(p.personType?.name),
      sanitizeString(p.location?.name),
      sanitizeNamedArray(p.skills),
      sanitizeNamedArray(p.availability),
      sanitizeNamedArray(p.requiredSkills),
      p.needsEvaluation ? "true" : "false",
      sanitizeNamedArray(p.vetoes),
      sanitizeString(p.maxNumberOfInspections?.toString()),
    ])
  );
  const participantsWorksheet = utils.aoa_to_sheet(participantsData);

  // Solution sheet
  const solutionsData = [[Constants.SOLUTION, new Date()], solutionHeaders];
  exportCommittees(committeeSolution.committees, solutionsData);
  const solutionWorksheet = utils.aoa_to_sheet(solutionsData);

  // History sheet
  const historyData = new Array<any>();
  history.forEach((committees) => {
    historyData.push([Constants.SOLUTION, `${committees.date}`]);
    historyData.push(solutionHeaders);
    exportCommittees(committees, historyData);
  });
  const historyWorksheet = utils.aoa_to_sheet(historyData);

  // Distances sheet
  const distancesHeaders = [""];
  distanceMatrix.locations?.forEach((l: string) => distancesHeaders.push(l));
  const distancesData = [distancesHeaders];
  distanceMatrix.distances?.forEach((d: Array<number>, index: number) => {
    const line = [distanceMatrix.locations?.[index]] as Array<any>;
    d.forEach((n: number) => line.push(n));
    distancesData.push(line);
  });
  const distancesWorksheet = utils.aoa_to_sheet(distancesData);

  // Saving the workbook
  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, settingsWorksheet, Constants.SETTINGS);
  utils.book_append_sheet(
    workbook,
    participantsWorksheet,
    Constants.PARTICIPANTS
  );
  utils.book_append_sheet(workbook, historyWorksheet, Constants.HISTORY);
  utils.book_append_sheet(workbook, distancesWorksheet, Constants.DISTANCES);
  utils.book_append_sheet(workbook, solutionWorksheet, Constants.SOLUTION);
  writeFile(workbook, "dicoop-export.xlsx");
}

const exportCommittees = (
  committees: CommitteeSet,
  worksheetData: Array<any>
) => {
  committees.getCommittees().forEach((c: SolvedCommittee) => {
    const rowData = [c.evaluatedPerson?.name];
    if (c.getAssignments().length) {
      rowData.push(c.timeSlot?.name);
      c.getAssignments().forEach((a: any) =>
        rowData.push(a.assignedPerson.name)
      );
    }
    worksheetData.push(rowData);
  });
};
