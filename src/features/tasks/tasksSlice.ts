import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { addTask, updateTask, deleteTask } from "../../api/tasksService.ts";
import { notification } from "antd";

interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
  createdAt: any;
  updatedAt: any;
  userId: string;
}

interface TasksState {
  items: Task[]; // список задач
  loading: boolean; // состояние загрузки при асинхронных операциях
  error: string | null; // текст ошибки
}

const initialState: TasksState = {
  items: [],
  loading: false,
  error: null,
};

// --- thunks ---
// добавление задачи
export const addTaskThunk = createAsyncThunk(
  "tasks/add",
  async (task: Omit<Task, "id" | "createdAt" | "updatedAt">, { rejectWithValue }) => {
    try {
      const id = await addTask(task); // вызов сервиса Firestore
      notification.success({
        message: "Задача создана",
        description: `Задача «${task.title}» успешно добавлена`,
      });
      return { ...task, id }; // возвращается объект с новым id
    } catch (err: any) {
      notification.error({
        message: "Ошибка при добавлении задачи",
        description: err.message,
      });
      return rejectWithValue(err.message);
    }
  }
);

// обновление задачи
export const updateTaskThunk = createAsyncThunk(
  "tasks/update",
  async ({ id, data }: { id: string; data: Partial<Task> }, { rejectWithValue }) => {
    try {
      await updateTask(id, data); // вызов сервиса обновления
      notification.success({
        message: "Задача обновлена",
        description: `Изменения сохранены`,
      });
      return { id, data }; // возвращается id и обновлённые поля
    } catch (err: any) {
      notification.error({
        message: "Ошибка при обновлении задачи",
        description: err.message,
      });
      return rejectWithValue(err.message);
    }
  }
);

// удаление задачи
export const deleteTaskThunk = createAsyncThunk(
  "tasks/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await deleteTask(id); // вызов сервиса удаления
      notification.success({
        message: "Задача удалена",
        description: "Задача успешно удалена из списка",
      });
      return id; // возвращается id удалённой задачи
    } catch (err: any) {
      notification.error({
        message: "Ошибка при удалении задачи",
        description: err.message,
      });
      return rejectWithValue(err.message);
    }
  }
);

// --- slice ---
const tasksSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    setTasks: (state, action: PayloadAction<Task[]>) => {
      state.items = action.payload; // установка списка задач из подписки
    },
  },
  extraReducers: (builder) => {
    builder
      // add
      .addCase(addTaskThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addTaskThunk.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(addTaskThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // update
      .addCase(updateTaskThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTaskThunk.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateTaskThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // delete
      .addCase(deleteTaskThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTaskThunk.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(deleteTaskThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setTasks } = tasksSlice.actions;
export default tasksSlice.reducer;
