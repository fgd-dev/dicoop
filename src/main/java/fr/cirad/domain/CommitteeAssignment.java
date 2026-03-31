package fr.cirad.domain;

import java.util.Comparator;
import com.fasterxml.jackson.annotation.JsonIgnore;
import ai.timefold.solver.core.api.domain.entity.PlanningEntity;
import ai.timefold.solver.core.api.domain.lookup.PlanningId;
import ai.timefold.solver.core.api.domain.variable.PlanningVariable;

@PlanningEntity
public class CommitteeAssignment implements Comparable<CommitteeAssignment> {

    @PlanningId
    public Long id;

    public Person assignedPerson;

    @PlanningVariable(valueRangeProviderRefs = {"committeeRange"}, nullable = true)
    public Committee committee;

    @JsonIgnore
    public DistanceMatrix distanceMatrix;

    private static final Comparator<CommitteeAssignment> COMPARATOR =
            Comparator.comparing(c -> c.id);

    public CommitteeAssignment() {
        // must have a no-args constructor so it can be constructed by OptaPlanner
    }

    public CommitteeAssignment(Long id, Person assignedPerson, DistanceMatrix distanceMatrix) {
        this.id = id;
        this.assignedPerson = assignedPerson;
        this.distanceMatrix = distanceMatrix;
    }

    public long getId() {
        return id;
    }

    public Person getAssignedPerson() {
        return assignedPerson;
    }

    public Committee getCommittee() {
        return committee;
    }

    @JsonIgnore
    public Integer getDistance() {
        if (assignedPerson == null || distanceMatrix == null) {
            return 0;
        }
        return distanceMatrix.getDistance(assignedPerson.location.name,
                committee.evaluatedPerson.location.name);
    }

    @Override
    public String toString() {
        return " CommitteeAssignment: assigned person " + assignedPerson + " for " + committee
                + " (" + id + ")";
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
