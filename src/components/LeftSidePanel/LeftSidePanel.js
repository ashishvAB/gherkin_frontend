import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import SendIcon from '@mui/icons-material/Send';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DescriptionIcon from '@mui/icons-material/Description';
import LinkIcon from '@mui/icons-material/Link';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import CircularProgress from '@mui/material/CircularProgress';
import { Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, ListItemIcon, ListItemText } from '@mui/material';
import './LeftSidePanel.css';
import ReactMarkdown from 'react-markdown';
import { authHeader } from '../../utils/authHeader';
import { useParams } from 'react-router-dom';

// Add these imports at the top
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import IconButton from '@mui/material/IconButton';

/*
1. update the message panel with Markdown as code is also generated as simple text.
2. as soon as Figma url is processed send the processed json files to LLM as initial knowledge base from which it can generate test cases.(this may exceeds the monthly token limits early)
  -  Need to find a way to process all this
3. 

*/


function LeftSidePanel({ onTestCasesGenerated }) {
  const { projectId } = useParams(); // for getting project id from url
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [uploadStatus, setUploadStatus] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [urlDialogOpen, setUrlDialogOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [storedResponses, setStoredResponses] = useState({});

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    switch (extension) {
      case 'pdf':
        return <PictureAsPdfIcon />;
      case 'md':
        return <DescriptionIcon />;
      default:
        return <InsertDriveFileIcon />;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'uploading':
        return <CircularProgress size={16} />;
      case 'success':
        return <CheckCircleIcon className="success-icon" />;
      case 'error':
        return <ErrorIcon className="error-icon" />;
      default:
        return null;
    }
  };

  const handleUploadClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleUrlOptionClick = () => {
    handleMenuClose();
    setUrlDialogOpen(true);
  };

  /*
   * For handling figma json to testcases...
   * 
   */
  // send url to : http://localhost:8000/api/gherkin/from_figma
  const handleUrlSubmit = async () => {
    let Client = {
      "url": url,
      "project_id": projectId  // Add project_id to the request payload
    }
    console.log("Sending request for Figma.........from UI")
    console.log("Client UI object::", Client)

    try {
      setUploadStatus('Processing URL...');
      const token = localStorage.getItem('token');
      
      // Debug log to check if token exists
      console.log("Token available:", !!token);
      
      if (!token) {
        setChatMessages(prev => [...prev, { 
          type: 'error', 
          content: 'Please log in to continue.' 
        }]);
        return;
      }

      const response = await axios.post(
        "http://localhost:8000/api/gherkin/from_figma", 
        Client,  // Now includes both url and project_id
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
        }
      );
      console.log("Token available2time:", !!token);
      if (response.data) {
        // onTestCasesGenerated(response.data);
        setUrlDialogOpen(false);
        setUrl('');
        setChatMessages(prev => [...prev, { type: 'system', content: response.data }]);
      }
    } catch (error) {
      setUploadStatus('Error processing URL');
      console.error('Error processing URL:', error);
      
      if (error.response?.status === 401) {
        // Clear token if it's invalid
        // localStorage.removeItem('token');
        setChatMessages(prev => [...prev, { 
          type: 'error', 
          content: 'Your session has expired. Please log in again.' 
        }]);
      } else {
        setChatMessages(prev => [...prev, { 
          type: 'error', 
          content: `Error: ${error.response?.data?.detail || 'Something went wrong'}` 
        }]);
      }
    }
  };

  const handleUrlSubmitImage = async () => {
    let Client = {
      "url": url
    }
    console.log("Sending Image Processing request......from UI")
    console.log("Client UI object::", Client)
    // if (!Client.url.trim()) return;

    try {
      
      setUploadStatus('Processing URL...');
      const response = await axios.post("http://localhost:8000/api/gherkin/from_image", Client, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (response.data) {
        setUploadStatus('Image processed successfully!');
        onTestCasesGenerated(response.data);
        setUrlDialogOpen(false);
        setUrl('');
        setChatMessages(prev => [...prev, { type: 'system', content: 'Test cases generated successfully!' }]);
      }
    } catch (error) {
      setUploadStatus('Error processing Image');
      console.error('Error processing Image:', error);
      setChatMessages(prev => [...prev, { type: 'error', content: 'Error processing Image. Please try again.' }]);
    }
  };
  // send files to : http://localhost:8000/api/gherkin/from_text
  //sends text file to to backend for parsing
  
  const onDrop = useCallback(async (acceptedFiles) => {
    const newFiles = acceptedFiles.map(file => ({
      name: file.name,
      status: 'uploading',
      type: file.type
    }));
    
    setUploadedFiles(prev => [...prev, ...newFiles]);
    const formData = new FormData();
    acceptedFiles.forEach(file => {
      formData.append('file', file);
    });

    try {
      setUploadStatus('Uploading...');
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:8000/api/gherkin/upload_file', formData, 
      { 
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
      });
      
      if (response.data) {
        console.log("Upload File Successfully and Response is:", response.data)
        setUploadStatus('Upload successful!');
        // onTestCasesGenerated(response.data); // pass the response data to the parent component to display on the right side panel
        setUploadedFiles(prev => 
          prev.map(file => 
            acceptedFiles.some(af => af.name === file.name)
              ? { ...file, status: 'success' }
              : file
          )
        );
        setChatMessages(prev => [...prev, { type: 'system', content: `Files uploaded successfully: ${acceptedFiles.map(f => f.name).join(', ')}` }]);
      }
    } catch (error) {
      setUploadStatus('Upload failed');
      setUploadedFiles(prev => 
        prev.map(file => 
          acceptedFiles.some(af => af.name === file.name)
            ? { ...file, status: 'error' }
            : file
        )
      );
      console.error('Error uploading files:', error);
      setChatMessages(prev => [...prev, { type: 'error', content: 'Error uploading files. Please try again.' }]);
    }
  }, []);

  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    noClick: true,
    noKeyboard: true,
    accept: {
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf'],
      'text/markdown': ['.md']
    }
  });
  const handleSendMessage = async (event) => {
    if (event) {
      event.preventDefault();
    }
    if (!message.trim()) return;
    setChatMessages(prev => [
      ...prev,
      {
          type: 'user',
          content: message,
          timestamp: new Date().toISOString()
      },
    ]);
    setMessage('');
    try {

      const response = await axios.post('http://localhost:8000/api/chat/', {
            message: message,
            project_id: projectId
        }, {
            headers: authHeader()
      });

      if (response.data) {
        try {
          const botMessageId = response.data.chat_id;
          let parsedResponse;
          if (typeof response.data.response === 'string') {
            try {
              parsedResponse = JSON.parse(response.data.response);
            } catch (e) {
              parsedResponse = response.data.response;
            }
          } else {
            parsedResponse = response.data.response;
          }
          // console.log("What is returned::", response.data)
          // Check if response is JSON with features
          if (parsedResponse && typeof parsedResponse === 'object' && parsedResponse.features) {
            // Store the JSON response
            setStoredResponses(prev => ({
              ...prev,
              [botMessageId]: parsedResponse
            }));
            
            // Send to RightPanel
            onTestCasesGenerated(parsedResponse);
            
            // Add success message to chat with arrow button
            setChatMessages(prev => [
              ...prev,
              {
                id: botMessageId,
                type: 'bot',
                content: "Test cases generated successfully!",
                hasTestCases: true
              }
            ]);
          } else {
            // Handle regular text responses
            setChatMessages(prev => [
              ...prev,
              {
                id: botMessageId,
                type: 'bot',
                content: typeof parsedResponse === 'string' ? 
                  parsedResponse : 
                  JSON.stringify(parsedResponse, null, 2),
                hasTestCases: false
              }
            ]);
          }
        } catch (error) {
          console.error('Error parsing response:', error);
          setChatMessages(prev => [
            ...prev,
            {
                        type: 'user',
                        content: message,
                        timestamp: new Date().toISOString()
                    },
                    {
              type: 'bot',
                        content: "Error: Unable to process response.",
                        timestamp: new Date().toISOString(),
              hasTestCases: false
            }
          ]);
        }
      }
        setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      setChatMessages(prev => [
        ...prev,
            {
          type: 'bot',
          content: "Error: Unable to send message.",
                timestamp: new Date().toISOString(),
          hasTestCases: false
        }
      ]);
    }
  };

  const handleViewTestCases = async (messageId) => {
    try {
      console.log("msgid",messageId)
      const response = await axios.get(`http://localhost:8000/api/gherkin/messages/${messageId}`);
      if (response.data) {
        // console.log(response)
        onTestCasesGenerated(JSON.parse(response.data));
      }
    } catch (error) {
      console.error('Error fetching test cases:', error);
      // You might want to show an error message to the user here
    }
  };

  // Update the chat messages rendering
  // const renderMessage = (msg) => (
  //   <div>
  //     <div className={`chat-message ${msg.type}`}>
  //       <ReactMarkdown>{msg.content}</ReactMarkdown>
  //     </div>
  //     {msg.hasTestCases && (
  //       <IconButton
  //         size="small"
  //         onClick={() => handleViewTestCases(msg.id)}
  //         className="view-test-cases-button"
  //       >
  //         <ArrowForwardIcon fontSize="small" />
  //       </IconButton>
  //     )}
  //   </div>
  // );

  return (
    <div className="left-side-panel" {...getRootProps()}>
      <input {...getInputProps()} />
      <div className="logo">Logo</div>
      
      <div className="uploaded-files-section">
        {uploadedFiles.length > 0 && (
          <>
            <div className="section-title">Uploaded Files</div>
            <div className="files-list">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="file-item">
                  <div className="file-icon">{getFileIcon(file.name)}</div>
                  <div className="file-name">{file.name}</div>
                  <div className="file-status">{getStatusIcon(file.status)}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="chat-interface">
        <div className="chat-header">
          <h3>Chat</h3>
          <button 
            className="clear-button" 
            onClick={() => {
              setChatMessages([]);
              setUploadedFiles([]);
              setUploadStatus('');
            }}
          >
            Clear All
          </button>
        </div>
        {chatMessages.map((msg) => (
          <>
            <ReactMarkdown key={msg.id} className={`chat-message ${msg.type}`} children={msg.content} />
            {msg.hasTestCases && (
              <IconButton
                size="small"
                onClick={() => handleViewTestCases(msg.id)}
                sx={{ ml: 1 }}
                className="view-test-cases-button"
              >
                <ArrowForwardIcon fontSize="small" />
              </IconButton>
            )}
          </>
        ))}
        
        {/* {chatMessages.map((msg) => (
          <div key={msg.id} >
            {renderMessage(msg)}
          </div>
        ))} */}
        {uploadStatus && <div className="upload-status">{uploadStatus}</div>}
      </div>
      <div className="chat-input">
        <div className="chat-input-wrapper">
          <div className="input-container">
          <input 
            type="text" 
            placeholder="Type your answer here..." 
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          </div>
          <div className="buttons-container">
          <button onClick={handleUploadClick} className="upload-button" title="Upload">
            <CloudUploadIcon />
          </button>
          <button onClick={handleSendMessage} className="send-button" title="Send message">
            <SendIcon />
          </button>
          </div>
        </div>
      </div>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
      >
        <MenuItem onClick={open}>
          <ListItemIcon>
            <InsertDriveFileIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Upload Files" secondary=".txt, .pdf, .md" />
        </MenuItem>
        <MenuItem onClick={handleUrlOptionClick}>
          <ListItemIcon>
            <LinkIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Upload URL" />
        </MenuItem>
      </Menu>

      <Dialog 
        open={urlDialogOpen} 
        onClose={() => setUrlDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          style: {
            borderRadius: '16px'
          }
        }}
      >
        <DialogTitle>
          <div className="dialog-title">
            <LinkIcon className="dialog-icon" />
            Enter URL to Process
          </div>
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="URL"
            placeholder="https://example.com/document"
            type="url"
            fullWidth
            variant="outlined"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleUrlSubmit()}
            InputProps={{
              className: 'url-input-field'
            }}
          />
        </DialogContent>
        <DialogActions className="dialog-actions">
          <Button 
            onClick={() => setUrlDialogOpen(false)}
            className="dialog-button cancel-button"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleUrlSubmit} 
            variant="contained" 
            color="primary"
            className="dialog-button submit-button"
          >
            Process URL
          </Button>
          <Button 
            onClick={handleUrlSubmitImage} 
            variant="contained" 
            color="primary"
            className="dialog-button submit-button"
          >
            Process Image
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default LeftSidePanel;