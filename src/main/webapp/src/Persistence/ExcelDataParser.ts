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
import { utils, WorkBook } from "xlsx";
import { Constants } from "./ExcelValidation";
import { v4 as uuid } from "uuid";

export function parseExcelData(workbook: WorkBook): PersistenceData {
  const data = new PersistenceData();
  workbook.SheetNames.forEach((name) => {
    const sheet = workbook.Sheets[name];
    const options =
      name === Constants.PARTICIPANTS
        ? {}
        : {
            header: 1,
            raw: false,
          };
    const sheetData = utils.sheet_to_json(sheet, options);
    switch (name) {
      case Constants.SETTINGS:
        data.settings = parseSettings(sheetData);
        break;
      case Constants.PARTICIPANTS:
        data.participants = parseParticipants(sheetData);
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

function parseDistances(sheetData: Array<any>): DistanceMatrix {
  const distanceMatrix = {} as DistanceMatrix;
  sheetData.forEach((rowData: Array<any>, originIndex: number) => {
    if (originIndex === 0) {
      const origins = rowData.map((item) => item.trim()).filter(stringNotEmpty);
      // initialisation of the distances matrix
      distanceMatrix.locations = origins;
      distanceMatrix.distances = new Array(origins.length)
        .fill(0)
        .map(() => new Array(origins.length).fill(0));
    } else {
      const dest = rowData[0];
      // Verify that the destination is a valid location
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
            parseInt(cellData);
        }
      });
    }
  });
  return distanceMatrix;
}

function parseMultipleSolutions(sheetData: Array<any>): Array<any> {
  const solutions = new Array<any>();
  if (sheetData?.length > 0) {
    let currentSolution = new Array<any>();
    let isFirstSolution = true;
    sheetData.forEach((rowData: Array<any>) => {
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

function parseSolution(sheetData: Array<any>): CommitteeSet {
  const set: CommitteeSet = new CommitteeSet();
  let isWellFormed = false;
  sheetData.forEach((rowData: Array<any>) => {
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

function parseSettings(sheetData: Array<any>): Settings {
  const settings = DEFAULT_SETTINGS;
  sheetData.forEach((rowData: Array<any>) => {
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

function parseParticipants(sheetData: Array<any>): Array<Person> {
  const participants = new Array<Person>();
  sheetData.forEach((rowData: any) => {
    const person = {
      name: (rowData[Constants.PARTICIPANT_NAME] ?? "").trim(),
      personType: {
        name: (rowData[Constants.PARTICIPANT_TYPE] ?? "").trim(),
      } as PersonType,
      location: {
        name: (rowData[Constants.PARTICIPANT_LOCATION] ?? "").trim(),
      } as Location,
      skills: parseNamedList(rowData[Constants.PARTICIPANT_SKILLS]),
      availability: parseNamedList(rowData[Constants.PARTICIPANT_AVAILABILITY]),
      requiredSkills: parseNamedList(
        rowData[Constants.PARTICIPANT_REQUIRED_SKILLS]
      ),
      vetoes: parseNamedList(rowData[Constants.PARTICIPANT_VETOES]),
      needsEvaluation:
        (rowData[Constants.PARTICIPANT_NEEDS_EVALUATION] ?? "").trim() ===
        "true",
      maxNumberOfInspections: parseNumber(
        rowData[Constants.PARTICIPANT_MAX_NUMBER_OF_INSPECTIONS]
      ),
      hasAlreadyInspected: [] as Array<Array<string>>,
    } as Person;
    participants.push(person);
  });
  return participants;
}

function parseNumber(s: string): number | undefined {
  if (s === undefined || s.length === 0) {
    return undefined;
  }
  const n = +s;
  if (isNaN(n)) {
    return undefined;
  }
  return n;
}

function parseNamedList(s: string): Array<NamedEntity> {
  const list = new Array<NamedEntity>();
  if (s) {
    s.split(",").forEach((item) => {
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
