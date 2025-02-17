import React, { useState, useCallback, useEffect } from 'react';
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
import { chatService } from '../../services/chatService';
import { gherkinService } from '../../services/gherkinService';

// Add these imports at the top
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import IconButton from '@mui/material/IconButton';

/*
1. update the message panel with Markdown as code is also generated as simple text.
2. as soon as Figma url is processed send the processed json files to LLM as initial knowledge base from which it can generate test cases.(this may exceeds the monthly token limits early)
  -  Need to find a way to process all this
3. 

*/
const CHAT_API_URL = (process.env.API_URL || 'https://gherkin-backend.onrender.com/api') + '/chat';
const GHERKIN_API_URL = (process.env.API_URL || 'https://gherkin-backend.onrender.com/api') + '/gherkin';



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
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

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
    try {
      setUploadStatus('Processing URL...');
      const response = await gherkinService.processFromFigma(url, projectId);
      
      if (response) {
        setUrlDialogOpen(false);
        setUrl('');
        setChatMessages(prev => [...prev, { type: 'system', content: response }]);
      }
    } catch (error) {
      setUploadStatus('Error processing URL');
      handleError(error);
    }
  };

  const handleUrlSubmitImage = async () => {
    try {
      setUploadStatus('Processing URL...');
      const response = await gherkinService.processFromImage(url);
      
      if (response) {
        setUploadStatus('Image processed successfully!');
        onTestCasesGenerated(response);
        setUrlDialogOpen(false);
        setUrl('');
        setChatMessages(prev => [...prev, { 
          type: 'system', 
          content: 'Test cases generated successfully!' 
        }]);
      }
    } catch (error) {
      setUploadStatus('Error processing Image');
      handleError(error);
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
      const response = await gherkinService.uploadFile(formData);
      
      if (response) {
        console.log("Upload File Successfully and Response is:", response)
        setUploadStatus('Upload successful!');
        setUploadedFiles(prev => 
          prev.map(file => 
            acceptedFiles.some(af => af.name === file.name)
              ? { ...file, status: 'success' }
              : file
          )
        );
        setChatMessages(prev => [...prev, { 
          type: 'system', 
          content: `Files uploaded successfully: ${acceptedFiles.map(f => f.name).join(', ')}` 
        }]);
      }
    } catch (error) {
      setUploadStatus('Upload failed');
      handleError(error);
      setUploadedFiles(prev => 
        prev.map(file => 
          acceptedFiles.some(af => af.name === file.name)
            ? { ...file, status: 'error' }
            : file
        )
      );
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

    setChatMessages(prev => [...prev, {
      type: 'user',
      content: message,
      timestamp: new Date().toISOString()
    }]);

    const currentMessage = message;
    setMessage('');

    try {
      const response = await chatService.sendMessage(currentMessage, projectId);
      handleChatResponse(response);
    } catch (error) {
      handleError(error);
    }
  };

  const handleViewTestCases = async (messageId) => {
    try {
      const response = await gherkinService.getMessageTestCases(messageId);
      if (response) {
        onTestCasesGenerated(JSON.parse(response));
      }
    } catch (error) {
      handleError(error);
    }
  };

  const handleError = (error) => {
    console.error('Error:', error);
    setChatMessages(prev => [...prev, { 
      type: 'error', 
      content: `Error: ${error?.detail || 'Something went wrong'}` 
    }]);
  };

  const handleChatResponse = (response) => {
    if (!response) return;

    try {
        const botMessageId = response.chat_id;
        let parsedResponse;

        // Check if response.response is already an object
        if (typeof response.response === 'object') {
            parsedResponse = response.response;
        } else {
            // Try to parse as JSON, if it fails, treat as plain text
            try {
                parsedResponse = JSON.parse(response.response);
            } catch (e) {
                // If parsing fails, use the response as plain text
                parsedResponse = response.response;
            }
        }

        if (parsedResponse && typeof parsedResponse === 'object' && parsedResponse.features) {
            setStoredResponses(prev => ({
                ...prev,
                [botMessageId]: parsedResponse
            }));
            
            onTestCasesGenerated(parsedResponse);
            
            setChatMessages(prev => [...prev, {
                id: botMessageId,
                type: 'bot',
                content: "Test cases generated successfully!",
                hasTestCases: true
            }]);
        } else {
            // Handle plain text or other non-feature responses
            setChatMessages(prev => [...prev, {
                id: botMessageId,
                type: 'bot',
                content: typeof parsedResponse === 'string' 
                    ? parsedResponse 
                    : JSON.stringify(parsedResponse, null, 2),
                hasTestCases: false
            }]);
        }
    } catch (error) {
        handleError(error);
    }
  };

  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        setIsLoadingHistory(true);
        const history = await chatService.getChatHistory(projectId);
        if (history && history.length > 0) {
          setChatMessages(history.map(msg => ({
            id: msg.id,
            type: msg.role === 'user' ? 'user' : 'bot',
            content: msg.content,
            hasTestCases: msg.has_test_cases,
            timestamp: msg.timestamp
          })));
        }
      } catch (error) {
        console.error('Error loading chat history:', error);
        setChatMessages(prev => [...prev, {
          type: 'error',
          content: 'Failed to load chat history'
        }]);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    if (projectId) {
      loadChatHistory();
    }
  }, [projectId]);

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
        {isLoadingHistory ? (
          <div className="chat-message system">Loading chat history...</div>
        ) : (
          chatMessages.map((msg) => (
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
          ))
        )}
        
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