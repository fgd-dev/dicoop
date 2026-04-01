import { CommitteeAssignment, CommitteeSolution } from "../api";
import { v4 as uuid } from "uuid";
import { SolvedCommittee } from "./SolvedCommittee";

interface SolvedCommitteeDictionary {
  [index: number]: SolvedCommittee;
}

export class CommitteeSet {
  public id: string;
  public committees: SolvedCommitteeDictionary;
  public date: Date;
  public size = 0;

  constructor() {
    this.id = uuid();
    this.committees = {};
    this.date = new Date();
  }

  public add(committee: SolvedCommittee) {
    this.committees[committee.id] = committee;
    this.size++;
  }

  public getCommittees(): Array<SolvedCommittee> {
    return Object.values(this.committees);
  }

  static fromAssignments(
    assignments: Array<CommitteeAssignment> | undefined
  ): CommitteeSet {
    return (
      assignments
        ?.filter((a) => a.committee)
        .reduce((set: CommitteeSet, a: CommitteeAssignment) => {
          const committeeId = a.committee?.id ?? uuid();
          set.committees[committeeId] =
            set.committees[committeeId] ||
            new SolvedCommittee(committeeId, a.committee?.evaluatedPerson, a.committee?.timeSlot);
          if (a.assignedPerson?.name !== "INTERNAL_NULL_PERSON") {
            set.committees[committeeId].getAssignments().push(a);
          }
          return set;
        }, new CommitteeSet()) ?? new CommitteeSet()
    );
  }
  static fromCommitteeSolution(solution: CommitteeSolution): CommitteeSet {
    return this.fromAssignments(solution.committeeAssignments);
  }

  static deserialize(localStorageValue: string): Array<CommitteeSet> {
    try {
      const historyStorageValue = JSON.parse(
        localStorageValue
      ) as Array<CommitteeSet>;
      let loaded = new Array<CommitteeSet>();
      for (const cs of historyStorageValue) {
        const set = new CommitteeSet();
        set.date = cs.date;
        set.id = cs.id;
        set.size = cs.size;
        for (const sca of Object.values(
          cs.committees
        ) as Array<SolvedCommittee>) {
          const solvedCommittee = new SolvedCommittee(
            sca.id,
            sca.evaluatedPerson,
            sca.timeSlot
          );
          for (const sc of sca._assignments) {
            solvedCommittee.getAssignments().push(sc);
          }
          set.add(solvedCommittee);
        }
        loaded.push(set);
      }
      return loaded;
    } catch (e) {
      return [];
    }
  }
}
