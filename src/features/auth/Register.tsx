import React from 'react';
import { Form, Input, Button, notification, Row, Col, Card } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from './authSlice.ts';
import { RootState, AppDispatch } from '../../app/store';
import { useNavigate } from 'react-router-dom';

export const Register = () => {
  // типизированный dispatch для Redux Toolkit
  const dispatch = useDispatch<AppDispatch>();

  const navigate = useNavigate();
  
  // получение состояния загрузки из authSlice
  const { loading } = useSelector((state: RootState) => state.auth);

  // обработчик сабмита формы
  const onFinish = async (values: any) => {
    // запуск асинхронного thunk registerUser
    const result = await dispatch(registerUser(values));
    if (registerUser.fulfilled.match(result)) {
      notification.success({ message: 'Регистрация успешна!' });
      navigate('/tasks');
    } else {
      notification.error({ message: 'Ошибка регистрации', description: result.payload as string });
    }
  };

  return (
    <Row
      justify="center"
      align="middle"
      style={{ minHeight: '60vh', padding: '0 16px' }}
    >
      <Col xs={24} sm={18} md={12} lg={8}>
        <Card title="Регистрация" bordered={false} style={{ padding: '24px' }}>
          {/* Форма с валидацией */}
          <Form name="register" onFinish={onFinish} layout="vertical">
            <Form.Item
              name="email"
              label="Email"
              rules={[{ required: true, type: 'email' }]} 
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="displayName"
              label="Имя"
              rules={[{ required: false, message: 'Введите имя' }]} 
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="password"
              label="Пароль"
              rules={[{ required: true, min: 6 }]} 
            >
              <Input.Password />
            </Form.Item>
            <Form.Item>
              {/* кнопка с индикатором загрузки из Redux */}
              <Button type="primary" htmlType="submit" loading={loading} block>
                Зарегистрироваться
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Col>
    </Row>
  );
};
