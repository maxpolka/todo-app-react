import React, { useEffect } from "react";
import { Modal, Form, Input, Select, Grid } from "antd";

const { useBreakpoint } = Grid;

interface TaskModalProps {
    open: boolean; // состояние открытия модального окна
    onClose: () => void; // закрытие модалки
    editingTask: any; // если передан объект задачи — режим редактирования
    userId?: string; // id пользователя 
    onSave: (task: any) => void; // колбэк сохранения задачи
}

export const TaskModal: React.FC<TaskModalProps> = ({ open, onClose, editingTask, onSave }) => {
    const [form] = Form.useForm(); // антовская форма для управления значениями
    const screens = useBreakpoint(); // брейкпоинты для адаптивной ширины модалки

    useEffect(() => {
        // при смене editingTask либо сбрасываются поля, либо заполняются
        if (editingTask) {
            form.setFieldsValue(editingTask);
        } else {
            form.resetFields();
        }
    }, [editingTask, form]);

    const handleSave = async () => {
        // валидация и передача данных наружу
        const values = await form.validateFields();
        onSave(values);
    };

    return (
        <Modal
            title={editingTask ? "Редактировать задачу" : "Новая задача"} // заголовок зависит от режима
            open={open}
            onCancel={onClose}
            onOk={handleSave}
            okText="Сохранить"
            width={screens.xs ? "90%" : 520} // на мобильных почти на весь экран
        >
            <Form form={form} layout="vertical">
                {/* обязательный заголовок */}
                <Form.Item name="title" label="Заголовок" rules={[{ required: true, message: "Введите заголовок" }]}>
                    <Input />
                </Form.Item>

                {/* необязательное описание */}
                <Form.Item name="description" label="Описание">
                    <Input.TextArea />
                </Form.Item>

                {/* обязательный приоритет */}
                <Form.Item name="priority" label="Приоритет" rules={[{ required: true }]}>
                    <Select
                        options={[
                            { value: "low", label: "Низкий" },
                            { value: "medium", label: "Средний" },
                            { value: "high", label: "Высокий" },
                        ]}
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};
