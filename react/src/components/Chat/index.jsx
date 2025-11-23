import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchMessages, sendMessage } from '../../api/chat';
import { getToken } from '../../api/authStorage';

export const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const token = getToken();

    if (!token) {
      navigate('/login');
      return;
    }

    let isMounted = true;
    let intervalId = null;

    const loadMessages = async () => {
      try {
        const data = await fetchMessages();
        if (isMounted) {
          if (Array.isArray(data)) {
            setMessages(data);
          } else {
            setMessages([]);
          }
          setError('');
        }
      } catch (errorResponse) {
        if (!isMounted) {
          return;
        }
        setError('Не удалось загрузить сообщения');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadMessages();

    intervalId = window.setInterval(() => {
      loadMessages();
    }, 4000);

    return () => {
      isMounted = false;
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, [navigate]);

  const formatTime = (value) => {
    if (typeof value === 'number' && value > 0) {
      const date = new Date(value * 1000);
      return date.toLocaleTimeString();
    }

    if (typeof value === 'string') {
      return value;
    }

    return '';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const trimmed = newMessage.trim();

    if (!trimmed) {
      setError('Введите текст сообщения');
      return;
    }

    setSending(true);

    try {
      const created = await sendMessage(trimmed);
      setNewMessage('');

      if (created) {
        setMessages((previous) => {
          if (!Array.isArray(previous)) {
            return [created];
          }
          return [...previous, created];
        });
      }
    } catch (errorResponse) {
      setError('Не удалось отправить сообщение');
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      data-easytag="id1-src/components/Chat/index.jsx"
      className="page page-chat"
    >
      <h1 className="page-title">Групповой чат</h1>
      <p className="page-subtitle">
        Общайтесь с другими пользователями. Сообщения обновляются каждые несколько секунд.
      </p>

      <div className="chat-layout">
        <div className="chat-messages">
          {loading && <div>Загрузка сообщений...</div>}

          {!loading && !messages.length && !error && (
            <div>Сообщений пока нет.</div>
          )}

          {!loading && messages.length > 0 && (
            <>
              {messages.map((message) => {
                const key = message.id || message.created_at || message.text;
                const timeLabel = formatTime(message.created_at);

                return (
                  <div key={key} className="chat-message">
                    <div className="chat-message-header">
                      <span className="chat-message-username">
                        {message.username}
                      </span>
                      {timeLabel ? (
                        <span className="chat-message-time">{timeLabel}</span>
                      ) : null}
                    </div>
                    <div className="chat-message-text">{message.text}</div>
                  </div>
                );
              })}
            </>
          )}

          {error && <div className="chat-error">{error}</div>}
        </div>

        <form className="chat-form" onSubmit={handleSubmit}>
          <div className="chat-input-row">
            <input
              type="text"
              className="chat-input"
              placeholder="Введите сообщение..."
              value={newMessage}
              onChange={(event) => setNewMessage(event.target.value)}
              disabled={sending}
            />
            <button
              type="submit"
              className="chat-send-button"
              disabled={sending}
            >
              {sending ? 'Отправка...' : 'Отправить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
