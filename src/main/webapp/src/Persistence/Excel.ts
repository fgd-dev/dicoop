import { DistanceMatrix, Person, Settings } from "../api";
import { CommitteeSet } from "../Model/CommitteeSet";
import { PersistenceData } from "../Model/PersistenceData";
import { Solution } from "../Model/Solution";
import { SolvedCommittee } from "../Model/SolvedCommittee";
import ExcelJS from "exceljs";
import { parseExcelData } from "./ExcelDataParser";
import {
  Constants,
  participantsColumns,
  solutionHeaders,
  ValidationResult,
  Validators,
} from "./ExcelValidation";

export async function excelImport(
  file: any,
  callback: (data: PersistenceData) => void,
  error: (validationResult: ValidationResult) => void
) {
  const reader = new FileReader();

  reader.onload = async (e) => {
    const ab = e?.target?.result;
    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(ab as ArrayBuffer);
      const sheetsValidationError = Validators.validateSheetsNames(
        workbook.worksheets.map((ws) => ws.name)
      );
      if (sheetsValidationError.hasError()) {
        error(sheetsValidationError);
      }
      callback(parseExcelData(workbook));
    } catch (parseError: any) {
      console.log(parseError);
      error({ hasError: () => true, getMessage: () => parseError.message });
    }
  };

  reader.readAsArrayBuffer(file);
}

export function excelExport(
  settings: Settings,
  participants: Array<Person>,
  history: Array<CommitteeSet>,
  distanceMatrix: DistanceMatrix,
  committeeSolution: Solution
) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "DICOOP";
  workbook.created = new Date();

  const sanitizeString = (s?: string) => s ?? "";
  const sanitizeNamedArray = (a?: Array<any>): string =>
    a === undefined ? "" : a.map((i: any) => i.name).join(",");

  // Settings sheet
  const settingsSheet = workbook.addWorksheet(Constants.SETTINGS);
  settingsSheet.columns = [
    { header: "Setting", key: "setting" },
    { header: "Value 1", key: "value1" },
    { header: "Value 2", key: "value2" },
  ];
  settingsSheet.addRows([
    { setting: Constants.SETTING_NUMBER_OF_PRO, value1: settings.nbProParticipants?.value?.[0], value2: settings.nbProParticipants?.value?.[1] },
    { setting: Constants.SETTING_NUMBER_OF_ASSIGNMENTS_FOR_A_PRO, value1: settings.numberOfAssignmentsForAProfessional?.value?.[0], value2: settings.numberOfAssignmentsForAProfessional?.value?.[1] },
    { setting: Constants.SETTING_NUMBER_OF_NON_PRO, value1: settings.nbNonProParticipants?.value?.[0], value2: settings.nbNonProParticipants?.value?.[1] },
    { setting: Constants.SETTING_NUMBER_OF_ASSIGNMENTS_FOR_A_NON_PRO, value1: settings.numberOfAssignmentsForANonProfessional?.value?.[0], value2: settings.numberOfAssignmentsForANonProfessional?.value?.[1] },
    { setting: Constants.SETTING_NUMBER_OF_EXTERNAL, value1: settings.nbExternalParticipants?.value?.[0], value2: settings.nbExternalParticipants?.value?.[1] },
    { setting: Constants.SETTING_NUMBER_OF_ASSIGNMENTS_FOR_AN_EXTERNAL, value1: settings.numberOfAssignmentsForAnExternal?.value?.[0], value2: settings.numberOfAssignmentsForAnExternal?.value?.[1] },
    { setting: Constants.SETTING_NUMBER_OF_ROTATIONS_TO_REINSPECT, value1: settings.nbRotationsToReinspect },
    { setting: Constants.SETTING_NUMBER_OF_INSPECTORS_FOLLOWING_UP, value1: settings.nbInspectorsFollowingUp },
    { setting: Constants.SETTING_TRAVELLING_DISTANCE_RANGE, value1: settings.travellingDistanceRange?.value?.[0], value2: settings.travellingDistanceRange?.value?.[1] },
    { setting: Constants.SETTING_COMMITTEE_MEETING_SIZE, value1: settings.committeeMeetingSize?.value?.[0], value2: settings.committeeMeetingSize?.value?.[1] },
    { setting: Constants.SETTING_USE_AVAILABILITY, value1: settings.useAvailability ? "true" : "false" },
    { setting: Constants.SETTINGS_SHUFFLE_PARTICIPANTS, value1: settings.shuffleParticipants ? "true" : "false" },
  ]);

  // Participants sheet
  const participantsSheet = workbook.addWorksheet(Constants.PARTICIPANTS);
  participantsSheet.addRow(Object.keys(participantsColumns).map(k => participantsColumns[k as keyof typeof participantsColumns]));
  participants.forEach((p: Person) => {
    participantsSheet.addRow([
      sanitizeString(p.name),
      sanitizeString(p.personType?.name),
      sanitizeString(p.location?.name),
      sanitizeNamedArray(p.skills),
      sanitizeNamedArray(p.availability),
      sanitizeNamedArray(p.requiredSkills),
      p.needsEvaluation ? "true" : "false",
      sanitizeNamedArray(p.vetoes),
      p.maxNumberOfInspections?.toString() ?? "",
    ]);
  });

  // Solution sheet
  const solutionSheet = workbook.addWorksheet(Constants.SOLUTION);
  solutionSheet.addRow([Constants.SOLUTION, new Date()]);
  solutionSheet.addRow(solutionHeaders);
  exportCommittees(committeeSolution.committees, solutionSheet);

  // History sheet
  const historySheet = workbook.addWorksheet(Constants.HISTORY);
  history.forEach((committees) => {
    historySheet.addRow([Constants.SOLUTION, `${committees.date}`]);
    historySheet.addRow(solutionHeaders);
    exportCommittees(committees, historySheet);
  });

  // Distances sheet
  const distancesSheet = workbook.addWorksheet(Constants.DISTANCES);
  const distancesHeaders = [""];
  distanceMatrix.locations?.forEach((l: string) => distancesHeaders.push(l));
  distancesSheet.addRow(distancesHeaders);
  distanceMatrix.distances?.forEach((d: Array<number>, index: number) => {
    const line = [distanceMatrix.locations?.[index], ...d];
    distancesSheet.addRow(line);
  });

  workbook.xlsx.writeBuffer().then((buffer) => {
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "dicoop-export.xlsx";
    link.click();
  });
}

const exportCommittees = (
  committees: CommitteeSet,
  worksheet: ExcelJS.Worksheet
) => {
  committees.getCommittees().forEach((c: SolvedCommittee) => {
    const rowData = [c.evaluatedPerson?.name];
    if (c.getAssignments().length) {
      rowData.push(c.timeSlot?.name);
      c.getAssignments().forEach((a: any) =>
        rowData.push(a.assignedPerson.name)
      );
    }
    worksheet.addRow(rowData);
  });
};