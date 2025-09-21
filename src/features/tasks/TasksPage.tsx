import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Input, List, Select, Row, Col, Pagination } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { subscribeToTasks } from "../../api/tasksService.ts";
import { setTasks, addTaskThunk, updateTaskThunk, deleteTaskThunk } from "./tasksSlice.ts";
import { RootState } from "../../app/store";
import { TaskItem } from "./TaskItem.tsx";
import { TaskModal } from "./TaskModal.tsx";

const { Search } = Input;

interface TasksProps {
  isDark: boolean; // тёмная тема для карточек задач
}

export const TasksPage: React.FC<TasksProps> = ({ isDark }) => {
  const dispatch = useDispatch();
  const user = useSelector((s: RootState) => s.auth.user); // текущий пользователь
  const tasks = useSelector((s: RootState) => s.tasks.items); // список задач из Redux

  const [filter, setFilter] = useState<"all" | "active" | "completed">("all"); // фильтр по статусу
  const [search, setSearch] = useState(""); // текст поиска
  const [isModalOpen, setIsModalOpen] = useState(false); // состояние модалки
  const [editingTask, setEditingTask] = useState<any>(null); // редактируемая задача
  const [currentPage, setCurrentPage] = useState(1); // текущая страница пагинации
  const pageSize = 5; // количество задач на страницу

  useEffect(() => {
    if (!user) return;
    // подписка на задачи текущего пользователя в реальном времени
    const unsub = subscribeToTasks(user.uid, (tasks: any[]) => {
      dispatch(setTasks(tasks));
    });
    return () => unsub(); // отписка при размонтировании
  }, [user, dispatch]);

  // фильтрация и поиск задач
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((t) => {
        if (filter === "active") return !t.completed;
        if (filter === "completed") return t.completed;
        return true;
      })
      .filter((t) =>
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        (t.description || "").toLowerCase().includes(search.toLowerCase())
      );
  }, [tasks, filter, search]);

  // пагинация отфильтрованных задач
  const paginatedTasks = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return filteredTasks.slice(start, end);
  }, [filteredTasks, currentPage]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1); // сброс на первую страницу при поиске
  };

  const handleFilterChange = (value: "all" | "active" | "completed") => {
    setFilter(value);
    setCurrentPage(1); // сброс на первую страницу при смене фильтра
  };

  return (
    <div style={{ padding: 24 }}>
      {/* Панель поиска, фильтрации и кнопки добавления */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }} align="middle">
        <Col xs={24} sm={12} md={8}>
          <Search placeholder="Поиск задач..." onChange={handleSearch} />
        </Col>
        <Col xs={12} sm={6} md={4}>
          <Select
            value={filter}
            onChange={handleFilterChange}
            style={{ width: "100%" }}
            options={[
              { value: "all", label: "Все" },
              { value: "active", label: "Активные" },
              { value: "completed", label: "Выполненные" },
            ]}
          />
        </Col>
        <Col xs={12} sm={6} md={4}>
          {/* кнопка открытия модалки для создания новой задачи */}
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => { setEditingTask(null); setIsModalOpen(true); }}
            style={{ width: "100%" }}
          >
            Добавить
          </Button>
        </Col>
      </Row>

      {/* Список задач с использованием TaskItem */}
      <List
        dataSource={paginatedTasks}
        renderItem={(task: any) => (
          <TaskItem
            task={task}
            isDark={isDark}
            onEdit={(t) => { setEditingTask(t); setIsModalOpen(true); }} // открыть модалку для редактирования
            onToggle={() => dispatch(updateTaskThunk({ id: task.id, data: { completed: !task.completed } }) as any)} // смена статуса
            onDelete={() => dispatch(deleteTaskThunk(task.id) as any)} // удаление задачи
          />
        )}
      />

      {/* Пагинация задач */}
      <Pagination
        current={currentPage}
        pageSize={pageSize}
        total={filteredTasks.length}
        onChange={setCurrentPage}
        style={{ marginTop: 16, display: 'flex', justifyContent: "center" }}
      />

      {/* Модальное окно для создания/редактирования задачи */}
      <TaskModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingTask={editingTask}
        userId={user?.uid}
        onSave={(task) => {
          if (editingTask) {
            dispatch(updateTaskThunk({ id: editingTask.id, data: task }) as any);
          } else {
            dispatch(addTaskThunk({ ...task, userId: user?.uid }) as any);
          }
          setIsModalOpen(false);
        }}
      />
    </div>
  );
};
