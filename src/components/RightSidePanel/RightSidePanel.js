// import React from 'react';
// import './RightSidePanel.css';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import './RightSidePanel.css';
import { Button } from '@mui/material';
import GherkinViewer from '../GherkinViewer';


// function RightSidePanel({ messages }) {
//     return (
//         <div className="right-panel">
//             <div className="panel-header">
//                 <h2>Test Cases</h2>
//                 <button className="clear-editor-btn">CLEAR EDITOR</button>
//             </div>
            
//             <div className="test-cases-container">
//                 {messages.map((message, index) => (
//                     <div key={index} className="test-case">
//                         <div className="test-case-header">
//                             {message.title || 'Test Case'}
//                             <span className="collapse-btn">^</span>
//                         </div>
//                         <div className="test-case-content">
//                             <pre>{message.text}</pre>
//                         </div>
//                     </div>
//                 ))}
//             </div>
//         </div>
//     );
// }
function RightSidePanel({ testCases, onClearEditor }) {
    const handleClearEditor = () => {
      onClearEditor('');
    }
    console.log("RightSidePanel::testCases::", testCases)
    return (
      <div className="right-side-panel">
        <div className="header">
          <div className="title">Test Cases</div>
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
