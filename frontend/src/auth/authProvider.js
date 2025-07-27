import { atomWithRefresh, loadable } from "jotai/utils";
import { api } from "../api/api.js";
import { atom } from "jotai";

const fetchUserAtom = atomWithRefresh(async () => {
  try {
    const response = await api.post("/user/refresh-token");
    return response.data;
  } catch (err) {
    console.error(err);
    return null;
  }
});

const loadableUserAtom = loadable(fetchUserAtom);

const userAtom = atom(
  (get) => get(loadableUserAtom),
  (_, set) => set(fetchUserAtom)
);

export { userAtom };
