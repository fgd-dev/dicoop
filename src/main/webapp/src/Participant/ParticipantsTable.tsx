import {
  Button,
  Group,
  Modal,
  MultiSelect,
  NumberInput,
  Radio,
  RadioGroup,
  Select,
  Space,
  Switch,
  Table,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/hooks";
import { CheckIcon } from "@primer/octicons-react";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { DistanceMatrix, Person } from "../api";
import { NamedEntity } from "../Model/NamedEntity";
import "./ParticipantsTable.css";
import {
  getSortedAvailabilitiesFromParticipants,
  getSortedSkillsFromParticipants,
} from "./ParticipantsTools";

type ParticipantsTableProps = {
  participants: Array<Person>;
  updateParticipant: (key: string, participant: Person) => void;
  deleteParticipant: (key: string) => void;
  distances: DistanceMatrix;
};

function ParticipantsTable({
  participants,
  updateParticipant,
  deleteParticipant,
  distances,
}: ParticipantsTableProps) {
  const { t } = useTranslation();
  const badgeList = (namedList?: Array<NamedEntity>) => (
    <>
      {namedList?.map((item: any) => (
        <div key={item.name} className="label">
          <span>{item.name}</span>
        </div>
      ))}
    </>
  );

  // Edition modal
  const [opened, setOpened] = useState(false);
  const participantForm = useForm({
    initialValues: {
      key: "",
      name: "",
      type: "professional",
      location: "",
      skills: [] as Array<string>,
      availability: [] as Array<string>,
      requiredSkills: [] as Array<string>,
      vetoes: [] as Array<string>,
      needsEvaluation: false,
      maxNumberOfInspections: undefined as number | undefined,
    },
    validationRules: {
      name: (value) => value.trim().length > 0,
    },
  });
  const [locations, setLocations] = useState<Array<string>>([]);
  const [skills, setSkills] = useState<Array<string>>([]);
  const [availabilities, setAvailabilities] = useState<Array<string>>([]);
  const [vetoes, setVetoes] = useState<Array<string>>([]);

  const createParticipant = () => {
    editParticipant({} as Person);
  };

  const setDefaultSelectData = () => {
    // initialize the locations with the existing ones in participants
    const locationsFromParticipantsAndDistances = new Set(
      participants
        .map((p) => p.location?.name ?? "")
        .filter((l) => l && l.length > 0)
    );
    // adding the locations from the distances
    distances.locations?.forEach((l) =>
      locationsFromParticipantsAndDistances.add(l)
    );
    setLocations(Array.from(locationsFromParticipantsAndDistances).sort());
    // initialize the skills with the existing ones in participants
    setSkills(getSortedSkillsFromParticipants(participants));
    // initialize the availability with the existing ones in participants
    setAvailabilities(getSortedAvailabilitiesFromParticipants(participants));
    // initialize the vetoes with the existing names in participants
    setVetoes(
      Array.from(
        new Set(
          participants.map((p) => p.name ?? "").filter((l) => l && l.length > 0)
        )
      ).sort()
    );
  };

  const editParticipant = (participant: Person) => {
    setDefaultSelectData();
    // Setting the form values from the participant
    participantForm.setFieldValue("key", participant?.name ?? "");
    participantForm.setFieldValue("name", participant?.name ?? "");
    participantForm.setFieldValue(
      "type",
      participant?.personType?.name ?? "professional"
    );
    participantForm.setFieldValue(
      "location",
      participant?.location?.name ?? ""
    );
    participantForm.setFieldValue(
      "skills",
      participant?.skills?.map((s) => s.name ?? "") ?? []
    );
    participantForm.setFieldValue(
      "availability",
      participant?.availability?.map((s) => s.name ?? "") ?? []
    );
    participantForm.setFieldValue(
      "requiredSkills",
      participant?.requiredSkills?.map((s) => s.name ?? "") ?? []
    );
    participantForm.setFieldValue(
      "needsEvaluation",
      participant?.needsEvaluation ?? true
    );
    participantForm.setFieldValue(
      "maxNumberOfInspections",
      participant?.maxNumberOfInspections
    );
    participantForm.setFieldValue(
      "vetoes",
      participant?.vetoes?.map((s) => s.name ?? "") ?? []
    );
    setOpened(true);
  };

  const multiSelectStyles = {
    label: { fontSize: "0.9rem", overflow: "visible" },
  };

  return (
    <>
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title={t("participant.label")}
        closeOnClickOutside={false}
      >
        <form
          onSubmit={participantForm.onSubmit((values) => {
            const participant = {
              name: values.name,
              personType: { name: values.type },
              location: { name: values.location },
              skills: values.skills.map((s) => ({ name: s })),
              availability: values.availability.map((s) => ({ name: s })),
              requiredSkills: values.requiredSkills.map((s) => ({
                name: s,
              })),
              vetoes: values.vetoes.map((s) => ({ name: s })),
              needsEvaluation: values.needsEvaluation,
              maxNumberOfInspections: values.maxNumberOfInspections,
            } as Person;
            updateParticipant(values.key, participant);
            setOpened(false);
          })}
        >
          <TextInput
            data-autofocus
            required
            placeholder={t("participant.namePlaceholder")}
            label={t("participant.name")}
            value={participantForm.values.name}
            onChange={(event) =>
              participantForm.setFieldValue("name", event.currentTarget.value)
            }
            error={participantForm.errors.name}
          />
          <Space h="lg" />
          <RadioGroup
            label={t("participant.type")}
            required
            value={participantForm.values.type}
            onChange={(value) => participantForm.setFieldValue("type", value)}
          >
            <Radio value="professional" label={t("participant.professional")} />
            <Radio
              value="non-professional"
              label={t("participant.non-professional")}
            />
            <Radio value="external" label={t("participant.external")} />
          </RadioGroup>
          <Space h="lg" />
          <Select
            label={t("participant.location")}
            placeholder={t("participant.locationPlaceholder")}
            data={locations}
            creatable
            searchable
            clearable
            clearButtonLabel={t("participant.clearButtonLabel")}
            getCreateLabel={(query) => `+ Create ${query}`}
            onCreate={(query) => setLocations((current) => [...current, query])}
            value={participantForm.values.location}
            onChange={(value) =>
              participantForm.setFieldValue("location", value ?? "")
            }
          />
          <Space h="lg" />
          <MultiSelect
            label={t("participant.skills")}
            data={skills}
            placeholder={t("participant.skillsPlaceholder")}
            searchable
            creatable
            clearable
            clearButtonLabel={t("participant.clearButtonLabel")}
            getCreateLabel={(query) => `+ Create ${query}`}
            onCreate={(query) => setSkills((current) => [...current, query])}
            value={participantForm.values.skills}
            onChange={(values) =>
              participantForm.setFieldValue("skills", values)
            }
            styles={multiSelectStyles}
          />
          <Space h="lg" />
          <MultiSelect
            label={t("participant.availability")}
            data={availabilities}
            placeholder={t("participant.availabilityPlaceholder")}
            searchable
            creatable
            clearable
            clearButtonLabel={t("participant.clearButtonLabel")}
            getCreateLabel={(query) => `+ Create ${query}`}
            onCreate={(query) =>
              setAvailabilities((current) => [...current, query])
            }
            value={participantForm.values.availability}
            onChange={(values) =>
              participantForm.setFieldValue("availability", values)
            }
            styles={multiSelectStyles}
          />
          {participantForm.values.type === "professional" && (
            <>
              <Space h="lg" />
              <MultiSelect
                label={t("participant.requiredSkills")}
                data={skills}
                placeholder={t("participant.requiredSkillsPlaceholder")}
                searchable
                creatable
                clearable
                clearButtonLabel={t("participant.clearButtonLabel")}
                getCreateLabel={(query) => `+ Create ${query}`}
                onCreate={(query) =>
                  setSkills((current) => [...current, query])
                }
                value={participantForm.values.requiredSkills}
                onChange={(values) =>
                  participantForm.setFieldValue("requiredSkills", values)
                }
                styles={multiSelectStyles}
              />
            </>
          )}
          <Space h="lg" />
          <MultiSelect
            label={t("participant.vetoes")}
            data={vetoes}
            placeholder={t("participant.vetoesPlaceholder")}
            searchable
            creatable
            clearable
            clearButtonLabel={t("participant.clearButtonLabel")}
            getCreateLabel={(query) => `+ Create ${query}`}
            onCreate={(query) => setVetoes((current) => [...current, query])}
            value={participantForm.values.vetoes}
            onChange={(values) =>
              participantForm.setFieldValue("vetoes", values)
            }
            styles={multiSelectStyles}
          />
          {participantForm.values.type === "professional" && (
            <>
              <Space h="lg" />
              <Switch
                label={t("participant.needsEvaluation")}
                checked={participantForm.values.needsEvaluation}
                onChange={(event) =>
                  participantForm.setFieldValue(
                    "needsEvaluation",
                    event.currentTarget.checked
                  )
                }
              />
            </>
          )}
          <Space h="lg" />
          <NumberInput
            label={t("participant.maxNumberOfInspections")}
            description={t("participant.maxNumberOfInspectionsDescription")}
            value={participantForm.values.maxNumberOfInspections}
            min={0}
            onChange={(val) =>
              participantForm.setFieldValue("maxNumberOfInspections", val)
            }
          />
          <Space h="lg" />
          <Group>
            <Group>
              <Button type="submit">{t("participant.save")}</Button>
              <Button
                type="button"
                color="gray"
                onClick={() => setOpened(false)}
              >
                {t("participant.cancel")}
              </Button>
            </Group>
            <Button
              type="button"
              color="red"
              onClick={() => {
                if (window.confirm(t("participant.deleteConfirm"))) {
                  deleteParticipant(participantForm.values.key);
                  setOpened(false);
                }
              }}
            >
              {t("participant.delete")}
            </Button>
          </Group>
        </form>
      </Modal>
      <Button type="button" onClick={createParticipant}>
        {t("participant.addAParticipant")}
      </Button>
      <Table highlightOnHover aria-label="Participants" id="table-basic">
        <thead>
          <tr role="row">
            <th role="columnheader" scope="col">
              #
            </th>
            <th role="columnheader" scope="col">
              {t("participant.name")}
            </th>
            <th role="columnheader" scope="col">
              {t("participant.type")}
            </th>
            <th role="columnheader" scope="col">
              {t("participant.location")}
            </th>
            <th role="columnheader" scope="col">
              {t("participant.skills")}
            </th>
            <th role="columnheader" scope="col">
              {t("participant.availability")}
            </th>
            <th role="columnheader" scope="col">
              {t("participant.requiredSkills")}
            </th>
            <th role="columnheader" scope="col">
              {t("participant.vetoes")}
            </th>
            <th role="columnheader" scope="col">
              {t("participant.needsEvaluation")}
            </th>
            <th role="columnheader" scope="col">
              {t("participant.maxNumberOfInspections")}
            </th>
          </tr>
        </thead>
        {participants.map((person, index) => (
          <tbody
            key={person.name}
            onClick={() => editParticipant(person)}
            title={`${t("participant.clickToEdit")} ${person.name}`}
            className="cursorPointer"
          >
            <tr role="row">
              <td role="cell" data-label="Index">
                {index + 1}
              </td>
              <td role="cell" data-label="Name">
                {person.name}
              </td>
              <td role="cell" data-label="Type">
                {t(`participant.${person.personType?.name}`)}
              </td>
              <td role="cell" data-label="Location">
                {person.location?.name}
              </td>
              <td role="cell" data-label="Skills">
                {badgeList(person.skills as Array<NamedEntity>)}
              </td>
              <td role="cell" data-label="Availability">
                {badgeList(person.availability as Array<NamedEntity>)}
              </td>
              <td role="cell" data-label="Required skills">
                {badgeList(person.requiredSkills as Array<NamedEntity>)}
              </td>
              <td role="cell" data-label="Vetoes">
                {badgeList(person.vetoes as Array<NamedEntity>)}
              </td>
              <td role="cell" data-label="Name">
                {person.needsEvaluation ? <CheckIcon /> : ""}
              </td>
              <td role="cell" data-label="Name">
                {person.maxNumberOfInspections}
              </td>
            </tr>
          </tbody>
        ))}
      </Table>
    </>
  );
}

export default ParticipantsTable;
