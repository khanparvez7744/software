import io from 'socket.io-client';

import { RIDS_IP, SERVER_IP } from '../../config';

const socket = io(`${SERVER_IP}`);

const ridsSocket = io(`${RIDS_IP}`);

export { socket, ridsSocket };