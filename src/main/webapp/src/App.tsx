import {
  AppShell,
  Button,
  Divider,
  Drawer,
  Group,
  Header,
  Radio,
  RadioGroup,
  Space,
  Tabs,
} from "@mantine/core";
import { useLocalStorage, useSetState } from "@mantine/hooks";
import { useEffect, useRef, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import {
  CommitteeSolutionResourceApi,
  Configuration,
  Person,
  Range,
  Settings,
  SolverOptions,
} from "./api";
import "./App.css";
import DistancesTable from "./Distances/DistancesTable";
import ErrorMessage from "./ErrorMessage/ErrorMessage";
import { useErrorMessage } from "./ErrorMessage/ErrorMessageContext";
import HeaderMenu from "./HeaderMenu/HeaderMenu";
import HistoryTable from "./History/HistoryTable";
import DicoopLogo from "./images/logo.svg";
import { CommitteeSet } from "./Model/CommitteeSet";
import {
  DEFAULT_SETTINGS_STATE,
  NO_DISTANCES,
  UNDEFINED_SOLUTION,
} from "./Model/Defaults";
import { stringNotEmpty } from "./Model/ModelUtils";
import { PersistenceData } from "./Model/PersistenceData";
import { SettingsState } from "./Model/SettingsState";
import { Solution } from "./Model/Solution";
import ParticipantsTable from "./Participant/ParticipantsTable";
import { excelExport, excelImport } from "./Persistence/Excel";
import { ValidationResult } from "./Persistence/ExcelValidation";
import SolutionSettingsForm from "./Solution/SolutionSettingsForm";
import SolutionTable from "./Solution/SolutionTable";
import { buildModel, buildSolution, ClingoResult } from "./Solver/clingo";
import CookieConsent from "react-cookie-consent";

declare const clingo: any;

function App() {
  const debug = false;
  // Translation
  const { t } = useTranslation();

  // Error modal from the context
  const showErrorMessage = useErrorMessage().showErrorMessage;

  // Application state
  const [isSolving, setIsSolving] = useState(false);
  const [participants, setParticipants] = useLocalStorage({
    key: "participants",
    defaultValue: [] as Array<Person>,
  });
  const [committeeSolution, setCommitteeSolution] =
    useState(UNDEFINED_SOLUTION);
  const [history, setHistory] = useLocalStorage<Array<CommitteeSet>>({
    key: "history",
    defaultValue: [] as Array<CommitteeSet>,
    deserialize: CommitteeSet.deserialize,
  });
  const [distanceMatrix, setDistanceMatrix] = useLocalStorage({
    key: "distances",
    defaultValue: NO_DISTANCES,
  });
  const [solver, setSolver] = useState("optaplanner");

  const resetAll = () => {
    setParticipants([]);
    setHistory([]);
    setDistanceMatrix(NO_DISTANCES);
    setSettingsState(DEFAULT_SETTINGS_STATE);
  };

  const updateDistance = (i: number, j: number, value: number) => {
    if (distanceMatrix.distances) distanceMatrix.distances[i][j] = value;
    setDistanceMatrix({
      locations: distanceMatrix.locations,
      distances: distanceMatrix.distances,
    });
  };

  const updateParticipant = (key: string, participant: Person) => {
    if (key.length) {
      setParticipants(
        participants.map((p) => (p.name === key ? participant : p))
      );
    } else {
      setParticipants([...participants, participant]);
    }
    // Checking if we have a new location to handle in the distance matrix
    const locationName = participant.location?.name ?? "";
    if (
      stringNotEmpty(locationName) &&
      distanceMatrix.locations?.indexOf(locationName) === -1
    ) {
      distanceMatrix.distances?.forEach((distanceLocal) => {
        distanceLocal.push(0);
      });
      distanceMatrix.distances?.push(
        new Array(distanceMatrix.locations.length + 1).fill(0)
      );
      setDistanceMatrix({
        locations: [...distanceMatrix.locations, locationName],
        distances: distanceMatrix.distances,
      });
    }
  };

  const deleteParticipant = (key: string) => {
    if (key.length) {
      setParticipants(participants.filter((p) => p.name !== key));
    }
  };

  // Tabs state
  const [activeTabKey, setActiveTabKey] = useState(0);
  const [solutionTabDisabled, setSolutionTabDisabled] = useState(true);

  // Settings state
  const [settingsLocal, setSettingsLocal] = useLocalStorage({
    key: "settings",
    defaultValue: DEFAULT_SETTINGS_STATE,
    deserialize: (localStorageValue: string): SettingsState => {
      if (!localStorageValue) return DEFAULT_SETTINGS_STATE;
      const state = JSON.parse(localStorageValue) as SettingsState;
      // We need to check some values if local state is already defined with missing new ones
      if (!state.committeeMeetingSize) {
        state.committeeMeetingSize = [0, 10];
      }
      return state;
    },
  });
  const [settingsState, setSettingsState] = useSetState(settingsLocal);

  // We are using useSetState to be able to partially set a setting value
  // But we need to do extra work to save the state in the local storage
  useEffect(() => {
    setSettingsLocal(settingsState);
  }, [settingsState, setSettingsLocal]);

  const getSettings = () =>
    ({
      nbProParticipants: {
        value: settingsState.nbProParticipants,
      } as Range,
      numberOfAssignmentsForAProfessional: {
        value: settingsState.numberOfAssignmentsForAProfessional,
      } as Range,
      nbNonProParticipants: {
        value: settingsState.nbNonProParticipants,
      } as Range,
      numberOfAssignmentsForANonProfessional: {
        value: settingsState.numberOfAssignmentsForANonProfessional,
      } as Range,
      nbExternalParticipants: {
        value: settingsState.nbExternalParticipants,
      } as Range,
      numberOfAssignmentsForAnExternal: {
        value: settingsState.numberOfAssignmentsForAnExternal,
      } as Range,
      nbRotationsToReinspect: settingsState.nbRotationsToReinspect,
      nbInspectorsFollowingUp: settingsState.nbInspectorsFollowingUp,
      distanceMatrix,
      travellingDistanceRange: {
        value: settingsState.travellingDistanceRange,
      } as Range,
      committeeMeetingSize: {
        value: settingsState.committeeMeetingSize,
      } as Range,
      useAvailability: settingsState.useAvailability,
      shuffleParticipants: settingsState.shuffleParticipants,
    } as Settings);

  function setFromRange(
    rangeValue: Range | undefined
  ): [number, number] | undefined {
    return (rangeValue?.value as [number, number]) ?? [0, 0];
  }

  const setSettings = (settings: Settings) => {
    setSettingsState({
      nbProParticipants: setFromRange(settings?.nbProParticipants),
      numberOfAssignmentsForAProfessional: setFromRange(
        settings?.numberOfAssignmentsForAProfessional
      ),
      nbNonProParticipants: setFromRange(settings?.nbNonProParticipants),
      numberOfAssignmentsForANonProfessional: setFromRange(
        settings?.numberOfAssignmentsForANonProfessional
      ),
      nbExternalParticipants: setFromRange(settings?.nbExternalParticipants),
      numberOfAssignmentsForAnExternal: setFromRange(
        settings?.numberOfAssignmentsForAnExternal
      ),
      nbRotationsToReinspect: settings?.nbRotationsToReinspect ?? 0,
      nbInspectorsFollowingUp: settings?.nbInspectorsFollowingUp ?? 0,
      travellingDistanceRange: (settings?.travellingDistanceRange?.value as [
        number,
        number
      ]) ?? [0, 0],
      committeeMeetingSize: (settings?.committeeMeetingSize?.value as [
        number,
        number
      ]) ?? [0, 0],
      useAvailability: settings?.useAvailability ?? false,
      shuffleParticipants: settings?.shuffleParticipants ?? false,
    });
  };

  // API configuration
  const apiConfig = new Configuration({
    basePath: window.location.origin,
  });
  const committeeSolutionResourceApi = new CommitteeSolutionResourceApi(
    apiConfig
  );

  // data import and export
  const dataExport = () => {
    excelExport(
      getSettings(),
      participants,
      history,
      distanceMatrix,
      committeeSolution
    );
  };

  const onDataImport = (data: PersistenceData) => {
    setCommitteeSolution(UNDEFINED_SOLUTION);
    setSettings(data.settings);
    setParticipants(data.participants);
    setHistory(data.history);
    setDistanceMatrix(data.distanceMatrix);
    setSolutionTabDisabled(true);
    setActiveTabKey(0);
  };

  const onDataImportError = (result: ValidationResult) => {
    showErrorMessage(t("excelImportError"), result.getMessage());
  };

  const dataImport = (file: any) => {
    excelImport(file, onDataImport, onDataImportError);
  };

  const getParticipantsWithHistory = () => {
    // We always want at least the last rotation to be able to check the follow up rule
    const numberOfRotationsToTakeInAccount = Math.max(
      settingsState.nbRotationsToReinspect,
      1
    );
    const historyToTake = history.slice(0, numberOfRotationsToTakeInAccount);
    participants.forEach((participant) => {
      const hasAlreadyInspected = [] as string[][];
      historyToTake.forEach((set) => {
        const inspectionTurn = [] as string[];
        set.getCommittees().forEach((committee) => {
          if (
            committee
              .getAssignments()
              .map((a) => a.assignedPerson?.name)
              .includes(participant.name)
          ) {
            inspectionTurn.push(committee.evaluatedPerson?.name ?? "");
          }
        });
        hasAlreadyInspected.push(inspectionTurn);
      });
      participant.hasAlreadyInspected = hasAlreadyInspected;
    });
    return participants;
  };

  const buildFetchErrorMessage = (error: any): string => {
    console.error("API Error:", error);
    if (error instanceof Response) {
      return `HTTP ${error.status}: ${error.statusText}`;
    }
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === 'string') {
      return error;
    }
    return JSON.stringify(error);
  };

  const startSolving = () => {
    setIsSolving(true);
    const options = {
      settings: getSettings(),
      participants: getParticipantsWithHistory(),
    } as SolverOptions;
    if (solver === "clingo") {
      // Init message
      const initSolution = UNDEFINED_SOLUTION;
      initSolution.solverStatus = "LAUNCHING_CLINGO";
      setCommitteeSolution(initSolution);
      // Building the model and running clingo
      const model = buildModel(options);
      console.log(model);
      clingo
        .run(model)
        .then((result: any) => {
          const parsedResult = result as ClingoResult;
          console.log(JSON.stringify(parsedResult));
          const clingoSolution = buildSolution(options, parsedResult);
          setCommitteeSolution(clingoSolution);
          setSolutionTabDisabled(false);
          setActiveTabKey(3);
        })
        .finally(() => setIsSolving(false));
    } else {
      committeeSolutionResourceApi
        .apiCommitteeSolutionSolvePost({ solverOptions: options })
        .then((resp) => {
          const solutionId = resp.id ?? "ID_ERROR";
          const initializedSolution = UNDEFINED_SOLUTION;
          initializedSolution.id = solutionId;
          initializedSolution.solverStatus = "INITIALIZING";
          setCommitteeSolution(initializedSolution);
          setTimeout(() => {
            refreshSolution(solutionId);
          }, 2000);
        })
        .catch((error) => {
          setIsSolving(false);
          showErrorMessage(
            t("solverStartingError"),
            buildFetchErrorMessage(error)
          );
        });
    }
  };

  const stopSolving = () => {
    if (solver !== "clingo" && committeeSolution.id) {
      committeeSolutionResourceApi
        .apiCommitteeSolutionStopSolvingIdGetRaw({ id: committeeSolution.id })
        .then((res) => {
          setIsSolving(false);
        })
        .catch((error: any) => {
          console.error("Stop solving error:", error);
          setIsSolving(false);
          let errorMessage = "Unknown error";
          if (error instanceof TypeError && error.message.includes("JSON")) {
            errorMessage = "Backend returned plain text instead of JSON";
          } else if (error instanceof Response) {
            errorMessage = `HTTP ${error.status}: ${error.statusText}`;
          } else if (error instanceof Error) {
            errorMessage = error.message;
          } else if (typeof error === 'string') {
            errorMessage = error;
          }
          showErrorMessage(
            t("solverStoppingError"),
            errorMessage
          );
        });
    }
  };

  const refreshSolution = (id: string) => {
    setSolutionTabDisabled(false);
    setActiveTabKey(3);
    committeeSolutionResourceApi
      .apiCommitteeSolutionIdGet({ id })
      .then((res) => {
        setCommitteeSolution(Solution.fromCommitteeSolution(res));
        if (res.solverStatus === "SOLVING_ACTIVE") {
          setTimeout(() => {
            refreshSolution(id);
          }, 2000);
        } else {
          setIsSolving(false);
        }
      })
      .catch((error) => {
        setIsSolving(false);
        showErrorMessage(
          t("solverRefreshingError"),
          buildFetchErrorMessage(error)
        );
      });
  };

  // file picker
  const inputFile = useRef<HTMLInputElement>(null);
  const handleFileOpened = (e: any) => {
    const { files } = e.target;
    if (files?.length) {
      const file = files[0];
      dataImport(file);
      e.target.value = ""; // trick to allow the selection of the same file again
    }
  };
  const openFileDialog = () => {
    inputFile?.current?.click();
  };

  // Sore explanation
  const [showMore, setShowMore] = useState(false);
  const showScore = () => {
    const parsedScore = JSON.parse(committeeSolution.score);
    return (
      <ul>
        {Object.keys(parsedScore).map((i) => (
          <li key={i}>
            {t(`status.score.${i}`)} ={" "}
            {typeof parsedScore[i] === "number"
              ? parsedScore[i].toString()
              : t(`status.score.${parsedScore[i]}`)}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <>
      <AppShell
        padding="md"
        navbar={
          <AppShell.Navbar width={{ base: 300 }} p="xs">
            <div>
              <input
                style={{ display: "none" }}
                accept=".xlsx"
                ref={inputFile}
                onChange={handleFileOpened}
                type="file"
              />
              {isSolving ? (
                <Button onClick={stopSolving}>{t("controls.stop")}</Button>
              ) : (
                <Group>
                  <Button onClick={openFileDialog}>
                    {t("controls.import")}
                  </Button>
                  <Button onClick={dataExport}>{t("controls.export")}</Button>
                  <Button onClick={startSolving}>{t("controls.solve")}</Button>
                  <Button type="button" color="red" onClick={resetAll}>
                    {t("controls.reset")}
                  </Button>
                </Group>
              )}
            </div>
            <div>
              <RadioGroup
                value={solver}
                onChange={setSolver}
                label="Solver"
                spacing="xs"
                size="xs"
              >
                <Radio value="optaplanner" label="OptaPlanner" />
                <Radio value="clingo" label="Clingo" />
              </RadioGroup>
            </div>
            <Divider my="sm" />
            <div>
              <b>{t("status.label")}:</b>{" "}
              {t(`status.${committeeSolution.solverStatus}`)}
              <br />
              {debug && committeeSolution.id && (
                <div>
                  <b>{t("status.id")}:</b> {committeeSolution.id}
                </div>
              )}
              {committeeSolution.score && (
                <div>
                  <b>{t("status.scoreLabel")}:</b> {showScore()}
                </div>
              )}
              {committeeSolution.scoreExplanation && (
                <>
                  <Drawer
                    opened={showMore}
                    onClose={() => setShowMore(false)}
                    title={t("status.scoreExplanation")}
                    padding="xl"
                    size="75%"
                    position="right"
                  >
                    <textarea
                      style={{
                        width: "100%",
                        height: "92vh",
                        display: "block",
                      }}
                      value={committeeSolution.scoreExplanation}
                      readOnly
                    />
                  </Drawer>
                  <Space h="md" />
                  <Group>
                    <Button onClick={() => setShowMore(true)}>
                      {t("status.openScoreExplanation")}
                    </Button>
                  </Group>
                </>
              )}
            </div>
            </AppShell.Navbar>
        }
        header={
          <AppShell.Header height={120} p="xs">
            <div
              style={{ display: "flex", alignItems: "center", height: "100%" }}
            >
              <img src={DicoopLogo} className="dicoop-logo" alt="DICOOP" />
              <div className="dicoop-title">
                <h1>{t("appName")}</h1>
                <span>
                  <Trans i18nKey={"appSubTitle"}></Trans>
                </span>
              </div>
              <HeaderMenu />
            </div>
          </AppShell.Header>
        }
        styles={(theme) => ({
          main: {
            backgroundColor:
              theme.colorScheme === "dark"
                ? theme.colors.dark[8]
                : theme.colors.gray[0],
          },
        })}
      >
        {
          <>
            <SolutionSettingsForm
              settingsState={settingsState}
              setSettingsState={setSettingsState}
              isSolving={isSolving}
            />
            <Space h="xl" />
            <Tabs active={activeTabKey} onTabChange={setActiveTabKey}>
              <Tabs.Tab label={t("tabs.participants")}>
                <ParticipantsTable
                  participants={participants}
                  updateParticipant={updateParticipant}
                  deleteParticipant={deleteParticipant}
                  distances={distanceMatrix}
                />
              </Tabs.Tab>
              <Tabs.Tab label={t("tabs.distances")}>
                <DistancesTable
                  distanceMatrix={distanceMatrix}
                  updateDistance={updateDistance}
                />
              </Tabs.Tab>
              <Tabs.Tab label={t("tabs.history")}>
                <HistoryTable history={history} />
              </Tabs.Tab>
              <Tabs.Tab label={t("tabs.solution")} disabled={solutionTabDisabled}>
                <SolutionTable committees={committeeSolution.committees} />
              </Tabs.Tab>
            </Tabs>
            <ErrorMessage />
          </>
        }
      </AppShell>
      <CookieConsent buttonText={t("cookies.button")}>
        <span>{t("cookies.message1")}</span>
        <br />
        <span>{t("cookies.message2")}</span>
        <br />
        <span>{t("cookies.message3")}</span>
        <br />
        <span>{t("cookies.message4")}</span>
        <br />
      </CookieConsent>
    </>
  );
}

export default App;
