import * as fbadmin from 'firebase-admin';
import * as functions from 'firebase-functions';
import * as fireorm from 'fireorm';

fbadmin.initializeApp(functions.config().firebase)

const firestore = fbadmin.firestore()
const storage = fbadmin.storage().bucket()
fireorm.initialize(firestore);

export const db = firestore;
export const fbStorage = storage

export const getRepository = fireorm.getRepository;
