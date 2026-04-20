import React from 'react';

import DataTable from '../../../components/ui/DataTable/DataTable';
import Button from '../../../components/ui/Button/Button';
import Input from '../../../components/ui/Input/Input'

import { Box} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import './worker.css'

const rows = [
  {
    id: 1,
    // product: 'Organic Cream',
    name: 'Lakme',
    position: 'Director',
  },
  {
    id: 2,
    // product: 'Organic',
    name: 'Yaksa',
    position: 'labor',
  },
];

const columns = [
  // {
  //   field: 'product',
  //   headerName: 'Product',
  //   flex: 1.2,
  //   renderCell: (params) => (
  //     <Box display="flex" alignItems="center" gap={1}>
  //       <Avatar src={params.row.image} />
  //       {params.value}
  //     </Box>
  //   ),
  // },
  { field: 'id', headerName: 'ID', flex: 1 },
  { field: 'name', headerName: 'Name', flex: 1 },
  { field: 'position', headerName: 'Position', flex: 1 },

  {
    field: 'action',
    headerName: 'Action',
    flex: 1,
    sortable: false,
    renderCell: () => (
      <Box display="flex" gap={1}>
        <VisibilityIcon style={{ color: '#29b6f6', cursor: 'pointer' }} />
        <EditIcon style={{ color: '#66bb6a', cursor: 'pointer' }} />
        <DeleteIcon style={{ color: '#ef5350', cursor: 'pointer' }} />
      </Box>
    ),
  },
];

const WorkerPage = () => {
  return (
    <div className='container-fluid'>
      <h5 style={{ alignSelf: 'flex-start' }}>Worker list</h5>
      <div className='filter'>
        <Button value={'Add New'}></Button>
        <div className='box-search'>
          <Input leftIcon={<i class="fa-solid fa-magnifying-glass"></i>}></Input>

        </div>
      </div>
      <DataTable rows={rows} columns={columns}></DataTable>
    </div>
  );
};

export default WorkerPage;