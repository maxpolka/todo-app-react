import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase.ts";

// Ссылка на коллекцию "tasks" в Firestore
const tasksRef = collection(db, "tasks");

// Подписка на задачи конкретного пользователя
// query: фильтрация по userId + сортировка по дате создания
// onSnapshot: "живое" обновление в реальном времени
export const subscribeToTasks = (userId: string, callback: Function) => {
  const q = query(
    tasksRef,
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (snapshot) => {
    const tasks = snapshot.docs.map((doc) => ({
      id: doc.id,      // ID документа из Firestore
      ...doc.data(),   // все поля задачи
    }));
    callback(tasks);    // вызов коллбэка с массивом задач
  });
};

// Добавление новой задачи
// serverTimestamp(): время проставляется сервером, чтобы исключить расхождения
export const addTask = async (task: {
  title: string;
  description?: string;
  priority: "low" | "medium" | "high";
  userId: string;
}) => {
  return await addDoc(tasksRef, {
    ...task,
    completed: false,             // новая задача всегда невыполненная
    createdAt: serverTimestamp(), // дата создания
    updatedAt: serverTimestamp(), // дата последнего обновления
  });
};

// Обновление существующей задачи
export const updateTask = async (id: string, data: any) => {
  const ref = doc(db, "tasks", id);
  await updateDoc(ref, {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

// Удаление задачи по id
export const deleteTask = async (id: string) => {
  const ref = doc(db, "tasks", id);
  await deleteDoc(ref);
};
