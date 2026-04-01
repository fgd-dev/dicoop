import {
  Committee,
  CommitteeAssignment,
  DistanceMatrix,
  Location,
  Person,
  PersonType,
  Range,
  Settings,
  TimeSlot,
} from "../api";
import { CommitteeSet } from "../Model/CommitteeSet";
import { DEFAULT_SETTINGS } from "../Model/Defaults";
import { stringNotEmpty } from "../Model/ModelUtils";
import { NamedEntity } from "../Model/NamedEntity";
import { PersistenceData } from "../Model/PersistenceData";
import { SolvedCommittee } from "../Model/SolvedCommittee";
import ExcelJS from "exceljs";
import { Constants } from "./ExcelValidation";
import { v4 as uuid } from "uuid";

export function parseExcelData(workbook: ExcelJS.Workbook): PersistenceData {
  const data = new PersistenceData();
  workbook.eachSheet((worksheet) => {
    const name = worksheet.name;
    const sheetData = sheetToArray(worksheet);
    switch (name) {
      case Constants.SETTINGS:
        data.settings = parseSettings(sheetData);
        break;
      case Constants.PARTICIPANTS:
        data.participants = parseParticipants(worksheet);
        break;
      case Constants.HISTORY:
        const solutions = parseMultipleSolutions(sheetData);
        solutions.forEach((solution) => {
          data.history.push(parseSolution(solution));
        });
        break;
      case Constants.DISTANCES:
        data.distanceMatrix = parseDistances(sheetData);
        break;
      case Constants.SOLUTION:
        const currentSolution = parseSolution(sheetData);
        if (currentSolution.size) data.history.unshift(currentSolution);
        break;
      default:
        console.log(`Unknown sheet name: ${name}`);
        break;
    }
  });
  return data;
}

function sheetToArray(worksheet: ExcelJS.Worksheet): any[][] {
  const result: any[][] = [];
  worksheet.eachRow((row) => {
    const values: any[] = [];
    row.eachCell((cell) => {
      values.push(cell.value);
    });
    result.push(values);
  });
  return result;
}

function parseDistances(sheetData: any[][]): DistanceMatrix {
  const distanceMatrix = {} as DistanceMatrix;
  sheetData.forEach((rowData: any[], originIndex: number) => {
    if (originIndex === 0) {
      const origins = rowData.map((item) => String(item ?? "").trim()).filter(stringNotEmpty);
      distanceMatrix.locations = origins;
      distanceMatrix.distances = new Array(origins.length)
        .fill(0)
        .map(() => new Array(origins.length).fill(0));
    } else {
      const dest = rowData[0];
      if (dest !== distanceMatrix.locations?.[originIndex - 1]) {
        throw new Error(
          `The destination ${dest} is not a valid location.` +
            `The valid locations are in this order in the headers of the Distances sheet: ${distanceMatrix.locations?.join(
              ", "
            )}`
        );
      }
      rowData.forEach((cellData, destIndex) => {
        if (destIndex > 0 && distanceMatrix.distances) {
          distanceMatrix.distances[originIndex - 1][destIndex - 1] =
            parseInt(cellData) || 0;
        }
      });
    }
  });
  return distanceMatrix;
}

function parseMultipleSolutions(sheetData: any[][]): any[][] {
  const solutions = new Array<any[]>();
  if (sheetData?.length > 0) {
    let currentSolution = new Array<any>();
    let isFirstSolution = true;
    sheetData.forEach((rowData: any[]) => {
      const firstCell = rowData[0];
      if (firstCell === Constants.SOLUTION) {
        if (isFirstSolution) {
          isFirstSolution = false;
        } else {
          solutions.push(currentSolution);
          currentSolution = new Array<any>();
        }
      }
      currentSolution.push(rowData);
    });
    solutions.push(currentSolution);
  }
  return solutions;
}

function parseSolution(sheetData: any[][]): CommitteeSet {
  const set: CommitteeSet = new CommitteeSet();
  let isWellFormed = false;
  sheetData.forEach((rowData: any[]) => {
    const firstCell = rowData[0];
    if (firstCell !== Constants.SOLUTION_EVALUATED_PERSON) {
      if (firstCell === Constants.SOLUTION) {
        set.date = rowData[1];
        isWellFormed = true;
      } else if (isWellFormed) {
        const evaluatedPerson = {
          name: rowData[0],
        } as Person;
        const timeSlot = { name: rowData[1] } as TimeSlot;
        const solvedCommittee = new SolvedCommittee(
          uuid(),
          evaluatedPerson,
          timeSlot
        );
        const committee = {
          id: uuid(),
          createdDate: ``,
          evaluatedPerson,
        } as Committee;
        for (let i = 2; i < rowData.length; i++) {
          const assignedPerson = { name: rowData[i] } as Person;
          solvedCommittee.getAssignments().push({
            id: i,
            assignedPerson,
            committee,
          } as CommitteeAssignment);
        }
        set.add(solvedCommittee);
      }
    }
  });
  return set;
}

