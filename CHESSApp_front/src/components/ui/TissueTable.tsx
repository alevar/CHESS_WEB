import React from 'react';

export interface TissueData {
  tissue: string;
  numSamples: number;
}

export interface TissueTableProps {
  data: TissueData[];
}

export const TissueTable: React.FC<TissueTableProps> = ({ data }) => {
  return (
    <div className="container">
      <div className="row">
        <div className="col-12">
          <table className="table table-bordered">
            <thead>
              <tr>
                <th scope="col">Select Tissue</th>
                <th scope="col">Tissue</th>
                <th scope="col">Number of Samples</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={index}>
                  <td>
                    <div className="custom-control custom-checkbox">
                      <input
                        type="checkbox"
                        className="custom-control-input"
                        id={`customCheck${index + 1}`}
                      />
                      <label className="custom-control-label" htmlFor={`customCheck${index + 1}`}>
                        {index + 1}
                      </label>
                    </div>
                  </td>
                  <td>{item.tissue}</td>
                  <td>{item.numSamples}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};