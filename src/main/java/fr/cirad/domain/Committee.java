package fr.cirad.domain;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;
import ai.timefold.solver.core.api.domain.entity.PlanningEntity;
import ai.timefold.solver.core.api.domain.lookup.PlanningId;
import ai.timefold.solver.core.api.domain.variable.InverseRelationShadowVariable;
import ai.timefold.solver.core.api.domain.variable.PlanningVariable;
import com.fasterxml.jackson.annotation.JsonIgnore;

@PlanningEntity
public class Committee implements Comparable<Committee> {

    @PlanningId
    public String id;

    public Person evaluatedPerson;

    public Instant createdDate = Instant.now();

    private Boolean useAvailability = true;

    private Settings settings;

    @PlanningVariable(valueRangeProviderRefs = {"timeSlotRange"}, nullable = true)
    public TimeSlot timeSlot;

    @InverseRelationShadowVariable(sourceVariableName = "committee")
    @JsonIgnore
    public List<CommitteeAssignment> assignments = new ArrayList<>();

    private static final Comparator<Committee> COMPARATOR =
            Comparator.comparing(c -> c.evaluatedPerson);

    public Committee() {

    }

    public Committee(Person evaluatedPerson, Settings settings) {
        this.id = evaluatedPerson.name;
        this.evaluatedPerson = evaluatedPerson;
        this.settings = settings;
        this.useAvailability = settings.useAvailability;
    }

    public boolean duplicatedEvaluator() {
        var set = assignments.stream().map(a -> a.assignedPerson).collect(Collectors.toSet());
        return assignments.size() > set.size();
    }

    private int numberOf(PersonType personType) {
        return (int) assignments.stream().map(a -> a.assignedPerson.personType)
                .filter(t -> t.equals(personType)).count();
    }

    public boolean hasCorrectNumberOfMaxProfessionalPersons() {
        return numberOf(PersonType.PROFESSIONAL) <= settings.nbProParticipants.getMax();
    }

    public boolean hasCorrectNumberOfMinProfessionalPersons() {
        return numberOf(PersonType.PROFESSIONAL) >= settings.nbProParticipants.getMin();
    }

    public boolean hasCorrectNumberOfMaxNonProfessionalPersons() {
        return numberOf(PersonType.NON_PROFESSIONAL) <= settings.nbNonProParticipants.getMax();
    }

    public boolean hasCorrectNumberOfMinNonProfessionalPersons() {
        return numberOf(PersonType.NON_PROFESSIONAL) >= settings.nbNonProParticipants.getMin();
    }

    public boolean notEnoughAvailableEvaluators() {
        if (Boolean.FALSE.equals(useAvailability))
            return false;
        long nbAvailable =
                assignments.stream().filter(ca -> ca.assignedPerson.isAvailable(timeSlot)).count();
        return nbAvailable < 2;
    }

    public boolean evaluatedNotAvailable() {
        if (Boolean.FALSE.equals(useAvailability))
            return false;
        return !evaluatedPerson.isAvailable(timeSlot);
    }

    public boolean requiredSkillsNotSatisfied() {
        for (Skill s : evaluatedPerson.requiredSkills) {
            if (assignments.stream().map(CommitteeAssignment::getAssignedPerson)
                    .noneMatch(p -> p.hasSkill(s))) {
                return true;
            }
        }
        return false;
    }

    public boolean inspectionRotationBroken() {
        for (CommitteeAssignment assignment : assignments) {
            if (assignment.assignedPerson != null
                    && assignment.assignedPerson.hasAlreadyInspectedInThePast(evaluatedPerson)) {
                return true;
            }
        }
        return false;
    }

    public boolean inspectionFollowUpNotRespected() {
        long nbFollowUp =
                assignments.stream()
                        .filter(a -> a.assignedPerson != null
                                && a.assignedPerson.hasAlreadyInspectedLastTime(evaluatedPerson))
                        .count();
        return nbFollowUp != settings.nbInspectorsFollowingUp;
    }

    @Override
    public String toString() {
        return "Committee for: " + this.evaluatedPerson + " (" + this.id + ")";
    }

    @Override
    public int compareTo(Committee o) {
        return COMPARATOR.compare(this, o);
    }

    @Override
    public boolean equals(Object o) {
        if (!(o instanceof Committee)) {
            return false;
        }
        Committee other = (Committee) o;
        return this.evaluatedPerson.equals(other.evaluatedPerson);
    }

    @Override
    public int hashCode() {
        return this.evaluatedPerson.hashCode();
    }

}
