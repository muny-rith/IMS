import React from 'react';



import DataTable from '../../../components/ui/DataTable/DataTable';
import Button from '../../../components/ui/Button/Button';
import Input from '../../../components/ui/Input/Input'

import styles from './loan.module.css'

import { Box, Avatar } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import UndoIcon from '@mui/icons-material/Undo';


const rows = [
  {
    id: 1,
    product: 'Organic Cream',
    name: 'Time',
    style : 'B1',
    category: 'Beauty',
    qty: 10,
    taken_by: 'Rith',
  },
  {
    id: 2,
    product: 'Cream',
    name: 'PC',
    style: 'A1',
    category: 'Beauty',
    qty: 10,
    taken_by: 'Rith',
  },

];

const columns = [
  {
    field: 'product',
    headerName: 'Product',
    flex: 1,
    renderCell: (params) => (
      <Box display="flex" alignItems="center" gap={1}>
        <Avatar src={params.row.image} />
        {params.value}
      </Box>
    ),
  },
  // { field: 'code', headerName: 'Code', flex: 1 },
  { field: 'name', headerName: 'Name', flex: 1.5 },
  { field: 'style', headerName: 'Style', flex: 1 },
  // { field: 'category', headerName: 'Category', flex: 1 },
  { field: 'qty', headerName: 'Quantity', flex: 1 },
  { field: 'taken_by', headerName: 'Taken by', flex: 1 },
  { field: 'taken_date', headerName: 'Taken', flex: 1 },
  { field: 'return_date', headerName: 'Return', flex: 1 },
  { field: 'other', headerName: 'Other', flex: 1 },


  {
    field: 'action',
    headerName: 'Action',
    flex: 1.2,
    sortable: false,
    renderCell: () => (
      <Box display="flex" gap={1}>
        {/* <VisibilityIcon style={{ color: '#29b6f6', cursor: 'pointer' }} /> */}
        <UndoIcon style={{ color: '#29b6f6', cursor: 'pointer' }} />
        <EditIcon style={{ color: '#66bb6a', cursor: 'pointer' }} />
        <DeleteIcon style={{ color: '#ef5350', cursor: 'pointer' }} />
      </Box>
    ),
  },
];
const LoanPage = () => {
  return (
    <div className='container-fluid'>
      <h5 style={{ alignSelf: 'flex-start' }}>Loan list</h5>
      <div className={styles.filter}>
        <Button value={'New Loan'}></Button>
        <div className={styles.box_search}>
          <Input leftIcon={<i class="fa-solid fa-magnifying-glass"></i>}></Input>

        </div>
      </div>
      <DataTable rows={rows} columns={columns}></DataTable>
    </div>
  );
};

export default LoanPage;