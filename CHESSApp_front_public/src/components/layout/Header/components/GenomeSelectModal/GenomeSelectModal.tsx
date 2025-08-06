import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button, Card } from 'react-bootstrap';

import { PathParts, parsePathname, buildPathname } from '../../../../../utils/utils';
import { get_organism, get_assembly } from '../../../../../types/db';
import { RootState } from '../../../../../redux/rootReducer';

import CustomModal from '../../../../common/CustomModal/CustomModal';

const GenomeSelectModal: React.FC = () => {
    const global = useSelector((state: RootState) => state.global);
    const navigate = useNavigate();
    const location = useLocation();
    const pathParts: PathParts = parsePathname(location.pathname);

    const organisms = global.data ? global.data.organisms : [];
    const selected_organism = global.data ? get_organism(global.data, global.settings.organism_id) : null;
    const selected_assembly = global.data ? get_assembly(global.data, global.settings.assembly_id) : null;

    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const handleSelect = (organism_id: number, assembly_id: number) => {
        const new_path = buildPathname({ 
                                        params: { 
                                            oid: organism_id.toString(),
                                            aid: assembly_id.toString() 
                                        }, 
                                        remainder: pathParts.remainder 
                                    });
        navigate(new_path);
        handleClose();
    };

    return (
        <>
            <Button variant="outline-primary" onClick={handleShow}>
                {selected_organism?.common_name}/{selected_assembly?.assembly_name}
            </Button>

            <CustomModal show={show} onHide={handleClose} title="Choose Organism and Assembly">
                <div className="row">
                    {organisms.map((organism: any) => (
                        organism.assemblies.map((assembly: any) => (
                            <div key={`${organism.organism_id}-${assembly.assembly_id}`} className="col-md-6 mb-3">
                                <Card 
                                    className={`h-100 cursor-pointer ${
                                        organism.organism_id === selected_organism?.organism_id &&
                                        assembly.assembly_id === selected_assembly?.assembly_id
                                            ? 'border-primary'
                                            : ''
                                    }`}
                                    onClick={() => handleSelect(organism.organism_id, assembly.assembly_id)}
                                >
                                    <Card.Body>
                                        <Card.Title>{organism.common_name} / {assembly.assembly_name}</Card.Title>
                                        <Card.Text className="small">{organism.information}</Card.Text>
                                        <Card.Text className="small">{assembly.information}</Card.Text>
                                        {assembly.link && (
                                            <a 
                                                href={assembly.link} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="btn btn-sm btn-outline-primary"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                More about this assembly
                                            </a>
                                        )}
                                    </Card.Body>
                                </Card>
                            </div>
                        ))
                    ))}
                </div>
            </CustomModal>
        </>
    );
};

export default GenomeSelectModal;
