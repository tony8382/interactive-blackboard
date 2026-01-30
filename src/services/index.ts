import { MockMessageService } from './mockMessageService';
// import { FirebaseMessageService } from './firebaseMessageService'; 

// Toggle this to switch between Mock and Firebase
const USE_MOCK = true;

// export const messageService = USE_MOCK ? new MockMessageService() : new FirebaseMessageService();
export const messageService = new MockMessageService();
