import React, { useEffect, useState } from 'react';
import socket from './socket';

const FileDisplay:React.FC<{
  userId: string;
}> = ({userId}) => {
  const [file, setFile] = useState<File | Blob>();
  const [fileType, setFileType] = useState('');
  const [fileUserId, setFileUserId] = useState<string>('');

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

  const renderFile = () => {
    if (fileType === 'image') {
      return <div className={`${userId === fileUserId ? "current-user" : "other-user"} image-upload`}>
        <img src={file && URL.createObjectURL(file)} alt="Received Image" />
      </div>;
    } else if (fileType === 'pdf') {
      return (
        <div className='pdf-upload'>
          <embed src={file && URL.createObjectURL(file)} type="application/pdf" width="100%" height="500px" />
        </div>
      );
    } else if (fileType === 'document') {
      return (
        <div className='document-upload'>
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
    </>
  );
};

export default FileDisplay;
