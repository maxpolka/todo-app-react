import React from 'react';
import { Layout, Button, Space, Grid } from "antd";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { RootState } from "../app/store";
import { logoutUser } from "../features/auth/authSlice.ts";
import { MoonOutlined, SunOutlined } from "@ant-design/icons";

const { Header } = Layout;
const { useBreakpoint } = Grid;

interface AppHeaderProps {
  isDark: boolean; // флаг текущей темы
  setIsDark: (val: boolean) => void; // функция смены темы
}

export const AppHeader: React.FC<AppHeaderProps> = ({ isDark, setIsDark }) => {
  const user = useSelector((state: RootState) => state.auth.user); // текущий авторизованный пользователь
  const screens = useBreakpoint(); // адаптивность: определение текущего брейкпоинта
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await (dispatch as any)(logoutUser()).unwrap(); // диспатч экшена logout
      navigate("/login"); // редирект на страницу входа
    } catch (err) {
      console.error("Logout error:", err); // лог ошибок
    }
  };

  return (
    <Header
      style={{
        display: "flex",
        justifyContent: screens.lg ? 'space-between' : 'center',
        alignItems: "center",
        background: isDark ? '#0d0d0d' : '', // тёмная тема
      }}
    >
      {/* Логотип / название приложения */}
      {screens.lg ? (
        <div style={{ fontSize: "18px", fontWeight: "bold" }}>
          <Link to="/" style={{ color: 'white' }}>Todo App</Link>
        </div>
      ) : null}

      <Space>
        {/* Переключение темы */}
        <Button
          shape="circle"
          icon={isDark ? <SunOutlined /> : <MoonOutlined />}
          onClick={() => setIsDark(!isDark)}
        />

        {user ? (
          // Если пользователь авторизован
          <>
          {screens.lg ? 
            <span style={{ color: "white" }}>
              Привет, {user.displayName || user.email}
            </span> : <></>
          }
            <Button type="link">
              <Link to="/tasks">Задачи</Link>
            </Button>
            <Button type="primary" onClick={handleLogout}>
              Выйти
            </Button>
          </>
        ) : (
          // Если пользователь не авторизован
          <>
            <Button type="link">
              <Link to="/login">Вход</Link>
            </Button>
            <Button type="primary">
              <Link to="/register">Регистрация</Link>
            </Button>
          </>
        )}
      </Space>
    </Header>
  );
};
