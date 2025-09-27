/**
 * Основной JavaScript файл для взаимодействия с AI моделью
 * Обрабатывает пользовательский ввод и управляет общением с API
 */

// Обработчик события клика по кнопке отправки
document.getElementById('send-btn').onclick = async function () {
  // Получаем текст из поля ввода пользователя
  const input = document.getElementById('user-input').value;
  // Показываем индикатор загрузки
  document.getElementById('response').innerText = "Консультант думает...";

  // Формируем объект запроса для AI модели
  request = {
    // Выбор модели AI для обработки запроса
    //"model": "lakomoor/vikhr-llama-3.2-1b-instruct:1b",
    // "model": "owl/t-lite",
    "model": "llama3.1", // Текущая активная модель

    // Массив сообщений для контекста диалога
    "messages": [
      {
        // Системное сообщение, определяющее роль и правила работы AI
        "role": "system",
        "content": `Роль и специализация:
        Ты консультант по языкам программирования. 
        Отвечай профессионально и логично, в ответах приводи примеры кода. Отвечай на
        только на вопросы о языках:  Python, С, C++, JS, HTML. Не отвечай на вопросы 
        о других языках программирования (Scala, Go, PHP  и другие), просто вежливо предложи обратиться
        другому специалисту. Первая буква ответа должна быть заглавной. 
        Ответ начинай с повторения вопроса пользователя.` 
      },
      {
        // Сообщение от пользователя
        "role": "user",
        "content": `${input}`
      },
    ],
    // Параметры генерации ответа
    'max_tokens': '50',    // Ограничение длины ответа в токенах
    "temperature": "0.3"   // Параметр креативности (0.3 = более консервативные ответы)
  }

  // Отправка запроса к локальному серверу ollama и обработка ответа
  try {
    // Выполнение POST запроса к API
    const response = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request)
    });

    // Проверка успешности HTTP-запроса
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Инициализация потокового чтения ответа
    const reader = response.body.getReader();
    let result = '';
    const responseElement = document.getElementById('response');
    responseElement.innerText = '';
    const decoder = new TextDecoder();

    // Цикл чтения и обработки потока данных
    while (true) {
      const { done, value } = await reader.read();
      if (done) break; // Выход из цикла если поток завершен
      
      try {
        // Декодирование и парсинг порции данных
        const chunk = decoder.decode(value, { stream: true });
        const responseChunk = JSON.parse(chunk);
        
        // Обновление UI новыми данными
        if (responseChunk.message?.content) {
          result += responseChunk.message.content;
          responseElement.innerText = result;
        }
      } catch (error) {
        // Логирование ошибок обработки чанка
        console.error('Error processing chunk:', error);
      }
    }
  } catch (error) {
    // Обработка и отображение ошибок API
    const responseElement = document.getElementById('response');
    responseElement.innerText = "Ошибка при обращении к AI сервису: " + error.message;
    console.error('API Error:', error);
  }
};

// Обработчик нажатия клавиши Enter в поле ввода
document.getElementById('user-input').addEventListener('keydown', function (event) {
  // Проверка на нажатие Enter без Shift
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault(); // Предотвращаем стандартное поведение
    document.getElementById('send-btn').click(); // Симулируем клик по кнопке отправки
  }
});