import { Modal, ThemeIcon } from "@mantine/core";
import { useErrorMessage } from "./ErrorMessageContext";
import { WarningIcon } from "@phosphor-icons/react";

export default function ErrorMessage() {
  const { state, closeErrorMessage } = useErrorMessage();
  return (
    <Modal
      opened={state.isErrorModalOpen}
      onClose={closeErrorMessage}
      title={
        <>
          <ThemeIcon color="red">
            <WarningIcon />
          </ThemeIcon>
          &nbsp;
          <b>{state.title}</b>
        </>
      }
    >
      {state.message}
    </Modal>
  );
}
