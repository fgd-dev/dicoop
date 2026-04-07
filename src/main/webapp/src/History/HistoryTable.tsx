import { Divider, Space, Title } from "@mantine/core";
import { CommitteeSet } from "../Model/CommitteeSet";
import SolutionTable from "../Solution/SolutionTable";

type HistoryTableProps = {
  history: Array<CommitteeSet>;
};

function HistoryTable({ history }: HistoryTableProps) {
  return (
    <>
      {history.map((committees) => (
        <div key={committees.id}>
          <Title order={3}>
            Solution {committees.date instanceof Date ? committees.date.toLocaleDateString() : committees.date}
          </Title>
          <SolutionTable committees={committees} />
          <Space h="xl" />
          <Divider />
          <Space h="xl" />
        </div>
      ))}
    </>
  );
}

export default HistoryTable;
