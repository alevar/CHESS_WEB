import React from 'react';

const TissueTable: React.FC = () => {
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
              <tr>
                <td>
                  <div className="custom-control custom-checkbox">
                    <input type="checkbox" className="custom-control-input" id="customCheck1" />
                    <label className="custom-control-label" htmlFor="customCheck1">1</label>
                  </div>
                </td>
                <td>Brain</td>
                <td>913</td>
              </tr>
              <tr>
                <td>
                  <div className="custom-control custom-checkbox">
                    <input type="checkbox" className="custom-control-input" id="customCheck2" />
                    <label className="custom-control-label" htmlFor="customCheck2">2</label>
                  </div>
                </td>
                <td>Liver</td>
                <td>3417</td>
              </tr>
              <tr>
                <td>
                  <div className="custom-control custom-checkbox">
                    <input type="checkbox" className="custom-control-input" id="customCheck3" />
                    <label className="custom-control-label" htmlFor="customCheck3">3</label>
                  </div>
                </td>
                <td>Pancreas</td>
                <td>1234</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TissueTable;
