import React from 'react';
import { Form, Input, Button, notification, Row, Col, Card } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from './authSlice.ts';
import { RootState, AppDispatch } from '../../app/store';
import { useNavigate } from 'react-router-dom';

export const Login = () => {
  // типизированный dispatch для Redux Toolkit
  const dispatch = useDispatch<AppDispatch>();

  const navigate = useNavigate();

  // получение состояния авторизации из Redux
  const { loading } = useSelector((state: RootState) => state.auth);

  // обработка отправки формы
  const onFinish = async (values: any) => {
    // вызов асинхронного thunk loginUser
    const result = await dispatch(loginUser(values));
    if (loginUser.fulfilled.match(result)) {
      notification.success({ message: 'Вы успешно вошли!' }); // уведомление об успехе
      navigate('/tasks'); // редирект на список задач
    } else {
      notification.error({ message: 'Ошибка входа', description: result.payload as string }); // уведомление об ошибке
    }
  };

  return (
    <Row
      justify="center"
      align="middle"
      style={{ minHeight: '60vh', padding: '0 16px' }}
    >
      <Col xs={24} sm={18} md={12} lg={8}>
        {/* карточка с формой */}
        <Card title="Вход в систему" bordered={false} style={{ padding: '24px' }}>
          {/* форма Ant Design */}
          <Form name="login" onFinish={onFinish} layout="vertical">
            {/* поле email с валидацией */}
            <Form.Item
              name="email"
              label="Email"
              rules={[{ required: true, type: 'email' }]}
            >
              <Input />
            </Form.Item>
            {/* поле пароль с валидацией */}
            <Form.Item name="password" label="Пароль" rules={[{ required: true }]}>
              <Input.Password />
            </Form.Item>
            {/* кнопка отправки формы */}
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block>
                Войти
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Col>
    </Row>
  );
};
