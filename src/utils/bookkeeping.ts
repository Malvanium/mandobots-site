// src/utils/bookkeeping.ts
import { db } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  Timestamp,
} from "firebase/firestore";

export interface Transaction {
  type: "income" | "expense";
  amount: number;
  description?: string;
  category?: string;
  timestamp: Date;
}

export const logTransaction = async (userId: string, data: Transaction) => {
  const ref = collection(db, "bookkeeping", userId, "transactions");
  await addDoc(ref, {
    ...data,
    timestamp: Timestamp.fromDate(data.timestamp || new Date()),
  });
};

export const getTransactions = async (
  userId: string,
  type?: "income" | "expense"
): Promise<Transaction[]> => {
  const ref = collection(db, "bookkeeping", userId, "transactions");
  const q = type ? query(ref, where("type", "==", type)) : ref;
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    ...(doc.data() as Transaction),
    timestamp: doc.data().timestamp.toDate(),
  }));
};
