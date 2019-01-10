import {apps, app, initializeApp} from "firebase";
import config from '../config/config';

const firebaseConfig = process.env.NODE_ENV === 'production' ? config.firebase.prod : config.firebase.dev;

export default !apps.length ? initializeApp(firebaseConfig) : app();
