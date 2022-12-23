package fr.cirad.domain;

import java.util.Comparator;
import org.optaplanner.core.api.domain.lookup.PlanningId;

public class TimeSlot implements Comparable<TimeSlot> {

    @PlanningId
    public String name;

    private Settings settings;

    private static final Comparator<TimeSlot> COMPARATOR = Comparator.comparing(ts -> ts.name);

    public TimeSlot() {
        // No-arg constructor required for Hibernate and OptaPlanner
    }

    public TimeSlot(String name, Settings settings) {
        this.name = name;
        this.settings = settings;
    }

    public static TimeSlot copyAndSetSettings(TimeSlot t, Settings settings) {
        return new TimeSlot(t.name, settings);
    }

    public void setSettings(Settings settings) {
        this.settings = settings;
    }

    public boolean isNumberOfCommitteesInRange(int nbCommittees) {
        return settings.committeeMeetingSize.contains(nbCommittees);
    }

    @Override
    public int compareTo(TimeSlot o) {
        return COMPARATOR.compare(this, o);
    }

    @Override
    public boolean equals(Object o) {
        if (!(o instanceof TimeSlot)) {
            return false;
        }
        TimeSlot other = (TimeSlot) o;
        return this.name.equalsIgnoreCase(other.name);
    }

    @Override
    public int hashCode() {
        return this.name.hashCode();
    }

    @Override
    public String toString() {
        return "TimeSlot: " + name;
    }

}
