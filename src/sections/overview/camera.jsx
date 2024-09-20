import axios from 'axios';
import { toast } from 'sonner';
import PropTypes from 'prop-types';
import React, { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

import { SERVER_IP, CAMERA_IP } from '../../../config';

const CameraView = ({ selectedGate }) => {
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [recording, setRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const peerConnectionsRef = useRef({});
  const initializedStreamsRef = useRef({});
  const pingIntervalRef = useRef(null);

  const log = (...msg) => {
    const dt = new Date();
    const ts = `${dt.getHours().toString().padStart(2, '0')}:${dt.getMinutes().toString().padStart(2, '0')}:${dt.getSeconds().toString().padStart(2, '0')}.${dt.getMilliseconds().toString().padStart(3, '0')}`;
    console.log(ts, 'webrtc', ...msg);
  };

  const cleanUpAndReload = async () => {
    // Cleanup existing connections and streams
    const suuid = selectedGate.svdgsId;
    const connection = peerConnectionsRef.current[suuid];
    const stream = initializedStreamsRef.current[suuid];

    if (connection) {
      connection.close();
      delete peerConnectionsRef.current[suuid];
      log(`Connection closed for stream: ${suuid}`);
    }

    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      delete initializedStreamsRef.current[suuid];
      log(`Stream tracks stopped for stream: ${suuid}`);
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
      log('Video element cleared');
    }

    clearInterval(pingIntervalRef.current);

    // Reinitialize WebRTC connection and video feed
    await loadVideoFeed();
  };

  const webRTC = useCallback(async (streamName, videoElement) => {
    const suuid = streamName;
    log(`Client starting for stream: ${suuid}`);

    const stream = new MediaStream();
    const connection = new RTCPeerConnection();
    let reconnectionTimeoutId = null;

    peerConnectionsRef.current[suuid] = connection;
    initializedStreamsRef.current[suuid] = stream;

    connection.oniceconnectionstatechange = () => {
      log('Connection state change:', connection.iceConnectionState);
      if (connection.iceConnectionState === 'disconnected' || connection.iceConnectionState === 'failed') {
        log('Connection lost or failed');
        if (reconnectionTimeoutId === null) {
          reconnectionTimeoutId = setTimeout(() => {
            cleanUpAndReload();
          }, 120000);
        }
      } else if (reconnectionTimeoutId !== null) {
          clearTimeout(reconnectionTimeoutId);
          reconnectionTimeoutId = null;
        }
    };

    connection.onnegotiationneeded = async () => {
      try {
        log('Negotiation needed for stream:', suuid);
        const offer = await connection.createOffer();
        await connection.setLocalDescription(offer);
        log('Offer created and set as local description:', offer);

        const res = await fetch(`${CAMERA_IP}/stream/receiver/${suuid}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
          body: new URLSearchParams({
            suuid,
            data: btoa(connection.localDescription?.sdp || '')
          }),
        });

        const data = (res && res.ok) ? await res.text() : '';
        if (data.length === 0) {
          log('Cannot connect to server:', `${CAMERA_IP}`);
          reconnectionTimeoutId = setTimeout(() => {
            cleanUpAndReload();
          }, 120000);
        } else {
          await connection.setRemoteDescription(new RTCSessionDescription({
            type: 'answer',
            sdp: atob(data),
          }));
          log('Negotiation completed. Remote description set:', data);
        }
      } catch (error) {
        log('Negotiation error:', error);
        reconnectionTimeoutId = setTimeout(() => {
          cleanUpAndReload();
        }, 120000);
      }
    };

    connection.ontrack = (event) => {
      stream.addTrack(event.track);
      if (videoElement instanceof HTMLVideoElement) {
        videoElement.srcObject = stream;
        log(`Stream set to video element`);
      } else {
        log('Element is not a video element');
      }
      videoElement.onloadeddata = () => log('Video loaded:', videoElement.videoWidth, videoElement.videoHeight);
      log('Received track:', event.track, event.track.getSettings());
    };

    try {
      const res = await fetch(`${CAMERA_IP}/stream/codec/${suuid}`);
      let streams = [];
      try {
        streams = res && res.ok ? await res.json() : [];
        log('Streams received:', streams);
      } catch {
        log('Failed to parse streams');
      }
      if (streams.length === 0) {
        log('No streams received');
        reconnectionTimeoutId = setTimeout(() => {
          cleanUpAndReload();
        }, 120000);
        return;
      }
      streams.forEach(s => {
        connection.addTransceiver(s.Type, { direction: 'sendrecv' });
      });
    } catch (error) {
      log('Fetch error:', error);
    }

    const channel = connection.createDataChannel(suuid, { maxRetransmits: 10 });
    channel.onmessage = (e) => log('Channel message:', channel.label, 'payload', e.data);
    channel.onerror = (e) => log('Channel error:', channel.label, 'payload', e);
    channel.onclose = () => {
      log('Channel closed');
      clearInterval(pingIntervalRef.current);
    };
    channel.onopen = () => {
      log('Channel opened');
      pingIntervalRef.current = setInterval(() => channel.send('ping'), 1000);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadVideoFeed = async () => {
    const videoElement = videoRef.current;
    if (videoElement) {
      await webRTC(selectedGate.svdgsId, videoElement);
    }
  };

  useEffect(() => {
    loadVideoFeed();

    const currentPeerConnections = peerConnectionsRef.current;
    const currentInitializedStreams = initializedStreamsRef.current;
    const currentVideoRef = videoRef.current;

    return () => {
      const suuid = selectedGate.svdgsId;
      const connection = currentPeerConnections[suuid];
      const stream = currentInitializedStreams[suuid];

      if (connection) {
        connection.close();
        delete currentPeerConnections[suuid];
        log(`Connection closed for stream: ${suuid}`);
      }

      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        delete currentInitializedStreams[suuid];
        log(`Stream tracks stopped for stream: ${suuid}`);
      }

      if (currentVideoRef) {
        currentVideoRef.srcObject = null;
        log('Video element cleared');
      }

      clearInterval(pingIntervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGate, webRTC]);

  const startRecording = () => {
    setRecordedChunks([]);
    const stream = videoRef.current.srcObject;
    mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'video/webm' });
    mediaRecorderRef.current.ondataavailable = (event) => {
      if (event.data.size > 0) {
        setRecordedChunks((prev) => [...prev, event.data]);
      }
    };
    mediaRecorderRef.current.start();
    setRecording(() => true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setRecording(() => false);
  };

  const saveRecording = () => {
    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    const formData = new FormData();
    const now = new Date();
    const formattedDate = now.toISOString().replace(/:/g, '-');
    formData.append('file', blob, `Stand-${selectedGate.standName}-${formattedDate}.mp4`);

    axios.post(`${SERVER_IP}/api/storage/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
      .then(data => {
        toast.success(data.data.message);
      })
      .catch(error => {
        console.error('Error uploading file:', error);
      });

    setRecordedChunks([]);
  };

  return (
    <>
      <Box className="video-container"
           style={{ width: '388px', height: '218px', borderRadius: '8px', overflow: 'hidden' }}>
        <video ref={videoRef} autoPlay muted controls style={{ width: '100%', height: '100%', borderRadius: '8px' }} />
      </Box>
      <Stack direction="row" sx={{ marginTop: '10px !important' }}>
        {!recording && (
          <Button color="inherit" onClick={startRecording} disabled={recording}>
            Start Recording
          </Button>
        )}
        {recording && (
          <Button color="inherit" onClick={stopRecording} disabled={!recording}>
            Stop Recording
          </Button>
        )}
        {recordedChunks.length > 0 && (
          <Button color="success" onClick={saveRecording}>Save Recording</Button>
        )}
      </Stack>
    </>
  );
};

CameraView.propTypes = {
  selectedGate: PropTypes.any,
};

export default CameraView;