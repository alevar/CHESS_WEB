import Collapse from 'react-bootstrap/Collapse';
import { Button } from 'react-bootstrap';
import { useState } from 'react';

export function ConfigureButton() {
    const [showConfigurations, setShowConfigurations] = useState(false);

    return (
        <div className='p-1'>
            <Button
                onClick={() => setShowConfigurations(!showConfigurations)}
                aria-expanded={showConfigurations}
                className="btn-sm btn-warning" // Adjusting button size using btn-sm
                style={{ padding: '0.25rem 0.5rem', fontSize: '0.rem' }} // Custom inline styles for padding and font size
            >
                Configure
            </Button>

            <Collapse in={showConfigurations}>
                <div className="text-center">
                    <div className="font-italic">Additional configurations for downloading file will be added here.</div>
                </div>
            </Collapse>
        </div>



    )
}
