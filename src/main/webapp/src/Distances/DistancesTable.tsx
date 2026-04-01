import { NumberInput, Table } from "@mantine/core";
import { DistanceMatrix } from "../api";

type DistancesTableProps = {
  distanceMatrix: DistanceMatrix;
  updateDistance: (i: number, j: number, value: number) => void;
};

function DistancesTable({
  distanceMatrix,
  updateDistance,
}: DistancesTableProps) {
  return (
    <Table style={{ width: "auto" }}>
      <thead>
        <tr>
          <th />
          {distanceMatrix.locations?.map((location) => (
            <th key={location}>{location}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {distanceMatrix.distances?.map((distanceLocal, i) => (
          <tr key={i}>
            <td>
              <b>{distanceMatrix.locations?.[i]}</b>
            </td>
            {distanceLocal.map((distance, j) => (
              <td key={j}>
                <NumberInput
                  value={distance}
                  required
                  size="xs"
                  style={{ width: "60px" }}
                  onChange={(value) => updateDistance(i, j, value ?? 0)}
                />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

export default DistancesTable;
