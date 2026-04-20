import { DataGrid } from '@mui/x-data-grid';
import { Box } from '@mui/material';
// import VisibilityIcon from '@mui/icons-material/Visibility';
// import EditIcon from '@mui/icons-material/Edit';
// import DeleteIcon from '@mui/icons-material/Delete';

const DataTable = ({ rows, columns, pageSize = 5 }) => {
    return (
        <Box sx={{ height: 500, width: '100%' }}>
            <DataGrid
                rows={rows}
                columns={columns}
                pageSize={pageSize}
                checkboxSelection
            />
        </Box>
    );
};
export default DataTable;