// import React from 'react';
// import './RightSidePanel.css';

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import './RightSidePanel.css';
import { Button, Card, Typography } from '@mui/material';
import GherkinViewer from '../GherkinViewer';
import { projectService } from '../../services/projectService';


function RightSidePanel({ testCases, onClearEditor}) {
    const { projectId } = useParams();
    const [pages, setPages] = useState([]);
    
    useEffect(() => {
        const fetchPages = async () => {
            try {
                const pagesData = await projectService.getPages(projectId);
                console.log('Fetched pages:', pagesData);
                setPages(pagesData);
            } catch (error) {
                console.error('Error fetching pages:', error);
            }
        };
        
        if (projectId) {
            fetchPages();
        }
    }, [projectId]);

    const handleClearEditor = () => {
      onClearEditor('');
    }
    console.log("RightSidePanel::testCases::", testCases)
    return (
      <div className="right-side-panel">
        <div className="header">
          <div className="title">Test Cases</div>
          <Card className="files-card">
            <Typography variant="subtitle2" sx={{ p: 1, fontWeight: 'bold' }}>
              Pages
            </Typography>

            <div className="files-list">
              {pages && pages.length > 0 ? (
                pages.map((page, index) => (
                  <Typography key={index} variant="body2" sx={{ px: 1, pb: 0.5 }}>
                    {page.name}
                  </Typography>
                ))
              ) : (
                <Typography variant="body2" sx={{ px: 1, pb: 0.5, fontStyle: 'italic' }}>
                  No pages available
                </Typography>
              )}
            </div>
            
          </Card>
          <div className="clear-editor-btn-container">  
          <Button 
            onClick={handleClearEditor}
            variant="contained"
            color="primary"
            size="small"
            className="clear-button"
          >
            Clear Editor
          </Button>
          </div>
        </div>
        <div className="markdown-container">
          {testCases && testCases.features ? (
            <GherkinViewer data={testCases} />
          ) : (
            <ReactMarkdown>{testCases}</ReactMarkdown>
          )}
        </div>
      </div>
    );
  }
export default RightSidePanel;
