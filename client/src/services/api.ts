import axios from "axios";
import { SpendingByCategory, Transaction } from "../types";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:3001/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const getSpendingByCategory = async (): Promise<SpendingByCategory[]> => {
  try {
    const response = await api.get("/transactions/by-category");
    return response.data;
  } catch (error) {
    console.error("Error fetching spending by category:", error);
    throw error;
  }
};

export const getTransactions = async (): Promise<Transaction[]> => {
  try {
    const response = await api.get("/transactions");
    return response.data;
  } catch (error) {
    console.error("Error fetching transactions:", error);
    throw error;
  }
};

export const createTransaction = async (transaction: Omit<Transaction, "id" | "date">): Promise<Transaction> => {
  try {
    const response = await api.post("/transactions", transaction);
    return response.data;
  } catch (error) {
    console.error("Error creating transaction:", error);
    throw error;
  }
};

export const processRefund = async (transactionId: string): Promise<Transaction> => {
  try {
    const response = await api.post(`/transactions/refund/${transactionId}`);
    return response.data;
  } catch (error) {
    console.error("Error processing refund:", error);
    throw error;
  }
};
