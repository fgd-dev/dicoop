import {
  Checkbox,
  Container,
  Grid,
  InputWrapper,
  LoadingOverlay,
  NumberInput,
  RangeSlider,
  Space,
} from "@mantine/core";
import React from "react";
import { useTranslation } from "react-i18next";
import { SettingsState } from "../Model/SettingsState";

type SolutionSettingsProps = {
  settingsState: SettingsState;
  setSettingsState: (
    statePartial:
      | Partial<SettingsState>
      | ((currentState: SettingsState) => Partial<SettingsState>)
  ) => void;
  isSolving: boolean;
};

function SolutionSettingsForm({
  settingsState,
  setSettingsState,
  isSolving,
}: SolutionSettingsProps) {
  const min = 0;
  const max = 5;
  const marks = [
    { value: 0, label: "0" },
    { value: 1, label: "1" },
    { value: 2, label: "2" },
    { value: 3, label: "3" },
    { value: 4, label: "4" },
    { value: 5, label: "5" },
  ];

  const { t } = useTranslation();

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <LoadingOverlay visible={isSolving} />
      <Grid>
        <Grid.Col span={6}>
          <Container>
            <InputWrapper
              id="nbProParticipants"
              label={t("settings.nbProParticipants")}
            >
              <RangeSlider
                id="nbProParticipants"
                value={settingsState.nbProParticipants}
                step={1}
                min={min}
                max={max}
                minRange={0}
                marks={marks}
                onChange={(values) =>
                  setSettingsState({ nbProParticipants: values })
                }
              />
            </InputWrapper>

            <Space h="lg" />

            <InputWrapper
              id="numberOfAssignmentsPro"
              label={t("settings.nbAssignmentsPerPro")}
            >
              <RangeSlider
                id="numberOfAssignmentsPro"
                value={settingsState.numberOfAssignmentsForAProfessional}
                step={1}
                min={min}
                max={max}
                minRange={0}
                marks={marks}
                onChange={(values) =>
                  setSettingsState({
                    numberOfAssignmentsForAProfessional: values,
                  })
                }
              />
            </InputWrapper>

            <Space h="lg" />

            <InputWrapper
              id="nbNonProParticipants"
              label={t("settings.nbNonProParticipants")}
            >
              <RangeSlider
                id="nbNonProParticipants"
                value={settingsState.nbNonProParticipants}
                step={1}
                min={min}
                max={max}
                minRange={0}
                marks={marks}
                onChange={(values) =>
                  setSettingsState({ nbNonProParticipants: values })
                }
              />
            </InputWrapper>

            <Space h="lg" />

            <InputWrapper
              id="numberOfAssignmentsNonPro"
              label={t("settings.nbAssignmentsPerNonPro")}
            >
              <RangeSlider
                id="numberOfAssignmentsNonPro"
                value={settingsState.numberOfAssignmentsForANonProfessional}
                step={1}
                min={min}
                max={max}
                minRange={0}
                marks={marks}
                onChange={(values) =>
                  setSettingsState({
                    numberOfAssignmentsForANonProfessional: values,
                  })
                }
              />
            </InputWrapper>

            <Space h="lg" />

            <InputWrapper
              id="nbExternalParticipants"
              label={t("settings.nbExternalParticipants")}
            >
              <RangeSlider
                id="nbExternalParticipants"
                value={settingsState.nbExternalParticipants}
                step={1}
                min={min}
                max={max}
                minRange={0}
                marks={marks}
                onChange={(values) =>
                  setSettingsState({ nbExternalParticipants: values })
                }
              />
            </InputWrapper>

            <Space h="lg" />

            <InputWrapper
              id="numberOfAssignmentsExternal"
              label={t("settings.nbAssignmentsPerExternal")}
            >
              <RangeSlider
                id="numberOfAssignmentsExternal"
                value={settingsState.numberOfAssignmentsForAnExternal}
                step={1}
                min={min}
                max={max}
                minRange={0}
                marks={marks}
                onChange={(values) =>
                  setSettingsState({
                    numberOfAssignmentsForAnExternal: values,
                  })
                }
              />
            </InputWrapper>

            <Space h="lg" />
          </Container>
        </Grid.Col>
        <Grid.Col span={6}>
          <InputWrapper
            id="nbRotationsToReinspect"
            label={t("settings.nbRotations")}
          >
            <br />
            <NumberInput
              value={settingsState.nbRotationsToReinspect}
              min={0}
              required
              size="xs"
              style={{ width: "60px", display: "inline-block" }}
              onChange={(value) =>
                setSettingsState({ nbRotationsToReinspect: value })
              }
            />
          </InputWrapper>

          <Space h="lg" />

          <InputWrapper
            id="nbInspectorsFollowingUp"
            label={t("settings.nbInspectorsFollowingUp")}
          >
            <br />
            <NumberInput
              value={settingsState.nbInspectorsFollowingUp}
              min={0}
              required
              size="xs"
              style={{ width: "60px", display: "inline-block" }}
              onChange={(value) =>
                setSettingsState({ nbInspectorsFollowingUp: value })
              }
            />
          </InputWrapper>

          <Space h="lg" />

          <InputWrapper
            id="travellingDistanceRange"
            label={t("settings.travellingDistanceRange")}
          >
            <br />
            <NumberInput
              label="Min"
              min={0}
              value={settingsState.travellingDistanceRange[0]}
              required
              size="xs"
              style={{ width: "60px", display: "inline-block" }}
              onChange={(value) =>
                setSettingsState({
                  travellingDistanceRange: [
                    value ?? 0,
                    settingsState.travellingDistanceRange[1],
                  ],
                })
              }
            />
            <NumberInput
              label="Max"
              min={0}
              value={settingsState.travellingDistanceRange[1]}
              required
              size="xs"
              style={{
                width: "60px",
                display: "inline-block",
                marginLeft: "10px",
              }}
              onChange={(value) =>
                setSettingsState({
                  travellingDistanceRange: [
                    settingsState.travellingDistanceRange[0],
                    value ?? 0,
                  ],
                })
              }
            />
          </InputWrapper>

          <Space h="lg" />

          <InputWrapper
            id="committeeMeetingSize"
            label={t("settings.committeeMeetingSize")}
          >
            <br />
            <NumberInput
              label="Min"
              min={0}
              value={settingsState.committeeMeetingSize[0]}
              required
              size="xs"
              style={{ width: "60px", display: "inline-block" }}
              onChange={(value) =>
                setSettingsState({
                  committeeMeetingSize: [
                    value ?? 0,
                    settingsState.committeeMeetingSize[1],
                  ],
                })
              }
            />
            <NumberInput
              label="Max"
              min={0}
              value={settingsState.committeeMeetingSize[1]}
              required
              size="xs"
              style={{
                width: "60px",
                display: "inline-block",
                marginLeft: "10px",
              }}
              onChange={(value) =>
                setSettingsState({
                  committeeMeetingSize: [
                    settingsState.committeeMeetingSize[0],
                    value ?? 0,
                  ],
                })
              }
            />
          </InputWrapper>

          <Space h="lg" />

          <Checkbox
            label={t("settings.useAvailability")}
            checked={settingsState.useAvailability}
            onChange={(e) =>
              setSettingsState({ useAvailability: e.target.checked })
            }
          />

          <Space h="lg" />

          <Checkbox
            label={t("settings.shuffleParticipants")}
            checked={settingsState.shuffleParticipants}
            onChange={(e) =>
              setSettingsState({ shuffleParticipants: e.target.checked })
            }
          />

          <Space h="lg" />
        </Grid.Col>
      </Grid>
    </div>
  );
}

export default SolutionSettingsForm;
