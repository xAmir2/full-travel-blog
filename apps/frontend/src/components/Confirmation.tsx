import { Button, Modal, Spinner } from "react-bootstrap";

import { Check2, ExclamationTriangle, Trash } from "react-bootstrap-icons";

interface ConfirmationProps {
  show: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  warning?: string;
  destructive?: boolean;
  isConfirming?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function Confirmation({
  show,
  title,
  message,
  confirmLabel = "Confirm",
  warning,
  destructive = false,
  isConfirming = false,
  onConfirm,
  onCancel,
}: ConfirmationProps) {
  function handleClose() {
    if (!isConfirming) {
      onCancel();
    }
  }

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      role="alertdialog"
      backdrop={isConfirming ? "static" : true}
      keyboard={!isConfirming}
      className="confirmation-modal"
    >
      <Modal.Header closeButton={!isConfirming}>
        <div className="confirmation-heading">
          <div
            className={`confirmation-icon ${destructive ? "destructive" : ""}`}
            aria-hidden="true"
          >
            {destructive ? <ExclamationTriangle /> : <Check2 />}
          </div>

          <div>
            <span className="confirmation-eyebrow">Please confirm</span>

            <Modal.Title>{title}</Modal.Title>
          </div>
        </div>
      </Modal.Header>

      <Modal.Body>
        <p className="confirmation-message">{message}</p>

        {warning && (
          <div
            className={`confirmation-warning ${
              destructive ? "destructive" : ""
            }`}
          >
            {warning}
          </div>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button
          type="button"
          variant="outline-secondary"
          disabled={isConfirming}
          onClick={handleClose}
        >
          Cancel
        </Button>

        <Button
          type="button"
          className={`confirmation-confirm-button ${
            destructive ? "destructive" : ""
          }`}
          disabled={isConfirming}
          onClick={onConfirm}
        >
          {isConfirming ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />

              {destructive ? "Deleting…" : "Saving…"}
            </>
          ) : (
            <>
              {destructive ? (
                <Trash className="me-2" />
              ) : (
                <Check2 className="me-2" />
              )}

              {confirmLabel}
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
