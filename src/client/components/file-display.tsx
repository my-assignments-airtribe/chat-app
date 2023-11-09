import React, { useEffect, useState } from "react";
import socket from "./socket";
import Modal from "./modal";
import { Document, Page, pdfjs } from "react-pdf";
import { Message } from "./chat-room";
import { DateTime } from "luxon";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const FileDisplay: React.FC<{
  userId: string;
  message: Message;
}> = ({ userId, message }) => {
  const fileUrl = message.message;
  const [fileType, setFileType] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (fileUrl.endsWith(".pdf")) {
      setFileType("pdf");
    } else if (fileUrl.endsWith(".doc") || fileUrl.endsWith(".docx")) {
      setFileType("document");
    } else if (
      fileUrl.endsWith(".jpg") ||
      fileUrl.endsWith(".jpeg") ||
      fileUrl.endsWith(".png")
    ) {
      setFileType("image");
    } else {
      setFileType("unknown");
    }

    window.addEventListener("keydown", handleKeyPress);

    return () => {
      socket.off("file");
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [fileUrl]);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      closeModal();
    }
  };

  const renderFile = () => {
    if (fileType === "image") {
      return (
        <div
          className={`${
            userId === message.userId ? "current-user" : "other-user"
          } image-upload cursor-pointer message-bubble`}
          onClick={openModal}
        >
          <strong>
            {userId === message.userId ? <></> : <p>{message.username}</p>}
          </strong>
          <img src={fileUrl} alt="Received Image" />
          <span className="small">
            {DateTime.fromISO(message.timestamp).toFormat("HH:mm")}
          </span>
        </div>
      );
    } else if (fileType === "pdf") {
      return (
        <div
          className={`${
            userId === message.userId ? "current-user" : "other-user"
          } pdf-upload cursor-pointer message-bubble`}
          onClick={openModal}
        >
          <strong>
            {userId === message.userId ? <></> : <p>{message.username}</p>}
          </strong>
          <img src="https://cdn-icons-png.flaticon.com/512/136/136522.png" />
          <span className="small">
            {DateTime.fromISO(message.timestamp).toFormat("HH:mm")}
          </span>
        </div>
      );
    } else if (fileType === "document") {
      return (
        <div
          className={`${
            userId === message.userId ? "current-user" : "other-user"
          }} document-upload cursor-pointer message-bubble`}
          onClick={openModal}
        >
          <strong>
            {userId === message.userId ? <></> : <p>{message.username}</p>}
          </strong>
          <img src="https://cdn-icons-png.flaticon.com/512/10434/10434857.png" />
          <span className="small">
            {DateTime.fromISO(message.timestamp).toFormat("HH:mm")}
          </span>
        </div>
      );
    } else {
      return <p>Unsupported file type</p>;
    }
  };

  return (
    <>
      {fileUrl && renderFile()}
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        {/* Render the file content inside the modal */}
        {fileType === "image" ? (
          <img src={fileUrl} alt="Received Image" />
        ) : fileType === "pdf" ? (
          <Document
            file={fileUrl}
            onLoadError={(error) => console.error("PDF load error:", error)}
          >
            {/* let the width be 50% of the window */}
            <Page pageNumber={1} width={window.innerWidth / 2} />
          </Document>
        ) : fileType === "document" ? (
          <iframe src={fileUrl} width="100%" height="500px"></iframe>
        ) : (
          <p>Unsupported file type</p>
        )}
      </Modal>
    </>
  );
};

export default FileDisplay;
