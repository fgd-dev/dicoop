import { CommitteeAssignment, Person, TimeSlot } from "../api";

export class SolvedCommittee {
  constructor(
    public id: string,
    public evaluatedPerson?: Person,
    public timeSlot?: TimeSlot,
    public _assignments: Array<CommitteeAssignment> = new Array<CommitteeAssignment>()
  ) {}
  findFirstTimeslotInCommon(): string {
    const timeslots = this._assignments
      .flatMap((assignment) => assignment.assignedPerson?.availability)
      .map((t) => t?.name ?? "");
    for (const t of this.evaluatedPerson?.availability ?? []) {
      if (t.name && timeslots.includes(t.name)) {
        return t.name;
      }
    }
    return "";
  }
  findNTimeslotsInCommon(n: number): string {
    const result = new Array<string>();
    for (const t of this.evaluatedPerson?.availability ?? []) {
      if (t.name && this.countAvailable(t.name) >= 2) {
        result.push(t.name);
      }
    }
    let timeSlotValue: string = this.timeSlot?.name ?? "";
    if (result && result.length)
      timeSlotValue += " (" + result.join(", ") + ")";
    return timeSlotValue;
  }
  countAvailable(timeSlotName: string): number {
    let count = 0;
    for (const assignment of this._assignments) {
      if (!this.isNotAvailable(assignment, timeSlotName)) count++;
    }
    return count;
  }
  isAvailableForAll(timeSlotName: string): boolean {
    for (const assignment of this._assignments) {
      if (this.isNotAvailable(assignment, timeSlotName)) return false;
    }
    return true;
  }
  private isNotAvailable(
    assignment: CommitteeAssignment,
    timeSlotName: string
  ) {
    return (
      assignment.assignedPerson?.availability?.find(
        (t) => t.name === timeSlotName
      ) === undefined
    );
  }

  getAssignments(): Array<CommitteeAssignment> {
    return this._assignments;
  }
}
