package fr.cirad.solver;

import static org.optaplanner.core.api.score.stream.ConstraintCollectors.sum;
import static org.optaplanner.core.api.score.stream.ConstraintCollectors.count;
import static org.optaplanner.core.api.score.stream.Joiners.equal;
import org.optaplanner.core.api.score.buildin.hardmediumsoft.HardMediumSoftScore;
import org.optaplanner.core.api.score.stream.Constraint;
import org.optaplanner.core.api.score.stream.ConstraintFactory;
import org.optaplanner.core.api.score.stream.ConstraintProvider;
import fr.cirad.domain.Committee;
import fr.cirad.domain.CommitteeAssignment;
import fr.cirad.domain.Settings;
import fr.cirad.domain.TimeSlot;

public class CommitteeSchedulingConstraintProvider implements ConstraintProvider {

        @Override
        public Constraint[] defineConstraints(ConstraintFactory constraintFactory) {
                return new Constraint[] {selfConflict(constraintFactory),
                                duplicatedEvaluator(constraintFactory),
                                maxProfessionalEvaluators(constraintFactory),
                                minProfessionalEvaluators(constraintFactory),
                                maxNonProfessionalEvaluators(constraintFactory),
                                minNonProfessionalEvaluators(constraintFactory),
                                evaluatorsAvailability(constraintFactory),
                                evaluatedAvailable(constraintFactory),
                                requiredSkills(constraintFactory),
                                nonReciprocity(constraintFactory),
                                inspectionRotation(constraintFactory),
                                inspectionFollowUp(constraintFactory), vetoes(constraintFactory),
                                travelling(constraintFactory),
                                maxNumberOfInspections(constraintFactory),
                                badCommitteeNumberByTimeSlotRange(constraintFactory)};
        }

        private Constraint selfConflict(ConstraintFactory constraintFactory) {
                return constraintFactory.forEach(CommitteeAssignment.class).filter(
                                ca -> ca.assignedPerson.equals(ca.committee.evaluatedPerson))
                                .penalize(HardMediumSoftScore.ofHard(1_000_000))
                                .asConstraint("Self conflict");
        }

        private Constraint duplicatedEvaluator(ConstraintFactory constraintFactory) {
                return constraintFactory.forEachIncludingNullVars(Committee.class)
                                .filter(Committee::duplicatedEvaluator)
                                .penalize(HardMediumSoftScore.ofHard(1_000_000))
                                .asConstraint("A person cannot be assigned multiple times to the same committee");
        }

        private Constraint maxProfessionalEvaluators(ConstraintFactory constraintFactory) {
                return constraintFactory.forEachIncludingNullVars(Committee.class)
                                .filter(c -> !c.hasCorrectNumberOfMaxProfessionalPersons())
                                .penalize(HardMediumSoftScore.ofHard(1_000))
                                .asConstraint("Max number of professional");
        }

        private Constraint minProfessionalEvaluators(ConstraintFactory constraintFactory) {
                return constraintFactory.forEachIncludingNullVars(Committee.class)
                                .filter(c -> !c.hasCorrectNumberOfMinProfessionalPersons())
                                .penalize(HardMediumSoftScore.ofHard(100))
                                .asConstraint("Min number of professional");
        }

        private Constraint maxNonProfessionalEvaluators(ConstraintFactory constraintFactory) {
                return constraintFactory.forEachIncludingNullVars(Committee.class)
                                .filter(c -> !c.hasCorrectNumberOfMaxNonProfessionalPersons())
                                .penalize(HardMediumSoftScore.ofHard(1_000))
                                .asConstraint("Max number of non professional");
        }

        private Constraint minNonProfessionalEvaluators(ConstraintFactory constraintFactory) {
                return constraintFactory.forEachIncludingNullVars(Committee.class)
                                .filter(c -> !c.hasCorrectNumberOfMinNonProfessionalPersons())
                                .penalize(HardMediumSoftScore.ofHard(100))
                                .asConstraint("Min number of non professional");
        }