function rowToRange(rowData: any[]): Range {
  return {
    value: [+rowData[1], +rowData[2]],
  } as Range;
}

function parseSettings(sheetData: any[][]): Settings {
  const settings = DEFAULT_SETTINGS;
  sheetData.forEach((rowData: any[]) => {
    const settingName = rowData[0];
    switch (settingName) {
      case Constants.SETTING_NUMBER_OF_PRO:
        settings.nbProParticipants = rowToRange(rowData);
        break;
      case Constants.SETTING_NUMBER_OF_ASSIGNMENTS_FOR_A_PRO:
        settings.numberOfAssignmentsForAProfessional = rowToRange(rowData);
        break;
      case Constants.SETTING_NUMBER_OF_NON_PRO:
        settings.nbNonProParticipants = rowToRange(rowData);
        break;
      case Constants.SETTING_NUMBER_OF_ASSIGNMENTS_FOR_A_NON_PRO:
        settings.numberOfAssignmentsForANonProfessional = rowToRange(rowData);
        break;
      case Constants.SETTING_NUMBER_OF_EXTERNAL:
        settings.nbExternalParticipants = rowToRange(rowData);
        break;
      case Constants.SETTING_NUMBER_OF_ASSIGNMENTS_FOR_AN_EXTERNAL:
        settings.numberOfAssignmentsForAnExternal = rowToRange(rowData);
        break;
      case Constants.SETTING_NUMBER_OF_ROTATIONS_TO_REINSPECT:
        settings.nbRotationsToReinspect = +rowData[1];
        break;
      case Constants.SETTING_NUMBER_OF_INSPECTORS_FOLLOWING_UP:
        settings.nbInspectorsFollowingUp = +rowData[1];
        break;
      case Constants.SETTING_TRAVELLING_DISTANCE_RANGE:
        settings.travellingDistanceRange = rowToRange(rowData);
        break;
      case Constants.SETTING_COMMITTEE_MEETING_SIZE:
        settings.committeeMeetingSize = rowToRange(rowData);
        break;
      case Constants.SETTING_USE_AVAILABILITY:
        settings.useAvailability = rowData[1] === "true";
        break;
      case Constants.SETTINGS_SHUFFLE_PARTICIPANTS:
        settings.shuffleParticipants = rowData[1] === "true";
        break;
      default:
        console.log(`Unknown setting name ${settingName}`);
        break;
    }
  });
  return settings;
}

function parseParticipants(worksheet: ExcelJS.Worksheet): Array<Person> {
  const participants = new Array<Person>();
  let headerRow: any[] | undefined;
  
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) {
      headerRow = row.values as any[];
      return;
    }
    const rowData = row.values as any[];
    const rowObj: Record<string, any> = {};
    if (headerRow) {
      headerRow.forEach((header, index) => {
        rowObj[header] = rowData[index];
      });
    }
    
    const person = {
      name: (rowObj[Constants.PARTICIPANT_NAME] ?? "").toString().trim(),
      personType: {
        name: (rowObj[Constants.PARTICIPANT_TYPE] ?? "").toString().trim(),
      } as PersonType,
      location: {
        name: (rowObj[Constants.PARTICIPANT_LOCATION] ?? "").toString().trim(),
      } as Location,
      skills: parseNamedList(rowObj[Constants.PARTICIPANT_SKILLS]),
      availability: parseNamedList(rowObj[Constants.PARTICIPANT_AVAILABILITY]),
      requiredSkills: parseNamedList(
        rowObj[Constants.PARTICIPANT_REQUIRED_SKILLS]
      ),
      vetoes: parseNamedList(rowObj[Constants.PARTICIPANT_VETOES]),
      needsEvaluation:
        (rowObj[Constants.PARTICIPANT_NEEDS_EVALUATION] ?? "").toString().trim() ===
        "true",
      maxNumberOfInspections: parseNumber(
        rowObj[Constants.PARTICIPANT_MAX_NUMBER_OF_INSPECTIONS]
      ),
      hasAlreadyInspected: [] as Array<Array<string>>,
    } as Person;
    participants.push(person);
  });
  return participants;
}

function parseNumber(s: any): number | undefined {
  if (s === undefined || s === null || s === "") {
    return undefined;
  }
  const n = +s;
  if (isNaN(n)) {
    return undefined;
  }
  return n;
}

function parseNamedList(s: any): Array<NamedEntity> {
  const list = new Array<NamedEntity>();
  if (s) {
    String(s).split(",").forEach((item) => {
      item = (item ?? "").trim();
      if (stringNotEmpty(item)) {
        list.push({
          name: item,
        } as NamedEntity);
      }
    });
  }
  return list;
}