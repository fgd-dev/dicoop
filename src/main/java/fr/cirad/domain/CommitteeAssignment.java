package fr.cirad.domain;

import java.util.Comparator;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnore;
import org.optaplanner.core.api.domain.entity.PlanningEntity;
import org.optaplanner.core.api.domain.lookup.PlanningId;
import org.optaplanner.core.api.domain.variable.PlanningVariable;

@PlanningEntity
public class CommitteeAssignment implements Comparable<CommitteeAssignment> {

    @PlanningId
    public Long id;

    @PlanningVariable(valueRangeProviderRefs = {"personRange"},
            nullable = true)
    public Person assignedPerson;

    public Committee committee;

    public PersonType requiredPersonType;

    @JsonIgnore
    public DistanceMatrix distanceMatrix;

    private static final Comparator<CommitteeAssignment> COMPARATOR =
            Comparator.comparing(c -> c.id);

    public CommitteeAssignment() {
        // must have a no-args constructor so it can be constructed by OptaPlanner
    }

    public CommitteeAssignment(Long id, Person assignedPerson, Committee committee,
            PersonType requiredPersonType, DistanceMatrix distanceMatrix) {
        this.id = id;
        this.assignedPerson = assignedPerson;
        this.committee = committee;
        this.requiredPersonType = requiredPersonType;
        this.distanceMatrix = distanceMatrix;
    }

    public CommitteeAssignment(Long id, Committee committee, PersonType requiredPersonType,
            DistanceMatrix distanceMatrix) {
        this.id = id;
        this.committee = committee;
        this.requiredPersonType = requiredPersonType;
        this.distanceMatrix = distanceMatrix;
    }

    public Person getAssignedPerson() {
        return assignedPerson;
    }

    public Committee getCommittee() {
        return committee;
    }

    @JsonIgnore
    public Integer getDistance() {
        if (assignedPerson == null) {
            return 0;
        }
        return distanceMatrix.getDistance(assignedPerson.location.name,
                committee.evaluatedPerson.location.name);
    }

    @JsonIgnore
    public int getCorrectnessScore() {
        if (assignedPerson == null) {
            return 0;
        }
        int score = 0;
        if (assignedPerson.personType.equals(requiredPersonType))
            score += 1;
        if (committee.atLeastOnePersonIsAvailable(List.of(this)))
            score += 1;
        if (committee.atLeastOnePersonHasTheRequiredSkills(List.of(this)))
            score += 1;
        return score;
    }

    @JsonIgnore
    public boolean isRequiredPersonTypeCorrect() {
        if (assignedPerson == null) {
            return true;
        }
        return assignedPerson.personType.equals(requiredPersonType);
    }

    @Override
    public String toString() {
        return " CommitteeAssignment: " + assignedPerson + " for " + committee + " (" + id + ")";
    }

    @Override
    public int compareTo(CommitteeAssignment o) {
        return COMPARATOR.compare(this, o);
    }

    @Override
    public boolean equals(Object o) {
        if (!(o instanceof CommitteeAssignment)) {
            return false;
        }
        CommitteeAssignment other = (CommitteeAssignment) o;
        return this.id.equals(other.id);
    }

    @Override
    public int hashCode() {
        return this.id.hashCode();
    }

}