        private Constraint evaluatorsAvailability(ConstraintFactory constraintFactory) {
                return constraintFactory.forEachIncludingNullVars(Committee.class)
                                .filter(Committee::notEnoughAvailableEvaluators)
                                .penalize(HardMediumSoftScore.ofHard(2))
                                .asConstraint("Not enough available evaluators for the meeting");
        }

        private Constraint evaluatedAvailable(ConstraintFactory constraintFactory) {
                return constraintFactory.forEachIncludingNullVars(Committee.class)
                                .filter(Committee::evaluatedNotAvailable)
                                .penalize(HardMediumSoftScore.ofHard(2))
                                .asConstraint("Evaluated must be available for the meeting");
        }

        private Constraint requiredSkills(ConstraintFactory constraintFactory) {
                return constraintFactory.forEachIncludingNullVars(Committee.class)
                                .filter(Committee::requiredSkillsNotSatisfied)
                                .penalize(HardMediumSoftScore.ofHard(2))
                                .asConstraint("Required skills");
        }

        private Constraint nonReciprocity(ConstraintFactory constraintFactory) {
                return constraintFactory.forEach(CommitteeAssignment.class).join(
                                CommitteeAssignment.class,
                                equal(ca -> ca.committee.evaluatedPerson, ca -> ca.assignedPerson),
                                equal(ca -> ca.assignedPerson, ca -> ca.committee.evaluatedPerson))
                                .penalize(HardMediumSoftScore.ofHard(100))
                                .asConstraint("Non-reciprocity");
        }

        private Constraint inspectionRotation(ConstraintFactory constraintFactory) {
                return constraintFactory.forEachIncludingNullVars(Committee.class)
                                .filter(Committee::inspectionRotationBroken)
                                .penalize(HardMediumSoftScore.ONE_HARD)
                                .asConstraint("Inspector rotation not respected");
        }

        private Constraint inspectionFollowUp(ConstraintFactory constraintFactory) {
                return constraintFactory.forEachIncludingNullVars(Committee.class)
                                .filter(Committee::inspectionFollowUpNotRespected)
                                .penalize(HardMediumSoftScore.ONE_HARD)
                                .asConstraint("Inspector follow up not respected");
        }

        private Constraint vetoes(ConstraintFactory constraintFactory) {
                return constraintFactory.forEach(CommitteeAssignment.class).filter(
                                ca -> ca.assignedPerson.isVetoed(ca.committee.evaluatedPerson))
                                .penalize(HardMediumSoftScore.ONE_HARD).asConstraint("Veto");
        }

        private Constraint travelling(ConstraintFactory constraintFactory) {
                return constraintFactory.forEach(CommitteeAssignment.class)
                                .groupBy(ca -> ca.assignedPerson,
                                                sum(CommitteeAssignment::getDistance))
                                .filter((person, distance) -> person
                                                .isNotTravellingInRange(distance))
                                .penalize(HardMediumSoftScore.ONE_HARD)
                                .asConstraint("Travelling distance range");
        }

        private Constraint maxNumberOfInspections(ConstraintFactory constraintFactory) {
                return constraintFactory.forEach(CommitteeAssignment.class)
                                .filter(ca -> ca.committee != null
                                                && ca.assignedPerson.maxNumberOfInspections != null)
                                .groupBy(ca -> ca.assignedPerson, count())
                                .filter((person, nb) -> person.maxNumberOfInspections > nb)
                                .penalize(HardMediumSoftScore.ONE_HARD)
                                .asConstraint("Max number of inspections");
        }

        private Constraint badCommitteeNumberByTimeSlotRange(ConstraintFactory constraintFactory) {
                return constraintFactory.forEach(Committee.class).join(Settings.class)
                                .map((c, s) -> TimeSlot.copyAndSetSettings(c.timeSlot, s))
                                .groupBy(t -> t, count())
                                .filter((t, nb) -> !t.isNumberOfCommitteesInRange(nb))
                                .penalize(HardMediumSoftScore.ONE_HARD)
                                .asConstraint("Number of committees for a given timeslot");
        }

}
