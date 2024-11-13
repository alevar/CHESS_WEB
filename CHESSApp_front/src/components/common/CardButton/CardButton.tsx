import React from 'react';
import { Card } from 'react-bootstrap';
import './CardButton.css';

interface CardButtonProps {
    isSelected: boolean;
    onClick: () => void;
    children: React.ReactNode; // Accept arbitrary HTML content
}

const CardButton: React.FC<CardButtonProps> = ({ isSelected, onClick, children }) => {
    return (
        <Card className={`card-button ${isSelected ? 'selected' : ''}`} onClick={onClick}>
            <Card.Body>
                {children} {/* Render any passed-in HTML content */}
            </Card.Body>
        </Card>
    );
};

export default CardButton;
