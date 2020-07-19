import { admin } from "firebase-admin/lib/auth";
import FirebaseAdmin from "firebase-admin";

export interface IAuth {
  verifyIdToken(idToken: string): Promise<admin.auth.DecodedIdToken>;
  signup(email: string, password: string): Promise<admin.auth.UserRecord>;
}

export class FirebaseAuth implements IAuth {
  constructor() {
    FirebaseAdmin.initializeApp();
  }

  signup(email: string, password: string) {
    return FirebaseAdmin.auth().createUser({ email, password });
  }

  verifyIdToken(idToken: string) {
    return FirebaseAdmin.auth().verifyIdToken(idToken);
  }
}
