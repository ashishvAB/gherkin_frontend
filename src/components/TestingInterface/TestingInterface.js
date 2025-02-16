import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { chatService } from '../../services/chatService';
import LeftSidePanel from '../LeftSidePanel/LeftSidePanel';
import RightSidePanel from '../RightSidePanel/RightSidePanel';
import './TestingInterface.css';


function TestingInterface() {
    const [messages, setMessages] = useState([]);
    const [testCases, setTestCases] = useState('');
    useEffect(() => {
        loadChatHistory();
    }, []);

    const loadChatHistory = async () => {
        try {
            const history = await chatService.getChatHistory();
            setMessages(history.messages);
        } catch (error) {
            console.error('Error loading chat history:', error);
        }
    };

    const handleSendMessage = async (message) => {
        try {
            const response = await chatService.sendMessage(message);
            if (response.data) {
                setMessages(prev => [...prev, {
                    type: 'user',
                    text: message,
                    timestamp: new Date().toISOString()
                }, {
                    type: 'bot',
                    text: response.data.response,
                    timestamp: new Date().toISOString()
                }]);
            }
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    return (
        <div className='app-container'>
            <div className='left-panel'>
                <LeftSidePanel  onTestCasesGenerated={setTestCases} />
            </div>
            <div className='right-panel'>
                <RightSidePanel messages={messages} testCases={testCases} onClearEditor={setTestCases}/>
            </div>
        </div>
    );
}

export default TestingInterface; 