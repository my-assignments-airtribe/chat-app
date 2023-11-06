import React, { useEffect, useState } from 'react';
import socket from './socket';
import Modal from './modal';

const FileDisplay:React.FC<{
  userId: string;
}> = ({userId}) => {
  const [file, setFile] = useState<File | Blob>();
  const [fileType, setFileType] = useState('');
  const [fileUserId, setFileUserId] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    socket.on("file", ({filename, data, username, timestamp, userId}) => {
      console.log(filename, data, username, timestamp);
      setFileUserId(userId);
      const blob = new Blob([data]);


      if (filename && (filename.endsWith('.jpg') || filename.endsWith('.jpeg') || filename.endsWith('.png'))) {
        setFileType('image');
      } else if (filename && filename.endsWith('.pdf')) {
        setFileType('pdf');
      } else if (filename && (filename.endsWith('.doc') || filename.endsWith('.docx'))) {
        setFileType('document');
      } else {
        setFileType('unknown');
      }

      setFile(blob);
    });

    return () => {
      socket.off("file");
    };
  }, []);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };


  const renderFile = () => {
    if (fileType === 'image') {
      return <div className={`${userId === fileUserId ? "current-user" : "other-user"} image-upload`} onClick={openModal}>
        <img src={file && URL.createObjectURL(file)} alt="Received Image" />
      </div>;
    } else if (fileType === 'pdf') {
      return (
        <div className='pdf-upload' onClick={openModal}>
          <embed src={file && URL.createObjectURL(file)} type="application/pdf" width="100%" height="500px" />
        </div>
      );
    } else if (fileType === 'document') {
      return (
        <div className='document-upload' onClick={openModal}>
          <iframe src={file && URL.createObjectURL(file)} width="100%" height="500px"></iframe>
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
        {fileType === 'image' ? (
          <img src={file && URL.createObjectURL(file)} alt="Received Image" />
        ) : fileType === 'pdf' ? (
          <embed src={file && URL.createObjectURL(file)} type="application/pdf" width="100%" height="500px" />
        ) : fileType === 'document' ? (
          <iframe src={file && URL.createObjectURL(file)} width="100%" height="500px"></iframe>
        ) : (
          <p>Unsupported file type</p>
        )}
      </Modal>
    </>
  );
};

export default FileDisplay;
