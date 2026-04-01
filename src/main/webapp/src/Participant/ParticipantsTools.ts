import { Person } from "../api";
import { NamedEntity } from "../Model/NamedEntity";

const getSkills = (p: Person) =>
  [...(p.skills ?? []), ...(p.requiredSkills ?? [])] as Array<NamedEntity>;

const getAvailability = (p: Person) => p.availability as Array<NamedEntity>;

const getLocation = (p: Person) => p.location as Array<NamedEntity>;

export const sanitizeName = (name: string | undefined): string => {
  return name
    ? name
        .replace(/[^a-zA-Z0-9]/g, "")
        .toLowerCase()
        .trim()
    : "";
};

const getSortedValuesFromParticipants = (
  participants: Array<Person>,
  f: (p: Person) => Array<NamedEntity>
) =>
  Array.from(
    new Set(
      participants
        .flatMap(f)
        .map((l) => l?.name ?? "")
        .filter((l) => l && l.length > 0)
    )
  ).sort();

export const getSortedSkillsFromParticipants = (participants: Array<Person>) =>
  getSortedValuesFromParticipants(participants, getSkills);

export const getSortedAvailabilitiesFromParticipants = (
  participants: Array<Person>
) => getSortedValuesFromParticipants(participants, getAvailability);

const getSanitizedValuesFromParticipants = (
  participants: Array<Person>,
  f: (p: Person) => Array<NamedEntity>
) =>
  Array.from(
    new Set(
      participants
        .flatMap(f)
        .map((l) => sanitizeName(l?.name) ?? "")
        .filter((l) => l && l.length > 0)
    )
  );

export const getSanitizedSkills = (participants: Array<Person>) =>
  getSanitizedValuesFromParticipants(participants, getSkills);

export const getSanitizedAvailabilities = (participants: Array<Person>) =>
  getSanitizedValuesFromParticipants(participants, getAvailability);

export const getSanitizedLocations = (participants: Array<Person>) =>
  getSanitizedValuesFromParticipants(participants, getLocation);
