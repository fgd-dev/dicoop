package fr.cirad.domain;

import java.util.Comparator;
import ai.timefold.solver.core.api.domain.lookup.PlanningId;

public class Skill implements Comparable<Skill> {

    @PlanningId
    public String name;

    private static final Comparator<Skill> COMPARATOR = Comparator.comparing(s -> s.name);

    public Skill() {
        // No-arg constructor required for Hibernate and OptaPlanner
    }

    public Skill(String name) {
        this.name = name;
    }

    @Override
    public int compareTo(Skill o) {
        return COMPARATOR.compare(this, o);
    }

    @Override
    public boolean equals(Object o) {
        if (!(o instanceof Skill)) {
            return false;
        }
        Skill other = (Skill) o;
        return this.name.equalsIgnoreCase(other.name);
    }

    @Override
    public int hashCode() {
        return this.name.hashCode();
    }

    @Override
    public String toString() {
        return "Skill: " + name;
    }

}
