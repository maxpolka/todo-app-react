import React from "react";
import { Button, Card, Checkbox, Space, Tag, Grid } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";

const { useBreakpoint } = Grid;

interface TaskItemProps {
    task: any; // объект задачи из Firestore
    isDark: boolean; // флаг для тёмной темы
    onEdit: (task: any) => void; // обработчик редактирования
    onToggle: () => void; // обработчик смены статуса
    onDelete: () => void; // обработчик удаления
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, isDark, onEdit, onToggle, onDelete }) => {
    const screens = useBreakpoint(); // адаптивность: определение текущего брейкпоинта

    return (
        <Card
            style={{
                backgroundColor: isDark ? "" : "#fafafa", 
                boxShadow: "0 2px 6px rgba(0,0,0,0.1)", 
                width: "100%",
                marginBottom: 16,
            }}
        >
            <div
                style={{
                    display: "flex",
                    flexDirection: screens.xs ? "column" : "row", // на мобильных — вертикальная колонка
                    justifyContent: "space-between",
                }}
            >
                <div style={{ flex: 1 }}>
                    <Space direction="vertical" size={4} style={{ width: "100%" }}>
                        {/* Заголовок задачи и приоритет */}
                        <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap" }}>
                            <span style={{ fontWeight: 500 }}>{task.title}</span>
                            <Tag
                                color={task.priority === "high" ? "red" : task.priority === "medium" ? "blue" : "green"} // цвет тега по приоритету
                                style={{ marginLeft: 8 }}
                            >
                                {task.priority}
                            </Tag>
                        </div>
                        {/* Описание задачи (если есть) */}
                        {task.description && <div>{task.description}</div>}
                        {/* Дата создания */}
                        <small>
                            Создано: {task.createdAt?.toDate ? task.createdAt.toDate().toLocaleString() : "—"}
                        </small>
                    </Space>
                </div>

                {/* Блок действий (отмечать, редактировать, удалять) */}
                <div
                    style={{
                        display: "flex",
                        flexDirection: screens.xs ? "column" : "row", // на мобильных — кнопки в столбик
                        gap: 8,
                        marginTop: screens.xs ? 12 : 0,
                        alignItems: screens.xs ? "stretch" : "center",
                        justifyContent: screens.xs ? "flex-start" : "flex-end",
                    }}
                >
                    {screens.xs ? (
                        // На маленьком экране — широкие кнопки с текстом
                        <>
                            <Button type="default" style={{ width: "100%" }} onClick={onToggle}>
                                {task.completed ? "Выполнено" : "Активна"}
                            </Button>
                            <Button type="default" style={{ width: "100%" }} onClick={() => onEdit(task)}>
                                Редактировать
                            </Button>
                            <Button type="default" danger style={{ width: "100%" }} onClick={onDelete}>
                                Удалить
                            </Button>
                        </>
                    ) : (
                        // На большом экране — чекбокс и иконки
                        <>
                            <Checkbox checked={task.completed} onChange={onToggle}>
                                {task.completed ? "Выполнено" : "Активна"}
                            </Checkbox>
                            <Button type="default" icon={<EditOutlined />} onClick={() => onEdit(task)} />
                            <Button type="default" danger icon={<DeleteOutlined />} onClick={onDelete} />
                        </>
                    )}
                </div>
            </div>
        </Card>
    );
};
