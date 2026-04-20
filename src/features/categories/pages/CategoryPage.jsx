import React from 'react';

import DataTable from '../../../components/ui/DataTable/DataTable'
import Button from '../../../components/ui/Button/Button'
import Input from '../../../components/ui/Input/Input';
import '../../../components/ui/Form.css'

import styles from './category.module.css'



import { Box } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';


const rows = [
  {
    id: 1,
    name: 'Beauty',
  },
  {
    id: 2,
    name: 'Grocery',
  },
];

const columns = [

  // { field: 'code', headerName: 'Code', flex: 1 },
  { field: 'name', headerName: 'Name', flex: 1 },

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

const CategoryPage = () => {
  return (
    <div className='containe-fluid'>
      <h5 style={{ alignSelf: 'flex-start' }}>Category list</h5>
      <div className={styles.filter}>
        <Button value={'Add New'}></Button>
        <div className={styles.box_search}>
          <Input leftIcon={<i class="fa-solid fa-magnifying-glass"></i>}></Input>
        </div>
      </div>
      <DataTable rows={rows} columns={columns}></DataTable>
    </div>
  );
};

export default CategoryPage;