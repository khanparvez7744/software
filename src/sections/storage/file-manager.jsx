import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import MovieIcon from '@mui/icons-material/Movie';
import FolderIcon from '@mui/icons-material/Folder';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import TableChartIcon from '@mui/icons-material/TableChart';
import DescriptionIcon from '@mui/icons-material/Description';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';

import { SERVER_IP } from '../../../config';

const FileManager = ({ initialPath }) => {
  const [files, setFiles] = useState([]);
  const [currentPath, setCurrentPath] = useState(initialPath);

  useEffect(() => {
    const fetchFiles = async () => {
      const response = await fetch(`${SERVER_IP}/api/storage/get-storage?path=${encodeURIComponent(currentPath)}`);
      const data = await response.json();
      setFiles(data);
    };

    fetchFiles();
  }, [currentPath]);

  const handleClick = (path) => {
    setCurrentPath(path);
  };

  const handleGoBack = () => {
    const pathParts = currentPath.split('/');
    if (pathParts.length > 0) {
      const newPath = pathParts.slice(0, -1).join('/') || './';
      setCurrentPath(newPath);
    }
  };

  const getFileIcon = (file) => {
    if (file.type === 'directory') {
      return <FolderIcon sx={{ fontSize: 40, color: '#f7dc6f' }} />;
    }
    const ext = file.name.split('.').pop().toLowerCase();
    switch (ext) {
      case 'mp4':
      case 'avi':
      case 'mov':
      case 'webm':
        return <MovieIcon sx={{ fontSize: 40, color: '#9b59b6' }} />;
      case 'xlsx':
      case 'xls':
        return <TableChartIcon sx={{ fontSize: 40, color: '#229954' }} />;
      case 'txt':
      case 'log':
        return <DescriptionIcon sx={{ fontSize: 40, color: '#808b96' }} />;
      default:
        return <InsertDriveFileIcon sx={{ fontSize: 40 }} />;
    }
  };

  return (
    <Box sx={{ border: 'solid 1px', borderRadius: '8px' }}>
      <Box sx={{ borderBottom: 'solid 1px', borderRadius: '8px', padding: 1 }}>
        <IconButton onClick={handleGoBack} sx={{ marginLeft: 1 }} disabled={currentPath === './'}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="body2" sx={{ marginLeft: 2, display: 'inline-block' }}>
          {currentPath}
        </Typography>
      </Box>
      <Grid container spacing={2}>
        {files.length === 0 ? (
          <Grid item xs={12}>
            <Stack direction="column" alignItems="center" mt={3} mb={3}>
              <FolderOpenIcon sx={{ width: '60px', height: '60px', color: '#ffffff6e' }} />
              <Typography variant="h5" sx={{ textAlign: 'center', color: '#ffffff6e' }}>
                Folder is empty
              </Typography>
            </Stack>
          </Grid>
        ) : (
        files.map((file) => (
          <Grid item xs={12} sm={4} md={1} key={file.name} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {file.type === 'directory' ? (
              <IconButton
                onClick={() => handleClick(file.path)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleClick(file.path);
                  }
                }}
                role="button"
                tabIndex={0}
                sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', borderRadius: '8px' }}
              >
                {getFileIcon(file)}
                <Typography variant="body2" sx={{
                  textAlign: 'center', wordBreak: 'break-word', overflowWrap: 'break-word', whiteSpace: 'normal',
                }}>{file.name}</Typography>
              </IconButton>
            ) : (
              <a href={`file://${encodeURI(file.path)}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                <IconButton
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      window.open(`file://${encodeURI(file.path)}`, '_blank');
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', borderRadius: '8px' }}
                >
                  {getFileIcon(file)}
                  <Typography variant="body2" sx={{
                    textAlign: 'center', wordBreak: 'break-word', overflowWrap: 'break-word', whiteSpace: 'normal',
                  }}>{file.name}</Typography>
                </IconButton>
              </a>
            )}
          </Grid>
        )))}
      </Grid>
    </Box>
  );
};

FileManager.propTypes = {
  initialPath: PropTypes.string.isRequired,
};

export default FileManager;