import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout, Spin, ConfigProvider, theme } from "antd";
import { Login } from "./features/auth/Login.tsx";
import { Register } from "./features/auth/Register.tsx";
import { TasksPage } from "./features/tasks/TasksPage.tsx";
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './api/firebase.ts';
import { useDispatch } from 'react-redux';
import { setUser } from './features/auth/authSlice.ts';
import { ProtectedRoute } from './routes/ProtectedRoute.tsx';
import { AppHeader } from "./routes/appHeader.tsx";

const { Content, Footer } = Layout;

function App() {
  const dispatch = useDispatch();
  const [authChecked, setAuthChecked] = useState(false); // флаг проверки аутентификации
  const [isDark, setIsDark] = useState(false); // флаг тёмной темы

  useEffect(() => {
    // Подписка на изменение состояния пользователя в Firebase Auth
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Если пользователь есть — сохранение в Redux
        dispatch(setUser({ uid: user.uid, email: user.email }));
      } else {
        // Если нет — сброс состояния пользователя
        dispatch(setUser(null));
      }
      setAuthChecked(true); // после проверки снимается спиннер
    });
    return () => unsubscribe(); // отписка при размонтировании
  }, [dispatch]);

  if (!authChecked) {
    // Спиннер, пока проверяется авторизация
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" tip="Загрузка..." />
      </div>
    );
  }

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm, // переключение темы Antd
      }}
    >
      <Router>
        <Layout style={{ minHeight: "100vh" }}>
          {/* Шапка */}
          <AppHeader isDark={isDark} setIsDark={setIsDark} />
          <Content style={{ padding: "24px" }}>
            <Routes>
              {/* Маршруты для авторизации */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              {/* Защищённый маршрут для задач */}
              <Route
                path="/tasks"
                element={
                  <ProtectedRoute>
                    <TasksPage isDark={isDark} />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Content>
          {/* Футер */}
          <Footer style={{ textAlign: "center" }}>
            © {new Date().getFullYear()} My Todo App
          </Footer>
        </Layout>
      </Router>
    </ConfigProvider>
  );
}

export default App;
