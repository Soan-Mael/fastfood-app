// src/components/Chatbot.tsx
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageCircle, X, Send, Bot, User, Minimize2, Maximize2 } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const botResponses: Record<string, string> = {
  'привет': 'Здравствуйте! Чем я могу вам помочь?',
  'здравствуйте': 'Здравствуйте! Чем я могу вам помочь?',
  'help': 'Я могу помочь вам с: \n• Статусом заказа\n• Вопросы о доставке\n• Проблемы с оплатой\n• Возврат и отмена\n• Другие вопросы',
  'помощь': 'Я могу помочь вам с: \n• Статусом заказа\n• Вопросы о доставке\n• Проблемы с оплатой\n• Возврат и отмена\n• Другие вопросы',
  'заказ': 'Чтобы проверить статус заказа, перейдите в раздел "История заказов" или нажмите кнопку "Мои заказы" в меню.',
  'статус': 'Чтобы проверить статус заказа, перейдите в раздел "История заказов" или нажмите кнопку "Мои заказы" в меню.',
  'доставка': 'Доставка обычно занимает 30-45 минут. Вы можете отслеживать ваш заказ в реальном времени в разделе "Мои заказы".',
  'оплата': 'Мы принимаем оплату банковской картой и наличными при доставке. Все платежи защищены.',
  'возврат': 'Если вы хотите отменить заказ, пожалуйста, свяжитесь с нами в течение 5 минут после оформления.',
  'спасибо': 'Пожалуйста! Рады были помочь! Есть ещё вопросы?',
  'пока': 'До свидания! Хорошего дня! 🌟',
  'default': 'Извините, я не совсем понял. Можете перефразировать? Или напишите "помощь" чтобы увидеть список команд.',
};

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Добро пожаловать в службу поддержки ФудФаст! Чем мы можем вам помочь сегодня?',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Автоматическая прокрутка вниз
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Фокус на поле ввода при открытии
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  const getBotResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    for (const [keyword, response] of Object.entries(botResponses)) {
      if (lowerMessage.includes(keyword)) {
        return response;
      }
    }
    
    return botResponses.default;
  };

  const sendMessage = async () => {
    if (!inputValue.trim()) return;

    // Message de l'utilisateur
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulation de délai de réponse du bot
    setTimeout(() => {
      const botResponseText = getBotResponse(userMessage.text);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponseText,
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 800);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };

  // Bouton flottant
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-orange-500 text-white p-4 rounded-full shadow-lg hover:bg-orange-600 transition-all duration-200 z-50"
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card className={`w-96 shadow-xl transition-all duration-300 ${isMinimized ? 'h-14' : 'h-[500px]'}`}>
        {/* En-tête */}
        <CardHeader className="bg-orange-500 text-white rounded-t-lg p-4 flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            <CardTitle className="text-white text-base">Поддержка</CardTitle>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="hover:bg-orange-600 p-1 rounded transition-colors"
            >
              {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-orange-600 p-1 rounded transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </CardHeader>

        {!isMinimized && (
          <>
            {/* Messages */}
            <CardContent className="p-4 flex-1 overflow-hidden">
              <ScrollArea className="h-[380px] pr-4" ref={scrollRef}>
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex items-start gap-3 ${
                        message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                      }`}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className={message.sender === 'bot' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-600'}>
                          {message.sender === 'bot' ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          message.sender === 'user'
                            ? 'bg-orange-500 text-white'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                        <span
                          className={`text-xs mt-1 block ${
                            message.sender === 'user' ? 'text-orange-100' : 'text-gray-400'
                          }`}
                        >
                          {formatTime(message.timestamp)}
                        </span>
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex items-start gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-orange-100 text-orange-600">
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="bg-gray-100 rounded-lg p-3">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>

            {/* Input */}
            <div className="p-4 pt-0 border-t">
              <div className="flex gap-2 mt-4">
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Напишите сообщение..."
                  className="flex-1"
                />
                <Button
                  onClick={sendMessage}
                  disabled={!inputValue.trim()}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-400 mt-2 text-center">
                Обычно отвечаем в течение минуты
              </p>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}