import { toast } from 'sonner';
import PropTypes from 'prop-types';
import { ReactSVGPanZoom } from 'react-svg-pan-zoom';
import React, { useRef, useState, useEffect, useCallback } from 'react';

import Card from '@mui/material/Card';

import './srinagar-airport-layout.css';
import StandMapping from './stand-mapping';
import { SERVER_IP } from '../../../config';
import { socket } from '../../websocket/websocket';

export default function AmritsarAirportLayoutCard({ onOpenStandInfo, sx, ...other }) {
  const viewer = useRef(null);
  const [value, setValue] = useState({});
  const [setTool] = useState('auto');

  const [openStandMapping, setOpenStandMapping] = useState(false);
  const [selectedId, setSelectedId] = useState('');

  const userId = ((JSON.parse(sessionStorage.getItem('userData'))).userId).toString();
  const userRole = ((JSON.parse(sessionStorage.getItem('userData'))).role).toString();

  const handleSelectedStand = (data) => {
    if (userId === data.userId && data.svgId) {
      setSelectedId(() => data.svgId);
    }
  };

  if (!selectedId) {
    socket.emit('send-view-reload', userId);
    socket.on('selectedStand', handleSelectedStand);
  }

  useEffect(() => () => {
    socket.off('selectedStand', handleSelectedStand);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleStandStatus = (data) => {
      const { svgId } = data;
      const number = svgId.substring(2); // Extract the number part after 'B-'
      const flight = document.getElementById(`F-${number}`);
      if (flight) {
        if (data.standStatusCode === '1' || data.standStatusCode === '3' || data.standStatusCode === '5' || data.standStatusCode === '5') {
          flight.className.baseVal = 'cls-2-show';
        } else {
          flight.className.baseVal = 'cls-2-hide';
        }
      }
    };

    socket.on('standStatus:', handleStandStatus);

    return () => {
      socket.off('standStatus:', handleStandStatus);
    };
  }, []);

  useEffect(() => {
    if (viewer.current) {
      const initialValue = viewer.current.getValue();
      const viewerRect = viewer.current.ViewerDOM.getBoundingClientRect();
      const viewerWidth = viewerRect.width;
      const viewerHeight = viewerRect.height;
      const svgWidth = 1024; // Your SVG width
      const svgHeight = 720.04; // Your SVG height
      const translationX = (svgWidth - viewerWidth * 0.7) / 2;
      const newZoomValue = {
        ...initialValue, a: 0.6, d: 0.6, e: translationX, // Translate the SVG to the left
        f: (viewerHeight - svgHeight * 0.95), // Translate the SVG downwards to the bottom
      };
      setValue(newZoomValue);
    }
  }, []);

  const handleClickOpenStand = useCallback((id, event) => {
    event.preventDefault(); // Prevent the default context menu and touch behavior

    const handleLeftClick = () => {
      if (selectedId !== id) {
        const storedUserData = JSON.parse(sessionStorage.getItem('userData'));

        fetch(`${SERVER_IP}/api/device-mapping/select-device-mapping/${storedUserData.userId}/${id}`)
          .then(response => response.json())
          .then(data => {
            if (data.error) {
              console.error('Error fetching stands:', data.error);
              toast.error('Stand is not mapped with the device.');
            } else {
              toast.success(data.message);
              setSelectedId(id);
              onOpenStandInfo();
            }
          })
          .catch(error => {
            console.error('Error fetching stands:', error);
          });
      }
    };

    const handleRightClick = () => {
      if (userRole !== '2') {
        setSelectedId(id);
        setOpenStandMapping(true);
      }
    };

    if (event.type === 'click' && event.button === 0) {
      handleLeftClick();
    } else if (event.type === 'contextmenu' && event.button === 2) {
      handleRightClick();
    }
  }, [onOpenStandInfo, selectedId, userRole]);

  const fetchMappingData = useCallback(async () => {
    try {
      const response = await fetch(`${SERVER_IP}/api/device-mapping/get-device-mappings`);
      const data = await response.json();

      // Loop through the fetched data and find the corresponding SVG element by id
      data.forEach(mapping => {
        const svgRect = document.getElementById(mapping.svg_id);
        if (svgRect) {
          // Calculate the middle point of the rect
          const rectX = parseFloat(svgRect.getAttribute('x'));
          const rectY = parseFloat(svgRect.getAttribute('y'));
          const rectWidth = parseFloat(svgRect.getAttribute('width'));
          const rectHeight = parseFloat(svgRect.getAttribute('height'));
          const textX = rectX + rectWidth / 2;
          const textY = rectY + rectHeight / 2;

          // Create a new text element for the code
          const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          text.setAttribute('x', textX);
          text.setAttribute('y', textY);
          text.setAttribute('text-anchor', 'middle');
          text.setAttribute('dominant-baseline', 'middle');
          text.setAttribute('style', `cursor: pointer; fill: ${selectedId === mapping.svg_id ? 'white' : 'black'};`);
          text.textContent = mapping.name;

          // Attach onclick event listener to the text element
          text.addEventListener('click', (event) => {
            handleClickOpenStand(mapping.svg_id, event); // Call handleClickOpenStand with svg_id
          });

          // Attach onContextMenu event listener to the text element
          text.addEventListener('contextmenu', (event) => {
            handleClickOpenStand(mapping.svg_id, event); // Call handleClickOpenStand with svg_id
          });

          // Append the text element to the SVG
          svgRect.parentNode.appendChild(text);
        }
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }, [handleClickOpenStand, selectedId]); // No dependencies, as it doesn't rely on props or state

  const handleCloseStandMapping = () => {
    setOpenStandMapping(false);
    setSelectedId('');
  };

  useEffect(() => {
    fetchMappingData();
  }, [fetchMappingData]);

  const getRectClassName = (id) => id === selectedId ? 'cls-9 selected' : 'cls-9';

  const rects = [
    { id:"B-09", x:"1105.69", y:"266.4", width:"17.91", height:"27.39",
          transform:"translate(359.06 1146.1) rotate(-63)" },
    { id:"B-08", x:"1008.87", y:"218.08", width:"17.91", height:"27.39",
          transform:"translate(406.35 1077.81) rotate(-66.97)" },
    { id:"B-07", x:"722.92", y:"195.67", width:"27.39", height:"17.91",
          transform:"translate(41.29 522.41) rotate(-40.09)" },
    { id:"B-06", x:"635.7", y:"220.62", width:"27.39", height:"17.91",
          transform:"translate(-39.35 236.3) rotate(-20.03)" },
    { id:"B-05", x:"550.21", y:"242.1", width:"27.39", height:"17.91",
          transform:"translate(-17.44 43.55) rotate(-4.36)" },
    { id:"B-04", x:"440.13", y:"259.84", width:"17.91", height:"27.39",
          transform:"translate(75.44 643.51) rotate(-76.06)" },
    { id:"B-03", x:"375.04", y:"220.35", width:"17.91", height:"27.39",
          transform:"translate(-21.16 429.18) rotate(-57.08)" },
    { id:"B-02", x:"316.46", y:"190.47", width:"17.91", height:"27.39",
          transform:"translate(-54.95 258) rotate(-40.16)" },
    { id:"B-01", x:"263.85", y:"150.55", width:"17.91", height:"27.39",
          transform:"translate(-44.96 143.72) rotate(-27.36)" },
  ];

  const flights = [
    { id:"F-09",
          d:"M1076.91,318.38l13.97-1.91s3.68-5.31,5.01-7c0,0,1.06-1.17,2.15-.62,0,0,.88.45.25,2.2,0,0-3.94,6.31-4.64,7.37l3.51,13.51-1.5.64-5.55-8.93s-4.26,6.11-4.59,6.41l.75,2.95-1.15,1.71-2.3-3.21-3.86-.9,1.15-1.71,3.02-.43s2.96-4.79,4.21-6.7l-10.48-1.74.03-1.63h0Z" },
    { id:"F-08",
          d:"M979.07,269.99l13.97-1.91s3.68-5.31,5.01-7c0,0,1.06-1.17,2.15-.62,0,0,.88.45.25,2.2,0,0-3.94,6.31-4.64,7.37l3.51,13.51-1.5.64-5.55-8.93s-4.26,6.11-4.59,6.41l.75,2.95-1.15,1.71-2.3-3.21-3.86-.9,1.15-1.71,3.02-.43s2.96-4.79,4.21-6.7l-10.48-1.74.03-1.63h0Z" },
    { id:"F-07",
          d:"M765.61,252.7l.53-14.09s-4.59-4.55-6.03-6.15c0,0-.97-1.24-.24-2.23,0,0,.6-.79,2.21.14,0,0,5.54,4.97,6.46,5.84l13.91-1.12.37,1.58-9.76,3.92s5.28,5.26,5.52,5.63l3.04-.23,1.49,1.43-3.56,1.71-1.55,3.64-1.49-1.43.1-3.05s-4.21-3.75-5.87-5.31l-3.53,10.02-1.59-.32h0Z" },
    { id:"F-06",
          d:"M658.78,280.53l5.43-13.01s-2.71-5.87-3.5-7.87c0,0-.47-1.5.56-2.17,0,0,.84-.53,2.02.9,0,0,3.44,6.59,4,7.74l13.42,3.82-.2,1.62-10.51.25s3.1,6.77,3.2,7.21l2.93.85.89,1.86-3.94.36-2.73,2.87-.89-1.86,1.16-2.82s-2.63-4.98-3.64-7.03l-6.81,8.15-1.38-.85h0Z" },
    { id:"F-05",
          d:"M552.87,305.44l10.29-9.63s-.06-6.46.04-8.61c0,0,.19-1.56,1.4-1.75,0,0,.98-.14,1.47,1.65,0,0,.43,7.43.48,8.7l10.67,8.99-.85,1.39-9.69-4.08s.05,7.45-.04,7.88l2.32,1.98.05,2.06-3.74-1.29-3.67,1.5-.05-2.06,2.22-2.1s-.35-5.62-.43-7.91l-9.56,4.64-.91-1.35h0Z" },
    { id:"F-04",
          d:"M419.34,319.53l13.14-5.09s2.36-6.02,3.25-7.97c0,0,.76-1.38,1.95-1.1,0,0,.97.24.75,2.08,0,0-2.37,7.05-2.81,8.25l6.54,12.33-1.31.97-7.46-7.41s-2.73,6.93-2.98,7.3l1.41,2.7-.72,1.93-2.98-2.59-3.96.02.72-1.93,2.84-1.12s1.77-5.35,2.55-7.5l-10.6.73-.34-1.59h0Z" },
    { id:"F-03",
          d:"M343.09,269.78l14.01-1.54s3.82-5.21,5.19-6.87c0,0,1.09-1.14,2.17-.56,0,0,.87.48.19,2.2,0,0-4.1,6.21-4.83,7.25l3.15,13.6-1.51.6-5.31-9.08s-4.42,5.99-4.76,6.29l.67,2.97-1.2,1.68-2.22-3.27-3.83-1,1.2-1.68,3.03-.35s3.09-4.71,4.39-6.59l-10.43-2.02.08-1.62h0Z" },
    { id:"F-02",
          d:"M278.02,230.48l13.93,2.18s5.05-4.03,6.81-5.27c0,0,1.35-.82,2.24.03,0,0,.72.69-.4,2.17,0,0-5.59,4.92-6.56,5.73l-.51,13.95-1.62.19-2.75-10.15s-5.84,4.63-6.24,4.82l-.13,3.04-1.59,1.31-1.28-3.74-3.44-1.97,1.59-1.31,3.02.46s4.22-3.74,5.96-5.21l-9.54-4.68.5-1.55h0Z" },
    { id:"F-01",
          d:"M221.33,180.12l13.08,5.26s5.83-2.79,7.82-3.6c0,0,1.5-.49,2.18.53,0,0,.54.83-.87,2.03,0,0-6.55,3.53-7.68,4.11l-3.64,13.47-1.62-.18-.4-10.51s-6.73,3.19-7.16,3.29l-.81,2.94-1.85.92-.41-3.93-2.91-2.69,1.85-.92,2.84,1.12s4.95-2.7,6.98-3.73l-8.24-6.7.84-1.39h0Z" },
  ];


  const handleChangeTool = (newTool) => {
    setTool(newTool);
  };

  return (<Card
    sx={{
      display: 'flex', alignItems: 'center', justifyContent: 'center', height: '79vh', width: '100%', ...sx,
    }}
    {...other}
  >
    <ReactSVGPanZoom
      width="1300px"
      height="100%"
      ref={viewer}
      tool="auto"
      detectAutoPan={false}
      value={value}
      onChangeValue={setValue}
      onChangeTool={handleChangeTool}
      background="#212B36"
      toolbarProps={{ position: 'none' }}
      miniatureProps={{ position: 'none' }}
      scaleFactorMin={0.6} // Set minimum scale factor
      scaleFactorMax={10}  // Set maximum scale factor
      scaleFactorOnWheel={1.1}
      style={{ cursor: 'pointer' }}>
      <svg width="0%" height="0%" style={{ position: 'relative' }}>
        <g id="Base">
          <path className="cls-4"
                d="M731.37,83.42c-2.2,5.05-57.18,125.22-188.03,140.2-88.45,10.13-175.8-31.91-224.42-107.97-1.19-3.82-5.6-19.05-5.67-18.13-.65-1.46-7.04-12.47-7.64-14.38-14.98-12.19-36.39-5.42-38.18-4.83-3.5,12.27-7,24.54-10.5,36.81l-28.87,21.6-158.27-27.02L0,204.85c78.95,84.99,157.89,169.97,236.84,254.96,7.37,8.32,15.37,18.44,23.15,30.48,8.26,12.79,14.48,24.96,19.19,35.71.19.42,127.65,2.02,130.96,2.22s86.93,4.32,89.42,4.53c7.81.66,145.81,12.66,146.51,12.88,3.26,1.02,19.48-5.04,22.85-4,2.62.81,4.24,2.47,5.31,3.58,2.3,2.39,7.96,20.34,8.11,22.61l103.26-24.94-7.87-18.49,27.02-7.4-17.72-49.99,286.16-29.72,46.83-68.07,33.88,14.55,10.02-11.51,77.91,28.04,50.88-48.38,41.16,14.38,5.01-14.14c-202.51-89.58-405.02-179.16-607.53-268.74Z" />
        </g>
        <g id="Stand-Lines">
          <path id="CL-09" className="cls-10"
                d="M1102.34,300.9c-10.8,19.09-24.1,36.87-34.9,55.96,4.41,17.48-3.88,37.88-20.14,44.56" />
          <path id="CL-08" className="cls-10"
                d="M1006.8,251.65l-53.03,78.39c1.73,4.02,10.35,25.2.66,49.04-10.49,25.81-34.32,34.76-40.01,36.6-.36.12-1.6.5-1.81.57" />
          <g id="CL-07">
            <path className="cls-10"
                  d="M834.31,424.96c-2.71.68-6.71-1.03-9.25-1.81-4.92-1.52-9.73-3.56-14.08-6.35-10.91-6.99-16.82-19.11-16.97-31.95-.04-3.64.32-7.33,1.23-10.87.06-.25.79-1.76.86-2.01" />
            <path id="cb7" className="cls-10"
                  d="M752.73,223.15l44.42,41.62c4.41.43,21.17,2.59,33.51,16.75,6.4,7.34,9.14,15.07,10.37,19.8-28.34,43.6-73.37,120.53-93.64,132.77-.31.19-1.52.68-1.82.83" />
          </g>
          <line id="CL-06" className="cls-10" x1="659.19" y1="252.38" x2="741.46" y2="435.16" />
          <g id="CL-05">
            <line id="cb5" className="cls-10" x1="565.06" y1="480.86" x2="564.82" y2="275.59" />
            <path id="cb5l" className="cls-10"
                  d="M553.37,480.32c21.97-15.35,34.19-39.99,31.26-64.25-2.42-20.01-14.34-33.18-19.21-38" />
            <path className="cls-10"
                  d="M576.39,478.02c-21.8-12.22-36.24-34.95-32.6-60.18,2.8-14.5,8.77-28.93,20.97-38.51" />
          </g>
          <g id="CL-04">
            <line id="cb4" className="cls-10" x1="441.03" y1="298.56" x2="372.02" y2="469.95" />
            <path id="cb4l" className="cls-10"
                  d="M381.34,470.08c-3.13-4.48-14.87-22.4-11.63-46.51,4.97-36.95,41.63-53.75,43.1-54.38" />
            <path id="cb4r" className="cls-10"
                  d="M366.02,469.2c31.03-9.33,53.86-34.66,57.22-62.1,2.3-18.84-6.25-33.91-10.06-40.12" />
          </g>
          <g id="CL-03">
            <path className="cls-10"
                  d="M211.91,369.71c8.87,7.08,19.81,11.41,31.01,12.96,6.12.84,13.3,1.34,19.33-.2s12.24-4.35,17.71-7.83c5.64-3.59,10.77-7.96,15.36-12.81s8.14-10.48,11.69-15.92c1.58-2.42,3.13-4.86,4.69-7.28,2.06-3.2,4.15-6.38,6.34-9.48,16.94-26.25,33.52-50.29,50.73-74" />
            <path id="cb3l" className="cls-10"
                  d="M299.17,357.56c-3.94.63-22.84,4.56-34.84,19.27-12.84,15.74-11.46,34.39-11.15,38.06" />
          </g>
          <g id="CL-02">
            <path className="cls-10"
                  d="M146.91,298.69c16.62,14.46,41.16,14.66,60.58,6.12,11.03-4.85,18.49-12.31,26.59-20.91,10.37-11,23.01-19.35,34.46-29.11,1.51-1.29,31.5-27.03,38.85-31.8" />
            <path id="cb2l" className="cls-10"
                  d="M178.19,332.51c.71-4.89,3.42-18.99,15.45-31.02,15.06-15.07,35.69-16.55,39.85-16.64" />
          </g>
          <g id="CL-01">
            <path id="cb1l" className="cls-10"
                  d="M101.95,249.47c2.4.95,29.86,12.16,53.21-4.06,13.81-9.59,17.25-21.72,18.85-26.85" />
            <path id="cb1" className="cls-10"
                  d="M122.71,272.32c1.17-6.02,4.35-20.6,15.81-33.23,13.09-14.43,28.69-18.87,34.54-20.22,26.19-13.42,52.38-26.85,78.56-40.27" />
          </g>
        </g>
        <g id="Stands">
          <rect id="S-C9" className="cls-3" x="1100.35" y="293.55" width="9" height="9"
                transform="translate(-38.97 263.47) rotate(-13.37)" />
          <rect id="S-C8" className="cls-3" x="1004.19" y="243.98" width="9" height="9"
                transform="translate(-30.12 239.9) rotate(-13.37)" />
          <rect id="S-C7" className="cls-3" x="746.45" y="217.01" width="9" height="9"
                transform="translate(-8.5 31.19) rotate(-2.37)" />
          <rect id="S-C6" className="cls-3" x="653.27" y="244.04" width="9" height="9"
                transform="translate(175.23 759.99) rotate(-67.37)" />
          <rect id="S-C5" className="cls-3" x="559.75" y="266.56" width="9" height="9"
                transform="translate(.22 542.58) rotate(-51.37)" />
          <rect id="S-C4" className="cls-3" x="437.85" y="289.57" width="9" height="9"
                transform="translate(-85.67 236.24) rotate(-27.37)" />
          <rect id="S-C3" className="cls-3" x="366.91" y="246.66" width="9" height="9"
                transform="translate(-45.17 85.36) rotate(-12.37)" />
          <rect id="S-C2" className="cls-3" x="305.45" y="215.44" width="9" height="9"
                transform="translate(-12.38 18.57) rotate(-3.37)" />
          <rect id="S-C1" className="cls-3" x="250.5" y="171.38" width="9" height="9"
                transform="translate(42.83 401.59) rotate(-81.37)" />
        </g>
        <g id="Centerline">
          <path id="con2" className="cls-6" d="M565.6,538.07c-.42-19.11-.8-38.23-1.1-57.34" />
          <path id="left" className="cls-6"
                d="M55.78,198.94l233.91,255.9c6.19,6.77,14.8,10.84,23.97,11.3l251.4,14.71" />
          <polyline id="right" className="cls-6" points="1048.26 401.09 740.5 435.46 564.1 481.16" />
          <path id="right-turn" className="cls-6"
                d="M565.9,537.17c.48-7.36,2.54-23.56,13.72-39.91,11.86-17.35,27.06-25.45,35.02-28.75.91-.38,4.77-1.49,8.59-2.68" />
          <path id="left-turn" className="cls-6"
                d="M508.51,477.58c3.16.06,6.65.35,8.46.89,8.18,2.42,23.06,8.49,34.73,23.33,11.16,14.2,13.55,29,14.2,35.38" />
          <path className="cls-6" d="M372.42,469.27c-8.55,18.66-14.55,38.66-23.14,57.27" />
          <path id="left-turn-2" data-name="left-turn" className="cls-6"
                d="M293.37,458.42c1.46.67,2.59,2.21,4,3,25.94,14.43,44.21,45.08,48,65" />
        </g>
        <g id="Buildings">
          <polygon id="pbb1arm" className="cls-7"
                   points="336.63 148.89 303.77 172.81 297.09 179.58 282.41 223.46 286.11 228.59 290.94 223.93 287.88 219.65 300.9 182.06 314.6 177.32 344.69 157.89 336.63 148.89" />
          <polygon id="pbb2arm" className="cls-7"
                   points="375.17 185.04 349.82 212.87 343.83 224.77 346.06 252.81 357.75 253.34 355.66 246.66 350.27 246.16 349.41 229.15 361.59 218.7 385.43 194.4 375.17 185.04" />
          <polygon id="pbb3arm" className="cls-7"
                   points="422.86 212.54 401.98 253.81 419.73 285.31 430.08 280.27 425.7 272.97 421.23 275.41 413.47 258.98 437.15 219.1 422.86 212.54" />
          <polygon id="pbb4arm" className="cls-7"
                   points="510.69 233.14 503.21 271.77 530.43 296.3 541.3 289.22 535.41 283.75 530.75 287.28 517.63 273.67 525.44 233.41 510.69 233.14" />
          <polygon id="pbb5arm" className="cls-7"
                   points="586.95 225.72 596.73 260.37 628.65 278.69 641.04 274.81 638.77 267.56 629.12 270.16 607.53 258.05 608.21 248.71 602.69 220.79 586.95 225.72" />
          <circle id="bpp1" className="cls-7" cx="305.1" cy="177.07" r="9.5" />
          <circle id="bpp2" className="cls-7" cx="352.05" cy="220.02" r="9.5" />
          <circle id="bpp3" className="cls-7" cx="410.64" cy="249.91" r="9.5" />
          <circle id="bpp4" className="cls-7" cx="511.22" cy="266.67" r="9.5" />
          <circle id="bpp5" className="cls-7" cx="602.19" cy="256.05" r="9.5" />
          <polygon id="con2-2" data-name="con2" className="cls-7"
                   points="463.87 56.54 430.37 114.42 462.1 129.42 496.37 72.42 463.87 56.54" />
          <path id="con1" className="cls-7"
                d="M557.37,72.42l38,57c9-7.33,18-14.67,27-22-11.81-18.7-23.61-37.39-35.42-56.09l-29.58,21.09Z" />
          <path id="roof" className="cls-7"
                d="M302.22,99.69c10.3,20.64,32.8,58.71,76.14,89.74,66.72,47.75,137.13,46.09,160.44,44.45,22.07-1.56,95.98-9.75,155.56-69.45,25.42-25.47,39.91-51.98,48-70-10.78-2.48-23.47-6.43-37-12.89-28.49-13.59-47.65-32.05-59-45.11l-2,4s8,9,7,17c0,0-6,2-11-7l-3,5s7,7,4,16c0,0-6-1-11-8l-3,5s5,6,4,16c0,0-9-3-11-13l-15,9s4,53-31,18l-5,1-3-7-8,3s1.12,13.71-10.94,26.85c0,0-9.06-7.85-8.06-20.85,0,0-19,3-25,0,0,0-13,24-19,24,0,0-5-2-3-26l-11-2s-42,42-34-17l-8-6s-13,16-21,13c0,0,1-11,11-18l-3-4s-7,10-19,9c0,0,1-10,12-17l-4-4s-8,10-19,7c0,0,3-10,14-16l-3-4s-95.29,62.53-105.14,59.26Z" />
          <polygon id="entry" className="cls-7" points="460.37 3.42 586.95 .51 585.37 40.42 457.37 42.42 460.37 3.42" />
          <path id="semicircle" className="cls-7"
                d="M441.37,31.42s89.25,20.12,172.63-4.44v12.2s-93.63,102.83-172.63,4.04v-11.79Z" />
        </g>
        <g id="Stand-Cards">
          {rects.map((rect) => (<rect
            key={rect.id}
            id={rect.id}
            className={getRectClassName(rect.id)}
            x={rect.x}
            y={rect.y}
            width={rect.width}
            height={rect.height}
            transform={rect.transform}
            onContextMenu={(event) => handleClickOpenStand(rect.id, event)}
            onClick={(event) => handleClickOpenStand(rect.id, event)}
            onTouchStart={(event) => handleClickOpenStand(rect.id, event)}
            onTouchEnd={(event) => handleClickOpenStand(rect.id, event)}
          />))}
        </g>
        <g id="flights">
          {flights.map((flight) => (<path
            key={flight.id}
            id={flight.id}
            className="cls-2-hide"
            d={flight.d}
          />))}
        </g>
      </svg>
    </ReactSVGPanZoom>
    <StandMapping open={openStandMapping} onClose={handleCloseStandMapping} selectedId={selectedId} />
  </Card>);
}

AmritsarAirportLayoutCard.propTypes = {
  sx: PropTypes.object, onOpenStandInfo: PropTypes.func,
};
