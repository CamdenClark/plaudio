import { admin } from "firebase-admin/lib/auth";
import FirebaseAdmin from "firebase-admin";

export interface IAuth {
  verifyIdToken(idToken: string): Promise<admin.auth.DecodedIdToken>;
}

export class FirebaseAuth implements IAuth {
  constructor() {
    FirebaseAdmin.initializeApp();
  }

  verifyIdToken(idToken: string) {
    return FirebaseAdmin.auth().verifyIdToken(idToken);
  }
}
