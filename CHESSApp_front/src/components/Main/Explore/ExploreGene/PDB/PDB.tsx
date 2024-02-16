import React, { useRef, useEffect } from 'react';
import * as mol from '3dmol';
import './PDB.css';

interface PDBProps {
    pdbData: string;
}

const PDB: React.FC<PDBProps> = ({ pdbData }) => {
    const pdbRef = useRef(null);

    useEffect(() => {
        if (!pdbRef.current) return;

        const viewer = mol.createViewer(pdbRef.current, {});
        mol.download("pdb:1MO8", viewer, { multimodel: true, frames: true }, function () {
            viewer.setStyle({}, { cartoon: { color: 'spectrum' } });
            viewer.render();
        });
    }, [pdbData]);

    return (
        <div>
            <div className="display-box" ref={pdbRef}></div>
        </div>
    );
};

export default PDB;
