import axios from "axios";

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export const get = (p: string) => axios.get(BASE + p).then((r) => r.data);

export const post = (p: string, b: any) =>
  axios.post(BASE + p, b).then((r) => r.data);

export const api = axios.create({
  baseURL: "http://localhost:8000",
});
