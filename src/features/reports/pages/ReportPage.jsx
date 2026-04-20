import React from 'react';

import './report.css'
import LoanoutChart from '../../../components/ui/LoanoutChart/LoanoutChart';



const ReportPage = () => {
  return (
    <div className='container-fluid'>

      <div className='container-1'>
        <div className='title'>
          <h5 style={{ alignSelf: 'flex-start' }}>Overview</h5>
        </div>
        <div className='container-overview'>
          <div className='card'>
            <div className='title'>Total Category</div>
            <div className='overview'>
              <LoanoutChart></LoanoutChart>
            </div>
          </div>
          <div className='card'>
            <div className='title'>Total Category</div>
            <div className='overview'>
              <LoanoutChart></LoanoutChart>
            </div>
          </div>
          <div className='card'>
            <div className='title'>Total Category</div>
            <div className='overview'>
              <LoanoutChart></LoanoutChart>
            </div>
          </div>
          <div className='card'>
            <div className='title'>Total Category</div>
            <div className='overview'>
              <LoanoutChart></LoanoutChart>
            </div>
          </div>

        </div>
      </div>

      <div className='container-2'>
        <div className='container-loanout card'>
          <div className='title'>
            <h5 style={{ alignSelf: 'flex-start' }}>Loan Stock</h5>
          </div>

          <div className='container-fluid'>
            <LoanoutChart></LoanoutChart>
          </div>
        </div>
        <div className='container-stock card'>
          <div className='title'>
            <h5 style={{ alignSelf: 'flex-start' }}>Stock by Category</h5>
          </div>
          <div className='container-fluid'>
            <LoanoutChart></LoanoutChart>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportPage;