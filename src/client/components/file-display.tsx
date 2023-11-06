import React, { useEffect, useState } from "react";
import socket from "./socket";
import Modal from "./modal";
import { Document, Page, pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const FileDisplay: React.FC<{
  userId: string;
}> = ({ userId }) => {
  const [file, setFile] = useState<File | Blob>();
  const [fileType, setFileType] = useState("");
  const [fileUserId, setFileUserId] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [username, setUsername] = useState("");

  useEffect(() => {
    socket.on("file", ({ filename, data, username, timestamp, userId }) => {
      console.log(filename, data, username, timestamp);
      setFileUserId(userId);
      setUsername(username);
      const blob = new Blob([data]);

      if (
        filename &&
        (filename.endsWith(".jpg") ||
          filename.endsWith(".jpeg") ||
          filename.endsWith(".png"))
      ) {
        setFileType("image");
      } else if (filename && filename.endsWith(".pdf")) {
        setFileType("pdf");
      } else if (
        filename &&
        (filename.endsWith(".doc") || filename.endsWith(".docx"))
      ) {
        setFileType("document");
      } else {
        setFileType("unknown");
      }

      setFile(blob);
    });

    window.addEventListener("keydown", handleKeyPress);

    return () => {
      socket.off("file");
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, []);

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
            userId === fileUserId ? "current-user" : "other-user"
          } image-upload cursor-pointer message-bubble`}
          onClick={openModal}
        >
          <strong>{ userId === fileUserId ? <></> : username && <p>{username}</p>}</strong>
          <img src={file && URL.createObjectURL(file)} alt="Received Image" />
        </div>
      );
    } else if (fileType === "pdf") {
      return (
        <div
          className={`${
            userId === fileUserId ? "current-user" : "other-user"
          } pdf-upload cursor-pointer message-bubble`}
          onClick={openModal}
        >
          <strong>{ userId === fileUserId ? <></> : username && <p>{username}</p>}</strong>
          <img src="https://cdn-icons-png.flaticon.com/512/136/136522.png" />
        </div>
      );
    } else if (fileType === "document") {
      return (
        <div
          className={`${
            userId === fileUserId ? "current-user" : "other-user"
          }} document-upload cursor-pointer message-bubble`}
          onClick={openModal}
        >
          <strong>{ userId === fileUserId ? <></> : username && <p>{username}</p>}</strong>
          <iframe
            src={file && URL.createObjectURL(file)}
            width="100%"
            height="500px"
          ></iframe>
        </div>
      );
    } else {
      return <p>Unsupported file type</p>;
    }
  };

  return (
    <>
      {file && renderFile()}
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        {/* Render the file content inside the modal */}
        {fileType === "image" ? (
          <img src={file && URL.createObjectURL(file)} alt="Received Image" />
        ) : fileType === "pdf" ? (
          <Document
            file={file && URL.createObjectURL(file)}
            onLoadError={(error) => console.error("PDF load error:", error)}
          >
            {/* let the width be 50% of the window */}
            <Page pageNumber={1} width={window.innerWidth / 2} />
          </Document>
        ) : fileType === "document" ? (
          <iframe
            src={file && URL.createObjectURL(file)}
            width="100%"
            height="500px"
          ></iframe>
        ) : (
          <p>Unsupported file type</p>
        )}
      </Modal>
    </>
  );
};

export default FileDisplay;
