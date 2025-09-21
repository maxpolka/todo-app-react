import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { auth } from "../../api/firebase.ts";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from "firebase/auth";
import { notification } from "antd";

// структура объекта пользователя в состоянии
interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}

// состояние auth-слайса
interface AuthState {
  user: AuthUser | null;    // текущий пользователь
  loading: boolean;         // индикатор асинхронных операций
  error: string | null;     // текст ошибки
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
};

// асинхронная регистрация нового пользователя
export const registerUser = createAsyncThunk
  <
    AuthUser,
    { email: string; password: string; displayName?: string },
    { rejectValue: string }
  >
  ("auth/registerUser", async ({ email, password, displayName }, { rejectWithValue }) => {
    try {
      // создание пользователя через Firebase
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      // установка displayName, если передан
      if (displayName) {
        await updateProfile(userCredential.user, { displayName });
      }
      // возврат данных пользователя для Redux
      return {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName ?? null,
      };
    } catch (err: any) {
      return rejectWithValue(err.message || "Registration error");
    }
  });

// асинхронный вход пользователя
export const loginUser = createAsyncThunk
  <
    AuthUser,
    { email: string; password: string },
    { rejectValue: string }
  >
  ("auth/loginUser", async ({ email, password }, { rejectWithValue }) => {
    try {
      // вход через Firebase
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      // возврат данных пользователя
      return {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName ?? null,
      };
    } catch (err: any) {
      return rejectWithValue(err.message || "Login error");
    }
  });

// асинхронный выход пользователя, возвращает true при успехе
export const logoutUser = createAsyncThunk<boolean, void, { rejectValue: string }>(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      await signOut(auth);
      return true;
    } catch (err: any) {
      return rejectWithValue(err.message || "Logout error");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // установка пользователя из onAuthStateChanged
    setUser: (state, action: PayloadAction<AuthUser | null>) => {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    // регистрация
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        // уведомление об успешной регистрации
        notification.success({
          message: "Регистрация успешна",
          description: `Добро пожаловать, ${action.payload.email ?? "пользователь"}!`,
        });
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Ошибка регистрации";
        // уведомление об ошибке
        notification.error({
          message: "Ошибка регистрации",
          description: state.error!,
        });
      });

    // вход
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        // уведомление об успешном входе
        notification.success({
          message: "Вход выполнен",
          description: `Добро пожаловать, ${action.payload.email ?? "пользователь"}!`,
        });
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Ошибка входа";
        // уведомление об ошибке
        notification.error({
          message: "Ошибка входа",
          description: state.error!,
        });
      });

    // выход
    builder
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        // уведомление об успешном выходе
        notification.success({
          message: "Выход выполнен",
          description: "Вы успешно вышли из аккаунта",
        });
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Ошибка выхода";
        // уведомление об ошибке
        notification.error({
          message: "Ошибка выхода",
          description: state.error!,
        });
      });
  },
});

export const { setUser } = authSlice.actions;
export default authSlice.reducer;
