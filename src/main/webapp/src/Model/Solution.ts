import { CommitteeAssignment, CommitteeSolution } from "../api";
import { CommitteeSet } from "./CommitteeSet";

const UNDEFINED = "UNDEFINED";

export class Solution {
  public id: string;
  constructor(
    public committeeAssignments: Array<CommitteeAssignment>,
    public committees: CommitteeSet,
    public solverStatus: string,
    public score: string,
    public scoreExplanation: string
  ) {
    this.id = UNDEFINED;
  }

  public static fromCommitteeSolution = (
    solution: CommitteeSolution
  ): Solution => {
    const committees = CommitteeSet.fromCommitteeSolution(solution);
    const result = new Solution(
      solution.committeeAssignments ?? [],
      committees,
      solution.solverStatus ?? "STATUS_UNDEFINED",
      JSON.stringify(solution.score),
      solution.scoreExplanation ?? "SCORE_EXPLANATION_UNDEFINED"
    );
    result.id = solution.id ?? UNDEFINED;
    return result;
  };

  public isDefined(): boolean {
    return this.id !== UNDEFINED;
  }
}
