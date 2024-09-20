import React, { useRef, useState, useEffect, useCallback } from 'react';

import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Pagination from '@mui/material/Pagination';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';

import { CAMERA_IP, SERVER_IP } from '../../../config';

const WebRTCComponent = () => {
  const [devices, setDevices] = useState([]);
  const videoGridRef = useRef(null);
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const initializedStreamsRef = useRef({});
  const peerConnectionsRef = useRef({});
  const streamsRef = useRef({});

  const log = (...msg) => {
    const dt = new Date();
    const ts = `${dt.getHours().toString().padStart(2, '0')}:${dt.getMinutes().toString().padStart(2, '0')}:${dt.getSeconds().toString().padStart(3, '0')}`;
    console.log(ts, 'webrtc', ...msg);
  };

  const webRTC = useCallback(async (streamName, videoElement) => {
    const stream = new MediaStream();
    const connection = new RTCPeerConnection();

    connection.oniceconnectionstatechange = () => log('Connection state change:', connection.iceConnectionState);

    connection.onnegotiationneeded = async () => {
      try {
        const offer = await connection.createOffer();
        await connection.setLocalDescription(offer);

        const res = await fetch(`${CAMERA_IP}/stream/receiver/${streamName}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
          body: new URLSearchParams({
            suuid: streamName, data: btoa(connection.localDescription?.sdp || ''),
          }),
        });

        const data = (res && res.ok) ? await res.text() : '';
        if (data.length === 0) {
          log('Cannot connect to server:', `${CAMERA_IP}`);
        } else {
          await connection.setRemoteDescription(new RTCSessionDescription({
            type: 'answer', sdp: atob(data),
          }));
        }
      } catch (error) {
        log('Negotiation error:', error);
      }
    };

    connection.ontrack = (event) => {
      stream.addTrack(event.track);
      videoElement.srcObject = stream;
      videoElement.onloadeddata = () => log('Video loaded:', videoElement.videoWidth, videoElement.videoHeight);
    };

    try {
      const res = await fetch(`${CAMERA_IP}/stream/codec/${streamName}`);
      let streams = [];
      try {
        streams = res && res.ok ? await res.json() : [];
      } catch {
        log('Failed to parse streams');
      }
      if (streams.length === 0) {
        log('No streams received');
        return;
      }
      streams.forEach(s => {
        connection.addTransceiver(s.Type, { direction: 'sendrecv' });
      });
    } catch (error) {
      log('Fetch error:', error);
    }

    let pingInterval;

    const channel = connection.createDataChannel(streamName, { maxRetransmits: 10 });
    channel.onmessage = (e) => log('Channel message:', channel.label, 'payload', e.data);
    channel.onerror = (e) => log('Channel error:', channel.label, 'payload', e);
    channel.onclose = () => {
      log('Channel closed');
      clearInterval(pingInterval);
    };
    channel.onopen = () => {
      log('Channel opened');
      pingInterval = setInterval(() => {
        if (channel.readyState === 'open') {
          channel.send('ping');
        } else {
          clearInterval(pingInterval);
        }
      }, 1000);
    };

    // Save the connection to close it later
    peerConnectionsRef.current[streamName] = connection;
    streamsRef.current[streamName] = stream;
  }, []);

  const closeConnections = useCallback(() => {
    Object.keys(peerConnectionsRef.current).forEach((key) => {
      const connection = peerConnectionsRef.current[key];
      if (connection) {
        connection.close();
      }
    });
    peerConnectionsRef.current = {};

    Object.keys(streamsRef.current).forEach((key) => {
      const stream = streamsRef.current[key];
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    });
    streamsRef.current = {};
  }, []);

  const clearVideoElements = () => {
    const videoGrid = videoGridRef.current;
    if (videoGrid) {
      const videoElements = videoGrid.getElementsByTagName('video');
      Array.from(videoElements).forEach(videoElement => {
        videoElement.srcObject = null;
      });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${SERVER_IP}/api/devices/get-camera-devices`);
        const data = await response.json();
        if (data.length <= 4) {
          setItemsPerPage(4);
        } else if (data.length > 4 && data.length <= 8) {
          setItemsPerPage(8);
        } else if (data.length > 8) {
          setItemsPerPage(12);
        }
        setDevices(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const initializeWebRTC = useCallback(async () => {
    const videoGrid = videoGridRef.current;
    if (videoGrid && devices.length > 0) {
      const videoElements = videoGrid.getElementsByTagName('video');
      const startIndex = (page - 1) * itemsPerPage;

      await Promise.all(Array.from(videoElements).map(async (videoElement, index) => {
        const device = devices[startIndex + index];
        if (device && !initializedStreamsRef.current[device.svdgs_id]) {
          initializedStreamsRef.current[device.svdgs_id] = true;
          await webRTC(device.svdgs_id, videoElement);
        }
      }));
    }
  }, [devices, itemsPerPage, page, webRTC]);

  useEffect(() => {
    clearVideoElements();
    closeConnections();
    initializedStreamsRef.current = {};
    initializeWebRTC();
  }, [initializeWebRTC, page, itemsPerPage, closeConnections]);

  useEffect(() => () => {
    clearVideoElements();
    closeConnections();
  }, [closeConnections]);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleItemsPerPageChange = (event) => {
    setItemsPerPage(event.target.value);
    setPage(1); // Reset to first page on items per page change
  };

  let itemsPerPageOptions = [];
  if (devices.length >= 12) {
    itemsPerPageOptions = [4, 8, 12];
  } else if (devices.length > 4 && devices.length <= 8) {
    itemsPerPageOptions = [4, 8];
  } else if (devices.length <= 4) {
    itemsPerPageOptions = [4];
  }

  // Calculate paginated devices based on current page and items per page
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, devices.length);
  const paginatedDevices = devices.slice(startIndex, endIndex);

  return (<>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 5, mb: 1, px: 6 }}>
        <Typography variant="h4">Camera</Typography>
      </Stack>
      <Grid container spacing={2} className="video-grid" ref={videoGridRef} sx={{ mt: 0, mb: 1, px: 6 }}>
        {paginatedDevices.map((device, index) => (<Grid item xs={12} sm={6} md={4} lg={3} key={device.svdgs_id}>
            <Stack sx={{ mt: 0, mx: 1, mb: 0.3 }}>
              <Typography variant="body2">Stand-{device.name} Camera</Typography>
            </Stack>
            <Card className="video-container" component={Stack}
                  spacing={2}
                  sx={{
                    px: 1, py: 1, borderRadius: 2, alignItems: 'center', maxWidth: '370px', height: '216px'
                  }}>
              <div style={{ height: '100%', borderRadius: '8px', overflow: 'hidden' }}>
                <video id={`videoElem${device.svdgs_id}`} autoPlay muted controls
                       style={{ width: '100%', height: '100%', borderRadius: '8px' }} />
              </div>
            </Card>
          </Grid>))}
      </Grid>
      <Stack direction="row" alignItems="center" justifyContent="center" spacing={3} sx={{ mt: 2 }}>
        <Pagination count={Math.ceil(devices.length / itemsPerPage)} page={page} onChange={handlePageChange} />
        <FormControl sx={{ minWidth: '9%' }}>
          <InputLabel>Items per page</InputLabel>
          <Select
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
            label="Items per page"
          >
            {itemsPerPageOptions.map(option => (<MenuItem key={option} value={option}>{option}</MenuItem>))}
          </Select>
        </FormControl>
      </Stack>
    </>);
};

export default WebRTCComponent;